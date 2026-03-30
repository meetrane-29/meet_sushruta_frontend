<template>
  <div class="patient-search">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Search Existing Patient</h2>

      <!-- Search Form -->
      <div class="bg-gray-50 p-6 rounded-lg mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search by</label>
            <select
              v-model="searchType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              @change="clearSearch"
            >
              <option value="phone">Phone Number</option>
              <option value="email">Email</option>
              <option value="uhid">UHID</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ searchPlaceholder }}</label>
            <div class="flex gap-2">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                @keyup.enter="searchPatients"
              />
              <button
                @click="searchPatients"
                :disabled="isLoading || !searchQuery"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <span v-if="!isLoading">🔍 Search</span>
                <span v-else>Searching...</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="space-y-4">
        <h3 class="text-lg font-bold text-gray-800 mb-4">{{ searchResults.length }} Results Found</h3>

        <div
          v-for="patient in searchResults"
          :key="patient.id"
          class="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
          @click="selectPatient(patient)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-bold text-gray-800">
                {{ patient.user ? patient.user.first_name + ' ' + patient.user.last_name : 'N/A' }}
              </h4>
              <p class="text-sm text-gray-600">
                📞 {{ patient.user ? patient.user.phone : 'N/A' }}
              </p>
              <p class="text-sm text-gray-600">
                📧 {{ patient.user ? patient.user.email : 'N/A' }}
              </p>
              <p class="text-xs text-gray-500 mt-2">
                DOB: {{ patient.date_of_birth || 'N/A' }} | Blood: {{ patient.blood_group || 'N/A' }}
              </p>
            </div>
            <button
              @click.stop="selectPatient(patient)"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select
            </button>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="searchTried && !isLoading && searchResults.length === 0" class="bg-yellow-50 p-6 rounded-lg text-center">
        <p class="text-yellow-800 font-medium">No patients found matching your search</p>
        <p class="text-sm text-yellow-700 mt-1">Try registering a new patient</p>
      </div>

      <!-- Selected Patient Details -->
      <div v-if="selectedPatient" class="mt-8 border-t pt-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Selected Patient Details</h3>

        <div class="grid grid-cols-2 gap-6">
          <!-- Patient Info -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <h4 class="font-bold text-gray-800 mb-3">Personal Information</h4>
            <div class="space-y-2 text-sm">
              <p><span class="font-medium">Name:</span> {{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</p>
              <p><span class="font-medium">Phone:</span> {{ selectedPatient.user?.phone }}</p>
              <p><span class="font-medium">Email:</span> {{ selectedPatient.user?.email }}</p>
              <p><span class="font-medium">DOB:</span> {{ selectedPatient.date_of_birth }}</p>
              <p><span class="font-medium">Gender:</span> {{ selectedPatient.gender }}</p>
              <p><span class="font-medium">Address:</span> {{ selectedPatient.address }}</p>
            </div>
          </div>

          <!-- Medical Info -->
          <div class="bg-green-50 p-4 rounded-lg">
            <h4 class="font-bold text-gray-800 mb-3">Medical Information</h4>
            <div class="space-y-2 text-sm">
              <p><span class="font-medium">Blood Group:</span> {{ selectedPatient.blood_group || 'N/A' }}</p>
              <p><span class="font-medium">Allergies:</span> {{ selectedPatient.allergies || 'None' }}</p>
              <p><span class="font-medium">Medical History:</span></p>
              <p class="text-xs bg-white p-2 rounded">{{ selectedPatient.medical_history || 'No history' }}</p>
            </div>
          </div>
        </div>

        <!-- UHID Display -->
        <div v-if="patientUHID" class="mt-6 bg-purple-50 p-4 rounded-lg">
          <h4 class="font-bold text-gray-800 mb-3">UHID Information</h4>
          <p class="text-2xl font-bold text-purple-600">{{ patientUHID }}</p>
          <p class="text-sm text-gray-600 mt-2">Unique Hospital ID for {{ selectedPatient.user?.first_name }}</p>
        </div>

        <!-- Insurance Policy -->
        <div v-if="insurancePolicies.length > 0" class="mt-6 bg-orange-50 p-4 rounded-lg">
          <h4 class="font-bold text-gray-800 mb-3">Insurance Policy</h4>
          <div v-for="policy in insurancePolicies" :key="policy.id" class="space-y-2 text-sm bg-white p-3 rounded mb-2">
            <p><span class="font-medium">Provider:</span> {{ policy.provider_name }}</p>
            <p><span class="font-medium">Policy Number:</span> {{ policy.policy_number }}</p>
            <p><span class="font-medium">Coverage:</span> ₹{{ policy.coverage_amount }}</p>
            <p><span class="font-medium">Valid Until:</span> {{ policy.valid_upto }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex gap-4">
          <button
            @click="bookAppointment"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            📅 Book Appointment
          </button>
          <button
            @click="proceedToBilling"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            💰 Proceed to Billing
          </button>
          <button
            @click="selectedPatient = null"
            class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            ✕ Clear
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
        <p class="font-medium">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePatientApi } from '@/composables/usePatientApi'
import { useOPDApi } from '@/composables/useOPDApi'

const searchType = ref('phone')
const searchQuery = ref('')
const searchResults = ref([])
const selectedPatient = ref(null)
const patientUHID = ref('')
const insurancePolicies = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchTried = ref(false)

const patientApi = usePatientApi()
const opdApi = useOPDApi()

const searchPlaceholder = computed(() => {
  const placeholders = {
    phone: 'Enter phone number',
    email: 'Enter email address',
    uhid: 'Enter UHID (e.g., MS-2026-00001)',
    name: 'Enter patient name'
  }
  return placeholders[searchType.value]
})

const searchPatients = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    searchResults.value = []
    searchTried.value = true

    // This should use your patient API with search functionality
    // For now, we'll use getAllPatients and filter
    const result = await patientApi.getAllPatients()
    
    if (result && result.data && result.data.patients) {
      searchResults.value = filterPatients(result.data.patients)
    }
  } catch (error) {
    errorMessage.value = 'Error searching patients'
    console.error('Search error:', error)
  } finally {
    isLoading.value = false
  }
}

