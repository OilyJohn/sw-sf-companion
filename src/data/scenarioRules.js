// How each scenario is tracked and ended in a shared battle.
//
// Each team arrives at a check as { id, start, inAction, heroesStart, heroesDown, players, score }:
// start/inAction count the units its squads brought and still have in action, score holds
// the team's scenario counters. A check returns null while the battle goes on, or
// { reason, results: { [teamId]: 'win' | 'draw' | 'loss' } } once the scenario's end rule is met.
//
// `when` says when the app checks: 'turn' at the end of each turn, 'any' as soon as a
// counter changes (and at the end of each turn). Scenarios without a check end manually.

// "Reduced to 1/3 or less of their starting units"
export const atThird = t => t.inAction * 3 <= t.start;
// "Reduced to less than 1/3 of their starting units"
const belowThird = t => t.inAction * 3 < t.start;

const resultsFor = (teams, fn) => Object.fromEntries(teams.map(t => [t.id, fn(t)]));

// The team with the highest value wins and the rest lose; teams tied for the top draw.
export function topWins(teams, value) {
  const best = Math.max(...teams.map(value));
  const top = teams.filter(t => value(t) === best);
  return resultsFor(teams, t => (value(t) !== best ? 'loss' : top.length > 1 ? 'draw' : 'win'));
}

// Squad Elimination / Cantina Brawl. Ends once any side is down to 1/3. Sides still above 1/3
// with the highest share of their units in action win; if every side is down to 1/3, it's a draw.
function elimination(teams) {
  if (!teams.some(atThird)) return null;
  const alive = teams.filter(t => !atThird(t));
  if (!alive.length) return { reason: 'Every side is down to 1/3 or less of its units.', results: resultsFor(teams, () => 'draw') };
  const share = t => (atThird(t) ? -1 : t.inAction / t.start);
  return { reason: 'A side is down to 1/3 or less of its starting units.', results: topWins(teams, share) };
}

// Ends once any side is down to 1/3; the side with the most of `key` wins.
const thirdThenMost = (key, what) => teams => {
  if (!teams.some(atThird)) return null;
  return { reason: `A side is down to 1/3 or less of its starting units. Most ${what} wins.`, results: topWins(teams, t => t.score[key] ?? 0) };
};

const byRole = (teams, attackResult, defendResult) =>
  resultsFor(teams, t => (t.role === 'attack' ? attackResult : defendResult));

export const SCENARIO_RULES = {
  'Squad Elimination': { when: 'turn', check: elimination },
  'Cantina Brawl': { when: 'turn', check: elimination },

  'Advanced Scouting Parties': {
    when: 'turn',
    counters: [{ key: 'escaped', label: 'Units off the opposite edge' }],
    check: thirdThenMost('escaped', 'units off the opposite edge'),
  },

  'Disable the Shield Generator': {
    when: 'turn', roles: true,
    flags: [{ key: 'disabled', label: 'Shield generator disabled' }],
    check: (teams, battle) => {
      const attackers = teams.filter(t => t.role === 'attack');
      if (battle.flags?.disabled) return { reason: 'The shield generator was disabled.', results: byRole(teams, 'win', 'loss') };
      if (attackers.every(atThird)) return { reason: 'The attackers are down to 1/3 or less of their starting units.', results: byRole(teams, 'loss', 'win') };
      return null;
    },
  },

  'Bounty Hunt': {
    when: 'any',
    targetWounds: true,
    counters: [{ key: 'bounty', label: 'Wounds on the target' }],
    check: (teams, battle) => {
      const dealt = teams.reduce((n, t) => n + (t.score.bounty ?? 0), 0);
      if (!battle.targetWounds || dealt < battle.targetWounds) return null;
      return { reason: 'The target is down to 0 wounds. Most wounds on the target wins.', results: topWins(teams, t => t.score.bounty ?? 0) };
    },
  },

  Rescue: {
    when: 'turn', roles: true,
    // Checked at the end of the turn, then cleared for the next turn.
    flags: [{ key: 'holding', label: 'Attackers hold the target (within 3", defenders have none)', perTurn: true }],
    check: (teams, battle) => {
      const attackers = teams.filter(t => t.role === 'attack');
      if (battle.flags?.holding) return { reason: 'The attackers hold the target at the end of the turn.', results: byRole(teams, 'win', 'loss') };
      if (attackers.every(belowThird)) return { reason: 'The attackers are down to less than 1/3 of their starting units.', results: byRole(teams, 'loss', 'win') };
      return null;
    },
  },

  Domination: {
    when: 'turn',
    // Objectives held carry over between turns; at the end of each turn they're added to points.
    counters: [{ key: 'held', label: 'Objectives held', max: 5 }, { key: 'points', label: 'Points' }],
    onTurnEnd: score => ({ ...score, points: (score.points ?? 0) + (score.held ?? 0) }),
    check: thirdThenMost('points', 'points'),
  },

  'Supply Shower': {
    when: 'turn',
    counters: [{ key: 'crates', label: 'Crates marked' }],
    check: thirdThenMost('crates', 'crates marked'),
  },

  'Heroic Last Stand': {
    when: 'turn', roles: true, turns: 4,
    check: (teams, battle) => {
      const defenders = teams.filter(t => t.role === 'defend');
      const start = defenders.reduce((n, t) => n + t.heroesStart, 0);
      const down = defenders.reduce((n, t) => n + t.heroesDown, 0);
      if (down * 2 > start) return { reason: 'Over half of the defending heroes have been eliminated.', results: byRole(teams, 'win', 'loss') };
      if (battle.turn < 4) return null;
      if (down * 2 === start) return { reason: 'Exactly half of the defending heroes were eliminated after 4 turns.', results: resultsFor(teams, () => 'draw') };
      return { reason: 'The defenders held out for 4 turns.', results: byRole(teams, 'loss', 'win') };
    },
  },

  'Aggressive Negotiations': {
    when: 'any', turns: 5,
    // One leader per player, so a team is done once all its players' leaders are off the board.
    counters: [{ key: 'leaders', label: 'Leaders carried off', max: t => t.players }],
    check: (teams, battle, turnEnded) => {
      const safe = teams.filter(t => (t.score.leaders ?? 0) >= t.players);
      const allOff = safe.length === teams.length;
      if (!allOff && !(turnEnded && battle.turn >= 5)) return null;
      const reason = allOff ? 'Every leader is off the board.' : '5 turns have been completed.';
      if (safe.length === 1) return { reason: `${reason} Only one side got its leader to safety.`, results: resultsFor(teams, t => (t === safe[0] ? 'win' : 'loss')) };
      return { reason: `${reason} It's a draw.`, results: resultsFor(teams, () => 'draw') };
    },
  },

  'Other / custom': {
    counters: [{ key: 'points', label: 'Points' }],
  },
};

export const rulesFor = name => SCENARIO_RULES[name] ?? {};
