import { computed } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'
import { fetchPlacesAlongRoute } from '@/api/places'
import type { getBoundingBox } from '@/utils/boundingBox'

const pageSize = 10 // Number of results per page

export const usePlacesAlongRoute = (
  boundingBox: ReturnType<typeof getBoundingBox>
) => {
  const northEast = boundingBox.ne.join(',')
  const southWest = boundingBox.sw.join(',')

  const query = useInfiniteQuery({
    queryKey: ['places-along-route', boundingBox],
    queryFn: async ({ pageParam = 0 }) => {
      const data = await fetchPlacesAlongRoute(northEast, southWest, pageParam)
      return data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const totalItems = lastPage.length
      const nextCursor = pages.length * pageSize
      return nextCursor < totalItems ? nextCursor : undefined
    },
    select: (data) => {
      // Paginate the large list into slices
      const flat = data.pages[0] // all 50 items from API
      const paginated = []
      for (let i = 0; i < flat.length; i += pageSize) {
        paginated.push(flat.slice(i, i + pageSize))
      }
      return {
        pages: paginated.slice(0, data.pageParams.length),
      }
    },
  })

  return {
    status: query.status,
    data: computed(() => query.data.value),
    error: query.error,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
  }
}

