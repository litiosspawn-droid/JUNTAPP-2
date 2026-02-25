import { signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './client';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  eventsCreated?: string[];
  eventsAttending?: string[];
  banned?: boolean;
  role?: 'user' | 'admin';
  createdAt?: any;
  updatedAt?: any;
}

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<UserProfile> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Crear o actualizar el perfil del usuario en Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || user.email!.split('@')[0],
      photoURL: user.photoURL || undefined,
      bio: 'Amante de los eventos y las buenas experiencias.',
      eventsCreated: [],
      eventsAttending: [],
      banned: false, // Usuario no baneado por defecto
      role: 'user', // Rol por defecto
      createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date(),
      updatedAt: new Date(),
    };
    
    if (!userDoc.exists()) {
      await setDoc(userRef, userProfile);
    } else {
      // Asegurar que el campo banned esté establecido en false para usuarios existentes
      const existingData = userDoc.data();
      const updatedProfile = {
        ...userProfile,
        banned: false, // Siempre asegurar que no esté baneado
        role: existingData.role || 'user', // Mantener rol existente o asignar 'user'
      };
      await setDoc(userRef, updatedProfile, { merge: true });
    }
    
    return userProfile;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw new Error('No se pudo iniciar sesión con Google');
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('No se pudo cerrar sesión');
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('No se pudo obtener el perfil del usuario');
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('No se pudo actualizar el perfil del usuario');
  }
};
