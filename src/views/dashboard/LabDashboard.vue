<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Lab Dashboard</h1>
        <p class="text-gray-600 mt-1">Manage lab orders, tests and reports</p>
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

    <!-- Tabs -->
    <div v-if="!loading && !error" class="flex gap-4 border-b border-gray-200">
      <button
        @click="activeTab = 'orders'"
        :class="activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'"
        class="px-4 py-2 font-medium transition"
      >
        Lab Orders
      </button>
      <button
        @click="activeTab = 'completed'"
        :class="activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'"
        class="px-4 py-2 font-medium transition"
      >
        Completed Tests
      </button>
    </div>

    <!-- Stats -->
    <div v-if="!loading && !error" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Total Orders</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ labOrders.length }}</p>
          </div>
          <span class="text-4xl">📊</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Pending</p>
            <p class="text-3xl font-bold text-yellow-600 mt-2">
              {{ labOrders.filter((o) => o.status === 'pending').length }}
            </p>
          </div>
          <span class="text-4xl">⏳</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">In Progress</p>
            <p class="text-3xl font-bold text-blue-600 mt-2">
              {{ labOrders.filter((o) => o.status === 'in_progress').length }}
            </p>
          </div>
          <span class="text-4xl">🔬</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Completed</p>
            <p class="text-3xl font-bold text-green-600 mt-2">
              {{ labOrders.filter((o) => o.status === 'completed').length }}
            </p>
          </div>
          <span class="text-4xl">✅</span>
        </div>
      </div>
    </div>

    <!-- Lab Orders Tab -->
    <div v-if="!loading && !error && activeTab === 'orders'" class="space-y-6">
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by patient name or order ID..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <select
          v-model="orderStatusFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="border-b border-gray-200 p-6">
          <h2 class="text-2xl font-bold text-gray-900">Lab Orders</h2>
        </div>

        <div v-if="filteredOrders.length === 0" class="p-8 text-center text-gray-600">
          <p class="text-lg">No lab orders available</p>
        </div>

        <table v-else class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Test Type</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Doctor</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 text-gray-900 font-medium">{{ order.id }}</td>
              <td class="px-6 py-4 text-gray-900">{{ order.patient?.name || 'Patient' }}</td>
              <td class="px-6 py-4 text-gray-600 text-sm">{{ order.testType || order.test_type || '--' }}</td>
              <td class="px-6 py-4 text-gray-600 text-sm">{{ order.doctor?.name || 'Unknown' }}</td>
              <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(order.createdAt || order.created_at) }}</td>
              <td class="px-6 py-4">
                <span
                  :class="
                    order.priority === 'urgent'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  "
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {{ order.priority || 'normal' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <StatusBadge :status="order.status" />
              </td>
              <td class="px-6 py-4">
                <button
                  v-if="order.status !== 'completed'"
                  @click="openResultModal(order)"
                  :disabled="isUpdatingId === order.id"
                  class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isUpdatingId === order.id ? 'Processing...' : 'Add Result' }}
                </button>
                <span v-else class="text-gray-500 text-sm">--</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Completed Tests Tab -->
    <div v-if="!loading && !error && activeTab === 'completed'" class="space-y-6">
      <div class="flex gap-4">
        <input
          v-model="completedSearch"
          type="text"
          placeholder="Search completed tests..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="order in completedTests"
          :key="order.id"
          class="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ order.patient?.name }}</h3>
            <p class="text-sm text-gray-600">Test: {{ order.testType || order.test_type }}</p>
          </div>

          <div class="space-y-2 text-sm mb-4">
            <p><span class="text-gray-600">Doctor:</span> <span class="font-medium">{{ order.doctor?.name }}</span></p>
            <p><span class="text-gray-600">Date:</span> <span class="font-medium">{{ formatDate(order.createdAt || order.created_at) }}</span></p>
            <p><span class="text-gray-600">Result:</span> <span class="font-medium">{{ order.report_url ? '📎 Available' : 'Pending' }}</span></p>
          </div>

          <div v-if="order.report_url" class="flex gap-2">
            <a
              :href="order.report_url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition text-center"
            >
              View Report
            </a>
          </div>
        </div>
      </div>

      <div v-if="completedTests.length === 0" class="p-8 text-center text-gray-600 bg-white rounded-lg">
        <p class="text-lg">No completed tests available</p>
      </div>
    </div>

    <!-- Result Upload Modal -->
    <div v-if="showResultModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Enter Test Result</h2>
          <button @click="showResultModal = false" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-600">Patient: <span class="font-semibold">{{ selectedOrder.patient?.name }}</span></p>
          <p class="text-sm text-gray-600">Test Type: <span class="font-semibold">{{ selectedOrder.testType || selectedOrder.test_type }}</span></p>
          <p class="text-sm text-gray-600">Doctor: <span class="font-semibold">{{ selectedOrder.doctor?.name }}</span></p>
        </div>

        <form @submit.prevent="submitResult" class="space-y-4">
          <!-- Status Update -->
          <div v-if="selectedOrder.status === 'pending'" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <label class="block text-sm font-medium text-gray-900 mb-2">Test Status</label>
            <select
              v-model="resultForm.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <!-- Result Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Test Result Summary <span class="text-red-500">*</span></label>
            <textarea
              v-model="resultForm.result"
              placeholder="Enter test result details..."
              rows="5"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
            <p class="text-xs text-gray-600 mt-1">Include findings, values, and observations</p>
          </div>

          <!-- Report URL -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Report URL (Optional)</label>
            <input
              v-model="resultForm.reportUrl"
              type="url"
              placeholder="https://example.com/report.pdf"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p class="text-xs text-gray-600 mt-1">Link to download the complete test report</p>
          </div>

          <!-- Additional Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Clinical Notes</label>
            <textarea
              v-model="resultForm.notes"
              placeholder="Any additional clinical notes..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="showResultModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Result' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const api = useApi()
