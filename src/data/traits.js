// Trait text transcribed from Alex's docs only (not the GH rulebook):
//   SF  = STAR WARS: SPECIAL FORCES (trait tables)
//   JS  = New Jedi/Sith Progression
//   GH  = Galactic Heroes 2nd Ed rulebook (only Small and Soulless, at Alex's request)
// `pts` is the points cost added to a unit; `roll` is the table range.

const t = (roll, name, pts, text, extra = {}) => ({ roll, name, pts, text, ...extra });

export const TRAIT_TABLES = [
  {
    id: 'general', name: 'General Traits', dice: '2D10', source: 'SF',
    traits: [
      t('0-2', 'Loyal', 0, 'Can never run off the board when fleeing (stop at edge).'),
      t('3-5', 'Ranger', 0, '+1 to CC and no penalty for moving in rough terrain.'),
      t('6-8', 'Indomitable', 1, 'Use 2 actions to remove 1 shock.'),
      t('9-11', 'Smart', 1, '+1 to task rolls.'),
      t('12-14', 'Deadly Strike', 1, '-1 to opponent’s armour roll.'),
      t('15-17', 'Coolheaded', 1, '+1 to shock recovery rolls.'),
      t('18-20', 'Nerves of Steel', 1, 'Ignore your first shaken result of the game.'),
      t('21-23', 'Quick', 1, '+1" to your movement stat (per action).'),
      t('24-26', 'Immovable Object', 1, 'Unit doesn’t get knocked down by wound results.'),
      t('27-29', 'Bounty Hunter', 1, 'Choose 1 enemy at the start of the game. Gain +1 to your rolls against that enemy, and -1 against all other units. If you successfully land the wound that puts that unit out of action you gain 2 credits.'),
      t('30-32', 'Armored', 2, 'Increase armour level by 1.', { aliases: ['Armoured'] }),
      t('33-35', 'Camouflage', 2, '-1 to be hit by shooting when in cover.'),
      t('36-38', 'Vengeful', 2, '+1 to CC, shoot & wound rolls against units that have wounded you this game.'),
      t('39-41', 'Acrobatic', 2, 'Can move through enemies by jumping over them. If you finish your move within 1" of them you still initiate a combat.'),
      t('42-44', 'Composed', 2, 'Use a D12 for task rolls instead of a D10.'),
      t('45-47', 'Fearless', 2, 'Ignore the penalty for multiple shock markers on all recovery rolls (capped at -1 modifier for shock tokens).'),
      t('48-50', 'Invulnerable', 2, 'Once per game re-roll a failed recovery roll.'),
      t('51-53', 'Cunning', 2, 'Re-roll 1 task roll per turn.'),
      t('54-56', 'Dodge', 2, 'If a shot at you misses, you may move 5" towards cover.'),
      t('57-59', 'Infiltrator', 2, 'Free 10" move at the start of the game.'),
      t('60-62', 'Lightning Fast', 2, 'If an enemy rolls a hit when shooting you, make a Hard (8+) task roll to dodge it.'),
      t('63-65', 'Slippery', 2, 'Ignore zones of control, can leave combat freely on your turn.'),
      t('66-68', 'Sprinter', 2, 'Get a free 3" move action every time this unit activates.'),
      t('69-71', 'Survivor', 2, '+1 to injury rolls (+10 for heroes).'),
      t('72-74', 'Blood Frenzy', 2, 'Ignore negative modifiers from wounds.'),
      t('75-77', 'Last Stand', 3, 'When reduced to 0 wounds, play out the rest of the turn and then remove from the battlefield.'),
      t('78-80', 'Medic', 3, 'When touching the base of a friendly unit, you may spend 1 action to make a Medium (5+) task roll to try and heal one of their wounds. On a natural roll of 1, inflict a wound instead.'),
      t('81-83', 'Stealthy', 3, '-1 to be hit by shooting at all times.'),
      t('84-86', 'Strategist', 4, 'Draw 1 extra card at the start of each turn.'),
      t('87-99', 'Choose any of the above', null, ''),
    ],
  },
  {
    id: 'cc', name: 'Close Combat Traits', dice: '2D10', source: 'SF',
    traits: [
      t('0-3', 'Concealed Weapon', 1, 'Once per game, roll 2 dice in CC and pick one result (can be used in combination with a 2 card to roll 3 dice!).'),
      t('4-7', 'Pugilist', 1, 'No penalty for fighting unarmed.'),
      t('8-11', 'Solid as a Rock', 1, 'Can’t be pushed back or moved in CC.', { aliases: ['Sold as a Rock'] }),
      t('12-15', 'Fancy Footwork', 1, 'Win draws in CC.'),
      t('16-19', 'Fearsome Appearance', 2, 'Enemies must make a Medium (5+) task roll to charge you.'),
      t('20-23', 'Street Fighter', 2, 'Ignore penalties for being outnumbered in CC.'),
      t('24-27', 'Two Fisted', 2, 'Can choose to roll 1 die for each enemy in CC (see main rules for further clarity).'),
      t('28-31', 'Flurry of Blows', 2, 'If you win a CC and only cause a shock result, you can choose to immediately fight again.'),
      t('32-35', 'Stampede', 2, 'Make a Medium (5+) task roll to move through an enemy’s control zone. On a nat 1 you bounce off them and are knocked down.'),
      t('36-39', 'Riposte', 2, 'If an opponent fails to wound you after beating you in CC, make a Hard (8+) task roll in order to roll to wound them back.'),
      t('40-43', 'Steadfast Defence', 2, 'Negate enemy charging bonuses in CC.'),
      t('44-47', 'Disarm', 2, 'If you roll 1 away from causing a wound in CC, you disarm the enemy (if they’re holding a CC weapon).'),
      t('48-51', 'Unstoppable', 3, 'Once per turn, if you put your opponent "Out of Action" in CC, you may immediately fight an enemy within 5".'),
      t('52-55', 'Defensive Fighter', 3, 'When defending in CC if you win the combat, you may immediately make an attack of your own against the attacker.'),
      t('56-59', 'Determined', 3, 'Ignore shock tokens in CC.'),
      t('60-63', 'Bloodthirsty', 3, 'You must charge if there are any enemies within range. You gain a +1 on your CC roll and Wound roll when charging.'),
      t('64-67', 'Running Attack', 3, 'If you win a CC, and push the enemy(s) back, you may use any remaining movement you had to engage and fight a NEW enemy.'),
      t('68-71', 'Thundering Charge', 3, '+1 to CC roll when charging.'),
      t('72-75', 'Weapon Master', 3, '+1 to CC roll (must be holding a CC weapon).'),
      t('76-79', 'Freight Train', 3, 'When winning a CC by 5 or more, knock your opponent down in addition to whatever wound result you roll.'),
      t('80-83', 'Ferocious', 4, '+1 to Wound in CC.'),
      t('84-86', 'Sharp Tongued', 4, 'Make a Medium (5+) task roll to force your opponent to re-roll 1 CC die.'),
      t('87-89', 'Brawler', 4, 'Re-roll your CC die once per turn.'),
      t('90-98', 'Choose any of the above', null, ''),
      t('99', 'Master of Melee', 5, 'Roll 2 dice in CC and pick the best result. Stacks with the 2 card.'),
    ],
  },
  {
    id: 'shooting', name: 'Shooting Traits', dice: '2D10', source: 'SF',
    traits: [
      t('0-5', 'Loads of Ammo', 1, 'Ignore first Out of Ammo result of the game.'),
      t('6-11', 'Two Gunned', 1, 'Can use burst, but don’t go out of ammo unless rolling at least two 1s.'),
      t('12-17', 'Deep Breath', 2, 'Aiming grants a +3 bonus.'),
      t('18-23', 'Deft', 2, 'Reloading costs 1 less action.'),
      t('24-29', 'Eagle Eyed', 2, 'Increase range by 2"/4".'),
      t('30-35', 'Steady', 2, 'Ignore shock tokens on shots.'),
      t('36-41', 'Target Lock', 2, 'Can shoot units in combat without having to make any extra rolls.'),
      t('42-47', 'Lucky Shot', 2, 'When missing a shot, choose another enemy within 3" and roll a D8; on an 8 it hits that enemy and you roll to wound as normal.'),
      t('48-53', 'High Ground', 2, 'Reduce enemy cover level when shooting from higher ground than the target (must be at least 1" of elevation).'),
      t('54-59', 'Deadeye', 3, '+1 to shoot rolls.'),
      t('60-64', 'Quickdraw', 3, 'When charged by an enemy, take a close range shot with a -2 penalty with a ranged weapon that only requires 1 equipment slot.'),
      t('65-69', 'Hipfire', 3, 'You can make a double move (not into CC) and take a shot with a -1 modifier. Measure range and line of sight from the halfway point of your move (1 eq slot weapons only).'),
      t('70-74', 'Double Tap', 3, 'If you hit but don’t wound with a shot, make another shot at the same target with a -1 penalty (non-specialist weapons that do not require a reload; with Deft you can use this with a reload 1 weapon).'),
      t('75-79', 'Run & Gun', 3, 'When charging an enemy with a double move, take a close range shot with a -2 penalty with a ranged weapon that only requires 1 equipment slot (pistols, slings etc.).'),
      t('80-84', 'Killer', 4, '+1 to wound rolls with ranged weapons.'),
      t('85-89', 'Sniper', 4, 'Re-roll 1 shoot roll per turn.'),
      t('90-98', 'Choose any of the above', null, ''),
      t('99', 'Ranged Fighter', 5, 'D12 for shooting and wounding at range, but D8 for CC rolls and rolls to wound in CC (overrides any dice upgrades you may get).'),
    ],
  },
  {
    id: 'hero', name: 'Hero Only Traits', dice: 'D12', source: 'SF',
    traits: [
      t('1', 'Bodyguard', 3, 'You may apply a Wound result to any friendly model within 2" instead of taking the Wound yourself.'),
      t('2', 'Sixth Sense', 4, 'Force an enemy to re-roll one shoot action against you per turn.'),
      t('3', 'Encouraging', 4, 'As an action, remove all shock from a friendly within 12".'),
      t('4', 'Gadgeteer', 4, 'Roll on the other gear table at the start of each game (does not take up any equipment slots).'),
      t('5', 'Leach', 5, 'If you cause a wound in CC, heal 1 wound.'),
      t('6', 'Poison/Corrosive Rounds', 5, 'If you cause a wound on a unit, roll for a wound on that unit at the end of each round. If you roll a 1 in CC, or go out of ammo, you are out of Poison/Corrosive rounds for the rest of the game. Must pick between CC or shooting, NOT BOTH.'),
      t('7', 'Lucky', 6, 'You may re-roll any die once per turn.'),
      t('8', 'Tough as Nails', 6, '+1 wound and increase maximum wounds to 4.'),
      t('9', 'Cold Blooded', 6, 'You gain +1 in CC or to hit with shooting for each shock and wound marker your opponent has.'),
      t('10', 'Damaging Aura', 6, 'As an action place the 3" blast template on your model, roll to wound ANY other units under the template.'),
      t('11', 'Terrifying Presence', 6, 'Enemy units within 4" get -1 to all their rolls except wound rolls.'),
      t('12', 'Choose any of the above', null, ''),
    ],
  },
  {
    id: 'negative', name: 'Negative Traits', dice: '2D10', source: 'SF',
    traits: [
      t('0-6', 'Unlucky', -3, 'Each enemy unit gets 1 free re-roll against this unit per game.'),
      t('7-13', 'Brittle', -2, '+1 to all wound rolls made against this unit.'),
      t('14-20', 'Deserter', -2, 'All checks to run away are hard task rolls (8+) regardless of the difference in shock and wounds.'),
      t('21-27', 'Sluggish', -2, 'This unit can only be activated once all your other units have been activated.'),
      t('28-33', 'Coward', -1, 'Must make a Medium (5+) task roll before charging an enemy.'),
      t('34-39', 'Drunkard', -1, 'Start the game with 1 shock token.'),
      t('40-45', 'Lousy Shot', -1, '-1 to hit when shooting.'),
      t('46-51', 'Slow', -1, '-1" movement.'),
      t('52-57', 'Unskilled', -1, '-1 to CC rolls.'),
      t('58-63', 'Clumsy', -1, 'For each move action you take, roll a D10; on a 1, you fall over and your activation ends.'),
      t('64-69', 'Sore Thumb', -1, 'Reduce cover tier by 1.'),
      t('70-75', 'Incompetent', -1, 'Use a D8 for task rolls.'),
      t('76-81', 'Fumbler', -1, 'Must make an Easy (3+) task roll to be able to pick up their weapon.'),
      t('82-87', 'Simpleton', -1, 'Can’t interact with objectives such as marking crates, or disarming shield generators.'),
      t('88-93', 'Brain Damage', -1, 'At the start of this unit’s activation, roll a D10. On a 1, this unit makes a double move in a random direction, chosen by rolling a D10.'),
      t('94-99', 'PTSD', -1, 'At the start of this unit’s activation, roll a D10. On a 1, this unit makes an attack (CC or ranged) on the nearest unit (ally/enemy) and then ends their activation.'),
    ],
  },
  {
    id: 'force-powers', name: 'Force Powers', dice: 'D12', source: 'JS',
    note: '6 differs for dark side (DS) and light side (LS).',
    traits: [
      t('1', 'Jump', 1, 'Use 2 actions to jump to a surface that’s no more than 8" away in a straight line.'),
      t('2', 'Sprint', 1, 'When using both actions to move, gain an extra 3" of movement (total).'),
      t('3', 'Battle Meditation', 1, '+2 to shock recovery rolls.'),
      t('4', 'Pull', 3, 'Place the 3" template up to 12" away. Roll to hit each unit under the template on a 5+. If hit, the unit is pulled 3" towards you and gains a shock token. For each 1 rolled, this unit gains a shock token.'),
      t('5', 'TK Grab', 3, 'Make a task roll to be able to pick up something within 12", and move it up to 5" in any direction. Medium (5+) for objects, Hard (8+) for other units. If lifted in the air, the object drops to the ground at the end of this unit’s activation.'),
      t('6 (DS)', 'Choke', 2, 'Ranged attack with a range of 6/12".'),
      t('6 (LS)', 'Heal', 3, 'If in contact with a friendly, spend 1 action to remove 1 wound or all shock tokens on that unit.'),
      t('7', 'Lightning/Force Justice', 3, 'Acts like a ranged weapon with range 9/18" and Splash.'),
      t('8', 'Lightsaber Throw', 2, 'As an action, make a Hard (8+) task roll to throw your lightsaber at a target within 12". On a 1, your lightsaber is dropped on the floor halfway between you and your target.'),
      t('9', 'Dominate', 3, 'For 2 actions, make a Medium (5+) task roll to take control of a non-hero, non-force wielder enemy unit, and take 2 actions with them. This does not affect that unit’s turn; they can still be activated as normal later in the turn if they have not already activated this turn.'),
      t('10', 'Mind Trick', 2, 'When charged by an enemy, you may choose to make a Hard (8+) task roll. On success the enemy gets to just outside your control zone and their activation ends.'),
      t('11-12', 'Choose any of the above', null, ''),
    ],
  },
  {
    id: 'force-misc', name: 'Misc Traits & Force Powers', dice: null, source: 'JS',
    traits: [
      t(null, 'Shii-Cho', 3, '+1 in CC rolls with lightsabers.'),
      t(null, 'Block', 2, 'If shot at, make a task roll to try and block the shot. Hard (8+) for 12" or less, Medium (5+) for more than 12".'),
      t(null, 'Push', 3, 'Place the 3" template up to 12" away. Roll to hit each unit under the template on a 5+. If hit, the unit is pushed back 3" and gains a shock token. For each 1 rolled, this unit gains a shock token.'),
      t(null, 'Conduit of Evil', 2, 'If a dark side force user opponent gets a result that puts a shock token on this unit during close combat, make a Hard (8+) task roll to transfer that shock onto the opponent instead.'),
      t(null, 'Deflect', 3, 'After rolling to block, you must also make a shoot roll to see if the blaster bolt is reflected back at the target, rather than just instantly rolling to wound. Only works on energy weapons, not arrows etc. (0-12" 5+, 12-24" 8+, 24-48" 10+).'),
    ],
  },
];

