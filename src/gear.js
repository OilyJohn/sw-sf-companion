import { EQUIPMENT_SLOTS, SPECIALIST, slotsUsed } from './data/equipment.js';
import { OTHER_GEAR_SLOTS } from './data/otherGear.js';

const isHero = u => u.role !== 'regular';

// Regulars use their profile's gear (plus a lightsaber once force sensitive). Heroes can buy any
// gear except specialist weapons, unless they're a Weapons Specialist.
export function buyableGear(unit, st) {
  if (!isHero(unit)) return [...st.profile.equipment, ...(st.traits.includes('Force Sensitive') ? ['Lightsaber'] : [])];
  const specialist = st.traits.includes('Weapons Specialist');
  return Object.keys(EQUIPMENT_SLOTS).filter(g => specialist || !SPECIALIST.has(g)).sort();
}

// Other Gear table items only come from Other Gear rolls, so they can't be bought with credits.
// Jet Pack was buyable GH gear before the table was added, so it stays buyable.
const ROLL_ONLY = new Set(Object.keys(OTHER_GEAR_SLOTS).filter(g => g !== 'Jet Pack'));

export const purchasableGear = (unit, st) => buyableGear(unit, st).filter(g => !ROLL_ONLY.has(g));

// Gear the unit holds but can't carry as it is now: items it isn't allowed, or more than its slots.
export function gearProblems(unit, st) {
  const allowed = new Set(buyableGear(unit, st));
  const equipment = unit.equipment ?? [];
  return {
    notAllowed: [...new Set(equipment.filter(g => !allowed.has(g)))],
    overSlots: slotsUsed(equipment) > st.eqSlots,
  };
}

export const needsRegear = (unit, st) => {
  const p = gearProblems(unit, st);
  return p.notAllowed.length > 0 || p.overSlots;
};

// Items in `before` that aren't in `after`, counting duplicates.
export function removedGear(before, after) {
  const left = [...after];
  return before.filter(g => {
    const i = left.indexOf(g);
    if (i === -1) return true;
    left.splice(i, 1);
    return false;
  });
}
