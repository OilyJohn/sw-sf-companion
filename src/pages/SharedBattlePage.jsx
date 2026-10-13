import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import RollInput from '../components/RollInput.jsx';
import SignInGate from '../components/SignInGate.jsx';
import {
  abandonBattle, addTeam, agreedScenario, answerEnd, endTurn, joinBattle, leaveBattle, proposeEnd, removeTeam, ROLL,
  setFlag, setPlayer, setReady, setRolled, setScore, setTargetWounds, setTeamRole, shareLink, startProblems,
  teamStates, useBattle, vote,
} from '../battles.js';
import { RESULTS, SCENARIOS } from '../data/campaign.js';
import { rulesFor } from '../data/scenarioRules.js';
import { squadPoints, saveSquad, useMySquads, useSquadsById } from '../squads.js';
import { blankTrack, Counter, EndBattle, Tracker } from './BattlePage.jsx';

export default function SharedBattlePage() {
  return <SignInGate what="this battle"><SharedBattle /></SignInGate>;
}

const fail = e => alert(e.message);
const RESULT_WORD = { win: 'Wins', draw: 'Draws', loss: 'Loses' };

function SharedBattle() {
  const { code } = useParams();
  const { user } = useAuth();
  const battle = useBattle(code);
  const squads = useSquadsById(Object.values(battle?.players ?? {}).map(p => p.squadId));
  const me = battle?.players?.[user.uid];
  const mySquad = me?.squadId ? squads[me.squadId] : null;

  // Keep this player's own squad in step with the shared battle.
  useEffect(() => {
    if (!battle || !me || !mySquad) return;
    const linked = mySquad.battle?.battleId === battle.id;
    if (battle.status === 'active' && !mySquad.battle && !mySquad.backToShip) {
      const opponents = Object.values(battle.players).filter(p => p.team !== me.team).map(p => p.squadName);
      saveSquad(mySquad.id, {
        battle: {
          battleId: battle.id, scenario: battle.scenario, opponent: opponents.join(', '), startedAt: battle.startedAt,
          units: Object.fromEntries(me.units.map(uid => [uid, { ...blankTrack }])),
        },
      });
    }
    if (battle.status === 'abandoned' && linked) saveSquad(mySquad.id, { battle: null });
  }, [battle, me, mySquad]);

  if (battle === undefined) return <p className="muted">Loading…</p>;
  if (battle === null) return <NotFound text={`No battle with code ${code}.`} />;
  if (battle.status === 'abandoned') return <NotFound text="This battle was abandoned." />;
  if (!me) {
    if (battle.status !== 'lobby') return <NotFound text="This battle has already started without you." />;
    return (
      <div className="card stack">
        <h2>Battle {battle.id}</h2>
        <p className="small">{Object.values(battle.players).map(p => p.name).join(', ')} {Object.keys(battle.players).length === 1 ? 'is' : 'are'} getting ready.</p>
        <button className="btn wide" onClick={() => joinBattle(battle.id, user).catch(fail)}>Join this battle</button>
      </div>
    );
  }
  if (battle.status === 'lobby') return <Lobby battle={battle} uid={user.uid} />;

  const teams = teamStates(battle, squads);
  if (battle.status === 'ended') {
    const result = battle.results[me.team];
    return (
      <div className="stack">
        <Outcome battle={battle} teams={teams} heading="Battle over" />
        {mySquad?.battle?.battleId === battle.id
          ? <EndBattle squad={mySquad} fixedResult={result} />
          : <div className="card stack">
              <p className="small">Your result is recorded.</p>
              {me.squadId && <Link className="btn" to={`/squads/${me.squadId}/ship`}>Back to the Ship</Link>}
            </div>}
      </div>
    );
  }
  return (
    <div className="stack">
      <BattlePanel battle={battle} teams={teams} squads={squads} uid={user.uid} />
      {mySquad?.battle?.battleId === battle.id ? <Tracker squad={mySquad} shared /> : <p className="muted small">Setting up your squad…</p>}
      <button className="btn ghost danger wide" onClick={() => confirm('Abandon this battle for everyone without recording it?') && abandonBattle(battle.id).catch(fail)}>
        Abandon battle
      </button>
    </div>
  );
}

function NotFound({ text }) {
  return (
    <div className="card stack">
      <p>{text}</p>
      <Link className="btn" to="/battle">Back to battles</Link>
    </div>
  );
}

