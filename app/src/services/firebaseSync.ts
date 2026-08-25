import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { storage, subscribeToLocalChanges } from './storage';

export type FirebaseSyncStatus = 'synced' | 'syncing' | 'offline';
export type FirebaseSyncUser = Pick<User, 'uid' | 'email'>;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Firestore | null = null;

function getFirebaseServices() {
  if (!firebaseConfigured) return null;
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getFirestore(app);
  }
  return { auth: auth!, database: database! };
}

export const subscribeToFirebaseAuth = (listener: (user: FirebaseSyncUser | null) => void) => {
  const services = getFirebaseServices();
  if (!services) {
    listener(null);
    return () => {};
  }
  return onAuthStateChanged(services.auth, user => listener(user ? { uid: user.uid, email: user.email } : null));
};

export const signInToFirebase = async (email: string, password: string) => {
  const services = getFirebaseServices();
  if (!services) throw new Error('Firebase is not configured yet.');
  return signInWithEmailAndPassword(services.auth, email.trim(), password);
};

export const createFirebaseAccount = async (email: string, password: string) => {
  const services = getFirebaseServices();
  if (!services) throw new Error('Firebase is not configured yet.');
  return createUserWithEmailAndPassword(services.auth, email.trim(), password);
};

export const signOutOfFirebase = async () => {
  const services = getFirebaseServices();
  if (services) await signOut(services.auth);
};

export function startFirebaseRealtimeSync(
  onRemoteData: (data: string) => void,
  onStatus: (status: FirebaseSyncStatus) => void,
) {
  const services = getFirebaseServices();
  if (!services) {
    onStatus('offline');
    return () => {};
  }

  let stopDocument: Unsubscribe | null = null;
  let stopLocalChanges: (() => void) | null = null;
  let applyingRemote = false;
  let activeUid: string | null = null;

  const publish = async (uid: string) => {
    if (!database || applyingRemote) return;
    onStatus('syncing');
    try {
      await setDoc(doc(database, 'users', uid), {
        ...storage.getAllData(),
        updatedAt: serverTimestamp(),
        updatedBy: storage.getSettings().deviceSyncId,
      });
      storage.clearPendingCloudSync();
      onStatus('synced');
    } catch {
      onStatus('offline');
    }
  };

  const stopAuth = onAuthStateChanged(services.auth, user => {
    stopDocument?.();
    stopLocalChanges?.();
    stopDocument = null;
    stopLocalChanges = null;

    activeUid = user?.uid ?? null;
    if (!user || !database) {
      onStatus('offline');
      return;
    }

    onStatus('syncing');
    const userDocument = doc(database, 'users', user.uid);
    stopDocument = onSnapshot(userDocument, snapshot => {
      if (storage.hasPendingCloudSync()) {
        void publish(user.uid);
        return;
      }
      if (snapshot.exists()) {
        applyingRemote = true;
        onRemoteData(JSON.stringify(snapshot.data()));
        storage.clearPendingCloudSync();
        queueMicrotask(() => { applyingRemote = false; });
      } else {
        void publish(user.uid);
      }
      onStatus('synced');
    }, () => onStatus('offline'));

    stopLocalChanges = subscribeToLocalChanges(() => {
      if (!applyingRemote) void publish(user.uid);
    });
  });

  const handleOnline = () => {
    if (activeUid) void publish(activeUid);
  };
  window.addEventListener('online', handleOnline);

  return () => {
    stopAuth();
    stopDocument?.();
    stopLocalChanges?.();
    window.removeEventListener('online', handleOnline);
  };
}
