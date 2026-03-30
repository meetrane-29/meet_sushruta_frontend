<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">⏰ Expiring Medicines</h1>
          <p class="text-gray-600 mt-2">Medicines expiring within 30 days - review and manage</p>
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
    <div v-if="expiringItems.length > 0" class="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
      <div class="flex items-start gap-3">
        <span class="text-2xl mt-1">⏰</span>
        <div>
          <h3 class="font-bold text-orange-900">{{ expiringItems.length }} Medicines Expiring Soon</h3>
          <p class="text-orange-800 text-sm mt-1">Review medicines expiring within 30 days and take appropriate action.</p>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <!-- Critical (< 7 days) -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <p class="text-gray-600 text-sm font-medium">Critical (< 7 days)</p>
        <p class="text-3xl font-bold text-red-600 mt-2">{{ criticalCount }}</p>
        <p class="text-red-600 text-xs mt-2">Immediate action needed</p>
      </div>

      <!-- High Alert (7-14 days) -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
        <p class="text-gray-600 text-sm font-medium">High Alert (7-14 days)</p>
        <p class="text-3xl font-bold text-orange-600 mt-2">{{ highAlertCount }}</p>
        <p class="text-orange-600 text-xs mt-2">Review stock levels</p>
      </div>

      <!-- Medium Alert (14-30 days) -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
        <p class="text-gray-600 text-sm font-medium">Medium Alert (14-30 days)</p>
        <p class="text-3xl font-bold text-yellow-600 mt-2">{{ mediumAlertCount }}</p>
        <p class="text-yellow-600 text-xs mt-2">Monitor expiry dates</p>
      </div>

      <!-- Already Expired -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-900">
        <p class="text-gray-600 text-sm font-medium">Already Expired</p>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ expiredCount }}</p>
        <p class="text-gray-600 text-xs mt-2">Must be removed</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <!-- Filter by Urgency -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
          <select
            v-model="urgencyFilter"
            @change="filteredItems"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Items</option>
            <option value="expired">Expired</option>
            <option value="critical">Critical (< 7 days)</option>
            <option value="high">High Alert (7-14 days)</option>
            <option value="medium">Medium Alert (14-30 days)</option>
          </select>
        </div>

        <!-- Sort -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            v-model="sortBy"
            @change="filteredItems"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="expiry">Expiry Date (Soonest)</option>
            <option value="name">Medicine Name</option>
            <option value="stock">Stock Quantity</option>
          </select>
        </div>

        <!-- Action -->
        <div class="flex items-end">
          <button
            @click="exportReport"
            class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            📊 Export Report
          </button>
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
      <p class="mt-4 text-gray-600">Loading expiring medicines...</p>
    </div>

    <!-- Expiring Medicines Table -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <div v-if="filteredExpiring.length === 0" class="p-12 text-center">
        <div class="text-5xl mb-4">✅</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">All Medicines Fresh!</h3>
        <p class="text-gray-600">No medicines expiring within 30 days</p>
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
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Batch</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Expiry Date</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Days Left</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="medicine in filteredExpiring"
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
              <td class="px-6 py-4 text-sm text-gray-600">{{ medicine.batch_number || '-' }}</td>
              <td class="px-6 py-4 text-sm font-medium">
                <span :class="getExpiryClass(medicine.expiry_date)">
                  {{ formatDate(medicine.expiry_date) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="getUrgencyClass(medicine.expiry_date)"
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {{ daysUntilExpiry(medicine.expiry_date) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ medicine.stock_quantity }}</td>
              <td class="px-6 py-4">
                <span
                  :class="getStatusBadgeClass(medicine.expiry_date)"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusBadge(medicine.expiry_date) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button
                    @click="deleteMedicine(medicine.id)"
                    class="text-red-600 hover:text-red-800 font-medium text-xs"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedItems.length > 0" class="border-t border-gray-200 px-6 py-4 bg-red-50 flex justify-between items-center">
        <p class="text-sm font-medium text-gray-900">
          {{ selectedItems.length }} item(s) selected for deletion
        </p>
        <div class="flex gap-2">
          <button
            @click="bulkDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            🗑️ Delete Selected
          </button>
          <button
            @click="clearSelection"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Archive Modal -->
    <div v-if="showArchiveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <!-- Modal Header -->
        <div class="border-b border-gray-200 px-6 py-4">
          <h2 class="text-2xl font-bold text-gray-900">🗑️ Confirm Deletion</h2>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <p class="text-gray-700">
            Are you sure you want to delete {{ selectedItemsToDelete.length }} medicine(s)?
          </p>
          <ul class="list-disc list-inside space-y-2">
            <li v-for="medicine in selectedItemsToDelete" :key="medicine.id" class="text-sm text-gray-600">
              {{ medicine.name }} (Expires: {{ formatDate(medicine.expiry_date) }})
            </li>
          </ul>
          <p class="text-sm text-red-600 font-medium">This action cannot be undone.</p>
        </div>

        <!-- Modal Footer -->
        <div class="flex gap-4 border-t border-gray-200 px-6 py-4">
          <button
            @click="showArchiveModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            :disabled="deleting"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePharmacy } from '@/composables/usePharmacy'

const { getExpiringMedicines, deleteMedicine, loading, error } = usePharmacy()

// State
const expiringItems = ref([])
const searchQuery = ref('')
const urgencyFilter = ref('')
const sortBy = ref('expiry')
const selectedItems = ref([])
const selectAll = ref(false)

// Archive Modal
const showArchiveModal = ref(false)
const selectedItemsToDelete = ref([])
const deleting = ref(false)

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Calculate days until expiry
const daysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return '-'
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diff = Math.floor((expiry - today) / (1000 * 60 * 60 * 24))
  
  if (diff < 0) return `${Math.abs(diff)}d ago`
  if (diff === 0) return 'Today'
  return `${diff}d left`
}

// Get urgency class
const getUrgencyClass = (expiryDate) => {
  if (!expiryDate) return 'bg-gray-100 text-gray-800'
  const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  
  if (days < 0) return 'bg-gray-900 text-white'
  if (days < 7) return 'bg-red-100 text-red-800'
  if (days < 14) return 'bg-orange-100 text-orange-800'
  return 'bg-yellow-100 text-yellow-800'
}

// Get expiry CSS class
const getExpiryClass = (expiryDate) => {
  if (!expiryDate) return 'text-gray-600'
  const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  
  if (days < 0) return 'text-gray-900 font-bold'
  if (days < 7) return 'text-red-600 font-bold'
  if (days < 14) return 'text-orange-600'
  return 'text-yellow-600'
}

// Get status badge
const getStatusBadge = (expiryDate) => {
  if (!expiryDate) return 'Unknown'
  const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  
  if (days < 0) return '❌ Expired'
  if (days < 7) return '🔴 Critical'
  if (days < 14) return '🟠 High Alert'
  return '🟡 Medium Alert'
}

// Get status badge class
const getStatusBadgeClass = (expiryDate) => {
  if (!expiryDate) return 'bg-gray-100 text-gray-800'
  const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  
  if (days < 0) return 'bg-gray-900 text-white'
  if (days < 7) return 'bg-red-100 text-red-800'
  if (days < 14) return 'bg-orange-100 text-orange-800'
  return 'bg-yellow-100 text-yellow-800'
}

// Count statistics
const criticalCount = computed(() => {
  return expiringItems.value.filter(m => {
    const days = Math.floor((new Date(m.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
    return days >= 0 && days < 7
  }).length
})

const highAlertCount = computed(() => {
  return expiringItems.value.filter(m => {
    const days = Math.floor((new Date(m.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
    return days >= 7 && days < 14
  }).length
})

const mediumAlertCount = computed(() => {
  return expiringItems.value.filter(m => {
    const days = Math.floor((new Date(m.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
    return days >= 14 && days <= 30
  }).length
})

const expiredCount = computed(() => {
  return expiringItems.value.filter(m => {
    const days = Math.floor((new Date(m.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
    return days < 0
  }).length
})

// Filtered items
const filteredExpiring = computed(() => {
  let items = expiringItems.value

  // Search filter
  if (searchQuery.value) {
    items = items.filter(m => m.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }

  // Urgency filter
  if (urgencyFilter.value) {
    items = items.filter(m => {
      const days = Math.floor((new Date(m.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
      if (urgencyFilter.value === 'expired') return days < 0
      if (urgencyFilter.value === 'critical') return days >= 0 && days < 7
      if (urgencyFilter.value === 'high') return days >= 7 && days < 14
      if (urgencyFilter.value === 'medium') return days >= 14 && days <= 30
      return true
    })
  }

  // Sort
  switch (sortBy.value) {
    case 'name':
      items.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'stock':
      items.sort((a, b) => b.stock_quantity - a.stock_quantity)
      break
    default: // expiry
      items.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
  }

  return items
})

// Toggle select all
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = filteredExpiring.value.map(m => m.id)
  } else {
    selectedItems.value = []
  }
}

// Clear selection
const clearSelection = () => {
  selectedItems.value = []
  selectAll.value = false
}

// Delete medicine
const deleteMedicineItem = (medicineId) => {
  const medicine = expiringItems.value.find(m => m.id === medicineId)
  if (medicine) {
    selectedItemsToDelete.value = [medicine]
    showArchiveModal.value = true
  }
}

// Bulk delete
const bulkDelete = () => {
  const medicines = expiringItems.value.filter(m => selectedItems.value.includes(m.id))
  selectedItemsToDelete.value = medicines
  showArchiveModal.value = true
}

// Confirm delete
const confirmDelete = async () => {
  deleting.value = true
  try {
    for (const medicine of selectedItemsToDelete.value) {
      await deleteMedicine(medicine.id)
    }
    expiringItems.value = expiringItems.value.filter(
      m => !selectedItemsToDelete.value.find(d => d.id === m.id)
    )
    clearSelection()
    showArchiveModal.value = false
  } catch (err) {
    alert('Failed to delete medicines: ' + err.message)
  } finally {
    deleting.value = false
  }
}

// Export report
const exportReport = () => {
  const headers = ['Medicine', 'Dosage', 'Batch', 'Expiry Date', 'Days Left', 'Stock', 'Status']
  const rows = filteredExpiring.value.map(m => {
    const days = Math.floor((new Date(m.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
    return [
      m.name,
      m.dosage,
      m.batch_number || '-',
      formatDate(m.expiry_date),
      days,
      m.stock_quantity,
      getStatusBadge(m.expiry_date),
    ]
  })

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `expiring-medicines-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

// Refresh data
const refreshData = async () => {
  try {
    const response = await getExpiringMedicines(1, 100)
    if (response && response.data) {
      expiringItems.value = response.data
    }
  } catch (err) {
    console.error('Failed to load expiring medicines:', err)
  }
}

// Load data on mount
onMounted(() => {
  refreshData()
})
</script>
