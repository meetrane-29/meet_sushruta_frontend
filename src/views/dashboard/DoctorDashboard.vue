<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p class="text-gray-600 mt-1">Manage appointments and prescriptions</p>
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

    <!-- Stats Section -->
    <template v-if="!loading && !error">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Today's Appointments -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Today's Appointments</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ appointments.length }}</p>
            </div>
            <span class="text-4xl">📅</span>
          </div>
        </div>

        <!-- Total Prescriptions -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Prescriptions</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ prescriptions.length }}</p>
            </div>
            <span class="text-4xl">💊</span>
          </div>
        </div>

        <!-- Pending Prescriptions -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Pending</p>
              <p class="text-3xl font-bold text-yellow-600 mt-2">
                {{ prescriptions.filter((p) => p.status === 'pending').length }}
              </p>
            </div>
            <span class="text-4xl">⏳</span>
          </div>
        </div>

        <!-- Completed Prescriptions -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Completed</p>
              <p class="text-3xl font-bold text-green-600 mt-2">
                {{ prescriptions.filter((p) => p.status === 'completed').length }}
              </p>
            </div>
            <span class="text-4xl">✅</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Appointments Table -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 p-6">
        <h2 class="text-2xl font-bold text-gray-900">Appointments Queue</h2>
      </div>

      <div v-if="appointments.length === 0" class="p-8 text-center text-gray-600">
        <p class="text-lg">No appointments scheduled</p>
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient Name</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Time</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reason</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="appointment in appointments" :key="appointment.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-gray-900 font-medium">{{ getPatientName(appointment) }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(appointment.appointment_date) }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatTime(appointment.appointment_time) }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ appointment.reason || 'No reason' }}</td>
            <td class="px-6 py-4">
              <StatusBadge :status="appointment.status" />
            </td>
            <td class="px-6 py-4">
              <router-link
                :to="`/dashboard/doctor/consult/${appointment.id}`"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Start Consultation
              </router-link>
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
import { useAuthStore } from '@/stores/authStore'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const api = useApi()
const authStore = useAuthStore()
const appointments = ref([])
const prescriptions = ref([])
const loading = ref(false)
const error = ref('')

const formatDate = (dateString) => {
  if (!dateString) return '--'
  try {
    // Backend sends date as YYYY-MM-DD format
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

const formatTime = (timeString) => {
  if (!timeString) return '--'
  try {
    // Backend sends time as HH:MM format
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch {
    return timeString
  }
}

const getPatientName = (appointment) => {
  if (!appointment?.patient?.user) return 'Patient'
  const { first_name, last_name } = appointment.patient.user
  return [first_name, last_name].filter(Boolean).join(' ')
}

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    // Fetch appointments - backend returns { appointments, total, page, limit }
    const appointmentsRes = await api.get('/appointments')
    const appointmentsData = appointmentsRes.data?.appointments || []
    appointments.value = Array.isArray(appointmentsData) ? appointmentsData : []

    console.log('[DoctorDashboard] Loaded appointments:', appointments.value.length)

    // Fetch prescriptions - backend returns { prescriptions, total, page, limit } or { data, total, page, limit }
    const prescriptionsRes = await api.get('/prescriptions')
    const prescriptionsData = prescriptionsRes.data?.prescriptions || prescriptionsRes.data?.data || []
    prescriptions.value = Array.isArray(prescriptionsData) ? prescriptionsData : []

    console.log('[DoctorDashboard] Loaded prescriptions:', prescriptions.value.length)
  } catch (err) {
    console.error('[DoctorDashboard] Error:', err)
    console.error('[DoctorDashboard] Error response:', err.response?.data)

    // Provide more specific error messages
    if (err.response?.status === 401) {
      error.value = 'Your session has expired. Please login again.'
    } else if (err.response?.status === 403) {
      error.value = 'You do not have permission to view this data.'
    } else if (err.response?.status === 404) {
      error.value = 'Your doctor record was not found. Please contact support.'
    } else if (err.response?.status === 500) {
      error.value = 'Server error. Please try again later.'
    } else if (err.message === 'Network Error') {
      error.value = 'Network error. Please check your connection and try again.'
    } else {
      error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load data. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
