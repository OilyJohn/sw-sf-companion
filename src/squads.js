import {
  addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from './firebase.js';
import { findProfile, POINTS, ROLE_BONUS } from './data/rules.js';
import { STARTING_CREDITS } from './data/factions.js';

const squadsCol = collection(db, 'squads');

export function useMySquads(uid) {
  const [squads, setSquads] = useState(null);
  useEffect(() => {
    if (!uid) return setSquads(null);
    const q = query(squadsCol, where('ownerId', '==', uid));
    return onSnapshot(q, snap => setSquads(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [uid]);
  return squads;
}

export function useSquad(id) {
  const [squad, setSquad] = useState(undefined);
  useEffect(() => onSnapshot(doc(db, 'squads', id), d => setSquad(d.exists() ? { id: d.id, ...d.data() } : null)), [id]);
  return squad;
}

// Live squads by id (any player's, for shared battles), as { [id]: squad }.
export function useSquadsById(ids) {
  const key = [...new Set(ids.filter(Boolean))].sort().join(',');
  const [squads, setSquads] = useState({});
  useEffect(() => {
    if (!key) return setSquads({});
    const unsubs = key.split(',').map(id => onSnapshot(doc(db, 'squads', id), d =>
      setSquads(s => ({ ...s, [id]: d.exists() ? { id: d.id, ...d.data() } : null }))));
    return () => unsubs.forEach(u => u());
  }, [key]);
  return squads;
}

export function createSquad(user, { name, faction }) {
  return addDoc(squadsCol, {
    ownerId: user.uid,
    ownerName: user.displayName ?? '',
    name,
    faction,
    credits: STARTING_CREDITS,
    started: false, // true once the first mission is played; empty-slot discounts end then
    units: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export const saveSquad = (id, patch) => updateDoc(doc(db, 'squads', id), { ...patch, updatedAt: serverTimestamp() });
export const deleteSquad = id => deleteDoc(doc(db, 'squads', id));

export function newUnit(profile, name) {
  return {
    id: crypto.randomUUID(),
    name,
    model: '',
    type: profile.name,
    role: 'regular',
    bonusWounds: 0,
    bonusEqSlots: 0,
    emptySlots: 0, // starting-company discount only
    dieSteps: { cc: 0, s: 0 },
    traits: [], // gained traits: { name, pts }
    equipment: [],
    exp: 0,
    promotions: 0, // promotion rolls taken; one is due per full box of 5 EXP
    status: 'ready',
    pending: [],
    notes: '',
  };
}

// A Mercenary added for one mission by the Will of the Force (`temp` until hired).
export function tempMerc(type) {
  return { ...newUnit({ name: type }, type), temp: true };
}
export const withoutTemp = units => units.filter(u => !u.temp);

export function unitStats(unit, factionId) {
  const p = findProfile(factionId, unit.type);
  if (!p) return null;
  const roleBonus = ROLE_BONUS[unit.role];
  const wounds = p.w + unit.bonusWounds + (roleBonus?.wounds ?? 0);
  const eqSlots = p.eq + unit.bonusEqSlots + (roleBonus?.eqSlots ?? 0);
  const cc = p.cc + 2 * unit.dieSteps.cc;
  const s = p.s + 2 * unit.dieSteps.s;
  const traitPts = unit.traits.reduce((t, x) => t + (x.pts ?? 0), 0);
  const points = p.pts
    + POINTS.wound * (wounds - p.w)
    + POINTS.eqSlot * (eqSlots - p.eq)
    + POINTS.dieStep * (unit.dieSteps.cc + unit.dieSteps.s)
    + traitPts;
  const traits = [...p.traits, ...(roleBonus?.traits ?? []), ...unit.traits.map(t => t.name)];
  return { profile: p, wounds, eqSlots, cc, s, points, traits };
}

export function squadPoints(squad) {
  return squad.units
    .filter(u => u.status === 'ready')
    .reduce((t, u) => t + (unitStats(u, squad.faction)?.points ?? 0), 0);
}
