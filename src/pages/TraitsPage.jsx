import { useMemo, useState } from 'react';
import { factions, forceUser, mercenaries } from '../data/factions.js';
import { RulePopup, RuleText } from '../components/RuleLinks.jsx';
import { LIGHTSABER_FORMS, TRAIT_TABLES, findTrait } from '../data/traits.js';
import { formLevelRule } from '../ruleLookup.js';

const SOURCES = {
  SF: 'Star Wars: Special Forces',
  JS: 'New Jedi/Sith Progression',
  GH: 'Galactic Heroes rulebook',
};

// Traits that appear on unit profiles but have no description in Alex's docs.
const UNDESCRIBED = [...new Set(
  [...factions, forceUser, mercenaries].flatMap(f => f.units.flatMap(u => u.traits)),
)].filter(n => !findTrait(n)).sort();

const matches = (q, ...fields) => fields.some(f => f && f.toLowerCase().includes(q));

export default function TraitsPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(() => new Set());
  const [formLevel, setFormLevel] = useState(null);
  const q = query.trim().toLowerCase();

  const tables = useMemo(() => TRAIT_TABLES.map(tb => ({
    ...tb,
    shown: tb.traits.filter(tr => !q || matches(q, tr.name, tr.text, tr.amended)),
  })), [q]);
  const forms = LIGHTSABER_FORMS.filter(f => !q || matches(q, f.name, f.text, f.levels.flat().join(' ')));
  const undescribed = UNDESCRIBED.filter(n => !q || n.toLowerCase().includes(q));

  const isOpen = id => q || open.has(id);
  const toggle = id => setOpen(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="stack">
      <input type="search" placeholder="Search traits, e.g. shock" value={query} onChange={e => setQuery(e.target.value)} />

      {tables.filter(tb => tb.shown.length).map(tb => (
        <div key={tb.id} className="card">
          <button className="section-head" onClick={() => toggle(tb.id)} aria-expanded={!!isOpen(tb.id)}>
            <div>
              <h2>{tb.name}</h2>
              <div className="muted small">{tb.dice ? `${tb.dice} · ` : ''}{SOURCES[tb.source]}</div>
            </div>
            <span className="muted">{isOpen(tb.id) ? '−' : '+'}</span>
          </button>
          {isOpen(tb.id) && (
            <div className="trait-list">
              {tb.note && <div className="warn small">{tb.note}</div>}
              {tb.shown.map(tr => (
                <div key={tb.id + tr.roll + tr.name} className="trait">
                  <div className="row between">
                    <span>{tr.roll && <span className="roll">{tr.roll}</span>}<b>{tr.name}</b></span>
                    {tr.pts !== null && <span className="pill">{tr.pts > 0 ? `+${tr.pts}` : tr.pts} pts</span>}
                  </div>
                  {tr.text && <div className="small"><RuleText text={tr.text} /></div>}
                  {tr.amended && <div className="amended small">{tr.amended}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {forms.length > 0 && (
        <div className="card">
          <button className="section-head" onClick={() => toggle('forms')} aria-expanded={!!isOpen('forms')}>
            <div>
              <h2>Lightsaber Forms</h2>
              <div className="muted small">Numbered 1-8 · {SOURCES.JS}</div>
            </div>
            <span className="muted">{isOpen('forms') ? '−' : '+'}</span>
          </button>
          {isOpen('forms') && (
            <div className="trait-list">
              <div className="muted small">Each level advanced in a form grants that level's traits (points in brackets).</div>
              {forms.map(f => (
                <div key={f.name} className="trait">
                  <div><span className="roll">{f.roll}</span><b>{f.name}</b></div>
                  <div className="small muted">{f.text}</div>
                  <div className="levels">
                    {f.levels.map((lv, i) => (
                      <button key={i} type="button" className="level" onClick={() => setFormLevel(formLevelRule(f, i))}><span className="muted small">{'I'.repeat(i + 1)}</span><span className="small rule-link">{lv.join(' + ')}</span></button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {undescribed.length > 0 && (
        <div className="card">
          <button className="section-head" onClick={() => toggle('other')} aria-expanded={!!isOpen('other')}>
            <div>
              <h2>Other unit traits</h2>
              <div className="muted small">On unit profiles, not described in your docs</div>
            </div>
            <span className="muted">{isOpen('other') ? '−' : '+'}</span>
          </button>
          {isOpen('other') && (
            <div className="trait-list">
              <div className="small muted">These are defined in the Galactic Heroes rulebook (or not yet written up).</div>
              <div className="small">{undescribed.join(', ')}</div>
            </div>
          )}
        </div>
      )}

      {formLevel && <RulePopup rule={formLevel} onClose={() => setFormLevel(null)} />}

      {!tables.some(tb => tb.shown.length) && !forms.length && !undescribed.length && <p className="muted">No traits match "{query}".</p>}
    </div>
  );
}
