// Shared battles: every player joins on their own phone with a short code, picks a squad,
// agrees the scenario and readies up. The battle starts once everyone is ready.
// Each player's per-unit tracking stays on their own squad (squad.battle); this doc holds
// the lobby, turn, teams and scenario scores.
import {
  collection, doc, onSnapshot, query, runTransaction, serverTimestamp, where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from './firebase.js';
import { SCENARIOS } from './data/campaign.js';
import { rulesFor } from './data/scenarioRules.js';

const battlesCol = collection(db, 'battles');
const battleRef = code => doc(db, 'battles', code);

export const ROLL = '__roll';
// No 0/O or 1/I/L, so codes are easy to read out across the table.
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

export const normaliseCode = s => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

export function useBattle(code) {
  const [battle, setBattle] = useState(undefined);
  useEffect(() => onSnapshot(battleRef(code), d => setBattle(d.exists() ? { id: d.id, ...d.data() } : null), () => setBattle(null)), [code]);
  return battle;
}

export function useMyBattles(uid) {
  const [battles, setBattles] = useState(null);
  useEffect(() => {
    if (!uid) return setBattles(null);
    const q = query(battlesCol, where('memberIds', 'array-contains', uid));
    return onSnapshot(q, snap => setBattles(
      snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(b => b.status === 'lobby' || b.status === 'active'),
    ));
  }, [uid]);
  return battles;
}

const blankPlayer = user => ({
  name: user.displayName ?? 'Player', squadId: null, squadName: '', faction: '', points: 0,
  units: [], heroes: 0, hasMia: false, team: null, vote: null, ready: false,
});

export async function createBattle(user) {
  for (let i = 0; i < 5; i++) {
    const code = newCode();
    const created = await runTransaction(db, async tx => {
      if ((await tx.get(battleRef(code))).exists()) return false;
      tx.set(battleRef(code), {
        hostId: user.uid,
        status: 'lobby',
        memberIds: [user.uid],
        players: { [user.uid]: { ...blankPlayer(user), team: 't1' } },
        teams: [{ id: 't1', name: 'Team 1', role: null }, { id: 't2', name: 'Team 2', role: null }],
        rolled: null,
        createdAt: serverTimestamp(),
      });
      return true;
    });
    if (created) return code;
  }
  throw new Error('Could not create a battle code, try again.');
}

// Read-modify-write on the battle. fn(battle) returns a patch of top-level fields, or null to do nothing.
async function change(code, fn) {
  return runTransaction(db, async tx => {
    const snap = await tx.get(battleRef(code));
    if (!snap.exists()) throw new Error('Battle not found.');
    const patch = fn({ id: snap.id, ...snap.data() });
    if (patch) tx.update(battleRef(code), patch);
    return patch;
  });
}

// Anything that changes what was agreed un-readies everyone.
const unready = players => Object.fromEntries(Object.entries(players).map(([k, p]) => [k, { ...p, ready: false }]));

export const joinBattle = (code, user) => change(code, b => {
  if (b.players[user.uid]) return null;
  if (b.status !== 'lobby') throw new Error('That battle has already started.');
  const counts = Object.fromEntries(b.teams.map(t => [t.id, 0]));
  Object.values(b.players).forEach(p => { if (p.team in counts) counts[p.team]++; });
  const team = b.teams.reduce((a, t) => (counts[t.id] < counts[a.id] ? t : a)).id;
  return {
    memberIds: [...b.memberIds, user.uid],
    players: { ...unready(b.players), [user.uid]: { ...blankPlayer(user), team } },
  };
});

export const leaveBattle = (code, uid) => change(code, b => {
  const rest = { ...b.players };
  delete rest[uid];
  const memberIds = b.memberIds.filter(id => id !== uid);
  if (!memberIds.length) return { players: {}, memberIds, status: 'abandoned' };
  return { players: unready(rest), memberIds, hostId: b.hostId === uid ? memberIds[0] : b.hostId };
});

// Changes to the shared setup (scenario votes, teams, squads, units); everyone has to ready up again.
export const updateLobby = (code, fn) => change(code, b => {
  if (b.status !== 'lobby') return null;
  const patch = fn(b);
  return patch && { ...patch, players: unready(patch.players ?? b.players) };
});

export const setPlayer = (code, uid, playerPatch, extra = {}) => updateLobby(code, b => ({
  players: { ...b.players, [uid]: { ...b.players[uid], ...playerPatch } },
  ...extra,
}));

// Changing a vote throws away an earlier roll.
export const vote = (code, uid, v) => setPlayer(code, uid, { vote: v }, { rolled: null });

export const addTeam = code => updateLobby(code, b => {
  if (b.teams.length >= Math.max(2, Object.keys(b.players).length)) return null;
  const n = Math.max(...b.teams.map(t => Number(t.id.slice(1)))) + 1;
  return { teams: [...b.teams, { id: `t${n}`, name: `Team ${b.teams.length + 1}`, role: null }] };
});

export const removeTeam = (code, teamId) => updateLobby(code, b => {
  if (b.teams.length <= 2 || Object.values(b.players).some(p => p.team === teamId)) return null;
  return { teams: b.teams.filter(t => t.id !== teamId).map((t, i) => ({ ...t, name: `Team ${i + 1}` })) };
});

export const setTeamRole = (code, teamId, role) => updateLobby(code, b => ({
  teams: b.teams.map(t => (t.id === teamId ? { ...t, role } : t)),
}));

export const setRolled = (code, roll) => change(code, b => (b.status === 'lobby' ? { rolled: roll, players: unready(b.players) } : null));

// The scenario everyone has agreed: all voted for the same one, or all voted to roll and it's been rolled.
export function agreedScenario(b) {
  const votes = Object.values(b.players).map(p => p.vote);
  if (!votes.length || votes.some(v => !v) || new Set(votes).size > 1) return null;
  if (votes[0] !== ROLL) return votes[0];
  return b.rolled ? SCENARIOS.find(s => s.roll === b.rolled)?.name ?? null : null;
}

const activeTeams = b => b.teams.filter(t => Object.values(b.players).some(p => p.team === t.id));

// What still stops the battle from starting, or [] when it can.
export function startProblems(b) {
  const players = Object.values(b.players);
  const problems = [];
  if (players.length < 2) problems.push('Waiting for at least one more player to join.');
  if (players.some(p => !p.squadId || !p.units.length)) problems.push('Every player needs to pick a squad and at least one unit.');
  const teams = activeTeams(b);
  if (teams.length < 2) problems.push('Players need to be on at least 2 different teams.');
  const scenario = agreedScenario(b);
  if (!scenario) problems.push('Everyone has to agree on a scenario, or agree to roll and then roll.');
  else if (rulesFor(scenario).roles) {
    if (teams.some(t => !t.role)) problems.push('Every team needs to pick attack or defend.');
    else if (!teams.some(t => t.role === 'attack') || !teams.some(t => t.role === 'defend')) problems.push('There must be at least one attacking and one defending team.');
  }
  return problems;
}

// Ready up; the last player to ready starts the battle.
export const setReady = (code, uid, ready) => change(code, b => {
  if (b.status !== 'lobby') return null;
  const players = { ...b.players, [uid]: { ...b.players[uid], ready } };
  const next = { ...b, players };
  if (!ready || Object.values(players).some(p => !p.ready) || startProblems(next).length) return { players };
  const teams = activeTeams(b).map(t => ({ ...t, role: rulesFor(agreedScenario(b)).roles ? t.role : null }));
  return {
    players,
    teams,
    status: 'active',
    scenario: agreedScenario(b),
    turn: 1,
    scores: Object.fromEntries(teams.map(t => [t.id, {}])),
    flags: {},
    targetWounds: null,
    endProposal: null,
    startedAt: Date.now(),
  };
});

// --- During the battle ---

// Team totals for the end checks, built from each player's squad tracker.
export function teamStates(b, squads) {
  return b.teams.map(t => {
    const players = Object.entries(b.players).filter(([, p]) => p.team === t.id);
    let start = 0; let inAction = 0; let heroesStart = 0; let heroesDown = 0;
    players.forEach(([, p]) => {
      const squad = squads[p.squadId];
      const tracked = squad?.battle?.battleId === b.id ? squad.battle.units : null;
      p.units.forEach(uid => {
        const unit = squad?.units.find(u => u.id === uid);
        const down = !!tracked?.[uid]?.ooa;
        const hero = unit ? unit.role !== 'regular' : false;
        start++;
        if (!down) inAction++;
        if (hero) { heroesStart++; if (down) heroesDown++; }
      });
    });
    return { ...t, players: players.length, start, inAction, heroesStart, heroesDown, score: b.scores?.[t.id] ?? {} };
  });
}

const proposal = (b, outcome, by, auto) => ({
  reason: outcome.reason, results: outcome.results, by, auto, turn: b.turn, confirms: {},
});

export const setScore = (code, teamId, key, value, squads) => change(code, b => {
  if (b.status !== 'active') return null;
  const scores = { ...b.scores, [teamId]: { ...b.scores[teamId], [key]: value } };
  return withImmediateCheck({ ...b, scores }, { scores }, squads);
});

export const setFlag = (code, key, value) => change(code, b => (b.status === 'active' ? { flags: { ...b.flags, [key]: value } } : null));

export const setTargetWounds = (code, n, squads) => change(code, b => {
  if (b.status !== 'active') return null;
  return withImmediateCheck({ ...b, targetWounds: n }, { targetWounds: n }, squads);
});

// Scenarios that end the moment something happens (not at the end of a turn).
function withImmediateCheck(next, patch, squads) {
  const rules = rulesFor(next.scenario);
  if (rules.when !== 'any' || next.endProposal) return patch;
  const outcome = rules.check(teamStates(next, squads), next, false);
  return outcome ? { ...patch, endProposal: proposal(next, outcome, 'auto', true) } : patch;
}

// End the current turn: score the turn, check the scenario's end rule, then move on.
export const endTurn = (code, squads) => change(code, b => {
  if (b.status !== 'active') return null;
  const rules = rulesFor(b.scenario);
  const scores = rules.onTurnEnd
    ? Object.fromEntries(Object.entries(b.scores).map(([k, s]) => [k, rules.onTurnEnd(s)]))
    : b.scores;
  const ended = { ...b, scores };
  const outcome = rules.check && !b.endProposal ? rules.check(teamStates(ended, squads), ended, true) : null;
  const flags = { ...b.flags };
  (rules.flags ?? []).filter(f => f.perTurn).forEach(f => { flags[f.key] = false; });
  return {
    scores,
    flags,
    turn: b.turn + 1,
    ...(outcome ? { endProposal: proposal(b, { ...outcome, reason: `End of turn ${b.turn}: ${outcome.reason}` }, 'auto', true) } : {}),
  };
});

// Any player can call the battle with a result of their choosing; everyone still has to confirm.
export const proposeEnd = (code, uid, results) => change(code, b => {
  if (b.status !== 'active') return null;
  return { endProposal: proposal(b, { reason: `${b.players[uid]?.name ?? 'A player'} called the battle.`, results }, uid, false) };
});

export const answerEnd = (code, uid, agree) => change(code, b => {
  if (b.status !== 'active' || !b.endProposal) return null;
  if (!agree) return { endProposal: null };
  const confirms = { ...b.endProposal.confirms, [uid]: true };
  if (b.memberIds.every(id => confirms[id])) {
    return { endProposal: { ...b.endProposal, confirms }, status: 'ended', results: b.endProposal.results, endedAt: Date.now() };
  }
  return { endProposal: { ...b.endProposal, confirms } };
});

export const abandonBattle = code => change(code, b => (b.status === 'active' || b.status === 'lobby' ? { status: 'abandoned' } : null));

export const shareLink = code => `${location.origin}${location.pathname}#/battle/game/${code}`;
