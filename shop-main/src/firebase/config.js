import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyD3Nz8q8EHVwh8i2L6luI4_viESVCWv4D0',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'devsolution-dfc75.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'devsolution-dfc75',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'devsolution-dfc75.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '368117812145',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:368117812145:web:701c966141e67466b90b90',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-BTNJQX3G77'
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  throw new Error(`Firebase Configuration Error: Missing required keys: ${missingKeys.join(', ')}`);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = initializeFirestore(app, {
  cacheSizeBytes: 100 * 1024 * 1024
});

// Enable Firestore offline persistence (will use cache settings in future)
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.log('Persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.log('Persistence not available: unimplemented');
    }
});
export const storage = getStorage(app);
