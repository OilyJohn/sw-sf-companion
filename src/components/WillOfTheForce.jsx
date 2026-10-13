import { MERC_BASE_UNITS, MIN_GAP, WOTF_BONUSES, bonusCost, findBonus } from '../data/willOfTheForce.js';
import { saveSquad } from '../squads.js';

// Pick Will of the Force bonuses up to `budget` points.
// picked: bonus ids; mercType: the Mercenaries base unit chosen for the Mercenary bonus.
export function WotfPicker({ gap, budget = gap, picked, mercType, onChange, note }) {
  const spent = bonusCost(picked);
  if (gap < MIN_GAP) {
    return <p className="muted small">The points gap is {Math.max(0, gap)}, so no Will of the Force bonuses{gap > 0 ? ` (needs ${MIN_GAP}+)` : ''}.</p>;
  }
  const toggle = id => onChange(picked.includes(id) ? picked.filter(x => x !== id) : [...picked, id], mercType);
  return (
    <div className="stack">
      <div className="small">
        Outgunned by <b>{gap} pts</b>. Pick bonuses worth up to {budget} pts{note ? ` ${note}` : ''}.
        <span className={spent > budget ? 'warn' : 'muted'}> {spent}/{budget} used.</span>
      </div>
      {WOTF_BONUSES.map(b => {
        const on = picked.includes(b.id);
        return (
          <label key={b.id} className="check">
            <input type="checkbox" checked={on} disabled={!on && spent + b.pts > budget} onChange={() => toggle(b.id)} />
            <span className="small"><b>{b.name}</b> ({b.pts}) <span className="muted">{b.text}</span></span>
          </label>
        );
      })}
      {picked.includes('mercenary') && (
        <label className="small">Mercenary
          <select value={mercType ?? ''} onChange={e => onChange(picked, e.target.value || null)}>
            <option value="">Choose a base unit…</option>
            {MERC_BASE_UNITS.map(u => <option key={u.name} value={u.name}>{u.name} ({u.pts} pts)</option>)}
          </select>
        </label>
      )}
    </div>
  );
}

// During a battle: the bonuses this squad has, with the once-per-mission ones to tick off.
export function WotfPanel({ squad }) {
  const wotf = squad.battle?.wotf;
  if (!wotf?.bonuses.length) return null;
  const use = (id, v) => saveSquad(squad.id, { [`battle.wotf.used.${id}`]: v });
  return (
    <div className="card stack">
      <div className="nav-heading">Will of the Force</div>
      {wotf.bonuses.map(id => {
        const b = findBonus(id);
        const used = !!wotf.used?.[id];
        return (
          <div key={id} className="row between">
            <span className={`small ${used ? 'muted' : ''}`}><b>{b.name}</b> <span className="muted">{b.text}</span></span>
            {b.inBattle && (
              <button className={`btn small-btn ${used ? 'ghost' : ''}`} onClick={() => use(id, !used)}>{used ? 'Used' : 'Use'}</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
