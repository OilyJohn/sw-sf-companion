import { MERC_BASE_UNITS, MIN_GAP, WOTF_BONUSES, bonusCost, countOf, findBonus } from '../data/willOfTheForce.js';
import { saveSquad } from '../squads.js';

// Pick Will of the Force bonuses (repeats allowed) up to `budget` points.
// picked: bonus ids; mercTypes: one Mercenaries base unit per Mercenary bonus picked.
export function WotfPicker({ budget, picked, mercTypes = [], onChange, intro }) {
  const spent = bonusCost(picked);
  if (budget < MIN_GAP) {
    return <p className="muted small">{intro} That's {Math.max(0, budget)} pts, so no Will of the Force bonuses{budget > 0 ? ` (needs ${MIN_GAP}+)` : ''}.</p>;
  }
  const set = (next, types = mercTypes) => onChange(next, types.slice(0, countOf(next, 'mercenary')));
  const add = id => set([...picked, id]);
  const remove = id => { const i = picked.lastIndexOf(id); set(picked.filter((_, j) => j !== i)); };
  const mercs = countOf(picked, 'mercenary');
  return (
    <div className="stack">
      <div className="small">
        {intro} Pick bonuses worth up to <b>{budget} pts</b>; you can pick the same one more than once.
        <span className={spent > budget ? 'warn' : 'muted'}> {spent}/{budget} used.</span>
      </div>
      {WOTF_BONUSES.map(b => {
        const n = countOf(picked, b.id);
        return (
          <div key={b.id} className="counter">
            <span className={`small ${n ? '' : 'muted'}`}><b>{b.name}</b> ({b.pts}) <span className="muted">{b.text}</span></span>
            <div className="row gap">
              <button className="icon-btn step" aria-label={`Remove ${b.name}`} disabled={!n} onClick={() => remove(b.id)}>−</button>
              <b className="count">{n}</b>
              <button className="icon-btn step" aria-label={`Add ${b.name}`} disabled={spent + b.pts > budget} onClick={() => add(b.id)}>+</button>
            </div>
          </div>
        );
      })}
      {Array.from({ length: mercs }, (_, i) => (
        <label key={i} className="small">Mercenary{mercs > 1 ? ` ${i + 1}` : ''}
          <select value={mercTypes[i] ?? ''} onChange={e => {
            const types = [...mercTypes];
            types[i] = e.target.value || null;
            set(picked, types);
          }}>
            <option value="">Choose a base unit…</option>
            {MERC_BASE_UNITS.map(u => <option key={u.name} value={u.name}>{u.name} ({u.pts} pts)</option>)}
          </select>
        </label>
      ))}
    </div>
  );
}

// True when every Mercenary bonus has a unit chosen.
export const mercsChosen = (picked, mercTypes = []) =>
  Array.from({ length: countOf(picked, 'mercenary') }, (_, i) => mercTypes[i]).every(Boolean);

// During a battle: the bonuses this squad has, with the once-per-mission ones to tick off.
export function WotfPanel({ squad }) {
  const wotf = squad.battle?.wotf;
  if (!wotf?.bonuses.length) return null;
  const setUsed = (id, n) => saveSquad(squad.id, { [`battle.wotf.used.${id}`]: n });
  return (
    <div className="card stack">
      <div className="nav-heading">Will of the Force</div>
      {[...new Set(wotf.bonuses)].map(id => {
        const b = findBonus(id);
        const have = countOf(wotf.bonuses, id);
        const used = Number(wotf.used?.[id] ?? 0);
        return (
          <div key={id} className="row between">
            <span className="small"><b>{b.name}{have > 1 ? ` ×${have}` : ''}</b> <span className="muted">{b.text}</span></span>
            {b.inBattle && (
              <div className="row gap">
                {used > 0 && <button className="link-btn small" onClick={() => setUsed(id, used - 1)}>undo</button>}
                <button className="btn small-btn" disabled={used >= have} onClick={() => setUsed(id, used + 1)}>
                  {used >= have ? 'Used' : `Use (${have - used} left)`}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
