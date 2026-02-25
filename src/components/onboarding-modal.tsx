'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Users, Bell, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const steps: OnboardingStep[] = [
  {
    title: 'Explora eventos cercanos',
    description: 'Descubrí lo que está pasando en tu zona. Filtrá por categoría, fecha o ubicación.',
    icon: <MapPin className="h-8 w-8" />,
    color: 'bg-blue-500',
  },
  {
    title: 'Creá tus propios eventos',
    description: 'Compartí tus ideas con la comunidad. Organizá reuniones, talleres, fiestas y más.',
    icon: <Plus className="h-8 w-8" />,
    color: 'bg-green-500',
  },
  {
    title: 'Conectá con otros',
    description: 'Unite a eventos, chateá con asistentes y ampliá tu red de contactos.',
    icon: <Users className="h-8 w-8" />,
    color: 'bg-purple-500',
  },
  {
    title: 'Recibí notificaciones',
    description: 'Mantenete al tanto de nuevos eventos y actualizaciones de tu interés.',
    icon: <Bell className="h-8 w-8" />,
    color: 'bg-orange-500',
  },
]

export function OnboardingModal() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      // Mostrar onboarding después de un breve delay
      const timer = setTimeout(() => setIsOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsOpen(false)
  }

  const handleAction = () => {
    if (currentStep === 1) {
      router.push('/crear')
      completeOnboarding()
    } else if (currentStep === 0) {
      router.push('/mapa')
      completeOnboarding()
    } else {
      handleNext()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="relative">
          {/* Progress indicators */}
          <div className="flex justify-center gap-2 p-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted'
                )}
                aria-label={`Ir al paso ${index + 1}`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-6 pt-2">
            <div className="text-center mb-6">
              <div
                className={cn(
                  'inline-flex items-center justify-center rounded-full p-4 mb-4 text-white',
                  steps[currentStep].color
                )}
              >
                {steps[currentStep].icon}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1"
                >
                  Atrás
                </Button>
              )}
              <Button
                onClick={handleAction}
                className={cn(
                  'flex-1 gap-2',
                  currentStep === steps.length - 1 && 'bg-green-600 hover:bg-green-700'
                )}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="h-4 w-4" />
                    Comenzar
                  </>
                ) : currentStep === 1 ? (
                  <>
                    <Plus className="h-4 w-4" />
                    Crear Evento
                  </>
                ) : currentStep === 0 ? (
                  <>
                    <MapPin className="h-4 w-4" />
                    Explorar Mapa
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </div>

            {/* Skip button */}
            <Button
              variant="ghost"
              onClick={completeOnboarding}
              className="w-full mt-2 text-sm"
              size="sm"
            >
              Saltar introducción
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
