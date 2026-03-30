<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">📦 Stock Management</h1>
          <p class="text-gray-600 mt-2">Add or remove stock, track stock history</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 border-b border-gray-200 mb-6 bg-white p-4 rounded-lg">
      <button
        @click="activeTab = 'adjust'"
        :class="activeTab === 'adjust' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600'"
        class="px-6 py-2 transition"
      >
        ➕ Adjust Stock
      </button>
      <button
        @click="activeTab = 'history'"
        :class="activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600'"
        class="px-6 py-2 transition"
      >
        📜 Stock History
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-800 flex items-center">
        <span class="mr-2">⚠️</span>
        {{ error }}
      </p>
    </div>

    <!-- Tab Content: Adjust Stock -->
    <div v-if="activeTab === 'adjust'" class="space-y-6">
      <!-- Quick Stock Adjustment Form -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Quick Stock Adjustment</h2>
        <form @submit.prevent="submitStockAdjustment" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Medicine Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Medicine *</label>
              <div class="relative">
                <input
                  v-model="adjustmentForm.searchQuery"
                  @input="searchMedicines"
                  type="text"
                  placeholder="Search medicine name..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <!-- Search Dropdown -->
                <div v-if="adjustmentForm.searchQuery && medicineOptions.length > 0" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  <button
                    v-for="med in medicineOptions"
                    :key="med.id"
                    @click="selectMedicine(med)"
                    type="button"
                    class="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div class="font-medium text-gray-900">{{ med.name }}</div>
                    <div class="text-sm text-gray-600">{{ med.dosage }} - Stock: {{ med.stock_quantity }}</div>
                  </button>
                </div>
              </div>
              <div v-if="adjustmentForm.selectedMedicine" class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p class="text-sm font-medium text-gray-700">
                  Selected: <span class="text-blue-700">{{ adjustmentForm.selectedMedicine.name }} ({{ adjustmentForm.selectedMedicine.dosage }})</span>
                </p>
                <p class="text-sm text-gray-600">Current Stock: {{ adjustmentForm.selectedMedicine.stock_quantity }}</p>
              </div>
            </div>

            <!-- Adjustment Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Adjustment Type *</label>
              <select
                v-model="adjustmentForm.type"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="add">➕ Add Stock (Received)</option>
                <option value="remove">➖ Remove Stock (Consumed/Damaged)</option>
              </select>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input
                v-model.number="adjustmentForm.quantity"
                type="number"
                min="1"
                required
                placeholder="e.g., 50"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Reason -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
              <select
                v-model="adjustmentForm.reason"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select reason</option>
                <option value="received">📦 Received from Supplier</option>
                <option value="damaged">🚫 Damaged/Defective</option>
                <option value="expired">⏰ Expired</option>
                <option value="dispensed">💊 Dispensed</option>
                <option value="adjustment">🔄 Stock Adjustment</option>
                <option value="other">❓ Other</option>
              </select>
            </div>

            <!-- Notes -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Notes/Comments</label>
              <textarea
                v-model="adjustmentForm.notes"
                rows="2"
                placeholder="e.g., Batch BAT001, received from ABC Pharma..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>

          <!-- Form Errors -->
          <div v-if="formError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800">{{ formError }}</p>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Processing...' : '✅ Confirm Adjustment' }}
            </button>
            <button
              type="button"
              @click="resetAdjustmentForm"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      <!-- Recent Adjustments Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p class="text-gray-600 text-sm font-medium">Stock Added (Today)</p>
          <p class="text-3xl font-bold text-green-600 mt-2">{{ todayAdded }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <p class="text-gray-600 text-sm font-medium">Stock Removed (Today)</p>
          <p class="text-3xl font-bold text-red-600 mt-2">{{ todayRemoved }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm font-medium">Net Change (Today)</p>
          <p :class="netChange >= 0 ? 'text-green-600' : 'text-red-600'" class="text-3xl font-bold mt-2">
            {{ netChange >= 0 ? '+' : '' }}{{ netChange }}
          </p>
        </div>
      </div>
    </div>

    <!-- Tab Content: Stock History -->
    <div v-if="activeTab === 'history'" class="space-y-6">
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Filter History</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Medicine Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Medicine</label>
            <input
              v-model="historyFilters.medicine"
              @input="loadHistory"
              type="text"
              placeholder="Filter by medicine..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Reason Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <select
              v-model="historyFilters.reason"
              @change="loadHistory"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Reasons</option>
              <option value="received">📦 Received</option>
              <option value="damaged">🚫 Damaged</option>
              <option value="expired">⏰ Expired</option>
              <option value="dispensed">💊 Dispensed</option>
              <option value="adjustment">🔄 Adjustment</option>
            </select>
          </div>

          <!-- Date From -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              v-model="historyFilters.fromDate"
              @change="loadHistory"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Date To -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              v-model="historyFilters.toDate"
              @change="loadHistory"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingHistory" class="text-center py-12">
        <div class="inline-block">
          <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <p class="mt-4 text-gray-600">Loading history...</p>
      </div>

      <!-- History Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div v-if="stockHistory.length === 0" class="p-12 text-center">
          <div class="text-5xl mb-4">📭</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No history found</h3>
          <p class="text-gray-600">Adjust stock to see history here</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Medicine</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reason</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in stockHistory"
                :key="entry.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(entry.date) }}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ entry.medicine }}</td>
                <td class="px-6 py-4 text-sm">
                  <span :class="entry.type === 'add' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ entry.type === 'add' ? '➕ Add' : '➖ Remove' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-bold">
                  <span :class="entry.type === 'add' ? 'text-green-600' : 'text-red-600'">
                    {{ entry.type === 'add' ? '+' : '-' }}{{ entry.quantity }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ entry.reason }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ entry.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Export Button -->
        <div v-if="stockHistory.length > 0" class="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            @click="exportToCSV"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            📥 Export to CSV
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePharmacy } from '@/composables/usePharmacy'

const { medicines, addStock, removeStock, loading, error } = usePharmacy()

// Tabs
const activeTab = ref('adjust')

// Adjustment Form
const adjustmentForm = ref({
  selectedMedicine: null,
  searchQuery: '',
  type: '',
  quantity: null,
  reason: '',
  notes: '',
})

const medicineOptions = ref([])
const submitting = ref(false)
const formError = ref('')

// Stock History
const stockHistory = ref([])
const loadingHistory = ref(false)
const historyFilters = ref({
  medicine: '',
  reason: '',
  fromDate: '',
  toDate: '',
})

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Search medicines
const searchMedicines = () => {
  const query = adjustmentForm.value.searchQuery.toLowerCase()
  medicineOptions.value = medicines.value.filter(
    m => m.name.toLowerCase().includes(query) || m.generic_name.toLowerCase().includes(query)
  )
}

// Select medicine
const selectMedicine = (medicine) => {
  adjustmentForm.value.selectedMedicine = medicine
  adjustmentForm.value.searchQuery = medicine.name
  medicineOptions.value = []
}

// Reset adjustment form
const resetAdjustmentForm = () => {
  adjustmentForm.value = {
    selectedMedicine: null,
    searchQuery: '',
    type: '',
    quantity: null,
    reason: '',
    notes: '',
  }
  formError.value = ''
}

// Submit stock adjustment
const submitStockAdjustment = async () => {
  formError.value = ''
  
  if (!adjustmentForm.value.selectedMedicine) {
    formError.value = 'Please select a medicine'
    return
  }
  if (!adjustmentForm.value.type) {
    formError.value = 'Please select adjustment type'
    return
  }
  if (!adjustmentForm.value.quantity || adjustmentForm.value.quantity <= 0) {
    formError.value = 'Please enter a valid quantity'
    return
  }
  if (!adjustmentForm.value.reason) {
    formError.value = 'Please select a reason'
    return
  }

  submitting.value = true
  try {
    const medicineId = adjustmentForm.value.selectedMedicine.id
    const quantity = adjustmentForm.value.quantity
    const reason = adjustmentForm.value.reason

    if (adjustmentForm.value.type === 'add') {
      await addStock(medicineId, quantity, reason)
    } else {
      await removeStock(medicineId, quantity, reason)
    }

    // Add to local history
    stockHistory.value.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      medicine: adjustmentForm.value.selectedMedicine.name,
      type: adjustmentForm.value.type,
      quantity: adjustmentForm.value.quantity,
      reason: adjustmentForm.value.reason,
      notes: adjustmentForm.value.notes,
    })

    // Reset form
    resetAdjustmentForm()
  } catch (err) {
    formError.value = err.message || 'Failed to adjust stock'
  } finally {
    submitting.value = false
  }
}

