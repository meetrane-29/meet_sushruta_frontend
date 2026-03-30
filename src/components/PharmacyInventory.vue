<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">💊 Medicine Inventory</h1>
          <p class="text-gray-600 mt-2">Manage medicines, track stock, and monitor expiry dates</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
        >
          ➕ Add Medicine
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-800 flex items-center">
        <span class="mr-2">⚠️</span>
        {{ error }}
      </p>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Search by name, generic name..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Filter by Stock Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
          <select
            v-model="stockFilter"
            @change="handleSearch"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Stocks</option>
            <option value="low">Low Stock</option>
            <option value="normal">Normal Stock</option>
            <option value="high">High Stock</option>
          </select>
        </div>

        <!-- Items per page -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Per Page</label>
          <select
            v-model.number="pagination.limit"
            @change="handleSearch"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="10">10 items</option>
            <option value="25">25 items</option>
            <option value="50">50 items</option>
          </select>
        </div>

        <!-- Refresh Button -->
        <div class="flex items-end">
          <button
            @click="handleSearch"
            :disabled="loading"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block">
        <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
      <p class="mt-4 text-gray-600">Loading medicines...</p>
    </div>

    <!-- Medicines Table -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <div v-if="filteredMedicines.length === 0" class="p-12 text-center">
        <div class="text-5xl mb-4">🔍</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">No medicines found</h3>
        <p class="text-gray-600">Try adjusting your search filters or add a new medicine</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer" @click="toggleSort('name')">
                Medicine Name {{ getSortIcon('name') }}
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Dosage</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer" @click="toggleSort('stock_quantity')">
                Stock {{ getSortIcon('stock_quantity') }}
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reorder Level</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer" @click="toggleSort('price')">
                Price {{ getSortIcon('price') }}
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Expiry Date</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="medicine in filteredMedicines"
              :key="medicine.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ medicine.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ medicine.dosage }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="getStockClass(medicine.stock_quantity, medicine.reorder_level)" class="font-semibold">
                  {{ medicine.stock_quantity }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ medicine.reorder_level }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">₹{{ medicine.price.toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="getExpiryClass(medicine.expiry_date)">
                  {{ formatDate(medicine.expiry_date) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span
                  :class="getStatusBadgeClass(medicine.stock_quantity, medicine.reorder_level, medicine.expiry_date)"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusBadge(medicine.stock_quantity, medicine.reorder_level, medicine.expiry_date) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button
                    @click="editMedicine(medicine)"
                    class="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    @click="deleteMedicineItem(medicine.id)"
                    class="text-red-600 hover:text-red-800 font-medium"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredMedicines.length > 0" class="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div class="text-sm text-gray-600">
          Showing <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
          to
          <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
          of <span class="font-medium">{{ pagination.total }}</span>
          results
        </div>
        <div class="flex gap-2">
          <button
            @click="previousPage"
            :disabled="pagination.page === 1"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="nextPage"
            :disabled="pagination.page * pagination.limit >= pagination.total"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ editingMedicine ? '✏️ Edit Medicine' : '➕ Add New Medicine' }}
          </h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="submitForm" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
              <input
                v-model="formData.name"
                type="text"
                required
                placeholder="e.g., Paracetamol"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Generic Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Generic Name</label>
              <input
                v-model="formData.generic_name"
                type="text"
                placeholder="e.g., Acetaminophen"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Dosage -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Dosage *</label>
              <input
                v-model="formData.dosage"
                type="text"
                required
                placeholder="e.g., 500mg"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
              <input
                v-model.number="formData.price"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="e.g., 5.50"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Manufacturer -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
              <input
                v-model="formData.manufacturer"
                type="text"
                placeholder="e.g., Cipla Ltd"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Batch Number -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
              <input
                v-model="formData.batch_number"
                type="text"
                placeholder="e.g., BAT001"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Expiry Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                v-model="formData.expiry_date"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Stock Quantity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <input
                v-model.number="formData.stock_quantity"
                type="number"
                min="0"
                placeholder="e.g., 1000"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Reorder Level -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
              <input
                v-model.number="formData.reorder_level"
                type="number"
                min="1"
                placeholder="e.g., 20"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Composition -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Composition</label>
              <textarea
                v-model="formData.composition"
                rows="2"
                placeholder="e.g., Paracetamol IP 500 mg per tablet"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <!-- Instructions -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
              <textarea
                v-model="formData.instructions"
                rows="2"
                placeholder="e.g., Take 1-2 tablets with water, 2-3 times daily"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <!-- Side Effects -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Side Effects</label>
              <textarea
                v-model="formData.side_effects"
                rows="2"
                placeholder="e.g., Nausea, rash, allergic reactions"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <!-- Contraindications -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Contraindications</label>
              <textarea
                v-model="formData.contraindications"
                rows="2"
                placeholder="e.g., Pregnancy, liver disease"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>

          <!-- Form Errors -->
          <div v-if="formError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800">{{ formError }}</p>
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Saving...' : editingMedicine ? 'Update Medicine' : 'Add Medicine' }}
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

const {
  medicines,
  loading,
  error,
  createMedicine,
  listMedicines,
  updateMedicine,
  deleteMedicine,
} = usePharmacy()

