<template>
  <div class="space-y-8">
    <!-- Back Button -->
    <router-link to="/dashboard/doctor" class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
      ← Back to Appointments
    </router-link>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" :cols="1" />

    <!-- Error State -->
    <ErrorMessage v-if="error && !loading" :message="error" :onRetry="loadData" />

    <!-- Patient Info -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p class="text-sm text-gray-600 font-medium">Patient Name</p>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ appointment.patient?.name || 'Loading...' }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 font-medium">Age</p>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ appointment.patient?.age || '--' }} years</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 font-medium">Contact</p>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ appointment.patient?.phone || '--' }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 font-medium">Time</p>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ appointment.appointmentTime || '--' }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <template v-if="!loading && !error">
      <!-- Chief Complaint -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Chief Complaint</h2>
      <p class="text-gray-700">{{ appointment.reason || 'No reason provided' }}</p>
    </div>

    <!-- Vitals -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-900">Latest Vitals</h2>
        <button
          @click="loadData"
          :disabled="loading"
          class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition disabled:opacity-50"
          title="Refresh vitals from server"
        >
          ↻ Refresh
        </button>
      </div>
      <div v-if="vitals" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Temperature</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ vitals.temperature }}°C</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">BP</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ vitals.bloodPressure }}</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Heart Rate</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ vitals.heartRate }} bpm</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">SpO2</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ vitals.spO2 }}%</p>
        </div>
      </div>
      <div v-else class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p class="text-blue-700 font-medium">No vitals recorded yet</p>
        <p class="text-sm text-blue-600 mt-1">Vitals will appear here once recorded by the nurse</p>
      </div>
    </div>

    <!-- Consultation Notes -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Consultation Notes</h2>
      <textarea
        v-model="consultationNotes"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
        rows="6"
        placeholder="Enter your consultation notes here..."
      ></textarea>
    </div>

    <!-- Prescription Form -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Prescriptions</h2>

      <!-- Current Prescriptions -->
      <div v-if="prescriptions.length > 0" class="mb-6 space-y-3">
        <div v-for="(med, idx) in prescriptions" :key="idx" class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">{{ med.medicine }}</p>
              <p class="text-sm text-gray-600 mt-1">
                {{ med.dosage }} - {{ med.frequency }} for {{ med.duration }}
              </p>
            </div>
            <button
              @click="prescriptions.splice(idx, 1)"
              class="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Medicine -->
      <div class="border border-gray-200 rounded-lg p-4 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Medicine Name</label>
            <input
              v-model="newMedicine.medicine"
              type="text"
              placeholder="e.g., Paracetamol"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Dosage</label>
            <input
              v-model="newMedicine.dosage"
              type="text"
              placeholder="e.g., 500mg"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Frequency</label>
            <select v-model="newMedicine.frequency" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
              <option value="">Select frequency</option>
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Thrice daily">Thrice daily</option>
              <option value="As needed">As needed</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Duration</label>
            <input
              v-model="newMedicine.duration"
              type="text"
              placeholder="e.g., 5 days"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          @click="addPrescription"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Add Medicine
        </button>
      </div>
    </div>

    <!-- Submit Button -->
    <button
      @click="submitConsultation"
      :disabled="isSubmitting"
      class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
    >
      {{ isSubmitting ? 'Saving...' : 'Save Consultation & Prescriptions' }}
    </button>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const route = useRoute()
const api = useApi()

const appointment = ref({})
const vitals = ref(null)
const loading = ref(false)
const error = ref(null)
const consultationNotes = ref('')
const prescriptions = ref([])
const isSubmitting = ref(false)

const newMedicine = ref({
  medicine: '',
  dosage: '',
  frequency: '',
  duration: ''
})

// Compute appointmentId from route params, watching for changes
const appointmentId = computed(() => route.params.id || route.params.appointmentId)

