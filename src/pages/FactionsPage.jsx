import { Link, useParams } from 'react-router-dom';
import { factions, forceUser, mercenaries } from '../data/factions.js';

const ALL = [...factions, forceUser, mercenaries];

export default function FactionsPage() {
  const { id } = useParams();
  const faction = ALL.find(f => f.id === id);
  if (!faction) {
    return (
      <div className="stack">
        {ALL.map(f => (
          <Link key={f.id} to={`/factions/${f.id}`} className="card link-card">
            <strong>{f.name}</strong>
            <div className="muted small">{f.units.length} unit profiles{f.pool ? ' · shared pool' : ''}</div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <>
      <Link to="/factions" className="small">← All factions</Link>
      <h2>{faction.name}</h2>
      {faction.reinforcements && (
        <div className="card">
          <div className="nav-heading">Reinforcements</div>
          {Object.entries(faction.reinforcements).map(([t, c]) => <div key={t} className="row between small"><span>{t}</span><span>{c} credits</span></div>)}
        </div>
      )}
      {faction.aliases && (
        <div className="card small">
          {Object.entries(faction.aliases).map(([a, b]) => <div key={a}>{a} = {b}</div>)}
        </div>
      )}
      <div className="stack">
        {faction.units.map(u => (
          <div key={u.name} className="card">
            <div className="row between"><strong>{u.name}</strong><span className="pill">{u.pts} pts</span></div>
            <div className="statline">
              <span>W <b>{u.w}</b></span><span>CC <b>d{u.cc}</b></span><span>S <b>d{u.s}</b></span><span>Eq <b>{u.eq}</b></span>
            </div>
            {u.traits.length > 0 && <div className="small"><span className="muted">Traits: </span>{u.traits.join(', ')}</div>}
            <div className="small"><span className="muted">Equipment: </span>{u.equipment.join(', ') || 'none'}</div>
            {u.promotesTo.length > 0 && <div className="small"><span className="muted">Promotes to: </span>{u.promotesTo.join(' or ')}</div>}
          </div>
        ))}
      </div>
    </>
  );
}
