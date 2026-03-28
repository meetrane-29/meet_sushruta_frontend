<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Nurse Dashboard</h1>
        <p class="text-gray-600 mt-1">Monitor patients and manage vitals</p>
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

    <!-- Tabs -->
    <div v-if="!loading && !error" class="flex gap-4 border-b border-gray-200">
      <button
        @click="activeTab = 'appointments'"
        :class="activeTab === 'appointments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'"
        class="px-4 py-2 font-medium transition"
      >
        Appointments
      </button>
      <button
        @click="activeTab = 'patients'"
        :class="activeTab === 'patients' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'"
        class="px-4 py-2 font-medium transition"
      >
        Patient Monitoring
      </button>
    </div>

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
            <p class="text-gray-600 text-sm font-medium">Total Patients</p>
            <p class="text-3xl font-bold text-purple-600 mt-2">{{ patients.length }}</p>
          </div>
          <span class="text-4xl">👥</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Vitals Recorded</p>
            <p class="text-3xl font-bold text-green-600 mt-2">{{ vitalsRecorded }}</p>
          </div>
          <span class="text-4xl">✅</span>
        </div>
      </div>
    </div>

    <!-- Appointments Tab -->
    <div v-if="!loading && !error && activeTab === 'appointments'" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
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

    <!-- Patients Monitoring Tab -->
    <div v-if="!loading && !error && activeTab === 'patients'" class="space-y-6">
      <div class="flex gap-4">
        <input
          v-model="patientSearch"
          type="text"
          placeholder="Search patients..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="patient in filteredPatients" :key="patient.id" class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ patient.name }}</h3>
              <p class="text-sm text-gray-600">Age: {{ patient.age || '--' }} | Blood Group: {{ patient.blood_group || '--' }}</p>
            </div>
          </div>

          <div class="space-y-2 mb-4 text-sm">
            <p><span class="text-gray-600">Patient ID:</span> <span class="font-medium">{{ patient.id }}</span></p>
            <p><span class="text-gray-600">Allergies:</span> <span class="font-medium">{{ patient.allergies || 'None' }}</span></p>
            <p><span class="text-gray-600">Emergency Contact:</span> <span class="font-medium">{{ patient.emergency_contact || '--' }}</span></p>
          </div>

          <div class="pt-4 border-t border-gray-200">
            <button
              @click="openVitalsFormForPatient(patient)"
              :disabled="isRecordingId === patient.id"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isRecordingId === patient.id ? 'Recording...' : 'Record Vitals' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredPatients.length === 0" class="p-8 text-center text-gray-600 bg-white rounded-lg">
        <p class="text-lg">No patients found</p>
      </div>
    </div>

    <!-- Vitals Form Modal -->
    <div v-if="showVitalsForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Record Vitals</h2>
          <button @click="showVitalsForm = false" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <p class="text-gray-600 mb-6">Patient: <span class="font-medium">{{ selectedPatient.name || 'N/A' }}</span></p>

        <form @submit.prevent="submitVitals" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Temperature (°F) <span class="text-red-500">*</span></label>
              <input
                v-model.number="vitalsForm.temperature"
                type="number"
                step="0.1"
                placeholder="98.6"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Blood Pressure (e.g., 120/80) <span class="text-red-500">*</span></label>
              <input
                v-model="vitalsForm.bloodPressure"
                type="text"
                placeholder="120/80"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Heart Rate (bpm) <span class="text-red-500">*</span></label>
              <input
                v-model.number="vitalsForm.heartRate"
                type="number"
                placeholder="72"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Respiratory Rate (breaths/min)</label>
              <input
                v-model.number="vitalsForm.respiratoryRate"
                type="number"
                placeholder="16"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Weight (kg)</label>
              <input
                v-model.number="vitalsForm.weight"
                type="number"
                step="0.1"
                placeholder="70.5"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Height (cm)</label>
              <input
                v-model.number="vitalsForm.height"
                type="number"
                step="0.1"
                placeholder="175"
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
              <label class="block text-sm font-medium text-gray-900 mb-2">Blood Sugar (mg/dL)</label>
              <input
                v-model.number="vitalsForm.bloodSugar"
                type="number"
                placeholder="100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
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

          <div class="flex gap-3 pt-4 border-t border-gray-200">
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
const patients = ref([])
const patientSearch = ref('')
const showVitalsForm = ref(false)
const isSubmitting = ref(false)
const isRecordingId = ref(null)
const selectedPatient = ref({})
const loading = ref(false)
const error = ref('')
const activeTab = ref('appointments')
const vitalsRecorded = ref(0)

