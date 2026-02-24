import { sendEventReminder, sendChatMessageNotification } from '@/lib/notifications'

// Mock fetch
global.fetch = jest.fn()

describe('Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  })

  describe('sendEventReminder', () => {
    it('sends event reminder notification successfully', async () => {
      const result = await sendEventReminder(
        'user123',
        'Concierto de Rock',
        'en 30 minutos',
        'event456'
      )

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123',
          type: 'event_reminder',
          payload: {
            title: 'Recordatorio de evento',
            body: 'Concierto de Rock comienza en 30 minutos',
            icon: '/icon-192x192.png',
            tag: 'event-event456',
            url: '/evento/event456',
            data: { eventId: 'event456', type: 'reminder' },
          },
        }),
      })
    })

    it('handles notification failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      })

      const result = await sendEventReminder(
        'user123',
        'Concierto de Rock',
        'en 30 minutos',
        'event456'
      )

      expect(result).toBe(false)
    })
  })

  describe('sendChatMessageNotification', () => {
    it('sends chat message notification with truncated preview', async () => {
      const longMessage = 'A'.repeat(100) // Very long message
      const result = await sendChatMessageNotification(
        'user123',
        'Juan Pérez',
        longMessage,
        'event456'
      )

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123',
          type: 'chat_message',
          payload: {
            title: 'Mensaje de Juan Pérez',
            body: `${'A'.repeat(47)}...`, // Truncated to 50 chars + ...
            icon: '/icon-192x192.png',
            tag: 'chat-event456',
            url: '/evento/event456?tab=chat',
            data: { eventId: 'event456', type: 'chat' },
          },
        }),
      })
    })

    it('sends chat message notification with short preview', async () => {
      const shortMessage = 'Hola, ¿qué tal?'
      const result = await sendChatMessageNotification(
        'user123',
        'Juan Pérez',
        shortMessage,
        'event456'
      )

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123',
          type: 'chat_message',
          payload: {
            title: 'Mensaje de Juan Pérez',
            body: 'Hola, ¿qué tal?',
            icon: '/icon-192x192.png',
            tag: 'chat-event456',
            url: '/evento/event456?tab=chat',
            data: { eventId: 'event456', type: 'chat' },
          },
        }),
      })
    })
  })
})
