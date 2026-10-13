import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SCENARIO_CHOOSING, SCENARIOS } from '../data/campaign.js';

const LIST = SCENARIOS.filter(s => s.roll);
const textOf = s => [s.name, s.intro, s.needs, s.note, s.bonus, ...(s.rules ?? []).flat()].join(' ').toLowerCase();

export default function ScenariosPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(() => new Set());
  const q = query.trim().toLowerCase();

  const shown = LIST.filter(s => !q || textOf(s).includes(q));
  const showChoosing = !q || SCENARIO_CHOOSING.join(' ').toLowerCase().includes(q);

  const isOpen = id => q || open.has(id);
  const toggle = id => setOpen(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="stack">
      <Link to="/rules" className="small">← Rules</Link>
      <input type="search" placeholder="Search scenarios, e.g. crate" value={query} onChange={e => setQuery(e.target.value)} />

      {showChoosing && (
        <div className="card">
          <button className="section-head" onClick={() => toggle('choosing')} aria-expanded={!!isOpen('choosing')}>
            <div>
              <h2>Choosing a Scenario</h2>
              <div className="muted small">Mission prep step 3</div>
            </div>
            <span className="muted">{isOpen('choosing') ? '−' : '+'}</span>
          </button>
          {isOpen('choosing') && (
            <div className="trait-list">
              {SCENARIO_CHOOSING.map(t => <div key={t} className="trait small">{t}</div>)}
            </div>
          )}
        </div>
      )}

      {shown.map(s => (
        <div key={s.roll} className="card">
          <button className="section-head" onClick={() => toggle(s.roll)} aria-expanded={!!isOpen(s.roll)}>
            <div>
              <h2>{s.roll}. {s.name}</h2>
              {s.needs && <div className="muted small">Needs: {s.needs}</div>}
            </div>
            <span className="muted">{isOpen(s.roll) ? '−' : '+'}</span>
          </button>
          {isOpen(s.roll) && (
            <div className="trait-list">
              {s.intro && <div className="trait small muted"><i>{s.intro}</i></div>}
              <div className="trait">
                {s.rules.map((r, i) => Array.isArray(r)
                  ? <ul key={i} className="small scenario-list">{r.map(li => <li key={li}>{li}</li>)}</ul>
                  : <p key={i} className="small scenario-para">{r}</p>)}
                {s.note && <div className="warn small">{s.note}</div>}
              </div>
              <div className="trait">
                <b className="small">Bonus objective EXP</b>
                <div className="small amended">{s.bonus}</div>
              </div>
            </div>
          )}
        </div>
      ))}

      {!shown.length && !showChoosing && <p className="muted">No scenarios match "{query}".</p>}
    </div>
  );
}
