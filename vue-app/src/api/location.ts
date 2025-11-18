import { placesSchema } from '@/types/api'

export const fetchLocations = async (query: string) => {
  const res = await fetch(`/api/location?q=${encodeURIComponent(query)}`)
  if (!res.ok) {
    throw new Error('Failed to fetch places')
  }

  const parsedPlaces = placesSchema.parse(await res.json())
  if (parsedPlaces.length === 0) {
    throw new Error('No places found')
  }
  return parsedPlaces
}