// --- Lobby ---

function Lobby({ battle, uid }) {
  const me = battle.players[uid];
  const scenario = agreedScenario(battle);
  const problems = startProblems(battle);
  const players = Object.entries(battle.players);
  const allVotedRoll = players.every(([, p]) => p.vote === ROLL);
  const mia = players.filter(([, p]) => p.hasMia).map(([, p]) => p.squadName);

  return (
    <div className="stack">
      <ShareCode code={battle.id} />
      <MySquadPicker battle={battle} uid={uid} />

      <div className="card stack">
        <div className="row between">
          <div className="nav-heading">Teams</div>
          {battle.teams.length < players.length && <button className="link-btn small" onClick={() => addTeam(battle.id).catch(fail)}>+ Add team</button>}
        </div>
        {battle.teams.map(t => {
          const members = players.filter(([, p]) => p.team === t.id);
          return (
            <div key={t.id} className="sub">
              <div className="row between">
                <strong>{t.name}</strong>
                <div className="row gap">
                  {me.team !== t.id && <button className="btn ghost small-btn" onClick={() => setPlayer(battle.id, uid, { team: t.id }).catch(fail)}>Join</button>}
                  {!members.length && battle.teams.length > 2 && <button className="link-btn small" onClick={() => removeTeam(battle.id, t.id).catch(fail)}>Remove</button>}
                </div>
              </div>
              {scenario && rulesFor(scenario).roles && (
                <div className="seg" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {['attack', 'defend'].map(r => (
                    <button key={r} className={`btn small-btn ${t.role === r ? '' : 'ghost'}`} onClick={() => setTeamRole(battle.id, t.id, r).catch(fail)}>
                      {r === 'attack' ? 'Attacking' : 'Defending'}
                    </button>
                  ))}
                </div>
              )}
              {members.map(([id, p]) => (
                <div key={id} className="row between small">
                  <span>{p.name}{p.squadName && <span className="muted"> · {p.squadName} · {p.points} pts · {p.units.length} units</span>}</span>
                  <span className={p.ready ? 'warn' : 'muted'}>{p.ready ? 'Ready' : 'Not ready'}</span>
                </div>
              ))}
              {!members.length && <div className="muted small">No one yet</div>}
            </div>
          );
        })}
      </div>

      <div className="card stack">
        <div className="nav-heading">Scenario</div>
        <p className="muted small">Everyone has to pick the same scenario, or all choose to roll for it.</p>
        <label>Your choice
          <select value={me.vote ?? ''} onChange={e => vote(battle.id, uid, e.target.value || null).catch(fail)}>
            <option value="">Choose…</option>
            <option value={ROLL}>Roll for it (D10)</option>
            {SCENARIOS.map(s => <option key={s.name} value={s.name}>{s.roll ? `${s.roll}. ` : ''}{s.name}</option>)}
          </select>
        </label>
        {players.map(([id, p]) => (
          <div key={id} className="row between small">
            <span>{p.name}</span>
            <span className={p.vote ? '' : 'muted'}>{p.vote === ROLL ? 'Roll for it' : p.vote ?? 'Not chosen'}</span>
          </div>
        ))}
        {allVotedRoll && !battle.rolled && <RollInput dice="D10" min={1} max={10} label="Roll scenario" onRoll={n => setRolled(battle.id, n).catch(fail)} />}
        {allVotedRoll && battle.rolled && <div className="small">Rolled {battle.rolled}: <b>{scenario}</b> <button className="link-btn small" onClick={() => setRolled(battle.id, null).catch(fail)}>re-roll</button></div>}
        {scenario && !allVotedRoll && <div className="small">Agreed: <b>{scenario}</b></div>}
        {scenario && <Link to="/rules/scenarios" className="small">Read the scenario rules</Link>}
        {mia.length > 0 && <p className="warn small">{mia.join(', ')} {mia.length === 1 ? 'has' : 'have'} a unit M.I.A., so this mission must be a Rescue.</p>}
      </div>

      {problems.length > 0 && (
        <div className="card stack">
          {problems.map(p => <div key={p} className="muted small">{p}</div>)}
        </div>
      )}
      <button className={`btn wide ${me.ready ? 'ghost' : ''}`} disabled={!me.ready && (!me.squadId || !me.units.length)}
        onClick={() => setReady(battle.id, uid, !me.ready).catch(fail)}>
        {me.ready ? 'Not ready' : 'Ready'}
      </button>
      <button className="btn ghost danger wide" onClick={() => confirm('Leave this battle?') && leaveBattle(battle.id, uid).catch(fail)}>Leave battle</button>
    </div>
  );
}

