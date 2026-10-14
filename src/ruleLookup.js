// Look up the rule text for a trait or a piece of gear by the name a unit uses,
// so any trait or gear name in the app can be tapped to read its rule.
import { slotsOf } from './data/equipment.js';
import { findTrait } from './data/traits.js';
import { GEAR_GROUPS, PROPERTIES } from './data/weapons.js';

const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const GEAR = new Map();
for (const g of GEAR_GROUPS) {
  for (const it of g.items) {
    for (const n of [it.name, ...(it.aliases ?? [])]) GEAR.set(norm(n), { ...it, group: g.name });
  }
}

export const findGear = name => GEAR.get(norm(name)) ?? null;

// Words that name a property inside a weapon's notes ("Burst (Always)" is Burst Fire).
const propertyWords = p => [...new Set([p.name.split(' (')[0], p.name.split(' ')[0]])];
const propertiesIn = text => PROPERTIES.filter(p =>
  propertyWords(p).some(w => new RegExp(`\\b${w}\\b`, 'i').test(text ?? '')));

const ptsLabel = pts => (pts > 0 ? `+${pts} pts` : `${pts} pts`);

// { title, sub, lines: [{ label?, text, amended? }] } for the rule popup, or null if unknown.
export function traitRule(name) {
  const tr = findTrait(name);
  if (!tr) return { title: name, sub: 'Trait', lines: [{ text: 'No description in your docs yet (it may be in the Galactic Heroes rulebook).' }] };
  return {
    title: tr.name,
    sub: [tr.table, tr.pts !== null && tr.pts !== undefined ? ptsLabel(tr.pts) : null].filter(Boolean).join(' · '),
    lines: [{ text: tr.text }, ...(tr.amended ? [{ text: tr.amended, amended: true }] : [])],
  };
}

export function gearRule(name) {
  const it = findGear(name);
  const slots = `${slotsOf(name)} slot${slotsOf(name) === 1 ? '' : 's'}`;
  if (!it) return { title: name, sub: slots, lines: [{ text: 'Not described in your Weapons doc.' }] };
  const lines = [];
  if (it.range && it.range !== '-') lines.push({ label: 'Range', text: it.range });
  if (it.notes) lines.push({ label: 'Notes', text: it.notes });
  if (it.wound) lines.push({ label: 'Wound table', text: it.wound });
  if (it.text) lines.push({ text: it.text });
  if (it.amended) lines.push({ text: it.amended, amended: true });
  if (it.ref) lines.push({ text: it.ref, muted: true });
  for (const p of propertiesIn(it.notes)) {
    lines.push({ label: p.name, text: p.text });
    if (p.amended) lines.push({ text: p.amended, amended: true });
  }
  const shownAs = norm(it.name) === norm(name) ? '' : ` (${it.name})`;
  return { title: name + shownAs, sub: `${it.group} · ${slots}`, lines };
}
