<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
        <p class="text-gray-600 mt-1">Manage prescriptions and dispensing</p>
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

    <!-- Stats -->
    <div v-if="!loading && !error" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Total Prescriptions</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ prescriptions.length }}</p>
          </div>
          <span class="text-4xl">📋</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Pending Dispense</p>
            <p class="text-3xl font-bold text-yellow-600 mt-2">
              {{ prescriptions.filter((p) => p.status === 'pending').length }}
            </p>
          </div>
          <span class="text-4xl">⏳</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Dispensed</p>
            <p class="text-3xl font-bold text-green-600 mt-2">
              {{ prescriptions.filter((p) => p.status === 'dispensed').length }}
            </p>
          </div>
          <span class="text-4xl">✅</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Cancelled</p>
            <p class="text-3xl font-bold text-red-600 mt-2">
              {{ prescriptions.filter((p) => p.status === 'cancelled').length }}
            </p>
          </div>
          <span class="text-4xl">❌</span>
        </div>
      </div>
    </div>

    <!-- Prescriptions Table -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 p-6">
        <h2 class="text-2xl font-bold text-gray-900">Prescriptions</h2>
      </div>

      <div v-if="prescriptions.length === 0" class="p-8 text-center text-gray-600">
        <p class="text-lg">No prescriptions available</p>
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Prescription ID</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Doctor</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="prescription in prescriptions" :key="prescription.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-gray-900 font-medium">{{ prescription.id }}</td>
            <td class="px-6 py-4 text-gray-900">{{ prescription.patient?.name || 'Patient' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ prescription.doctor?.name || 'Unknown' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(prescription.createdAt) }}</td>
            <td class="px-6 py-4">
              <StatusBadge :status="prescription.status" />
            </td>
            <td class="px-6 py-4">
              <button
                v-if="prescription.status === 'pending'"
                @click="dispensePrescription(prescription.id)"
                :disabled="isDispensingId === prescription.id"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isDispensingId === prescription.id ? 'Dispensing...' : 'Dispense' }}
              </button>
              <span v-else class="text-gray-500 text-sm">--</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const api = useApi()
const prescriptions = ref([])
const isDispensingId = ref(null)
const loading = ref(false)
const error = ref('')

const formatDate = (dateString) => {
  if (!dateString) return '--'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const prescriptionsRes = await api.get('/prescriptions')
    prescriptions.value = prescriptionsRes.data.data || prescriptionsRes.data.prescriptions || []
  } catch (err) {
    console.error('Failed to load prescriptions:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

const dispensePrescription = async (prescriptionId) => {
  isDispensingId.value = prescriptionId
  try {
    await api.post('/pharmacy/dispense', { prescription_id: prescriptionId })
    loadData()
  } catch (err) {
    console.error('Failed to dispense prescription:', err)
    error.value = 'Failed to dispense prescription. Please try again.'
  } finally {
    isDispensingId.value = null
  }
}

const refreshData = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
