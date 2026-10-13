import { MAX_HEROES } from './data/factions.js';
import { ROLE_BONUS } from './data/rules.js';
import { unitStats } from './squads.js';

const isHero = u => u.role !== 'regular';

// The choices a promotion result gives this unit, as [button label, unit patch] pairs,
// or null when the unit can't take the result and must re-roll.
// `pending` is the unit's to-do list to add any new to-do to.
export function promotionOptions(res, unit, squad, pending = unit.pending ?? []) {
  const e = res.effect ?? {};
  const st = unitStats(unit, squad.faction);
  const heroes = squad.units.filter(u => isHero(u) && u.status !== 'dead').length;
  if (e.eqSlot) return [['Apply', { bonusEqSlots: unit.bonusEqSlots + 1 }]];
  if (e.wound) return st.wounds >= 3 ? null : [['Apply', { bonusWounds: unit.bonusWounds + 1 }]];
  if (e.die) {
    const options = [];
    if (st.cc < 12) options.push(['Close combat +2', { dieSteps: { ...unit.dieSteps, cc: unit.dieSteps.cc + 1 } }]);
    if (st.s < 12) options.push(['Shooting +2', { dieSteps: { ...unit.dieSteps, s: unit.dieSteps.s + 1 } }]);
    return options.length ? options : null;
  }
  if (e.promote) {
    return st.profile.promotesTo.length
      ? st.profile.promotesTo.map(t => [`Promote to ${t}`, { type: t }])
      : [['Not eligible: take nothing', {}]];
  }
  if (e.hero) {
    return heroes >= MAX_HEROES ? null
      : [['Make officer', { role: 'officer', pending: [...pending, ROLE_BONUS.officer.pending] }]];
  }
  if (e.todo) return [['Add to to-do list', { pending: [...pending, e.todo] }]];
  return [['OK', {}]];
}
