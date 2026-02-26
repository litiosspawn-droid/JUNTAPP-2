/**
 * Hook mejorado para chat en tiempo real
 * Con soporte para reacciones, ubicación y actualizaciones en vivo
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  where,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { useAuth } from '@/contexts/AuthContext'
import type {
  EnhancedChatMessage,
  MessageReaction,
  ReactionEmoji,
  SharedLocation,
  MessageType,
} from '@/types'

interface UseChatOptions {
  eventId: string
  limit?: number
  enabled?: boolean
}

interface UseChatReturn {
  messages: EnhancedChatMessage[]
  loading: boolean
  error: Error | null
  sendMessage: (content: string, type?: MessageType, location?: SharedLocation) => Promise<void>
  sendReaction: (messageId: string, emoji: ReactionEmoji) => Promise<void>
  removeReaction: (messageId: string, emoji: ReactionEmoji) => Promise<void>
  shareLocation: (location: SharedLocation) => Promise<void>
  editMessage: (messageId: string, newContent: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  replyToMessage: (messageId: string, content: string) => Promise<void>
  isUploading: boolean
  hasMore: boolean
  loadMore: () => Promise<void>
}

/**
 * Hook para chat en tiempo real mejorado
 */
export function useChat({
  eventId,
  limit = 50,
  enabled = true,
}: UseChatOptions): UseChatReturn {
  const { user } = useAuth()
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const lastMessageRef = useRef<EnhancedChatMessage | null>(null)

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!enabled || !eventId || !user) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const messagesRef = collection(db, 'chats', eventId, 'messages')
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(limit)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages: EnhancedChatMessage[] = []

        snapshot.forEach((doc) => {
          const data = doc.data()
          newMessages.push({
            id: doc.id,
            eventId,
            userId: data.userId,
            userName: data.userName,
            userPhotoURL: data.userPhotoURL,
            type: data.type || 'TEXT',
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            reactions: data.reactions || [],
            location: data.location,
            imageUrl: data.imageUrl,
            isEdited: data.isEdited || false,
            isDeleted: data.isDeleted || false,
            replyTo: data.replyTo,
            mentions: data.mentions || [],
          } as EnhancedChatMessage)
        })

        // Ordenar por timestamp ascendente
        newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

        setMessages(newMessages)
        lastMessageRef.current = newMessages[newMessages.length - 1] || null
        setHasMore(newMessages.length >= limit)
        setLoading(false)
      },
      (err) => {
        console.error('Error subscribing to chat:', err)
        setError(err instanceof Error ? err : new Error('Error al cargar el chat'))
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [eventId, enabled, user, limit])

  // Enviar mensaje
  const sendMessage = useCallback(
    async (
      content: string,
      type: MessageType = 'TEXT',
      location?: SharedLocation
    ) => {
      if (!user || !eventId) {
        throw new Error('Debes iniciar sesión para enviar mensajes')
      }

      if (!content.trim() && type === 'TEXT') {
        throw new Error('El mensaje no puede estar vacío')
      }

      setIsUploading(true)

      try {
        const messagesRef = collection(db, 'chats', eventId, 'messages')
        await addDoc(messagesRef, {
          eventId,
          userId: user.uid,
          userName: user.displayName || 'Usuario',
          userPhotoURL: user.photoURL,
          type,
          content,
          location,
          timestamp: serverTimestamp(),
          reactions: [],
          isEdited: false,
          isDeleted: false,
          mentions: [],
        })
      } catch (err) {
        console.error('Error sending message:', err)
        throw err
      } finally {
        setIsUploading(false)
      }
    },
    [user, eventId]
  )

  // Enviar reacción
  const sendReaction = useCallback(
    async (messageId: string, emoji: ReactionEmoji) => {
      if (!user || !eventId) return

      try {
        const messageRef = doc(db, 'chats', eventId, 'messages', messageId)
        const reaction: MessageReaction = {
          emoji,
          userId: user.uid,
          userName: user.displayName || 'Usuario',
          timestamp: new Date(),
        }

        await updateDoc(messageRef, {
          reactions: arrayUnion(reaction),
        })
      } catch (err) {
        console.error('Error sending reaction:', err)
        throw err
      }
    },
    [user, eventId]
  )

  // Remover reacción
  const removeReaction = useCallback(
    async (messageId: string, emoji: ReactionEmoji) => {
      if (!user || !eventId) return

      try {
        const messageRef = doc(db, 'chats', eventId, 'messages', messageId)

        // Obtener mensaje actual
        const messagesRef = collection(db, 'chats', eventId, 'messages')
        const snapshot = await getDocs(
          query(messagesRef, where('__name__', '==', messageId))
        )

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data()
          const reactions = data.reactions || []

          // Filtrar reacciones de este usuario con este emoji
          const filteredReactions = reactions.filter(
            (r: MessageReaction) => !(r.userId === user.uid && r.emoji === emoji)
          )

          await updateDoc(messageRef, {
            reactions: filteredReactions,
          })
        }
      } catch (err) {
        console.error('Error removing reaction:', err)
        throw err
      }
    },
    [user, eventId]
  )

  // Compartir ubicación
  const shareLocation = useCallback(
    async (location: SharedLocation) => {
      await sendMessage('', 'LOCATION', location)
    },
    [sendMessage]
  )

  // Editar mensaje
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!user || !eventId) return

      try {
        const messageRef = doc(db, 'chats', eventId, 'messages', messageId)
        await updateDoc(messageRef, {
          content: newContent,
          isEdited: true,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('Error editing message:', err)
        throw err
      }
    },
    [user, eventId]
  )

  // Eliminar mensaje (soft delete)
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!user || !eventId) return

      try {
        const messageRef = doc(db, 'chats', eventId, 'messages', messageId)
        await updateDoc(messageRef, {
          isDeleted: true,
          content: '[Mensaje eliminado]',
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('Error deleting message:', err)
        throw err
      }
    },
    [user, eventId]
  )

  // Responder a mensaje
  const replyToMessage = useCallback(
    async (messageId: string, content: string) => {
      await sendMessage(content, 'TEXT')
      // Nota: La lógica de replyTo se manejaría en el componente UI
    },
    [sendMessage]
  )

  // Cargar más mensajes
  const loadMore = useCallback(async () => {
    if (!eventId || !user || !hasMore || !lastMessageRef.current) return

    try {
      const messagesRef = collection(db, 'chats', eventId, 'messages')
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        limit(limit),
      )

      const snapshot = await getDocs(q)
      const newMessages: EnhancedChatMessage[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        newMessages.push({
          id: doc.id,
          eventId,
          userId: data.userId,
          userName: data.userName,
          userPhotoURL: data.userPhotoURL,
          type: data.type || 'TEXT',
          content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
          reactions: data.reactions || [],
          isEdited: data.isEdited || false,
          isDeleted: data.isDeleted || false,
        } as EnhancedChatMessage)
      })

      newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      setMessages(newMessages)
      setHasMore(newMessages.length >= limit)
    } catch (err) {
      console.error('Error loading more messages:', err)
      throw err
    }
  }, [eventId, user, hasMore, limit, lastMessageRef])

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendReaction,
    removeReaction,
    shareLocation,
    editMessage,
    deleteMessage,
    replyToMessage,
    isUploading,
    hasMore,
    loadMore,
  }
}
