<template>
  <div class="space-y-6">
    <!-- Refresh Button -->
    <div class="flex justify-end gap-2">
      <button
        @click="fetchScheduleData"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
      >
        🔄 Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <LoadingSpinner />
      <p class="text-gray-600 mt-2">Loading schedule...</p>
    </div>

    <!-- Error State -->
    <ErrorMessage v-if="error" :message="error" @retry="fetchScheduleData" />

    <!-- Schedule Content -->
    <div v-if="!loading && !error" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Appointments List -->
      <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">📅 Your Schedule (Next 14 Days)</h2>
        
        <div v-if="groupedAppointments.length === 0" class="text-center py-8 text-gray-500">
          <p class="text-lg">No appointments scheduled</p>
        </div>

        <div v-else class="space-y-4 max-h-auto overflow-y-auto">
          <!-- Date Group -->
          <div v-for="dateGroup in groupedAppointments" :key="dateGroup.date" class="border-l-4 border-blue-400 pl-4">
            <!-- Date Header -->
            <h3 class="font-bold text-lg text-gray-800 mb-3">
              {{ formatDateHeader(dateGroup.date) }}
              <span class="text-sm font-normal text-gray-600 ml-2">({{ dateGroup.appointments.length }} appointment{{ dateGroup.appointments.length !== 1 ? 's' : '' }})</span>
            </h3>

            <!-- Appointments for this date -->
            <div class="space-y-2 mb-4">
              <div
                v-for="appointment in dateGroup.appointments"
                :key="appointment.id"
                @click="openPatient(appointment)"
                class="bg-gradient-to-r from-blue-50 to-transparent border border-blue-200 rounded-lg p-4 hover:shadow-md hover:border-blue-400 cursor-pointer transition-all"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <p class="font-bold text-lg text-gray-800">
                        {{ appointment.patient?.user?.first_name }} {{ appointment.patient?.user?.last_name }}
                      </p>
                      <StatusBadge :status="appointment.status" />
                    </div>
                    <p class="text-sm text-gray-600 mt-1">🕐 {{ appointment.appointment_time }}</p>
                    <p class="text-sm text-gray-600">📝 {{ appointment.reason || 'No reason provided' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="space-y-4">
        <!-- Total Appointments -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
          <p class="text-sm font-semibold opacity-90">Total Appointments (14 days)</p>
          <p class="text-4xl font-bold mt-2">{{ totalAppointments }}</p>
        </div>

        <!-- Today's Appointments -->
        <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow">
          <p class="text-sm font-semibold opacity-90">Today</p>
          <p class="text-4xl font-bold mt-2">{{ todayAppointments }}</p>
        </div>

        <!-- Walk-in Patients -->
        <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
          <p class="text-sm font-semibold opacity-90">Walk-in Patients</p>
          <p class="text-4xl font-bold mt-2">{{ walkInCount }}</p>
        </div>

        <!-- OT Schedule -->
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
          <p class="text-sm font-semibold opacity-90">Scheduled Operations</p>
          <p class="text-4xl font-bold mt-2">{{ operationCount }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import LoadingSpinner from '../../../components/shared/LoadingSpinner.vue'
import ErrorMessage from '../../../components/shared/ErrorMessage.vue'
import StatusBadge from '../../../components/shared/StatusBadge.vue'
import { useApi } from '../../../composables/useApi.js'

export default {
  name: 'DailyScheduleTab',
  components: {
    LoadingSpinner,
    ErrorMessage,
    StatusBadge
  },
  props: {
    doctorId: {
      type: String,
      required: true
    }
  },
  emits: ['select-patient'],
  setup(props, { emit }) {
    const allAppointments = ref([])
    const loading = ref(false)
    const error = ref(null)
    const walkInCount = ref(0)
    const operationCount = ref(0)
    const { get } = useApi()

    const formatDateHeader = (dateString) => {
      if (!dateString) return '--'
      try {
        const date = new Date(dateString + 'T00:00:00')
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Check if it's today
        if (date.toDateString() === today.toDateString()) {
          return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        }

        // Check if it's tomorrow
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        if (date.toDateString() === tomorrow.toDateString()) {
          return `Tomorrow, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        }

        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      } catch {
        return dateString
      }
    }

    const groupedAppointments = computed(() => {
      const grouped = {}

      // Group appointments by date
      allAppointments.value.forEach(apt => {
        const date = apt.appointment_date
        if (!grouped[date]) {
          grouped[date] = {
            date,
            appointments: []
          }
        }
        grouped[date].appointments.push(apt)
      })

      // Sort by date and sort appointments within each date by time
      return Object.values(grouped)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(group => ({
          ...group,
          appointments: group.appointments.sort((a, b) => {
            const timeA = a.appointment_time || '00:00'
            const timeB = b.appointment_time || '00:00'
            return timeA.localeCompare(timeB)
          })
        }))
    })

    const todayAppointments = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      return allAppointments.value.filter(apt => apt.appointment_date === today).length
    })

    const totalAppointments = computed(() => allAppointments.value.length)

    const fetchScheduleData = async () => {
      try {
        loading.value = true
        error.value = null

        // Fetch doctor's appointments from last 7 days to next 7 days
        console.log('[DailyScheduleTab] Calling /appointments/my/schedule')
        const appointmentsRes = await get('/appointments/my/schedule')
        
        console.log('[DailyScheduleTab] Raw response:', appointmentsRes)
        console.log('[DailyScheduleTab] Response data:', appointmentsRes?.data)
        
        // Handle different response formats - axios response.data contains the server response
        let fetchedAppointments = []
        
        // Try nested data.data.appointments (from utils.OK wrapper)
        if (appointmentsRes?.data?.data?.appointments) {
          console.log('[DailyScheduleTab] Found appointments in data.data.appointments')
          fetchedAppointments = appointmentsRes.data.data.appointments
        }
        // Try data.appointments (if not wrapped)
        else if (appointmentsRes?.data?.appointments) {
          console.log('[DailyScheduleTab] Found appointments in data.appointments')
          fetchedAppointments = appointmentsRes.data.appointments
        }
        // Try root level (legacy/fallback)
        else if (Array.isArray(appointmentsRes?.data)) {
          console.log('[DailyScheduleTab] Found appointments as root array')
          fetchedAppointments = appointmentsRes.data
        }

        allAppointments.value = Array.isArray(fetchedAppointments) ? fetchedAppointments : []

        console.log('[DailyScheduleTab] Parsed appointments:', allAppointments.value.length)
        if (allAppointments.value.length > 0) {
          console.log('[DailyScheduleTab] Sample appointment:', allAppointments.value[0])
        }

        // Calculate stats
        walkInCount.value = 0 // This would come from API if available
        operationCount.value = 0 // This would come from API if available
      } catch (err) {
        console.error('[DailyScheduleTab] Failed to fetch schedule:', err)
        console.error('[DailyScheduleTab] Error details:', err.response?.data)
        error.value = 'Failed to load schedule. Please try again.'
        allAppointments.value = []
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      // Don't need doctorId - the API endpoint /appointments/my/schedule
      // uses the JWT token to identify the doctor
      fetchScheduleData()
    })

    const openPatient = (appointment) => {
      emit('select-patient', appointment)
    }

    return {
      groupedAppointments,
      todayAppointments,
      totalAppointments,
      loading,
      error,
      walkInCount,
      operationCount,
      formatDateHeader,
      fetchScheduleData,
      openPatient
    }
  }
}
</script>

<style scoped>
/* Smooth scrolling for appointments list */
.overflow-y-auto {
  scroll-behavior: smooth;
}

/* Hover effects */
.cursor-pointer {
  transition: all 0.2s ease;
}
</style>
