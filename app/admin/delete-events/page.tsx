'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { db } from '@/lib/firebase/client'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { withAdmin } from '@/hoc/withAuth'
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { useUnifiedToast } from '@/hooks/use-unified-toast'

function DeleteAllEventsPage() {
  const { user } = useAuth()
  const toast = useUnifiedToast()
  const [deleting, setDeleting] = useState(false)
  const [deletedCount, setDeletedCount] = useState(0)
  const [totalEvents, setTotalEvents] = useState<number | null>(null)

  const countEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'events'))
      setTotalEvents(querySnapshot.size)
      toast.info('Eventos contados', {
        description: `Hay ${querySnapshot.size} eventos en la base de datos`,
      })
    } catch (error) {
      toast.error('Error al contar eventos', {
        description: (error as Error).message,
      })
    }
  }

  const deleteAllEvents = async () => {
    if (!window.confirm('¿Estás SEGURO de que querés borrar TODOS los eventos? Esta acción no se puede deshacer.')) {
      return
    }

    if (!user) {
      toast.error('Error', {
        description: 'Debes iniciar sesión para realizar esta acción',
      })
      return
    }

    setDeleting(true)
    setDeletedCount(0)

    try {
      const querySnapshot = await getDocs(collection(db, 'events'))
      const deletePromises = querySnapshot.docs.map((doc) => 
        deleteDoc(doc.ref)
      )

      await Promise.all(deletePromises)

      setDeletedCount(querySnapshot.size)
      setTotalEvents(0)
      
      toast.success('Eventos eliminados', {
        description: `Se eliminaron ${querySnapshot.size} eventos exitosamente`,
      })
    } catch (error) {
      toast.error('Error al eliminar eventos', {
        description: (error as Error).message,
      })
    } finally {
      setDeleting(false)
    }
  }

  if (!user || user.email !== 'tu-email-admin@example.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tenés permisos para acceder a esta página.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-6 w-6" />
            Eliminar Todos los Eventos
          </CardTitle>
          <CardDescription>
            Esta acción eliminará permanentemente todos los eventos de la base de datos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Esta acción NO se puede deshacer. Todos los eventos se perderán permanentemente.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={countEvents}
              disabled={deleting}
              className="flex-1"
            >
              Contar Eventos
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAllEvents}
              disabled={deleting || totalEvents === 0}
              className="flex-1 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Eliminando...' : 'Eliminar Todo'}
            </Button>
          </div>

          {totalEvents !== null && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total de eventos:</p>
              <p className="text-2xl font-bold">{totalEvents}</p>
            </div>
          )}

          {deletedCount > 0 && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Se eliminaron {deletedCount} eventos exitosamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Proteger ruta: solo admins
export default withAdmin(DeleteAllEventsPage);
