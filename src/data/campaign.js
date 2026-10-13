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

// How a scenario is picked and who chooses sides, from the campaign doc.
export const SCENARIO_CHOOSING = [
  'If any unit on either side got a “Lost in Battle” result on the injury table after the last game, you must play Rescue and attempt to rescue that unit.',
  'Otherwise players can agree on a scenario (to try something new, use particular scenery, or play with more than 2 participants), as long as everyone agrees.',
  'If neither applies, roll on the Random Scenario table.',
  'If the difference between the sides is 5 points or less, roll off to decide who gets the lowest-points choice of side instead.',
];

// Scenarios as numbered 1-10 in the campaign doc. `bonus` is the bonus objective EXP;
// `rules` paragraphs are the doc's wording, an array inside `rules` is a bullet list.
export const SCENARIOS = [
  {
    roll: 1, name: 'Squad Elimination',
    intro: 'You have been ordered to wipe out the enemy without mercy, or remorse.',
    rules: [
      'Before the battle begins, the player with the lowest points total picks which side of the battlefield they want to start on. Then players must divide their squads up into equal groups, each led by one hero. For each group, roll a die. On an even result, that group starts in contact with the edge of the battlefield; on an odd result, that group starts anywhere within 8” of that same edge.',
      'The mission ends at the end of the turn in which at least one side has been reduced to 1/3 or less of their starting units. If this happens to both sides in the same turn, the mission ends in a draw. Otherwise, the side which still has more than 1/3 of its units still in action wins.',
    ],
    bonus: 'Landing the killing blow on regular units',
  },
  {
    roll: 2, name: 'Disable the Shield Generator',
    intro: 'The enemy are holding a key military base, protected by a powerful energy shield. Your allied forces have no chance of breaking through the shield with the firepower they have. Your squad has been assigned the task of infiltrating the base and disabling the energy shield.',
    needs: 'A piece of terrain to represent the shield generator.',
    rules: [
      'Before the battle begins, the player with the lowest points total picks whether they want to be the attacking or defending side. Place the shield generator in the centre of the battlefield, at ground level (not on a hill or anything). The defending player may then place all their units anywhere they like, within 8” of the generator. The attacking player must divide their squad up into equal groups, each led by one hero. They then place each group anywhere they want, on any edge of the battlefield.',
      'The attacking squad has the element of surprise, so the defending squad is unable to make any kind of attacks until an enemy unit has been spotted. Attacking units can be spotted in one of 2 ways:',
      [
        'If an attacking unit makes any kind of attack (shoot, grenade throw, charging for melee etc.) they are spotted for the rest of the mission.',
        'At the start of each defending unit’s activation, they make a task roll for each attacking unit within 12” of them: easy if the attacker is in the open, medium in light cover, hard in heavy cover. Passing reveals that attacker for the rest of the mission.',
      ],
      'To disable the shield generator, you must either destroy it, or switch it off by getting a unit into contact with it and performing a hard task roll. For destroying it, the generator has 3 wounds and light armour. It cannot be attacked in close combat; if you are in contact with it you must attempt to switch it off rather than destroy it.',
      'The attacking squad wins if they disable the shield generator before they are reduced to 1/3 or less of their starting units. Otherwise, the defending team wins.',
    ],
    bonus: 'Attackers: wounding or disabling the shield generator (if disabling, 1 EXP per remaining wound on it). Defenders: landing the killing blow on regular units',
  },
  {
    roll: 3, name: 'Advanced Scouting Parties',
    intro: 'Your squad has been asked to scout ahead of the rest of their army in order to gather essential information about the enemy. Unfortunately, on your route, you encounter an enemy squad attempting the same thing!',
    rules: [
      'Before the battle begins, the player with the lowest points total picks which side of the battlefield they want to start on. Then both players deploy their squads in a wedge formation, with their leader at the front, 12” away from the edge of the battlefield.',
      'The mission ends at the end of the turn in which at least one side has been reduced to 1/3 or less of their starting units. The player who has got the most units to the opposite edge of the battlefield from where they started wins. If the number is equal, it is a draw.',
    ],
    bonus: 'Getting off the opponent’s edge of the board',
  },
  {
    roll: 4, name: 'Bounty Hunt',
    intro: 'A dangerous being has been wreaking havoc on a local population. They have pooled together to put out a bounty on them. Unfortunately, you and your opponent have both had the same idea!',
    needs: 'A 3rd person to control the target.',
    rules: [
      'The player with the lowest points total chooses a corner of the board. The other player takes the opposite corner. Place the target in the middle of the battlefield. Each player places all their units within 12” of their corner at the start of the mission.',
      'The target should have an odd number of wounds, and is immune to shock and being downed. The players agree on the target, and how powerful it is should be relative to the strength of the 2 squads taking part.',
      'The mission ends when the target is reduced to 0 remaining wounds. The squad that inflicted the most wounds on the target is the winner.',
    ],
    bonus: 'Inflicting a wound on the bounty',
  },
  {
    roll: 5, name: 'Rescue',
    intro: 'An important figure from your faction has been captured by the enemy, and is being held unconscious! Can you clear out a landing zone for a pickup?',
    rules: [
      'If this scenario is being played due to a unit getting an M.I.A. result on the injury table, the attacking/defending team is already decided, and the player with the lowest points total picks which side they want to be their side. Otherwise the player with the lowest points total decides whether they want to attack or defend, and their opponent chooses which side of the board they want.',
      'The captured unit is placed in the centre of the battlefield. The defending player places one hero and up to half of their regular units within 3” of the captured unit. The attacking player places one hero and up to half of their regular units within 8” of their side of the battlefield. At the end of each turn, roll a D10 for each of your units that has not yet entered the battlefield:',
      [
        '1-3: this unit does not enter the battlefield',
        '4-7: placed anywhere on your edge of the battlefield',
        '8-10: placed anywhere on any edge of the battlefield that is not your opponent’s edge',
      ],
      'The attacking team wins by having at least 1 unit within 3” of the target while the defenders have 0, at the end of a turn. The defending team wins by reducing the attackers to less than 1/3 of their starting units at the end of a turn (including the units that started off the battlefield).',
    ],
    bonus: 'Attackers: killing blow on an enemy within 3" of the target, being within 3" of the target to win. Defenders: landing the killing blow on regular units',
  },
  {
    roll: 6, name: 'Domination',
    rules: [
      'Set up 3 objectives along the halfway line of the board, and 1 in each player’s half of the board. The player with the lowest points selects which side they want to start on. The player with the most points deploys their force first, however they like, within 10” of their edge of the board. Then the player with the lowest points deploys in the same way.',
      'Objectives are captured by having at least one unit within 3” of an objective while your opponent has none. At the end of each turn, each player scores 1 point for each objective they control. Objectives controlled by enemies can still be captured, providing the same conditions are met.',
    ],
    note: 'The campaign doc doesn’t say when this mission ends.',
    bonus: 'Wounding an enemy that is on an objective',
  },
  {
    roll: 7, name: 'Cantina Brawl',
    rules: [
      'Set up on the urban battlefield, with 5 or 6 death stick addicts scattered around the centre of the battlefield. The player with the lowest points selects which side they want to start on. The player with the most points deploys their force first, however they like, within 10” of their edge of the board. Then the player with the lowest points deploys in the same way.',
      'At the end of each turn, the death stick addicts move 5” in a random direction, and then, if not in combat, throw a grenade in a random direction.',
      'The mission ends at the end of the turn in which at least one side has been reduced to 1/3 or less of their starting units. If this happens to both sides in the same turn, the mission ends in a draw. Otherwise, the side which still has more than 1/3 of its units still in action wins.',
    ],
    bonus: 'Landing the killing blow on regular units',
  },
  {
    roll: 8, name: 'Supply Shower',
    rules: [
      'The player with the lowest points total picks which side of the battlefield they want to start on. Then both players deploy their squads however they like, within 8” of their side of the battlefield.',
      'At the start of each turn, 1 supply crate lands D10” away from the centre of the board in the direction the die is pointing. Each player can use their units to mark supply crates for the ship to pick up, by moving into contact with a crate and spending 1 action to mark it. You cannot mark a crate if an enemy is currently in contact with it. If no enemy is in contact with a crate, you can spend 1 action to remove their marker and mark it for yourself.',
      'The mission ends at the end of the turn in which one squad has been reduced to 1/3 or less of its starting force. The player that marked the most supply crates is the winner.',
    ],
    bonus: 'Marking a crate that is then picked up for your side',
  },
  {
    roll: 9, name: 'Heroic Last Stand',
    rules: [
      'The player with the lowest points total chooses whether they want to attack or defend. The defending player deploys only their heroes that are available for this game, in or on some kind of defensible terrain in the centre of the board (high ground, building or similar).',
      'Before each turn, the attacking player rolls a D10 for each of their units not yet on the board to see if they will be deployed:',
      [
        '1-3: this unit does not enter the battlefield',
        '4-7: placed anywhere within 4” of your edge of the battlefield',
        '8-10: placed anywhere on the edge of either side of the board',
      ],
      'The attacking player has 4 turns to eliminate over half of the heroes the defending side started with; if they fail, the defending side wins. If exactly half are eliminated after 4 turns, it is a draw.',
    ],
    bonus: 'Attackers: finishing blow on an enemy hero (2 EXP instead of 1). Defenders: surviving to the end of the game',
  },
  {
    roll: 10, name: 'Aggressive Negotiations',
    intro: 'Your leaders were both sent to negotiate a peace deal, but they were sabotaged! A blast went off in the tent they were in, sending them flying and leaving them both unconscious. Unclear as to who was responsible, their respective companies open fire while desperately scrabbling to get their leader to safety.',
    rules: [
      'Due to the blast, there is a clearing in the centre of the board with no terrain, 8” in diameter. The player with the lowest points chooses an edge of the battlefield. From the centre of the board, measure back 4” towards your edge and lay your leader down on the ground. Players alternate rolling for each of their other units: on an odd number, deploy them anywhere within 8” of your edge; on an even number, up to 16” away from your edge.',
      'The aim is to have one of your units pick up your leader and carry them back off your edge of the board to receive medical care.',
      [
        'Picking them up costs an action, and you can’t shoot or charge into CC while carrying.',
        'If an enemy charges you, your leader is dropped on the floor. You cannot pick them up while touching or in CC with an enemy.',
        'Movement distance is unaffected by carrying, but you can’t climb up or down.',
        'If you are wounded, or fail a run away check while carrying, you drop them.',
      ],
      'The game ends after both leaders are off the board, or when 5 turns have been completed. If only one player succeeded, they win and their opponent loses. Otherwise it is a draw. If you fail to get your leader to safety, roll on the injury table for them at the end of the game.',
    ],
    bonus: 'Carrying your leader at least 10" (once per unit); inflicting a wound on an enemy carrying their leader',
  },
  { name: 'Other / custom', bonus: '' },
];
