'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">¡Ups! Algo salió mal</CardTitle>
              <CardDescription>
                Ha ocurrido un error crítico. No te preocupes, puedes intentar de nuevo.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <strong>Error:</strong> {error.message}
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={reset} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Intentar de nuevo
                </Button>

                <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar página
                </Button>

                <Button variant="outline" onClick={() => (window.location.href = '/')} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Ir al inicio
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="text-sm cursor-pointer text-muted-foreground">
                    Detalles técnicos (desarrollo)
                  </summary>
                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
