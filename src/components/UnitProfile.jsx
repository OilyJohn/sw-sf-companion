import { slotsUsed } from '../data/equipment.js';
import { findTrait } from '../data/traits.js';
import { gearRule } from '../ruleLookup.js';
import ForcePowers from './ForcePowers.jsx';

// Every trait with its full rule text.
export function TraitList({ names }) {
  return (
    <div className="trait-list unit-traits">
      {names.map((n, i) => {
        const tr = findTrait(n);
        return (
          <div key={n + i} className="trait">
            <b className="small">{n}</b>
            {tr?.text
              ? <div className="small">{tr.text}</div>
              : <div className="small muted">No description yet.</div>}
            {tr?.amended && <div className="amended small">{tr.amended}</div>}
          </div>
        );
      })}
    </div>
  );
}

// Every piece of gear with its range, notes, wound table and properties.
export function GearList({ names }) {
  return (
    <div className="trait-list unit-traits">
      {names.map((n, i) => {
        const rule = gearRule(n);
        return (
          <div key={n + i} className="trait">
            <b className="small">{rule.title} <span className="muted">{rule.sub}</span></b>
            {rule.lines.map((l, j) => (
              <div key={j} className={l.old ? 'gh-old' : l.amended ? 'amended small' : l.muted ? 'muted small' : 'small'}>
                {l.label && <b>{l.label}: </b>}{l.text}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Read-only full profile of a unit (e.g. an enemy's, mid-battle). `st` is unitStats(unit, faction).
export default function UnitProfile({ unit, st }) {
  const gear = unit.equipment ?? [];
  return (
    <div className="stack unit-body">
      <div className="statline">
        <span>W <b>{st.wounds}</b></span>
        <span>CC <b>d{st.cc}</b></span>
        <span>S <b>d{st.s}</b></span>
        <span>Eq <b>{slotsUsed(gear)}/{st.eqSlots}</b></span>
        <span>EXP <b>{unit.exp}</b></span>
        <span>Pts <b>{st.points}</b></span>
      </div>
      {unit.model && <div className="small"><span className="muted">Model: </span>{unit.model}</div>}
      <div className="nav-heading">Traits</div>
      {st.traits.length ? <TraitList names={st.traits} /> : <div className="muted small">None</div>}
      <div className="nav-heading">Gear</div>
      {gear.length ? <GearList names={gear} /> : <div className="muted small">Nothing equipped</div>}
      <ForcePowers unit={unit} traits={st.traits} open />
    </div>
  );
}
