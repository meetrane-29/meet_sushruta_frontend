<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">⚠️ Low Stock Alerts</h1>
          <p class="text-gray-600 mt-2">Medicines below reorder level - immediate action required</p>
        </div>
        <button
          @click="refreshData"
          :disabled="loading"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Alert Banner -->
    <div class="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
      <div class="flex items-start gap-3">
        <span class="text-2xl mt-1">⚠️</span>
        <div>
          <h3 class="font-bold text-yellow-900">{{ lowStockItems.length }} Items Below Reorder Level</h3>
          <p class="text-yellow-800 text-sm mt-1">Please reorder these medicines to maintain adequate stock levels.</p>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Total Low Stock Items -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <p class="text-gray-600 text-sm font-medium">Critical Stock Items</p>
        <p class="text-3xl font-bold text-red-600 mt-2">{{ criticalCount }}</p>
        <p class="text-red-600 text-sm mt-2">Stock ≤ Reorder Level</p>
      </div>

      <!-- Nearly Critical Items -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
        <p class="text-gray-600 text-sm font-medium">Warning Stock Items</p>
        <p class="text-3xl font-bold text-yellow-600 mt-2">{{ warningCount }}</p>
        <p class="text-yellow-600 text-sm mt-2">Stock ≤ 2x Reorder Level</p>
      </div>

      <!-- Total Value of Low Stock -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <p class="text-gray-600 text-sm font-medium">Total Inventory Value (Low Stock)</p>
        <p class="text-3xl font-bold text-blue-600 mt-2">₹{{ totalValue.toFixed(0) }}</p>
        <p class="text-blue-600 text-sm mt-2">Replacement cost estimate</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search Medicine</label>
          <input
            v-model="searchQuery"
            @input="filteredItems"
            type="text"
            placeholder="Search by name..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Sort -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            v-model="sortBy"
            @change="filteredItems"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="urgency">Urgency (Most Critical)</option>
            <option value="stock">Stock Quantity (Lowest)</option>
            <option value="name">Medicine Name</option>
            <option value="value">Stock Value</option>
          </select>
        </div>

        <!-- Filter Level -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Severity</label>
          <select
            v-model="severityFilter"
            @change="filteredItems"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Items</option>
            <option value="critical">🔴 Critical (Stock ≤ Reorder)</option>
            <option value="warning">🟡 Warning (Stock ≤ 2x Reorder)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-800 flex items-center">
        <span class="mr-2">⚠️</span>
        {{ error }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block">
        <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
      <p class="mt-4 text-gray-600">Loading low stock items...</p>
    </div>

    <!-- Low Stock Table -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <div v-if="filteredLowStock.length === 0" class="p-12 text-center">
        <div class="text-5xl mb-4">✅</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">All Items Stocked!</h3>
        <p class="text-gray-600">No medicines below reorder level at the moment</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                <input v-model="selectAll" @change="toggleSelectAll" type="checkbox" class="rounded" />
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Medicine</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Dosage</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Current Stock</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reorder Level</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Shortage</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Severity</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="medicine in filteredLowStock"
              :key="medicine.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4">
                <input
                  v-model="selectedItems"
                  :value="medicine.id"
                  type="checkbox"
                  class="rounded"
                />
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ medicine.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ medicine.dosage }}</td>
              <td class="px-6 py-4 text-sm font-bold text-red-600">{{ medicine.stock_quantity }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ medicine.reorder_level }}</td>
              <td class="px-6 py-4 text-sm font-medium">
                <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                  {{ medicine.reorder_level - medicine.stock_quantity }} units
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">₹{{ medicine.price.toFixed(2) }}</td>
              <td class="px-6 py-4">
                <span
                  :class="getSeverityClass(medicine.stock_quantity, medicine.reorder_level)"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ getSeverityBadge(medicine.stock_quantity, medicine.reorder_level) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button
                    @click="quickReorder(medicine)"
                    class="text-green-600 hover:text-green-800 font-medium"
                  >
                    📋 Reorder
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedItems.length > 0" class="border-t border-gray-200 px-6 py-4 bg-blue-50 flex justify-between items-center">
        <p class="text-sm font-medium text-gray-900">
          {{ selectedItems.length }} item(s) selected
        </p>
        <div class="flex gap-2">
          <button
            @click="bulkReorder"
            class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            📋 Bulk Reorder
          </button>
          <button
            @click="clearSelection"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>

    <!-- Reorder Modal -->
    <div v-if="showReorderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 class="text-2xl font-bold text-gray-900">
            📋 Create Reorder Request
          </h2>
          <button
            @click="showReorderModal = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="submitReorder" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Medicine</label>
            <p class="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
              {{ reorderData.medicine?.name }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
            <p class="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
              {{ reorderData.medicine?.stock_quantity }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Suggested Quantity *</label>
            <input
              v-model.number="reorderData.quantity"
              type="number"
              min="1"
              required
              :placeholder="`e.g., ${reorderData.medicine?.reorder_level * 5}`"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
            <select
              v-model="reorderData.priority"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select priority</option>
              <option value="urgent">🔴 Urgent (Next 24h)</option>
              <option value="high">🟠 High (This week)</option>
              <option value="normal">🟡 Normal (Next 2 weeks)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              v-model="reorderData.notes"
              rows="2"
              placeholder="Additional notes for supplier..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="showReorderModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="reorderSubmitting"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ reorderSubmitting ? 'Creating...' : '✅ Create Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePharmacy } from '@/composables/usePharmacy'

const { getLowStockMedicines, loading, error } = usePharmacy()

// State
const lowStockItems = ref([])
const searchQuery = ref('')
const sortBy = ref('urgency')
const severityFilter = ref('')
const selectedItems = ref([])
const selectAll = ref(false)

// Reorder Modal
const showReorderModal = ref(false)
const reorderSubmitting = ref(false)
const reorderData = ref({
  medicine: null,
  quantity: null,
  priority: '',
  notes: '',
})

// Get severity badge
const getSeverityBadge = (stock, reorderLevel) => {
  if (stock <= 0) return '🔴 Out of Stock'
  if (stock <= reorderLevel) return '🔴 Critical'
  if (stock <= reorderLevel * 2) return '🟡 Warning'
  return '✅ Normal'
}

// Get severity CSS class
const getSeverityClass = (stock, reorderLevel) => {
  if (stock <= 0) return 'bg-red-100 text-red-800'
  if (stock <= reorderLevel) return 'bg-red-100 text-red-800'
  if (stock <= reorderLevel * 2) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

// Critical count
const criticalCount = computed(() => {
  return lowStockItems.value.filter(m => m.stock_quantity <= m.reorder_level).length
})

// Warning count
const warningCount = computed(() => {
  return lowStockItems.value.filter(m => m.stock_quantity > m.reorder_level && m.stock_quantity <= m.reorder_level * 2).length
})

// Total value
const totalValue = computed(() => {
  return lowStockItems.value.reduce((sum, m) => sum + m.stock_quantity * m.price, 0)
})

// Filtered items
const filteredLowStock = computed(() => {
  let items = lowStockItems.value

  // Search filter
  if (searchQuery.value) {
    items = items.filter(m => m.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }

  // Severity filter
  if (severityFilter.value === 'critical') {
    items = items.filter(m => m.stock_quantity <= m.reorder_level)
  } else if (severityFilter.value === 'warning') {
    items = items.filter(m => m.stock_quantity > m.reorder_level && m.stock_quantity <= m.reorder_level * 2)
  }

  // Sort
  switch (sortBy.value) {
    case 'stock':
      items.sort((a, b) => a.stock_quantity - b.stock_quantity)
      break
    case 'name':
      items.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'value':
      items.sort((a, b) => b.stock_quantity * b.price - a.stock_quantity * a.price)
      break
    default: // urgency
      items.sort((a, b) => {
        const aSeverity = a.stock_quantity <= a.reorder_level ? 0 : 1
        const bSeverity = b.stock_quantity <= b.reorder_level ? 0 : 1
        return aSeverity - bSeverity
      })
  }

  return items
})

// Toggle select all
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = filteredLowStock.value.map(m => m.id)
  } else {
    selectedItems.value = []
  }
}

// Clear selection
const clearSelection = () => {
  selectedItems.value = []
  selectAll.value = false
}

// Quick reorder
const quickReorder = (medicine) => {
  reorderData.value.medicine = medicine
  reorderData.value.quantity = medicine.reorder_level * 5
  reorderData.value.priority = medicine.stock_quantity <= medicine.reorder_level ? 'urgent' : 'normal'
  reorderData.value.notes = ''
  showReorderModal.value = true
}

// Bulk reorder
const bulkReorder = () => {
  if (selectedItems.value.length > 0) {
    const selected = lowStockItems.value.filter(m => selectedItems.value.includes(m.id))
    alert(`Creating reorder requests for ${selected.length} items:\n${selected.map(m => m.name).join(', ')}`)
    clearSelection()
  }
}

// Submit reorder
const submitReorder = async () => {
  reorderSubmitting.value = true
  try {
    // In real implementation, this would call an API to create a purchase order
    alert(`✅ Reorder request created for ${reorderData.value.medicine.name}\nQuantity: ${reorderData.value.quantity}\nPriority: ${reorderData.value.priority}`)
    showReorderModal.value = false
    reorderData.value = { medicine: null, quantity: null, priority: '', notes: '' }
  } catch (err) {
    alert('Failed to create reorder request')
  } finally {
    reorderSubmitting.value = false
  }
}

// Refresh data
const refreshData = async () => {
  try {
    const response = await getLowStockMedicines(1, 100)
    if (response && response.data) {
      lowStockItems.value = response.data
    }
  } catch (err) {
    console.error('Failed to load low stock items:', err)
  }
}

// Load data on mount
onMounted(() => {
  refreshData()
  
  // Auto-refresh every 5 minutes
  setInterval(refreshData, 5 * 60 * 1000)
})
</script>
