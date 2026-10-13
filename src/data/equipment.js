// Equipment slot sizes, keyed by the names used in factions.js.
// From "SW_SF Weapons" unless noted. Aliases from the Factions doc: Wrist Rocket = Thermal
// Detonator, Wrist Cannons = Blaster Rifle, Bayonet = Combat Knife. Club = Blunt Weapon.
// GH = Galactic Heroes rulebook (armour, shields, spear, jet pack).
export const EQUIPMENT_SLOTS = {
  'Combat Knife': 1,
  'Bayonet': 1,
  'Axe': 1,
  'Club': 1,
  '2H Axe': 2,
  '2H Weapons': 2,
  'Vibrosword': 1,
  'Electrostaff': 2,
  'Lightsaber': 2,
  'Electro Whip': 3,
  'Spear': 2, // GH
  'Bow': 2,
  'Sling': 1,
  'Stun Gun': 1,
  'Stun Rifle': 2,
  'Blaster Pistol': 1,
  'Blaster Carbine': 2,
  'Blaster Rifle': 2,
  'Repeating Blaster': 2,
  'Wrist Cannons': 2,
  'Thermal Detonator': 1,
  'Wrist Rocket': 1,
  'Wrist Rockets': 1,
  'Shock Grenade': 1,
  'Throwing Weapons': 1,
  'Light Armour': 1, // GH
  'Heavy Armour': 2, // GH
  'Energy Shield (Buckler)': 1, // GH
  'Tower Shield': 1, // GH
  'Jet Pack': 2, // GH
  'Ewok Glider': 2, // works like a jet pack (Alex)
  // In the Weapons doc but on no unit profile: heroes can still buy them.
  'Blunt Weapon': 1,
  '2H Sword': 2,
  '2H Blunt Weapon': 2,
  'Stun Baton': 1,
  'Force Pike': 2,
  'Double Bladed Lightsaber': 3,
  'Sniper': 3,
  'Minigun': 3,
  'Flamethrower': 3,
  'Rocket Launcher': 3,
};

// Heroes can't buy these unless they have the Weapons Specialist trait.
export const SPECIALIST = new Set(['Sniper', 'Minigun', 'Flamethrower', 'Rocket Launcher']);

export const GEAR_COST_PER_SLOT = { regular: 1, hero: 2 };

export const slotsOf = item => EQUIPMENT_SLOTS[item] ?? 1;
export const slotsUsed = items => (items ?? []).reduce((t, i) => t + slotsOf(i), 0);
