import { slotsOf, slotsUsed } from '../data/equipment.js';

// One row per allowed item with a count, so doubles (e.g. two pistols) are possible.
export default function EquipmentPicker({ allowed, slots, value, onChange }) {
  const used = slotsUsed(value);
  const count = item => value.filter(v => v === item).length;
  const add = item => onChange([...value, item]);
  const drop = item => { const i = value.lastIndexOf(item); onChange(value.filter((_, j) => j !== i)); };

  return (
    <div className="equip-picker">
      <div className={`small ${used > slots ? 'warn' : 'muted'}`}>Slots used {used}/{slots}</div>
      {allowed.map(item => (
        <div key={item} className="counter">
          <span className="small">{item} <span className="muted">({slotsOf(item)} slot{slotsOf(item) > 1 ? 's' : ''})</span></span>
          <div className="row gap">
            <button type="button" className="icon-btn step" aria-label={`Remove ${item}`} disabled={!count(item)} onClick={() => drop(item)}>−</button>
            <b className="count">{count(item)}</b>
            <button type="button" className="icon-btn step" aria-label={`Add ${item}`} disabled={used + slotsOf(item) > slots} onClick={() => add(item)}>+</button>
          </div>
        </div>
      ))}
      {allowed.length === 0 && <div className="muted small">This unit can't take equipment.</div>}
    </div>
  );
}