// Normalize vitals field names from snake_case (API) to camelCase (Vue)
const normalizeVitals = (rawVitals) => {
  if (!rawVitals) return null
  return {
    temperature: rawVitals.temperature,
    bloodPressure: rawVitals.blood_pressure,
    heartRate: rawVitals.heart_rate,
    spO2: rawVitals.oxygen, // SpO2 is stored as 'oxygen' in the table
    respiratoryRate: rawVitals.respiratory_rate,
    weight: rawVitals.weight,
    height: rawVitals.height,
    bloodSugar: rawVitals.blood_sugar,
    recordedAt: rawVitals.recorded_at,
    recordedBy: rawVitals.recorded_by,
    id: rawVitals.id
  }
}

const loadData = async () => {
  if (!appointmentId.value) {
    error.value = 'No appointment ID provided in route'
    console.warn('[ConsultationView] No appointment ID in route');
    return
  }
  
  loading.value = true
  error.value = null
  try {
    console.log('[ConsultationView] Fetching appointment:', appointmentId.value)
    
    // Fetch appointment data
    const appointmentRes = await api.get(`/appointments/${appointmentId.value}`)
    appointment.value = appointmentRes.data.data || {}
    
    console.log('[ConsultationView] Appointment loaded:', {
      id: appointment.value.id,
      patientId: appointment.value.patient_id,
      patientName: appointment.value.patient?.name,
      hasPatientId: !!appointment.value.patient_id
    })

    // If appointment has patient info, fetch vitals for that patient
    if (appointment.value.patient_id) {
      try {
        console.log('[ConsultationView] Fetching vitals for patient:', appointment.value.patient_id)
        
        const vitalsRes = await api.get(`/patients/${appointment.value.patient_id}/vitals`)
        const vitalsData = vitalsRes.data.data
        
        console.log('[ConsultationView] Vitals response received:', {
          isArray: Array.isArray(vitalsData),
          length: Array.isArray(vitalsData) ? vitalsData.length : 'not-array',
          data: vitalsData
        })
        
        // If vitalsData is an array, get the most recent one
        if (Array.isArray(vitalsData) && vitalsData.length > 0) {
          console.log('[ConsultationView] Using latest vitals (index 0):', vitalsData[0])
          vitals.value = normalizeVitals(vitalsData[0])
          console.log('[ConsultationView] Normalized vitals:', vitals.value)
        } else if (vitalsData && typeof vitalsData === 'object' && !Array.isArray(vitalsData)) {
          console.log('[ConsultationView] Vitals is single object, normalizing:', vitalsData)
          vitals.value = normalizeVitals(vitalsData)
        } else {
          console.log('[ConsultationView] No vitals data available')
          vitals.value = null
        }
      } catch (vitalsErr) {
        // Vitals endpoint might fail gracefully, log but don't fail whole view
        console.warn('[ConsultationView] Vitals fetch failed:', {
          status: vitalsErr.response?.status,
          message: vitalsErr.message,
          error: vitalsErr.response?.data
        })
        vitals.value = null
      }
    } else {
      console.warn('[ConsultationView] No patient_id in appointment, skipping vitals fetch')
      vitals.value = null
    }
  } catch (err) {
    error.value = 'Failed to load consultation data. Please try again.'
    console.error('[ConsultationView] Error loading data:', {
      status: err.response?.status,
      message: err.message,
      data: err.response?.data
    })
  } finally {
    loading.value = false
  }
}

const addPrescription = () => {
  if (
    newMedicine.value.medicine &&
    newMedicine.value.dosage &&
    newMedicine.value.frequency &&
    newMedicine.value.duration
  ) {
    prescriptions.value.push({ ...newMedicine.value })
    newMedicine.value = { medicine: '', dosage: '', frequency: '', duration: '' }
  }
}

const submitConsultation = async () => {
  isSubmitting.value = true
  try {
    await api.post(`/appointments/${appointmentId.value}/consultation`, {
      notes: consultationNotes.value,
      prescriptions: prescriptions.value
    })

    alert('Consultation saved successfully!')
    consultationNotes.value = ''
    prescriptions.value = []
  } catch (error) {
    console.error('Failed to save consultation:', error)
    alert('Failed to save consultation')
  } finally {
    isSubmitting.value = false
  }
}

// Re-fetch when route params change
watch(() => appointmentId.value, () => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>
