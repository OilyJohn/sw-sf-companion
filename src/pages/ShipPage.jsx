import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResultPopup from '../components/ResultPopup.jsx';
import RollInput from '../components/RollInput.jsx';
import SignInGate from '../components/SignInGate.jsx';
import {
  EXP_PER_PROMOTION, FORCE_HERO_PROMOTION, FORCE_REGULAR_PROMOTION, HERO_INJURY, HERO_PROMOTION,
  REGULAR_PROMOTION, RESULTS, WARRIOR_INJURY, lookup,
} from '../data/campaign.js';
import TodoTask from '../components/TodoTask.jsx';
import { FORCE_UNITS } from '../data/rules.js';
import { promotionOptions } from '../promotions.js';
import { saveSquad, useSquad } from '../squads.js';

export default function ShipPage() {
  return <SignInGate what="this squad"><Ship /></SignInGate>;
}

const isHero = u => u.role !== 'regular';
const promotionsDue = u =>
  ['dead', 'mia'].includes(u.status) ? 0 : Math.floor(u.exp / EXP_PER_PROMOTION) - (u.promotions ?? 0);

function Ship() {
  const { id } = useParams();
  const squad = useSquad(id);
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
          <InjuryRoll key={u.id} unit={u} onApply={(patch, credits = 0) => updateUnit(u.id, patch, {
            credits: squad.credits + credits,
            backToShip: { ...ship, injuries: ship.injuries.filter(x => x !== u.id) },
          })} />
        ))}
      </Section>

      <Section n={2} title="Promotions" done={!promos.length}>
        {promos.length === 0 && <p className="muted small">Nobody has a full EXP box ({EXP_PER_PROMOTION} EXP) waiting.</p>}
        {promos.map(u => (
          <PromotionRoll key={u.id} unit={u} squad={squad}
            onApply={patch => updateUnit(u.id, { ...patch, promotions: (u.promotions ?? 0) + 1 })} />
        ))}
        {promos.length > 0 && (
          <p className="muted small">
            Spending excess EXP to shift a result? Enter the adjusted roll, then lower the unit's EXP on the squad page.
            Regular units can shift by 1 at most and can't reach Promotion to Hero this way.
          </p>
        )}
      </Section>

      <Section n={3} title="To do" done={!todos.length}>
        {todos.length === 0 && <p className="muted small">Nothing outstanding.</p>}
        {todos.map(u => u.pending.map((p, i) => (
          <TodoTask key={u.id + i + p} unit={u} squad={squad} text={p}
            onDone={patch => {
              // Drop this to-do; a result can also add new ones (patch.pending holds only the new ones).
              const rest = u.pending.filter((_, j) => j !== i);
              updateUnit(u.id, { ...patch, pending: [...rest, ...(patch.pending ?? [])] });
            }} />
        )))}
      </Section>

      <Section n={4} title="Spend credits">
        <p className="small">You have <b>{squad.credits}</b> credits. Equipment costs 1 credit per slot for regulars, 2 for heroes.
          Reinforcements and kit are on the <Link to={`/squads/${squad.id}`}>squad page</Link>.</p>
      </Section>

      {ship && (
        <button className="btn wide" disabled={!allDone} onClick={() => saveSquad(squad.id, { backToShip: null })}>
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

function InjuryRoll({ unit, onApply }) {
  const table = isHero(unit) ? HERO_INJURY : WARRIOR_INJURY;
  const [roll, setRoll] = useState(null);
  const [popup, setPopup] = useState(false);
  const res = roll === null ? null : lookup(table, roll);

  function apply(effect = res.effect ?? {}) {
    const patch = {};
    if (effect.status) patch.status = effect.status;
    if (effect.exp) patch.exp = unit.exp + effect.exp;
    if (effect.todo) patch.pending = [...(unit.pending ?? []), effect.todo];
    onApply(patch, effect.credits ?? 0);
  }

  return (
    <div className="sub">
      <div className="row between"><strong>{unit.name}</strong><span className="muted small">{table.name} ({table.dice})</span></div>
      {res === null ? (
        <RollInput dice={table.dice} min={table.min} max={table.max} onRoll={n => { setRoll(n); setPopup(true); }} />
      ) : (
        <div className="stack">
          {popup && <ResultPopup heading={`${unit.name} rolled ${roll} on ${table.name}`} items={[{ title: res.name, text: res.text }]} onClose={() => setPopup(false)} />}
          <div><b>{roll}: {res.name}.</b> <span className="small">{res.text}</span></div>
          {res.effect?.choice === 'mystery' ? (
            <div className="row gap">
              <button className="btn" onClick={() => apply({ status: 'injured' })}>Bacta tank</button>
              <button className="btn ghost" onClick={() => setRoll(null)}>Experimental treatment (re-roll)</button>
            </div>
          ) : (
            <div className="row gap">
              <button className="btn" onClick={() => apply()}>Apply</button>
              <button className="btn ghost" onClick={() => setRoll(null)}>Re-roll</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PromotionRoll({ unit, squad, onApply }) {
  const force = FORCE_UNITS.has(unit.type);
  const table = isHero(unit)
    ? (force ? FORCE_HERO_PROMOTION : HERO_PROMOTION)
    : (force ? FORCE_REGULAR_PROMOTION : REGULAR_PROMOTION);
  const [roll, setRoll] = useState(null);
  const res = roll === null ? null : lookup(table, roll);
  const options = res ? promotionOptions(res, unit, squad) : null;

  return (
    <div className="sub">
      <div className="row between">
        <strong>{unit.name}</strong>
        <span className="muted small">{unit.exp} EXP · {table.name}</span>
      </div>
      {res === null ? (
        <RollInput dice={table.dice} min={table.min} max={table.max} onRoll={setRoll} />
      ) : (
        <div className="stack">
          <div><b>{roll}: {res.name}.</b> <span className="small">{res.text}</span></div>
          {options === null && <div className="warn small">Can't take this result here, so re-roll.</div>}
          <div className="row gap wrap">
            {options?.map(([label, patch]) => <button key={label} className="btn" onClick={() => onApply(patch)}>{label}</button>)}
            <button className="btn ghost" onClick={() => setRoll(null)}>Re-roll</button>
          </div>
        </div>
      )}
    </div>
  );
}
