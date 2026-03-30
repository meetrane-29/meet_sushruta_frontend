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
            <p class="text-gray-600 text-sm font-medium">Admitted Patients</p>
            <p class="text-3xl font-bold text-purple-600 mt-2">{{ admissions.length }}</p>
          </div>
          <span class="text-4xl">🏥</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Available Beds</p>
            <p class="text-3xl font-bold text-green-600 mt-2">{{ beds.filter((b) => b.status === 'available').length }}</p>
          </div>
          <span class="text-4xl">🛏️</span>
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
            <td class="px-6 py-4 text-gray-900 font-medium">
              {{ appointment.patient?.user ? `${appointment.patient.user.first_name} ${appointment.patient.user.last_name}` : 'Patient' }}
            </td>
            <td class="px-6 py-4 text-gray-600 text-sm">
              {{ appointment.doctor?.user ? `${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}` : 'Unknown' }}
            </td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ appointment.appointment_date }}</td>
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
          placeholder="Search by patient name or ID..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <!-- Active Admissions Section -->
      <div v-if="admissions.length > 0" class="space-y-4">
        <h3 class="text-xl font-bold text-gray-900">👥 Currently Admitted Patients</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="admission in filteredAdmissions" :key="admission.id" class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-lg font-bold">{{ admission.patient_name }}</h4>
                  <p class="text-sm opacity-90">Bed: {{ admission.bed_number }} | Ward: {{ admission.ward }}</p>
                </div>
                <span v-if="admission.is_emergency" class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">🚨 Emergency</span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-gray-600">Doctor</p>
                  <p class="font-medium text-gray-900">{{ admission.doctor_name }}</p>
                </div>
                <div>
                  <p class="text-gray-600">Admitted</p>
                  <p class="font-medium text-gray-900">{{ formatDate(admission.admission_date) }}</p>
                </div>
                <div>
                  <p class="text-gray-600">Reason</p>
                  <p class="font-medium text-gray-900">{{ admission.reason || '--' }}</p>
                </div>
                <div>
                  <p class="text-gray-600">Status</p>
                  <StatusBadge :status="admission.status" />
                </div>
              </div>

              <div v-if="admission.diagnosis" class="pt-2 border-t border-gray-200">
                <p class="text-sm text-gray-600">Diagnosis</p>
                <p class="text-sm text-gray-900">{{ admission.diagnosis }}</p>
              </div>

              <!-- Action Button -->
              <div class="pt-4 border-t border-gray-200">
                <button
                  @click="openVitalsFormForAdmission(admission)"
                  :disabled="isRecordingId === admission.patient_id"
                  class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isRecordingId === admission.patient_id ? 'Recording...' : '📝 Record Vitals' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Patients Section -->
      <div v-if="filteredPatients.length > 0" class="space-y-4">
        <h3 class="text-xl font-bold text-gray-900">👤 Other Patients</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="patient in filteredPatients" :key="patient.id" class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ patient.user ? `${patient.user.first_name} ${patient.user.last_name}` : 'Unknown Patient' }}</h3>
                <p class="text-sm text-gray-600">Age: {{ patient.age || '--' }} | Blood Group: {{ patient.blood_group || '--' }}</p>
              </div>
            </div>

            <div class="space-y-2 mb-4 text-sm">
              <p><span class="text-gray-600">Patient ID:</span> <span class="font-mono text-xs">{{ patient.id }}</span></p>
              <p><span class="text-gray-600">Phone:</span> <span class="font-medium">{{ patient.user?.phone || '--' }}</span></p>
              <p><span class="text-gray-600">Allergies:</span> <span class="font-medium">{{ patient.allergies || 'None' }}</span></p>
            </div>

            <div class="pt-4 border-t border-gray-200">
              <button
                @click="openVitalsFormForPatient(patient)"
                :disabled="isRecordingId === patient.id"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isRecordingId === patient.id ? 'Recording...' : '📝 Record Vitals' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredPatients.length === 0 && filteredAdmissions.length === 0" class="p-8 text-center text-gray-600 bg-white rounded-lg border border-gray-200">
        <p class="text-lg">No patients matching your search</p>
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
const admissions = ref([])
const beds = ref([])
const patientSearch = ref('')
const showVitalsForm = ref(false)
const isSubmitting = ref(false)
const isRecordingId = ref(null)
const selectedPatient = ref({})
const selectedAppointment = ref(null)
const loading = ref(false)
const error = ref('')
const activeTab = ref('appointments')
const vitalsRecorded = ref(0)

