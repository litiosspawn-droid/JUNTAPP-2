import { Metadata } from 'next';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const eventDoc = await getDoc(doc(db, 'events', id));
    
    if (!eventDoc.exists()) {
      return {
        title: 'Evento no encontrado | JuntApp',
        description: 'El evento que buscas no existe o fue eliminado',
      };
    }

    const event = eventDoc.data();
    
    return {
      title: event.title ? `${event.title} | JuntApp` : 'Evento | JuntApp',
      description: event.description || `Únete a ${event.title} - ${event.category} en ${event.address}`,
      keywords: [
        event.title,
        event.category,
        event.subcategory,
        ...(event.tags || []),
        'eventos',
        'Buenos Aires',
        'Argentina',
      ].filter(Boolean).join(', '),
      openGraph: {
        title: event.title,
        description: event.description || `Únete a ${event.title}`,
        type: 'website',
        images: event.flyerUrl ? [{ url: event.flyerUrl }] : [],
        locale: 'es_AR',
        siteName: 'JuntApp',
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description: event.description || `Únete a ${event.title}`,
        images: event.flyerUrl ? [event.flyerUrl] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Evento | JuntApp',
      description: 'Descubre eventos locales en tu comunidad',
    };
  }
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return children;
}
