import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { User as DbUser } from '../types.ts';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  dbUser: DbUser | null;
  token: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync token and user with backend
  const syncWithBackend = async (fbUser: FirebaseUser, idToken: string) => {
    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const syncedUser = await response.json();
        setDbUser(syncedUser);
      } else {
        console.error('Failed to sync user with backend');
      }
    } catch (err) {
      console.error('Error syncing user:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setFirebaseUser(user);
        try {
          const idToken = await user.getIdToken();
          setToken(idToken);
          await syncWithBackend(user, idToken);
        } catch (error) {
          console.error('Failed to retrieve ID token:', error);
        }
      } else {
        const guest = localStorage.getItem('atlas_guest_user');
        if (guest) {
          try {
            const parsedGuest = JSON.parse(guest);
            parsedGuest.getIdToken = async () => 'mock_guest_token';
            setFirebaseUser(parsedGuest);
            setDbUser({
              id: 1,
              email: parsedGuest.email || 'guest.strategist@atlas.os',
              displayName: parsedGuest.displayName || 'Guest Strategist',
              createdAt: new Date().toISOString()
            });
            setToken('mock_guest_token');
          } catch (e) {
            setFirebaseUser(null);
            setDbUser(null);
            setToken(null);
          }
        } else {
          setFirebaseUser(null);
          setDbUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const signInAsGuest = () => {
    setLoading(true);
    const mockGuestUser = {
      uid: 'guest_user_id_1',
      email: 'guest.strategist@atlas.os',
      displayName: 'Guest Strategist',
      photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=Guest%20Strategist',
      getIdToken: async () => 'mock_guest_token',
    } as any as FirebaseUser;

    localStorage.setItem('atlas_guest_user', JSON.stringify(mockGuestUser));
    setFirebaseUser(mockGuestUser);
    setDbUser({
      id: 1,
      email: mockGuestUser.email!,
      displayName: mockGuestUser.displayName!,
      createdAt: new Date().toISOString()
    });
    setToken('mock_guest_token');
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('atlas_guest_user');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, dbUser, token, loading, signIn, signInAsGuest, signOut }}>
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
