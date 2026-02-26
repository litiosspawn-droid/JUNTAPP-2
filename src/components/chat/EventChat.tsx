'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '@/lib/firebase/client'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp, Timestamp } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '../ui/scroll-area'
import { Lock as LockIcon, MessageCircle as MessageCircleIcon, Flag as FlagIcon, SmilePlus as SmilePlusIcon, ChevronUp, MapPin } from 'lucide-react'
import { useChatModeration } from '@/hooks/use-moderation'
import { ReportContentModal } from '@/components/moderation/report-content-modal'
import { EmojiPicker } from './emoji-picker'
import { LocationShare, SharedLocationDisplay } from './location-share'
import type { EnhancedChatMessage, ReactionEmoji } from '@/types'

const EMOJIS: ReactionEmoji[] = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥']

interface Message {
  id: string
  userId: string
  userName: string
  userPhoto?: string
  text: string
  timestamp: Timestamp
  reactions?: Array<{
    emoji: string
    userId: string
  }>
  reported?: boolean
  reportedBy?: string[]
  location?: any
}

interface EventChatProps {
  eventId: string
  chatExpiration?: Timestamp
  attendees?: string[]
  creatorId?: string
}

export default function EventChat({ eventId, chatExpiration, attendees = [], creatorId }: EventChatProps) {
  const { user } = useAuth()
  const chatModeration = useChatModeration()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [showLocationShare, setShowLocationShare] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ messageId: string; userId: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReactions, setShowReactions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Verificar si el usuario puede acceder al chat
  // Solo los asistentes confirmados o el creador pueden acceder
  const canAccessChat = user && (attendees.includes(user.uid) || creatorId === user.uid)

  // Verificar si el chat ha expirado
  useEffect(() => {
    if (chatExpiration) {
      const now = Timestamp.now()
      setIsExpired(chatExpiration.toMillis() < now.toMillis())
    }
  }, [chatExpiration])

  // Cargar mensajes del chat
  useEffect(() => {
    if (!eventId || !canAccessChat) return

    setLoading(true)
    const messagesQuery = query(
      collection(db, 'events', eventId, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]

      setMessages(messagesData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [eventId, canAccessChat])

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Enviar mensaje con moderación
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || isExpired) return

    // Validar contenido con moderación
    const moderationResult = chatModeration.checkContent(newMessage.trim())
    
    if (!moderationResult.isSafe && moderationResult.autoAction === 'block') {
      return // Bloqueado automáticamente
    }

    try {
      await addDoc(collection(db, 'events', eventId, 'messages'), {
        userId: user!.uid,
        userName: user!.displayName || 'Usuario',
        userPhoto: user!.photoURL,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        reactions: [],
        reported: false,
        reportedBy: [],
        moderationResult: {
          severity: moderationResult.severity,
          confidence: moderationResult.confidence,
        },
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Reaccionar a mensaje
  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return

    try {
      const messageRef = doc(db, 'events', eventId, 'messages', messageId)
      const message = messages.find(m => m.id === messageId)
      if (!message) return

      const existingReaction = message.reactions?.find(r => r.emoji === emoji && r.userId === user.uid)

      if (existingReaction) {
        // Remover reacción
        await updateDoc(messageRef, {
          reactions: arrayRemove(existingReaction)
        })
      } else {
        // Agregar reacción
        await updateDoc(messageRef, {
          reactions: arrayUnion({ emoji, userId: user!.uid })
        })
      }
    } catch (error) {
      console.error('Error handling reaction:', error)
    }
  }

  // Reportar mensaje
  const handleReport = async (messageId: string) => {
    if (!user) return

    const confirmReport = window.confirm(
      '¿Estás seguro de que quieres reportar este mensaje? Los administradores revisarán el contenido.'
    )

    if (!confirmReport) return

    try {
      const messageRef = doc(db, 'events', eventId, 'messages', messageId)
      await updateDoc(messageRef, {
        reported: true,
        reportedBy: arrayUnion(user!.uid),
        reportedAt: serverTimestamp()
      })
      alert('Mensaje reportado exitosamente. Los administradores lo revisarán.')
    } catch (error) {
      console.error('Error reporting message:', error)
      alert('Error al reportar el mensaje. Inténtalo de nuevo.')
    }
  }

  // Si el usuario no puede acceder al chat
  if (!canAccessChat) {
    return (
      <div className="flex flex-col h-64 border rounded-lg overflow-hidden bg-muted/50">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <LockIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Chat privado</h3>
            <p className="text-muted-foreground">
              Solo los asistentes al evento pueden ver y participar en el chat.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si está cargando
  if (loading) {
    return (
      <div className="flex flex-col h-64 border rounded-lg overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-96 border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircleIcon className="h-4 w-4" />
            <span className="font-medium">Chat del evento</span>
            {messages.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({messages.length} mensajes)
              </span>
            )}
          </div>
          {isExpired && (
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              Chat cerrado
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.userId === user?.uid ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs flex ${msg.userId === user?.uid ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className="h-8 w-8 mx-2 flex-shrink-0">
                  <AvatarImage src={msg.userPhoto} />
                  <AvatarFallback className="text-xs">
                    {msg.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {msg.userName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={`rounded-lg px-3 py-2 max-w-xs break-words ${
                    msg.userId === user?.uid
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    {msg.reported && (
                      <p className="text-xs text-orange-600 mt-1">[Reportado]</p>
                    )}
                  </div>

                  {/* Reactions - Collapsible */}
                  <div className="flex items-center mt-1 space-x-1">
                    {showReactions ? (
                      <>
                        {EMOJIS.map(emoji => {
                          const count = msg.reactions?.filter(r => r.emoji === emoji).length || 0
                          const userReacted = msg.reactions?.some(r => r.emoji === emoji && r.userId === user?.uid)
                          return (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className={`h-6 px-1 text-xs ${userReacted ? 'bg-blue-100' : ''}`}
                              onClick={() => handleReaction(msg.id, emoji)}
                              disabled={isExpired}
                            >
                              {emoji} {count > 0 && count}
                            </Button>
                          )
                        })}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1 text-xs"
                          onClick={() => setShowReactions(false)}
                          title="Ocultar reacciones"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setShowReactions(true)}
                        disabled={isExpired}
                        title="Mostrar reacciones"
                      >
                        <SmilePlusIcon className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Report button */}
                  {user && msg.userId !== user.uid && !msg.reported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs"
                      onClick={() => handleReport(msg.id)}
                      disabled={isExpired}
                    >
                      <FlagIcon className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-card">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={
            isExpired
              ? "El chat ha expirado (solo lectura)"
              : "Escribe un mensaje..."
          }
          disabled={isExpired}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!newMessage.trim() || isExpired}
          size="sm"
        >
          Enviar
        </Button>
      </form>
    </div>
  )
}