const filterPatients = (patients) => {
  return patients.filter(patient => {
    const query = searchQuery.value.toLowerCase()
    
    switch (searchType.value) {
      case 'phone':
        return patient.user?.phone?.includes(query)
      case 'email':
        return patient.user?.email?.toLowerCase().includes(query)
      case 'uhid':
        return patient.id?.toLowerCase().includes(query)
      case 'name':
        return (
          patient.user?.first_name?.toLowerCase().includes(query) ||
          patient.user?.last_name?.toLowerCase().includes(query)
        )
      default:
        return false
    }
  })
}

const selectPatient = async (patient) => {
  selectedPatient.value = patient
  errorMessage.value = ''
  
  try {
    // Get UHID for this patient
    const uhidResult = await opdApi.getUHIDByPatient(patient.id)
    if (uhidResult && uhidResult.data) {
      patientUHID.value = uhidResult.data.uhid
    }

    // Get insurance policies
    const insuranceResult = await opdApi.getPatientInsurancePolicies(patient.id)
    if (insuranceResult && insuranceResult.data) {
      insurancePolicies.value = insuranceResult.data
    }
  } catch (error) {
    console.error('Error fetching patient details:', error)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchTried.value = false
}

const bookAppointment = () => {
  // This would navigate or emit event to appointment booking tab
  console.log('Book appointment for patient:', selectedPatient.value)
}

const proceedToBilling = () => {
  // This would navigate to billing tab
  console.log('Proceed to billing for patient:', selectedPatient.value)
}
</script>

<style scoped>
.patient-search {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
