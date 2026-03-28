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
      <!-- Today's Appointments -->
      <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">📅 Today's Appointments</h2>
        
        <div v-if="appointments.length === 0" class="text-center py-8 text-gray-500">
          <p class="text-lg">No appointments scheduled for today</p>
        </div>

        <div v-else class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="appointment in appointments"
            :key="appointment.id"
            class="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-all"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-bold text-lg text-gray-800">
                  {{ appointment.patient?.user?.name || 'Unknown Patient' }}
                </h3>
                <p class="text-sm text-gray-600">🕐 {{ appointment.appointment_time }}</p>
                <p class="text-sm text-gray-600 mt-1">📝 {{ appointment.reason || 'No reason provided' }}</p>
              </div>
              <div class="ml-4">
                <StatusBadge :status="appointment.status" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="space-y-4">
        <!-- Appointments Count -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
          <p class="text-sm font-semibold opacity-90">Appointments Today</p>
          <p class="text-4xl font-bold mt-2">{{ appointments.length }}</p>
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
import { ref, onMounted } from 'vue'
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
  setup(props) {
    const appointments = ref([])
    const loading = ref(false)
    const error = ref(null)
    const walkInCount = ref(0)
    const operationCount = ref(0)
    const { get } = useApi()

    const fetchScheduleData = async () => {
      try {
        loading.value = true
        error.value = null

        // Fetch today's appointments
        const appointmentsRes = await get(`/appointments?doctor_id=${props.doctorId}`)
        appointments.value = appointmentsRes || []

        // Calculate stats
        walkInCount.value = 0 // This would come from API if available
        operationCount.value = 0 // This would come from API if available
      } catch (err) {
        console.error('Failed to fetch schedule:', err)
        error.value = 'Failed to load schedule. Please try again.'
        appointments.value = []
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      if (props.doctorId) {
        fetchScheduleData()
      }
    })

    return {
      appointments,
      loading,
      error,
      walkInCount,
      operationCount,
      fetchScheduleData
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
