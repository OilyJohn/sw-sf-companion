import { useState } from 'react';
import { Link } from 'react-router-dom';
import SignInGate from '../components/SignInGate.jsx';
import { useAuth } from '../auth.jsx';
import { adminShip, useIsAdmin } from '../admin.js';
import { promotionsDue } from '../promotions.js';
import { getFaction } from '../data/rules.js';
import { saveSquad, useAllSquads } from '../squads.js';

export default function AdminPage() {
  return <SignInGate what="the admin console"><Admin /></SignInGate>;
}

const STATUSES = [['ready', 'Ready'], ['injured', 'Injured (misses next mission)'], ['mia', 'M.I.A.'], ['dead', 'Dead']];

function Admin() {
  const { user } = useAuth();
  const admin = useIsAdmin(user.uid);
  const squads = useAllSquads();
  const [id, setId] = useState('');
  if (!admin) return <p className="muted">Only admins can use this page.</p>;
  if (squads === null) return <p className="muted">Loading squads…</p>;

  const sorted = [...squads].sort((a, b) => (a.ownerName ?? '').localeCompare(b.ownerName ?? '') || a.name.localeCompare(b.name));
  const squad = squads.find(s => s.id === id);

  return (
    <div className="stack">
      <div className="card stack">
        <p className="small">Fix a squad after a battle: EXP, status, or an injury roll someone missed.</p>
        <select value={id} onChange={e => setId(e.target.value)}>
          <option value="">Choose a squad…</option>
          {sorted.map(s => <option key={s.id} value={s.id}>{s.name} ({s.ownerName || 'Unknown player'})</option>)}
        </select>
      </div>
      {squad && <SquadFixes key={squad.id} squad={squad} />}
    </div>
  );
}

function SquadFixes({ squad }) {
  const ship = squad.backToShip;
  const inBattle = !!squad.battle;
  const units = squad.units.filter(u => !u.temp);

  // A full EXP box or an injury roll is dealt with on Back to the Ship, so open it if it isn't.
  function updateUnit(uid, patch, injury = false) {
    const next = squad.units.map(u => (u.id === uid ? { ...u, ...patch } : u));
    const unit = next.find(u => u.id === uid);
    const extra = {};
    if (injury) {
      const s = adminShip(ship);
      extra.backToShip = { ...s, injuries: [...s.injuries, uid] };
    } else if (!ship && !inBattle && promotionsDue(unit) > 0) {
      extra.backToShip = adminShip(ship);
    }
    return saveSquad(squad.id, { units: next, ...extra });
  }

  return (
    <div className="card stack">
      <div className="row between">
        <h2>{squad.name}</h2>
        <Link className="small" to={`/squads/${squad.id}`}>Squad page</Link>
      </div>
      <div className="muted small">{[getFaction(squad.faction)?.name, squad.ownerName].filter(Boolean).join(' · ')}</div>
      {inBattle && <div className="warn small">This squad is in a battle. Injury rolls can be added once it ends.</div>}
      {ship && <div className="small">Back to the Ship is open. <Link to={`/squads/${squad.id}/ship`}>See its list</Link></div>}
      {units.map(u => (
        <UnitFixes key={u.id} unit={u} pendingInjury={ship?.injuries?.includes(u.id)} inBattle={inBattle}
          onChange={(patch, injury) => updateUnit(u.id, patch, injury)} />
      ))}
    </div>
  );
}

function UnitFixes({ unit, pendingInjury, inBattle, onChange }) {
  const due = promotionsDue(unit);
  return (
    <div className="sub">
      <div className="row between">
        <strong>{unit.name}</strong>
        <span className="muted small">{unit.type}</span>
      </div>
      <div className="counter">
        <span className="small">EXP (promotions taken: {unit.promotions ?? 0}{due > 0 ? `, ${due} due` : ''})</span>
        <div className="row gap">
          <button className="icon-btn step" aria-label={`Decrease ${unit.name} EXP`} onClick={() => onChange({ exp: Math.max(0, unit.exp - 1) })}>−</button>
          <b className="count">{unit.exp}</b>
          <button className="icon-btn step" aria-label={`Increase ${unit.name} EXP`} onClick={() => onChange({ exp: unit.exp + 1 })}>+</button>
        </div>
      </div>
      <label>Status
        <select value={unit.status} onChange={e => onChange({ status: e.target.value })}>
          {STATUSES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </label>
      {pendingInjury
        ? <div className="muted small">Injury roll waiting on Back to the Ship.</div>
        : unit.status !== 'dead' && (
          <button className="btn ghost" disabled={inBattle}
            onClick={() => confirm(`Add an injury roll for ${unit.name}? The owner rolls it on Back to the Ship.`) && onChange({}, true)}>
            Add injury roll
          </button>
        )}
    </div>
  );
}
