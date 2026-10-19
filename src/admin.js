import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from './firebase.js';

// An account is an admin when admins/{uid} exists. Admin docs are added by hand in the
// Firebase console, never from the app.
export function useIsAdmin(uid) {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    if (!uid) return setAdmin(false);
    return onSnapshot(doc(db, 'admins', uid), d => setAdmin(d.exists()), () => setAdmin(false));
  }, [uid]);
  return admin;
}

// Back to the Ship opened by an admin fix, outside of a battle.
export const adminShip = ship => ship ?? { injuries: [], result: null, rerolls: {} };
