<template>
  <div class="space-y-8">
    <!-- Back Button -->
    <router-link to="/dashboard/doctor" class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
      ← Back to Appointments
    </router-link>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" :cols="1" />

    <!-- Error State -->
    <ErrorMessage v-if="error && !loading" :message="error" @retry="loadData" />

    <!-- Patient Info -->
    <div v-if="!loading && !error && appointment.id" class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <p class="text-sm text-gray-600 font-medium">Patient Name</p>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ getPatientName(appointment) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 font-medium">Age</p>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ appointment.patient?.age || '--' }} years</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 font-medium">Contact</p>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ appointment.patient?.phone_number || '--' }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 font-medium">Date & Time</p>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ formatDate(appointment.appointment_date) }} {{ formatTime(appointment.appointment_time) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 font-medium">Status</p>
          <div class="mt-1">
            <StatusBadge :status="appointment.status" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <template v-if="!loading && !error && appointment.id">
      <!-- Chief Complaint -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Chief Complaint</h2>
        <p class="text-gray-700 text-lg">{{ appointment.reason || 'No reason provided' }}</p>
        <p v-if="appointment.notes" class="text-gray-600 mt-3 text-sm font-medium">Additional Notes:</p>
        <p v-if="appointment.notes" class="text-gray-600 mt-1">{{ appointment.notes }}</p>
      </div>

      <!-- Vitals Section -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Patient Vitals</h2>
          <button
            @click="showVitalsForm = !showVitalsForm"
            class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            {{ showVitalsForm ? 'Close Form' : '+ Record Vitals' }}
          </button>
        </div>

        <!-- Vitals Recording Form -->
        <div v-if="showVitalsForm" class="border-b border-gray-200 pb-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
              <input
                v-model.number="vitalsForm.temperature"
                type="number"
                step="0.1"
                min="35"
                max="42"
                placeholder="36.5"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">BP (Systolic)</label>
              <input
                v-model.number="vitalsForm.systolic"
                type="number"
                min="80"
                max="200"
                placeholder="120"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">BP (Diastolic)</label>
              <input
                v-model.number="vitalsForm.diastolic"
                type="number"
                min="40"
                max="130"
                placeholder="80"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
              <input
                v-model.number="vitalsForm.heart_rate"
                type="number"
                min="40"
                max="200"
                placeholder="72"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate (breaths/min)</label>
              <input
                v-model.number="vitalsForm.respiratory_rate"
                type="number"
                min="10"
                max="40"
                placeholder="16"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">SpO2 (%)</label>
              <input
                v-model.number="vitalsForm.oxygen"
                type="number"
                min="70"
                max="100"
                placeholder="98"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                v-model.number="vitalsForm.weight"
                type="number"
                step="0.1"
                min="30"
                max="200"
                placeholder="70"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input
                v-model.number="vitalsForm.height"
                type="number"
                min="80"
                max="220"
                placeholder="170"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Blood Sugar (mg/dL)</label>
              <input
                v-model.number="vitalsForm.blood_sugar"
                type="number"
                min="50"
                max="400"
                placeholder="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            @click="saveVitals"
            :disabled="savingVitals"
            class="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {{ savingVitals ? 'Saving...' : 'Save Vitals' }}
          </button>
        </div>

        <!-- Display Current Vitals -->
        <div v-if="vitals" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <p class="text-sm text-gray-600 font-medium">Temperature</p>
            <p class="text-2xl font-bold text-blue-900 mt-1">{{ vitals.temperature }}°C</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4 bg-purple-50">
            <p class="text-sm text-gray-600 font-medium">BP</p>
            <p class="text-2xl font-bold text-purple-900 mt-1">{{ vitals.bloodPressure }}</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4 bg-pink-50">
            <p class="text-sm text-gray-600 font-medium">Heart Rate</p>
            <p class="text-2xl font-bold text-pink-900 mt-1">{{ vitals.heartRate }} bpm</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4 bg-green-50">
            <p class="text-sm text-gray-600 font-medium">SpO2</p>
            <p class="text-2xl font-bold text-green-900 mt-1">{{ vitals.spO2 }}%</p>
          </div>
        </div>
        <div v-else class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p class="text-blue-700 font-medium">No vitals recorded yet</p>
          <p class="text-sm text-blue-600 mt-1">Use the form above to record patient vitals</p>
        </div>
      </div>

      <!-- Consultation Notes -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Consultation Notes & Diagnosis</h2>
        <textarea
          v-model="consultationNotes"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm resize-vertical"
          rows="6"
          placeholder="Enter consultation notes, diagnosis, and treatment plan here..."
        ></textarea>
        <p class="text-xs text-gray-500 mt-2">Include your clinical findings, diagnosis, and recommended treatment</p>
      </div>

      <!-- Prescription Form -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Prescriptions</h2>

        <!-- Current Prescriptions -->
        <div v-if="prescriptions.length > 0" class="mb-6 space-y-3">
          <div v-for="(med, idx) in prescriptions" :key="idx" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">{{ med.medicine_name }}</p>
                <p class="text-sm text-gray-600 mt-1">
                  {{ med.dosage }} • {{ med.frequency }} • {{ med.duration }}
                </p>
              </div>
              <button
                @click="prescriptions.splice(idx, 1)"
                class="text-red-600 hover:text-red-700 font-medium text-sm px-2 py-1 hover:bg-red-50 rounded"
              >
                ✕ Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Add New Medicine -->
        <div class="border border-gray-200 rounded-lg p-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Medicine</label>
              <input
                v-model="newMedicine.medicine_name"
                type="text"
                list="medicines-list"
                placeholder="Select or type medicine name..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <datalist id="medicines-list">
                <option v-for="med in availableMedicines" :key="med.id" :value="med.name">{{ med.name }}</option>
              </datalist>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Dosage</label>
              <input
                v-model="newMedicine.dosage"
                type="text"
                placeholder="e.g., 500mg"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Frequency</label>
              <select v-model="newMedicine.frequency" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                <option value="">Select frequency</option>
                <option value="Once daily">Once daily (OD)</option>
                <option value="Twice daily">Twice daily (BD)</option>
                <option value="Thrice daily">Thrice daily (TDS)</option>
                <option value="Four times daily">Four times daily (QID)</option>
                <option value="As needed">As needed (PRN)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Duration</label>
              <input
                v-model="newMedicine.duration"
                type="text"
                placeholder="e.g., 5 days, 2 weeks"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            @click="addPrescription"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Add Medicine
          </button>
        </div>
      </div>

      <!-- Appointment Status & Submit -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Appointment Status</h3>
          <select
            v-model="appointmentStatus"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            @click="updateAppointmentStatus"
            :disabled="updatingStatus"
            class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
          >
            {{ updatingStatus ? 'Updating...' : 'Update Status' }}
          </button>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Save Consultation</h3>
          <button
            @click="submitConsultation"
            :disabled="isSubmitting"
            class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Saving...' : '✓ Save Consultation & Prescription' }}
          </button>
          <p class="text-xs text-gray-500 mt-3 text-center">This will save all notes and prescriptions</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()

