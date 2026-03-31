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
                <div class="flex gap-2">
                  <button
                    @click="viewPatientDetails(patient)"
                    class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-medium"
                  >
                    View
                  </button>
                  <button
                    @click="startEditPatient(patient)"
                    class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-xs font-medium"
                  >
                    Edit
                  </button>
                </div>
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

    <!-- Patient Edit Modal -->
    <div v-if="showEditModal && editingPatient" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 class="text-2xl font-bold text-gray-900">Edit Patient Information</h2>
          <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <form @submit.prevent="savePatientChanges" class="px-6 py-6 space-y-4">
          <!-- Error Message -->
          <div v-if="editError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ editError }}</p>
          </div>

          <!-- Personal Info Section -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <!-- First Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  v-model="editingPatient.user.first_name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Last Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  v-model="editingPatient.user.last_name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  v-model="editingPatient.user.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  v-model="editingPatient.user.phone"
                  type="tel"
                  maxlength="10"
                  @input="editingPatient.user.phone = editingPatient.user.phone.replace(/[^0-9]/g, '')"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Medical Info Section -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>

            <div class="grid grid-cols-2 gap-4">
              <!-- Date of Birth -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  v-model="editingPatient.date_of_birth"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Gender -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  v-model="editingPatient.gender"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Blood Group -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  v-model="editingPatient.blood_group"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <!-- Address -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                v-model="editingPatient.address"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              ></textarea>
            </div>

            <!-- Medical History -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
              <textarea
                v-model="editingPatient.medical_history"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              ></textarea>
            </div>

            <!-- Allergies -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
              <textarea
                v-model="editingPatient.allergies"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              ></textarea>
            </div>

            <!-- Emergency Contact -->
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                <input
                  v-model="editingPatient.emergency_contact_name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                <input
                  v-model="editingPatient.emergency_contact_phone"
                  type="tel"
                  maxlength="10"
                  @input="editingPatient.emergency_contact_phone = editingPatient.emergency_contact_phone.replace(/[^0-9]/g, '')"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </form>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            @click="closeEditModal"
            class="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium"
            :disabled="editSubmitting"
          >
            Cancel
          </button>
          <button
            @click="savePatientChanges"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            :disabled="editSubmitting"
          >
            <span v-if="!editSubmitting">💾 Save Changes</span>
            <span v-else>Saving...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { usePatientApi } from '@/composables/usePatientApi'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const api = useApi()
const { updatePatient } = usePatientApi()
const loading = ref(false)
const error = ref('')
const patients = ref([])
const totalPatients = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const showDetailsModal = ref(false)
const selectedPatient = ref(null)

// Edit modal state
const showEditModal = ref(false)
const editingPatient = ref(null)
const editError = ref('')
const editSubmitting = ref(false)

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

// Start editing patient
const startEditPatient = (patient) => {
  // Create a deep copy to avoid modifying the original
  editingPatient.value = JSON.parse(JSON.stringify(patient))
  editError.value = ''
  showEditModal.value = true
}

// Close edit modal
const closeEditModal = () => {
  showEditModal.value = false
  editingPatient.value = null
  editError.value = ''
}

// Save patient changes
const savePatientChanges = async () => {
  editSubmitting.value = true
  editError.value = ''

  try {
    // Prepare update data
    const updateData = {
      first_name: editingPatient.value.user.first_name,
      last_name: editingPatient.value.user.last_name,
      email: editingPatient.value.user.email,
      phone: editingPatient.value.user.phone,
      date_of_birth: editingPatient.value.date_of_birth,
      gender: editingPatient.value.gender,
      blood_group: editingPatient.value.blood_group,
      address: editingPatient.value.address,
      medical_history: editingPatient.value.medical_history,
      allergies: editingPatient.value.allergies,
      emergency_contact_name: editingPatient.value.emergency_contact_name,
      emergency_contact_phone: editingPatient.value.emergency_contact_phone,
    }

    // Call API to update patient
    await updatePatient(editingPatient.value.id, updateData)

    // Refresh the patient list
    await performSearch()

    // Close modal
    closeEditModal()
  } catch (err) {
    editError.value = err || 'Failed to save changes. Please try again.'
    console.error('Edit patient error:', err)
  } finally {
    editSubmitting.value = false
  }
}

// Load on mount
onMounted(() => {
  fetchPatients()
})
</script>
