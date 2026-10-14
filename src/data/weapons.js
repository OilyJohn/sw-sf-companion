// Weapons and Gear page data.
// Weapons and their notes come from Alex's "SW_SF Weapons" doc; slot sizes come from equipment.js.
// `wound` is the doc's R/S column: which Wound Table a hit uses (Regular or Stun, see Amendments).
// Gear the Weapons doc doesn't cover (armour, shields, spear, jet pack) and the properties it
// only names are short summaries, in our own words, of the Galactic Heroes 2nd Edition rulebook
// ("GH p." = page numbers printed in the book). `aliases` are the names unit profiles use.

const w = (name, range, notes, wound, extra = {}) => ({ name, range, notes, wound, ...extra });

export const GEAR_GROUPS = [
  { id: 'melee', name: 'Close Combat Weapons', sub: 'Weapons doc', items: [
    w('Combat Knife', '-', 'Dagger', 'Regular', { aliases: ['Bayonet', 'Dagger'] }),
    w('Axe', '-', 'Wound roll +1', 'Regular'),
    w('Blunt Weapon', '-', 'AP1', 'Regular', { aliases: ['Club'] }),
    w('2H Axe', '-', 'Wound roll +1, AP1', 'Regular', { aliases: ['2 Hand Axe (Flail)'] }),
    w('2H Sword', '-', 'CC +1', 'Regular', { aliases: ['Conjured 2H Sword'] }),
    w('2H Blunt Weapon', '-', 'Add +1 shock to wound result, AP1', 'Regular'),
    w('Stun Baton', '-', '', 'Stun'),
    w('Vibrosword', '-', 'AP1', 'Regular'),
    w('Electrostaff', '-', 'Add +1 shock to wound result', 'Stun'),
    w('Force Pike', '-', 'Polearm, AP1', 'Regular'),
    w('Lightsaber', '-', 'Deadly', 'Regular'),
    w('Double Bladed Lightsaber', '-', 'Deadly, grants the Street Fighter trait', 'Regular'),
    w('Electro Whip', '-', 'When winning a CC roll, ALL units within 2" gain a shock token', 'Stun'),
    w('Spear', '-', 'Polearm when used two-handed. One-handed with a shield it loses the Polearm reach but keeps the +1 when charged.', 'Regular', { gh: true, ref: 'GH p.39' }),
  ] },
  { id: 'ranged', name: 'Ranged Weapons', sub: 'Weapons doc', items: [
    w('Bow', '12/24"', 'Reload 1', 'Regular'),
    w('Sling', '6/12"', '', 'Regular'),
    w('Stun Gun', '6/12"', '', 'Stun'),
    w('Stun Rifle', '12/24"', '', 'Stun'),
    w('Blaster Pistol', '6/12"', '', 'Regular'),
    w('Blaster Carbine', '12/24"', 'Burst Fire', 'Regular'),
    w('Blaster Rifle', '12/24"', 'Inaccurate', 'Regular', { aliases: ['Wrist Cannons'] }),
    w('Repeating Blaster', '12/24"', 'Suppressing Fire', 'Regular'),
  ] },
  { id: 'specialist', name: 'Specialist Weapons', sub: 'Weapons doc · heroes need Weapons Specialist', items: [
    w('Sniper', '16/32"', 'Specialist, Reload 1, Inaccurate from short range', 'Regular'),
    w('Minigun', '18/36"', 'Specialist, Inaccurate, Burst (Always)', 'Regular'),
    w('Flamethrower', 'Template', 'Specialist, see main rulebook', 'Regular', {
      text: 'GH: uses the teardrop template, thin end touching the shooter, and works like Burst Fire. Targets inside the short range ring get +1 on the Wound roll. Limited Ammo.',
      ref: 'GH p.42',
    }),
    w('Rocket Launcher', '12/24"', 'Specialist, Reload 2, Blast 5, Limited Ammo', 'Regular'),
  ] },
  { id: 'thrown', name: 'Grenades & Thrown', sub: 'Weapons doc', items: [
    w('Thermal Detonator', 'd10+3"', 'See main rulebook', 'Regular', {
      aliases: ['Wrist Rocket', 'Wrist Rockets', 'Green Fireball'],
      text: 'GH grenade: pick a target point, roll d10 and add 3" for how far it flies along that line, then centre the 3" Blast template there. A Shoot roll of 1 blows up in the thrower\'s hand: +1 on the Wound roll and friends under the template are hit too.',
      ref: 'GH pp. 41, 44',
    }),
    w('Shock Grenade', 'd10+3"', '', 'Stun'),
    w('Throwing Weapons', 'Charge', 'When charging an enemy, make a close range attack with a -2 modifier. Ignore cover. 1 use per game per throwing weapon.', 'Regular'),
  ] },
  { id: 'armour', name: 'Armour & Shields', sub: 'Galactic Heroes rulebook', items: [
    { name: 'Light Armour', gh: true, text: 'After each hit, roll a D10: 8+ lowers the Wound result one step (Out of Action to Wounded, Wounded to Shaken, Shaken to nothing). No armour roll if the attack was a natural 10+.', amended: '-1 to the armour roll for each wound the unit already has.', ref: 'GH p.36' },
    { name: 'Heavy Armour', gh: true, text: 'As Light Armour but saves on 6+. The wearer moves 1" less per move action and Tasks are one level harder.', amended: '-1 to the armour roll for each wound the unit already has.', ref: 'GH p.36' },
    { name: 'Shields', gh: true, text: '+1 to the armour roll, and -1 to be hit by shooting (doesn\'t stack with cover). When outnumbered in CC, ignore the penalty for the second enemy. No Creeping and no 2-handed weapons; a spear or polearm can be carried but loses its abilities.', ref: 'GH p.37' },
    { name: 'Energy Shield (Buckler)', gh: true, text: 'A shield that allows Creeping and can be used as a second weapon with the Two-Fisted trait, but gives no -1 to be shot.', ref: 'GH p.37' },
    { name: 'Tower Shield', gh: true, text: 'A shield that can be planted with an action: -2 to be hit by shooting, and models behind it in base contact get -1. Lasts until the bearer moves.', ref: 'GH p.37' },
  ] },
  { id: 'gear', name: 'Other Gear', sub: 'Galactic Heroes rulebook', items: [
    { name: 'Jet Pack', gh: true, text: 'Gives the Flier trait: moves over terrain in the way at no cost and can use a move to go straight up or down. Lands between moves.', ref: 'GH p.27' },
    { name: 'Ewok Glider', text: 'Works like a Jet Pack (Alex).' },
  ] },
];

