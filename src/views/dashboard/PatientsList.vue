<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Patients Management</h1>
        <p class="text-gray-600 mt-1">View and manage all patients in the system</p>
      </div>
      <button
        @click="refreshData"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Loading...' : '🔄 Refresh' }}
      </button>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, or phone..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="performSearch"
          />
        </div>
        <button
          @click="performSearch"
          :disabled="loading"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <ErrorMessage 
      v-if="error && !loading" 
      :message="error" 
      @retry="refreshData" 
    />

    <!-- Patients Table -->
    <div v-if="!loading && !error" class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">All Patients ({{ totalPatients }})</h2>
      </div>

      <!-- Table -->
      <div v-if="patients.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Gender</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Blood Group</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Registered</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr 
              v-for="patient in patients" 
              :key="patient.id"
              class="hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                {{ patient.id.substring(0, 8) }}...
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ patient.user?.first_name }} {{ patient.user?.last_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ patient.user?.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ patient.user?.phone }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ patient.gender || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span v-if="patient.blood_group" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {{ patient.blood_group }}
                </span>
                <span v-else class="text-gray-500">N/A</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDate(patient.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="viewPatientDetails(patient)"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="px-6 py-12 text-center">
        <p class="text-gray-500 text-lg">No patients found</p>
      </div>

      <!-- Pagination -->
      <div v-if="patients.length > 0" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Showing <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> to 
          <span class="font-medium">{{ Math.min(currentPage * pageSize, totalPatients) }}</span> of 
          <span class="font-medium">{{ totalPatients }}</span> results
        </div>
        <div class="flex gap-2">
          <button
            @click="previousPage"
            :disabled="currentPage === 1 || loading"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition',
              page === currentPage 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages || loading"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- Patient Details Modal -->
    <div v-if="showDetailsModal && selectedPatient" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 class="text-2xl font-bold text-gray-900">Patient Details</h2>
          <button @click="showDetailsModal = false" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <div class="px-6 py-6 space-y-4">
          <!-- Personal Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-600">First Name</p>
              <p class="text-gray-900">{{ selectedPatient.user?.first_name }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Last Name</p>
              <p class="text-gray-900">{{ selectedPatient.user?.last_name }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Email</p>
              <p class="text-gray-900">{{ selectedPatient.user?.email }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Phone</p>
              <p class="text-gray-900">{{ selectedPatient.user?.phone }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Gender</p>
              <p class="text-gray-900">{{ selectedPatient.gender || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Blood Group</p>
              <p class="text-gray-900">{{ selectedPatient.blood_group || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Date of Birth</p>
              <p class="text-gray-900">{{ selectedPatient.date_of_birth || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Registered On</p>
              <p class="text-gray-900">{{ formatDate(selectedPatient.created_at) }}</p>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="border-t border-gray-200 pt-4 space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-600">Address</p>
              <p class="text-gray-900">{{ selectedPatient.address || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Emergency Contact</p>
              <p class="text-gray-900">{{ selectedPatient.emergency_contact || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Medical History</p>
              <p class="text-gray-900 whitespace-pre-wrap">{{ selectedPatient.medical_history || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Allergies</p>
              <p class="text-gray-900 whitespace-pre-wrap">{{ selectedPatient.allergies || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            @click="showDetailsModal = false"
            class="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const api = useApi()
const loading = ref(false)
const error = ref('')
const patients = ref([])
const totalPatients = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const showDetailsModal = ref(false)
const selectedPatient = ref(null)

const totalPages = computed(() => Math.ceil(totalPatients.value / pageSize.value))

// Format timestamp to readable date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fetch patients data
const fetchPatients = async (page = 1, search = '') => {
  loading.value = true
  error.value = ''
  try {
    const params = {
      page: page,
      limit: pageSize.value
    }
    if (search) {
      params.search = search
    }

    const response = await api.get('/patients', { params })
    patients.value = response.data.data?.patients || []
    totalPatients.value = response.data.data?.total || 0
    currentPage.value = page
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load patients. Please try again.'
    console.error('Patients fetch error:', err)
  } finally {
    loading.value = false
  }
}

// Perform search
const performSearch = () => {
  currentPage.value = 1
  fetchPatients(1, searchQuery.value)
}

// Refresh data
const refreshData = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchPatients(1)
}

// Pagination
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchPatients(currentPage.value + 1, searchQuery.value)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    fetchPatients(currentPage.value - 1, searchQuery.value)
  }
}

const goToPage = (page) => {
  fetchPatients(page, searchQuery.value)
}

// View patient details
const viewPatientDetails = (patient) => {
  selectedPatient.value = patient
  showDetailsModal.value = true
}

// Load on mount
onMounted(() => {
  fetchPatients()
})
</script>
