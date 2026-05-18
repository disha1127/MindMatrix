import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'rider' | 'host';
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setRole: (role: 'rider' | 'host') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>({
    uid: 'demo-user-123',
    email: 'guest@gramacharge.in',
    displayName: 'Rural Rider',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo-user-123',
    role: 'rider',
  });
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    // No-op for demo
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const setRole = async (role: 'rider' | 'host') => {
    await updateProfile({ role });
  };

  return (
    <AuthContext.Provider value={{ user: profile as any, profile, loading, signOut, updateProfile, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
