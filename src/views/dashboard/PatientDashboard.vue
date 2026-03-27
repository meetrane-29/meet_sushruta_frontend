<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">My Health Dashboard</h1>
        <p class="text-gray-600 mt-1">View your appointments and medical information</p>
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Upcoming Appointments -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Upcoming Appointments</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ upcomingAppointments.length }}</p>
            </div>
            <span class="text-4xl">📅</span>
          </div>
        </div>

        <!-- Your Prescriptions -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Your Prescriptions</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ prescriptions.length }}</p>
            </div>
            <span class="text-4xl">💊</span>
          </div>
        </div>

        <!-- Pending Tasks -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Pending Tasks</p>
              <p class="text-3xl font-bold text-yellow-600 mt-2">{{ pendingTasks }}</p>
            </div>
            <span class="text-4xl">⏳</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Appointments Section -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 p-6">
        <h2 class="text-2xl font-bold text-gray-900">Your Appointments</h2>
      </div>

      <div v-if="upcomingAppointments.length === 0" class="p-8 text-center text-gray-600">
        <p class="text-lg">No upcoming appointments</p>
        <router-link
          to="/"
          class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Book an Appointment
        </router-link>
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Doctor</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Specialization</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Time</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="appointment in upcomingAppointments" :key="appointment.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-gray-900 font-medium">{{ appointment.doctor?.name || 'Doctor' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ appointment.doctor?.specialization || '--' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(appointment.appointmentTime) }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatTime(appointment.appointmentTime) }}</td>
            <td class="px-6 py-4">
              <StatusBadge :status="appointment.status" />
            </td>
            <td class="px-6 py-4">
              <button
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                disabled
              >
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Prescriptions Section -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 p-6">
        <h2 class="text-2xl font-bold text-gray-900">Your Prescriptions</h2>
      </div>

      <div v-if="prescriptions.length === 0" class="p-8 text-center text-gray-600">
        <p class="text-lg">No prescriptions yet</p>
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Doctor</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="prescription in prescriptions" :key="prescription.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-gray-900 font-medium">{{ prescription.doctor?.name || 'Doctor' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(prescription.createdAt) }}</td>
            <td class="px-6 py-4">
              <StatusBadge :status="prescription.status" />
            </td>
            <td class="px-6 py-4">
              <button
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                disabled
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/authStore'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const api = useApi()
const authStore = useAuthStore()
const upcomingAppointments = ref([])
const prescriptions = ref([])
const loading = ref(false)
const error = ref('')

const pendingTasks = computed(() => {
  return upcomingAppointments.value.filter(a => a.status === 'pending').length +
         prescriptions.value.filter(p => p.status === 'pending').length
})

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

const refreshData = async () => {
  loading.value = true
  error.value = ''

  try {
    // Fetch appointments
    const appointmentsRes = await api.get('/appointments')
    upcomingAppointments.value = appointmentsRes.data.data || []

    // Fetch prescriptions
    const prescriptionsRes = await api.get('/prescriptions')
    prescriptions.value = prescriptionsRes.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load data. Please try again.'
    console.error('Patient dashboard error:', err)
  } finally {
    loading.value = false
  }
}

// Load data on component mount
onMounted(() => {
  // Verify user is patient
  if (authStore.role !== 'patient') {
    error.value = 'Unauthorized: Patient access required'
    loading.value = false
    return
  }

  refreshData()
})
</script>
