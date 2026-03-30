<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Lab Staff Management</h1>
        <p class="text-gray-600 mt-1">View and manage all lab staff in the system</p>
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

    <!-- Search -->
    <div v-if="!loading && !error" class="flex flex-col md:flex-row gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or email..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Staff Table -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div v-if="filteredStaff.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="member in filteredStaff" :key="member.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900">{{ member.first_name }} {{ member.last_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ member.email }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ member.phone }}</td>
              <td class="px-6 py-4 text-sm">
                <span
                  :class="{
                    'bg-green-100 text-green-800': member.active,
                    'bg-gray-100 text-gray-800': !member.active
                  }"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ member.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm flex gap-2">
                <button
                  @click="viewStaffDetails(member)"
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                >
                  View
                </button>
                <button
                  @click="deleteStaff(member.id)"
                  class="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-xs font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="py-12 text-center text-gray-600">
        <p class="text-lg">No lab staff found</p>
      </div>
    </div>
    <!-- Stats -->
    <div v-if="!loading && !error && staff.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Total Staff</p>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ staff.length }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Active Staff</p>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ activeStaff }}</p>
      </div>
    </div>

    <!-- Staff Details Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div class="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Staff Details</h2>
            <button
              @click="closeModal"
              class="text-gray-600 hover:text-gray-900 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">First Name</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedStaff?.first_name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Last Name</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedStaff?.last_name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Email</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedStaff?.email }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Phone</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedStaff?.phone }}</p>
            </div>
          </div>

          <!-- HR Fields -->
          <div class="border-t border-gray-200 pt-4 mt-4">
            <h4 class="font-semibold text-gray-900 mb-4">Employment & Attendance</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600">Joining Date (timestamp)</label>
                <input
                  v-model.number="editForm.joining_date"
                  type="number"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="text-sm text-gray-600">Salary (₹)</label>
                <input
                  v-model.number="editForm.salary"
                  type="number"
                  step="0.01"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="text-sm text-gray-600">Attendance %</label>
                <input
                  v-model.number="editForm.attendance_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="text-sm text-gray-600">Leave Balance (days)</label>
                <input
                  v-model.number="editForm.leave_balance"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button
              @click="updateStaff"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Save Changes
            </button>
            <button
              @click="closeModal"
              class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Close
            </button>
          </div>
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
const staff = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const showModal = ref(false)
const selectedStaff = ref(null)

const editForm = ref({
  joining_date: 0,
  salary: 0,
  attendance_percentage: 0,
  leave_balance: 0
})

// Filter staff by name or email
const filteredStaff = computed(() => {
  return staff.value.filter(member => {
    const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase()
    const email = (member.email || '').toLowerCase()
    const query = searchQuery.value.toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })
})

// Count active staff
const activeStaff = computed(() => {
  return staff.value.filter(s => s.active).length
})

// Fetch all lab staff
const fetchLabStaff = async () => {
  loading.value = true
  error.value = ''

  try {
    // Call API to get lab staff
    const response = await api.get('/users?role=lab')
    
    // Extract staff array from response
    const data = response.data?.data || []
    staff.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load lab staff. Please try again.'
    console.error('Error fetching lab staff:', {
      status: err.response?.status,
      message: err.response?.data?.message,
      error: err.response?.data?.error,
      fullError: err
    })
  } finally {
    loading.value = false
  }
}

// Refresh data
const refreshData = () => {
  fetchLabStaff()
}

// Delete staff member
const deleteStaff = async (staffId) => {
  if (!confirm('Are you sure you want to delete this staff member?')) {
    return
  }

  try {
    await api.delete(`/users/${staffId}`)
    staff.value = staff.value.filter(s => s.id !== staffId)
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete staff'
    console.error('Delete error:', err)
  }
}

// View staff details
const viewStaffDetails = (member) => {
  selectedStaff.value = member
  editForm.value = {
    joining_date: member.joining_date || 0,
    salary: member.salary || 0,
    attendance_percentage: member.attendance_percentage || 0,
    leave_balance: member.leave_balance || 0
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  selectedStaff.value = null
}

// Update staff information
const updateStaff = async () => {
  if (!selectedStaff.value) return

  try {
    const response = await api.patch(`/users/${selectedStaff.value.id}`, editForm.value)
    const index = staff.value.findIndex(s => s.id === selectedStaff.value.id)
    if (index !== -1) {
      staff.value[index] = response.data?.data || response.data
    }
    closeModal()
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update staff'
    console.error('Update error:', err)
  }
}

// Load staff on component mount
onMounted(() => {
  fetchLabStaff()
})
</script>
