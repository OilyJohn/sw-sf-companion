import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SCENARIO_CHOOSING, SCENARIOS } from '../data/campaign.js';
import { SECTIONS } from '../data/gameplayRules.js';
import { LIGHTSABER_FORMS, TRAIT_TABLES } from '../data/traits.js';
import { WOTF_BONUSES } from '../data/willOfTheForce.js';
import { GEAR_GROUPS, PROPERTIES } from '../data/weapons.js';

const PAGES = { '/rules/traits': 'Traits', '/rules/weapons': 'Weapons and Gear', '/rules': 'Gameplay Rules', '/rules/scenarios': 'Scenarios' };

// One searchable list across every rules page: { kind, title, sub, paras, to }.
const strings = v => [v].flat(2).filter(x => typeof x === 'string' && x);
const ptsOf = pts => (pts === null || pts === undefined ? null : pts > 0 ? `+${pts} pts` : `${pts} pts`);

const INDEX = [
  ...TRAIT_TABLES.flatMap(tb => tb.traits.filter(tr => tr.text).map(tr => ({
    kind: 'Trait', title: tr.name, sub: [tb.name, tr.roll, ptsOf(tr.pts)].filter(Boolean).join(' · '),
    paras: strings([tr.text, tr.amended]), to: '/rules/traits',
  }))),
  ...LIGHTSABER_FORMS.map(f => ({
    kind: 'Lightsaber form', title: f.name, sub: `Form roll ${f.roll}`,
    paras: [f.text, ...f.levels.map((lv, i) => `Level ${'I'.repeat(i + 1)}: ${lv.join(' + ')}`)], to: '/rules/traits',
  })),
  ...GEAR_GROUPS.flatMap(g => g.items.map(it => ({
    kind: 'Weapon / gear', title: it.name, sub: g.name,
    paras: strings([
      it.aliases && `Also listed as ${it.aliases.join(', ')}`,
      it.range && it.range !== '-' && `Range ${it.range}`,
      it.notes, it.wound && `${it.wound} wound table`, it.text, it.amended, it.ref,
    ]),
    to: '/rules/weapons',
  }))),
  ...PROPERTIES.map(p => ({ kind: 'Weapon property', title: p.name, sub: p.tag, paras: strings([p.text, p.amended, p.ref]), to: '/rules/weapons' })),
  ...SECTIONS.flatMap(s => s.items.map(it => ({
    kind: 'Gameplay rule', title: it.title, sub: s.name,
    paras: strings([it.text, it.list, it.after, (it.table ?? []).map(([k, v]) => `${k}: ${v}`), it.foot, typeof it.amended === 'string' && it.amended, it.ref]),
    to: '/rules',
  }))),
  ...SCENARIOS.filter(s => s.roll).map(s => ({
    kind: 'Scenario', title: s.name, sub: `Scenario ${s.roll}`,
    paras: strings([s.intro, s.needs && `Needs: ${s.needs}`, s.rules, s.note, s.bonus && `Bonus EXP: ${s.bonus}`]), to: '/rules/scenarios',
  })),
  { kind: 'Scenario', title: 'Choosing a Scenario', sub: 'Mission prep', paras: SCENARIO_CHOOSING, to: '/rules/scenarios' },
  ...WOTF_BONUSES.map(b => ({ kind: 'Will of the Force', title: b.name, sub: `${b.pts} pts bonus`, paras: [b.text] })),
].map((e, id) => ({ ...e, id, hay: [e.title, e.sub, ...e.paras].join(' ').toLowerCase() }));

// Every word has to appear somewhere in the entry; title hits come first.
function search(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return INDEX.filter(e => words.every(w => e.hay.includes(w)))
    .map(e => ({ e, score: words.filter(w => e.title.toLowerCase().includes(w)).length }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.e);
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(() => new Set());
  const results = useMemo(() => search(query.trim()), [query]);
  const toggle = id => setOpen(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="stack">
      <input type="search" autoFocus placeholder="Search all rules, e.g. shock recovery" value={query} onChange={e => setQuery(e.target.value)} />
      {!query.trim() && <p className="muted small">Searches traits, lightsaber forms, weapons and gear, weapon properties, gameplay rules, scenarios and Will of the Force bonuses.</p>}
      {query.trim() && !results.length && <p className="muted">Nothing matches "{query.trim()}".</p>}
      {results.length > 0 && <div className="muted small">{results.length} result{results.length === 1 ? '' : 's'}</div>}
      {results.map(e => (
        <div key={e.id} className="card">
          <button className="section-head" onClick={() => toggle(e.id)} aria-expanded={open.has(e.id)}>
            <div>
              <h2>{e.title}</h2>
              <div className="muted small">{e.kind}{e.sub ? ` · ${e.sub}` : ''}</div>
            </div>
            <span className="muted">{open.has(e.id) ? '−' : '+'}</span>
          </button>
          <div className="small search-body">
            {(open.has(e.id) ? e.paras : e.paras.slice(0, 1)).map((p, i) => (
              <p key={i} className={`scenario-para ${open.has(e.id) ? '' : 'clamp'}`}>{p}</p>
            ))}
            {open.has(e.id) && e.to && <Link to={e.to}>Open {PAGES[e.to]}</Link>}
          </div>
        </div>
      ))}
    </div>
  );
}
