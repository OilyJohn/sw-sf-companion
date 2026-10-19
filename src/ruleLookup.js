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

// { title, sub, lines: [{ label?, text, amended?, old? }] } for the rule popup, or null if unknown.
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
    if (p.gh) lines.push({ text: `Old GH rule: ${p.gh}`, old: true });
  }
  const shownAs = norm(it.name) === norm(name) ? '' : ` (${it.name})`;
  return { title: name + shownAs, sub: `${it.group} · ${slots}`, lines };
}

// A weapon property by name, for the popup when it's tapped inside trait text.
export function propertyRule(name) {
  const p = PROPERTIES.find(x => norm(x.name) === norm(name));
  if (!p) return null;
  return {
    title: p.name,
    sub: 'Weapon property',
    lines: [
      { text: p.text },
      ...(p.amended ? [{ text: p.amended, amended: true }] : []),
      ...(p.gh ? [{ text: `Old GH rule: ${p.gh}`, old: true }] : []),
      ...(p.ref ? [{ text: p.ref, muted: true }] : []),
    ],
  };
}

// Splits text into plain strings and the names of `link: true` properties in it.
const LINKED = PROPERTIES.filter(p => p.link).map(p => p.name);
const LINKED_RE = LINKED.length ? new RegExp(`\\b(${LINKED.join('|')})\\b`, 'g') : null;
export const linkedParts = text => (LINKED_RE && text ? text.split(LINKED_RE) : [text]);

// One level of a lightsaber form, e.g. ['Ferocious (4)', 'Brittle (-1)'], with each trait's rule.
export function formLevelRule(form, levelIndex) {
  const lines = [];
  for (const n of form.levels[levelIndex]) {
    const tr = findTrait(n.replace(/\s*\(-?\d+\)$/, ''));
    lines.push({ label: n, text: tr?.text || 'No description in your docs yet.' });
    if (tr?.amended) lines.push({ text: tr.amended, amended: true });
  }
  return { title: form.name, sub: `Level ${'I'.repeat(levelIndex + 1)}`, lines };
}