// State
const searchQuery = ref('')
const stockFilter = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const showCreateModal = ref(false)
const editingMedicine = ref(null)
const submitting = ref(false)
const formError = ref('')
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
})

// Form data
const formData = ref({
  name: '',
  generic_name: '',
  dosage: '',
  composition: '',
  manufacturer: '',
  batch_number: '',
  expiry_date: '',
  description: '',
  instructions: '',
  side_effects: '',
  contraindications: '',
  stock_quantity: 0,
  reorder_level: 10,
  price: 0,
})

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Get stock CSS class
const getStockClass = (stock, reorderLevel) => {
  if (stock <= reorderLevel) return 'text-red-600'
  if (stock <= reorderLevel * 2) return 'text-yellow-600'
  return 'text-green-600'
}

// Get expiry CSS class
const getExpiryClass = (expiryDate) => {
  if (!expiryDate) return 'text-gray-600'
  const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'text-red-600 font-bold'
  if (days < 7) return 'text-red-600'
  if (days < 14) return 'text-yellow-600'
  return 'text-green-600'
}

// Get status badge
const getStatusBadge = (stock, reorderLevel, expiryDate) => {
  if (expiryDate && new Date(expiryDate) < new Date()) return 'Expired'
  if (stock <= reorderLevel) return 'Low Stock'
  if (expiryDate) {
    const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 30) return 'Expiring'
  }
  return 'Active'
}

// Get status badge class
const getStatusBadgeClass = (stock, reorderLevel, expiryDate) => {
  const status = getStatusBadge(stock, reorderLevel, expiryDate)
  const classMap = {
    'Expired': 'bg-red-100 text-red-800',
    'Low Stock': 'bg-yellow-100 text-yellow-800',
    'Expiring': 'bg-orange-100 text-orange-800',
    'Active': 'bg-green-100 text-green-800',
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

// Get sort icon
const getSortIcon = (field) => {
  if (sortBy.value !== field) return '↕️'
  return sortOrder.value === 'asc' ? '⬆️' : '⬇️'
}

// Toggle sort
const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

// Filter medicines
const filteredMedicines = computed(() => {
  let result = medicines.value

  // Stock filter
  if (stockFilter.value === 'low') {
    result = result.filter(m => m.stock_quantity <= m.reorder_level)
  } else if (stockFilter.value === 'normal') {
    result = result.filter(m => m.stock_quantity > m.reorder_level && m.stock_quantity <= m.reorder_level * 2)
  } else if (stockFilter.value === 'high') {
    result = result.filter(m => m.stock_quantity > m.reorder_level * 2)
  }

  // Sort
  result.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]

    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return result
})

// Handle search
const handleSearch = async () => {
  pagination.value.page = 1
  try {
    await listMedicines(pagination.value.page, pagination.value.limit, searchQuery.value)
  } catch (err) {
    console.error('Search failed:', err)
  }
}

// Next page
const nextPage = async () => {
  pagination.value.page++
  try {
    await listMedicines(pagination.value.page, pagination.value.limit, searchQuery.value)
  } catch (err) {
    console.error('Pagination failed:', err)
    pagination.value.page--
  }
}

// Previous page
const previousPage = async () => {
  if (pagination.value.page > 1) {
    pagination.value.page--
    try {
      await listMedicines(pagination.value.page, pagination.value.limit, searchQuery.value)
    } catch (err) {
      console.error('Pagination failed:', err)
      pagination.value.page++
    }
  }
}

// Close modal
const closeModal = () => {
  showCreateModal.value = false
  editingMedicine.value = null
  resetForm()
}

// Reset form
const resetForm = () => {
  formData.value = {
    name: '',
    generic_name: '',
    dosage: '',
    composition: '',
    manufacturer: '',
    batch_number: '',
    expiry_date: '',
    description: '',
    instructions: '',
    side_effects: '',
    contraindications: '',
    stock_quantity: 0,
    reorder_level: 10,
    price: 0,
  }
  formError.value = ''
}

// Edit medicine
const editMedicine = (medicine) => {
  editingMedicine.value = medicine
  formData.value = { ...medicine }
  showCreateModal.value = true
}

// Submit form
const submitForm = async () => {
  formError.value = ''
  if (!formData.value.name || !formData.value.dosage || !formData.value.price) {
    formError.value = 'Please fill in all required fields'
    return
  }

  submitting.value = true
  try {
    if (editingMedicine.value) {
      await updateMedicine(editingMedicine.value.id, formData.value)
    } else {
      await createMedicine(formData.value)
    }
    closeModal()
    await handleSearch()
  } catch (err) {
    formError.value = err.message || 'Failed to save medicine'
  } finally {
    submitting.value = false
  }
}

// Delete medicine
const deleteMedicineItem = async (medicineId) => {
  if (confirm('Are you sure you want to delete this medicine? This cannot be undone.')) {
    try {
      await deleteMedicine(medicineId)
      await handleSearch()
    } catch (err) {
      alert('Failed to delete medicine: ' + err.message)
    }
  }
}

// Load data on mount
onMounted(async () => {
  await handleSearch()
})
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>