const filteredPatients = computed(() => {
  return patients.value.filter((patient) =>
    patient.name.toLowerCase().includes(patientSearch.value.toLowerCase())
  )
})

const vitalsForm = ref({
  temperature: '',
  bloodPressure: '',
  heartRate: '',
  respiratoryRate: '',
  weight: '',
  height: '',
  spO2: '',
  bloodSugar: '',
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

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    // Try to load both, but don't fail completely if one fails
    let appointmentsData = []
    let patientsData = []
    
    // Load patients (required)
    try {
      const patientsRes = await api.get('/patients')
      patientsData = patientsRes.data.data || patientsRes.data.patients || []
    } catch (err) {
      console.error('Failed to load patients:', err)
      // Still try to continue without patients
    }
    
    // Load appointments (optional - might fail due to permissions)
    try {
      const appointmentsRes = await api.get('/appointments')
      appointmentsData = appointmentsRes.data.data || appointmentsRes.data.appointments || []
    } catch (err) {
      console.error('Failed to load appointments:', err)
      // For nurse, this endpoint might not be available - use empty list
      // This is not a fatal error
    }
    
    appointments.value = appointmentsData
    patients.value = patientsData
    vitalsRecorded.value = appointments.value.filter((a) => a.vitals_recorded).length
    
    // Only show error if we couldn't load any data
    if (appointmentsData.length === 0 && patientsData.length === 0) {
      error.value = 'No data available. Please check your permissions.'
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

const openVitalsForm = (appointment) => {
  selectedPatient.value = appointment.patient || {}
  vitalsForm.value = {
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    weight: '',
    height: '',
    spO2: '',
    bloodSugar: '',
    notes: ''
  }
  showVitalsForm.value = true
}

const openVitalsFormForPatient = (patient) => {
  selectedPatient.value = patient
  vitalsForm.value = {
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    weight: '',
    height: '',
    spO2: '',
    bloodSugar: '',
    notes: ''
  }
  showVitalsForm.value = true
}

const debugCheckRole = async () => {
  try {
    const res = await api.get('/debug/whoami')
    console.log('[Debug] Current user:', res.data)
    alert(JSON.stringify(res.data, null, 2))
  } catch (err) {
    console.error('[Debug] Error:', err)
    alert('Error checking role: ' + (err.response?.data?.message || err.message))
  }
}

const submitVitals = async () => {
  if (!vitalsForm.value.temperature || !vitalsForm.value.bloodPressure || !vitalsForm.value.heartRate) {
    alert('Please fill in required fields: Temperature, Blood Pressure, and Heart Rate')
    return
  }

  isRecordingId.value = selectedPatient.value.id
  isSubmitting.value = true
  try {
    await api.post('/vitals', {
      patient_id: selectedPatient.value.id,
      temperature: vitalsForm.value.temperature,
      blood_pressure: vitalsForm.value.bloodPressure,
      heart_rate: vitalsForm.value.heartRate,
      respiratory_rate: vitalsForm.value.respiratoryRate || null,
      weight: vitalsForm.value.weight || null,
      height: vitalsForm.value.height || null,
      spo2: vitalsForm.value.spO2 || null,
      blood_sugar: vitalsForm.value.bloodSugar || null,
      notes: vitalsForm.value.notes
    })
    alert('Vitals recorded successfully!')
    showVitalsForm.value = false
    loadData()
  } catch (err) {
    console.error('Failed to save vitals:', err)
    alert('Failed to save vitals: ' + (err.response?.data?.message || err.message))
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
