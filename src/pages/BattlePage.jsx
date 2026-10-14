import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import ForcePowers from '../components/ForcePowers.jsx';
import RollInput from '../components/RollInput.jsx';
import RuleLinks from '../components/RuleLinks.jsx';
import SignInGate from '../components/SignInGate.jsx';
import { WotfPanel, WotfPicker, mercsChosen } from '../components/WillOfTheForce.jsx';
import { createBattle, normaliseCode, useMyBattles } from '../battles.js';
import { RESULTS, SCENARIOS } from '../data/campaign.js';
import { MERC_HIRE_COST, blankWotf, bonusCost, bonusCredits, bonusExp, countOf } from '../data/willOfTheForce.js';
import { saveSquad, squadPoints, tempMerc, todoCount, unitStats, unitsPoints, useMySquads, useSquad, withoutTemp } from '../squads.js';

export default function BattlePage() {
  return <SignInGate what="your battles"><Battle /></SignInGate>;
}

function Battle() {
  const { id } = useParams();
  return id ? <SquadBattle id={id} /> : <BattleHome />;
}

function BattleHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const squads = useMySquads(user.uid);
  const battles = useMyBattles(user.uid);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  async function host() {
    setBusy(true);
    try {
      navigate(`/battle/game/${await createBattle(user)}`);
    } catch (e) {
      alert(e.message);
      setBusy(false);
    }
  }

  const inBattle = (squads ?? []).filter(s => s.battle && !s.battle.battleId);
  const idle = (squads ?? []).filter(s => !s.battle && !s.backToShip);
  const free = idle.filter(s => !todoCount(s));
  const blocked = idle.filter(s => todoCount(s));
  return (
    <div className="stack">
      <div className="card stack">
        <h2>Start a battle</h2>
        <p className="muted small">Host a battle and share the code. Each player joins on their own phone, picks a squad and readies up. The battle starts once everyone is ready.</p>
        <button className="btn wide" disabled={busy} onClick={host}>Host a new battle</button>
        <form className="row gap" onSubmit={e => { e.preventDefault(); normaliseCode(code) && navigate(`/battle/game/${normaliseCode(code)}`); }}>
          <input value={code} placeholder="Battle code" autoCapitalize="characters" onChange={e => setCode(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
          <button className="btn ghost" disabled={!normaliseCode(code)}>Join</button>
        </form>
      </div>

      {!!free.length && (
        <div className="card stack">
          <div className="nav-heading">Solo test battle</div>
          <p className="muted small">Play on your own without a lobby. EXP, injuries and credits still apply.</p>
          <select value="" onChange={e => e.target.value && navigate(`/battle/${e.target.value}`)}>
            <option value="">Choose a squad…</option>
            {free.map(s => <option key={s.id} value={s.id}>{s.name} ({squadPoints(s)} pts)</option>)}
          </select>
        </div>
      )}

      {blocked.map(s => (
        <Link key={s.id} to={`/squads/${s.id}`} className="card link-card">
          <div className="row between">
            <strong>{s.name}</strong>
            <span className="pill warn">{todoCount(s)} to-do{todoCount(s) > 1 ? 's' : ''}</span>
          </div>
          <div className="muted small">Finish its to-dos on the squad page before it can go into battle.</div>
        </Link>
      ))}

      {!!battles?.length && (
        <div className="stack">
          <div className="nav-heading">Your battles</div>
          {battles.map(b => (
            <Link key={b.id} to={`/battle/game/${b.id}`} className="card link-card">
              <div className="row between">
                <strong>{b.status === 'active' ? b.scenario : 'Getting ready'}</strong>
                <span className={`pill ${b.status === 'active' ? 'warn' : ''}`}>{b.status === 'active' ? `Turn ${b.turn}` : b.id}</span>
              </div>
              <div className="muted small">{Object.values(b.players).map(p => p.squadName || p.name).join(' vs ')}</div>
            </Link>
          ))}
        </div>
      )}

      {inBattle.map(s => (
        <Link key={s.id} to={`/battle/${s.id}`} className="card link-card">
          <div className="row between">
            <strong>{s.name}</strong>
            <span className="pill warn">{s.battle.test ? 'Test battle' : 'In battle'}</span>
          </div>
          <div className="muted small">{s.battle.scenario}{s.battle.opponent && ` vs ${s.battle.opponent}`}</div>
        </Link>
      ))}
      {squads?.length === 0 && <p>Create a squad first under <Link to="/squads">My Squads</Link>.</p>}
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
  if (squad.battle?.battleId) return <Navigate to={`/battle/game/${squad.battle.battleId}`} replace />;
  if (squad.battle) return <Tracker squad={squad} />;
  if (todoCount(squad)) {
    return (
      <div className="card stack">
        <p>{squad.name} has {todoCount(squad)} to-do{todoCount(squad) > 1 ? 's' : ''} to finish before it can go into battle.</p>
        <Link className="btn" to={`/squads/${squad.id}`}>Go to the squad page</Link>
      </div>
    );
  }
  return <StartBattle squad={squad} />;
}

// Solo test battle: no lobby, for trying things out alone.
function StartBattle({ squad }) {
  const ready = squad.units.filter(u => u.status === 'ready');
  const [scenario, setScenario] = useState(SCENARIOS[0].name);
  const [opponent, setOpponent] = useState('');
  const [picked, setPicked] = useState(() => new Set(ready.map(u => u.id)));
  const [oppPoints, setOppPoints] = useState('');
  const [bonuses, setBonuses] = useState([]);
  const [mercTypes, setMercTypes] = useState([]);
  const mustRescue = squad.units.some(u => u.status === 'mia');
  const myPoints = unitsPoints(squad, [...picked]);
  const gap = (Number(oppPoints) || 0) - myPoints;
  const wotfOk = Math.max(0, gap) >= bonusCost(bonuses) && mercsChosen(bonuses, mercTypes);

  const toggle = uid => setPicked(p => {
    const n = new Set(p);
    n.has(uid) ? n.delete(uid) : n.add(uid);
    return n;
  });

  function start() {
    const mercs = mercTypes.map(tempMerc);
    const ids = [...picked, ...mercs.map(m => m.id)];
    const units = Object.fromEntries(ids.map(uid => [uid, { ...blankTrack }]));
    saveSquad(squad.id, {
      ...(mercs.length ? { units: [...squad.units, ...mercs] } : {}),
      battle: {
        test: true, scenario, opponent: opponent.trim(), startedAt: Date.now(), units,
        ...(bonuses.length ? { wotf: blankWotf(gap, bonuses, mercs.map(m => m.id)) } : {}),
      },
    });
  }

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Solo test battle: {squad.name}</h2>
        <p className="muted small">Just you, no lobby. EXP, injuries and credits still apply to the squad.</p>
        {mustRescue && <p className="warn small">A unit is M.I.A., so this mission must be a Rescue.</p>}
        <label>Scenario
          <select value={scenario} onChange={e => setScenario(e.target.value)}>
            {SCENARIOS.map(s => <option key={s.name} value={s.name}>{s.roll ? `${s.roll}. ` : ''}{s.name}</option>)}
          </select>
        </label>
        <label>Opponent<input value={opponent} placeholder="Who are you playing?" onChange={e => setOpponent(e.target.value)} /></label>
        <label>Opponent's points (units taking part)
          <input type="number" inputMode="numeric" min={0} value={oppPoints} placeholder="For the Will of the Force"
            onChange={e => setOppPoints(e.target.value)} />
        </label>
      </div>
      {oppPoints !== '' && (
        <div className="card stack">
          <div className="nav-heading">Will of the Force</div>
          <WotfPicker budget={Math.max(0, gap)} picked={bonuses} mercTypes={mercTypes} onChange={(b, m) => { setBonuses(b); setMercTypes(m); }}
            intro={gap > 0 ? `You're outgunned by ${gap} pts.` : 'You have the stronger side.'} />
        </div>
      )}
      <div className="card stack">
        <div className="nav-heading">Units taking part</div>
        {ready.map(u => (
          <label key={u.id} className="check">
            <input type="checkbox" checked={picked.has(u.id)} onChange={() => toggle(u.id)} />
            <span>{u.name} <span className="muted small">{u.type} · {unitStats(u, squad.faction)?.points ?? '?'} pts</span></span>
          </label>
        ))}
        <div className="small">Taking part: <b>{myPoints} pts</b> <span className="muted">({picked.size} units)</span></div>
        {squad.units.filter(u => u.status === 'injured').map(u => (
          <div key={u.id} className="muted small">{u.name} is in the bacta tank and misses this mission.</div>
        ))}
      </div>
      <button className="btn wide" disabled={!picked.size || !wotfOk} onClick={start}>Start test battle</button>
    </div>
  );
}

export const blankTrack = { ooa: false, wounds: 0, heroKills: 0, objective: 0 };

// `shared`: part of a shared battle, which is ended and abandoned from the battle panel instead.
export function Tracker({ squad, shared = false }) {
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
          <h2>{battle.scenario}{battle.test && <span className="tag">Test</span>}</h2>
          <span className="pill">{units.length - down}/{units.length} in action</span>
        </div>
        {battle.opponent && <div className="muted small">vs {battle.opponent}</div>}
        {scenario?.bonus && <div className="small" style={{ marginTop: 8 }}><span className="muted">Bonus objective EXP: </span>{scenario.bonus}</div>}
      </div>

      <WotfPanel squad={squad} />

      {units.map(u => {
        const t = battle.units[u.id];
        const hero = u.role !== 'regular';
        const st = unitStats(u, squad.faction);
        return (
          <div key={u.id} className={`card ${t.ooa ? 'dim' : ''}`}>
            <div className="row between">
              <div>
                <strong>{u.name}</strong>
                {hero && <span className={`tag ${u.role}`}>{u.role}</span>}
                {u.temp && <span className="tag">Mercenary</span>}
                <div className="muted small">{u.type} · W {st?.wounds} · CC d{st?.cc} · S d{st?.s}</div>
              </div>
              <button className={`btn small-btn ${t.ooa ? '' : 'ghost'}`} onClick={() => update(u.id, { ooa: !t.ooa })}>
                {t.ooa ? 'Out of action' : 'In action'}
              </button>
            </div>
            {st && <>
              <RuleLinks label="Traits" kind="trait" names={st.traits} />
              <RuleLinks label="Gear" kind="gear" names={u.equipment ?? []} />
              <ForcePowers unit={u} traits={st.traits} />
            </>}
            <Counter label="Wounds inflicted" value={t.wounds} onChange={v => update(u.id, { wounds: v })} />
            <Counter label="Enemy heroes defeated" value={t.heroKills} onChange={v => update(u.id, { heroKills: v })} />
            <Counter label="Objective EXP" value={t.objective} onChange={v => update(u.id, { objective: v })} />
            <div className="muted small">EXP so far: {battleExp(t)}</div>
          </div>
        );
      })}

      {!shared && (
        <>
          <button className="btn wide" onClick={() => setEnding(true)}>End battle</button>
          <button className="btn ghost danger wide" onClick={() => confirm('Abandon this battle without recording it?') && saveSquad(squad.id, { battle: null, units: withoutTemp(squad.units) })}>
            Abandon battle
          </button>
        </>
      )}
    </div>
  );
}