// Calculate today's stats
const todayAdded = computed(() => {
  return stockHistory.value
    .filter(h => {
      const hDate = new Date(h.date).toDateString()
      const today = new Date().toDateString()
      return hDate === today && h.type === 'add'
    })
    .reduce((sum, h) => sum + h.quantity, 0)
})

const todayRemoved = computed(() => {
  return stockHistory.value
    .filter(h => {
      const hDate = new Date(h.date).toDateString()
      const today = new Date().toDateString()
      return hDate === today && h.type === 'remove'
    })
    .reduce((sum, h) => sum + h.quantity, 0)
})

const netChange = computed(() => todayAdded.value - todayRemoved.value)

// Load history
const loadHistory = () => {
  // In real app, this would filter from backend
  // For now, filter local data
  let filtered = [...stockHistory.value]

  if (historyFilters.value.medicine) {
    filtered = filtered.filter(h =>
      h.medicine.toLowerCase().includes(historyFilters.value.medicine.toLowerCase())
    )
  }

  if (historyFilters.value.reason) {
    filtered = filtered.filter(h => h.reason === historyFilters.value.reason)
  }

  if (historyFilters.value.fromDate) {
    const fromDate = new Date(historyFilters.value.fromDate).setHours(0, 0, 0, 0)
    filtered = filtered.filter(h => new Date(h.date).setHours(0, 0, 0, 0) >= fromDate)
  }

  if (historyFilters.value.toDate) {
    const toDate = new Date(historyFilters.value.toDate).setHours(23, 59, 59, 999)
    filtered = filtered.filter(h => new Date(h.date).setHours(0, 0, 0, 0) <= toDate)
  }

  stockHistory.value = filtered
}

// Export to CSV
const exportToCSV = () => {
  const headers = ['Date', 'Medicine', 'Type', 'Quantity', 'Reason', 'Notes']
  const rows = stockHistory.value.map(h => [
    formatDate(h.date),
    h.medicine,
    h.type === 'add' ? 'Add' : 'Remove',
    h.quantity,
    h.reason,
    h.notes || '',
  ])

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `stock-history-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

// Load data on mount
onMounted(() => {
  // Load sample history for demo
  stockHistory.value = [
    {
      id: 1,
      date: new Date().toISOString(),
      medicine: 'Paracetamol',
      type: 'add',
      quantity: 100,
      reason: 'received',
      notes: 'From ABC Pharma, Batch BAT001',
    },
  ]
})
</script>
