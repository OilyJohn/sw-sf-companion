import { useState } from 'react';
import { Link } from 'react-router-dom';
import RuleLinks from '../components/RuleLinks.jsx';
import { rangeOf } from '../data/campaignRules.js';

const textOf = (...fields) => fields.flat(2).filter(Boolean).join(' ').toLowerCase();
// Rows that send you to a trait table get a link to the Traits page.
const mentionsTraits = r => /trait/i.test(`${r.name} ${r.text}`);

// The Promotions or Injuries rules page: how the tables are used, then each table.
// page: PROMOTIONS or INJURIES from campaignRules.js.
export default function CampaignTablesPage({ page }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(() => new Set());
  const q = query.trim().toLowerCase();

  const rules = page.rules.filter(it => !q || textOf(it.title, it.text, it.list).includes(q));
  const tables = page.tables.map(tb => ({
    ...tb,
    shown: tb.rows.filter(r => !q || textOf(tb.name, rangeOf(r), r.name, r.text, r.traits).includes(q)),
  })).filter(tb => tb.shown.length);

  const isOpen = id => q || open.has(id);
  const toggle = id => setOpen(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="stack">
      <input type="search" placeholder={`Search ${page.label.toLowerCase()}, e.g. ${page.tables[0].rows[1].name.toLowerCase()}`} value={query} onChange={e => setQuery(e.target.value)} />

      {rules.length > 0 && (
        <div className="card">
          <button className="section-head" onClick={() => toggle('rules')} aria-expanded={!!isOpen('rules')}>
            <div>
              <h2>How {page.label} Work</h2>
              <div className="muted small">Back to the Ship</div>
            </div>
            <span className="muted">{isOpen('rules') ? '−' : '+'}</span>
          </button>
          {isOpen('rules') && (
            <div className="trait-list">
              {rules.map(it => (
                <div key={it.title} className="trait">
                  <b>{it.title}</b>
                  {it.text && <p className="small scenario-para">{it.text}</p>}
                  {it.list && <ul className="small scenario-list">{it.list.map(li => <li key={li}>{li}</li>)}</ul>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tables.map(tb => (
        <div key={tb.name} className="card">
          <button className="section-head" onClick={() => toggle(tb.name)} aria-expanded={!!isOpen(tb.name)}>
            <div>
              <h2>{tb.name}</h2>
              <div className="muted small">{tb.dice}{tb.dice === '2D10' ? ' (tens die + units die, 0-99)' : ''}</div>
            </div>
            <span className="muted">{isOpen(tb.name) ? '−' : '+'}</span>
          </button>
          {isOpen(tb.name) && (
            <div className="trait-list">
              {tb.shown.map(r => (
                <div key={r.min} className="trait">
                  <span><span className="roll">{rangeOf(r)}</span><b>{r.name}</b></span>
                  <div className="small">{r.text}</div>
                  {r.traits && <RuleLinks label="Trait" kind="trait" names={r.traits} />}
                  {mentionsTraits(r) && <Link className="small" to="/rules/traits">Open Traits</Link>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {!rules.length && !tables.length && <p className="muted">Nothing matches "{query}".</p>}
    </div>
  );
}
