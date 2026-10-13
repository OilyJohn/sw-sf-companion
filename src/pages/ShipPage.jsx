import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RollInput from '../components/RollInput.jsx';
import SignInGate from '../components/SignInGate.jsx';
import {
  EXP_PER_PROMOTION, FORCE_HERO_PROMOTION, FORCE_REGULAR_PROMOTION, HERO_INJURY, HERO_PROMOTION,
  REGULAR_PROMOTION, RESULTS, WARRIOR_INJURY, lookup,
} from '../data/campaign.js';
import { MAX_HEROES } from '../data/factions.js';
import { FORCE_UNITS, ROLE_BONUS } from '../data/rules.js';
import { saveSquad, unitStats, useSquad } from '../squads.js';

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
          <label key={u.id + i} className="check">
            <input type="checkbox" onChange={() => updateUnit(u.id, { pending: u.pending.filter((_, j) => j !== i) })} />
            <span><b>{u.name}</b>: {p}</span>
          </label>
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
        <RollInput dice={table.dice} min={table.min} max={table.max} onRoll={setRoll} />
      ) : (
        <div className="stack">
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
  const st = unitStats(unit, squad.faction);
  const heroes = squad.units.filter(u => isHero(u) && !['dead'].includes(u.status)).length;
  const e = res?.effect ?? {};
  const todo = t => ({ pending: [...(unit.pending ?? []), t] });

  let options = null;
  if (res) {
    if (e.eqSlot) options = [['Apply', { bonusEqSlots: unit.bonusEqSlots + 1 }]];
    else if (e.wound) options = st.wounds >= 3 ? null : [['Apply', { bonusWounds: unit.bonusWounds + 1 }]];
    else if (e.die) {
      options = [];
      if (st.cc < 12) options.push(['Close combat +2', { dieSteps: { ...unit.dieSteps, cc: unit.dieSteps.cc + 1 } }]);
      if (st.s < 12) options.push(['Shooting +2', { dieSteps: { ...unit.dieSteps, s: unit.dieSteps.s + 1 } }]);
      if (!options.length) options = null;
    } else if (e.promote) {
      options = st.profile.promotesTo.length
        ? st.profile.promotesTo.map(t => [`Promote to ${t}`, { type: t }])
        : [['Not eligible: take nothing', {}]];
    } else if (e.hero) {
      options = heroes >= MAX_HEROES ? null
        : [['Make officer', { role: 'officer', pending: [...(unit.pending ?? []), ROLE_BONUS.officer.pending] }]];
    } else if (e.todo) options = [['Add to to-do list', todo(e.todo)]];
    else options = [['OK', {}]];
  }

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
