import { useState } from 'react';
import { GEAR_GROUPS, PROPERTIES } from '../data/weapons.js';
import { slotsOf } from '../data/equipment.js';

const textOf = it => [it.name, it.aliases, it.range, it.notes, it.wound, it.text, it.amended, it.tag, typeof it.gh === 'string' && it.gh].flat().filter(Boolean).join(' ').toLowerCase();
const slotLabel = name => `${slotsOf(name)} slot${slotsOf(name) === 1 ? '' : 's'}`;

function GearItem({ it }) {
  return (
    <div className="trait">
      <div className="row between">
        <b>{it.name}</b>
        <span className="row wrap">
          {it.wound === 'Stun' && <span className="pill warn">Stun</span>}
          <span className="pill">{slotLabel(it.name)}</span>
        </span>
      </div>
      {it.aliases && <div className="small muted">Also listed as {it.aliases.join(', ')}</div>}
      {it.range && (
        <div className="rule-table small">
          {it.range !== '-' && [<span key="rk" className="muted">Range</span>, <span key="rv">{it.range}</span>]}
          {it.notes && [<span key="k" className="muted">Notes</span>, <span key="v">{it.notes}</span>]}
          <span className="muted">Wound table</span><span>{it.wound}</span>
        </div>
      )}
      {!it.range && it.notes && <div className="small">{it.notes}</div>}
      {it.text && <div className="small">{it.text}</div>}
      {it.amended && <div className="amended small">{it.amended}</div>}
      {it.ref && <div className="muted small">{it.ref}</div>}
    </div>
  );
}

export default function WeaponsPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(() => new Set());
  const q = query.trim().toLowerCase();

  const groups = [
    ...GEAR_GROUPS.map(g => ({ ...g, render: it => <GearItem key={it.name} it={it} /> })),
    { id: 'properties', name: 'Weapon Properties', sub: 'Weapons doc and Galactic Heroes rulebook', items: PROPERTIES, render: it => (
      <div key={it.name} className="trait">
        <div className="row between">
          <b>{it.name}</b>
          {it.tag && <span className="pill warn">{it.tag}</span>}
        </div>
        <div className="small">{it.text}</div>
        {it.amended && <div className="amended small">{it.amended}</div>}
        {it.ref && <div className="muted small">{it.ref}</div>}
        {it.gh && <div className="gh-old">Old GH rule: {it.gh}</div>}
      </div>
    ) },
  ].map(g => ({ ...g, shown: g.items.filter(it => !q || g.name.toLowerCase().includes(q) || textOf(it).includes(q)) }))
    .filter(g => g.shown.length);

  const isOpen = id => q || open.has(id);
  const toggle = id => setOpen(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="stack">
      <input type="search" placeholder="Search weapons and gear, e.g. stun" value={query} onChange={e => setQuery(e.target.value)} />

      {groups.map(g => (
        <div key={g.id} className="card">
          <button className="section-head" onClick={() => toggle(g.id)} aria-expanded={!!isOpen(g.id)}>
            <div>
              <h2>{g.name}</h2>
              <div className="muted small">{g.sub}</div>
            </div>
            <span className="muted">{isOpen(g.id) ? '−' : '+'}</span>
          </button>
          {isOpen(g.id) && <div className="trait-list">{g.shown.map(g.render)}</div>}
        </div>
      ))}

      {!groups.length && <p className="muted">Nothing matches "{query}".</p>}
      <p className="muted small">Weapons come from your Weapons doc, with your Amendments taking priority. Armour, shields, spear, jet pack and the properties your doc only names are summaries of the Galactic Heroes 2nd Edition rulebook (GH page numbers as printed). Stun weapons use the Stun Wound Table.</p>
    </div>
  );
}
