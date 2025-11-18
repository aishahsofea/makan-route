import { ref, watch } from 'vue'

export const useDebouncedSearch = (query: string, delay = 300) => {
  const debouncedValue = ref(query)

  watch(
    () => query,
    (newValue) => {
      const handler = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    },
    { immediate: true }
  )

  return debouncedValue
}

