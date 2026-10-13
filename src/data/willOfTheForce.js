// "Step 2: The Will of the Force" from STAR WARS: SPECIAL FORCES. The weaker side picks bonuses
// whose points add up to no more than the difference in points ratings.
import { mercenaries } from './factions.js';

export const WOTF_BONUSES = [
  { id: 'injuryReroll', pts: 5, name: 'Injury re-roll', text: 'Re-roll 1 Injury result once you’re back to your ship (lost if no injuries sustained).' },
  { id: 'promotionReroll', pts: 5, name: 'Promotion re-roll', text: 'Re-roll 1 promotion result once you’re back to your ship (lost if no promotions gained).' },
  { id: 'wildcard', pts: 5, name: 'Wildcard', text: '1 free wildcard: use any card in your hand like an ace, once in the game.', inBattle: true },
  { id: 'reroll', pts: 5, name: 'Mission re-roll', text: '1 re-roll (of your own dice) to use at any point during the mission.', inBattle: true },
  { id: 'mercenary', pts: 10, name: 'Mercenary', text: 'Add 1 base unit from the Mercenaries faction to your squad for this mission. You can hire them permanently at the end of the mission for 5 credits.' },
  { id: 'credits', pts: 10, name: 'Extra credits', text: '+2 credits for losing, +4 credits for drawing/winning.', credits: { loss: 2, draw: 4, win: 4 } },
  { id: 'exp', pts: 15, name: 'Extra EXP', text: 'All units +1 EXP for losing, +2 EXP for drawing/winning.', exp: { loss: 1, draw: 2, win: 2 } },
];

export const findBonus = id => WOTF_BONUSES.find(b => b.id === id);
export const bonusCost = ids => (ids ?? []).reduce((t, id) => t + (findBonus(id)?.pts ?? 0), 0);
export const MIN_GAP = Math.min(...WOTF_BONUSES.map(b => b.pts));

// Base units: the first rank of each Mercenaries line (nothing promotes into them).
const promoted = new Set(mercenaries.units.flatMap(u => u.promotesTo));
export const MERC_BASE_UNITS = mercenaries.units.filter(u => !promoted.has(u.name));
export const MERC_HIRE_COST = mercenaries.hireCost;

// Extra credits and EXP for a result from the chosen bonuses.
export const bonusCredits = (ids, result) => (ids ?? []).reduce((t, id) => t + (findBonus(id)?.credits?.[result] ?? 0), 0);
export const bonusExp = (ids, result) => (ids ?? []).reduce((t, id) => t + (findBonus(id)?.exp?.[result] ?? 0), 0);

// A squad's Will of the Force for one battle, kept on squad.battle.wotf:
// { gap, bonuses: [ids], used: { [id]: true }, mercId }.
export const blankWotf = (gap, bonuses = [], mercId = null) => ({ gap, bonuses, used: {}, mercId });
