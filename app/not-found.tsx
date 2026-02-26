'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header, Footer } from '@/components/layout'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-orange-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Página no encontrada
            </h2>
            <p className="text-muted-foreground mb-8">
              La página que estás buscando no existe o ha sido movida.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="gap-2">
                  <Home className="w-4 h-4" />
                  Volver al inicio
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver atrás
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Forzar renderizado dinámico para evitar errores de Next.js 16
export const dynamic = 'force-dynamic'
