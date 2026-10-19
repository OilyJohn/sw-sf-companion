import { RuleText } from './RuleLinks.jsx';
import { FORCE_UNITS } from '../data/rules.js';
import { LIGHTSABER_FORMS, findTrait } from '../data/traits.js';

const FORCE_TABLES = new Set(['Force Powers', 'Misc Traits & Force Powers']);
const LEVELS = ['I', 'II', 'III'];

// Quick card of a force user's powers and lightsaber forms, with the full text, for use mid-battle.
// `traits` is the unit's full trait list (unitStats().traits).
export default function ForcePowers({ unit, traits, open = false }) {
  const powers = [...new Set(traits)].map(findTrait).filter(tr => tr && FORCE_TABLES.has(tr.table));
  const forms = Object.entries(unit.forms ?? {})
    .map(([name, level]) => ({ form: LIGHTSABER_FORMS.find(f => f.name === name), level }))
    .filter(f => f.form && f.level > 0);
  if (!FORCE_UNITS.has(unit.type) && !powers.length && !forms.length) return null;

  return (
    <details className="force-card" open={open}>
      <summary className="small">Force powers & forms ({powers.length + forms.length})</summary>
      <div className="trait-list unit-traits">
        {powers.map(tr => (
          <div key={tr.name} className="trait">
            <b className="small">{tr.name}</b>
            <div className="small"><RuleText text={tr.text} /></div>
          </div>
        ))}
        {forms.map(({ form, level }) => (
          <div key={form.name} className="trait">
            <b className="small">{form.name} <span className="muted">level {LEVELS[level - 1]}</span></b>
            <div className="small muted">{form.levels.slice(0, level).flat().join(', ')}</div>
          </div>
        ))}
        {!powers.length && !forms.length && <div className="trait small muted">No force powers or forms yet.</div>}
      </div>
    </details>
  );
}