function ShareCode({ code }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = shareLink(code);
    try {
      if (navigator.share) await navigator.share({ title: 'Join my battle', text: `Battle code ${code}`, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); }
    } catch { /* share sheet closed */ }
  }
  return (
    <div className="card center">
      <div className="muted small">Battle code</div>
      <div className="battle-code">{code}</div>
      <button className="btn ghost small-btn" onClick={share}>{copied ? 'Link copied' : 'Share link'}</button>
    </div>
  );
}

function MySquadPicker({ battle, uid }) {
  const me = battle.players[uid];
  const squads = useMySquads(uid);
  if (squads === null) return <p className="muted">Loading squads…</p>;
  const squad = squads.find(s => s.id === me.squadId);
  // A squad already fighting or still back on the ship can't join.
  const free = squads.filter(s => s.id === me.squadId || (!s.battle && !s.backToShip));
  const ready = squad?.units.filter(u => u.status === 'ready') ?? [];

  const pick = id => {
    const s = squads.find(x => x.id === id);
    if (!s) return setPlayer(battle.id, uid, { squadId: null, squadName: '', faction: '', points: 0, units: [], heroes: 0, hasMia: false }).catch(fail);
    const units = s.units.filter(u => u.status === 'ready');
    setPlayer(battle.id, uid, {
      squadId: s.id, squadName: s.name, faction: s.faction, points: squadPoints(s),
      units: units.map(u => u.id), heroes: units.filter(u => u.role !== 'regular').length,
      hasMia: s.units.some(u => u.status === 'mia'),
    }).catch(fail);
  };
  const toggle = id => {
    const picked = me.units.includes(id) ? me.units.filter(x => x !== id) : [...me.units, id];
    const heroes = squad.units.filter(u => picked.includes(u.id) && u.role !== 'regular').length;
    setPlayer(battle.id, uid, { units: picked, heroes }).catch(fail);
  };

  return (
    <div className="card stack">
      <div className="nav-heading">Your squad</div>
      {!squads.length && <p className="small">Create a squad first under <Link to="/squads">My Squads</Link>.</p>}
      <select value={me.squadId ?? ''} onChange={e => pick(e.target.value)}>
        <option value="">Choose a squad…</option>
        {free.map(s => <option key={s.id} value={s.id}>{s.name} ({squadPoints(s)} pts)</option>)}
      </select>
      {ready.map(u => (
        <label key={u.id} className="check">
          <input type="checkbox" checked={me.units.includes(u.id)} onChange={() => toggle(u.id)} />
          <span>{u.name} <span className="muted small">{u.type}</span></span>
        </label>
      ))}
      {squad?.units.filter(u => u.status === 'injured').map(u => (
        <div key={u.id} className="muted small">{u.name} is in the bacta tank and misses this mission.</div>
      ))}
    </div>
  );
}

// --- During the battle ---

