import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_EMAIL = 'seifamrmohsen2005@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }

        setUser(user);
        
        if (user) {
          // Listen to user document changes in real-time
          unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserData(data);
              setIsAdmin(data.role === 'admin' || user.email === SUPER_ADMIN_EMAIL);
              setLoading(false);
            } else {
              // Only create if it doesn't exist and we're not in a loading loop
              const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
              const newUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Anonymous User',
                role: isSuperAdmin ? 'admin' : 'user',
                avatar: { style: 'avataaars', seed: user.displayName || user.email || 'User' },
                createdAt: new Date().toISOString()
              };
              await setDoc(doc(db, 'users', user.uid), newUser);
              // onSnapshot will fire again with the new doc
            }
          }, (error) => {
            console.error("User doc listener error:", error);
            setLoading(false);
          });
        } else {
          setUserData(null);
          setIsAdmin(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
