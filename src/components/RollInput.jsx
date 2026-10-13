import { useEffect, useRef, useState } from 'react';
import { rollFor } from '../dice.js';

const ROLL_MS = 700;
const TICK_MS = 60;
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Two ways to roll: in the app, or with real dice and type the result in.
// onRoll(n, irl): irl is true for a typed-in result. In-app results are final; callers only
// offer a re-roll where the rules allow one, but a typed result can be changed to fix a typo.
// In-app rolls tumble through random faces for a moment before landing on the result.
export default function RollInput({ dice, min, max, onRoll, label = 'Roll' }) {
  const [irl, setIrl] = useState(false);
  const [value, setValue] = useState('');
  const [face, setFace] = useState(null);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const valid = n => Number.isInteger(n) && n >= min && n <= max;
  const roll = () => {
    const result = rollFor(dice);
    if (reducedMotion()) return onRoll(result, false);
    const randomFace = () => min + Math.floor(Math.random() * (max - min + 1));
    const tick = () => { setFace(randomFace()); timers.current.push(setTimeout(tick, TICK_MS)); };
    tick();
    timers.current.push(setTimeout(() => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setFace(result);
      timers.current.push(setTimeout(() => { setFace(null); onRoll(result, false); }, 250));
    }, ROLL_MS));
  };

  if (irl) {
    return (
      <form className="roll-input irl" onSubmit={e => { e.preventDefault(); valid(Number(value)) && onRoll(Number(value), true); }}>
        <span className="small">Your {dice}:</span>
        <input type="number" inputMode="numeric" min={min} max={max} value={value} placeholder={`${min}-${max}`} autoFocus
          onChange={e => setValue(e.target.value)} />
        <button className="btn" disabled={!valid(Number(value)) || value === ''}>Use</button>
        <button type="button" className="link-btn small" onClick={() => setIrl(false)}>Back</button>
      </form>
    );
  }
  const rolling = face !== null;
  return (
    <div className="roll-choice">
      <button type="button" className={`btn${rolling ? ' rolling' : ''}`} disabled={rolling} onClick={roll}>
        {rolling ? <span className="die-face">{face}</span> : `${label} in app (${dice})`}
      </button>
      <button type="button" className="btn ghost" disabled={rolling} onClick={() => setIrl(true)}>Roll IRL</button>
    </div>
  );
}
