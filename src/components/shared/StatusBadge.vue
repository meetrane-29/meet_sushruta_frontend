<template>
  <span :class="statusClasses">
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusClasses = computed(() => {
  const baseClasses = 'inline-block px-3 py-1 text-sm font-medium rounded-full capitalize transition'

  const statusMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const statusClass = statusMap[props.status.toLowerCase()] || 'bg-gray-100 text-gray-800'

  return `${baseClasses} ${statusClass}`
})
</script>