const labOrders = ref([])
const showResultModal = ref(false)
const isUpdatingId = ref(null)
const isSubmitting = ref(false)
const selectedOrder = ref({})
const loading = ref(false)
const error = ref('')
const activeTab = ref('orders')
const searchQuery = ref('')
const completedSearch = ref('')
const orderStatusFilter = ref('')

const resultForm = ref({
  status: 'completed',
  result: '',
  reportUrl: '',
  notes: ''
})

const filteredOrders = computed(() => {
  return labOrders.value.filter((order) => {
    const matchesSearch =
      !searchQuery.value ||
      order.id.toString().includes(searchQuery.value) ||
      order.patient?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !orderStatusFilter.value || order.status === orderStatusFilter.value
    return matchesSearch && matchesStatus && order.status !== 'completed'
  })
})

const completedTests = computed(() => {
  return labOrders.value.filter((order) => {
    const matchesSearch =
      !completedSearch.value ||
      order.patient?.name?.toLowerCase().includes(completedSearch.value.toLowerCase())
    return matchesSearch && order.status === 'completed'
  })
})

const formatDate = (dateString) => {
  if (!dateString) return '--'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/lab/orders')
    labOrders.value = res.data.data || res.data.orders || []
  } catch (err) {
    console.error('Failed to load lab orders:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

const openResultModal = (order) => {
  selectedOrder.value = order
  resultForm.value = {
    status: 'completed',
    result: '',
    reportUrl: '',
    notes: ''
  }
  showResultModal.value = true
}

const submitResult = async () => {
  if (!resultForm.value.result) {
    alert('Please enter test result details')
    return
  }

  isUpdatingId.value = selectedOrder.value.id
  isSubmitting.value = true
  try {
    await api.patch(`/lab/orders/${selectedOrder.value.id}`, {
      status: resultForm.value.status,
      result: resultForm.value.result,
      report_url: resultForm.value.reportUrl,
      notes: resultForm.value.notes
    })
    alert('Test result saved successfully!')
    showResultModal.value = false
    loadData()
  } catch (err) {
    console.error('Failed to save result:', err)
    error.value = 'Failed to save result. Please try again.'
  } finally {
    isSubmitting.value = false
    isUpdatingId.value = null
  }
}

const refreshData = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
