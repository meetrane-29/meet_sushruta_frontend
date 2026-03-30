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
        <button
          @click="scrollToBooking"
          class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Book an Appointment
        </button>
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
            <td class="px-6 py-4 text-gray-900 font-medium">{{ getDoctorName(appointment) }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">
              {{ appointment.doctor?.specialization?.name || appointment.doctor?.specialization || 'General' }}
            </td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(appointment.appointment_date) }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatTime(appointment.appointment_time) }}</td>
            <td class="px-6 py-4">
              <StatusBadge :status="appointment.status" />
            </td>
            <td class="px-6 py-4 flex gap-2">
              <button
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                disabled
              >
                View Details
              </button>
              <button
                v-if="appointment.status !== 'cancelled' && appointment.status !== 'completed'"
                @click="cancelAppt(appointment.id)"
                :disabled="cancelingId === appointment.id"
                :class="['px-4 py-2 rounded-lg transition text-sm font-medium', cancelingId === appointment.id ? 'bg-gray-300 text-gray-500' : 'bg-red-100 text-red-700 hover:bg-red-200']"
              >
                {{ cancelingId === appointment.id ? '❌ Canceling...' : '❌ Cancel' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Prescriptions Section -->
    <PastPrescriptions v-if="!loading && !error" />

    <!-- Lab Reports Section -->
    <MyLabReports v-if="!loading && !error" />

    <!-- Bills Section -->
    <MyBills v-if="!loading && !error" />

    <!-- Book Appointment Section -->
    <BookAppointmentPanel ref="bookingPanel" v-if="!loading && !error" @appointment-booked="refreshData" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/authStore'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'
import BookAppointmentPanel from '@/components/BookAppointmentPanel.vue'
import MyLabReports from '@/components/MyLabReports.vue'
import PastPrescriptions from '@/components/PastPrescriptions.vue'
import MyBills from '@/components/MyBills.vue'

const api = useApi()
const authStore = useAuthStore()
const upcomingAppointments = ref([])
const prescriptions = ref([])
const loading = ref(false)
const error = ref('')
const cancelingId = ref(null)
const bookingPanel = ref(null)

const scrollToBooking = () => {
  if (bookingPanel.value) {
    bookingPanel.value.$el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const pendingTasks = computed(() => {
  return upcomingAppointments.value.filter(a => a.status === 'pending').length +
         prescriptions.value.filter(p => p.status === 'pending').length
})

const cancelAppt = async (id) => {
  if (!confirm('Are you sure you want to cancel this appointment?')) return
  cancelingId.value = id
  try {
    await api.put(`/appointments/${id}/cancel`)
    upcomingAppointments.value = upcomingAppointments.value.filter(a => a.id !== id)
  } catch (e) {
    alert('Failed to cancel appointment: ' + (e.response?.data?.message || 'Try again'))
  } finally {
    cancelingId.value = null
  }
}

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

const getDoctorName = (appointment) => {
  // Try different ways the doctor name might be stored
  if (appointment?.doctor?.user?.first_name && appointment?.doctor?.user?.last_name) {
    return [appointment.doctor.user.first_name, appointment.doctor.user.last_name].filter(Boolean).join(' ')
  }
  if (appointment?.doctor?.name) {
    return appointment.doctor.name
  }
  if (appointment?.doctor?.user?.name) {
    return appointment.doctor.user.name
  }
  return 'Doctor'
}

const refreshData = async () => {
  loading.value = true
  error.value = ''

  try {
    // Initialize with empty arrays to prevent undefined errors
    upcomingAppointments.value = []
    prescriptions.value = []

    // Fetch appointments - get FUTURE appointments only for this patient
    try {
      const authStore = useAuthStore()
      const patientId = authStore.userId
      
      if (!patientId) {
        throw new Error('Patient ID not found in auth store')
      }
      
      console.log('[PatientDashboard] Fetching appointments for patient:', patientId)
      const appointmentsRes = await api.get(`/patients/${patientId}/appointments?page=1&limit=50`)
      
      // Extract appointments from response
      const appointmentsData = appointmentsRes.data?.data?.appointments || 
                               appointmentsRes.data?.appointments || 
                               []
      upcomingAppointments.value = Array.isArray(appointmentsData) ? appointmentsData : []

      console.log('[PatientDashboard] Loaded future appointments:', upcomingAppointments.value.length)
      if (upcomingAppointments.value.length > 0) {
        console.log('[PatientDashboard] Sample appointment:', upcomingAppointments.value[0])
      }
    } catch (appointErr) {
      console.warn('[PatientDashboard] Failed to load appointments:', appointErr)
      upcomingAppointments.value = []
    }

    // Fetch prescriptions - use patient-specific endpoint
    try {
      const prescriptionsRes = await api.get(`/prescriptions/patient/${authStore.userId}`)
      const prescriptionsData = prescriptionsRes.data?.data?.prescriptions || 
                               prescriptionsRes.data?.prescriptions || 
                               prescriptionsRes.data?.data || 
                               []
      prescriptions.value = Array.isArray(prescriptionsData) ? prescriptionsData : []
      console.log('[PatientDashboard] Loaded prescriptions:', prescriptions.value.length)
    } catch (prescErr) {
      // If patient endpoint fails, log but don't fail the whole dashboard
      console.warn('[PatientDashboard] Failed to load prescriptions:', prescErr)
      prescriptions.value = []
    }
  } catch (err) {
    console.error('[PatientDashboard] Error:', err)
    console.error('[PatientDashboard] Error response:', err.response?.data)
    console.error('[PatientDashboard] Error status:', err.response?.status)

    // Provide more specific error messages
    if (err.response?.status === 401) {
      error.value = 'Your session has expired. Please login again.'
    } else if (err.response?.status === 403) {
      error.value = 'You do not have permission to view this data.'
    } else if (err.response?.status === 404) {
      error.value = 'Your patient record was not found. Please contact support.'
    } else if (err.response?.status === 500) {
      error.value = 'Server error. Please try again later.'
    } else if (err.message === 'Network Error') {
      error.value = 'Network error. Please check your connection and try again.'
    } else {
      error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load data. Please try again.'
    }
    
    // Ensure arrays are initialized even on error
    upcomingAppointments.value = []
    prescriptions.value = []
  } finally {
    loading.value = false
  }
}

// Load data on component mount
onMounted(() => {
  // Ensure auth store is initialized from storage
  authStore.initializeFromStorage()

  // Verify user is patient
  if (!authStore.isLoggedIn) {
    error.value = 'Not logged in. Please login first.'
    loading.value = false
    return
  }

  if (authStore.role !== 'patient') {
    error.value = `Unauthorized: Patient access required (Your role: ${authStore.role})`
    loading.value = false
    return
  }

  console.log('[PatientDashboard] Mounted - role:', authStore.role, '| userId:', authStore.userId)
  refreshData()
})

// Re-fetch when auth state changes
watch(() => authStore.accessToken, () => {
  if (authStore.accessToken) {
    refreshData()
  }
}, { deep: true })
</script>
