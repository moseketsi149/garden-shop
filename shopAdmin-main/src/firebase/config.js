import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyD3Nz8q8EHVwh8i2L6luI4_viESVCWv4D0',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'devsolution-dfc75.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'devsolution-dfc75',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'devsolution-dfc75.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '368117812145',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:368117812145:web:701c966141e67466b90b90'
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  throw new Error(`Firebase Configuration Error: Missing required keys: ${missingKeys.join(', ')}`);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