const appointment = ref({})
const vitals = ref(null)
const loading = ref(false)
const error = ref(null)
const consultationNotes = ref('')
const prescriptions = ref([])
const isSubmitting = ref(false)
const savingVitals = ref(false)
const updatingStatus = ref(false)
const showVitalsForm = ref(false)
const availableMedicines = ref([])
const appointmentStatus = ref('pending')

const vitalsForm = ref({
  temperature: null,
  systolic: null,
  diastolic: null,
  heart_rate: null,
  respiratory_rate: null,
  oxygen: null,
  weight: null,
  height: null,
  blood_sugar: null
})

const newMedicine = ref({
  medicine_name: '',
  dosage: '',
  frequency: '',
  duration: ''
})

const appointmentId = computed(() => route.params.id || route.params.appointmentId)

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

const normalizeVitals = (rawVitals) => {
  if (!rawVitals) return null
  const systolic = rawVitals.blood_pressure ? rawVitals.blood_pressure.split('/')[0] : 'N/A'
  const diastolic = rawVitals.blood_pressure ? rawVitals.blood_pressure.split('/')[1] : 'N/A'
  return {
    temperature: rawVitals.temperature,
    bloodPressure: rawVitals.blood_pressure || `${systolic}/${diastolic}`,
    heartRate: rawVitals.heart_rate,
    spO2: rawVitals.oxygen,
    respiratoryRate: rawVitals.respiratory_rate,
    weight: rawVitals.weight,
    height: rawVitals.height,
    bloodSugar: rawVitals.blood_sugar,
    recordedAt: rawVitals.recorded_at,
    id: rawVitals.id
  }
}

