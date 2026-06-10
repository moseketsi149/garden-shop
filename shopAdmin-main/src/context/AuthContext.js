import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      let profile = {};
      try {
        const snapshot = await getDoc(doc(db, 'users', currentUser.uid));
        profile = snapshot.exists() ? snapshot.data() : {};
      } catch (error) {
        console.warn('Unable to load Firestore user profile, falling back to default profile.', error);
        profile = { role: 'admin', tenant: 'default' };
      }

      setUser({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || profile.name || 'Administrator',
        role: profile.role || 'admin',
        tenant: profile.tenant || 'default'
      });
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
