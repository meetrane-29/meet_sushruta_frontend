<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <button
              @click="$router.back()"
              class="text-gray-600 hover:text-gray-900 transition"
            >
              ← Back
            </button>
            <h1 class="text-3xl font-bold text-gray-900">Today's Appointments</h1>
          </div>
          <p class="text-gray-600">{{ currentDate }} - Direct booking view</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      <p class="text-gray-600 mt-4">Loading appointments...</p>
    </div>

    <!-- Error State -->
    <div
      v-if="error && !isLoading"
      class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800"
    >
      <p class="font-medium">Error loading appointments</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button
        @click="fetchAppointments"
        class="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
      >
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && !error && groupedAppointments.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">📭</div>
      <p class="text-gray-600 text-lg font-medium">No appointments scheduled for today</p>
      <p class="text-gray-500 text-sm mt-2">Doctors are resting today!</p>
    </div>

    <!-- Appointments Grouped by Doctor -->
    <div v-if="!isLoading && !error && groupedAppointments.length > 0" class="space-y-6">
      <div
        v-for="doctorGroup in groupedAppointments"
        :key="doctorGroup.doctor_id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <!-- Doctor Header -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-3">
                <div class="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                  <span class="text-white font-bold">👨‍⚕️</span>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-900">{{ doctorGroup.doctor_name }}</h2>
                  <p class="text-sm text-gray-600">
                    {{ doctorGroup.specialization }}
                    <span v-if="doctorGroup.department" class="ml-2 text-gray-500">
                      • {{ doctorGroup.department }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-blue-600">{{ doctorGroup.appointments.length }}</div>
              <p class="text-xs text-gray-600">appointments</p>
            </div>
          </div>
        </div>

        <!-- Appointments Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Time
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Patient Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Phone
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Reason
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="appointment in doctorGroup.appointments"
                :key="appointment.id"
                class="hover:bg-gray-50 transition"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900">{{ appointment.appointment_time }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900 font-medium">{{ appointment.patient_name }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-600">{{ formatPhone(appointment.patient_phone) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600">{{ appointment.reason || 'Not specified' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <StatusBadge :status="appointment.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/useApi'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const api = useApi()
const isLoading = ref(true)
const error = ref(null)
const appointments = ref([])

const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Group appointments by doctor
const groupedAppointments = computed(() => {
  const grouped = {}

  appointments.value.forEach((apt) => {
    const doctorId = apt.doctor_id
    if (!grouped[doctorId]) {
      grouped[doctorId] = {
        doctor_id: doctorId,
        doctor_name: apt.doctor_name,
        specialization: apt.doctor_specialization,
        department: apt.doctor_department,
        appointments: []
      }
    }
    grouped[doctorId].appointments.push(apt)
  })

  // Convert to array and sort by doctor name
  return Object.values(grouped).sort((a, b) =>
    a.doctor_name.localeCompare(b.doctor_name)
  )
})

// Format phone number
const formatPhone = (phone) => {
  if (!phone) return 'N/A'
  return phone
}

// Fetch appointments
const fetchAppointments = async () => {
  isLoading.value = true
  error.value = null
  appointments.value = []

  try {
    const response = await api.get('/admin/appointments/today')
    appointments.value = response.data.data.appointments || []
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      'Failed to load appointments. Please try again.'
    console.error('Fetch appointments error:', err)
  } finally {
    isLoading.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchAppointments()
})
</script>
