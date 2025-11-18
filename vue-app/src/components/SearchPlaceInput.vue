<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchLocations } from '@/api/location'
import { refDebounced } from '@vueuse/core'
import type { Place } from '@/types/api'

interface Props {
  name: string
  label: string
  modelValue?: Place | null
}

interface Emits {
  (e: 'update:modelValue', value: Place | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const query = ref('')
const showDropdown = ref(false)
const debouncedQuery = refDebounced(query, 300)

const placesQuery = useQuery({
  queryKey: ['location', debouncedQuery],
  queryFn: () => fetchLocations(debouncedQuery.value),
  enabled: computed(() => debouncedQuery.value.length >= 3),
})

const places = computed(() => placesQuery.data.value || [])

const handleSelection = (place: Place) => {
  emit('update:modelValue', place)
  query.value = place.name
  showDropdown.value = false
}

const handleInput = (event: Event) => {
  query.value = (event.target as HTMLInputElement).value
  showDropdown.value = true
}

const handleBlur = () => {
  // Delay to allow click on dropdown item
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    query.value = newValue.name
  }
})
</script>

<template>
  <div class="relative w-full">
    <label
      :for="name"
      class="block text-sm font-medium mb-2"
      style="color: var(--foreground)"
    >
      {{ label }} <span class="text-red-500">*</span>
    </label>
    <input
      :id="name"
      :name="name"
      type="text"
      required
      :value="query"
      @input="handleInput"
      @focus="showDropdown = true"
      @blur="handleBlur"
      class="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
      :placeholder="`Enter ${label.toLowerCase()}`"
      autocomplete="off"
    />
    
    <!-- Dropdown -->
    <div
      v-if="showDropdown && places.length > 0"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-60 overflow-y-auto"
    >
      <button
        v-for="place in places"
        :key="place.id"
        type="button"
        @click="handleSelection(place)"
        class="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0"
      >
        <div class="font-medium">{{ place.name }}</div>
        <div class="text-sm text-gray-600">
          {{ place.address.freeformAddress }}
        </div>
      </button>
    </div>

    <!-- Loading state -->
    <div
      v-if="placesQuery.isFetching.value"
      class="absolute right-3 top-11 text-gray-400"
    >
      Loading...
    </div>

    <!-- Hidden inputs for lat/lon -->
    <input
      v-if="modelValue"
      type="hidden"
      :name="`${name}-lat`"
      :value="modelValue.position.lat"
    />
    <input
      v-if="modelValue"
      type="hidden"
      :name="`${name}-lon`"
      :value="modelValue.position.lon"
    />
  </div>
</template>

<style scoped>
input:focus {
  border-color: var(--secondary);
}
</style>

