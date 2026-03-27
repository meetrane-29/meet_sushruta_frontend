<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Lab Dashboard</h1>
        <p class="text-gray-600 mt-1">Manage lab orders and test reports</p>
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

    <!-- Lab Orders Table -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 p-6">
        <h2 class="text-2xl font-bold text-gray-900">Lab Orders</h2>
      </div>

      <div v-if="labOrders.length === 0" class="p-8 text-center text-gray-600">
        <p class="text-lg">No lab orders available</p>
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient Name</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Test Type</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Doctor</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="order in labOrders" :key="order.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-gray-900 font-medium">{{ order.id }}</td>
            <td class="px-6 py-4 text-gray-900">{{ order.patient?.name || 'Patient' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ order.testType || order.test_type || '--' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ order.doctor?.name || 'Unknown' }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(order.createdAt || order.created_at) }}</td>
            <td class="px-6 py-4">
              <StatusBadge :status="order.status" />
            </td>
            <td class="px-6 py-4">
              <button
                @click="openStatusModal(order)"
                :disabled="isUpdatingId === order.id"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isUpdatingId === order.id ? 'Updating...' : 'Update Status' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Status Update Modal -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-sm w-full p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Update Status</h2>
        <p class="text-gray-600 mb-6">Order ID: <span class="font-medium">{{ selectedOrder.id }}</span></p>

        <div class="space-y-3 mb-6">
          <button
            @click="updateOrderStatus(selectedOrder.id, 'in_progress')"
            :disabled="isUpdatingId === selectedOrder.id"
            class="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isUpdatingId === selectedOrder.id ? 'Updating...' : 'In Progress' }}
          </button>
          <button
            @click="updateOrderStatus(selectedOrder.id, 'completed')"
            :disabled="isUpdatingId === selectedOrder.id"
            class="w-full px-4 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isUpdatingId === selectedOrder.id ? 'Updating...' : 'Completed' }}
          </button>
        </div>

        <button
          @click="showStatusModal = false"
          class="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const api = useApi()
const labOrders = ref([])
const showStatusModal = ref(false)
const isUpdatingId = ref(null)
const selectedOrder = ref({})
const loading = ref(false)
const error = ref('')

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

const openStatusModal = (order) => {
  selectedOrder.value = order
  showStatusModal.value = true
}

const updateOrderStatus = async (orderId, status) => {
  isUpdatingId.value = orderId
  try {
    await api.patch(`/lab/orders/${orderId}/status`, { status })
    showStatusModal.value = false
    loadData()
  } catch (err) {
    console.error('Failed to update order status:', err)
    error.value = 'Failed to update status. Please try again.'
  } finally {
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
