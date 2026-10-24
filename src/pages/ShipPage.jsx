import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ExpShift from '../components/ExpShift.jsx';
import ResultPopup from '../components/ResultPopup.jsx';
import RollInput from '../components/RollInput.jsx';
import SignInGate from '../components/SignInGate.jsx';
import {
  EXP_PER_PROMOTION, FORCE_HERO_PROMOTION, FORCE_REGULAR_PROMOTION, HERO_INJURY, HERO_PROMOTION,
  REGULAR_PROMOTION, RESULTS, WARRIOR_INJURY, lookup,
} from '../data/campaign.js';
import TodoTask from '../components/TodoTask.jsx';
import { FORCE_UNITS } from '../data/rules.js';
import { maxShift, promotionOptions, promotionsDue } from '../promotions.js';
import { saveSquad, unitStats, useSquad } from '../squads.js';

export default function ShipPage() {
  return <SignInGate what="this squad"><Ship /></SignInGate>;
}

const isHero = u => u.role !== 'regular';

function Ship() {
  const { id } = useParams();
  const navigate = useNavigate();
  const squad = useSquad(id);
  // The unit whose injury / promotion roll came last: only that roll offers a Will of the Force re-roll.
  const [latest, setLatest] = useState({});
  if (squad === undefined) return <p className="muted">Loading…</p>;
  if (squad === null) return <p>Squad not found.</p>;

  const ship = squad.backToShip;
  const last = squad.history?.at(-1);
  const injuries = (ship?.injuries ?? []).map(uid => squad.units.find(u => u.id === uid)).filter(Boolean);
  const promos = squad.units.filter(u => promotionsDue(u) > 0);
  const todos = squad.units.filter(u => u.pending?.length);

  const updateUnit = (uid, patch, extra = {}) => saveSquad(squad.id, {
    units: squad.units.map(u => (u.id === uid ? { ...u, ...patch } : u)),
    ...extra,
  });

  const allDone = !injuries.length && !promos.length;
  // Will of the Force re-rolls still unused (lost when Back to the Ship is finished).
  const rerolls = ship?.rerolls ?? {};
  const left = kind => Number(rerolls[kind] ?? 0);
  const reroll = (kind, uid) => left(kind) > 0 && latest[kind] === uid && { left: left(kind), use: () => saveSquad(squad.id, { [`backToShip.rerolls.${kind}`]: left(kind) - 1 }) };

  return (
    <div className="stack">
      <div className="card">
        <h2>Back to the Ship: {squad.name}</h2>
        {last && (
          <div className="small muted">
            {RESULTS[last.result]?.label} {last.scenario}{last.opponent ? ` vs ${last.opponent}` : ''}, +{last.credits} credits.
            Now {squad.credits} credits.
          </div>
        )}
      </div>

      <Section n={1} title="Injuries" done={!injuries.length}>
        {injuries.length === 0 && <p className="muted small">No injury rolls left.</p>}
        {injuries.map(u => (
          <InjuryRoll key={u.id} unit={u} squad={squad} reroll={reroll('injury', u.id)}
            onRolled={() => setLatest(l => ({ ...l, injury: u.id }))} onApply={(patch, credits = 0) => updateUnit(u.id, patch, {
            credits: squad.credits + credits,
            backToShip: { ...ship, injuries: ship.injuries.filter(x => x !== u.id) },
          })} />
        ))}
      </Section>

      <Section n={2} title="Promotions" done={!promos.length}>
        {promos.length === 0 && <p className="muted small">Nobody has a full EXP box ({EXP_PER_PROMOTION} EXP) waiting.</p>}
        {promos.map(u => (
          <PromotionRoll key={u.id} unit={u} squad={squad} reroll={reroll('promotion', u.id)}
            onRolled={() => setLatest(l => ({ ...l, promotion: u.id }))}
            onApply={patch => updateUnit(u.id, { ...patch, promotions: (u.promotions ?? 0) + 1 })} />
        ))}
        {promos.length > 0 && (
          <p className="muted small">
            Excess EXP can shift a result up or down the table, 1 EXP per result.
            Regular units can shift by 1 at most and can't reach Promotion to Hero this way.
          </p>
        )}
      </Section>

      <Section n={3} title="To do" done={!todos.length}>
        {todos.length === 0 && <p className="muted small">Nothing outstanding.</p>}
        {todos.map(u => u.pending.map((p, i) => (
          <TodoTask key={u.id + i + p} unit={u} squad={squad} text={p}
            onDone={(patch, extra) => {
              // Drop this to-do; a result can also add new ones (patch.pending holds only the new ones).
              const rest = u.pending.filter((_, j) => j !== i);
              updateUnit(u.id, { ...patch, pending: [...rest, ...(patch.pending ?? [])] }, extra);
            }} />
        )))}
      </Section>

      <Section n={4} title="Spend credits">
        <p className="small">You have <b>{squad.credits}</b> credits. Equipment costs 1 credit per slot for regulars, 2 for heroes.
          Reinforcements and kit are on the <Link to={`/squads/${squad.id}`}>squad page</Link>.</p>
      </Section>

      {ship && (
        <button className="btn wide" disabled={!allDone} onClick={() => { saveSquad(squad.id, { backToShip: null }); navigate(`/squads/${squad.id}`); }}>
          {allDone ? 'Finish Back to the Ship' : 'Finish injuries and promotions first'}
        </button>
      )}
    </div>
  );
}

function Section({ n, title, done, children }) {
  return (
    <div className="card stack">
      <div className="row between">
        <h2>{n}. {title}</h2>
        {done && <span className="pill">Done</span>}
      </div>
      {children}
    </div>
  );
}