export const PROPERTIES = [
  { name: 'Suppressing Fire', tag: 'New', text: 'If you miss a shot, make a Hard (8+) Task roll to give the target 1 shock token.' },
  { name: 'Inaccurate', tag: 'Buffed', text: 'Choose to take a regular shot, or a shot at -1 to hit and +1 to wound.', gh: 'Always -1 to hit, +1 to wound.', ref: 'GH p.44' },
  { name: 'Deadly', tag: 'Nerfed', text: 'Natural CC rolls of 10+ are an automatic Wounded result.', gh: 'Automatically Out of Action.', ref: 'GH p.44' },
  { name: 'AP (Armour Piercing)', text: 'The target\'s armour drops one level: Heavy counts as Light, Light counts as none.', ref: 'GH p.44' },
  { name: 'Burst Fire', text: 'Against a target in short range, place the 3" template and roll to hit, at -1, every model at least half under it. Ignore the template\'s wound bonus ring. "Burst (Always)" can do this at long range too.', ref: 'GH p.44' },
  { name: 'Blast', text: 'Centre the template (Blast 5 = 5" across) on a model or point in sight and roll to hit. Every model at least half under it is hit, with +1 to wound in the centre ring. A miss scatters d10" in the direction the die points (double at long range). Rolling to hit equal to or under the number of models under it means Out of Ammo. A natural 1 can blow up on the shooter.', ref: 'GH p.44' },
  { name: 'Reload', text: 'Must reload after each shot, taking this many actions in a row (Reload 1 = one action).', ref: 'GH p.45' },
  { name: 'Limited Ammo', text: 'Once Out of Ammo, it stays out for the rest of the game.', ref: 'GH p.45' },
  { name: 'Polearm', text: 'Attacks from 2" instead of 1", and gets +1 in CC when charged. Can\'t be used with a shield.', ref: 'GH pp. 39, 45' },
  { name: 'Specialist', text: 'Only Specialists and Leaders can use it. In this campaign heroes need the Weapons Specialist trait to buy one.', ref: 'GH p.45' },
];