TRAIT_TABLES.push({
  id: 'sf-other', name: 'Other Campaign Traits', dice: null, source: 'SF',
  note: 'Gained from the hero promotion table rather than a trait table.',
  traits: [
    t(null, 'Weapons Specialist', 0, 'Can buy and use specialist weapons (Sniper, Minigun, Flamethrower, Rocket Launcher), which heroes otherwise cannot take.'),
    t(null, 'Force Sensitive', 0, 'Replace any ranged and melee weapons with a lightsaber.'),
  ],
});

TRAIT_TABLES.push({
  id: 'gh', name: 'Unit Traits from the GH Rulebook', dice: null, source: 'GH',
  note: 'Not in the campaign docs, so the text is from the Galactic Heroes 2nd Ed rulebook (Leader is summarised from p. 27).',
  traits: [
    t(null, 'Leader', null, 'Given free to the squad leader. Friendly units within 12" and in line of sight of the leader get +1 when rolling to recover from Shaken or from being Wounded and Down. A natural 1 still fails: a unit removing shock routs, and a unit trying to get up from a wound expires.'),
    t(null, 'Small', null, 'You are smaller than most. That makes you a hard target. Enemies shooting at you get a -1 to their roll. However, your size gives you only 2 wounds instead of the normal 3, as well as a -1 to any wound rolls you deliver in Close Combat.'),
    t(null, 'Soulless', null, 'You never take Shock results. But your lack of self-preservation makes you easier to hit. Anyone targeting you with a Shoot action gets a +1 to their roll.'),
  ],
});

