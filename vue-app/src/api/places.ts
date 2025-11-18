import { placesAlongRouteSchema } from '@/types/api'

export const fetchPlacesAlongRoute = async (
  ne: string,
  sw: string,
  cursor: number
) => {
  const response = await fetch(
    `/api/makan-spots?ne=${encodeURIComponent(ne)}&sw=${encodeURIComponent(
      sw
    )}&cursor=${cursor}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch places')
  }

  const data = await response.json()
  return placesAlongRouteSchema.parse(data)
}

