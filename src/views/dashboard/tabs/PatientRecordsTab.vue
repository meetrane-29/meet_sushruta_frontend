<template>
  <div class="space-y-6">
    <!-- Search Bar -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          @keyup.enter="searchPatients"
          type="text"
          placeholder="Search patient by name or ID..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          @click="searchPatients"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
        >
          🔍 Search
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <LoadingSpinner />
      <p class="text-gray-600 mt-2">Loading patient records...</p>
    </div>

    <!-- Error State -->
    <ErrorMessage v-if="error" :message="error" @retry="searchPatients" />

    <!-- Patient Records -->
    <div v-if="!loading && !error && patient" class="bg-white rounded-lg shadow p-6 space-y-6">
      <!-- Patient Info -->
      <div class="border-b border-gray-200 pb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">👤 {{ patient.user?.name }}</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-sm text-gray-600">Age</p>
            <p class="font-semibold text-lg">{{ patient.age }} years</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Blood Type</p>
            <p class="font-semibold text-lg">{{ patient.blood_group || 'Not specified' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Phone</p>
            <p class="font-semibold text-lg">{{ patient.phone || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Email</p>
            <p class="font-semibold text-lg">{{ patient.user?.email || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- Allergies (Warning) -->
      <div v-if="patient.allergies" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p class="font-bold text-red-800">⚠️ ALLERGIES</p>
        <p class="text-red-700 mt-2">{{ patient.allergies }}</p>
      </div>

      <!-- Chronic Conditions (Caution) -->
      <div v-if="patient.chronic_conditions" class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <p class="font-bold text-yellow-800">ℹ️ CHRONIC CONDITIONS</p>
        <p class="text-yellow-700 mt-2">{{ patient.chronic_conditions }}</p>
      </div>

      <!-- Medical History -->
      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-3">📜 Medical History</h3>
        <p class="text-gray-700 leading-relaxed">{{ patient.medical_history || 'No medical history recorded' }}</p>
      </div>

      <!-- Emergency Contact -->
      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-3">🆘 Emergency Contact</h3>
        <p class="text-gray-700">{{ patient.emergency_contact || 'Not specified' }}</p>
      </div>
    </div>

    <!-- No Patient Selected -->
    <div v-if="!loading && !error && !patient" class="bg-white p-8 rounded-lg shadow text-center">
      <p class="text-gray-500 text-lg">Search for a patient to view their medical records</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoadingSpinner from '../../../components/shared/LoadingSpinner.vue'
import ErrorMessage from '../../../components/shared/ErrorMessage.vue'
import { usePatientApi } from '../../../composables/usePatientApi.js'

const props = defineProps({
  doctorId: {
    type: String,
    required: true
  }
})

const searchQuery = ref('')
const patient = ref(null)
const error = ref(null)

const { loading, fetchPatientById, fetchPatients } = usePatientApi()

// Search for patient by name or ID
const searchPatients = async () => {
  if (!searchQuery.value.trim()) {
    error.value = 'Please enter a patient name or ID'
    return
  }

  try {
    error.value = null
    patient.value = null

    // Try to fetch as patient ID first (assuming it's a UUID or ID format)
    const searchTerm = searchQuery.value.trim()
    
    try {
      // First try as ID
      patient.value = await fetchPatientById(searchTerm)
    } catch (idErr) {
      // If ID search fails, try searching by name
      try {
        const results = await fetchPatients(1, 10, searchTerm)
        if (results.patients && results.patients.length > 0) {
          patient.value = results.patients[0]
        } else {
          error.value = 'No patient found matching your search'
        }
      } catch (nameErr) {
        error.value = 'Failed to search patients'
        console.error('[PatientRecordsTab] Search error:', nameErr)
      }
    }
  } catch (err) {
    console.error('[PatientRecordsTab] Failed to search patients:', err)
    error.value = 'Failed to search patients. Please try again.'
  }
}

defineExpose({
  searchPatients
})
</script>

<style scoped>
/* Smooth animations */
input {
  transition: all 0.3s ease;
}

input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
