import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const baseUser = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || 'Administrator',
        role: 'admin',
        tenant: 'default',
      };

      if (mounted) {
        setUser(baseUser);
        setLoading(false);
      }

      try {
        const snapshot = await getDoc(doc(db, 'users', currentUser.uid));
        if (!mounted) return;

        if (snapshot.exists()) {
          const profile = snapshot.data();
          setUser((prev) => ({
            ...prev,
            displayName: currentUser.displayName || profile.name || prev.displayName,
            role: profile.role || prev.role,
            tenant: profile.tenant || prev.tenant,
          }));
        }
      } catch (error) {
        console.warn('Unable to load Firestore user profile, falling back to default profile.', error);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
