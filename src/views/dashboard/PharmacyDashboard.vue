<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
        <p class="text-gray-600 mt-1">Manage prescriptions, dispensing & inventory</p>
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
        @click="activeTab = 'prescriptions'"
        :class="activeTab === 'prescriptions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'"
        class="px-4 py-2 font-medium transition"
      >
        Prescriptions
      </button>
      <button
        @click="activeTab = 'inventory'"
        :class="activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'"
        class="px-4 py-2 font-medium transition"
      >
        Inventory
      </button>
    </div>

    <!-- Stats -->
    <div v-if="!loading && !error" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Total Prescriptions</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ prescriptions.length }}</p>
          </div>
          <span class="text-4xl">📋</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Pending Dispense</p>
            <p class="text-3xl font-bold text-yellow-600 mt-2">
              {{ prescriptions.filter((p) => p.status === 'pending').length }}
            </p>
          </div>
          <span class="text-4xl">⏳</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Low Stock Items</p>
            <p class="text-3xl font-bold text-red-600 mt-2">{{ lowStockMedicines.length }}</p>
          </div>
          <span class="text-4xl">⚠️</span>
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Total Medicines</p>
            <p class="text-3xl font-bold text-purple-600 mt-2">{{ medicines.length }}</p>
          </div>
          <span class="text-4xl">💊</span>
        </div>
      </div>
    </div>

    <!-- Prescriptions Tab -->
    <div v-if="!loading && !error && activeTab === 'prescriptions'" class="space-y-6">
      <div class="flex gap-4">
        <input
          v-model="prescriptionSearch"
          type="text"
          placeholder="Search by patient name or prescription ID..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="dispensed">Dispensed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="border-b border-gray-200 p-6">
          <h2 class="text-2xl font-bold text-gray-900">Prescriptions</h2>
        </div>

        <div v-if="filteredPrescriptions.length === 0" class="p-8 text-center text-gray-600">
          <p class="text-lg">No prescriptions found</p>
        </div>

        <table v-else class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Prescription ID</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Doctor</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="prescription in filteredPrescriptions" :key="prescription.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 text-gray-900 font-medium">{{ prescription.id }}</td>
              <td class="px-6 py-4 text-gray-900">{{ prescription.patient?.name || 'Patient' }}</td>
              <td class="px-6 py-4 text-gray-600 text-sm">{{ prescription.doctor?.name || 'Unknown' }}</td>
              <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(prescription.createdAt) }}</td>
              <td class="px-6 py-4">
                <StatusBadge :status="prescription.status" />
              </td>
              <td class="px-6 py-4 flex gap-2">
                <button
                  @click="openDispenseModal(prescription)"
                  :disabled="prescription.status !== 'pending' || isDispensingId === prescription.id"
                  class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isDispensingId === prescription.id ? 'Processing...' : 'Dispense' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Inventory Tab -->
    <div v-if="!loading && !error && activeTab === 'inventory'" class="space-y-6">
      <div class="flex gap-4">
        <input
          v-model="medicineSearch"
          type="text"
          placeholder="Search medicines..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <select
          v-model="inventoryFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Medicines</option>
          <option value="low">Low Stock</option>
          <option value="expiring">Expiring Soon</option>
        </select>
      </div>

      <!-- Low Stock Alert -->
      <div v-if="lowStockMedicines.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <h3 class="font-semibold text-red-900">Low Stock Alert</h3>
            <p class="text-sm text-red-800 mt-1">{{ lowStockMedicines.length }} medicines are running low on stock</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="border-b border-gray-200 p-6">
          <h2 class="text-2xl font-bold text-gray-900">Medicine Inventory</h2>
        </div>

        <div v-if="filteredMedicines.length === 0" class="p-8 text-center text-gray-600">
          <p class="text-lg">No medicines found</p>
        </div>

        <table v-else class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Medicine Name</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reorder Level</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="medicine in filteredMedicines" :key="medicine.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-gray-900">{{ medicine.name }}</p>
                  <p class="text-sm text-gray-600">{{ medicine.dosage || 'N/A' }}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-gray-900">{{ medicine.stock_level || 0 }}</span>
                  <span class="text-xs text-gray-600">{{ medicine.unit || 'units' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-600">{{ medicine.reorder_level || 0 }}</td>
              <td class="px-6 py-4 text-gray-600">{{ formatDate(medicine.expiry_date) }}</td>
              <td class="px-6 py-4">
                <span
                  v-if="medicine.stock_level <= (medicine.reorder_level || 10)"
                  class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold"
                >
                  Low Stock
                </span>
                <span
                  v-else-if="isExpiringSoon(medicine.expiry_date)"
                  class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold"
                >
                  Expiring Soon
                </span>
                <span v-else class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Available
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dispense Modal -->
    <div v-if="showDispenseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Dispense Prescription</h2>
          <button @click="showDispenseModal = false" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-600">Patient: <span class="font-semibold">{{ selectedPrescription.patient?.name }}</span></p>
          <p class="text-sm text-gray-600">Doctor: <span class="font-semibold">{{ selectedPrescription.doctor?.name }}</span></p>
          <p class="text-sm text-gray-600">Date: <span class="font-semibold">{{ formatDate(selectedPrescription.createdAt) }}</span></p>
        </div>

        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">Medicines to Dispense</h3>
          <div class="space-y-3">
            <div
              v-for="item in selectedPrescription.prescription_items"
              :key="item.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-gray-900">{{ item.medicine?.name || 'Unknown Medicine' }}</p>
                  <p class="text-sm text-gray-600">Dosage: {{ item.dosage || '--' }}</p>
                  <p class="text-sm text-gray-600">Frequency: {{ item.frequency || '--' }}</p>
                  <p class="text-sm text-gray-600">Duration: {{ item.duration || '--' }}</p>
                </div>
                <span class="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded">Qty: {{ item.quantity || 1 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showDispenseModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            @click="confirmDispense()"
            :disabled="isDispensingId === selectedPrescription.id"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {{ isDispensingId === selectedPrescription.id ? 'Dispensing...' : 'Confirm Dispense' }}
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
import StatusBadge from '@/components/shared/StatusBadge.vue'

const api = useApi()
const prescriptions = ref([])
const medicines = ref([])
const isDispensingId = ref(null)
const loading = ref(false)
const error = ref('')
const activeTab = ref('prescriptions')
const showDispenseModal = ref(false)
const selectedPrescription = ref({})
const prescriptionSearch = ref('')
const statusFilter = ref('')
const medicineSearch = ref('')
const inventoryFilter = ref('')

const lowStockMedicines = computed(() => {
  return medicines.value.filter((m) => m.stock_level <= (m.reorder_level || 10))
})

const filteredPrescriptions = computed(() => {
  return prescriptions.value.filter((p) => {
    const matchesSearch =
      !prescriptionSearch.value ||
      p.id.toString().includes(prescriptionSearch.value) ||
      p.patient?.name?.toLowerCase().includes(prescriptionSearch.value.toLowerCase())
    const matchesStatus = !statusFilter.value || p.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const filteredMedicines = computed(() => {
  return medicines.value.filter((m) => {
    const matchesSearch = !medicineSearch.value || m.name?.toLowerCase().includes(medicineSearch.value.toLowerCase())
    if (inventoryFilter.value === 'low') return matchesSearch && m.stock_level <= (m.reorder_level || 10)
    if (inventoryFilter.value === 'expiring') return matchesSearch && isExpiringSoon(m.expiry_date)
    return matchesSearch
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

const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const today = new Date()
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  return expiry <= thirtyDaysLater && expiry > today
}

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [prescriptionsRes, medicinesRes] = await Promise.all([api.get('/prescriptions'), api.get('/medicines')])
    prescriptions.value = prescriptionsRes.data.data || prescriptionsRes.data.prescriptions || []
    medicines.value = medicinesRes.data.data || medicinesRes.data.medicines || []
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

const openDispenseModal = (prescription) => {
  selectedPrescription.value = prescription
  showDispenseModal.value = true
}

const confirmDispense = async () => {
  isDispensingId.value = selectedPrescription.value.id
  try {
    await api.patch(`/prescriptions/${selectedPrescription.value.id}/dispense`, {
      status: 'dispensed'
    })
    alert('Prescription dispensed successfully!')
    showDispenseModal.value = false
    loadData()
  } catch (err) {
    console.error('Failed to dispense:', err)
    error.value = 'Failed to dispense prescription. Please try again.'
  } finally {
    isDispensingId.value = null
  }
}

const refreshData = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