// A Will of the Force re-roll, offered on the most recent injury / promotion result until they're used up.
// reroll: { left, use } or false.
function WotfReroll({ reroll, onUse }) {
  if (!reroll) return null;
  return <button className="btn ghost" onClick={() => { reroll.use(); onUse(); }}>Re-roll (Will of the Force, {reroll.left} left)</button>;
}

// Survivor: +1 to injury rolls, +10 for heroes (their table is 2D10, 0-99). Capped at the table's top row.
const survivorBonus = (unit, squad) =>
  (unitStats(unit, squad.faction)?.traits.includes('Survivor') ? (isHero(unit) ? 10 : 1) : 0);

function InjuryRoll({ unit, squad, onApply, onRolled, reroll }) {
  const table = isHero(unit) ? HERO_INJURY : WARRIOR_INJURY;
  const bonus = survivorBonus(unit, squad);
  const [roll, setRoll] = useState(null);
  const [irl, setIrl] = useState(false);
  const [popup, setPopup] = useState(false);
  const total = roll === null ? null : Math.min(roll + bonus, table.max);
  const res = roll === null ? null : lookup(table, total);
  const rolled = bonus ? `${roll} +${bonus} Survivor = ${total}` : `${roll}`;

  function apply(effect = res.effect ?? {}) {
    const patch = {};
    if (effect.status) patch.status = effect.status;
    if (effect.exp) patch.exp = unit.exp + effect.exp;
    if (effect.todo) patch.pending = [...(unit.pending ?? []), effect.todo];
    onApply(patch, effect.credits ?? 0);
  }

  return (
    <div className="sub">
      <div className="row between"><strong>{unit.name}</strong><span className="muted small">{table.name} ({table.dice}{bonus ? ` +${bonus} Survivor` : ''})</span></div>
      {res === null ? (
        <RollInput dice={table.dice} min={table.min} max={table.max} onRoll={(n, typed) => { setRoll(n); setIrl(typed); setPopup(true); onRolled(); }} />
      ) : (
        <div className="stack">
          {popup && <ResultPopup heading={`${unit.name} rolled ${rolled} on ${table.name}`} items={[{ title: res.name, text: res.text }]} onClose={() => setPopup(false)} />}
          <div><b>{rolled}: {res.name}.</b> <span className="small">{res.text}</span>
            {irl && <> <button className="link-btn small" onClick={() => setRoll(null)}>change</button></>}</div>
          <div className="row gap wrap">
            {res.effect?.choice === 'mystery' ? (
              <>
                <button className="btn" onClick={() => apply({ status: 'injured' })}>Bacta tank</button>
                <button className="btn ghost" onClick={() => setRoll(null)}>Experimental treatment (re-roll)</button>
              </>
            ) : <button className="btn" onClick={() => apply()}>Apply</button>}
            <WotfReroll reroll={reroll} onUse={() => setRoll(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function PromotionRoll({ unit, squad, onApply, onRolled, reroll }) {
  const force = FORCE_UNITS.has(unit.type);
  const table = isHero(unit)
    ? (force ? FORCE_HERO_PROMOTION : HERO_PROMOTION)
    : (force ? FORCE_REGULAR_PROMOTION : REGULAR_PROMOTION);
  const [roll, setRoll] = useState(null);
  const [irl, setIrl] = useState(false);
  const [shift, setShift] = useState(0);
  const [popup, setPopup] = useState(false);
  const rolled = roll === null ? null : lookup(table, roll);
  const at = table.rows.indexOf(rolled);
  const res = rolled && table.rows[at + shift];
  const options = res ? promotionOptions(res, unit, squad) : null;
  // Regulars can't shift into Promotion to Hero.
  const allowed = i => i >= 0 && i < table.rows.length && (isHero(unit) || !table.rows[i].effect?.hero);
  const reset = () => { setRoll(null); setShift(0); };
  const spend = patch => (shift ? { ...patch, exp: unit.exp - Math.abs(shift) } : patch);

  return (
    <div className="sub">
      <div className="row between">
        <strong>{unit.name}</strong>
        <span className="muted small">{unit.exp} EXP · {table.name}</span>
      </div>
      {rolled === null ? (
        <RollInput dice={table.dice} min={table.min} max={table.max} onRoll={(n, typed) => { setRoll(n); setIrl(typed); setPopup(true); onRolled(); }} />
      ) : (
        <div className="stack">
          {popup && <ResultPopup heading={`${unit.name} rolled ${roll} on ${table.name}`} items={[{ title: rolled.name, text: rolled.text }]} onClose={() => setPopup(false)} />}
          <div className="small muted">Rolled {roll}{shift ? `, shifted ${Math.abs(shift)} ${shift > 0 ? 'up' : 'down'} for ${Math.abs(shift)} EXP` : ''}
            {irl && <> <button className="link-btn small" onClick={reset}>change</button></>}</div>
          <div><b>{res.min}-{res.max}: {res.name}.</b> <span className="small">{res.text}</span></div>
          <ExpShift shift={shift} max={maxShift(unit)} canUp={allowed(at + shift + 1)} canDown={allowed(at + shift - 1)} onShift={setShift} />
          {options === null && <div className="warn small">Can't take this result here, so re-roll.</div>}
          <div className="row gap wrap">
            {options?.map(([label, patch]) => <button key={label} className="btn" onClick={() => onApply(spend(patch))}>{label}</button>)}
            {options === null && <button className="btn ghost" onClick={reset}>Re-roll</button>}
            <WotfReroll reroll={reroll} onUse={reset} />
          </div>
        </div>
      )}
    </div>
  );
}
