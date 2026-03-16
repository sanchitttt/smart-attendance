// hooks/useUser.ts
'use client';

import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { signOut as firebaseSignOut } from 'firebase/auth';
import toast from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  
  const signOut = async () => {
    setIsSigningOut(true);

    try {
      // 1. Sign out from Firebase Auth (clears user session in browser)
      await firebaseSignOut(auth);

      // 2. Optional: Clear the session cookie if you're using the cookie + middleware approach
      //    (this is important if you have middleware protecting routes)
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      toast.success('Signed out successfully');

      // 3. Redirect to login or home
      router.replace('/login');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setIsSigningOut(false);
    }
  }

  return { user, loading };
}