import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { factions, forceUser, mercenaries } from '../data/factions.js';
import RuleLinks from '../components/RuleLinks.jsx';

const ALL = [...factions, forceUser, mercenaries];

const unitId = name => `unit-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

// One branch of the promotion tree: the unit's box, then the units it can be promoted to below it.
function PromoNode({ unit, byName, onPick }) {
  const next = unit.promotesTo.map(t => byName[t]).filter(Boolean);
  return (
    <li>
      <span className="promo-link" aria-hidden="true" />
      <button type="button" className="card promo-node" onClick={() => onPick(unit.name)}>
        <span className="promo-name">{unit.name}</span>
        <span className="muted small">{unit.pts} pts</span>
      </button>
      {next.length > 0 && (
        <ul>{next.map(n => <PromoNode key={n.name} unit={n} byName={byName} onPick={onPick} />)}</ul>
      )}
    </li>
  );
}

function PromotionTree({ faction, onPick }) {
  const byName = Object.fromEntries(faction.units.map(u => [u.name, u]));
  const promoted = new Set(faction.units.flatMap(u => u.promotesTo));
  const roots = faction.units.filter(u => !promoted.has(u.name));
  if (promoted.size === 0) return null;
  return (
    <div className="card">
      <div className="nav-heading">Promotion paths</div>
      <div className="muted small">Tap a unit to see its profile.</div>
      <div className="promo-trees">
        {roots.map(r => (
          <ul key={r.name} className="promo-tree"><PromoNode unit={r} byName={byName} onPick={onPick} /></ul>
        ))}
      </div>
    </div>
  );
}

export default function FactionsPage() {
  const { id } = useParams();
  const faction = ALL.find(f => f.id === id);
  const [flash, setFlash] = useState(null);
  const showUnit = name => {
    document.getElementById(unitId(name))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setFlash(name);
    setTimeout(() => setFlash(f => (f === name ? null : f)), 1600);
  };
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
      <PromotionTree faction={faction} onPick={showUnit} />
      <div className="stack">
        {faction.units.map(u => (
          <div key={u.name} id={unitId(u.name)} className={`card unit-card${flash === u.name ? ' flash' : ''}`}>
            <div className="row between"><strong>{u.name}</strong><span className="pill">{u.pts} pts</span></div>
            <div className="statline">
              <span>W <b>{u.w}</b></span><span>CC <b>d{u.cc}</b></span><span>S <b>d{u.s}</b></span><span>Eq <b>{u.eq}</b></span>
            </div>
            {u.traits.length > 0 && <RuleLinks label="Traits" kind="trait" names={u.traits} />}
            <RuleLinks label="Equipment" kind="gear" names={u.equipment} />
          </div>
        ))}
      </div>
    </>
  );
}
