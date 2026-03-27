<template>
  <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span class="text-2xl">⚠️</span>
      <div>
        <p class="font-semibold">Error</p>
        <p class="text-sm mt-1">{{ message }}</p>
      </div>
    </div>
    <button
      v-if="onRetry"
      @click="onRetry"
      class="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium whitespace-nowrap"
    >
      Retry
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'An error occurred. Please try again.'
  },
  onRetry: {
    type: Function,
    default: null
  }
})
</script>
