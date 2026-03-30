<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">📊 Pharmacy Reports</h1>
        <p class="text-gray-600">Generate and analyze pharmacy operations data</p>
      </div>

      <!-- Report Tabs -->
      <div class="mb-6 flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          v-for="tab in reportTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-3 font-medium border-b-2 transition whitespace-nowrap',
            activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-800 font-medium">❌ {{ error }}</p>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">🔍 Filters</h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Date Range From -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              v-model="filters.dateFrom"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="generateReport"
            />
          </div>

          <!-- Date Range To -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              v-model="filters.dateTo"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="generateReport"
            />
          </div>

          <!-- Medicine Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Medicine</label>
            <input
              v-model="filters.medicine"
              type="text"
              placeholder="Search medicine..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="generateReport"
            />
          </div>

          <!-- Export Button -->
          <div class="flex items-end">
            <button
              @click="exportReport"
              class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
            >
              📥 Export {{ activeTab === 'inventory' ? 'Excel' : 'Excel' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Report Content -->
      <div class="space-y-6">
        <!-- Inventory Report -->
        <div v-if="activeTab === 'inventory'" class="space-y-6">
          <!-- Summary Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">📚 Total Medicines</p>
              <p class="text-3xl font-bold text-gray-900">{{ inventoryStats.totalMedicines }}</p>
              <p class="text-xs text-gray-500 mt-2">Active in inventory</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">💰 Total Value</p>
              <p class="text-3xl font-bold text-gray-900">₹{{ inventoryStats.totalValue.toLocaleString() }}</p>
              <p class="text-xs text-gray-500 mt-2">Current inventory worth</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">⚠️ Low Stock Items</p>
              <p class="text-3xl font-bold text-orange-600">{{ inventoryStats.lowStockCount }}</p>
              <p class="text-xs text-gray-500 mt-2">Below reorder level</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">⏰ Expiring Soon</p>
              <p class="text-3xl font-bold text-red-600">{{ inventoryStats.expiringCount }}</p>
              <p class="text-xs text-gray-500 mt-2">Within 30 days</p>
            </div>
          </div>

          <!-- Inventory Table -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">📋 Complete Inventory</h2>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b-2 border-gray-300">
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Medicine Name</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Dosage</th>
                    <th class="text-right px-4 py-3 font-semibold text-gray-900">Stock</th>
                    <th class="text-right px-4 py-3 font-semibold text-gray-900">Reorder Level</th>
                    <th class="text-right px-4 py-3 font-semibold text-gray-900">Unit Price</th>
                    <th class="text-right px-4 py-3 font-semibold text-gray-900">Total Value</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="medicine in inventoryData" :key="medicine.id" class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="px-4 py-3">{{ medicine.name }}</td>
                    <td class="px-4 py-3">{{ medicine.dosage }}</td>
                    <td class="px-4 py-3 text-right font-semibold">{{ medicine.stock }}</td>
                    <td class="px-4 py-3 text-right">{{ medicine.reorderLevel }}</td>
                    <td class="px-4 py-3 text-right">₹{{ medicine.unitPrice }}</td>
                    <td class="px-4 py-3 text-right font-semibold">₹{{ medicine.totalValue.toLocaleString() }}</td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                        medicine.status === 'low' ? 'bg-orange-100 text-orange-800' :
                        medicine.status === 'critical' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      ]">
                        {{ medicine.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Stock Movement Report -->
        <div v-if="activeTab === 'movement'" class="space-y-6">
          <!-- Movement Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">📈 Total Added</p>
              <p class="text-3xl font-bold text-green-600">{{ movementStats.totalAdded }}</p>
              <p class="text-xs text-gray-500 mt-2">units in period</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">📉 Total Removed</p>
              <p class="text-3xl font-bold text-red-600">{{ movementStats.totalRemoved }}</p>
              <p class="text-xs text-gray-500 mt-2">units dispensed/damaged</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">📊 Net Movement</p>
              <p :class="['text-3xl font-bold', movementStats.netMovement >= 0 ? 'text-green-600' : 'text-red-600']">
                {{ movementStats.netMovement >= 0 ? '+' : '' }}{{ movementStats.netMovement }}
              </p>
              <p class="text-xs text-gray-500 mt-2">units</p>
            </div>
          </div>

          <!-- Movement Table -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">📝 Stock Movements</h2>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b-2 border-gray-300">
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Date</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Medicine</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Type</th>
                    <th class="text-right px-4 py-3 font-semibold text-gray-900">Quantity</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Reason</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="movement in stockMovements" :key="movement.id" class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="px-4 py-3">{{ formatDate(movement.date) }}</td>
                    <td class="px-4 py-3">{{ movement.medicineName }}</td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'px-3 py-1 rounded text-xs font-medium',
                        movement.type === 'add' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]">
                        {{ movement.type === 'add' ? '➕ Add' : '➖ Remove' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-semibold">{{ movement.quantity }}</td>
                    <td class="px-4 py-3">{{ movement.reason }}</td>
                    <td class="px-4 py-3">{{ movement.performedBy }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Dispensing Report -->
        <div v-if="activeTab === 'dispensing'" class="space-y-6">
          <!-- Dispensing Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">💊 Total Dispensed</p>
              <p class="text-3xl font-bold text-gray-900">{{ dispensingStats.totalDispensed }}</p>
              <p class="text-xs text-gray-500 mt-2">medicine items</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">💰 Total Revenue</p>
              <p class="text-3xl font-bold text-green-600">₹{{ dispensingStats.totalRevenue.toLocaleString() }}</p>
              <p class="text-xs text-gray-500 mt-2">from dispensing</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">👤 Unique Patients</p>
              <p class="text-3xl font-bold text-gray-900">{{ dispensingStats.uniquePatients }}</p>
              <p class="text-xs text-gray-500 mt-2">served</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">📈 Avg Per Prescription</p>
              <p class="text-3xl font-bold text-blue-600">₹{{ dispensingStats.avgPerPrescription }}</p>
              <p class="text-xs text-gray-500 mt-2">average value</p>
            </div>
          </div>

          <!-- Top Medicines -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">🏆 Top 5 Dispensed Medicines</h2>

              <div class="space-y-3">
                <div v-for="(med, index) in topMedicines" :key="med.id" class="p-3 bg-gray-50 rounded-lg">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <p class="font-semibold text-gray-900">{{ index + 1 }}. {{ med.name }}</p>
                      <p class="text-xs text-gray-600">{{ med.dosage }}</p>
                    </div>
                    <span class="text-lg font-bold text-blue-600">{{ med.timesDispensed }}x</span>
                  </div>

                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div :style="{ width: (med.timesDispensed / 50) * 100 + '%' }" class="bg-blue-600 h-2 rounded-full"></div>
                  </div>

                  <div class="text-xs text-gray-600 mt-2">
                    Revenue: ₹{{ med.revenue.toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">💰 Revenue by Medicine</h2>

              <div class="space-y-3">
                <div v-for="med in revenueByMedicine" :key="med.id" class="p-3 bg-gray-50 rounded-lg">
                  <div class="flex justify-between items-start mb-2">
                    <p class="font-semibold text-gray-900">{{ med.name }}</p>
                    <span class="text-lg font-bold text-green-600">₹{{ med.revenue.toLocaleString() }}</span>
                  </div>

                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div :style="{ width: (med.revenue / 10000) * 100 + '%' }" class="bg-green-600 h-2 rounded-full"></div>
                  </div>

                  <p class="text-xs text-gray-600 mt-2">{{ med.quantity }} units | ₹{{ Math.round(med.revenue / med.quantity) }}/unit</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Dispensing Table -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">📋 Dispensing Records</h2>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b-2 border-gray-300">
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Date</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Patient</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Medicine</th>
                    <th class="text-right px-4 py-3 font-semibold text-gray-900">Qty</th>
                    <th class="text-right px-4 py-3 font-semibold text-gray-900">Unit Price</th>
                    <th class="text-right px-4 py-3 font-semibold text-gray-900">Total</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-900">Dispensed By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in dispensingRecords" :key="record.id" class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="px-4 py-3">{{ formatDate(record.date) }}</td>
                    <td class="px-4 py-3">{{ record.patientName }}</td>
                    <td class="px-4 py-3">{{ record.medicineName }}</td>
                    <td class="px-4 py-3 text-right">{{ record.quantity }}</td>
                    <td class="px-4 py-3 text-right">₹{{ record.unitPrice }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-green-600">₹{{ record.total.toLocaleString() }}</td>
                    <td class="px-4 py-3">{{ record.dispensedBy }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Trend Analysis -->
        <div v-if="activeTab === 'trends'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">📊 Daily Dispensing Trend</h2>

            <!-- Simple Bar Chart -->
            <div class="space-y-3">
              <div v-for="day in trendData" :key="day.date" class="flex items-center gap-4">
                <span class="w-20 text-sm font-medium text-gray-600">{{ formatDate(day.date) }}</span>
                <div class="flex-1 flex items-center gap-2">
                  <div class="flex-1 bg-gray-100 rounded-full h-8 flex items-center justify-end pr-3">
                    <div :style="{ width: (day.quantity / 100) * 100 + '%' }" class="bg-blue-600 rounded-full h-8 flex items-center justify-end pr-3">
                      <span class="text-white text-xs font-bold">{{ day.quantity }}</span>
                    </div>
                  </div>
                  <span class="w-24 text-right text-sm text-gray-600">₹{{ day.revenue.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Trend Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">📈 Avg Daily Dispensing</p>
              <p class="text-3xl font-bold text-gray-900">{{ Math.round(trendData.reduce((a, b) => a + b.quantity, 0) / trendData.length) }}</p>
              <p class="text-xs text-gray-500 mt-2">units per day</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">💰 Avg Daily Revenue</p>
              <p class="text-3xl font-bold text-green-600">₹{{ Math.round(trendData.reduce((a, b) => a + b.revenue, 0) / trendData.length).toLocaleString() }}</p>
              <p class="text-xs text-gray-500 mt-2">per day</p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-sm text-gray-600 mb-2">📊 Peak Day</p>
              <p class="text-3xl font-bold text-blue-600">{{ Math.max(...trendData.map(d => d.quantity)) }}</p>
              <p class="text-xs text-gray-500 mt-2">units</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// State
const error = ref('')
const activeTab = ref('inventory')
const filters = ref({
  dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dateTo: new Date().toISOString().split('T')[0],
  medicine: ''
})

// Report tabs
const reportTabs = [
  { id: 'inventory', label: 'Inventory', icon: '📚' },
  { id: 'movement', label: 'Stock Movement', icon: '📊' },
  { id: 'dispensing', label: 'Dispensing', icon: '💊' },
  { id: 'trends', label: 'Trends', icon: '📈' }
]

// Mock data
const inventoryData = [
  { id: 1, name: 'Amoxicillin', dosage: '500mg', stock: 45, reorderLevel: 20, unitPrice: 5, status: 'normal' },
  { id: 2, name: 'Paracetamol', dosage: '650mg', stock: 12, reorderLevel: 30, unitPrice: 3, status: 'low' },
  { id: 3, name: 'Metformin', dosage: '500mg', stock: 200, reorderLevel: 50, unitPrice: 8, status: 'normal' },
  { id: 4, name: 'Lisinopril', dosage: '10mg', stock: 5, reorderLevel: 25, unitPrice: 12, status: 'critical' },
  { id: 5, name: 'Aspirin', dosage: '75mg', stock: 150, reorderLevel: 40, unitPrice: 2, status: 'normal' },
  { id: 6, name: 'Clopidogrel', dosage: '75mg', stock: 30, reorderLevel: 20, unitPrice: 15, status: 'normal' },
  { id: 7, name: 'Atorvastatin', dosage: '20mg', stock: 80, reorderLevel: 30, unitPrice: 6, status: 'normal' },
  { id: 8, name: 'Omeprazole', dosage: '20mg', stock: 120, reorderLevel: 40, unitPrice: 4, status: 'normal' }
]

const stockMovements = [
  { id: 1, date: '2026-03-30T10:00:00', medicineName: 'Paracetamol', type: 'add', quantity: 100, reason: 'Received from supplier', performedBy: 'Pharmacy Staff' },
  { id: 2, date: '2026-03-29T14:30:00', medicineName: 'Amoxicillin', type: 'remove', quantity: 25, reason: 'Dispensed', performedBy: 'Pharmacist' },
  { id: 3, date: '2026-03-29T09:15:00', medicineName: 'Metformin', type: 'remove', quantity: 5, reason: 'Damaged batch', performedBy: 'Pharmacy Staff' },
  { id: 4, date: '2026-03-28T11:45:00', medicineName: 'Lisinopril', type: 'add', quantity: 50, reason: 'Received from supplier', performedBy: 'Pharmacy Staff' },
  { id: 5, date: '2026-03-28T08:20:00', medicineName: 'Aspirin', type: 'remove', quantity: 30, reason: 'Dispensed', performedBy: 'Pharmacist' }
]

const dispensingRecords = [
  { id: 1, date: '2026-03-30T10:30:00', patientName: 'Rajesh Kumar', medicineName: 'Amoxicillin', quantity: 15, unitPrice: 5, total: 75, dispensedBy: 'Pharmacy Staff' },
  { id: 2, date: '2026-03-30T09:15:00', patientName: 'Anjali Verma', medicineName: 'Paracetamol', quantity: 20, unitPrice: 3, total: 60, dispensedBy: 'Pharmacist' },
  { id: 3, date: '2026-03-29T15:45:00', patientName: 'Vikram Singh', medicineName: 'Metformin', quantity: 30, unitPrice: 8, total: 240, dispensedBy: 'Pharmacist' },
  { id: 4, date: '2026-03-29T13:20:00', patientName: 'Priya Patel', medicineName: 'Lisinopril', quantity: 10, unitPrice: 12, total: 120, dispensedBy: 'Pharmacy Staff' },
  { id: 5, date: '2026-03-28T16:00:00', patientName: 'Ram Kumar', medicineName: 'Aspirin', quantity: 10, unitPrice: 2, total: 20, dispensedBy: 'Pharmacist' }
]

const trendData = [
  { date: '2026-03-26T00:00:00', quantity: 45, revenue: 1250 },
  { date: '2026-03-27T00:00:00', quantity: 58, revenue: 1680 },
  { date: '2026-03-28T00:00:00', quantity: 72, revenue: 2150 },
  { date: '2026-03-29T00:00:00', quantity: 65, revenue: 1920 },
  { date: '2026-03-30T00:00:00', quantity: 55, revenue: 1550 }
]

// Computed properties
const inventoryStats = computed(() => ({
  totalMedicines: inventoryData.length,
  totalValue: inventoryData.reduce((sum, m) => sum + (m.stock * m.unitPrice), 0),
  lowStockCount: inventoryData.filter(m => m.status === 'low' || m.status === 'critical').length,
  expiringCount: 3
}))

const movementStats = computed(() => {
  const added = stockMovements.filter(m => m.type === 'add').reduce((sum, m) => sum + m.quantity, 0)
  const removed = stockMovements.filter(m => m.type === 'remove').reduce((sum, m) => sum + m.quantity, 0)
  return {
    totalAdded: added,
    totalRemoved: removed,
    netMovement: added - removed
  }
})

const dispensingStats = computed(() => ({
  totalDispensed: dispensingRecords.length,
  totalRevenue: dispensingRecords.reduce((sum, r) => sum + r.total, 0),
  uniquePatients: new Set(dispensingRecords.map(r => r.patientName)).size,
  avgPerPrescription: Math.round(dispensingRecords.reduce((sum, r) => sum + r.total, 0) / dispensingRecords.length)
}))

const topMedicines = computed(() => {
  const grouped = {}
  dispensingRecords.forEach(r => {
    if (!grouped[r.medicineName]) {
      grouped[r.medicineName] = { name: r.medicineName, dosage: r.quantity, timesDispensed: 0, revenue: 0 }
    }
    grouped[r.medicineName].timesDispensed++
    grouped[r.medicineName].revenue += r.total
  })

  return Object.values(grouped).sort((a, b) => b.timesDispensed - a.timesDispensed).slice(0, 5)
})

const revenueByMedicine = computed(() => {
  const grouped = {}
  dispensingRecords.forEach(r => {
    if (!grouped[r.medicineName]) {
      grouped[r.medicineName] = { name: r.medicineName, revenue: 0, quantity: 0 }
    }
    grouped[r.medicineName].revenue += r.total
    grouped[r.medicineName].quantity += r.quantity
  })

  return Object.values(grouped).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
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

const generateReport = () => {
  // In real implementation, would fetch data from API based on filters
  console.log('Generating report with filters:', filters.value)
}

const exportReport = () => {
  try {
    let csvContent = 'data:text/csv;charset=utf-8,'

    if (activeTab.value === 'inventory') {
      csvContent += 'Medicine Name,Dosage,Stock,Reorder Level,Unit Price,Total Value,Status\n'
      inventoryData.forEach(row => {
        csvContent += `"${row.name}","${row.dosage}",${row.stock},${row.reorderLevel},${row.unitPrice},${row.stock * row.unitPrice},"${row.status}"\n`
      })
    } else if (activeTab.value === 'movement') {
      csvContent += 'Date,Medicine,Type,Quantity,Reason,Performed By\n'
      stockMovements.forEach(row => {
        csvContent += `"${row.date}","${row.medicineName}","${row.type}",${row.quantity},"${row.reason}","${row.performedBy}"\n`
      })
    } else if (activeTab.value === 'dispensing') {
      csvContent += 'Date,Patient,Medicine,Qty,Unit Price,Total,Dispensed By\n'
      dispensingRecords.forEach(row => {
        csvContent += `"${row.date}","${row.patientName}","${row.medicineName}",${row.quantity},${row.unitPrice},${row.total},"${row.dispensedBy}"\n`
      })
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `pharmacy-${activeTab.value}-report-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    error.value = 'Failed to export report: ' + err.message
  }
}
</script>
