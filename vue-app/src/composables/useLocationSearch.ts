import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchLocations } from '@/api/location'
import { refDebounced } from '@vueuse/core'
import type { Place } from '@/types/api'

export const useLocationSearch = () => {
  const query = ref('')
  const selectedPlace = ref<Place | null>(null)
  const debouncedQuery = refDebounced(query, 300)

  const placesQuery = useQuery({
    queryKey: ['location', debouncedQuery],
    queryFn: () => fetchLocations(debouncedQuery.value),
    enabled: computed(() => debouncedQuery.value.length >= 3),
  })

  const handleSelection = (place: Place) => {
    selectedPlace.value = place
    query.value = place.name
  }

  return {
    query,
    selectedPlace,
    places: computed(() => placesQuery.data.value || []),
    isLoading: placesQuery.isLoading,
    error: placesQuery.error,
    handleSelection,
  }
}

