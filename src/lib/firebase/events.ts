import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, Timestamp, getDoc, increment } from 'firebase/firestore';
import { db } from './client';
import { uploadToCloudinary } from '../cloudinary';

export type Category =
  | "Música"
  | "Deporte"
  | "After"
  | "Reunión"
  | "Arte & Cultura"
  | "Tecnología"
  | "Gastronomía"
  | "Educación"
  | "Bienestar"
  | "Entretenimiento"
  | "Negocios"
  | "Religión"
  | "Familia"
  | "Otros";

export interface Event {
  id?: string;
  title: string;
  category: Category;
  subcategory?: string;
  tags?: string[];
  date: string;
  time: string;
  endDate?: string; // Para eventos recurrentes
  endTime?: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  attendees: number;
  maxAttendees?: number; // Límite de cupo
  flyerUrl: string;
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  // Nuevos campos para características críticas
  isRecurring?: boolean; // Evento recurrente
  recurrencePattern?: 'weekly' | 'monthly' | 'custom';
  isPrivate?: boolean; // Evento privado
  status?: 'active' | 'cancelled' | 'completed'; // Estado del evento
  viewCount?: number; // Para analytics
}

export const CATEGORIES: Category[] = [
  "Música",
  "Deporte",
  "After",
  "Reunión",
  "Arte & Cultura",
  "Tecnología",
  "Gastronomía",
  "Educación",
  "Bienestar",
  "Entretenimiento",
  "Negocios",
  "Religión",
  "Familia",
  "Otros"
];

export const CATEGORY_COLORS: Record<Category, string> = {
  "Música": "bg-purple-500 text-white hover:bg-purple-600",
  "Deporte": "bg-green-500 text-white hover:bg-green-600",
  "After": "bg-pink-500 text-white hover:bg-pink-600",
  "Reunión": "bg-blue-500 text-white hover:bg-blue-600",
  "Arte & Cultura": "bg-indigo-500 text-white hover:bg-indigo-600",
  "Tecnología": "bg-cyan-500 text-white hover:bg-cyan-600",
  "Gastronomía": "bg-orange-500 text-white hover:bg-orange-600",
  "Educación": "bg-teal-500 text-white hover:bg-teal-600",
  "Bienestar": "bg-emerald-500 text-white hover:bg-emerald-600",
  "Entretenimiento": "bg-yellow-500 text-black hover:bg-yellow-600",
  "Negocios": "bg-gray-600 text-white hover:bg-gray-700",
  "Religión": "bg-amber-600 text-white hover:bg-amber-700",
  "Familia": "bg-rose-400 text-white hover:bg-rose-500",
  "Otros": "bg-slate-500 text-white hover:bg-slate-600",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  "Música": "music",
  "Deporte": "trophy",
  "After": "party-popper",
  "Reunión": "users",
  "Arte & Cultura": "palette",
  "Tecnología": "cpu",
  "Gastronomía": "utensils-crossed",
  "Educación": "graduation-cap",
  "Bienestar": "heart",
  "Entretenimiento": "gamepad-2",
  "Negocios": "briefcase",
  "Religión": "church",
  "Familia": "home",
  "Otros": "more-horizontal",
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  "Música": "Conciertos, recitales, festivales y eventos musicales",
  "Deporte": "Partidos, torneos, entrenamientos y actividades deportivas",
  "After": "Fiestas nocturnas, bares, discotecas y eventos sociales",
  "Reunión": "Encuentros, networking, conferencias y reuniones profesionales",
  "Arte & Cultura": "Exposiciones, teatro, danza, cine y eventos culturales",
  "Tecnología": "Meetups tech, hackathons, conferencias y workshops",
  "Gastronomía": "Degustaciones, clases de cocina, ferias gastronómicas",
  "Educación": "Talleres, cursos, seminarios y capacitaciones",
  "Bienestar": "Yoga, meditación, mindfulness y actividades saludables",
  "Entretenimiento": "Cine, juegos, espectáculos y diversión general",
  "Negocios": "Ferias, exposiciones, lanzamientos y eventos corporativos",
  "Religión": "Celebraciones religiosas, ceremonias y encuentros espirituales",
  "Familia": "Eventos para toda la familia, niños y actividades grupales",
  "Otros": "Categorías diversas y eventos especiales",
};

