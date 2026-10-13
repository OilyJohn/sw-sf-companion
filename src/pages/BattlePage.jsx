import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import RollInput from '../components/RollInput.jsx';
import SignInGate from '../components/SignInGate.jsx';
import { RESULTS, SCENARIOS } from '../data/campaign.js';
import { getFaction } from '../data/rules.js';
import { saveSquad, squadPoints, unitStats, useMySquads, useSquad } from '../squads.js';

export default function BattlePage() {
  return <SignInGate what="your battles"><Battle /></SignInGate>;
}

function Battle() {
  const { id } = useParams();
  return id ? <SquadBattle id={id} /> : <PickSquad />;
}

function PickSquad() {
  const { user } = useAuth();
  const squads = useMySquads(user.uid);
  if (squads === null) return <p className="muted">Loading squads…</p>;
  if (!squads.length) return <p>Create a squad first under <Link to="/squads">My Squads</Link>.</p>;
  return (
    <div className="stack">
      <p className="muted">Which squad is going into battle?</p>
      {squads.map(s => (
        <Link key={s.id} to={`/battle/${s.id}`} className="card link-card">
          <div className="row between">
            <strong>{s.name}</strong>
            {s.battle ? <span className="pill warn">In battle</span> : <span className="pill">{squadPoints(s)} pts</span>}
          </div>
          <div className="muted small">{getFaction(s.faction)?.name}</div>
        </Link>
      ))}
    </div>
  );
}

function SquadBattle({ id }) {
  const squad = useSquad(id);
  if (squad === undefined) return <p className="muted">Loading…</p>;
  if (squad === null) return <p>Squad not found.</p>;
  if (squad.backToShip) {
    return (
      <div className="card stack">
        <p>{squad.name} is back on the ship with things still to do.</p>
        <Link className="btn" to={`/squads/${squad.id}/ship`}>Go to Back to the Ship</Link>
      </div>
    );
  }
  return squad.battle ? <Tracker squad={squad} /> : <StartBattle squad={squad} />;
}

const blankTrack = { ooa: false, wounds: 0, heroKills: 0, objective: 0 };

function StartBattle({ squad }) {
  const ready = squad.units.filter(u => u.status === 'ready');
  const [scenario, setScenario] = useState(SCENARIOS[0].name);
  const [opponent, setOpponent] = useState('');
  const [picked, setPicked] = useState(() => new Set(ready.map(u => u.id)));
  const mustRescue = squad.units.some(u => u.status === 'mia');

  const toggle = uid => setPicked(p => {
    const n = new Set(p);
    n.has(uid) ? n.delete(uid) : n.add(uid);
    return n;
  });

  function start() {
    const units = Object.fromEntries([...picked].map(uid => [uid, { ...blankTrack }]));
    saveSquad(squad.id, { battle: { scenario, opponent: opponent.trim(), startedAt: Date.now(), units } });
  }

  return (
    <div className="stack">
      <div className="card stack">
        <h2>New battle: {squad.name}</h2>
        {mustRescue && <p className="warn small">A unit is M.I.A., so this mission must be a Rescue.</p>}
        <label>Scenario
          <select value={scenario} onChange={e => setScenario(e.target.value)}>
            {SCENARIOS.map(s => <option key={s.name} value={s.name}>{s.roll ? `${s.roll}. ` : ''}{s.name}</option>)}
          </select>
        </label>
        <label>Opponent<input value={opponent} placeholder="Who are you playing?" onChange={e => setOpponent(e.target.value)} /></label>
        <div className="small"><span className="muted">Points rating: </span>{squadPoints(squad)} pts</div>
      </div>
      <div className="card stack">
        <div className="nav-heading">Units taking part</div>
        {ready.map(u => (
          <label key={u.id} className="check">
            <input type="checkbox" checked={picked.has(u.id)} onChange={() => toggle(u.id)} />
            <span>{u.name} <span className="muted small">{u.type}</span></span>
          </label>
        ))}
        {squad.units.filter(u => u.status === 'injured').map(u => (
          <div key={u.id} className="muted small">{u.name} is in the bacta tank and misses this mission.</div>
        ))}
      </div>
      <button className="btn wide" disabled={!picked.size} onClick={start}>Start battle</button>
    </div>
  );
}

