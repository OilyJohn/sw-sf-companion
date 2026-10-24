// Gameplay rules for the Gameplay Rules page.
// Quick Reference is page 3 of Alex's "Gameplay Rules Amendments".
// Every other section is a short summary, in our own words, of the Galactic Heroes 2nd Edition
// rulebook (the "GH p." numbers are the page numbers printed in the book), with the
// Amendments overriding anything they mention. `amended` marks those points
// (a string says what changed) and `gh` says what the old GH rule was.

export const QUICK_REFERENCE = [
  { title: 'Suit Order', text: '♠ Spades, ♥ Hearts, ♦ Diamonds, ♣ Clubs. When two players hold the same card value, the earlier suit goes first.' },
  { title: 'Special Cards', table: [
    ['Queen of Spades', 'Remove all Shock'],
    ['Queen of Hearts', 'Remove 1 Wound, once per unit, gets more difficult each time D10 (2+, 4+, 6+, 8+, 10)'],
    ['One Eyed Jacks (♥ ♠)', '+1 Shoot rolls'],
    ['Other Jacks (♦ ♣)', '+1 to Close Combat rolls'],
    ['7 cards', 'Reroll one die result'],
    ['6 cards', 'Reload automatically'],
    ['Deuce', 'Roll 2 dice, pick the best result'],
    ['Aces', 'Wild'],
  ] },
  { title: 'Movement', list: [
    'Walking 5" / Creeping 3"',
    '-1" of movement per wound + shock, per action moving.',
    'Difficult Terrain: half rate.',
    'Obstacles: -1" for low walls and fences, full action for high walls (up to 2x model height).',
    'Up/Down a Floor: -3"',
  ] },
  { title: 'Shooting', text: 'Short Range 5+ / Long Range 8+ to hit.', list: [
    'Cover: Light Cover -1 / Heavy Cover -2',
    'Size: Target is Small -1 / Large +1 / Huge +2',
    'Wounds/Shock: -1 for each Wound and Shock marker',
    'Other: Target is Downed -1 / Target is Creeping -1',
    'Shooter used first action to Aim +2',
  ] },
  { title: 'Close Combat', list: [
    'Charging: +1',
    'Wounds/Shock: -1 for each Wound and Shock marker',
    'Outnumbered: -1 per attacker after first (-1 for facing 2 attackers, -2 for 3, etc.)',
    'Prone or no weapon: -1',
    'Close Combat Weapon: +? according to weapon',
    'Defending a wall/defensive terrain: +1',
  ], after: [
    'If the roll is a tie after modifiers, the units stay locked in combat.',
    'Take the difference between the two rolls after modifiers for a bonus on your wound roll:',
  ], table: [['1-2', '+0'], ['3-4', '+1'], ['5-6', '+2'], ['7 or more', '+3']] },
  { title: 'Shock Recovery Table (D10)', table: [['1-', 'Run Away'], ['2-5', 'Still Shaken'], ['6+', 'Recovered']], foot: '-1 to roll for each shock and wound token on the unit' },
  { title: 'Downed Recovery Table (D10)', table: [['1-', 'Bleed Out'], ['2-5', 'Still Downed'], ['6+', 'Recovered']], foot: '-1 to roll for each shock and wound token on the unit' },
  { title: 'Regular Wound Table (D10)', table: [['2-', 'Nothing'], ['3-6', 'Shaken'], ['7+', 'Wounded'], ['Nat 10+', 'Wounded & Downed']], foot: '+1 to roll for each wound target has already sustained' },
  { title: 'Stun Wound Table (D10)', table: [['2-', 'Nothing'], ['3-5', 'Shaken'], ['6-7', 'Shaken x2'], ['8+', 'Wounded'], ['Nat 10+', 'Wounded, Downed & Shaken']], foot: '+1 to roll vs droids' },
];

