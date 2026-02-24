// Firebase authentication utilities
import { auth, db } from './client';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
}

export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error: unknown) {
    throw new Error((error as Error).message);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    throw new Error((error as Error).message);
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error: unknown) {
    throw new Error((error as Error).message);
  }
};

// Create or update user document (useful for Google sign-in)
export const createOrUpdateUserDocument = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    // Create new user document
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Update existing user document
    await setDoc(userRef, {
      ...userSnapshot.data(),
      displayName: user.displayName || userSnapshot.data().displayName,
      photoURL: user.photoURL || userSnapshot.data().photoURL,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
};