// Compute abnormal vitals for each patient
const isAbnormalVitals = (vitals) => {
  if (!vitals) return false
  // Temperature: Normal is 98.6°F (36.1-37.2°C)
  if (vitals.temperature && (vitals.temperature < 36 || vitals.temperature > 38)) return true
  // Heart Rate: Normal is 60-100 bpm
  if (vitals.heart_rate && (vitals.heart_rate < 60 || vitals.heart_rate > 100)) return true
  // SpO2: Should be 95-100%
  if (vitals.oxygen && vitals.oxygen < 95) return true
  // Blood Sugar: Normal fasting is 70-100 mg/dL
  if (vitals.blood_sugar && (vitals.blood_sugar < 70 || vitals.blood_sugar > 140)) return true
  return false
}

// Filter patients based on search
const filteredPatients = computed(() => {
  return patients.value.filter((patient) => {
    const searchLower = patientSearch.value.toLowerCase()
    const name = (patient.name || `${patient.first_name || ''} ${patient.last_name || ''}`).toLowerCase()
    const patientId = (patient.id || '').toLowerCase()
    return name.includes(searchLower) || patientId.includes(searchLower)
  })
})

// Filter admissions based on search
const filteredAdmissions = computed(() => {
  return admissions.value.filter((adm) => {
    const searchLower = patientSearch.value.toLowerCase()
    const name = (adm.patient_name || '').toLowerCase()
    return name.includes(searchLower)
  })
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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return timeString
  }
}

