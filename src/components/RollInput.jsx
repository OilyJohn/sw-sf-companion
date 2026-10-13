import { useEffect, useRef, useState } from 'react';
import { rollFor } from '../dice.js';

const ROLL_MS = 700;
const TICK_MS = 60;
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Lets the player either roll in the app or type the result of a physical roll.
// In-app rolls tumble through random faces for a moment before landing on the result.
export default function RollInput({ dice, min, max, onRoll, label = 'Roll' }) {
  const [value, setValue] = useState('');
  const [face, setFace] = useState(null);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const submit = n => {
    if (Number.isInteger(n) && n >= min && n <= max) onRoll(n);
  };
  const roll = () => {
    const result = rollFor(dice);
    if (reducedMotion()) return onRoll(result);
    const randomFace = () => min + Math.floor(Math.random() * (max - min + 1));
    const tick = () => { setFace(randomFace()); timers.current.push(setTimeout(tick, TICK_MS)); };
    tick();
    timers.current.push(setTimeout(() => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setFace(result);
      timers.current.push(setTimeout(() => { setFace(null); onRoll(result); }, 250));
    }, ROLL_MS));
  };
  const rolling = face !== null;
  return (
    <div className="roll-input">
      <button type="button" className={`btn${rolling ? ' rolling' : ''}`} disabled={rolling} onClick={roll}>
        {rolling ? <span className="die-face">{face}</span> : `${label} ${dice}`}
      </button>
      <span className="muted small">or enter</span>
      <input type="number" inputMode="numeric" min={min} max={max} value={value} placeholder={`${min}-${max}`}
        onChange={e => setValue(e.target.value)} disabled={rolling} />
      <button type="button" className="btn ghost" disabled={value === '' || rolling} onClick={() => submit(Number(value))}>Use</button>
    </div>
  );
}