function Tracker({ squad }) {
  const [ending, setEnding] = useState(false);
  const { battle } = squad;
  const scenario = SCENARIOS.find(s => s.name === battle.scenario);
  const units = squad.units.filter(u => battle.units[u.id]);

  const update = (uid, patch) =>
    saveSquad(squad.id, { [`battle.units.${uid}`]: { ...battle.units[uid], ...patch } });

  if (ending) return <EndBattle squad={squad} onBack={() => setEnding(false)} />;

  const down = units.filter(u => battle.units[u.id].ooa).length;
  return (
    <div className="stack">
      <div className="card">
        <div className="row between">
          <h2>{battle.scenario}</h2>
          <span className="pill">{units.length - down}/{units.length} in action</span>
        </div>
        {battle.opponent && <div className="muted small">vs {battle.opponent}</div>}
        {scenario?.bonus && <div className="small" style={{ marginTop: 8 }}><span className="muted">Bonus objective EXP: </span>{scenario.bonus}</div>}
      </div>

      {units.map(u => {
        const t = battle.units[u.id];
        const hero = u.role !== 'regular';
        return (
          <div key={u.id} className={`card ${t.ooa ? 'dim' : ''}`}>
            <div className="row between">
              <div>
                <strong>{u.name}</strong>
                {hero && <span className={`tag ${u.role}`}>{u.role}</span>}
                <div className="muted small">{u.type} · W {unitStats(u, squad.faction)?.wounds}</div>
              </div>
              <button className={`btn small-btn ${t.ooa ? '' : 'ghost'}`} onClick={() => update(u.id, { ooa: !t.ooa })}>
                {t.ooa ? 'Out of action' : 'In action'}
              </button>
            </div>
            <Counter label="Wounds inflicted" value={t.wounds} onChange={v => update(u.id, { wounds: v })} />
            <Counter label="Enemy heroes defeated" value={t.heroKills} onChange={v => update(u.id, { heroKills: v })} />
            <Counter label="Objective EXP" value={t.objective} onChange={v => update(u.id, { objective: v })} />
            <div className="muted small">EXP so far: {battleExp(t)}</div>
          </div>
        );
      })}

      <button className="btn wide" onClick={() => setEnding(true)}>End battle</button>
      <button className="btn ghost danger wide" onClick={() => confirm('Abandon this battle without recording it?') && saveSquad(squad.id, { battle: null })}>
        Abandon battle
      </button>
    </div>
  );
}

function Counter({ label, value, onChange }) {
  return (
    <div className="counter">
      <span className="small">{label}</span>
      <div className="row gap">
        <button className="icon-btn step" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <b className="count">{value}</b>
        <button className="icon-btn step" aria-label={`Increase ${label}`} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

// EXP from the campaign rules: 1 for taking part, 1 for wounding at least one enemy,
// 1 per enemy hero defeated, plus objective EXP from the scenario.
const battleExp = (t, mvp = false) => 1 + (t.wounds > 0 ? 1 : 0) + t.heroKills + t.objective + (mvp ? 1 : 0);

function EndBattle({ squad, onBack }) {
  const navigate = useNavigate();
  const { battle } = squad;
  const [result, setResult] = useState(null);
  const [creditRoll, setCreditRoll] = useState(null);
  const [mvp, setMvp] = useState('');
  const units = squad.units.filter(u => battle.units[u.id]);
  const mvpCandidates = units.filter(u => u.role === 'regular');
  const credits = result && creditRoll !== null ? creditRoll + RESULTS[result].credits : null;

  async function finish() {
    const expGained = Object.fromEntries(units.map(u => [u.id, battleExp(battle.units[u.id], u.id === mvp)]));
    const injuries = units.filter(u => battle.units[u.id].ooa).map(u => u.id);
    await saveSquad(squad.id, {
      credits: squad.credits + credits,
      started: true,
      units: squad.units.map(u => {
        if (expGained[u.id] !== undefined) return { ...u, exp: u.exp + expGained[u.id] };
        // Units that sat this mission out in the bacta tank are fit again.
        if (u.status === 'injured') return { ...u, status: 'ready' };
        return u;
      }),
      battle: null,
      backToShip: { injuries, result },
      history: [...(squad.history ?? []), {
        date: battle.startedAt, endedAt: Date.now(), scenario: battle.scenario, opponent: battle.opponent,
        result, credits, mvp: mvp || null, exp: expGained, outOfAction: injuries,
      }],
    });
    navigate(`/squads/${squad.id}/ship`);
  }

  return (
    <div className="stack">
      <div className="card stack">
        <h2>End battle</h2>
        <div className="seg">
          {Object.entries(RESULTS).map(([k, r]) => (
            <button key={k} className={`btn ${result === k ? '' : 'ghost'}`} onClick={() => setResult(k)}>{r.label}</button>
          ))}
        </div>
        {result && (
          <>
            <div className="small">Credits: D8 + {RESULTS[result].credits}</div>
            {creditRoll === null
              ? <RollInput dice="D8" min={1} max={8} onRoll={setCreditRoll} />
              : <div>Rolled {creditRoll} + {RESULTS[result].credits} = <b>{credits} credits</b> <button className="link-btn small" onClick={() => setCreditRoll(null)}>change</button></div>}
          </>
        )}
      </div>

      <div className="card stack">
        <div className="nav-heading">MVP (chosen by your opponent, non-heroes only)</div>
        <select value={mvp} onChange={e => setMvp(e.target.value)}>
          <option value="">No MVP</option>
          {mvpCandidates.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <div className="muted small">Battle record to help pick:</div>
        {mvpCandidates.map(u => {
          const t = battle.units[u.id];
          return <div key={u.id} className="small">{u.name}: {t.wounds} wounds, {t.heroKills} heroes, {t.objective} objective{t.ooa ? ', out of action' : ''}</div>;
        })}
      </div>

      <div className="card stack">
        <div className="nav-heading">EXP gained</div>
        {units.map(u => (
          <div key={u.id} className="row between small">
            <span>{u.name}{battle.units[u.id].ooa && <span className="warn"> · roll injury</span>}</span>
            <b>+{battleExp(battle.units[u.id], u.id === mvp)}</b>
          </div>
        ))}
      </div>

      <button className="btn wide" disabled={credits === null} onClick={finish}>Record result and go Back to the Ship</button>
      <button className="btn ghost wide" onClick={onBack}>Back to tracker</button>
    </div>
  );
}
