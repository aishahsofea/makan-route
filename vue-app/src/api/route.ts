import { routeSchema } from '@/types/api'

export const fetchRoute = async (locations: string) => {
  const res = await fetch(
    `/api/makan-spots/get-route?locations=${encodeURIComponent(locations)}`
  )
  if (!res.ok) {
    throw new Error('Failed to fetch route')
  }
  return routeSchema.parse(await res.json())
}

