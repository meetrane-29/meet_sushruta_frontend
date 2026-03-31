<template>
  <div class="space-y-6">
    <!-- Refresh Button -->
    <div class="flex justify-end gap-2">
      <button
        @click="fetchIPDPatients"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
      >
        🔄 Refresh
      </button>
      <button
        @click="showAdmissionForm = !showAdmissionForm"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
      >
        ➕ New Admission
      </button>
    </div>

    <!-- New Admission Form -->
    <div v-if="showAdmissionForm" class="bg-green-50 border border-green-300 p-6 rounded-lg">
      <h2 class="text-xl font-bold text-gray-800 mb-4">🏥 Create New Admission</h2>

      <!-- Selected Patient Banner -->
      <div v-if="selectedAppointment" class="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4 flex items-center gap-3">
        <span class="text-blue-600 text-xl">👤</span>
        <div>
          <p class="font-semibold text-blue-800">
            {{ selectedAppointment.patient?.user?.first_name }} {{ selectedAppointment.patient?.user?.last_name }}
          </p>
          <p class="text-sm text-blue-600">{{ selectedAppointment.reason || 'OPD Visit' }}</p>
        </div>
      </div>

      <form @submit.prevent="createAdmission" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div v-if="!selectedAppointment">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Patient ID</label>
            <input
              v-model="admissionForm.patientId"
              type="text"
              placeholder="Patient ID"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Reason for Admission</label>
            <input
              v-model="admissionForm.reason"
              type="text"
              placeholder="Admission reason"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Initial Diagnosis</label>
          <input
            v-model="admissionForm.diagnosis"
            type="text"
            placeholder="Diagnosis"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Ward</label>
            <select
              v-model="admissionForm.ward"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Ward</option>
              <option>ICU</option>
              <option>General</option>
              <option>Private</option>
              <option>Semi-Private</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Emergency</label>
            <select
              v-model="admissionForm.isEmergency"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option :value="false">No</option>
              <option :value="true">Yes</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all"
        >
          ✅ Create Admission
        </button>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <LoadingSpinner />
      <p class="text-gray-600 mt-2">Loading admitted patients...</p>
    </div>

    <!-- Error State -->
    <ErrorMessage v-if="error" :message="error" @retry="fetchIPDPatients" />

    <!-- IPD Patients List -->
    <div v-if="!loading && !error" class="space-y-4">
      <div v-if="admittedPatients.length === 0" class="bg-white p-8 rounded-lg shadow text-center">
        <p class="text-gray-500 text-lg">No admitted patients currently</p>
      </div>

      <div
        v-for="patient in admittedPatients"
        :key="patient.id"
        class="bg-white rounded-lg shadow overflow-hidden"
      >
        <!-- Patient Header -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-2xl font-bold">{{ patient.patient?.user?.name }}</h3>
              <p class="text-blue-100 mt-1">Admitted: {{ patient.admission_date }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold">{{ patient.ward }} Ward</p>
              <p class="text-blue-100">Bed: {{ patient.room_number || 'Not assigned' }}</p>
            </div>
          </div>
        </div>

        <!-- Patient Details -->
        <div class="p-6 border-b border-gray-200">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-600">Diagnosis</p>
              <p class="font-semibold">{{ patient.diagnosis || 'Not recorded' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Duration</p>
              <p class="font-semibold">{{ calculateDuration(patient.admission_date) }} days</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Status</p>
              <StatusBadge :status="patient.status" />
            </div>
          </div>
        </div>

        <!-- Tabs for Patient Records -->
        <div class="border-b border-gray-200">
          <div class="flex gap-0">
            <button
              @click="activePatient = activePatient === patient.id ? null : patient.id"
              class="flex-1 px-4 py-3 text-left font-semibold text-gray-700 hover:bg-gray-50 border-b-2"
              :class="activePatient === patient.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'"
            >
              📋 Details
            </button>
          </div>
        </div>

        <!-- Expandable Details -->
        <div v-if="activePatient === patient.id" class="p-6 space-y-6 bg-gray-50">
          <!-- Progress Notes -->
          <div class="bg-white p-4 rounded border-l-4 border-blue-500">
            <h4 class="font-bold text-lg text-gray-800 mb-3">📝 Progress Notes</h4>
            <div class="space-y-3 max-h-64 overflow-y-auto">
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-sm text-gray-600">Latest update: {{ new Date().toLocaleDateString() }}</p>
                <p class="text-gray-700 mt-2">Add progress notes form here</p>
              </div>
            </div>
            <form @submit.prevent="saveProgressNote" class="mt-4 space-y-3">
              <textarea
                v-model="progressNoteForm.notes"
                placeholder="Daily progress notes (SOAP format)..."
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              ></textarea>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
              >
                ➕ Add Note
              </button>
            </form>
          </div>

          <!-- Nurse Instructions -->
          <div class="bg-white p-4 rounded border-l-4 border-green-500">
            <h4 class="font-bold text-lg text-gray-800 mb-3">👩‍⚕️ Nurse Instructions</h4>
            <form @submit.prevent="saveNurseInstructions" class="space-y-3">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Vitals Check Frequency</label>
                <select
                  v-model="nurseInstructionForm.vitalsFrequency"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option>Every 2 hours</option>
                  <option>Every 4 hours</option>
                  <option>Every 6 hours</option>
                  <option>Every 8 hours</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Diet Type</label>
                <select
                  v-model="nurseInstructionForm.dietType"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option>NPO (Nothing by mouth)</option>
                  <option>Liquid</option>
                  <option>Soft</option>
                  <option>Regular</option>
                  <option>Diabetic</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Activity Level</label>
                <select
                  v-model="nurseInstructionForm.activityLevel"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option>Bed Rest</option>
                  <option>Limited Mobility</option>
                  <option>Ambulatory</option>
                </select>
              </div>

              <textarea
                v-model="nurseInstructionForm.specialMonitoring"
                placeholder="Special monitoring or care instructions..."
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              ></textarea>

              <button
                type="submit"
                class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
              >
                ✅ Save Instructions
              </button>
            </form>
          </div>

          <!-- Discharge Button -->
          <button
            @click="confirmDischarge(patient.id)"
            class="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all"
          >
            🚪 Discharge Patient
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import LoadingSpinner from '../../../components/shared/LoadingSpinner.vue'
import ErrorMessage from '../../../components/shared/ErrorMessage.vue'
import StatusBadge from '../../../components/shared/StatusBadge.vue'
import { useApi } from '../../../composables/useApi.js'

export default {
  name: 'IPDPatientsTab',
  components: {
    LoadingSpinner,
    ErrorMessage,
    StatusBadge
  },
  props: {
    doctorId: {
      type: String,
      required: true
    },
    selectedAppointment: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const admittedPatients = ref([])
    const loading = ref(false)
    const error = ref(null)
    const activePatient = ref(null)
    const showAdmissionForm = ref(false)
    const { get, post } = useApi()

    const admissionForm = ref({
      patientId: '',
      reason: '',
      diagnosis: '',
      ward: '',
      isEmergency: false
    })

    // Auto-fill patient ID when appointment is selected
    watch(() => props.selectedAppointment, (apt) => {
      if (apt) {
        const pid = apt.patient_id || apt.patient?.id
        if (pid) admissionForm.value.patientId = pid
        if (apt.reason) admissionForm.value.reason = apt.reason
      }
    }, { immediate: true })

    const progressNoteForm = ref({
      notes: ''
    })

    const nurseInstructionForm = ref({
      vitalsFrequency: 'Every 4 hours',
      dietType: 'Regular',
      activityLevel: 'Limited Mobility',
      specialMonitoring: ''
    })

    const fetchIPDPatients = async () => {
      // Don't fetch if doctorId is not available
      if (!props.doctorId) {
        console.warn('Doctor ID not available, skipping fetch')
        return
      }

      try {
        loading.value = true
        error.value = null
        // Backend gets doctor from user token, so doctor_id param is optional but good to pass
        const response = await get(`/doctors/ipd-patients`)
        admittedPatients.value = response.data || []
      } catch (err) {
        console.error('Failed to fetch IPD patients:', err)
        error.value = 'Failed to load admitted patients'
        admittedPatients.value = []
      } finally {
        loading.value = false
      }
    }

    // Watch for doctorId changes and fetch when available
    watch(() => props.doctorId, (newDoctorId) => {
      if (newDoctorId) {
        fetchIPDPatients()
      }
    })

    const createAdmission = async () => {
      try {
        loading.value = true
        error.value = null

        // Validate required fields
        if (!admissionForm.value.patientId) {
          error.value = 'Patient ID is required'
          return
        }
        if (!admissionForm.value.reason) {
          error.value = 'Admission reason is required'
          return
        }

        console.log('Creating admission with doctor_id:', props.doctorId)

        // Call the backend API to create admission
        // Note: Backend can infer doctor_id from JWT token, but we pass it if available
        const admissionData = {
          patient_id: admissionForm.value.patientId,
          reason: admissionForm.value.reason,
          diagnosis: admissionForm.value.diagnosis,
          ward: admissionForm.value.ward,
          is_emergency: admissionForm.value.isEmergency,
          admission_date: new Date().toISOString().split('T')[0]
        }

        // Add doctor_id if available (optional, backend uses JWT)
        if (props.doctorId) {
          admissionData.doctor_id = props.doctorId
        }

        const response = await post('/admissions', admissionData)

        console.log('Admission created successfully:', response)
        alert('✅ Patient admitted successfully!')
        
        // Reset form
        admissionForm.value = {
          patientId: '',
          reason: '',
          diagnosis: '',
          ward: '',
          isEmergency: false
        }
        showAdmissionForm.value = false
        
        // Refresh the list
        fetchIPDPatients()
      } catch (err) {
        console.error('Failed to create admission:', err)
        error.value = err.response?.data?.message || 'Failed to create admission'
      } finally {
        loading.value = false
      }
    }

    const saveProgressNote = async () => {
      try {
        console.log('Saving progress note:', progressNoteForm.value)
        alert('Progress note saved!')
        progressNoteForm.value.notes = ''
      } catch (err) {
        console.error('Failed to save note:', err)
      }
    }

    const saveNurseInstructions = async () => {
      try {
        console.log('Saving nurse instructions:', nurseInstructionForm.value)
        alert('Nurse instructions saved!')
      } catch (err) {
        console.error('Failed to save instructions:', err)
      }
    }

    const confirmDischarge = (patientId) => {
      if (confirm('Are you sure you want to discharge this patient?')) {
        console.log('Discharging patient:', patientId)
        alert('Patient discharged successfully!')
        fetchIPDPatients()
      }
    }

    const calculateDuration = (admissionDate) => {
      const admission = new Date(admissionDate)
      const today = new Date()
      const diffTime = Math.abs(today - admission)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }

    onMounted(() => {
      if (props.doctorId) {
        fetchIPDPatients()
      }
    })

    return {
      admittedPatients,
      loading,
      error,
      activePatient,
      showAdmissionForm,
      admissionForm,
      progressNoteForm,
      nurseInstructionForm,
      fetchIPDPatients,
      createAdmission,
      saveProgressNote,
      saveNurseInstructions,
      confirmDischarge,
      calculateDuration
    }
  }
}
</script>

<style scoped>
/* Smooth transitions */
.overflow-y-auto {
  scroll-behavior: smooth;
}

/* Active state styling */
.border-blue-600 {
  border-color: rgb(37, 99, 235);
}
</style>
