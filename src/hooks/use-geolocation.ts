import { useState, useEffect } from 'react'

interface UseGeolocationResult {
  position: [number, number] | null
  loading: boolean
  error: string | null
  requestLocation: () => void
}

export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por este navegador')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setPosition([latitude, longitude])
        setLoading(false)
      },
      (error) => {
        let errorMessage = 'Error al obtener ubicación'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible'
            break
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado'
            break
        }
        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Intentar obtener ubicación automáticamente al montar
  useEffect(() => {
    requestLocation()
  }, [])

  return { position, loading, error, requestLocation }
}
