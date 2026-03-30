<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="border-b border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900">💊 Past Prescriptions</h2>
    </div>

    <div v-if="loading" class="p-8 text-center">Loading...</div>
    <div v-else-if="error" class="p-8 text-center text-red-600">{{ error }}</div>
    <div v-else-if="rxs.length === 0" class="p-8 text-center text-gray-600">
      <p>No prescriptions yet</p>
    </div>
    <div v-else class="divide-y">
      <div v-for="rx in rxs" :key="rx.id" class="p-6 hover:bg-gray-50">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Dr. {{ rx.doctor?.user?.first_name }} {{ rx.doctor?.user?.last_name }}</h3>
            <p class="text-sm text-gray-600 mt-1">📅 {{ formatDate(rx.createdAt) }}</p>
            <p v-if="rx.diagnosis" class="text-sm text-gray-700 mt-2"><strong>Diagnosis:</strong> {{ rx.diagnosis }}</p>
            <div v-if="rx.items && rx.items.length > 0" class="mt-3 bg-gray-50 p-3 rounded text-sm">
              <p class="font-semibold mb-2">Medicines:</p>
              <div v-for="item in rx.items" :key="item.id" class="text-gray-700 mb-1">
                {{ item.medicine?.name }} - {{ item.dosage }} {{ item.frequency }} x {{ item.quantity }}
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="downloadRx(rx)" class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              📥 Download
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
const rxs = ref([])
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
    const res = await api.get(`/prescriptions/patient/${authStore.userId}`)
    rxs.value = res.data?.prescriptions || res.data || []
  } catch (e) {
    error.value = 'Failed to load prescriptions'
  } finally {
    loading.value = false
  }
})

const downloadRx = (rx) => {
  const meds = rx.items ? rx.items.map(m => `- ${m.medicine?.name} ${m.dosage} ${m.frequency}`).join('\n') : 'No medicines'
  const content = `PRESCRIPTION\nDoctor: ${rx.doctor?.user?.first_name} ${rx.doctor?.user?.last_name}\nDate: ${formatDate(rx.createdAt)}\n\nMedicines:\n${meds}\n\nNotes: ${rx.notes || 'None'}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prescription_${rx.id}.txt`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>