export const SUBCATEGORIES: Record<Category, string[]> = {
  "Música": ["Rock", "Pop", "Electrónica", "Jazz", "Clásica", "Reggaeton", "Cumbia", "Folk"],
  "Deporte": ["Fútbol", "Básquet", "Tenis", "Running", "Ciclismo", "Natación", "Fitness", "Artes Marciales"],
  "After": ["Bar", "Discoteca", "Pub", "Fiesta Privada", "After Office", "Cocktail", "Wine Tasting"],
  "Reunión": ["Networking", "Conferencia", "Seminario", "Workshop", "Panel", "Charla", "Debate"],
  "Arte & Cultura": ["Pintura", "Escultura", "Fotografía", "Teatro", "Danza", "Cine", "Literatura", "Museo"],
  "Tecnología": ["AI/ML", "Desarrollo Web", "Mobile", "DevOps", "Blockchain", "IoT", "Gaming", "Startup"],
  "Gastronomía": ["Cocina Internacional", "Cocina Local", "Vegana", "Mariscos", "Asados", "Postres", "Degustación"],
  "Educación": ["Idiomas", "Programación", "Marketing", "Diseño", "Negocios", "Arte", "Ciencia", "Historia"],
  "Bienestar": ["Yoga", "Meditación", "Pilates", "Masajes", "Spa", "Terapias", "Mindfulness", "Deporte Suave"],
  "Entretenimiento": ["Cine", "Teatro", "Conciertos", "Stand Up", "Magia", "Circo", "Juegos", "eSports"],
  "Negocios": ["Startup", "Inversión", "Marketing", "Ventas", "Liderazgo", "Innovación", "Networking"],
  "Religión": ["Cristiana", "Judía", "Musulmana", "Budista", "Hinduista", "Espiritual", "Interreligiosa"],
  "Familia": ["Niños", "Adolescentes", "Padres", "Abuelos", "Actividades Grupales", "Picnics", "Viajes"],
  "Otros": ["Fiestas", "Cumpleaños", "Aniversarios", "Graduaciones", "Bodas", "Especiales"]
};

export const POPULAR_TAGS = [
  "Gratis", "Pago", "VIP", "Premium", "Outdoor", "Indoor", "21+", "18+", "Todo público",
  "Con alcohol", "Sin alcohol", "Vegetariano", "Vegano", "Pet friendly", "Accesible",
  "Parking", "Transporte público", "Streaming", "Presencial", "Híbrido"
];

const EVENTS_COLLECTION = 'events';

