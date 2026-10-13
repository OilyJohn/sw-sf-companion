import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator, getAuth, GoogleAuthProvider, signInAnonymously, signInWithPopup, signInWithRedirect, signOut,
} from 'firebase/auth';
import {
  connectFirestoreEmulator, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore';
import { firebaseConfig } from './firebase-config.js';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Offline-first: reads and writes go to an on-device cache and sync when back online.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

// Local testing against the Firebase emulators: `VITE_EMULATOR=1 npm run dev`.
if (import.meta.env.VITE_EMULATOR) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  window.__testSignIn = () => signInAnonymously(auth);
}

const provider = new GoogleAuthProvider();

export async function signIn() {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    // Some mobile browsers block popups; fall back to a full-page redirect.
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
    } else {
      throw err;
    }
  }
}

export const signOutUser = () => signOut(auth);
