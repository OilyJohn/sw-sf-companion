// What each Back to the Ship to-do asks for, keyed by the to-do text stored on the unit.
import { FORCE_HERO_PROMOTION, HERO_PROMOTION } from './campaign.js';
import { ROLE_BONUS } from './rules.js';
import { LIGHTSABER_FORMS, TRAIT_TABLES } from './traits.js';

export const traitTable = id => TRAIT_TABLES.find(t => t.id === id);

const DICE_RANGE = { '2D10': [0, 99], D12: [1, 12] };
export const diceRange = dice => DICE_RANGE[dice];

const range = roll => {
  const m = /^(\d+)(?:-(\d+))?/.exec(roll ?? '');
  return m ? [Number(m[1]), Number(m[2] ?? m[1])] : null;
};

// Every row a roll lands on (Force Powers 6 has a dark side and a light side row).
export function rollTraitTable(table, n) {
  return table.traits.filter(tr => {
    const r = range(tr.roll);
    return r && n >= r[0] && n <= r[1];
  });
}

// Rows a player can pick when told to choose: only results above "Choose any of the above"
// (e.g. Ranged Fighter on 99 can't be picked from a 90-98 roll).
export function choosable(table) {
  const stop = table.traits.findIndex(tr => tr.pts === null);
  return stop < 0 ? table.traits : table.traits.slice(0, stop);
}

// "Fancy Footwork (2)" -> { name: 'Fancy Footwork', pts: 2 }
export function parseFormTrait(s) {
  const m = /^(.*) \((-?\d+)\)$/.exec(s);
  return m ? { name: m[1], pts: Number(m[2]) } : { name: s, pts: 0 };
}

export const formLevel = (unit, form) => unit.forms?.[form.name] ?? 0;
export const LEVELS = ['I', 'II', 'III'];
export { LIGHTSABER_FORMS };

export const REGEAR_TODO = 'Regear for free: promotion changed what this unit can carry';

const TODOS = {
  [REGEAR_TODO]: { kind: 'regear' },
  [ROLE_BONUS.leader.pending]: { kind: 'trait', tables: ['general', 'shooting', 'cc'] },
  [ROLE_BONUS.officer.pending]: { kind: 'trait', tables: ['general'] },
  'Roll on the Negative Trait table': { kind: 'trait', tables: ['negative'] },
  'Roll on the General trait table': { kind: 'trait', tables: ['general'] },
  'Roll on the Close Combat or Shooting trait table': { kind: 'trait', tables: ['cc', 'shooting'] },
  'Roll on the Force Powers table': { kind: 'trait', tables: ['force-powers'] },
  'Choose a Force Power': { kind: 'trait', tables: ['force-powers'], choose: true },
  // Leader Only and Hero Only are the same table (confirmed by Alex).
  'Roll for a Leader Only trait': { kind: 'trait', tables: ['hero'] },
  'Roll on the Hero Only trait table or become a Weapons Specialist': {
    kind: 'trait', tables: ['hero'], alt: { label: 'Become a Weapons Specialist', trait: { name: 'Weapons Specialist', pts: 0 } },
  },
  'Roll on the Other Gear table or become force sensitive': { kind: 'gear' },
  'Remove 1 negative trait (if any)': { kind: 'removeNegative' },
  'Roll for a Lightsaber Form to advance': { kind: 'form' },
  'Choose a Lightsaber Form to advance': { kind: 'form', choose: true },
  'Choose any Hero Promotion result from 0-79': { kind: 'promotion', table: HERO_PROMOTION },
  'Choose any Jedi/Sith Hero Promotion result from 0-79': { kind: 'promotion', table: FORCE_HERO_PROMOTION },
};

export const todoSpec = text => TODOS[text] ?? { kind: 'other' };
