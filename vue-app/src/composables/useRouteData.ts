import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchRoute } from '@/api/route'

export const useRouteData = (locations: string) => {
  const query = useQuery({
    queryKey: ['route', locations],
    queryFn: () => fetchRoute(locations),
    enabled: computed(() => locations.length > 0),
  })

  return {
    routeData: computed(() => query.data.value),
    isLoading: query.isLoading,
    error: query.error,
  }
}

