// Faction and unit data, transcribed from "SW_SF Factions & Units" and "New Jedi_Sith Progression".
// equipment lists are fully expanded (the PDF's "^" = previous rank's equipment).
// promotesTo marked `inferred` where the PDF gives no explicit chain (taken from row shading).

const u = (pts, name, w, cc, s, traits, equipment, eq, promotesTo = []) =>
  ({ pts, name, w, cc, s, traits, equipment, eq, promotesTo });

const MERC_GUN = ['Blaster Rifle', 'Blaster Carbine', 'Repeating Blaster', 'Light Armour'];
const MERC_MELEE = ['2H Weapons', 'Throwing Weapons', 'Light Armour'];
const MERC_DEMO = ['Blaster Pistol', 'Combat Knife', 'Thermal Detonator'];

export const mercenaries = {
  id: 'mercenaries', name: 'Mercenaries', complete: true, pool: true,
  hireCost: 5, promotionsInferred: true,
  units: [
    u(8, 'Mercenary', 1, 8, 8, [], MERC_GUN, 2, ['Gunner']),
    u(12, 'Gunner', 1, 8, 10, [], MERC_GUN, 3, ['Guild Marksman']),
    u(20, 'Guild Marksman', 1, 8, 12, ['Sniper', 'Bounty Hunter'], [...MERC_GUN], 3),
    u(8, 'Hired Muscle', 1, 8, 8, [], MERC_MELEE, 2, ['Pit Fighter']),
    u(12, 'Pit Fighter', 1, 10, 8, [], [...MERC_MELEE, 'Vibrosword', 'Heavy Armour'], 3, ['Guild Brute']),
    u(18, 'Guild Brute', 1, 12, 8, ['Street Fighter', 'Bounty Hunter'], [...MERC_MELEE, 'Vibrosword', 'Heavy Armour'], 3),
    u(8, 'Death Stick Addict', 1, 8, 8, [], MERC_DEMO, 2, ['Terrorist']),
    u(12, 'Terrorist', 1, 8, 8, ['Sprinter'], [...MERC_DEMO, 'Light Armour'], 4, ['Guild Demolitions Expert']),
    u(18, 'Guild Demolitions Expert', 1, 8, 10, ['Sprinter', 'Bounty Hunter'], [...MERC_DEMO, 'Light Armour', 'Heavy Armour'], 6),
  ],
};

// New Jedi/Sith Progression: single base unit (pending Alex's confirmation it replaces the old tables).
export const forceUser = {
  id: 'force-user', name: 'Jedi/Sith', pool: true,
  units: [u(19, 'Jedi/Sith', 1, 10, 8, ['Shii-Cho', 'Block', 'Push'], ['Lightsaber', 'Light Armour', 'Heavy Armour'], 2)],
};

const CLONE_GUNS = ['Blaster Rifle', 'Blaster Carbine', 'Repeating Blaster', 'Thermal Detonator', 'Light Armour'];
const ARC = ['Blaster Pistol', 'Combat Knife', 'Thermal Detonator', 'Throwing Weapons'];
const EWOK = ['Axe', 'Club', 'Sling', 'Throwing Weapons', 'Light Armour'];
const ENDOR = ['Blaster Rifle', 'Blaster Carbine', 'Repeating Blaster', 'Blaster Pistol', 'Combat Knife', 'Thermal Detonator', 'Light Armour'];
const JAWA_STUN = ['Stun Gun', 'Stun Rifle', 'Shock Grenade', 'Light Armour'];
const JAWA_HUNT = ['Blaster Rifle', 'Blaster Carbine', 'Shock Grenade', 'Combat Knife'];
const GAM = ['2H Axe', 'Light Armour'];
const MANDO_GS = ['Blaster Pistol', 'Jet Pack', 'Wrist Rocket', 'Combat Knife', 'Light Armour'];
const MANDO_W = ['Vibrosword', 'Jet Pack', 'Wrist Rocket', 'Light Armour'];
const MANDO_R = ['Blaster Carbine', 'Blaster Rifle', 'Repeating Blaster', 'Jet Pack', 'Wrist Rocket', 'Light Armour'];
const B1 = ['Blaster Rifle', 'Blaster Carbine', 'Repeating Blaster', 'Thermal Detonator'];
const BX = ['Vibrosword', 'Blaster Pistol', 'Thermal Detonator'];
const MAGNA = ['Electrostaff', 'Light Armour', 'Blaster Pistol'];
const NS_WARRIOR = ['2 Hand Axe (Flail)', 'Dagger', 'Throwing Weapons', 'Light Armour'];
const NS_ARCHER = ['Bow', 'Light Armour'];
const NS_WITCH = ['Conjured 2H Sword', 'Light Armour'];

