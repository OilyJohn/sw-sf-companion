// The Other Gear table from the Galactic Heroes 2nd Edition rulebook (GH pp. 46-48), rolled on
// 2D10 read as 1-100 (00 = 100). Effects are short summaries in our own words; slot costs are
// the book's. Used by Other Gear promotion rolls and by the Gadgeteer trait.
// 13-14 isn't on the table, so it's rolled again.

const g = (from, to, name, slots, text) => ({ from, to, name, slots, text });

export const OTHER_GEAR = [
  g(1, 4, 'Anti Gravity Harness', 1, 'Gives the Strong and Mule traits.'),
  g(5, 8, 'Autonomous Turret', 3, 'Takes both actions to set up, then can\'t move. Fires all round at the start of each turn, before anyone activates, with a mounted Machine Gun, Heavy Blaster or Heavy Laser. Limited Ammo; an enemy in base contact in Close Combat disables it.'),
  g(9, 12, 'Belt Shield', 1, 'The wearer always counts as in Light Cover.'),
  g(15, 16, 'Chameleon Cloak', 1, 'Spend an action to put it on: the wearer counts as hidden even out of cover.'),
  g(17, 20, 'Combat Drugs', 1, 'Once per game, spend an action to remove all Shock from this model or one in contact (like the Queen of Spades).'),
  g(21, 24, 'Comms Jammers', 1, 'Enemies can\'t use the Advanced Comms trait.'),
  g(25, 28, 'Drone', 2, 'A small Flier, Soulless drone that moves at the start of each turn. Your side can see what it sees, so grenades and grenade launchers can target enemies only the drone sees. When gained, roll a D10: on 9-10 it also has an autorifle.'),
  g(29, 32, 'Exoskeleton', 1, 'Gives the Strong and Quick traits.'),
  g(33, 36, 'Extra Ammo', 1, 'Ignore the first Out of Ammo result.'),
  g(37, 40, 'Holo-Suit', 2, '-1 to enemy Shoot rolls against the wearer, stacking with cover. If the wearer is wounded, roll a die: on a 1 it stops working for the game.'),
  g(41, 44, 'Jet Pack', 2, 'Gives the Flier trait. Roll after each flight: on a 1 it\'s out of fuel for the game.'),
  g(45, 48, 'Medi Pack', 1, 'Once per game, spend an action to remove 1 wound from this model or one in contact (like the Queen of Hearts).'),
  g(49, 52, 'Micro Launcher', 1, 'Adds a grenade launcher to the model\'s main ranged weapon.'),
  g(53, 56, 'Nightvision Goggles', 1, 'Gives the Nightvision trait.'),
  g(57, 60, 'Optical Sights', 1, 'Gives the Deadeye trait.'),
  g(61, 64, 'Phase Suit', 1, 'Lets the wearer move through solid walls and objects. Roll a D10 each use: on a 1, roll on the Wound table.'),
  g(65, 68, 'Power Fists', 2, '+1 to hit in Close Combat and +1 to the Wound roll.'),
  g(69, 72, 'Psionic Helmet', 1, 'Gives one ability from the GH Psionics section.'),
  g(73, 76, 'Shock Screen', 1, 'Gives the Damaging Aura trait.'),
  g(77, 80, 'Suction Boots', 1, 'The wearer moves up vertical surfaces as if they were flat ground.'),
  g(81, 84, 'Teleporter Belt', 1, 'Spend an action to teleport to a point in sight. Roll a D10: the model lands that many inches off target in the direction the die points (double it for a jump over 24"). Landing in solid terrain places it beside it and rolls on the Wound table.'),
  g(85, 88, 'Void Bag', 1, 'Holds up to 20 slots of equipment. Spend an action to take out or put away an item; the model can still only use what it could normally carry.'),
  g(89, 95, 'X Weapon', null, 'An experimental weapon: +1 to Shoot or Close Combat rolls. Roll a D10 for the weapon. It takes 1 more slot than the ordinary version.'),
  g(96, 100, 'Choose', null, 'Choose any item from the table.'),
];

// X Weapon D10 roll, with the ordinary weapon's GH slot cost.
export const X_WEAPONS = [
  ['Axe', 1], ['Sword', 1], ['Auto Pistol', 1], ['Auto Rifle', 2], ['Laser Pistol', 1],
  ['Laser Rifle', 2], ['Blaster Pistol', 1], ['Blaster Rifle', 2], ['Mace', 1], ['Knife', 1],
].map(([base, slots], i) => ({ roll: i + 1, name: `X ${base}`, slots: slots + 1 }));

export const otherGearRow = n => OTHER_GEAR.find(r => n >= r.from && n <= r.to) ?? null;

// Items that can be picked from "Choose" (every real item, X Weapons by type).
export const CHOOSABLE_GEAR = [
  ...OTHER_GEAR.filter(r => r.slots !== null).map(r => r.name),
  ...X_WEAPONS.map(x => x.name),
];

export const OTHER_GEAR_SLOTS = Object.fromEntries([
  ...OTHER_GEAR.filter(r => r.slots !== null).map(r => [r.name, r.slots]),
  ...X_WEAPONS.map(x => [x.name, x.slots]),
]);
