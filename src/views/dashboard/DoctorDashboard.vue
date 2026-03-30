<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p class="text-gray-600 mt-1">Manage your appointments, prescriptions, and patient care</p>
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
        <!-- Pending Appointments -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-blue-400 transition" @click="selectedStatus = 'pending'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Pending</p>
              <p class="text-3xl font-bold text-yellow-600 mt-2">{{ getCountByStatus('pending') }}</p>
            </div>
            <span class="text-4xl">⏳</span>
          </div>
        </div>

        <!-- Confirmed Appointments -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-blue-400 transition" @click="selectedStatus = 'confirmed'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Confirmed</p>
              <p class="text-3xl font-bold text-blue-600 mt-2">{{ getCountByStatus('confirmed') }}</p>
            </div>
            <span class="text-4xl">✓</span>
          </div>
        </div>

        <!-- In Progress Appointments -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-blue-400 transition" @click="selectedStatus = 'in_progress'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">In Progress</p>
              <p class="text-3xl font-bold text-purple-600 mt-2">{{ getCountByStatus('in_progress') }}</p>
            </div>
            <span class="text-4xl">🔄</span>
          </div>
        </div>

        <!-- Completed Appointments -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-blue-400 transition" @click="selectedStatus = 'completed'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Completed</p>
              <p class="text-3xl font-bold text-green-600 mt-2">{{ getCountByStatus('completed') }}</p>
            </div>
            <span class="text-4xl">✅</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Filter Section -->
    <template v-if="!loading && !error">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search appointments by patient name..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div class="flex gap-2">
            <select
              v-model="selectedStatus"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
    </template>

    <!-- Appointments Table -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 p-6">
        <h2 class="text-2xl font-bold text-gray-900">
          Appointments 
          <span class="text-sm font-normal text-gray-600 ml-2">({{ filteredAppointments.length }} showing)</span>
        </h2>
      </div>

      <div v-if="filteredAppointments.length === 0" class="p-8 text-center text-gray-600">
        <p class="text-lg">
          {{ selectedStatus === 'all' ? 'No appointments found' : `No ${selectedStatus} appointments` }}
        </p>
        <p class="text-sm mt-1" v-if="searchQuery">Try adjusting your search</p>
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
          <tr v-for="appointment in filteredAppointments" :key="appointment.id" class="hover:bg-gray-50 transition">
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
                Consult
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Prescriptions Summary Section -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Recent Prescriptions</h2>
        <span class="text-sm text-gray-600">{{ prescriptions.length }} total</span>
      </div>

      <div v-if="prescriptions.length === 0" class="p-8 text-center text-gray-600">
        <p class="text-lg">No prescriptions created yet</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="prescription in prescriptions.slice(0, 5)" :key="prescription.id" class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ getPrescriptionPatientName(prescription) }}</p>
              <p class="text-sm text-gray-600 mt-1">
                {{ prescription.items?.length || 0 }} medicine(s) • 
                <span v-if="prescription.created_at">{{ formatDate(prescription.created_at) }}</span>
              </p>
            </div>
            <StatusBadge :status="prescription.status" />
          </div>
        </div>
      </div>
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
const appointments = ref([])
const prescriptions = ref([])
const loading = ref(false)
const error = ref('')
const selectedStatus = ref('all')
const searchQuery = ref('')

const formatDate = (dateString) => {
  if (!dateString) return '--'
  try {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

const formatTime = (timeString) => {
  if (!timeString) return '--'
  try {
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

const getPrescriptionPatientName = (prescription) => {
  if (!prescription?.patient?.user) return 'Patient'
  const { first_name, last_name } = prescription.patient?.user || {}
  return [first_name, last_name].filter(Boolean).join(' ') || 'Patient'
}

const getCountByStatus = (status) => {
  return appointments.value.filter(apt => apt.status === status).length
}

const filteredAppointments = computed(() => {
  return appointments.value.filter(apt => {
    const matchesStatus = selectedStatus.value === 'all' || apt.status === selectedStatus.value
    const matchesSearch = searchQuery.value === '' || 
      getPatientName(apt).toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    // Fetch appointments - get doctor's own appointments from last 7 days to next 7 days
    const appointmentsRes = await api.get('/appointments/my/schedule')
    const appointmentsData = appointmentsRes.data?.data?.appointments || 
                             appointmentsRes.data?.appointments || 
                             []
    appointments.value = Array.isArray(appointmentsData) ? appointmentsData : []

    console.log('[DoctorDashboard] Loaded appointments:', appointments.value.length)
    console.log('[DoctorDashboard] Full response:', appointmentsRes.data)

    // Fetch prescriptions
    const prescriptionsRes = await api.get('/prescriptions')
    const prescriptionsData = prescriptionsRes.data?.prescriptions || prescriptionsRes.data?.data || []
    prescriptions.value = Array.isArray(prescriptionsData) ? prescriptionsData : []

    console.log('[DoctorDashboard] Loaded prescriptions:', prescriptions.value.length)
  } catch (err) {
    console.error('[DoctorDashboard] Error:', err)
    console.error('[DoctorDashboard] Error response:', err.response?.data)

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