const formatTime = (timeString) => {
  if (!timeString) return '--'
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return timeString
  }
}

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    // Debug: Check current user's role first
    try {
      const whoami = await api.get('/debug/whoami')
      console.log('✅ Current User:', whoami.data)
    } catch (debugErr) {
      console.warn('⚠️ Debug endpoint not available:', debugErr.message)
    }

    // Load all data in parallel
    const [appointmentsRes, patientsRes, admissionsRes, bedsRes] = await Promise.allSettled([
      api.get('/appointments/next-7-days'),
      api.get('/patients'),
      api.get('/admissions/active'),
      api.get('/beds/all')
    ])

    // Process appointments
    if (appointmentsRes.status === 'fulfilled') {
      const fullData = appointmentsRes.value.data
      console.log('📊 Full Response Structure:', {
        hasData: !!fullData.data,
        hasAppointments: !!fullData.appointments,
        dataType: typeof fullData.data,
        appointmentsType: typeof fullData.appointments,
        keys: Object.keys(fullData)
      })
      if (fullData.data && typeof fullData.data === 'object' && fullData.data.appointments) {
        appointments.value = fullData.data.appointments
      } else if (fullData.appointments) {
        appointments.value = fullData.appointments
      } else {
        appointments.value = []
      }
      console.log('✅ Appointments loaded:', appointments.value.length)
    } else {
      const errMsg = appointmentsRes.reason?.response?.data?.message || appointmentsRes.reason?.message || 'Unknown error'
      const errStatus = appointmentsRes.reason?.response?.status
      console.error(`❌ Appointments error (${errStatus}):`, errMsg)
      console.error('Full error object:', appointmentsRes.reason)
    }

    // Process patients
    if (patientsRes.status === 'fulfilled') {
      const fullData = patientsRes.value.data
      if (fullData.data && typeof fullData.data === 'object' && fullData.data.patients) {
        patients.value = fullData.data.patients
      } else if (fullData.patients) {
        patients.value = fullData.patients
      } else {
        patients.value = []
      }
      console.log('✅ Patients loaded:', patients.value.length)
    } else {
      const errMsg = patientsRes.reason?.response?.data?.message || patientsRes.reason?.message
      console.error('❌ Patients error:', errMsg)
    }

    // Process admissions
    if (admissionsRes.status === 'fulfilled') {
      const fullData = admissionsRes.value.data
      if (fullData.data && typeof fullData.data === 'object' && fullData.data.admissions) {
        admissions.value = fullData.data.admissions
      } else if (fullData.admissions) {
        admissions.value = fullData.admissions
      } else {
        admissions.value = []
      }
      console.log('✅ Admissions loaded:', admissions.value.length)
    } else {
      const errMsg = admissionsRes.reason?.response?.data?.message || admissionsRes.reason?.message
      console.error('❌ Admissions error:', errMsg)
    }

    // Process beds
    if (bedsRes.status === 'fulfilled') {
      const fullData = bedsRes.value.data
      if (fullData.data && typeof fullData.data === 'object' && fullData.data.beds) {
        beds.value = fullData.data.beds
      } else if (fullData.beds) {
        beds.value = fullData.beds
      } else {
        beds.value = []
      }
      console.log('✅ Beds loaded:', beds.value.length)
    } else {
      const errMsg = bedsRes.reason?.response?.data?.message || bedsRes.reason?.message
      console.error('❌ Beds error:', errMsg)
    }

    // Calculate stats
    vitalsRecorded.value = appointments.value.filter((a) => a.vitals_recorded).length

    // Show error only if all data loads failed
    if (appointments.value.length === 0 && patients.value.length === 0 && admissions.value.length === 0) {
      error.value = 'Unable to load any data. Check permissions and try again.'
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
    error.value = err.response?.data?.message || 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

const openVitalsForm = (appointment) => {
  selectedAppointment.value = appointment
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
  selectedAppointment.value = null
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

const openVitalsFormForAdmission = (admission) => {
  selectedAppointment.value = null
  selectedPatient.value = {
    id: admission.patient_id,
    name: admission.patient_name
  }
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

const submitVitals = async () => {
  // Validate required fields
  if (!vitalsForm.value.temperature || !vitalsForm.value.bloodPressure || !vitalsForm.value.heartRate) {
    alert('Please fill in required fields: Temperature, Blood Pressure, and Heart Rate')
    return
  }

  isRecordingId.value = selectedPatient.value.id
  isSubmitting.value = true
  try {
    // Parse blood pressure if it's in format "120/80"
    let systolic = null
    let diastolic = null
    if (vitalsForm.value.bloodPressure) {
      const bpParts = vitalsForm.value.bloodPressure.split('/')
      if (bpParts.length === 2) {
        systolic = parseInt(bpParts[0])
        diastolic = parseInt(bpParts[1])
      }
    }

    const vitalsPayload = {
      patient_id: selectedPatient.value.id,
      temperature: parseFloat(vitalsForm.value.temperature),
      blood_pressure: vitalsForm.value.bloodPressure,
      heart_rate: parseInt(vitalsForm.value.heartRate),
      respiratory_rate: vitalsForm.value.respiratoryRate ? parseInt(vitalsForm.value.respiratoryRate) : null,
      weight: vitalsForm.value.weight ? parseFloat(vitalsForm.value.weight) : null,
      height: vitalsForm.value.height ? parseFloat(vitalsForm.value.height) : null,
      oxygen: vitalsForm.value.spO2 ? parseInt(vitalsForm.value.spO2) : null,
      blood_sugar: vitalsForm.value.bloodSugar ? parseFloat(vitalsForm.value.bloodSugar) : null,
      recorded_at: new Date().toISOString(),
      recorded_by: 'current-user-id' // Will be replaced by backend auth middleware
    }

    const response = await api.post('/vitals', vitalsPayload)
    
    if (response.status === 200 || response.status === 201) {
      alert('✅ Vitals recorded successfully!')
      showVitalsForm.value = false
      await loadData() // Refresh data
    } else {
      throw new Error('Unexpected response status')
    }
  } catch (err) {
    console.error('Failed to save vitals:', err)
    const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error'
    alert('❌ Failed to save vitals: ' + errorMsg)
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
