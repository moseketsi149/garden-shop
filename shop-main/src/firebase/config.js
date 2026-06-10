import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate that required config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('Firebase Configuration Error: Missing required keys:', missingKeys);
  console.error('Please ensure your .env file contains all required Firebase configuration values.');
  console.error('Required environment variables:');
  console.error('  - REACT_APP_FIREBASE_API_KEY');
  console.error('  - REACT_APP_FIREBASE_AUTH_DOMAIN');
  console.error('  - REACT_APP_FIREBASE_PROJECT_ID');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Enable Firestore offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a time.
        console.log('Persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the
        // features needed to enable persistence
        console.log('Persistence not available: unimplemented');
    }
});
export const storage = getStorage(app);
