import { useState } from 'react';
import { rollFor } from '../dice.js';

// Lets the player either roll in the app or type the result of a physical roll.
export default function RollInput({ dice, min, max, onRoll, label = 'Roll' }) {
  const [value, setValue] = useState('');
  const submit = n => {
    if (Number.isInteger(n) && n >= min && n <= max) onRoll(n);
  };
  return (
    <div className="roll-input">
      <button type="button" className="btn" onClick={() => onRoll(rollFor(dice))}>{label} {dice}</button>
      <span className="muted small">or enter</span>
      <input type="number" inputMode="numeric" min={min} max={max} value={value} placeholder={`${min}-${max}`}
        onChange={e => setValue(e.target.value)} />
      <button type="button" className="btn ghost" disabled={value === ''} onClick={() => submit(Number(value))}>Use</button>
    </div>
  );
}
