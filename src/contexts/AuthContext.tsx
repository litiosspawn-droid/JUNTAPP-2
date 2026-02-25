'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { signInWithGoogle, logoutUser } from '@/lib/firebase/auth';
import { checkRateLimit, RATE_LIMITS, RateLimitError } from '@/lib/rate-limit';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isEmailVerified: false,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  sendVerificationEmail: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Persistencia mejorada - esperar a que Firebase inicialice
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);

        if (user) {
          // Solo recargar si pasó más de 5 minutos
          const lastRefresh = localStorage.getItem('authLastRefresh');
          const now = Date.now();
          const shouldRefresh = !lastRefresh || (now - parseInt(lastRefresh)) > 5 * 60 * 1000;

          if (shouldRefresh) {
            await user.reload();
            localStorage.setItem('authLastRefresh', now.toString());
          }

          setIsEmailVerified(user.emailVerified);

          // Ensure user document exists in Firestore (sin bloquear)
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0],
              photoURL: user.photoURL,
              bio: '',
              location: '',
              website: '',
              banned: false,
              role: 'user',
              emailVerified: user.emailVerified,
              createdAt: new Date(),
              updatedAt: new Date(),
            }, { merge: true });
          } else {
            // Update email verified status in Firestore
            await updateDoc(userRef, {
              emailVerified: user.emailVerified,
              lastLogin: new Date(),
            });
          }
        } else {
          setIsEmailVerified(false);
          localStorage.removeItem('authLastRefresh');
        }

        setInitialized(true);
      } catch (error) {
        console.error('Error in onAuthStateChanged:', error);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      setInitialized(false);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userId = result.user.uid;
      
      // Asegurar que el documento del usuario exista en Firestore
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: userId,
          email: email,
          displayName: email.split('@')[0],
          photoURL: null,
          bio: '',
          location: '',
          website: '',
          banned: false,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userId = result.user.uid;

      // Send verification email
      await sendEmailVerification(result.user, {
        url: typeof window !== 'undefined' ? window.location.origin : undefined,
      });

      // Crear documento de usuario en Firestore
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: userId,
          email: email,
          displayName: email.split('@')[0],
          photoURL: null,
          bio: '',
          location: '',
          website: '',
          banned: false,
          role: 'user',
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    try {
      if (user) {
        // Check rate limit (synchronous)
        checkRateLimit(user.uid, 'RESEND_VERIFICATION', RATE_LIMITS.RESEND_VERIFICATION);
        
        await sendEmailVerification(user, {
          url: typeof window !== 'undefined' ? window.location.origin : undefined,
        });
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      console.error('Send verification email error:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (user) {
        await user.reload();
        setIsEmailVerified(user.emailVerified);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isEmailVerified,
    login,
    register,
    loginWithGoogle,
    logout,
    sendVerificationEmail,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