export function Counter({ label, value, onChange, max = Infinity }) {
  return (
    <div className="counter">
      <span className="small">{label}</span>
      <div className="row gap">
        <button className="icon-btn step" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <b className="count">{value}</b>
        <button className="icon-btn step" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

// EXP from the campaign rules: 1 for taking part, 1 for wounding at least one enemy,
// 1 per enemy hero defeated, plus objective EXP from the scenario.
const battleExp = (t, mvp = false) => 1 + (t.wounds > 0 ? 1 : 0) + t.heroKills + t.objective + (mvp ? 1 : 0);

// `fixedResult`: the result every player agreed in a shared battle.
export function EndBattle({ squad, onBack, fixedResult = null }) {
  const navigate = useNavigate();
  const { battle } = squad;
  const wotf = battle.wotf;
  const [result, setResult] = useState(fixedResult);
  const [creditRoll, setCreditRoll] = useState(null);
  const [creditIrl, setCreditIrl] = useState(false);
  const [mvp, setMvp] = useState('');
  const [hire, setHire] = useState(() => new Set());
  const units = squad.units.filter(u => battle.units[u.id]);
  const mercs = units.filter(u => u.temp);
  const mvpCandidates = units.filter(u => u.role === 'regular' && !u.temp);
  const extraCredits = result ? bonusCredits(wotf?.bonuses, result) : 0;
  const extraExp = result ? bonusExp(wotf?.bonuses, result) : 0;
  const credits = result && creditRoll !== null ? creditRoll + RESULTS[result].credits + extraCredits : null;
  const funds = credits === null ? null : squad.credits + credits - hire.size * MERC_HIRE_COST;
  const toggleHire = id => setHire(h => { const n = new Set(h); n.has(id) ? n.delete(id) : n.add(id); return n; });
  // A Mercenary who isn't hired leaves with no EXP or injury roll.
  const staying = units.filter(u => !u.temp || hire.has(u.id));
  const exp = u => battleExp(battle.units[u.id], u.id === mvp) + extraExp;

  async function finish() {
    const expGained = Object.fromEntries(staying.map(u => [u.id, exp(u)]));
    const injuries = staying.filter(u => battle.units[u.id].ooa).map(u => u.id);
    const has = id => countOf(wotf?.bonuses, id);
    await saveSquad(squad.id, {
      credits: funds,
      started: true,
      units: squad.units.filter(u => !u.temp || hire.has(u.id)).map(u => {
        if (u.temp) u = { ...u, temp: false };
        if (expGained[u.id] !== undefined) return { ...u, exp: u.exp + expGained[u.id] };
        // Units that sat this mission out in the bacta tank are fit again.
        if (u.status === 'injured') return { ...u, status: 'ready' };
        return u;
      }),
      battle: null,
      backToShip: { injuries, result, rerolls: { injury: has('injuryReroll'), promotion: has('promotionReroll') } },
      history: [...(squad.history ?? []), {
        date: battle.startedAt, endedAt: Date.now(), scenario: battle.scenario, opponent: battle.opponent,
        ...(battle.battleId ? { battleId: battle.battleId } : {}),
        ...(battle.test ? { test: true } : {}),
        ...(wotf ? { wotf: wotf.bonuses } : {}),
        result, credits, mvp: mvp || null, exp: expGained, outOfAction: injuries,
      }],
    });
    navigate(`/squads/${squad.id}/ship`);
  }

  return (
    <div className="stack">
      <div className="card stack">
        <h2>End battle</h2>
        {fixedResult ? <div>Result: <b>{RESULTS[fixedResult].label}</b></div> : (
          <div className="seg">
            {Object.entries(RESULTS).map(([k, r]) => (
              <button key={k} className={`btn ${result === k ? '' : 'ghost'}`} onClick={() => setResult(k)}>{r.label}</button>
            ))}
          </div>
        )}
        {result && (
          <>
            <div className="small">Credits: D8 + {RESULTS[result].credits}{extraCredits ? ` + ${extraCredits} (Will of the Force)` : ''}</div>
            {creditRoll === null
              ? <RollInput dice="D8" min={1} max={8} onRoll={(n, irl) => { setCreditRoll(n); setCreditIrl(irl); }} />
              : <div>Rolled {creditRoll} + {RESULTS[result].credits}{extraCredits ? ` + ${extraCredits}` : ''} = <b>{credits} credits</b>
                  {creditIrl && <> <button className="link-btn small" onClick={() => setCreditRoll(null)}>change</button></>}</div>}
          </>
        )}
      </div>

      {mercs.length > 0 && (
        <div className="card stack">
          <div className="nav-heading">Mercenaries</div>
          {mercs.map(m => (
            <label key={m.id} className="check">
              <input type="checkbox" checked={hire.has(m.id)} disabled={funds === null || (!hire.has(m.id) && funds < MERC_HIRE_COST)} onChange={() => toggleHire(m.id)} />
              <span className="small">Hire {m.name} permanently for {MERC_HIRE_COST} credits</span>
            </label>
          ))}
          <div className="muted small">{credits === null ? 'Roll for credits first. ' : ''}Anyone not hired leaves after the mission, with no EXP or injury roll.</div>
        </div>
      )}

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
        {extraExp > 0 && <div className="muted small">Includes +{extraExp} each from the Will of the Force.</div>}
        {staying.map(u => (
          <div key={u.id} className="row between small">
            <span>{u.name}{battle.units[u.id].ooa && <span className="warn"> · roll injury</span>}</span>
            <b>+{exp(u)}</b>
          </div>
        ))}
      </div>

      <button className="btn wide" disabled={credits === null} onClick={finish}>Record result and go Back to the Ship</button>
      {onBack && <button className="btn ghost wide" onClick={onBack}>Back to tracker</button>}
    </div>
  );
}
