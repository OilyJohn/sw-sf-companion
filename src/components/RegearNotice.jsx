import { REGEAR_TODO } from '../data/todos.js';

// Shown with promotion choices: says which ones come with a free regear, before the player picks.
export default function RegearNotice({ unit, options }) {
  const types = (options ?? []).filter(([, patch]) => patch.pending?.includes(REGEAR_TODO)).map(([, patch]) => patch.type);
  if (!types.length) return null;
  return (
    <div className="callout small">
      <b>Free regear.</b> Promoting to {types.join(' or ')} lets you re-equip {unit.name} at no credit cost.
      A Regear to-do is added under To do; anything taken off goes to the armoury.
    </div>
  );
}
