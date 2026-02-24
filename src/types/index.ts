// Global TypeScript types for the application

export interface User {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  title: string
  description: string
  location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  date: Date
  createdBy: string
  attendees: string[]
  images: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  eventId: string
  userId: string
  userName: string
  content: string
  timestamp: Date
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
