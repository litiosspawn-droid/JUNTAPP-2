import { collection, doc, setDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase/client';

// Sample data for development seeding
export const sampleUsers = [
  {
    uid: 'user-demo-1',
    email: 'demo1@juntapp.com',
    displayName: 'María García',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    bio: 'Apasionada por la música y los eventos culturales.',
    location: 'Buenos Aires, Argentina',
    website: 'https://maria-garcia.dev',
    eventsCreated: [] as string[],
    eventsAttending: [],
    banned: false,
    role: 'user',
    createdAt: Timestamp.fromDate(new Date('2024-01-15')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-15')),
  },
  {
    uid: 'user-demo-2',
    email: 'demo2@juntapp.com',
    displayName: 'Carlos Rodríguez',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    bio: 'Organizador de eventos deportivos y amante del running.',
    location: 'Córdoba, Argentina',
    website: '',
    eventsCreated: [] as string[],
    eventsAttending: [],
    banned: false,
    role: 'user',
    createdAt: Timestamp.fromDate(new Date('2024-01-20')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-20')),
  },
  {
    uid: 'user-demo-3',
    email: 'demo3@juntapp.com',
    displayName: 'Ana López',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    bio: 'Chef profesional y organizadora de eventos gastronómicos.',
    location: 'Rosario, Argentina',
    website: 'https://ana-cocina.com',
    eventsCreated: [] as string[],
    eventsAttending: [],
    banned: false,
    role: 'user',
    createdAt: Timestamp.fromDate(new Date('2024-01-25')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-25')),
  },
];

export const sampleEvents = [
  {
    title: 'Concierto de Jazz en Plaza Dorrego',
    description: 'Disfruta de una noche inolvidable con los mejores músicos de jazz de Buenos Aires. Ambiente único en la tradicional Plaza Dorrego del barrio de San Telmo.',
    category: 'Música',
    date: '2024-12-15',
    time: '21:00',
    address: 'Plaza Dorrego, San Telmo, Buenos Aires',
    lat: -34.6208,
    lng: -58.3732,
    attendees: 89,
    flyerUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    createdBy: 'user-demo-1',
    tags: ['jazz', 'plaza', 'vivo', 'gratis'],
    createdAt: Timestamp.fromDate(new Date('2024-11-01')),
    updatedAt: Timestamp.fromDate(new Date('2024-11-01')),
  },
  {
    title: 'Torneo de Fútbol 7 - Categoría Libre',
    description: 'Únete a nuestro torneo mensual de fútbol 7. Equipos mixtos, todas las edades. Premios para los primeros 3 lugares. Inscripciones abiertas.',
    category: 'Deporte',
    date: '2024-12-20',
    time: '09:00',
    address: 'Complejo Deportivo Córdoba, Córdoba Capital',
    lat: -31.4201,
    lng: -64.1888,
    attendees: 64,
    flyerUrl: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&h=600&fit=crop',
    createdBy: 'user-demo-2',
    tags: ['fútbol', 'torneo', 'equipos', 'competencia'],
    createdAt: Timestamp.fromDate(new Date('2024-11-05')),
    updatedAt: Timestamp.fromDate(new Date('2024-11-05')),
  },
  {
    title: 'Taller de Cocina Italiana - Pasta Fresca',
    description: 'Aprende a hacer pasta fresca desde cero con nuestra chef experta. Incluye degustación de vinos italianos. Cupos limitados.',
    category: 'Gastronomía',
    date: '2024-12-18',
    time: '18:30',
    address: 'Centro Cultural Borges, Buenos Aires',
    lat: -34.6037,
    lng: -58.3816,
    attendees: 25,
    flyerUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    createdBy: 'user-demo-3',
    tags: ['cocina', 'italiana', 'pasta', 'taller'],
    createdAt: Timestamp.fromDate(new Date('2024-11-10')),
    updatedAt: Timestamp.fromDate(new Date('2024-11-10')),
  },
  {
    title: 'Fiesta After Office - Networking IT',
    description: 'Conecta con profesionales del sector IT en un ambiente relajado. Música, bebidas y oportunidades de networking. Solo mayores de 25 años.',
    category: 'After',
    date: '2024-12-22',
    time: '19:00',
    address: 'Bar Tech, Palermo, Buenos Aires',
    lat: -34.5781,
    lng: -58.4263,
    attendees: 156,
    flyerUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
    createdBy: 'user-demo-1',
    tags: ['networking', 'it', 'after', 'profesional'],
    createdAt: Timestamp.fromDate(new Date('2024-11-12')),
    updatedAt: Timestamp.fromDate(new Date('2024-11-12')),
  },
  {
    title: 'Exposición de Arte Digital - NFT Gallery',
    description: 'Descubre el futuro del arte con nuestra exposición de obras digitales y NFTs. Artistas locales e internacionales. Entrada gratuita.',
    category: 'Arte & Cultura',
    date: '2024-12-28',
    time: '16:00',
    address: 'Museo de Arte Digital, La Boca, Buenos Aires',
    lat: -34.6345,
    lng: -58.3631,
    attendees: 43,
    flyerUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
    createdBy: 'user-demo-1',
    tags: ['arte', 'digital', 'nft', 'exposición'],
    createdAt: Timestamp.fromDate(new Date('2024-11-15')),
    updatedAt: Timestamp.fromDate(new Date('2024-11-15')),
  },
  {
    title: 'Clase de Yoga al Aire Libre',
    description: 'Conecta con tu cuerpo y mente en una sesión de yoga al amanecer. Todos los niveles bienvenidos. Trae tu mat y botella de agua.',
    category: 'Bienestar',
    date: '2024-12-16',
    time: '07:00',
    address: 'Parque Centenario, Caballito, Buenos Aires',
    lat: -34.6085,
    lng: -58.4334,
    attendees: 32,
    flyerUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    createdBy: 'user-demo-3',
    tags: ['yoga', 'bienestar', 'aire libre', 'meditación'],
    createdAt: Timestamp.fromDate(new Date('2024-11-18')),
    updatedAt: Timestamp.fromDate(new Date('2024-11-18')),
  },
];

// Función para hacer seeding de datos
export async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed users
    console.log('👥 Seeding users...');
    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.uid), user);
      console.log(`✅ Created user: ${user.displayName}`);
    }

    // Seed events
    console.log('📅 Seeding events...');
    for (const event of sampleEvents) {
      const docRef = await addDoc(collection(db, 'events'), event);
      console.log(`✅ Created event: ${event.title}`);

      // Update user's eventsCreated array
      const userIndex = sampleUsers.findIndex(u => u.uid === event.createdBy);
      if (userIndex !== -1) {
        sampleUsers[userIndex].eventsCreated.push(docRef.id);
        await setDoc(doc(db, 'users', event.createdBy), {
          eventsCreated: sampleUsers[userIndex].eventsCreated,
          updatedAt: Timestamp.now(),
        }, { merge: true });
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Seeded ${sampleUsers.length} users and ${sampleEvents.length} events`);

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
}

// Función para limpiar datos de desarrollo
export async function clearDevData(): Promise<void> {
  console.log('🧹 Clearing development data...');

  try {
    // Note: In a real implementation, you would delete documents
    // But Firestore doesn't support deleting all documents easily
    // This is just for development purposes

    console.log('⚠️ Clear functionality not implemented for safety');
    console.log('Please manually delete development data from Firestore console');

  } catch (error) {
    console.error('❌ Error clearing development data:', error);
    throw error;
  }
}
