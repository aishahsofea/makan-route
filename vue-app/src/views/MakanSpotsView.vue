<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchRoute } from '@/api/route'
import { getBoundingBox } from '@/utils/boundingBox'
import { roundToTwoDecimalPlaces } from '@/utils/haversine'
import PlacesAlongRoute from '@/components/PlacesAlongRoute.vue'
import type { Coordinate } from '@/types'

const route = useRoute()

const origin = route.query.origin as string
const destination = route.query.destination as string
const originLatitude = Number(route.query['origin-lat'])
const originLongitude = Number(route.query['origin-lon'])
const destinationLatitude = Number(route.query['destination-lat'])
const destinationLongitude = Number(route.query['destination-lon'])

const locations = `${originLatitude},${originLongitude}:${destinationLatitude},${destinationLongitude}`

const { data: routeData, isLoading, error } = useQuery({
  queryKey: ['route', locations],
  queryFn: () => fetchRoute(locations),
  enabled: computed(() => locations.length > 0),
})

const boundingBox = computed(() => {
  if (!routeData.value?.points) return { ne: [0, 0], sw: [0, 0] }
  return getBoundingBox(routeData.value.points as Coordinate[])
})

const distanceInKm = computed(() => {
  if (!routeData.value?.summary.lengthInMeters) return 0
  return roundToTwoDecimalPlaces(routeData.value.summary.lengthInMeters / 1000)
})
</script>

<template>
  <div class="p-4 flex flex-col min-h-screen w-full max-w-7xl">
    <div class="flex-none">
      <h1 class="text-2xl font-medium mb-2">
        Showing all the makan spots between
        <span
          style="background-color: var(--secondary)"
          class="font-semibold px-1"
        >
          {{ origin }}
        </span>
        and
        <span
          style="background-color: var(--secondary)"
          class="font-semibold px-1"
        >
          {{ destination }}
        </span>
      </h1>
      
      <p
        v-if="originLatitude && originLongitude && destinationLatitude && destinationLongitude && routeData"
        class="text-gray-600 text-sm mb-6"
      >
        The distance from {{ origin }} to {{ destination }} is approximately
        {{ distanceInKm }} km.
      </p>
    </div>

    <div class="flex items-center justify-center min-h-[200px]">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-4 text-gray-600">Calculating route...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8 text-red-600">
        Error loading route: {{ error }}
      </div>

      <!-- Places Component -->
      <Suspense v-else-if="routeData">
        <template #default>
          <PlacesAlongRoute :bounding-box="boundingBox" />
        </template>
        <template #fallback>
          <div class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p class="mt-4 text-gray-600">Getting all the places...</p>
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

