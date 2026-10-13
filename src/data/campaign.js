// Campaign tables from STAR WARS: SPECIAL FORCES ("Back to the Ship") and New Jedi/Sith Progression.
// "2D10" tables are read as percentile (tens die + units die), giving 0-99.

const row = (min, max, name, text, effect = null) => ({ min, max, name, text, effect });

export function lookup(table, roll) {
  return table.rows.find(r => roll >= r.min && roll <= r.max) ?? null;
}

export const HERO_INJURY = {
  name: 'Hero Injury Chart', dice: '2D10', min: 0, max: 99,
  rows: [
    row(0, 5, 'Dead', 'This unit lies dead on the battlefield, and has become one with the force.', { status: 'dead' }),
    row(6, 10, 'Permanent Trauma', 'Roll on the Negative Trait table to find out if their trauma is physical or emotional.', { todo: 'Roll on the Negative Trait table' }),
    row(11, 15, 'M.I.A.', 'Presumed dead and left bleeding on the battlefield. Your next mission must be a rescue mission to try and save them.', { status: 'mia' }),
    row(16, 30, 'Injured', 'Needs some time in a bacta tank, and will miss your squad’s next mission.', { status: 'injured' }),
    row(31, 40, 'Mystery Ailment', 'Either put them in the bacta tank (miss next mission) or try an experimental treatment by re-rolling on this table.', { choice: 'mystery' }),
    row(41, 79, 'Speedy Recovery', 'Only minor injuries, raring to go for the next mission.'),
    row(80, 89, 'Miraculous Recovery', 'Makes a full recovery; you may remove 1 negative trait of your choice.', { todo: 'Remove 1 negative trait (if any)' }),
    row(90, 94, 'Recovered Goods', 'Found materials worth selling on the black market. Gain 2 credits.', { credits: 2 }),
    row(95, 99, 'Learning From Their Mistakes', 'Makes a speedy recovery and gains +2 experience.', { exp: 2 }),
  ],
};

export const WARRIOR_INJURY = {
  name: 'Warrior Injury Chart', dice: 'D10', min: 1, max: 10,
  rows: [
    row(1, 1, 'Dead', 'This unit lies dead on the battlefield, and has become one with the force.', { status: 'dead' }),
    row(2, 2, 'Permanent Trauma', 'Roll on the Negative Trait table to find out if their trauma is physical or emotional.', { todo: 'Roll on the Negative Trait table' }),
    row(3, 4, 'Injured', 'Needs some time in a bacta tank, and will miss your squad’s next mission.', { status: 'injured' }),
    row(5, 8, 'Speedy Recovery', 'Only minor injuries, raring to go for the next mission.'),
    row(9, 9, 'Miraculous Recovery', 'Makes a full recovery; you may remove 1 negative trait of your choice.', { todo: 'Remove 1 negative trait (if any)' }),
    row(10, 10, 'Learning From Their Mistakes', 'Makes a speedy recovery and gains +2 experience.', { exp: 2 }),
  ],
};

export const REGULAR_PROMOTION = {
  name: 'Regular Promotion Table', dice: '2D10', min: 0, max: 99,
  rows: [
    row(0, 19, 'Nothing', 'Better luck next time.'),
    row(20, 34, 'Extra Equipment Slot', '+1 Equipment Slot.', { eqSlot: 1 }),
    row(35, 84, 'Promoted', 'The unit gains promotion to the next rank, if eligible.', { promote: true }),
    row(85, 99, 'Promotion to Hero', 'Now classed as an officer and gets the officer bonuses. Re-roll if you already have 5 heroes.', { hero: true }),
  ],
};

export const HERO_PROMOTION = {
  name: 'Hero Promotion Table', dice: '2D10', min: 0, max: 99,
  rows: [
    row(0, 9, 'Extra Equipment Slot', '+1 Equipment Slot.', { eqSlot: 1 }),
    row(10, 24, 'Extra Wound', '+1 Wound. Cannot exceed 3.', { wound: 1 }),
    row(25, 44, 'Close Combat/Shooting Die +2', 'Choose which; cannot exceed d12 (re-roll if both maxed).', { die: true }),
    row(45, 59, 'Roll for a General Trait', 'Re-roll if you get one you already have.', { todo: 'Roll on the General trait table' }),
    row(60, 79, 'New CC/Shooting Trait', 'Choose which table to roll on. Re-roll if you get one you already have.', { todo: 'Roll on the Close Combat or Shooting trait table' }),
    row(80, 89, 'Choose From any of the Above Results', 'Pick any result from 0-79.', { todo: 'Choose any Hero Promotion result from 0-79' }),
    row(90, 94, 'Hero Only Trait or Weapons Specialist', 'Roll for a Hero Only trait, or become a Weapons Specialist.', { todo: 'Roll on the Hero Only trait table or become a Weapons Specialist' }),
    row(95, 99, 'Other Gear / Force Sensitive', 'Roll on the Other Gear table, or become force sensitive (replace ranged/melee weapons with a lightsaber).', { todo: 'Roll on the Other Gear table or become force sensitive' }),
  ],
};

