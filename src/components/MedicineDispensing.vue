<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">💉 Medicine Dispensing</h1>
        <p class="text-gray-600">Dispense medications from prescriptions with real-time stock validation</p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-800 font-medium">❌ {{ error }}</p>
      </div>

      <!-- Prescription Lookup Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">🔍 Find Prescription</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <!-- Prescription ID Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prescription ID</label>
            <input
              v-model="prescriptionSearch.prescriptionId"
              type="text"
              placeholder="Enter prescription ID..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="filterPrescriptions"
            />
          </div>

          <!-- Patient Name Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
            <input
              v-model="prescriptionSearch.patientName"
              type="text"
              placeholder="Enter patient name..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="filterPrescriptions"
            />
          </div>

          <!-- Date Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              v-model="prescriptionSearch.dateFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="filterPrescriptions"
            >
              <option value="all">All Prescriptions</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        <!-- Prescriptions List -->
        <div v-if="filteredPrescriptions.length > 0" class="mt-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          <div
            v-for="prescription in filteredPrescriptions"
            :key="prescription.id"
            @click="selectPrescription(prescription)"
            :class="[
              'p-4 border-b cursor-pointer hover:bg-blue-50 transition',
              selectedPrescription?.id === prescription.id ? 'bg-blue-100 border-b-2 border-blue-500' : 'border-gray-100'
            ]"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-gray-900">Rx #{{ prescription.id }}</p>
                <p class="text-sm text-gray-600">Patient: {{ prescription.patientName }}</p>
                <p class="text-xs text-gray-500">Date: {{ formatDate(prescription.prescriptionDate) }}</p>
              </div>
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              ]">
                {{ prescription.status }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-4 text-gray-500">
          <p>No prescriptions found. Start typing to search...</p>
        </div>
      </div>

      <!-- Prescription Details & Dispensing Section -->
      <div v-if="selectedPrescription" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Prescription Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Patient Information -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">👤 Patient Information</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Patient Name</p>
                <p class="font-semibold text-gray-900">{{ selectedPrescription.patientName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">UHID</p>
                <p class="font-semibold text-gray-900">{{ selectedPrescription.uhid }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Prescribing Doctor</p>
                <p class="font-semibold text-gray-900">{{ selectedPrescription.doctorName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Prescription Date</p>
                <p class="font-semibold text-gray-900">{{ formatDate(selectedPrescription.prescriptionDate) }}</p>
              </div>
            </div>
          </div>

          <!-- Medicines to Dispense -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">💊 Medicines to Dispense</h2>

            <div v-if="prescriptionItems.length > 0" class="space-y-4">
              <div
                v-for="(item, index) in prescriptionItems"
                :key="index"
                class="border border-gray-200 rounded-lg p-4"
                :class="getItemStatusClass(item)"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Medicine Details -->
                  <div>
                    <p class="font-semibold text-gray-900">{{ item.medicineName }}</p>
                    <p class="text-sm text-gray-600">Dosage: {{ item.dosage }}</p>
                    <p class="text-sm text-gray-600">Quantity Prescribed: {{ item.quantityPrescribed }}</p>
                  </div>

                  <!-- Stock Status -->
                  <div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p class="text-gray-600">Available Stock</p>
                        <p class="text-lg font-bold" :class="item.availableStock >= item.quantityPrescribed ? 'text-green-600' : 'text-red-600'">
                          {{ item.availableStock }} units
                        </p>
                      </div>
                      <div>
                        <p class="text-gray-600">Previously Dispensed</p>
                        <p class="text-lg font-bold text-blue-600">{{ item.dispensedQuantity }} units</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Dispense Form -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <!-- Quantity Input -->
                    <div>
                      <label class="text-sm font-medium text-gray-700 block mb-1">Quantity to Dispense</label>
                      <input
                        v-model.number="item.dispenseQuantity"
                        type="number"
                        :min="0"
                        :max="item.quantityPrescribed - item.dispensedQuantity"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        @input="validateDispenseQuantity(item)"
                      />
                      <p class="text-xs text-gray-500 mt-1">Max: {{ item.quantityPrescribed - item.dispensedQuantity }}</p>
                    </div>

                    <!-- Batch Number -->
                    <div>
                      <label class="text-sm font-medium text-gray-700 block mb-1">Batch Number</label>
                      <input
                        v-model="item.batchNumber"
                        type="text"
                        placeholder="e.g., BAT001"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <!-- Expiry Check -->
                    <div>
                      <label class="text-sm font-medium text-gray-700 block mb-1">Expiry Date</label>
                      <input
                        v-model="item.expiryDate"
                        type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p v-if="item.expiryDate && isExpired(item.expiryDate)" class="text-xs text-red-600 mt-1">⚠️ Medicine expired</p>
                    </div>
                  </div>

                  <!-- Notes -->
                  <div class="mt-3">
                    <label class="text-sm font-medium text-gray-700 block mb-1">Notes/Instructions</label>
                    <input
                      v-model="item.dispensingNotes"
                      type="text"
                      placeholder="Special instructions..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Dispense Button -->
                  <button
                    v-if="!item.isDispensed"
                    @click="dispenseMedicineItem(item)"
                    :disabled="!isItemReadyToDispense(item)"
                    :class="[
                      'mt-3 w-full px-4 py-2 rounded-lg font-medium transition',
                      isItemReadyToDispense(item)
                        ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    ]"
                  >
                    ✓ Dispense This Medicine
                  </button>
                  <div v-else class="mt-3 w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-center text-green-700 font-medium">
                    ✅ Already Dispensed
                  </div>
                </div>
              </div>

              <!-- Dispense All Button -->
              <button
                @click="dispenseComplete"
                :disabled="!canDispenseComplete"
                :class="[
                  'w-full py-3 rounded-lg font-semibold transition text-lg',
                  canDispenseComplete
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                ]"
              >
                🎯 Complete Dispensing
              </button>
            </div>

            <div v-else class="text-center py-6 text-gray-500">
              <p>No medicines to dispense</p>
            </div>
          </div>
        </div>

        <!-- Right: Dispense History & Summary -->
        <div class="space-y-6">
          <!-- Dispensing Summary -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">📋 Summary</h2>

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Total Medicines</span>
                <span class="font-semibold text-gray-900">{{ prescriptionItems.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Dispensed</span>
                <span class="font-semibold text-green-600">{{ dispensedCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Pending</span>
                <span class="font-semibold text-yellow-600">{{ pendingCount }}</span>
              </div>
              <div class="flex justify-between pt-3 border-t border-gray-200">
                <span class="text-gray-600">Completion</span>
                <span class="font-semibold text-blue-600">{{ dispensingProgress }}%</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                :style="{ width: dispensingProgress + '%' }"
                class="bg-blue-600 h-2 rounded-full transition-all"
              ></div>
            </div>
          </div>

          <!-- Previous Dispense History -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">📜 Dispense History</h2>

            <div v-if="dispenseHistory.length > 0" class="max-h-96 overflow-y-auto space-y-3">
              <div
                v-for="record in dispenseHistory"
                :key="record.id"
                class="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p class="font-semibold text-gray-900 text-sm">{{ record.medicineName }}</p>
                <p class="text-xs text-gray-600">Qty: {{ record.quantityDispensed }} | Date: {{ formatDate(record.dispensedAt) }}</p>
                <p class="text-xs text-gray-600">By: {{ record.dispensedBy }}</p>
              </div>
            </div>

            <div v-else class="text-center py-6 text-gray-500">
              <p>No previous dispense history</p>
            </div>
          </div>

          <!-- Print Receipt -->
          <button
            v-if="completedDispensing"
            @click="printReceipt"
            class="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            🖨️ Print Receipt
          </button>
        </div>
      </div>

      <!-- No Selection State -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p class="text-xl text-gray-600">👆 Select a prescription above to begin dispensing</p>
      </div>
    </div>

    <!-- Receipt Modal -->
    <div v-if="showReceiptModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full p-8 max-h-96 overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Dispensing Receipt</h2>
          <button
            @click="showReceiptModal = false"
            class="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <!-- Receipt Content -->
        <div id="receipt-content" class="text-sm text-gray-800">
          <div class="text-center mb-6 pb-4 border-b-2 border-gray-300">
            <h3 class="text-lg font-bold">PHARMACY RECEIPT</h3>
            <p class="text-gray-600">Rx #{{ selectedPrescription.id }}</p>
          </div>

          <div class="mb-4">
            <p><strong>Patient:</strong> {{ selectedPrescription.patientName }}</p>
            <p><strong>UHID:</strong> {{ selectedPrescription.uhid }}</p>
            <p><strong>Doctor:</strong> {{ selectedPrescription.doctorName }}</p>
            <p><strong>Date:</strong> {{ formatDate(new Date().toISOString()) }}</p>
          </div>

          <div class="mb-4 pb-4 border-b border-gray-300">
            <h4 class="font-semibold mb-2">Medicines Dispensed:</h4>
            <div v-for="(item, index) in prescriptionItems" :key="index" class="text-xs mb-2 pb-2 border-b border-gray-200">
              <p><strong>{{ item.medicineName }}</strong> - {{ item.dosage }}</p>
              <p>Qty: {{ item.dispenseQuantity }} | Batch: {{ item.batchNumber }}</p>
              <p v-if="item.dispensingNotes">Instructions: {{ item.dispensingNotes }}</p>
            </div>
          </div>

          <div class="text-center text-xs text-gray-600 pt-4">
            <p>Dispensed by: Pharmacy Staff</p>
            <p>{{ new Date().toLocaleString() }}</p>
          </div>
        </div>

        <!-- Print Button -->
        <button
          @click="window.print()"
          class="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          🖨️ Print Now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePharmacy } from '@/composables/usePharmacy'

const { dispenseMedicine, getDispenseHistory } = usePharmacy()

// State
const error = ref('')
const prescriptionSearch = ref({
  prescriptionId: '',
  patientName: '',
  dateFilter: 'all'
})

const selectedPrescription = ref(null)
const prescriptionItems = ref([])
const dispenseHistory = ref([])
const showReceiptModal = ref(false)
const completedDispensing = ref(false)

// Mock prescriptions data
const allPrescriptions = [
  {
    id: 'RX-001',
    patientName: 'Rajesh Kumar',
    uhid: 'UH-2024-001',
    doctorName: 'Dr. Priya Singh',
    prescriptionDate: '2026-03-30T10:00:00',
    status: 'pending',
    items: [
      { id: 1, medicineName: 'Amoxicillin', dosage: '500mg', quantityPrescribed: 15, dispensedQuantity: 0 },
      { id: 2, medicineName: 'Paracetamol', dosage: '650mg', quantityPrescribed: 20, dispensedQuantity: 0 }
    ]
  },
  {
    id: 'RX-002',
    patientName: 'Anjali Verma',
    uhid: 'UH-2024-002',
    doctorName: 'Dr. Amit Patel',
    prescriptionDate: '2026-03-29T14:30:00',
    status: 'partial',
    items: [
      { id: 3, medicineName: 'Metformin', dosage: '500mg', quantityPrescribed: 30, dispensedQuantity: 15 }
    ]
  },
  {
    id: 'RX-003',
    patientName: 'Vikram Singh',
    uhid: 'UH-2024-003',
    doctorName: 'Dr. Priya Singh',
    prescriptionDate: '2026-03-28T09:15:00',
    status: 'pending',
    items: [
      { id: 4, medicineName: 'Aspirin', dosage: '75mg', quantityPrescribed: 10, dispensedQuantity: 0 },
      { id: 5, medicineName: 'Lisinopril', dosage: '10mg', quantityPrescribed: 30, dispensedQuantity: 0 }
    ]
  }
]

// Computed properties
const filteredPrescriptions = computed(() => {
  return allPrescriptions.filter(p => {
    const matchId = p.id.toLowerCase().includes(prescriptionSearch.value.prescriptionId.toLowerCase())
    const matchName = p.patientName.toLowerCase().includes(prescriptionSearch.value.patientName.toLowerCase())
    return matchId && matchName
  })
})

const dispensedCount = computed(() => {
  return prescriptionItems.value.filter(item => item.isDispensed).length
})

const pendingCount = computed(() => {
  return prescriptionItems.value.filter(item => !item.isDispensed).length
})

const dispensingProgress = computed(() => {
  if (prescriptionItems.value.length === 0) return 0
  return Math.round((dispensedCount.value / prescriptionItems.value.length) * 100)
})

const canDispenseComplete = computed(() => {
  return prescriptionItems.value.length > 0 && pendingCount.value === 0
})

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const filterPrescriptions = () => {
  // Filter logic handled by computed property
}

const selectPrescription = async (prescription) => {
  selectedPrescription.value = prescription
  completedDispensing.value = false
  error.value = ''

  // Initialize prescription items with mock stock data
  prescriptionItems.value = prescription.items.map(item => ({
    ...item,
    availableStock: Math.floor(Math.random() * 50) + 10,
    dispenseQuantity: item.quantityPrescribed - item.dispensedQuantity,
    batchNumber: '',
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dispensingNotes: '',
    isDispensed: false
  }))

  // Load dispense history
  try {
    const history = await getDispenseHistory(prescription.id)
    dispenseHistory.value = history || []
  } catch (err) {
    console.log('No previous dispense history')
  }
}

const validateDispenseQuantity = (item) => {
  const maxQty = item.quantityPrescribed - item.dispensedQuantity
  if (item.dispenseQuantity > maxQty) {
    item.dispenseQuantity = maxQty
  }
  if (item.dispenseQuantity < 0) {
    item.dispenseQuantity = 0
  }
}

const isExpired = (expiryDate) => {
  return new Date(expiryDate) < new Date()
}

const getItemStatusClass = (item) => {
  if (item.isDispensed) {
    return 'bg-green-50 border-green-200'
  } else if (item.availableStock < item.quantityPrescribed - item.dispensedQuantity) {
    return 'bg-yellow-50 border-yellow-200'
  }
  return 'bg-white'
}

const isItemReadyToDispense = (item) => {
  return (
    item.dispenseQuantity > 0 &&
    item.availableStock >= item.dispenseQuantity &&
    item.batchNumber &&
    item.expiryDate &&
    !isExpired(item.expiryDate) &&
    !item.isDispensed
  )
}

const dispenseMedicineItem = async (item) => {
  try {
    error.value = ''

    if (item.availableStock < item.dispenseQuantity) {
      error.value = `Insufficient stock for ${item.medicineName}. Available: ${item.availableStock}`
      return
    }

    if (isExpired(item.expiryDate)) {
      error.value = `Medicine ${item.medicineName} has expired`
      return
    }

    // Call API to dispense
    await dispenseMedicine({
      prescriptionId: selectedPrescription.value.id,
      medicineId: item.id,
      quantityDispensed: item.dispenseQuantity,
      batchNumber: item.batchNumber
    })

    item.isDispensed = true
    item.dispensedQuantity += item.dispenseQuantity

    // Add to history
    dispenseHistory.value.unshift({
      id: Date.now(),
      medicineName: item.medicineName,
      quantityDispensed: item.dispenseQuantity,
      dispensedAt: new Date().toISOString(),
      dispensedBy: 'Pharmacy Staff'
    })
  } catch (err) {
    error.value = `Failed to dispense ${item.medicineName}: ${err.message}`
  }
}

const dispenseComplete = () => {
  completedDispensing.value = true
}

const printReceipt = () => {
  showReceiptModal.value = true
  setTimeout(() => {
    window.print()
  }, 100)
}

onMounted(() => {
  // Initialize data
})
</script>