export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, flyerFile?: File, userId?: string): Promise<string> => {
  try {
    console.log('🚀 STARTING EVENT CREATION PROCESS');
    console.log('Event data received:', eventData);
    console.log('User ID:', userId);
    console.log('Has flyer file:', !!flyerFile);
    
    if (!userId) {
      console.error('❌ ERROR: No user ID provided');
      throw new Error('Usuario no autenticado');
    }

    // Verificar que el usuario tenga un documento válido
    console.log('🔍 Checking user document...');
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('❌ ERROR: User document does not exist');
      throw new Error('Documento de usuario no encontrado. Por favor, cierra sesión y vuelve a iniciar.');
    }
    
    const userData = userDoc.data();
    console.log('✅ User document found:', userData);
    console.log('User banned status:', userData.banned);
    console.log('User role:', userData.role);
    
    if (userData.banned !== false) {
      console.error('❌ ERROR: User is banned or has invalid banned status');
      throw new Error('Usuario baneado o sin permisos. Contacta al administrador.');
    }

    let flyerUrl = eventData.flyerUrl;
    
    // Subir la imagen si se proporcionó un archivo
    if (flyerFile) {
      console.log('📤 Uploading flyer file to Cloudinary...');
      try {
        flyerUrl = await uploadToCloudinary(flyerFile, 'events');
        console.log('✅ File uploaded successfully to Cloudinary:', flyerUrl);
      } catch (uploadError) {
        console.error('❌ ERROR: Failed to upload to Cloudinary:', uploadError);
        throw new Error('No se pudo subir la imagen del flyer. Inténtalo de nuevo.');
      }
    }

    // Crear evento con TODOS los campos necesarios
    const eventToSave = {
      title: eventData.title,
      description: eventData.description,
      category: eventData.category,
      address: eventData.address,
      lat: eventData.lat,
      lng: eventData.lng,
      time: eventData.time,
      location: {
        latitude: eventData.lat,
        longitude: eventData.lng,
      },
      creatorId: userId,
      createdBy: userId,
      date: eventData.date,
      attendees: 0,
      flyerUrl,
      tags: eventData.tags || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('📝 Attempting to save event with all fields...');
    console.log('Event to save:', JSON.stringify(eventToSave, null, 2));

    // Verificar que todos los campos requeridos estén presentes
    const requiredFields = ['title', 'description', 'category', 'address', 'date', 'creatorId', 'createdBy'] as const;
    const missingFields = requiredFields.filter(field => !(field in eventToSave) || eventToSave[field as keyof typeof eventToSave] === undefined || eventToSave[field as keyof typeof eventToSave] === null);

    if (missingFields.length > 0) {
      console.error('❌ ERROR: Missing required fields:', missingFields);
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
    }

    console.log('✅ All required fields present');

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventToSave);
    console.log('✅ Event created successfully with ID:', docRef.id);
    console.log('🎉 EVENT CREATION COMPLETED SUCCESSFULLY');
    return docRef.id;
  } catch (error) {
    console.error('💥 EVENT CREATION FAILED');
    const err = error as Error;
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error code:', (err as any).code);
    
    if ((err as any).code) {
      console.error('Firestore error code details:', (err as any).code);
    }
    
    throw new Error('No se pudo crear el evento: ' + err.message);
  }
};

export const getEvents = async (): Promise<Event[]> => {
  try {
    // Obtener todos los eventos sin orderBy para evitar índices
    const q = query(collection(db, EVENTS_COLLECTION));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString().split('T')[0] || doc.data().date,
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt,
    } as Event));

    // Ordenar por fecha en el cliente
    events.sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')).getTime() - new Date(b.date + 'T' + (b.time || '00:00')).getTime());

    return events;
  } catch (error) {
    console.error('Error getting events:', error);
    throw new Error('No se pudieron cargar los eventos');
  }
};

export const getEventsByCategory = async (category: Category): Promise<Event[]> => {
  try {
    // Obtener todos los eventos y filtrar por categoría en el cliente
    const q = query(collection(db, EVENTS_COLLECTION));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString().split('T')[0] || doc.data().date,
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt,
    } as Event));

    // Filtrar por categoría y ordenar por fecha en el cliente
    return events
      .filter(event => event.category === category)
      .sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')).getTime() - new Date(b.date + 'T' + (b.time || '00:00')).getTime());
  } catch (error) {
    console.error('Error getting events by category:', error);
    throw new Error('No se pudieron cargar los eventos de esta categoría');
  }
};

export const updateEvent = async (eventId: string, updates: Partial<Event>): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('No se pudo actualizar el evento');
  }
};

export const deleteEvent = async (eventId: string, userId: string): Promise<void> => {
  try {
    console.log('Deleting event...', { eventId, userId });
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    // Verificar que el usuario tenga un documento válido
    console.log('Verifying user document...');
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Documento de usuario no encontrado. Por favor, cierra sesión y vuelve a iniciar.');
    }

    // Obtener el evento para verificar que el usuario es el creador
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Evento no encontrado');
    }
    
    const eventData = eventDoc.data();
    
    // Verificar que el usuario sea el creador del evento
    if (eventData.creatorId !== userId) {
      throw new Error('Solo puedes eliminar eventos que hayas creado');
    }

    console.log('Deleting event from Firestore...');
    await deleteDoc(eventRef);
    console.log('Event deleted successfully');

  } catch (error) {
    console.error('Error deleting event:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      code: (error as any).code,
      name: (error as Error).name
    });
    throw new Error('No se pudo eliminar el evento: ' + (error as Error).message);
  }
};

export const incrementAttendees = async (eventId: string): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      attendees: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing attendees:', error);
    throw new Error('No se pudo incrementar la cantidad de asistentes');
  }
};
