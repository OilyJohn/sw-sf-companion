import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import SignInGate from '../components/SignInGate.jsx';
import { MAX_FORCE_WIELDERS, MAX_HEROES } from '../data/factions.js';
import { FORCE_UNITS, ROLE_BONUS, findProfile, getFaction } from '../data/rules.js';
import { deleteSquad, newUnit, saveSquad, squadPoints, unitStats, useSquad } from '../squads.js';

export default function SquadPage() {
  return <SignInGate what="this squad"><Squad /></SignInGate>;
}

const isHero = u => u.role !== 'regular';
const isLost = u => u.status === 'dead';

function Squad() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const squad = useSquad(id);
  const [adding, setAdding] = useState(false);

  if (squad === undefined) return <p className="muted">Loading…</p>;
  if (squad === null) return <p>Squad not found. <Link to="/squads">Back to squads</Link></p>;

  const faction = getFaction(squad.faction);
  const mine = squad.ownerId === user.uid;
  const active = squad.units.filter(u => !isLost(u));
  const heroes = active.filter(isHero).length;
  const forceUsers = active.filter(u => FORCE_UNITS.has(u.type)).length;
  const hasLeader = active.some(u => u.role === 'leader');

  const save = patch => saveSquad(squad.id, patch);
  const updateUnit = (unitId, patch) =>
    save({ units: squad.units.map(u => (u.id === unitId ? { ...u, ...patch } : u)) });

  // Credits: in the starting phase, each empty equipment slot refunds 1 credit.
  function setEmptySlots(unit, n) {
    const delta = n - unit.emptySlots;
    save({
      credits: squad.credits + delta,
      units: squad.units.map(u => (u.id === unit.id ? { ...u, emptySlots: n } : u)),
    });
  }

  function buy(type, name) {
    const cost = faction.reinforcements[type];
    save({ credits: squad.credits - cost, units: [...squad.units, newUnit(findProfile(squad.faction, type), name)] });
    setAdding(false);
  }

  function remove(unit) {
    if (!confirm(`Remove ${unit.name}?`)) return;
    // Before the first mission a removal is an undo, so refund the purchase.
    const refund = squad.started ? 0 : (faction.reinforcements[unit.type] ?? 0) - unit.emptySlots;
    save({ credits: squad.credits + refund, units: squad.units.filter(u => u.id !== unit.id) });
  }

  function setRole(unit, role) {
    if (role === 'leader' && hasLeader && unit.role !== 'leader') return alert('Your squad already has a leader.');
    if (role !== 'regular' && !isHero(unit) && heroes >= MAX_HEROES) return alert(`A squad can have at most ${MAX_HEROES} heroes.`);
    updateUnit(unit.id, { role, pending: role === 'regular' ? [] : [ROLE_BONUS[role].pending] });
  }

  const warnings = [];
  if (squad.credits < 0) warnings.push(`Over budget by ${-squad.credits} credits.`);
  if (heroes > MAX_HEROES) warnings.push(`More than ${MAX_HEROES} heroes.`);
  if (forceUsers > MAX_FORCE_WIELDERS) warnings.push(`More than ${MAX_FORCE_WIELDERS} force wielders.`);
  if (active.length && !hasLeader) warnings.push('Choose a leader.');
  if (active.length && !active.some(u => u.role === 'officer') && !squad.started) warnings.push('Choose an officer.');

  return (
    <>
      <div className="card">
        <div className="row between">
          <h2>{squad.name}</h2>
          <span className="pill">{squadPoints(squad)} pts</span>
        </div>
        <div className="muted small">{faction?.name}</div>
        <div className="stats">
          <Stat label="Credits" value={squad.credits} />
          <Stat label="Heroes" value={`${heroes}/${MAX_HEROES}`} />
          <Stat label="Force" value={`${forceUsers}/${MAX_FORCE_WIELDERS}`} />
          <Stat label="Units" value={active.length} />
        </div>
        {warnings.map(w => <div key={w} className="warn small">{w}</div>)}
        {!squad.started && mine && (
          <p className="muted small">
            Starting company: empty equipment slots refund 1 credit each until you mark the squad as started.{' '}
            <button className="link-btn" onClick={() => confirm('Lock in your starting company?') && save({ started: true })}>Mark as started</button>
          </p>
        )}
      </div>

      <div className="stack">
        {squad.units.map(unit => (
          <UnitCard key={unit.id} unit={unit} squad={squad} mine={mine}
            onChange={patch => updateUnit(unit.id, patch)}
            onRole={role => setRole(unit, role)}
            onEmpty={n => setEmptySlots(unit, n)}
            onRemove={() => remove(unit)} />
        ))}
      </div>

      {mine && (adding
        ? <BuyUnit faction={faction} credits={squad.credits} forceFull={forceUsers >= MAX_FORCE_WIELDERS} onBuy={buy} onCancel={() => setAdding(false)} />
        : <button className="btn wide" onClick={() => setAdding(true)}>+ Add unit</button>)}

      {mine && (
        <button className="btn danger ghost wide" onClick={async () => {
          if (confirm(`Delete ${squad.name}? This can't be undone.`)) { await deleteSquad(squad.id); navigate('/squads'); }
        }}>Delete squad</button>
      )}
    </>
  );
}

