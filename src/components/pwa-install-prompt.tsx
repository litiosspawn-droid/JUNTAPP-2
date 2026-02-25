"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X, Smartphone, Zap, Wifi, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const oneWeek = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Only show prompt to logged-in users and not too frequently
      const lastPromptTime = localStorage.getItem('pwa-prompt-last-shown')
      const now = Date.now()
      const oneWeek = 7 * 24 * 60 * 60 * 1000

      if (user && (!lastPromptTime || now - parseInt(lastPromptTime) > oneWeek)) {
        // Delay showing the prompt for better UX
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.setItem('pwa-installed', 'true')

      // Show success message
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡JuntApp instalado!', {
          body: 'Ahora puedes usar JuntApp como una app nativa',
          icon: '/icon-192x192.png',
        })
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if previously dismissed
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < oneWeek) {
      return
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [user])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt')
    } else {
      console.log('User dismissed the PWA install prompt')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-last-shown', Date.now().toString())
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // Don't show if not supported, already installed, or no user
  if (!deferredPrompt || isInstalled || !user || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Download className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Instala JuntApp</CardTitle>
                <CardDescription>¡Mejora tu experiencia!</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-destructive/20"
              aria-label="Cerrar"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-primary" />
              <span>Acceso rápido desde tu pantalla principal</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>Carga más rápida y mejor rendimiento</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4 text-primary" />
              <span>Funciona sin conexión a internet</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-primary" />
              <span>Notificaciones push instantáneas</span>
            </div>
          </div>

          <Button
            onClick={handleInstallClick}
            className="w-full gap-2"
            size="sm"
          >
            <Download className="h-4 w-4" />
            Instalar JuntApp
          </Button>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            No ocupa espacio extra en tu dispositivo
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
