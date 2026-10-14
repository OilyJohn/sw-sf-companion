import { useState } from 'react';
import { SECTIONS } from '../data/gameplayRules.js';

const textOf = it => [it.title, it.text, it.list, it.after, it.table, it.foot, it.amended, it.gh].flat(2).filter(Boolean).join(' ').toLowerCase();
const paras = t => (Array.isArray(t) ? t : t ? [t] : []);

function RuleItem({ it }) {
  return (
    <div className="trait">
      <div className="row between">
        <b>{it.title}</b>
        {it.amended && <span className="pill warn">Amended</span>}
      </div>
      {paras(it.text).map(p => <p key={p} className="small scenario-para">{p}</p>)}
      {it.list && <ul className="small scenario-list">{it.list.map(li => <li key={li}>{li}</li>)}</ul>}
      {paras(it.after).map(p => <p key={p} className="small scenario-para">{p}</p>)}
      {it.table && (
        <div className="rule-table small">
          {it.table.map(([k, v]) => [<span key={k} className="muted">{k}</span>, <span key={k + v}>{v}</span>])}
        </div>
      )}
      {it.foot && <div className="small muted"><i>{it.foot}</i></div>}
      {typeof it.amended === 'string' && <div className="amended small">{it.amended}</div>}
      {it.gh && <div className="gh-old">Old GH rule: {it.gh}</div>}
      {it.ref && <div className="muted small">{it.ref}</div>}
    </div>
  );
}

export default function RulesPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(() => new Set());
  const q = query.trim().toLowerCase();

  const sections = SECTIONS.map(s => ({
    ...s,
    shown: s.items.filter(it => !q || s.name.toLowerCase().includes(q) || textOf(it).includes(q)),
  })).filter(s => s.shown.length);

  const isOpen = id => q || open.has(id);
  const toggle = id => setOpen(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="stack">
      <input type="search" placeholder="Search rules, e.g. reload" value={query} onChange={e => setQuery(e.target.value)} />

      {sections.map(s => (
        <div key={s.id} className="card">
          <button className="section-head" onClick={() => toggle(s.id)} aria-expanded={!!isOpen(s.id)}>
            <div>
              <h2>{s.name}</h2>
              <div className="muted small">{s.sub}</div>
            </div>
            <span className="muted">{isOpen(s.id) ? '−' : '+'}</span>
          </button>
          {isOpen(s.id) && (
            <div className="trait-list">
              {s.shown.map(it => <RuleItem key={it.title} it={it} />)}
            </div>
          )}
        </div>
      ))}

      {!sections.length && <p className="muted">No rules match "{query}".</p>}
      <p className="muted small">Sections other than Quick Reference summarise the Galactic Heroes 2nd Edition rulebook (GH page numbers as printed), with your Amendments taking priority. Points marked Amended differ from GH.</p>
    </div>
  );
}