const SHOCK_RECOVERY = [
  ['1-', 'Run Away: immediately make 2 full moves directly away from whatever last inflicted shock on the unit. If this takes it off the battlefield it is removed from play. Ends its activation.'],
  ['2-5', 'Still Shaken: no shock removed, but it may move up to 5" away from whatever last shocked it. 1 action left, which cannot be used to try to recover again.'],
  ['6+', 'Recovered: remove all shock tokens. 1 action left.'],
];

const DOWNED_RECOVERY = [
  ['1-', 'Bleed Out: the unit succumbs to its wounds and is taken out of play.'],
  ['2-5', 'Still Downed: stays down, but may crawl up to 2".'],
  ['6+', 'Recovered: the unit stands up. 1 action left.'],
];

export const SECTIONS = [
  {
    id: 'quick',
    name: 'Quick Reference',
    sub: 'Gameplay Rules Amendments, page 3',
    items: QUICK_REFERENCE,
  },
  {
    id: 'turn',
    name: 'Cards, Turn & Activations',
    sub: 'GH pp. 4-5',
    items: [
      { title: 'Each turn', list: [
        'Shuffle every card (deck and discard pile) together at the start of every turn.',
        'Deal each player one card per model they control. You may look at your own cards only.',
      ], ref: 'GH p.4' },
      { title: 'Activating', text: [
        'A Caller counts down from Kings to Deuces. When your card\'s value is called, play it to activate one model, which then takes two actions.',
        'Cards cannot be saved for later, and each model activates only once per turn. The turn ends when every card has been played.',
      ], ref: 'GH p.4' },
      { title: 'Same card value', text: 'Suit order decides: Spades, then Hearts, then Diamonds, then Clubs.', ref: 'GH p.4' },
      { title: 'Aces', text: [
        'Wild: an Ace can stand in for any card (including its special ability), but must be played when that value is called.',
        'A real card always goes before an Ace pretending to be it. Several Aces as the same card follow suit order.',
      ], ref: 'GH p.5' },
      { title: 'Spare cards', text: 'If a model is removed before it activates, keep its card until the end of the turn, then discard it.', ref: 'GH p.5' },
      { title: 'Quality die', text: 'Shooting, Close Combat, Recovery and Task rolls use a D10 unless a trait changes it (e.g. to D8 or D12, for all rolls or only some).', ref: 'GH p.4' },
      { title: 'Special Cards', table: [
        ['Queen of Spades', 'Remove all Shock. The model still gets its 2 actions.'],
        ['Queen of Hearts', 'Remove 1 Wound, once per unit, rolling a D10 that gets harder each time: 2+, 4+, 6+, 8+, then 10.'],
        ['One Eyed Jacks (♥ ♠)', '+1 to Shooting rolls this turn.'],
        ['Other Jacks (♦ ♣)', '+1 to Close Combat rolls this turn.'],
        ['7s', 'Re-roll one die result this turn.'],
        ['6s', 'Reload automatically. The model still gets its 2 actions.'],
        ['Deuces', 'Once, roll 2 dice for a Shooting, Close Combat, Task or Recovery roll and keep the best.'],
        ['Aces', 'Wild.'],
      ], amended: 'Queen of Hearts changed.', gh: 'Automatically heals 1 wound (and stands the model up) every time.', ref: 'GH p.5' },
    ],
  },
  {
    id: 'moving',
    name: 'Moving',
    sub: 'GH pp. 6-8',
    items: [
      { title: 'Move rates (per action)', table: [['Walking', '5"'], ['Creeping', '3"'], ['Vehicle', '6"']], ref: 'GH p.6' },
      { title: 'Movement penalties', list: [
        '-1" per wound and per shock marker, for every move action.',
        'Difficult terrain (woods, tall crops, marsh, shallow streams, rubble): half rate.',
        'Low walls and fences: -1". High walls (up to 2x model height): a full action. Anything taller is impassable without a ladder or similar.',
        'Going up or down a floor: -3".',
        'Impassable terrain (cliffs, deep wide rivers) cannot be crossed.',
      ], amended: 'Amendments add "up to 2x model height" for high walls.', ref: 'GH p.8' },
      { title: 'Zone of control', text: 'A model that comes within 1" of an enemy must stop, and Close Combat starts. Some traits or weapons extend this to 2". Downed models do not exert a zone of control.', ref: 'GH pp. 6, 15' },
      { title: 'Facing', text: 'There is none. Models can see and shoot in every direction and turn freely as they move.', ref: 'GH p.6' },
      { title: 'Leaving the table', text: 'Only voluntarily. A model pushed toward the edge stops at the edge instead.', ref: 'GH p.6' },
      { title: 'Creeping', text: [
        'Move 3" instead of 5" and mark the model as Creeping. Shooting at it is -1.',
        'The marker goes when the model makes a normal move, shoots, or comes within 12" of an enemy.',
      ], ref: 'GH p.7' },
      { title: 'Jumping', list: [
        'Needs a straight run-up at least as long as the jump; both count toward the model\'s move.',
        'Max 1" up or 3" down. You cannot jump over other models unless a trait allows it.',
        'Roll a die: on a 1 the jump fails and the model falls.',
      ], ref: 'GH pp. 6-7' },
      { title: 'Falling', text: 'Roll on the Regular Wound Table, +1 for every 3" fallen.', amended: 'Uses your amended Regular Wound Table.', ref: 'GH p.7' },
      { title: 'Buildings', list: [
        'Entering or leaving costs nothing unless a door is locked.',
        'Each floor up or down costs 3". Without interiors, measure stairs from where the model entered; it can come out anywhere on the roof.',
        'Agree what every piece of terrain does before the game.',
      ], ref: 'GH p.8' },
    ],
  },
  {
    id: 'shooting',
    name: 'Shooting',
    sub: 'GH pp. 9-11',
    items: [
      { title: 'Taking a shot', text: [
        'Shooting takes an action; a model can shoot with one or both actions. Range is measured centre to centre; each weapon has a Short and Long range (see the Weapons doc).',
        'Roll the Quality die: Short range hits on 5+, Long range on 8+. A hit then goes to armour and the Wound Table.',
      ], ref: 'GH p.9' },
      { title: 'Shooting modifiers', list: [
        'Light cover -1 / Heavy cover -2',
        'Target Small -1 / Large +1 / Huge +2',
        '-1 per Wound and Shock marker on the shooter',
        'Target Downed -1 / Target Creeping -1',
        'Shooter Aimed with its first action +2',
      ], amended: 'Aim is now +2.', gh: '+1.', ref: 'GH p.10' },
      { title: 'Line of sight', text: [
        'You need a clear straight line not blocked by models or terrain. Agree it at eye level when unsure.',
        'Models inside terrain or buildings can only see out, or be seen, within 1" of the edge, door or window.',
      ], ref: 'GH p.9' },
      { title: 'Cover', list: [
        'Heavy (-2): touching a solid wall, or shooting from inside a building through a window.',
        'Light (-1): behind something flimsy like a wooden fence, or inside area terrain.',
        'Cover is ignored if the shooter outflanks it, e.g. same side of the wall or inside the same building.',
        'Area terrain (woods, tall crops): only targetable within 1" of its edge. Two models inside the same area are both in light cover and can only see each other within 6".',
      ], ref: 'GH p.10' },
      { title: 'Rolling a 1: Out of Ammo', text: [
        'Mark the model Out of Ammo. It cannot shoot again until it reloads.',
        'Reloading takes both actions of one activation, back to back; it cannot be split across turns. A 6 card reloads automatically.',
      ], ref: 'GH p.9' },
      { title: 'Shooting into a group', text: 'If the line to the target crosses another model, that model may be hit too. Roll to hit as normal, then randomise which model is hit.', ref: 'GH p.11' },
      { title: 'Darkness', text: 'Unless the scenario says otherwise, line of sight is 12" and all weapon ranges are halved.', ref: 'GH p.11' },
    ],
  },
  {
    id: 'cc',
    name: 'Close Combat',
    sub: 'GH pp. 12-14',
    items: [
      { title: 'Starting a fight', list: [
        'Ending a move within 1" of an enemy starts Close Combat, even after using both actions to move.',
        'Otherwise fighting costs an action, and a model can only start one Close Combat per turn unless a trait says otherwise.',
        'A model starting its activation within 1" of an enemy must use its first action to fight. This overrides recovery.',
        'The defender always turns to face, so there is no attacking from behind.',
      ], ref: 'GH p.12' },
      { title: 'Resolving', text: [
        'Both models roll their Quality die and add modifiers. The higher total wins and rolls to wound the loser, with a bonus from the difference:',
      ], table: [['1-2', '+0'], ['3-4', '+1'], ['5-6', '+2'], ['7 or more', '+3']], ref: 'GH p.12' },
      { title: 'After winning', text: 'If the loser is not taken out, the winner chooses: stay locked in combat, push the loser straight back 2", or swap places with them.', ref: 'GH p.12' },
      { title: 'Ties', text: 'If the totals are tied after modifiers, the units stay locked in combat and nobody rolls to wound.', amended: true, gh: 'On a tie the initiator chose to keep or push away the opponent.', ref: 'GH p.12' },
      { title: 'Close Combat modifiers', list: [
        '-1 per Wound and Shock marker',
        'Outnumbered: -1 per attacker after the first',
        'Prone or no weapon: -1',
        'Close combat weapon: as the weapon says',
        'Defending a wall or defensive terrain: +1',
        'Charging +1 (from outside the 1" zone; not if already in combat)',
      ], ref: 'GH p.14' },
      { title: 'Rolling a 1: Fumble', text: 'As well as whatever the opponent does to you, you lose that weapon for the rest of the game. Picking it back up takes an action and cannot be done within 1" of an enemy.', ref: 'GH p.13' },
      { title: 'Multiple combatants', text: 'When a model joins a fight, everyone involved rolls again. Each pair compares totals separately, so a model can beat one opponent and lose to another.', ref: 'GH p.13' },
      { title: 'Shaken or Downed defenders', list: [
        'A Shaken model fights at -1 per Shock marker. If it wins, it removes all its Shock.',
        'A Downed model stays down and fights at -1 for being prone, plus its Wound and Shock penalties. If it wins, it may roll straight away to stand.',
      ], ref: 'GH pp. 15, 17' },
      { title: 'Deadly weapons', text: 'A natural Close Combat roll of 10+ gives +3 to the wound roll.', amended: 'Nerfed.', gh: 'Deadly puts the target straight Out of Action.', ref: 'GH p.44' },
      { title: 'Knocking down doors', text: [
        'Fight it like Close Combat against a fixed roll: wooden fence 3, door 4, reinforced door 6, stone wall or rubble 7. Beat it and roll to wound: Shaken does nothing, Wounded damages it, and a result that would take it out destroys it (or opens a 2" gap). You cannot be hurt attacking a door.',
      ], ref: 'GH p.14' },
    ],
  },
  {
    id: 'wounding',
    name: 'Wounding',
    sub: 'GH pp. 15-16, 36-37',
    items: [
      { title: 'When you are hit', text: 'Each hit from Shooting, Close Combat or falling: roll armour first (if the model has any), then roll on the Wound Table.', ref: 'GH pp. 15, 36' },
      { title: 'Regular Wound Table (D10)', table: [['2-', 'Nothing'], ['3-6', 'Shaken'], ['7+', 'Wounded'], ['Nat 10+', 'Wounded & Downed']], foot: '+1 to the roll for each wound the target has already sustained.', amended: true, gh: '0- nothing, 1-5 Shaken, 6-8 Wounded & Down, 9+ Out of Action.', ref: 'GH p.15' },
      { title: 'Stun Wound Table (D10)', table: [['2-', 'Nothing'], ['3-5', 'Shaken'], ['6-7', 'Shaken x2'], ['8+', 'Wounded'], ['Nat 10+', 'Wounded, Downed & Shaken']], foot: '+1 to the roll vs droids.', amended: 'New table, not in GH.' },
      { title: 'Shaken', list: [
        'Add a Shock marker.',
        'If shot while in cover it stays put; if in the open it immediately moves toward the nearest cover, never toward an enemy.',
        'If from Close Combat, the winner chooses to stay, push back 2" or swap places.',
        'Each Shock marker: -1 to Shooting, Close Combat, Task and Recovery rolls, and -1" per move action.',
      ], ref: 'GH p.15' },
      { title: 'Wounded', list: [
        'Add a Wound marker: -1 to Shooting, Close Combat, Task and Recovery rolls, and -1" per move action, on top of any Shock.',
        'A unit reduced to 0 wounds is taken off the battlefield (then rolls for injuries back at the ship).',
        'Only a Queen of Hearts or a medic removes a Wound.',
      ], amended: 'Being Wounded no longer knocks a model down by itself; only a natural 10+ does. Your units use their own W value.', gh: '3 Wounds is Out of Action.', ref: 'GH pp. 15-16' },
      { title: 'Downed', list: [
        'The model lies prone (lay it down or mark it). It must try to stand when it next activates (see Recovery).',
        'It does not exert the 1" zone of control, and shooting at it is -1.',
        'Wounded within 1" of a roof edge: roll a D10. Odd, it falls off and rolls again on the Wound Table at +1 per 3" fallen.',
      ], ref: 'GH p.15' },
      { title: 'Armour', list: [
        'After a hit, roll a D10: Light Armour 8+, Heavy 6+, Extra Heavy 5+. A shield adds +1.',
        'If it passes, the Wound result drops one step (e.g. Wounded becomes Shaken, Shaken becomes Nothing).',
        'A natural 10+ on the attack roll finds a chink: no armour roll.',
        '-1 to the armour roll for each wound the unit has already sustained.',
        'Heavy Armour: -1" per move action and Tasks one level harder. Extra Heavy: the same, Tasks two levels harder, and no Creeping.',
      ], amended: 'Amendments repeat the -1 per wound already in GH.', ref: 'GH pp. 36-37' },
    ],
  },
  {
    id: 'actions',
    name: 'Other Actions',
    sub: 'GH pp. 6, 18, 20',
    items: [
      { title: 'What counts as an action', text: 'Each activation gives two actions, in any order and possibly the same twice: move, shoot, pick up or drop something, switch weapons, recover, aim, reload, attempt a task, or anything else everyone agrees on.', ref: 'GH p.6' },
      { title: 'Aim', text: 'Spend your first action aiming to get +2 on a shot with your second.', amended: true, gh: '+1.', ref: 'GH p.10' },
      { title: 'Reload', text: 'Both actions of one activation, back to back. A 6 card reloads automatically and keeps both actions.', ref: 'GH p.9' },
      { title: 'Ready', list: [
        'Use an action to Ready (overwatch) and mark the model.',
        'Later this turn, interrupt the model that is activating to shoot it at -1, if it is in line of sight.',
        'Or, when charged, pass a Regular (5+) Task to counter-charge: both models move toward each other and the charge bonus is cancelled.',
        'You cannot use your activation card\'s special ability with the interrupt. Ready ends at the end of the turn.',
      ], ref: 'GH p.18' },
      { title: 'Hide', list: [
        'Use an action to hide while in terrain or cover with no enemy in line of sight.',
        'A hidden model cannot be targeted unless spotted: a Hard (8+) Task by an enemy within 12" with line of sight. Any enemy within 6" spots it automatically.',
        'Moving or doing anything else reveals it; it keeps its cover. To hide again it must be out of enemy line of sight.',
      ], ref: 'GH p.20' },
      { title: 'Pick up a weapon', text: 'One action, and not within 1" of an enemy.', ref: 'GH p.13' },
      { title: 'Heroic Sacrifice (optional)', text: 'A model with Wounds or Shock can turn those penalties into bonuses for one last Close Combat, then it is taken out of play whatever happens.', ref: 'GH p.18' },
    ],
  },
  {
    id: 'recovery',
    name: 'Recovery',
    sub: 'GH pp. 17-18, 21',
    items: [
      { title: 'Shaken: your options when activated', list: [
        'Ignore it and keep the penalties.',
        'Rest: spend both actions to remove 1 Shock marker automatically (not within 1" of an enemy).',
        'Recovery roll: one action, on the Shock Recovery Table below.',
        'Only one recovery attempt per turn. A model starting within 1" of an enemy must fight instead.',
      ], ref: 'GH p.17' },
      { title: 'Shock Recovery Table (D10)', table: SHOCK_RECOVERY, foot: '-1 to the roll for each Shock and Wound token on the unit.', amended: true, gh: '1 = removed from play, 2-5 may fall back 5" from the enemy, 6+ remove all Shock.', ref: 'GH p.17' },
      { title: 'Downed Recovery Table (D10)', table: DOWNED_RECOVERY, foot: '-1 to the roll for each Shock and Wound token on the unit. A Downed model must try this when activated, unless it starts in Close Combat.', ref: 'GH p.17' },
      { title: 'Recovery shortcuts', list: [
        'Queen of Spades: remove all Shock, no roll.',
        'A Shaken model that wins a Close Combat removes all its Shock.',
        'Standing up does not remove Shock; that takes a separate recovery once standing.',
      ], ref: 'GH pp. 16-17' },
      { title: 'Leader', text: '+1 to Shock and Downed recovery rolls if within 12" and line of sight of a unit with the Leader trait. A natural 1 still fails.', ref: 'GH p.21' },
      { title: 'Retreat', text: [
        'At the start of its activation, if a unit has more Shock tokens than remaining wounds, it takes a Task roll based on the excess:',
      ], table: [['Exceeds by 1', 'Easy (3+)'], ['Exceeds by 2', 'Medium (5+)'], ['Exceeds by 3', 'Hard (8+)']], foot: 'Pass: activate as normal. Fail: Run Away (2 full moves directly away from whatever last shocked it), then its activation ends.', amended: true, gh: 'Retreat 2 moves automatically, then remove Shock down to remaining wounds; routs if it has nowhere to go.', ref: 'GH p.18' },
    ],
  },
  {
    id: 'tasks',
    name: 'Tasks',
    sub: 'GH pp. 19-20',
    items: [
      { title: 'Difficulty', table: [['Easy', '3+'], ['Regular', '5+'], ['Hard', '8+']], foot: 'A task takes an action. Players agree how hard a task is.', ref: 'GH p.19' },
      { title: 'Adjustments', list: [
        'One level harder if an enemy is within short range or within one enemy move.',
        '-1 per Shock and Wound marker.',
        'Heavy Armour: one level harder. Extra Heavy: two levels.',
      ], ref: 'GH pp. 15, 19, 36' },
      { title: 'Naturals and retries', list: [
        'A natural 10+ always passes. A natural 1 means something has gone wrong.',
        'Failing without rolling a 1 makes the next try one level harder; after Hard, every further attempt needs 10+.',
      ], ref: 'GH p.19' },
      { title: 'Swimming', list: [
        'Shallow water is difficult terrain. Deep water needs an Easy Task each time a model enters it (this roll does not use an action); swim 5".',
        'Armoured: Regular. Heavy Armour: Hard.',
        'Fail: take a Wound. Natural 1: it sinks and is out of play. Natural 10+: an extra 5" move.',
      ], ref: 'GH p.19' },
      { title: 'Fires', list: [
        'Lighting: in base contact with a flammable structure, Regular (5+) Task, then D10: 1-2 nothing, 3-8 one fire marker, 9-10 two. Roll again at the end of each turn to see if it spreads.',
        'Fighting: same Task, then D10: 1-2 nothing, 3-8 remove one marker, 9-10 remove two.',
        'Anyone inside or on the roof at the end of a turn rolls to wound: Shaken leaves the building, Wounded must recover to escape. A medium building collapses at six markers, taking out everyone inside.',
      ], ref: 'GH p.20' },
      { title: 'Spotting', text: 'Spotting a hidden model is a Hard (8+) Task within 12" and line of sight (see Hide in Other Actions).', ref: 'GH p.20' },
    ],
  },
];
