<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in cols" :key="i" class="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cols: {
    type: Number,
    default: 4
  }
})
</script>
