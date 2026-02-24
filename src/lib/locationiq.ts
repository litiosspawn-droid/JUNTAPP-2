// LocationIQ client configuration
// TODO: Add your LocationIQ API key

const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY
const LOCATIONIQ_BASE_URL = 'https://us1.locationiq.com/v1'

export interface GeocodeResult {
  display_name: string
  lat: string
  lon: string
  place_id: string
}

export const geocodeAddress = async (address: string): Promise<GeocodeResult[]> => {
  if (!LOCATIONIQ_API_KEY) {
    throw new Error('LocationIQ API key not configured')
  }
  
  try {
    const response = await fetch(
      `${LOCATIONIQ_BASE_URL}/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(address)}&format=json`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Geocoding error:', error)
    throw error
  }
}
