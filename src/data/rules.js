// Campaign constants from STAR WARS: SPECIAL FORCES ("Forming Your Squad" / "Mission Prep").
import { factions, mercenaries, forceUser } from './factions.js';

export const POINTS = { wound: 6, dieStep: 3, eqSlot: 1 }; // dieStep = +2 to CC/Shoot die

export const ROLE_BONUS = {
  leader: { wounds: 1, eqSlots: 1, traits: ['Leader'], pending: 'Roll 1 trait (general, shooting or close combat table)' },
  officer: { wounds: 1, eqSlots: 0, traits: [], pending: 'Roll 1 general trait' },
};

export const FORCE_UNITS = new Set(['Jedi/Sith']);
// Units that count toward the force wielder limit (Magick Lightning is a renamed force power, Alex).
export const FORCE_WIELDERS = new Set([...FORCE_UNITS, 'Nightsister Witch', 'Nightsister Shaman', 'Mother']);

export function getFaction(id) {
  return factions.find(f => f.id === id);
}

// Every unit profile a squad of this faction could field (own lines, force users, mercenaries).
export function profilesFor(factionId) {
  const f = getFaction(factionId);
  return [...(f?.units ?? []), ...forceUser.units, ...mercenaries.units];
}

export function findProfile(factionId, name) {
  return profilesFor(factionId).find(u => u.name === name);
}
