<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useIntersectionObserver } from '@vueuse/core'
import { usePlacesAlongRoute } from '@/composables/usePlacesAlongRoute'
import PlaceCard from './PlaceCard.vue'
import type { Coordinate } from '@/types'
import type { getBoundingBox } from '@/utils/boundingBox'

interface Props {
  boundingBox: ReturnType<typeof getBoundingBox>
}

const props = defineProps<Props>()
const route = useRoute()

const origin = route.query.origin as string
const destination = route.query.destination as string
const originLatitude = Number(route.query['origin-lat'])
const originLongitude = Number(route.query['origin-lon'])
const destinationLatitude = Number(route.query['destination-lat'])
const destinationLongitude = Number(route.query['destination-lon'])

const originCoordinates: Coordinate = {
  lat: originLatitude,
  lon: originLongitude,
}

const destinationCoordinates: Coordinate = {
  lat: destinationLatitude,
  lon: destinationLongitude,
}

const {
  status,
  data,
  error,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
} = usePlacesAlongRoute(props.boundingBox)

// Intersection observer for infinite scroll
const loadMoreButton = ref<HTMLElement | null>(null)
useIntersectionObserver(
  loadMoreButton,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasNextPage.value && !isFetchingNextPage.value) {
      fetchNextPage()
    }
  }
)

const handleLoadMore = () => {
  fetchNextPage()
}
</script>

<template>
  <div class="flex flex-col w-full">
    <div v-if="status === 'pending'" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p class="mt-4 text-gray-600">Getting all the places...</p>
    </div>

    <div v-else-if="status === 'error'" class="text-center py-8 text-red-600">
      Error loading places: {{ error }}
    </div>

    <div v-else-if="data">
      <div v-for="(places, pageIndex) in data.pages" :key="pageIndex" class="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        <PlaceCard
          v-for="place in places"
          :key="place.fsq_id"
          :place="place"
          :origin-coordinates="originCoordinates"
          :destination-coordinates="destinationCoordinates"
          :origin="origin"
          :destination="destination"
        />
      </div>
    </div>

    <!-- Load more button -->
    <button
      v-if="hasNextPage"
      ref="loadMoreButton"
      @click="handleLoadMore"
      :disabled="isFetchingNextPage"
      class="my-4 px-6 py-3 rounded-none font-medium transition-all duration-300"
      style="background-color: var(--secondary); color: var(--secondary-foreground)"
    >
      {{ isFetchingNextPage ? 'Loading...' : 'Load More' }}
    </button>
  </div>
</template>

