'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '@/lib/firebase/client'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp, Timestamp } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SmilePlus, Flag, Lock, MessageCircle } from 'lucide-react'

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏', '🙌', '💯']

interface Message {
  id: string
  userId: string
  userName: string
  userPhoto?: string
  text: string
  timestamp: Timestamp
  reactions?: Array<{ emoji: string; userId: string }>
  reported?: boolean
  reportedBy?: string[]
}

interface EventChatProps {
  eventId: string
  chatExpiration?: Timestamp
  attendees?: string[]
  creatorId?: string
}

export default function EventChat({ eventId, chatExpiration, attendees = [], creatorId }: EventChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Verificar si el usuario puede acceder al chat
  const canAccessChat = user && (
    attendees.includes(user.uid) ||
    creatorId === user.uid
  )

  // Verificar si el chat ha expirado
  useEffect(() => {
    if (chatExpiration) {
      const expirationDate = chatExpiration.toDate()
      setIsExpired(new Date() > expirationDate)
    }
  }, [chatExpiration])

  // Cargar mensajes en tiempo real
  useEffect(() => {
    if (!canAccessChat) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, `events/${eventId}/messages`),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]
      setMessages(msgs)
      setLoading(false)
    })

    return unsubscribe
  }, [eventId, canAccessChat])

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim() || isExpired || !canAccessChat) return

    try {
      await addDoc(collection(db, `events/${eventId}/messages`), {
        userId: user.uid,
        userName: user.displayName || 'Usuario',
        userPhoto: user.photoURL || '',
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        reactions: [],
        reported: false,
        reportedBy: []
      })
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user || isExpired || !canAccessChat) return

    const messageRef = doc(db, `events/${eventId}/messages`, messageId)
    const message = messages.find(m => m.id === messageId)
    const hasReacted = message?.reactions?.some(r => r.emoji === emoji && r.userId === user.uid)

    try {
      if (hasReacted) {
        // Quitar reacción
        await updateDoc(messageRef, {
          reactions: arrayRemove({ emoji, userId: user.uid })
        })
      } else {
        // Añadir reacción
        await updateDoc(messageRef, {
          reactions: arrayUnion({ emoji, userId: user.uid })
        })
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
    }
  }

  const handleReport = async (messageId: string) => {
    if (!user || !canAccessChat) return

    const confirmReport = window.confirm(
      '¿Estás seguro de que quieres reportar este mensaje? Los administradores lo revisarán.'
    )

    if (!confirmReport) return

    try {
      const messageRef = doc(db, `events/${eventId}/messages`, messageId)
      await updateDoc(messageRef, {
        reported: true,
        reportedBy: arrayUnion(user.uid)
      })
      alert('Mensaje reportado exitosamente')
    } catch (error) {
      console.error('Error reporting message:', error)
      alert('Error al reportar el mensaje')
    }
  }

  const formatTimestamp = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  // Si el usuario no puede acceder al chat
  if (!canAccessChat) {
    return (
      <div className="flex flex-col h-64 border rounded-lg overflow-hidden bg-muted/50">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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
            <MessageCircle className="h-4 w-4" />
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
                <div className="flex flex-col">
                  <div className={`p-3 rounded-lg ${msg.userId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{msg.userName}</span>
                      <span className="text-xs opacity-70">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                    {msg.reported && (
                      <p className="text-xs text-orange-600 mt-1">[Reportado]</p>
                    )}
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center mt-1 space-x-1">
                    {EMOJIS.map(emoji => {
                      const count = msg.reactions?.filter(r => r.emoji === emoji).length || 0
                      const userReacted = msg.reactions?.some(r => r.emoji === emoji && r.userId === user?.uid)
                      return (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          className={`h-6 px-1 text-xs ${userReacted ? 'bg-accent' : ''}`}
                          onClick={() => handleReaction(msg.id, emoji)}
                          disabled={isExpired}
                        >
                          {emoji} {count > 0 && count}
                        </Button>
                      )
                    })}

                    {/* Report button */}
                    {user && msg.userId !== user.uid && !msg.reported && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1 text-xs"
                        onClick={() => handleReport(msg.id)}
                        disabled={isExpired}
                      >
                        <Flag className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
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
