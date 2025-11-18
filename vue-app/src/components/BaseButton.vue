<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  text: string
  isDisabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  isDisabled: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    class="w-full transition-all duration-300 hover:translate-y-[-2px] rounded-none text-md px-6 py-3 font-medium"
    style="background-color: var(--secondary); color: var(--secondary-foreground)"
  >
    {{ text }}
  </button>
</template>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

