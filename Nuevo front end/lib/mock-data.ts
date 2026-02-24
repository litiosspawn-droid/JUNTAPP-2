export type Category = "Música" | "Deporte" | "After" | "Reunión"

export interface Event {
  id: number
  title: string
  category: Category
  date: string
  time: string
  address: string
  lat: number
  lng: number
  description: string
  attendees: number
  flyerUrl: string
}

export interface ChatMessage {
  id: number
  username: string
  avatar: string
  text: string
  timestamp: string
  reactions: { emoji: string; count: number }[]
}

export const CATEGORIES: Category[] = ["Música", "Deporte", "After", "Reunión"]

export const CATEGORY_COLORS: Record<Category, string> = {
  "Música": "bg-chart-1 text-primary-foreground",
  "Deporte": "bg-chart-3 text-primary-foreground",
  "After": "bg-chart-5 text-primary-foreground",
  "Reunión": "bg-chart-2 text-primary-foreground",
}

export const CATEGORY_ICONS: Record<Category, string> = {
  "Música": "music",
  "Deporte": "trophy",
  "After": "party-popper",
  "Reunión": "users",
}

export const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: "Festival Electrónica Urbana",
    category: "Música",
    date: "2026-03-15",
    time: "22:00",
    address: "Av. Corrientes 3456, Buenos Aires",
    lat: -34.6037,
    lng: -58.3816,
    description: "Una noche increíble de música electrónica con DJs internacionales. Ven a disfrutar de los mejores beats en un espacio único al aire libre. Barra de cócteles, food trucks y mucha buena vibra.",
    attendees: 234,
    flyerUrl: "/images/event-1.jpg",
  },
  {
    id: 2,
    title: "Torneo de Fútbol 5 - Copa Barrio",
    category: "Deporte",
    date: "2026-03-20",
    time: "10:00",
    address: "Club Social Deportivo, Calle 45 #1230",
    lat: -34.6150,
    lng: -58.3900,
    description: "Torneo de fútbol 5 abierto para todos los niveles. Inscribí a tu equipo y competí por premios increíbles. Incluye árbitro, cancha y premios para los tres primeros puestos.",
    attendees: 80,
    flyerUrl: "/images/event-2.jpg",
  },
  {
    id: 3,
    title: "After Office en la Terraza",
    category: "After",
    date: "2026-03-22",
    time: "19:00",
    address: "Rooftop Bar, Av. Santa Fe 2100",
    lat: -34.5960,
    lng: -58.3970,
    description: "Cerrá la semana de la mejor manera con tragos 2x1, música en vivo y la mejor vista de la ciudad. Dress code: smart casual. Happy hour hasta las 21hs.",
    attendees: 150,
    flyerUrl: "/images/event-3.jpg",
  },
  {
    id: 4,
    title: "Meetup de Desarrolladores Web",
    category: "Reunión",
    date: "2026-03-25",
    time: "18:30",
    address: "Espacio Coworking Hub, Palermo",
    lat: -34.5870,
    lng: -58.4260,
    description: "Encuentro mensual de desarrolladores web. Este mes: charlas sobre Next.js 16, React Server Components y el futuro del frontend. Networking, pizza y cerveza incluidos.",
    attendees: 65,
    flyerUrl: "/images/event-4.jpg",
  },
  {
    id: 5,
    title: "Noche de Jazz en Vivo",
    category: "Música",
    date: "2026-03-28",
    time: "21:00",
    address: "Jazz Club Thelonious, San Telmo",
    lat: -34.6210,
    lng: -58.3730,
    description: "Una velada íntima con los mejores músicos de jazz de la escena local. Repertorio clásico y contemporáneo. Reserva de mesa con consumición mínima.",
    attendees: 45,
    flyerUrl: "/images/event-5.jpg",
  },
  {
    id: 6,
    title: "Maratón Solidaria 10K",
    category: "Deporte",
    date: "2026-04-02",
    time: "08:00",
    address: "Parque de la Ciudad, Entrada Norte",
    lat: -34.6340,
    lng: -58.4480,
    description: "Corré por una buena causa. La recaudación se destina a comedores comunitarios. Kit de corredor incluido con remera, medalla y frutas. Todos los niveles son bienvenidos.",
    attendees: 320,
    flyerUrl: "/images/event-6.jpg",
  },
  {
    id: 7,
    title: "Pool Party de Verano",
    category: "After",
    date: "2026-04-05",
    time: "14:00",
    address: "Club de Campo Los Robles, Zona Norte",
    lat: -34.5530,
    lng: -58.4750,
    description: "La fiesta de pileta más esperada del verano. DJ sets, barra libre, juegos acuáticos y mucho sol. Traé tu mejor traje de baño y buena onda.",
    attendees: 200,
    flyerUrl: "/images/event-7.jpg",
  },
  {
    id: 8,
    title: "Taller de Fotografía Urbana",
    category: "Reunión",
    date: "2026-04-08",
    time: "16:00",
    address: "Centro Cultural Recoleta, Sala 3",
    lat: -34.5870,
    lng: -58.3930,
    description: "Aprendé técnicas de fotografía callejera con profesionales. Incluye salida fotográfica por el barrio y revisión de portfolio. Traé tu cámara o celular.",
    attendees: 30,
    flyerUrl: "/images/event-8.jpg",
  },
]

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    username: "MaríaGómez",
    avatar: "MG",
    text: "Alguien sabe si hay estacionamiento cerca?",
    timestamp: "14:32",
    reactions: [{ emoji: "👍", count: 3 }],
  },
  {
    id: 2,
    username: "PedroLópez",
    avatar: "PL",
    text: "Sí, hay un estacionamiento a 2 cuadras. Yo siempre dejo el auto ahí.",
    timestamp: "14:35",
    reactions: [{ emoji: "❤️", count: 2 }, { emoji: "🙏", count: 1 }],
  },
  {
    id: 3,
    username: "LucíaFernández",
    avatar: "LF",
    text: "Vamos con amigos, somos 6. Hay que reservar lugar?",
    timestamp: "14:40",
    reactions: [],
  },
  {
    id: 4,
    username: "CarlosRuiz",
    avatar: "CR",
    text: "No hace falta reservar, pero lleguen temprano que se llena rápido!",
    timestamp: "14:42",
    reactions: [{ emoji: "🔥", count: 4 }],
  },
  {
    id: 5,
    username: "AnaMarTínez",
    avatar: "AM",
    text: "El evento del mes pasado estuvo increíble. Este va a ser mejor todavía!",
    timestamp: "15:10",
    reactions: [{ emoji: "🎉", count: 6 }, { emoji: "💯", count: 3 }],
  },
]

export const MOCK_USER = {
  name: "Santiago Rodríguez",
  bio: "Amante de la música, el deporte y los buenos momentos. Siempre buscando el próximo evento para pasarla genial con amigos.",
  avatar: "SR",
  eventsCreated: [1, 4, 5],
  eventsAttending: [2, 3, 6, 7],
}
