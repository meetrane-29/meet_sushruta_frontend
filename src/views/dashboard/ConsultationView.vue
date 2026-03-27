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
      <h2 class="text-xl font-bold text-gray-900 mb-4">Latest Vitals</h2>
      <div v-if="vitals" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Temperature</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ vitals.temperature }}°F</p>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const route = useRoute()
const api = useApi()
const appointmentId = route.params.appointmentId

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

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    const [appointmentRes, vitalsRes] = await Promise.all([
      api.get(`/appointment/${appointmentId}`),
      api.get(`/appointment/${appointmentId}/vitals`)
    ])

    appointment.value = appointmentRes.data.data || {}
    vitals.value = vitalsRes.data.data || null
  } catch (err) {
    error.value = 'Failed to load consultation data. Please try again.'
    console.error('Failed to load consultation data:', err)
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
    await api.post(`/appointment/${appointmentId}/consultation`, {
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

onMounted(() => {
  loadData()
})
</script>
