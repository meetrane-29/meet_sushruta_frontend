<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="border-b border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900">📋 My Lab Reports</h2>
    </div>

    <div v-if="loading" class="p-8 text-center">Loading...</div>
    <div v-else-if="error" class="p-8 text-center text-red-600">{{ error }}</div>
    <div v-else-if="reports.length === 0" class="p-8 text-center text-gray-600">
      <p>No lab reports available</p>
    </div>
    <div v-else class="divide-y">
      <div v-for="r in reports" :key="r.id" class="p-6 hover:bg-gray-50">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold text-gray-900">{{ r.test_name || 'Lab Test' }}</h3>
            <p class="text-sm text-gray-600 mt-1">📅 {{ formatDate(r.report_date) }}</p>
            <span :class="['inline-block mt-2 px-2 py-1 text-xs font-semibold rounded', r.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">{{ r.status }}</span>
          </div>
          <div class="flex gap-2">
            <button @click="downloadReport(r)" :disabled="r.status !== 'completed'" class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
              📥 Download
            </button>
            <button @click="viewReport(r)" class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/authStore'

const api = useApi()
const authStore = useAuthStore()
const reports = ref([])
const loading = ref(false)
const error = ref('')

const formatDate = (d) => {
  if (!d) return '--'
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return d }
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await api.get(`/lab/patients/${authStore.userId}/orders`)
    reports.value = res.data?.lab_orders || res.data || []
  } catch (e) {
    error.value = 'Failed to load lab reports'
  } finally {
    loading.value = false
  }
})

const viewReport = (r) => {
  alert(`Report: ${r.test_name}\nDate: ${formatDate(r.report_date)}\nStatus: ${r.status}`)
}

const downloadReport = (r) => {
  const content = `Lab Report\n${r.test_name}\nDate: ${formatDate(r.report_date)}\nStatus: ${r.status}\n${r.test_results || 'Results pending'}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report_${r.id}.txt`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>