function BattlePanel({ battle, teams, squads, uid }) {
  const [calling, setCalling] = useState(false);
  const rules = rulesFor(battle.scenario);
  const playersOf = teamId => Object.values(battle.players).filter(p => p.team === teamId);
  const auto = rules.check ? (rules.when === 'any' ? 'Ends automatically when its end condition is met.' : 'Checked automatically at the end of each turn.') : 'End this scenario manually.';

  return (
    <>
      <div className="card stack">
        <div className="row between">
          <h2>{battle.scenario}</h2>
          <span className="pill warn">Turn {battle.turn}{rules.turns ? ` of ${rules.turns}` : ''}</span>
        </div>
        <div className="muted small">{auto} <Link to="/rules/scenarios">Rules</Link></div>

        {rules.targetWounds && (
          <label className="small">Target's starting wounds
            <input type="number" inputMode="numeric" min={1} value={battle.targetWounds ?? ''} placeholder="Agree the target's wounds"
              onChange={e => setTargetWounds(battle.id, Number(e.target.value) || null, squads).catch(fail)} />
          </label>
        )}

        {teams.map(t => (
          <div key={t.id} className="sub">
            <div className="row between">
              <strong>{t.name}{t.role && <span className="tag">{t.role === 'attack' ? 'Attacking' : 'Defending'}</span>}</strong>
              <span className={`pill ${t.inAction * 3 <= t.start ? 'warn' : ''}`}>{t.inAction}/{t.start} in action</span>
            </div>
            <div className="muted small">{playersOf(t.id).map(p => `${p.squadName} (${p.name})`).join(', ')}</div>
            {battle.scenario === 'Heroic Last Stand' && t.role === 'defend' && <div className="small">Heroes eliminated: {t.heroesDown}/{t.heroesStart}</div>}
            {(rules.counters ?? []).map(c => (
              <Counter key={c.key} label={c.label} value={t.score[c.key] ?? 0}
                max={typeof c.max === 'function' ? c.max(t) : c.max}
                onChange={v => setScore(battle.id, t.id, c.key, v, squads).catch(fail)} />
            ))}
          </div>
        ))}

        {(rules.flags ?? []).map(f => (
          <label key={f.key} className="check">
            <input type="checkbox" checked={!!battle.flags?.[f.key]} onChange={e => setFlag(battle.id, f.key, e.target.checked).catch(fail)} />
            <span className="small">{f.label}{f.perTurn && <span className="muted"> (this turn)</span>}</span>
          </label>
        ))}

        <button className="btn wide" disabled={!!battle.endProposal}
          onClick={() => confirm(`End turn ${battle.turn} for everyone?`) && endTurn(battle.id, squads).catch(fail)}>
          End turn {battle.turn}
        </button>
        <button className="btn ghost wide" disabled={!!battle.endProposal} onClick={() => setCalling(true)}>End battle…</button>
      </div>

      {calling && <CallBattle battle={battle} teams={teams} uid={uid} onClose={() => setCalling(false)} />}
      {battle.endProposal && <EndProposal battle={battle} teams={teams} uid={uid} />}
    </>
  );
}

// Manually end the battle with a result for each team.
function CallBattle({ battle, teams, uid, onClose }) {
  const [results, setResults] = useState(() => Object.fromEntries(teams.map(t => [t.id, null])));
  const done = Object.values(results).every(Boolean);
  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup card stack" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <h2>End the battle</h2>
        <p className="muted small">Pick each team's result. Everyone has to confirm it.</p>
        {teams.map(t => (
          <div key={t.id} className="stack">
            <strong className="small">{t.name}</strong>
            <div className="seg">
              {Object.entries(RESULTS).map(([k, r]) => (
                <button key={k} className={`btn small-btn ${results[t.id] === k ? '' : 'ghost'}`} onClick={() => setResults(s => ({ ...s, [t.id]: k }))}>{r.label}</button>
              ))}
            </div>
          </div>
        ))}
        <button className="btn" disabled={!done} onClick={() => { proposeEnd(battle.id, uid, results).catch(fail); onClose(); }}>Ask everyone to confirm</button>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function Outcome({ battle, teams, heading, children, className = 'card stack' }) {
  const results = battle.endProposal?.results ?? battle.results;
  return (
    <div className={className}>
      <div className="muted small">{heading}</div>
      <div className="small">{battle.endProposal?.reason}</div>
      {teams.map(t => (
        <div key={t.id} className="row between">
          <span>{t.name} <span className="muted small">{Object.values(battle.players).filter(p => p.team === t.id).map(p => p.squadName).join(', ')}</span></span>
          <b className={results[t.id] === 'win' ? 'warn' : ''}>{RESULT_WORD[results[t.id]]}</b>
        </div>
      ))}
      {children}
    </div>
  );
}

function EndProposal({ battle, teams, uid }) {
  const { confirms } = battle.endProposal;
  const waiting = battle.memberIds.filter(id => !confirms[id]).map(id => battle.players[id]?.name);
  return (
    <div className="popup-backdrop">
      <div role="dialog" aria-modal="true" style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Outcome battle={battle} teams={teams} heading="Battle over?" className="popup card stack">
          {confirms[uid]
            ? <div className="muted small">Waiting for {waiting.join(', ')} to confirm.</div>
            : <>
                <div className="muted small">Everyone has to confirm before the battle ends.</div>
                <button className="btn" onClick={() => answerEnd(battle.id, uid, true).catch(fail)}>Confirm, battle over</button>
              </>}
          <button className="btn ghost" onClick={() => answerEnd(battle.id, uid, false).catch(fail)}>Not over, keep playing</button>
        </Outcome>
      </div>
    </div>
  );
}
