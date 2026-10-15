import { useState } from 'react';
import RollInput from './RollInput.jsx';
import { slotsOf } from '../data/equipment.js';
import { CHOOSABLE_GEAR, X_WEAPONS, otherGearRow } from '../data/otherGear.js';
import { gearRule } from '../ruleLookup.js';

// Roll on the GH Other Gear table (2D10 read as 1-100), then the X Weapon D10 if needed, or pick
// one on "Choose". onPick(name) adds the item. `free`: the gear takes no slots (Gadgeteer).
export default function OtherGearRoll({ onPick, free = false, addLabel = 'Add' }) {
  const [roll, setRoll] = useState(null);
  const [irl, setIrl] = useState(false);
  const [xRoll, setXRoll] = useState(null);
  const [xIrl, setXIrl] = useState(false);
  const [chosen, setChosen] = useState('');
  const row = roll === null ? null : otherGearRow(roll);
  const reset = () => { setRoll(null); setXRoll(null); setChosen(''); };

  let item = null;
  if (row?.name === 'X Weapon') item = xRoll === null ? null : X_WEAPONS[xRoll - 1].name;
  else if (row?.name === 'Choose') item = chosen || null;
  else if (row) item = row.name;

  return (
    <div className="stack">
      {roll === null
        ? <RollInput dice="D100" min={1} max={100} label="Roll Other Gear" onRoll={(n, typed) => { setRoll(n); setIrl(typed); }} />
        : <div className="small muted">Rolled {roll} on Other Gear (GH){row ? `: ${row.name}` : ''}.
            {irl && <> <button className="link-btn small" onClick={reset}>change</button></>}</div>}
      {roll !== null && !row && (
        <div className="row gap wrap">
          <span className="warn small">13-14 isn't on the table, so roll again.</span>
          <button className="btn ghost" onClick={reset}>Re-roll</button>
        </div>
      )}
      {row?.name === 'X Weapon' && (xRoll === null
        ? <RollInput dice="D10" min={1} max={10} label="Roll X Weapon" onRoll={(n, typed) => { setXRoll(n); setXIrl(typed); }} />
        : <div className="small muted">X Weapon roll {xRoll}.
            {xIrl && <> <button className="link-btn small" onClick={() => setXRoll(null)}>change</button></>}</div>)}
      {row?.name === 'Choose' && (
        <select value={chosen} onChange={e => setChosen(e.target.value)}>
          <option value="">Choose any item…</option>
          {CHOOSABLE_GEAR.map(n => <option key={n} value={n}>{n} ({slotsOf(n)} slot{slotsOf(n) === 1 ? '' : 's'})</option>)}
        </select>
      )}
      {item && (
        <div className="stack">
          <div><b>{item}</b> <span className="muted small">{free ? '0 slots (Gadgeteer)' : `${slotsOf(item)} slot${slotsOf(item) === 1 ? '' : 's'}`}</span></div>
          <div className="small">{gearRule(item).lines.find(l => !l.label && !l.muted)?.text}</div>
          <button className="btn" onClick={() => onPick(item)}>{addLabel} {item}</button>
        </div>
      )}
    </div>
  );
}