// Lightsaber forms: advance a level (I, II, III) to gain that level's traits.
export const LIGHTSABER_FORMS = [
  { roll: 1, name: 'Form II – Makashi', text: 'Focused solely on lightsaber duelling, using precise and elegant movements such as fencing parries and ripostes to get the better of opponents, disarming or wounding them.',
    levels: [['Fancy Footwork (2)'], ['Riposte (2)'], ['Brawler (4)']] },
  { roll: 2, name: 'Form III – Soresu', text: 'Focused around defence and blocking. Further specialization can make the user almost impossible to kill with blaster or lightsaber alike.',
    levels: [['Cunning (2)'], ['Steadfast Defence (2)'], ['Composed (2)', 'Armoured (2)']] },
  { roll: 3, name: 'Form IV – Ataru', text: 'The most acrobatic form, intended for duelling. Practitioners use the force to augment their speed, agility and jumping.',
    levels: [['Slippery (1)', 'Dodge (2)'], ['Acrobatic (2)'], ['Running Attack (3)']] },
  { roll: 4, name: 'Form V – Shien', text: 'A more aggressive adaptation of Form III, using the lightsaber to direct blaster fire back at a target rather than just blocking it.',
    levels: [['Deflect (3)'], ['Steady (2)'], ['Deadeye (3)']] },
  { roll: 5, name: 'Form V – Djem-So', text: 'Bats away the opponent’s lightsaber using physical strength, leaving them open to devastating counter attacks.',
    levels: [['Disarm (2)'], ['Determined (3)'], ['Defensive Fighter (3)']] },
  { roll: 6, name: 'Form VI – Niman', text: 'An amalgamation of the first 5 forms; masters seamlessly integrate force powers such as pushes, pulls and grabs into their fighting.',
    levels: [['Smart (1)'], ['Strategist (4)'], ['Sharp Tongued (4)']] },
  { roll: 7, name: 'Form VII – Juyo (DS only)', text: 'The ferocity form. Practitioners draw on their most aggressive and violent feelings to fuel their strikes.',
    levels: [['Ferocious (4)', 'Brittle (-1)'], ['Blood Frenzy (2)'], ['Bloodthirsty (3)']] },
  { roll: 8, name: 'Form VII – Vapaad (LS only)', text: 'Like Juyo, but users draw on their opponents’ anger and hatred to fuel their strikes, keeping their own emotions in the light.',
    levels: [['Conduit of Evil (2)'], ['Flurry of Blows (2)'], ['Unstoppable (3)']] },
];

const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const INDEX = new Map();
for (const table of TRAIT_TABLES) {
  for (const tr of table.traits) {
    if (tr.pts === null && !tr.text) continue;
    for (const n of [tr.name, ...(tr.aliases ?? [])]) INDEX.set(norm(n), { ...tr, table: table.name });
  }
}

export const findTrait = name => INDEX.get(norm(name)) ?? null;
