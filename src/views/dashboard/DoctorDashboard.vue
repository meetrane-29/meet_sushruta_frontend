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
            <td class="px-6 py-4 text-gray-900 font-medium">{{ appointment.patient?.name || 'Patient' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(appointment.appointmentTime) }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatTime(appointment.appointmentTime) }}</td>
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

const formatDate = (timeString) => {
  if (!timeString) return '--'
  try {
    const date = new Date(timeString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return timeString
  }
}

const formatTime = (timeString) => {
  if (!timeString) return '--'
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch {
    return timeString
  }
}

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const doctorId = authStore.userId || authStore.user?.id

    if (!doctorId) {
      error.value = 'Doctor information not available'
      return
    }

    // Fetch appointments
    try {
      const appointmentsResponse = await api.get('/appointments', {
        params: {
          doctor_id: doctorId
        }
      })
      appointments.value = appointmentsResponse.data.data || appointmentsResponse.data.appointments || []
    } catch (err) {
      console.error('Failed to load appointments:', err)
      appointments.value = []
    }

    // Fetch prescriptions
    try {
      const prescriptionsResponse = await api.get('/prescriptions', {
        params: {
          doctor_id: doctorId
        }
      })
      prescriptions.value = prescriptionsResponse.data.data || prescriptionsResponse.data.prescriptions || []
    } catch (err) {
      console.error('Failed to load prescriptions:', err)
      prescriptions.value = []
    }
  } catch (err) {
    console.error('Failed to load doctor data:', err)
    error.value = 'Failed to load data. Please try again.'
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
