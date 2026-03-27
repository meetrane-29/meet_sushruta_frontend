<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Nurse Dashboard</h1>
        <p class="text-gray-600 mt-1">Manage patient vitals and appointments</p>
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
      <p class="text-gray-600 text-sm font-medium">Total Appointments</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ appointments.length }}</p>
          </div>
          <span class="text-4xl">📅</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">In Progress</p>
            <p class="text-3xl font-bold text-blue-600 mt-2">
              {{ appointments.filter((a) => a.status === 'in_progress').length }}
            </p>
          </div>
          <span class="text-4xl">⏳</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Pending</p>
            <p class="text-3xl font-bold text-yellow-600 mt-2">
              {{ appointments.filter((a) => a.status === 'pending').length }}
            </p>
          </div>
          <span class="text-4xl">⏳</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Completed</p>
            <p class="text-3xl font-bold text-green-600 mt-2">
              {{ appointments.filter((a) => a.status === 'completed').length }}
            </p>
          </div>
          <span class="text-4xl">✅</span>
        </div>
      </div>
    </div>

    <!-- Appointments Table -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 p-6">
        <h2 class="text-2xl font-bold text-gray-900">Appointments</h2>
      </div>

      <div v-if="appointments.length === 0" class="p-8 text-center text-gray-600">
        <p class="text-lg">No active appointments</p>
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient Name</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Doctor</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="appointment in appointments" :key="appointment.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-gray-900 font-medium">{{ appointment.patient?.name || 'Patient' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ appointment.doctor?.name || 'Unknown' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(appointment.appointmentTime) }}</td>
            <td class="px-6 py-4">
              <StatusBadge :status="appointment.status" />
            </td>
            <td class="px-6 py-4">
              <button
                @click="openVitalsForm(appointment)"
                :disabled="isRecordingId === appointment.id"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isRecordingId === appointment.id ? 'Recording...' : 'Record Vitals' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vitals Form Modal -->
    <div v-if="showVitalsForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6 max-h-screen overflow-y-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Record Vitals - {{ selectedAppointment.patient?.name }}</h2>

        <form @submit.prevent="submitVitals" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Temperature (°F)</label>
            <input
              v-model.number="vitalsForm.temperature"
              type="number"
              step="0.1"
              placeholder="98.6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Blood Pressure (e.g., 120/80)</label>
            <input
              v-model="vitalsForm.bloodPressure"
              type="text"
              placeholder="120/80"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Heart Rate (bpm)</label>
            <input
              v-model.number="vitalsForm.heartRate"
              type="number"
              placeholder="72"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">SpO2 (%)</label>
            <input
              v-model.number="vitalsForm.spO2"
              type="number"
              min="0"
              max="100"
              placeholder="98"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Notes</label>
            <textarea
              v-model="vitalsForm.notes"
              placeholder="Any additional notes..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showVitalsForm = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Vitals' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const api = useApi()
const appointments = ref([])
const showVitalsForm = ref(false)
const isSubmitting = ref(false)
const isRecordingId = ref(null)
const selectedAppointment = ref({})
const loading = ref(false)
const error = ref('')

const vitalsForm = ref({
  temperature: '',
  bloodPressure: '',
  heartRate: '',
  spO2: '',
  notes: ''
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

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const appointmentsRes = await api.get('/appointments')
    appointments.value = appointmentsRes.data.data || appointmentsRes.data.appointments || []
  } catch (err) {
    console.error('Failed to load appointments:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

const openVitalsForm = (appointment) => {
  selectedAppointment.value = appointment
  vitalsForm.value = {
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    spO2: '',
    notes: ''
  }
  showVitalsForm.value = true
}

const submitVitals = async () => {
  isRecordingId.value = selectedAppointment.value.id
  isSubmitting.value = true
  try {
    await api.patch(`/appointments/${selectedAppointment.value.id}/vitals`, vitalsForm.value)
    alert('Vitals recorded successfully!')
    showVitalsForm.value = false
    loadData()
  } catch (err) {
    console.error('Failed to save vitals:', err)
    alert('Failed to save vitals')
  } finally {
    isSubmitting.value = false
    isRecordingId.value = null
  }
}

const refreshData = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