export const factions = [
  {
    id: 'gar', name: 'Grand Army of the Republic', complete: true, promotionsInferred: true,
    reinforcements: { 'Clone Trooper': 12, 'Clone Marksman': 13, 'ARC Trooper': 16, 'Jedi/Sith': 19 },
    exampleCompany: ['1 Jedi', '1 ARC Trooper', '1 Clone Marksman', '2 Credits Leftover'],
    units: [
      u(12, 'Clone Trooper', 1, 8, 10, ['Loyal'], CLONE_GUNS, 3, ['Clone Marine']),
      u(15, 'Clone Marine', 1, 8, 10, ['Loyal', 'Sprinter'], CLONE_GUNS, 4, ['Clone Commando']),
      u(23, 'Clone Commando', 1, 8, 12, ['Loyal', 'Sprinter', 'Stealthy', 'Deft'], [...CLONE_GUNS, 'Heavy Armour'], 4),
      u(13, 'Clone Marksman', 1, 8, 10, ['Target Lock'], CLONE_GUNS, 2, ['Clone Scout Trooper']),
      u(17, 'Clone Scout Trooper', 1, 8, 10, ['Target Lock', 'Eagle Eyed', 'Camouflage'], CLONE_GUNS, 2, ['Clone Elite Corps Trooper']),
      u(24, 'Clone Elite Corps Trooper', 1, 8, 12, ['Target Lock', 'Eagle Eyed', 'Camouflage', 'Double Tap'], CLONE_GUNS, 3),
      u(16, 'ARC Trooper', 1, 10, 10, ['Two Gunned'], ARC, 3, ['ARC Captain']),
      u(20, 'ARC Captain', 1, 10, 10, ['Two Gunned', 'Run & Gun'], [...ARC, 'Light Armour'], 4, ['ARC Jet Trooper']),
      u(27, 'ARC Jet Trooper', 1, 10, 12, ['Two Gunned', 'Run & Gun', 'Running Attack'], [...ARC, 'Light Armour', 'Jet Pack'], 5),
    ],
  },
  {
    id: 'endor', name: 'Endor Forest Assault', complete: true,
    reinforcements: { 'Ewok': 7, 'Endor Rebel Trooper': 14, 'Jedi/Sith': 19 },
    exampleCompany: ['1 Jedi', '2 Ewoks', '1 Endor Rebel Trooper', '3 Credits Leftover'],
    units: [
      u(7, 'Ewok', 1, 8, 8, ['Small', 'Slow', 'Ranger'], EWOK, 2, ['Ewok Scout', 'Ewok Warrior']),
      u(12, 'Ewok Scout', 1, 8, 10, ['Small', 'Ranger'], [...EWOK, 'Bow'], 3, ['Ewok Hunter']),
      u(19, 'Ewok Hunter', 1, 8, 10, ['Small', 'Ranger', 'High Ground', 'Killer'], [...EWOK, 'Bow', 'Ewok Glider'], 4),
      u(13, 'Ewok Warrior', 1, 10, 8, ['Small', 'Slow', 'Ranger', 'Armoured'], [...EWOK, 'Spear'], 3, ['Ewok Chief']),
      u(19, 'Ewok Chief', 1, 10, 8, ['Small', 'Ranger', 'Armoured', 'Brawler'], [...EWOK, 'Spear', 'Heavy Armour'], 4),
      u(14, 'Endor Rebel Trooper', 1, 8, 10, ['Camouflage'], ENDOR, 3, ['Endor Rebel Captain']),
      u(17, 'Endor Rebel Captain', 1, 8, 10, ['Camouflage', 'Infiltrator'], ENDOR, 4, ['Endor Rebel Special Forces']),
      u(25, 'Endor Rebel Special Forces', 1, 8, 12, ['Camouflage', 'Infiltrator', 'Sniper'], [...ENDOR, 'Heavy Armour'], 5),
    ],
  },
  {
    id: 'tatooine', name: 'Tatooine Alliance', complete: true,
    reinforcements: { 'Jawa Grunt': 8, 'Gamorrean Mercenary': 13, 'Jedi/Sith': 19 },
    exampleCompany: ['1 Sith', '2 Jawa Grunts', '1 Gamorrean Mercenary', '2 Credits Leftover'],
    units: [
      u(8, 'Jawa Grunt', 1, 8, 8, ['Small', 'Slow'], ['Blaster Pistol', 'Stun Gun', 'Shock Grenade', 'Combat Knife'], 3, ['Jawa Stunner', 'Jawa Hunter']),
      u(14, 'Jawa Stunner', 1, 10, 8, ['Small', 'Slow', 'Quickdraw'], JAWA_STUN, 3, ['Jawa Chieftain']),
      u(21, 'Jawa Chieftain', 1, 10, 10, ['Small', 'Gadgeteer', 'Concealed Weapon'], JAWA_STUN, 4),
      u(13, 'Jawa Hunter', 1, 8, 10, ['Small', 'Slow', 'Target Lock'], JAWA_HUNT, 3, ['Jawa Ranger']),
      u(20, 'Jawa Ranger', 1, 8, 12, ['Small', 'Target Lock', 'Deadeye'], [...JAWA_HUNT, 'Light Armour'], 3),
      u(13, 'Gamorrean Mercenary', 1, 10, 8, ['Indomitable'], GAM, 3, ['Gamorrean Rancor Pit Cleaner', 'Gamorrean Brute']),
      u(17, 'Gamorrean Rancor Pit Cleaner', 1, 10, 8, ['Indomitable', 'Determined', 'Loyal', 'Deadly Strike'], [...GAM, 'Heavy Armour', 'Throwing Weapons'], 3, ['Gamorrean Palace Guard']),
      u(23, 'Gamorrean Palace Guard', 1, 12, 8, ['Indomitable', 'Determined', 'Loyal', 'Deadly Strike', 'Fearsome Appearance'], [...GAM, 'Heavy Armour', 'Throwing Weapons'], 4),
      u(18, 'Gamorrean Brute', 1, 10, 8, ['Indomitable', 'Bloodthirsty', 'Stampede'], GAM, 3, ['Gamorrean Berserker']),
      u(24, 'Gamorrean Berserker', 1, 12, 8, ['Indomitable', 'Bloodthirsty', 'Stampede', 'Freight Train'], GAM, 3),
    ],
  },
  {
    id: 'mandalorians', name: 'Mandalorians', complete: true,
    reinforcements: { 'Mandalorian Gunslinger': 13, 'Mandalorian Warrior': 13, 'Mandalorian Ranger': 14, 'Jedi/Sith': 19 },
    aliases: { 'Wrist Rocket': 'Thermal Detonator' },
    exampleCompany: ['1 Sith', '1 Mandalorian Warrior', '1 Mandalorian Ranger', '4 Credits Leftover'],
    units: [
      u(13, 'Mandalorian Gunslinger', 1, 8, 10, ['Two Gunned'], MANDO_GS, 3, ['Mandalorian Commando']),
      u(17, 'Mandalorian Commando', 1, 8, 10, ['Two Gunned', 'Quickdraw'], MANDO_GS, 4, ['Mandalorian Super Commando']),
      u(24, 'Mandalorian Super Commando', 1, 10, 10, ['Two Gunned', 'Quickdraw', 'Killer'], [...MANDO_GS, 'Heavy Armour'], 4),
      u(13, 'Mandalorian Warrior', 1, 10, 8, ['Quick'], MANDO_W, 3, ['Mandalorian Crusader']),
      u(16, 'Mandalorian Crusader', 1, 10, 8, ['Quick', 'Dodge'], [...MANDO_W, 'Energy Shield (Buckler)', 'Heavy Armour'], 4, ['Mandalorian Blademaster']),
      u(23, 'Mandalorian Blademaster', 1, 12, 8, ['Quick', 'Dodge', 'Ferocious'], [...MANDO_W, 'Energy Shield (Buckler)', 'Heavy Armour'], 4),
      u(14, 'Mandalorian Ranger', 1, 8, 10, ['Steady'], MANDO_R, 3, ['Mandalorian Sharpshooter']),
      u(19, 'Mandalorian Sharpshooter', 1, 8, 10, ['Steady', 'Deep Breath', 'Eagle Eyed'], MANDO_R, 4, ['Mandalorian Assassin']),
      u(26, 'Mandalorian Assassin', 1, 8, 12, ['Steady', 'Deep Breath', 'Eagle Eyed', 'Sniper'], MANDO_R, 4),
    ],
  },
  {
    id: 'separatists', name: 'Separatist Droid Army', complete: true,
    reinforcements: { 'B1 Battle Droid': 8, 'B2 Super Battle Droid': 11, 'BX Series Commando Droid': 13, 'IG-100 MagnaGuard': 15, 'Jedi/Sith': 19 },
    aliases: { 'Wrist Rocket': 'Thermal Detonator', 'Wrist Cannons': 'Blaster Rifle', 'Bayonet': 'Combat Knife' },
    exampleCompany: ['1 B1 Battle Droid', '1 B2 Super Battle Droid', '1 BX Series Commando Droid', '1 IG-100 MagnaGuard', '3 Credits Leftover'],
    // IG-100 chain not listed in the PDF promotions; inferred from row shading.
    units: [
      u(8, 'B1 Battle Droid', 1, 8, 8, ['Soulless'], B1, 2, ['B1 Droid Captain']),
      u(14, 'B1 Droid Captain', 1, 8, 10, ['Soulless', 'Deft'], [...B1, 'Light Armour'], 3, ['B1 Trench Droid']),
      u(20, 'B1 Trench Droid', 1, 8, 10, ['Soulless', 'Deft', 'Deadeye', 'Target Lock'], [...B1, 'Light Armour', 'Bayonet'], 4),
      u(11, 'B2 Super Battle Droid', 1, 8, 10, ['Soulless'], ['Wrist Cannons', 'Light Armour'], 2, ['B2 Rocketeer Droid']),
      u(15, 'B2 Rocketeer Droid', 1, 8, 10, ['Soulless', 'Survivor', 'Immovable Object'], ['Wrist Cannons', 'Light Armour', 'Wrist Rockets', 'Heavy Armour'], 3, ['B3 Ultra Battle Droid']),
      u(23, 'B3 Ultra Battle Droid', 1, 8, 12, ['Soulless', 'Survivor', 'Immovable Object', 'Steady', 'Lucky Shot'], ['Wrist Cannons', 'Light Armour', 'Wrist Rockets', 'Heavy Armour'], 4),
      u(13, 'BX Series Commando Droid', 1, 10, 8, ['Soulless', 'Dodge'], BX, 2, ['Commando Droid Captain']),
      u(19, 'Commando Droid Captain', 1, 10, 10, ['Soulless', 'Dodge', 'Acrobatic'], [...BX, 'Tower Shield', 'Light Armour'], 3, ['Elite Commando Droid']),
      u(24, 'Elite Commando Droid', 1, 10, 10, ['Soulless', 'Dodge', 'Acrobatic', 'Quick', 'Weapon Master'], [...BX, 'Tower Shield', 'Light Armour', 'Heavy Armour'], 4),
      u(15, 'IG-100 MagnaGuard', 1, 10, 8, ['Soulless', 'Last Stand'], MAGNA, 3, ['General’s Bodyguard']),
      u(19, 'General’s Bodyguard', 1, 10, 8, ['Soulless', 'Last Stand', 'Flurry of Blows', 'Lightning Fast'], [...MAGNA, 'Heavy Armour'], 3, ['MagnaGuard Taskmaster']),
      u(26, 'MagnaGuard Taskmaster', 1, 12, 8, ['Soulless', 'Last Stand', 'Flurry of Blows', 'Lightning Fast', 'Steadfast Defence'], [...MAGNA, 'Heavy Armour', 'Electro Whip'], 5),
    ],
  },
  {
    id: 'nightsisters', name: 'Nightsisters', complete: true, promotionsInferred: true,
    // No info page in the PDF: reinforcements are each line's base unit at its points (confirmed by Alex).
    reinforcements: { 'Nightsister Zombie': 7, 'Nightsister Warrior': 12, 'Nightsister Archer': 11, 'Nightsister Witch': 17, 'Jedi/Sith': 19 },
    aliases: { 'Green Fireball': 'Thermal Detonator', 'Magick Lightning': 'Force Lightning' },
    units: [
      u(7, 'Nightsister Zombie', 1, 8, 8, ['Soulless', 'Pugilist'], [], 0, ['Undead Dasher']),
      u(13, 'Undead Dasher', 1, 10, 8, ['Soulless', 'Pugilist', 'Quick', 'Survivor'], [], 0, ['Reanimated Lunatic']),
      u(18, 'Reanimated Lunatic', 1, 10, 8, ['Soulless', 'Pugilist', 'Quick', 'Survivor', 'Bloodthirsty', 'Armoured'], [], 0),
      u(12, 'Nightsister Warrior', 1, 10, 8, ['Fancy Footwork'], NS_WARRIOR, 2, ['Nightsister Acrobat']),
      u(17, 'Nightsister Acrobat', 1, 10, 8, ['Fancy Footwork', 'Acrobatic', 'Dodge'], [...NS_WARRIOR, 'Heavy Armour'], 3, ['Nightsister Assassin']),
      u(24, 'Nightsister Assassin', 1, 12, 8, ['Fancy Footwork', 'Acrobatic', 'Dodge', 'Weapon Master'], [...NS_WARRIOR, 'Heavy Armour'], 4),
      u(11, 'Nightsister Archer', 1, 8, 10, [], NS_ARCHER, 2, ['Nightsister Ranger']),
      u(16, 'Nightsister Ranger', 1, 8, 10, ['Deep Breath', 'Lightning Fast'], [...NS_ARCHER, 'Throwing Weapons', 'Combat Knife'], 3, ['Nightsister Hunter']),
      u(23, 'Nightsister Hunter', 1, 8, 12, ['Deep Breath', 'Lightning Fast', 'Deft', 'Steady'], [...NS_ARCHER, 'Throwing Weapons', 'Combat Knife'], 3),
      u(17, 'Nightsister Witch', 1, 10, 10, ['Magick Lightning'], NS_WITCH, 2, ['Nightsister Shaman']),
      u(21, 'Nightsister Shaman', 1, 10, 10, ['Magick Lightning', 'Run & Gun'], [...NS_WITCH, 'Green Fireball'], 3, ['Mother']),
      u(27, 'Mother', 1, 10, 12, ['Magick Lightning', 'Run & Gun', 'Fearsome Appearance'], [...NS_WITCH, 'Green Fireball'], 4),
    ],
  },
];

export const STARTING_CREDITS = 50;
export const MAX_HEROES = 5;
export const MAX_FORCE_WIELDERS = 2;
