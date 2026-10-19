// The Promotions and Injuries rules pages: when each table is used, plus the same tables the
// Back to the Ship rollers use (campaign.js), so there's one copy of every table.
import {
  EXP_PER_PROMOTION, FORCE_HERO_PROMOTION, FORCE_REGULAR_PROMOTION, HERO_INJURY, HERO_PROMOTION,
  REGULAR_PROMOTION, WARRIOR_INJURY,
} from './campaign.js';
import { MAX_HEROES } from './factions.js';
import { WOTF_BONUSES } from './willOfTheForce.js';

const wotf = id => WOTF_BONUSES.find(b => b.id === id);

export const PROMOTIONS = {
  path: '/rules/promotions', label: 'Promotions', kind: 'Promotion',
  rules: [
    { title: 'When you roll', list: [
      `Every ${EXP_PER_PROMOTION} EXP fills an EXP box. Each full box gives one promotion roll when you get back to the ship.`,
      'Dead and M.I.A. units don’t roll.',
    ] },
    { title: 'Which table', list: [
      'Regular units roll on the Regular Promotion Table; the leader and officers (heroes) roll on the Hero Promotion Table.',
      'Jedi/Sith use the Jedi/Sith tables instead (New Jedi/Sith Progression).',
    ] },
    { title: 'Spending excess EXP', list: [
      'EXP beyond your full boxes can shift a result up or down the table, 1 EXP per result.',
      'Regular units can shift by 1 at most and can’t reach Promotion to Hero this way.',
    ] },
    { title: 'Promotion to Hero', list: [
      'The unit becomes an officer: +1 wound and roll 1 General trait.',
      `Re-roll if you already have ${MAX_HEROES} heroes.`,
    ] },
    { title: 'Will of the Force', text: `${wotf('promotionReroll').name} (${wotf('promotionReroll').pts} pts): ${wotf('promotionReroll').text}` },
  ],
  tables: [REGULAR_PROMOTION, HERO_PROMOTION, FORCE_REGULAR_PROMOTION, FORCE_HERO_PROMOTION],
};

export const INJURIES = {
  path: '/rules/injuries', label: 'Injuries', kind: 'Injury',
  rules: [
    { title: 'When you roll', list: [
      'Every unit put out of action in a mission rolls for injuries when you get back to the ship.',
      'A Mercenary you don’t hire leaves after the mission with no injury roll.',
    ] },
    { title: 'Which table', list: [
      `The leader and officers (heroes) roll on the ${HERO_INJURY.name} (${HERO_INJURY.dice}).`,
      `Regular units roll on the ${WARRIOR_INJURY.name} (${WARRIOR_INJURY.dice}).`,
    ] },
    { title: 'Will of the Force', text: `${wotf('injuryReroll').name} (${wotf('injuryReroll').pts} pts): ${wotf('injuryReroll').text}` },
  ],
  tables: [HERO_INJURY, WARRIOR_INJURY],
};

// "0-5", or "1" for a single number.
export const rangeOf = r => (r.min === r.max ? `${r.min}` : `${r.min}-${r.max}`);
