<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SearchPlaceInput from '@/components/SearchPlaceInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import type { Place } from '@/types/api'

const router = useRouter()
const origin = ref<Place | null>(null)
const destination = ref<Place | null>(null)

const handleSubmit = (event: Event) => {
  event.preventDefault()
  
  if (!origin.value || !destination.value) {
    return
  }

  router.push({
    path: '/makan-spots',
    query: {
      origin: origin.value.name,
      'origin-lat': origin.value.position.lat,
      'origin-lon': origin.value.position.lon,
      destination: destination.value.name,
      'destination-lat': destination.value.position.lat,
      'destination-lon': destination.value.position.lon,
    },
  })
}
</script>

<template>
  <div class="w-full max-w-4xl">
    <!-- Logo and Title Section -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold flex items-center justify-center gap-2 mb-2">
        Makan Route
        <span role="img" aria-label="bowl">🍜</span>
      </h1>
      <p>Discover the best local makan spots along your travel route</p>
    </div>

    <!-- Search Form -->
    <div
      class="w-full max-w-md mx-auto p-6 shadow-lg rounded-none overflow-hidden border border-gray-800 transition-all duration-300 hover:shadow-lg group bg-white"
    >
      <form @submit="handleSubmit" class="space-y-4">
        <div class="flex w-full flex-col gap-4">
          <SearchPlaceInput
            name="origin"
            label="Starting Point"
            v-model="origin"
          />
          <SearchPlaceInput
            name="destination"
            label="Destination"
            v-model="destination"
          />
        </div>

        <BaseButton type="submit" text="Find makan spots!" />
      </form>
    </div>

    <!-- Footer -->
    <footer class="mt-8 text-center text-sm">
      Built with <span class="text-red-500">❤</span> for local food explorers
    </footer>
  </div>
</template>