function Stat({ label, value }) {
  return <div className="stat"><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>;
}

function UnitCard({ unit, squad, mine, onChange, onRole, onEmpty, onRemove }) {
  const [open, setOpen] = useState(false);
  const st = unitStats(unit, squad.faction);
  if (!st) return <div className="card warn">Unknown unit type: {unit.type}</div>;

  return (
    <div className={`card unit ${unit.status !== 'ready' ? 'dim' : ''}`}>
      <button className="unit-head" onClick={() => setOpen(o => !o)}>
        <div>
          <strong>{unit.name}</strong>
          {unit.role !== 'regular' && <span className={`tag ${unit.role}`}>{unit.role}</span>}
          {unit.status !== 'ready' && <span className="tag">{unit.status}</span>}
          <div className="muted small">{unit.type}</div>
        </div>
        <span className="pill">{st.points} pts</span>
      </button>
      <div className="statline">
        <span>W <b>{st.wounds}</b></span>
        <span>CC <b>d{st.cc}</b></span>
        <span>S <b>d{st.s}</b></span>
        <span>Eq <b>{st.eqSlots - unit.emptySlots}/{st.eqSlots}</b></span>
        <span>EXP <b>{unit.exp}</b></span>
      </div>
      {st.traits.length > 0 && <div className="small"><span className="muted">Traits: </span>{st.traits.join(', ')}</div>}
      {unit.pending?.length > 0 && unit.pending.map(p => <div key={p} className="warn small">To do: {p}</div>)}

      {open && (
        <div className="stack unit-body">
          <div className="small"><span className="muted">Can equip: </span>{st.profile.equipment.join(', ') || 'none'}</div>
          {mine && <>
            <label>Name<input value={unit.name} onChange={e => onChange({ name: e.target.value })} /></label>
            <label>Model notes<input value={unit.model} placeholder="e.g. red pauldron" onChange={e => onChange({ model: e.target.value })} /></label>
            <label>Role
              <select value={unit.role} onChange={e => onRole(e.target.value)}>
                <option value="regular">Regular</option>
                <option value="officer">Officer (hero)</option>
                <option value="leader">Leader (hero)</option>
              </select>
            </label>
            {!squad.started && (
              <label>Empty equipment slots (1 credit back each)
                <input type="number" min="0" max={st.eqSlots} value={unit.emptySlots}
                  onChange={e => onEmpty(Math.max(0, Math.min(st.eqSlots, Number(e.target.value) || 0)))} />
              </label>
            )}
            <label>Notes<textarea rows="2" value={unit.notes} onChange={e => onChange({ notes: e.target.value })} /></label>
            <button className="btn danger ghost" onClick={onRemove}>Remove unit</button>
          </>}
        </div>
      )}
    </div>
  );
}

function BuyUnit({ faction, credits, forceFull, onBuy, onCancel }) {
  const [type, setType] = useState(Object.keys(faction.reinforcements)[0]);
  const [name, setName] = useState('');
  const cost = faction.reinforcements[type];
  const blocked = FORCE_UNITS.has(type) && forceFull;

  return (
    <form className="card stack" onSubmit={e => { e.preventDefault(); onBuy(type, name.trim() || type); }}>
      <h2>Add unit</h2>
      <label>Unit
        <select value={type} onChange={e => setType(e.target.value)}>
          {Object.entries(faction.reinforcements).map(([t, c]) => <option key={t} value={t}>{t} ({c} credits)</option>)}
        </select>
      </label>
      <label>Name<input value={name} placeholder={type} onChange={e => setName(e.target.value)} /></label>
      <p className="muted small">Costs {cost} credits, leaving {credits - cost}.</p>
      {blocked && <p className="warn small">Your squad already has {MAX_FORCE_WIELDERS} force wielders.</p>}
      <div className="row gap">
        <button className="btn" type="submit" disabled={blocked}>Add</button>
        <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
