<script setup lang="ts">
import type { PlaceAlongRoute } from '@/types/api'
import type { Coordinate } from '@/types'
import { haversineDistance, roundToTwoDecimalPlaces } from '@/utils/haversine'

interface Props {
  place: PlaceAlongRoute
  originCoordinates: Coordinate
  destinationCoordinates: Coordinate
  origin: string
  destination: string
}

const props = defineProps<Props>()

const distanceFromOrigin = () =>
  roundToTwoDecimalPlaces(
    haversineDistance(props.originCoordinates, {
      lat: props.place.geocodes.main.latitude,
      lon: props.place.geocodes.main.longitude,
    }) / 1000
  )

const distanceFromDestination = () =>
  roundToTwoDecimalPlaces(
    haversineDistance(props.destinationCoordinates, {
      lat: props.place.geocodes.main.latitude,
      lon: props.place.geocodes.main.longitude,
    }) / 1000
  )

const openInMaps = () => {
  window.open(
    `https://www.google.com/maps?q=${props.place.geocodes.main.latitude},${props.place.geocodes.main.longitude}`,
    '_blank'
  )
}
</script>

<template>
  <div
    class="rounded-none overflow-hidden border border-gray-800 transition-all duration-300 hover:shadow-lg group bg-white"
  >
    <!-- Card Header -->
    <div class="flex justify-between items-start gap-3 p-4 border-b border-gray-200">
      <h2 class="text-xl font-medium transition-colors">
        {{ place.name }}
      </h2>
      <div class="flex items-center gap-1 flex-wrap">
        <span
          v-for="category in place.categories"
          :key="category.id"
          style="color: var(--secondary)"
          class="bg-gray-800 hover:bg-gray-700 border-0 font-semibold rounded-sm px-2 py-1 text-xs"
        >
          {{ category.short_name }}
        </span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-4">
      <!-- Distance Info -->
      <div class="space-y-1 mb-4 text-sm text-gray-700">
        <div class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="color: var(--secondary)"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          <span>{{ distanceFromOrigin() }} km from {{ origin }}</span>
        </div>
        <div class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="color: var(--secondary)"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          <span>{{ distanceFromDestination() }} km from {{ destination }}</span>
        </div>
      </div>

      <!-- Address -->
      <div v-if="place.location.address" class="flex items-start gap-2 mb-4 text-sm text-gray-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mt-1 flex-shrink-0"
          style="color: var(--secondary)"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <p>{{ place.location.address }}</p>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="p-4 border-t border-gray-200">
      <button
        @click="openInMaps"
        class="w-full transition-all duration-300 hover:translate-y-[-2px] rounded-none px-6 py-3 font-medium"
        style="background-color: var(--secondary); color: var(--secondary-foreground)"
      >
        View in Google Maps
      </button>
    </div>
  </div>
</template>

