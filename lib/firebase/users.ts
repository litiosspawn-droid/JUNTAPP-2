import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './client';
import type { Event } from './events';

export interface UserProfile {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt?: Date;
  lastLogin?: Date;
  isVerified?: boolean;
}

export interface UserStats {
  totalEventsCreated: number;
  totalEventsAttended: number;
  totalFollowers: number;
  totalFollowing: number;
  reputation: number;
  joinedDate: Date;
}

// Obtener perfil de usuario
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      uid: userId,
      displayName: userData?.displayName || userData?.name,
      email: userData?.email,
      photoURL: userData?.photoURL,
      bio: userData?.bio,
      location: userData?.location,
      website: userData?.website,
      createdAt: userData?.createdAt?.toDate(),
      lastLogin: userData?.lastLogin?.toDate(),
      isVerified: userData?.isVerified || false,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Obtener estadísticas de usuario
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // Eventos creados
    const createdEventsQuery = query(
      collection(db, 'events'),
      where('createdBy', '==', userId)
    );
    const createdEventsSnapshot = await getDocs(createdEventsQuery);
    const totalEventsCreated = createdEventsSnapshot.size;

    // Eventos asistidos (esto requiere una colección separada de attendees)
    // Por ahora, usaremos un valor por defecto
    const totalEventsAttended = 0; // TODO: Implementar cuando tengamos attendees collection

    // Estadísticas sociales (followers/following)
    const followersQuery = query(
      collection(db, 'followers'),
      where('followedId', '==', userId)
    );
    const followersSnapshot = await getDocs(followersQuery);
    const totalFollowers = followersSnapshot.size;

    const followingQuery = query(
      collection(db, 'followers'),
      where('followerId', '==', userId)
    );
    const followingSnapshot = await getDocs(followingQuery);
    const totalFollowing = followingSnapshot.size;

    // Calcular reputación basada en eventos creados y asistentes
    const reputation = Math.min(totalEventsCreated * 10 + totalFollowers * 5, 1000);

    // Fecha de registro
    const userDoc = await getDoc(doc(db, 'users', userId));
    const joinedDate = userDoc.data()?.createdAt?.toDate() || new Date();

    return {
      totalEventsCreated,
      totalEventsAttended,
      totalFollowers,
      totalFollowing,
      reputation,
      joinedDate,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalEventsCreated: 0,
      totalEventsAttended: 0,
      totalFollowers: 0,
      totalFollowing: 0,
      reputation: 0,
      joinedDate: new Date(),
    };
  }
}

// Obtener eventos creados por el usuario
export async function getUserCreatedEvents(userId: string, limit = 20): Promise<Event[]> {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const eventsSnapshot = await getDocs(eventsQuery);
    const events: Event[] = [];

    eventsSnapshot.forEach((doc) => {
      const eventData = doc.data();
      events.push({
        id: doc.id,
        ...eventData,
        createdAt: eventData.createdAt?.toDate(),
        updatedAt: eventData.updatedAt?.toDate(),
      } as Event);
    });

    return events.slice(0, limit);
  } catch (error) {
    console.error('Error getting user created events:', error);
    return [];
  }
}

// Obtener eventos próximos a los que asiste el usuario
export async function getUserAttendingEvents(userId: string, limit = 20): Promise<Event[]> {
  try {
    // TODO: Implementar cuando tengamos la colección de attendees
    // Por ahora, devolver un array vacío
    return [];
  } catch (error) {
    console.error('Error getting user attending events:', error);
    return [];
  }
}

// Actualizar perfil de usuario
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>
): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

// Verificar si el usuario actual sigue a otro usuario
export async function isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
  try {
    const followingDoc = await getDoc(
      doc(db, 'followers', `${currentUserId}_${targetUserId}`)
    );
    return followingDoc.exists();
  } catch (error) {
    console.error('Error checking if following:', error);
    return false;
  }
}

// Seguir/Dejar de seguir a un usuario
export async function toggleFollow(currentUserId: string, targetUserId: string): Promise<boolean> {
  try {
    const followId = `${currentUserId}_${targetUserId}`;
    const followDoc = await getDoc(doc(db, 'followers', followId));

    if (followDoc.exists()) {
      // Dejar de seguir
      await deleteDoc(doc(db, 'followers', followId));
      return false;
    } else {
      // Seguir
      await setDoc(doc(db, 'followers', followId), {
        followerId: currentUserId,
        followedId: targetUserId,
        createdAt: new Date(),
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return false;
  }
}