export const FORCE_REGULAR_PROMOTION = {
  name: 'Jedi/Sith Regular Promotion Table', dice: '2D10', min: 0, max: 99,
  rows: [
    row(0, 19, 'Nothing', 'Better luck next time.'),
    row(20, 34, 'Extra Equipment Slot', '+1 Equipment Slot.', { eqSlot: 1 }),
    row(35, 54, 'New Force Power', 'Roll for a force power, re-roll if you already have it.', { todo: 'Roll on the Force Powers table' }),
    row(55, 74, 'Lightsaber Training', 'Roll for a lightsaber form to advance in.', { todo: 'Roll for a Lightsaber Form to advance' }),
    row(75, 84, 'Close Combat/Shooting Die +2', 'Choose which; cannot exceed d12 (re-roll if both maxed).', { die: true }),
    row(85, 99, 'Promotion to Hero', 'Now classed as an officer and gets the officer bonuses. Re-roll if you already have 5 heroes.', { hero: true }),
  ],
};

export const FORCE_HERO_PROMOTION = {
  name: 'Jedi/Sith Hero Promotion Table', dice: '2D10', min: 0, max: 99,
  rows: [
    row(0, 9, 'Extra Equipment Slot', '+1 Equipment Slot.', { eqSlot: 1 }),
    row(10, 24, 'Extra Wound', '+1 Wound. Cannot exceed 3.', { wound: 1 }),
    row(25, 39, 'Close Combat/Shooting Die +2', 'Choose which; cannot exceed d12 (re-roll if both maxed).', { die: true }),
    row(40, 54, 'Roll for Force Power', 'Re-roll if you already have it.', { todo: 'Roll on the Force Powers table' }),
    row(55, 59, 'Choose Force Power', 'Choose any force power.', { todo: 'Choose a Force Power' }),
    row(60, 74, 'Roll for Lightsaber Form', 'Re-roll if maxed or ineligible.', { todo: 'Roll for a Lightsaber Form to advance' }),
    row(75, 79, 'Choose Lightsaber Form', 'Choose an eligible form to advance 1 level in.', { todo: 'Choose a Lightsaber Form to advance' }),
    row(80, 94, 'Choose From any of the Above Results', 'Pick any result from 0-79.', { todo: 'Choose any Jedi/Sith Hero Promotion result from 0-79' }),
    row(95, 99, 'Roll for a Leader Only Trait', 'Re-roll if you already have it.', { todo: 'Roll for a Leader Only trait' }),
  ],
};

export const RESULTS = {
  win: { label: 'Won', credits: 6 },
  draw: { label: 'Drew', credits: 4 },
  loss: { label: 'Lost', credits: 3 },
};

export const EXP_PER_PROMOTION = 5;

// Scenarios as numbered 1-10 in the campaign doc, with their bonus objective EXP.
export const SCENARIOS = [
  { roll: 1, name: 'Squad Elimination', bonus: 'Landing the killing blow on regular units' },
  { roll: 2, name: 'Disable the Shield Generator', bonus: 'Attackers: wounding or disabling the shield generator (if disabling, 1 EXP per remaining wound on it). Defenders: landing the killing blow on regular units' },
  { roll: 3, name: 'Advanced Scouting Parties', bonus: 'Getting off the opponent’s edge of the board' },
  { roll: 4, name: 'Bounty Hunt', bonus: 'Inflicting a wound on the bounty' },
  { roll: 5, name: 'Rescue', bonus: 'Attackers: killing blow on an enemy within 3" of the target, being within 3" of the target to win. Defenders: landing the killing blow on regular units' },
  { roll: 6, name: 'Domination', bonus: 'Wounding an enemy that is on an objective' },
  { roll: 7, name: 'Supply Shower', bonus: 'Marking a crate that is then picked up for your side' },
  { roll: 8, name: 'Cantina Brawl', bonus: 'Landing the killing blow on regular units' },
  { roll: 9, name: 'Heroic Last Stand', bonus: 'Attackers: finishing blow on an enemy hero (2 EXP instead of 1). Defenders: surviving to the end of the game' },
  { roll: 10, name: 'Aggressive Negotiations', bonus: 'Carrying your leader at least 10" (once per unit); inflicting a wound on an enemy carrying their leader' },
  { name: 'Other / custom', bonus: '' },
];
