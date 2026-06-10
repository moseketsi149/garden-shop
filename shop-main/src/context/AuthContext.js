import {
  createContext,
  useContext,
  useEffect,
} from 'react';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useDispatch } from 'react-redux';

import { auth, db } from '../firebase/config';

import { setUser, logoutUser } from '../features/auth/userSlice';

import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, loading, error] = useAuthState(auth);

  const dispatch = useDispatch();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (!firebaseUser) {
          dispatch(logoutUser());
          return;
        }

        let profile = {};
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            profile = userSnap.data();
          }
        } catch (docError) {
          console.warn('Could not load user document from Firestore, using fallback profile:', docError.message);
        }

        if (!profile || Object.keys(profile).length === 0) {
          profile = {
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            role: 'customer',
            companyName: '',
            websiteName: '',
            paymentStatus: 'unpaid',
            tenant: 'default',
          };
        }

        dispatch(
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || profile.name || '',
            role: profile.role || 'customer',
            companyName: profile.companyName || '',
            websiteName: profile.websiteName || '',
            paymentStatus: profile.paymentStatus || 'unpaid',
            tenant: profile.tenant || profile.websiteName || profile.companyName || 'default',
          })
        );
      } catch (err) {
        console.error('Failed to load user profile:', err);
        if (firebaseUser) {
          dispatch(
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              role: 'customer',
              companyName: '',
              websiteName: '',
              paymentStatus: 'unpaid',
              tenant: 'default',
            })
          );
        }
      }
    };

    loadUserProfile();
  }, [firebaseUser, dispatch]);

  const logout = async () => {
    try {
      await signOut(auth);
      dispatch(logoutUser());
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: firebaseUser,
        loading,
        error,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}