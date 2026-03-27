<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Patients Management</h1>
        <p class="text-gray-600 mt-1">View and manage all patients</p>
      </div>
      <button
        @click="refreshData"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <ErrorMessage v-if="error && !loading" :message="error" @retry="refreshData" />

    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-600">
      <p>Patients list feature coming soon</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const api = useApi()
const loading = ref(false)
const error = ref('')

const refreshData = async () => {
  loading.value = true
  error.value = ''
  try {
    // Patients list implementation
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (err) {
    error.value = 'Failed to load patients.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>
