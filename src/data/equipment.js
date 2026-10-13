// Equipment slot sizes, keyed by the names used in factions.js.
// From "SW_SF Weapons" unless noted. Aliases from the Factions doc: Wrist Rocket = Thermal
// Detonator, Wrist Cannons = Blaster Rifle, Bayonet = Combat Knife. Club = Blunt Weapon.
// GH = Galactic Heroes rulebook (armour, shields, spear, jet pack).
// guess = in neither doc, so the slot count is assumed until Alex confirms.
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
  'Ewok Glider': 2, // guess
};

export const UNCONFIRMED_SLOTS = new Set(['Ewok Glider']);

export const slotsOf = item => EQUIPMENT_SLOTS[item] ?? 1;
export const slotsUsed = items => (items ?? []).reduce((t, i) => t + slotsOf(i), 0);
