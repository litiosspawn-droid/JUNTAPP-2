import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './client';

export interface EventRating {
  id?: string;
  eventId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  rating: number; // 1-5 stars
  review?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EventRatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number }; // 1-5 stars count
}

// Crear o actualizar una valoración
export async function createOrUpdateRating(rating: Omit<EventRating, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Verificar si el usuario ya valoró este evento
    const existingRating = await getUserRatingForEvent(rating.eventId, rating.userId);

    const ratingData = {
      ...rating,
      updatedAt: Timestamp.now(),
    };

    if (existingRating) {
      // Actualizar valoración existente
      await updateDoc(doc(db, 'eventRatings', existingRating.id!), ratingData);
      return existingRating.id!;
    } else {
      // Crear nueva valoración
      const docRef = await addDoc(collection(db, 'eventRatings'), {
        ...ratingData,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error creating/updating rating:', error);
    throw new Error('No se pudo guardar la valoración');
  }
}

// Obtener valoración de un usuario para un evento específico
export async function getUserRatingForEvent(eventId: string, userId: string): Promise<EventRating | null> {
  try {
    const ratingsQuery = query(
      collection(db, 'eventRatings'),
      where('eventId', '==', eventId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(ratingsQuery);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as EventRating;
    }

    return null;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return null;
  }
}

// Obtener todas las valoraciones de un evento
export async function getEventRatings(eventId: string, limit = 50): Promise<EventRating[]> {
  try {
    const ratingsQuery = query(
      collection(db, 'eventRatings'),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(ratingsQuery);
    const ratings: EventRating[] = [];

    snapshot.forEach((doc) => {
      ratings.push({
        id: doc.id,
        ...doc.data(),
      } as EventRating);
    });

    return ratings.slice(0, limit);
  } catch (error) {
    console.error('Error getting event ratings:', error);
    return [];
  }
}

// Obtener estadísticas de valoraciones de un evento
export async function getEventRatingStats(eventId: string): Promise<EventRatingStats> {
  try {
    const ratings = await getEventRatings(eventId, 1000); // Get all ratings for stats

    if (ratings.length === 0) {
      return {
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = Math.round((sumRatings / totalRatings) * 10) / 10; // Round to 1 decimal

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((rating) => {
      ratingDistribution[rating.rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalRatings,
      averageRating,
      ratingDistribution,
    };
  } catch (error) {
    console.error('Error getting event rating stats:', error);
    return {
      totalRatings: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

// Eliminar una valoración
export async function deleteRating(ratingId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'eventRatings', ratingId), {
      rating: 0, // Soft delete by setting rating to 0
      review: '[Eliminado por el usuario]',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error deleting rating:', error);
    return false;
  }
}