const loadData = async () => {
  if (!appointmentId.value) {
    error.value = 'No appointment ID provided in route'
    return
  }
  
  loading.value = true
  error.value = null
  try {
    // Fetch appointment data
    const appointmentRes = await api.get(`/appointments/${appointmentId.value}`)
    appointment.value = appointmentRes.data.data || {}
    appointmentStatus.value = appointment.value.status || 'pending'

    console.log('[ConsultationView] Appointment loaded:', appointment.value.id)

    // Fetch vitals for patient if available
    if (appointment.value.patient_id) {
      try {
        const vitalsRes = await api.get(`/vitals/patient/${appointment.value.patient_id}`)
        const vitalsData = vitalsRes.data.data
        
        if (Array.isArray(vitalsData) && vitalsData.length > 0) {
          vitals.value = normalizeVitals(vitalsData[0])
        } else if (vitalsData && typeof vitalsData === 'object' && !Array.isArray(vitalsData)) {
          vitals.value = normalizeVitals(vitalsData)
        }
      } catch (vitalsErr) {
        console.warn('[ConsultationView] Vitals fetch:', vitalsErr.message)
        vitals.value = null
      }
    }

    // Load available medicines
    await loadAvailableMedicines()
  } catch (err) {
    error.value = 'Failed to load consultation data. Please try again.'
    console.error('[ConsultationView] Error:', err)
  } finally {
    loading.value = false
  }
}

const loadAvailableMedicines = async () => {
  try {
    const res = await api.get('/pharmacy/medicines')
    availableMedicines.value = res.data.data || res.data.medicines || []
  } catch (err) {
    console.warn('[ConsultationView] Failed to load medicines:', err.message)
    availableMedicines.value = []
  }
}

const saveVitals = async () => {
  if (!appointmentId.value || !appointment.value.patient_id) {
    alert('Invalid appointment or patient data')
    return
  }

  savingVitals.value = true
  try {
    const vitalsData = {
      patient_id: appointment.value.patient_id,
      appointment_id: appointmentId.value,
      temperature: vitalsForm.value.temperature,
      blood_pressure: `${vitalsForm.value.systolic}/${vitalsForm.value.diastolic}`,
      heart_rate: vitalsForm.value.heart_rate,
      respiratory_rate: vitalsForm.value.respiratory_rate,
      oxygen: vitalsForm.value.oxygen,
      weight: vitalsForm.value.weight,
      height: vitalsForm.value.height,
      blood_sugar: vitalsForm.value.blood_sugar
    }

    await api.post('/vitals', vitalsData)
    vitals.value = normalizeVitals(vitalsData)
    showVitalsForm.value = false
    alert('Vitals saved successfully!')
  } catch (err) {
    console.error('[ConsultationView] Error saving vitals:', err)
    alert('Failed to save vitals: ' + (err.response?.data?.error || err.message))
  } finally {
    savingVitals.value = false
  }
}

const addPrescription = () => {
  if (
    newMedicine.value.medicine_name &&
    newMedicine.value.dosage &&
    newMedicine.value.frequency &&
    newMedicine.value.duration
  ) {
    prescriptions.value.push({ ...newMedicine.value })
    newMedicine.value = { medicine_name: '', dosage: '', frequency: '', duration: '' }
  } else {
    alert('Please fill all prescription fields')
  }
}

const updateAppointmentStatus = async () => {
  if (!appointmentId.value) return
  
  updatingStatus.value = true
  try {
    await api.patch(`/appointments/${appointmentId.value}/status`, {
      status: appointmentStatus.value
    })
    appointment.value.status = appointmentStatus.value
    alert('Appointment status updated successfully!')
  } catch (err) {
    console.error('[ConsultationView] Error updating status:', err)
    alert('Failed to update appointment status')
  } finally {
    updatingStatus.value = false
  }
}

const submitConsultation = async () => {
  if (!appointmentId.value) {
    alert('Invalid appointment ID')
    return
  }

  if (!consultationNotes.value.trim()) {
    alert('Please enter consultation notes before saving')
    return
  }

  isSubmitting.value = true
  try {
    // First create prescriptions if any
    for (const prescription of prescriptions.value) {
      const prescriptionData = {
        appointment_id: appointmentId.value,
        doctor_id: appointment.value.doctor_id,
        patient_id: appointment.value.patient_id,
        items: [
          {
            medicine_name: prescription.medicine_name,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            duration: prescription.duration
          }
        ],
        notes: consultationNotes.value
      }

      await api.post('/prescriptions', prescriptionData)
    }

    // Update appointment with consultation notes
    await api.patch(`/appointments/${appointmentId.value}`, {
      notes: consultationNotes.value,
      status: 'completed'
    })

    alert('Consultation saved successfully!')
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/dashboard/doctor')
  } catch (err) {
    console.error('[ConsultationView] Error saving consultation:', err)
    alert('Failed to save consultation: ' + (err.response?.data?.error || err.message))
  } finally {
    isSubmitting.value = false
  }
}

watch(() => appointmentId.value, () => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>
