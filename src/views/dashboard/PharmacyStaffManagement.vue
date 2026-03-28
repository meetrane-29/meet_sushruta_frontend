<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Pharmacy Staff Management</h1>
        <p class="text-gray-600 mt-1">View and manage all pharmacy staff in the system</p>
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

    <!-- Staff Grid -->
    <div v-if="!loading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="staff in filteredStaff"
        :key="staff.id"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
      >
        <!-- Avatar -->
        <div class="h-40 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-5xl">
          💊
        </div>

        <!-- Info -->
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900">{{ staff.first_name }} {{ staff.last_name }}</h3>
          <p class="text-amber-600 font-medium mt-1">{{ staff.email }}</p>
          <p class="text-sm text-gray-600 mt-1">{{ staff.phone }}</p>

          <!-- Employment & Attendance -->
          <div class="mt-3 space-y-1 text-sm">
            <p class="text-gray-700"><span class="font-medium">Joining Date:</span> {{ formatDate(staff.joining_date || staff.created_at) }}</p>
            <p class="text-gray-700"><span class="font-medium">Salary:</span> {{ formatCurrency(staff.salary || staff.monthly_salary) }}</p>
            <p class="text-gray-700"><span class="font-medium">Shift Timings:</span> {{ formatShift(staff.shift_timing || staff.shift || staff.shift_timings) }}</p>
            <p class="text-gray-700"><span class="font-medium">Attendance:</span> {{ formatAttendance(staff.attendance_percentage || staff.attendance_rate || staff.attendance) }}</p>
            <p class="text-gray-700"><span class="font-medium">Leave Records:</span> {{ formatLeaveRecords(staff.leave_records || staff.leaves || staff.leave_count || staff.leave_balance) }}</p>
          </div>
          
          <!-- Status Badge -->
          <div class="mt-4">
            <span
              :class="{
                'bg-green-100 text-green-800': staff.active,
                'bg-gray-100 text-gray-800': !staff.active
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ staff.active ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 flex gap-2">
            <button
              @click="viewStaffDetails(staff)"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              View
            </button>
            <button
              @click="deleteStaff(staff.id)"
              class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredStaff.length === 0" class="col-span-full py-12 text-center text-gray-600">
        <p class="text-lg">No pharmacy staff found</p>
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

const filteredStaff = computed(() => {
  return staff.value.filter(s => {
    const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase()
    const email = (s.email || '').toLowerCase()
    const search = searchQuery.value.toLowerCase()
    return name.includes(search) || email.includes(search)
  })
})

const activeStaff = computed(() => {
  return staff.value.filter(s => s.active).length
})

const formatDate = (timestamp) => {
  if (!timestamp) return 'Not set'

  const date = new Date(Number(timestamp))
  if (Number.isNaN(date.getTime())) return 'Not set'

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (!value || Number.isNaN(numeric)) return 'Not set'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numeric)
}

const formatShift = (value) => {
  if (!value) return 'Not set'
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const formatAttendance = (value) => {
  if (value === null || value === undefined || value === '') return 'Not set'

  const numeric = Number(value)
  if (!Number.isNaN(numeric)) {
    return `${numeric}%`
  }

  return String(value)
}

const formatLeaveRecords = (value) => {
  if (value === null || value === undefined || value === '') return 'Not set'
  if (Array.isArray(value)) return `${value.length} record(s)`
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const refreshData = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/users?role=pharmacy')
    // Extract array from nested data structure
    const data = response.data.data?.data || response.data.data || response.data || []
    staff.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load pharmacy staff. Please try again.'
    console.error('Staff fetch error:', err)
  } finally {
    loading.value = false
  }
}

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

const closeModal = () => {
  showModal.value = false
  selectedStaff.value = null
}

const updateStaff = async () => {
  if (!selectedStaff.value) return

  try {
    const response = await api.patch(`/users/${selectedStaff.value.id}`, editForm.value)
    const index = staff.value.findIndex(s => s.id === selectedStaff.value.id)
    if (index !== -1) {
      staff.value[index] = response.data.data || response.data
    }
    closeModal()
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update staff'
    console.error('Update error:', err)
  }
}

onMounted(() => {
  refreshData()
})
</script>
