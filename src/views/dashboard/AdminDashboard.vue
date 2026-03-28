<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="text-gray-600 mt-1">Hospital management overview and statistics</p>
        </div>

      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" :cols="4" />

    <!-- Error State -->
    <ErrorMessage 
      v-if="error" 
      :message="error"
      :onRetry="fetchDashboardData"
    />

    <!-- Dashboard Content -->
    <div v-if="!isLoading && !error" class="space-y-8">
      <!-- SECTION 1: Stats Grid (5 columns) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <!-- Total Patients -->
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-blue-500 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Patients</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">{{ dashboardData.stats.total_patients }}</p>
            </div>
            <div class="bg-blue-100 rounded-full p-4">
              <span class="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <!-- Total Doctors -->
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-green-500 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Active Doctors</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">{{ dashboardData.stats.total_doctors }}</p>
            </div>
            <div class="bg-green-100 rounded-full p-4">
              <span class="text-2xl">👨‍⚕️</span>
            </div>
          </div>
        </div>

        <!-- Total Nurses -->
        <div 
          @click="$router.push({ name: 'NursesManagement' })"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-pink-500 p-6 cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Nurses</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">{{ dashboardData.stats.total_nurses || 0 }}</p>
            </div>
            <div class="bg-pink-100 rounded-full p-4">
              <span class="text-2xl">👩‍⚕️</span>
            </div>
          </div>
        </div>

        <!-- Today's Appointments -->
        <div 
          @click="$router.push({ name: 'AdminAppointments' })"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-purple-500 p-6 cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Today's Appointments</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">{{ dashboardData.stats.today_appointments }}</p>
            </div>
            <div class="bg-purple-100 rounded-full p-4">
              <span class="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <!-- Total Users -->
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-orange-500 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Users</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">{{ dashboardData.stats.total_users }}</p>
            </div>
            <div class="bg-orange-100 rounded-full p-4">
              <span class="text-2xl">👤</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: Recent Patients Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Recent Patients</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Age</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Department</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr 
                v-for="patient in dashboardData.recent_patients" 
                :key="patient.id"
                class="hover:bg-gray-50 transition"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {{ patient.id.substring(0, 8) }}...
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ patient.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ patient.age }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ patient.department }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <StatusBadge :status="patient.status" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ formatDate(patient.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECTION 3: Top Doctors + Department Load + Nurse Roles (3 columns) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Top Doctors -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Top Doctors Today</h2>
          </div>
          <div class="divide-y divide-gray-200">
            <div 
              v-for="(doctor, index) in dashboardData.top_doctors" 
              :key="doctor.id"
              class="px-6 py-4 hover:bg-gray-50 transition"
            >
              <div class="flex items-center justify-between mb-2">
                <div>
                  <div class="flex items-center gap-3">
                    <div class="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-blue-600">
                      {{ index + 1 }}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">{{ doctor.name }}</p>
                      <p class="text-xs text-gray-600">{{ doctor.specialization }}</p>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-900">{{ doctor.today_appointments }}</p>
                  <p class="text-xs text-gray-600">appointments</p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-xs text-gray-600">Rating:</span>
                <div class="flex items-center">
                  <span v-for="i in 5" :key="i" :class="i <= Math.round(doctor.rating * 5) ? 'text-yellow-400' : 'text-gray-300'">
                    ⭐
                  </span>
                </div>
              </div>
            </div>

            <div v-if="!dashboardData.top_doctors || dashboardData.top_doctors.length === 0" class="px-6 py-8 text-center text-gray-500">
              No doctor data available
            </div>
          </div>
        </div>

        <!-- Department Load -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Department Load</h2>
          </div>
          <div class="divide-y divide-gray-200">
            <div 
              v-for="dept in dashboardData.department_load" 
              :key="dept.department"
              class="px-6 py-4"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="font-medium text-gray-900">{{ dept.department }}</p>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gray-900">{{ dept.count }}</span>
                  <span class="text-xs text-gray-600">patients</span>
                </div>
              </div>
              <div class="relative bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  :style="{ width: dept.percentage + '%' }"
                  class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                />
              </div>
              <div class="flex justify-end mt-1">
                <span class="text-xs font-semibold text-gray-600">{{ dept.percentage }}%</span>
              </div>
            </div>

            <div v-if="!dashboardData.department_load || dashboardData.department_load.length === 0" class="px-6 py-8 text-center text-gray-500">
              No department data available
            </div>
          </div>
        </div>

        <!-- Nurse Role Breakdown -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Nurse Roles</h2>
            <p class="text-sm text-gray-600">Distribution by role</p>
          </div>
          <div class="divide-y divide-gray-200">
            <div 
              v-for="role in dashboardData.nurse_role_breakdown" 
              :key="role.role"
              class="px-6 py-4 hover:bg-gray-50 transition"
            >
              <div class="flex items-center justify-between mb-2">
                <div>
                  <p class="font-medium text-gray-900">{{ role.role }}</p>
                  <p class="text-xs text-gray-600">{{ role.count }} nurse<span v-if="role.count !== 1">s</span></p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-pink-600">{{ role.percentage }}%</p>
                </div>
              </div>
              <div class="relative bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  :style="{ width: role.percentage + '%' }"
                  class="bg-gradient-to-r from-pink-400 to-pink-600 h-full rounded-full transition-all"
                />
              </div>
            </div>

            <div v-if="!dashboardData.nurse_role_breakdown || dashboardData.nurse_role_breakdown.length === 0" class="px-6 py-8 text-center text-gray-500">
              No nurse role data available
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 4: Inventory & Assets -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Bed Availability Ward-wise -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">🛏️ Bed Availability</h2>
            <p class="text-sm text-gray-600">Ward-wise breakdown</p>
          </div>
          <div class="divide-y divide-gray-200">
            <div v-if="bedStats.beds && bedStats.beds.length > 0">
              <div v-for="ward in bedStats.beds" :key="ward.ward" class="px-6 py-4 hover:bg-gray-50 transition">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <p class="font-semibold text-gray-900">{{ ward.ward }} Ward</p>
                    <p class="text-xs text-gray-600">Total: {{ ward.total }} beds</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs w-20 text-gray-600">Available:</span>
                    <div class="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div class="bg-green-500 h-2.5 rounded-full" :style="{ width: (ward.available / ward.total * 100) + '%' }"></div>
                    </div>
                    <span class="text-xs font-bold w-12 text-right text-green-600">{{ ward.available }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs w-20 text-gray-600">Occupied:</span>
                    <div class="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div class="bg-blue-500 h-2.5 rounded-full" :style="{ width: (ward.occupied / ward.total * 100) + '%' }"></div>
                    </div>
                    <span class="text-xs font-bold w-12 text-right text-blue-600">{{ ward.occupied }}</span>
                  </div>
                  <div v-if="ward.maintenance > 0" class="flex items-center gap-2">
                    <span class="text-xs w-20 text-gray-600">Maintenance:</span>
                    <div class="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div class="bg-yellow-500 h-2.5 rounded-full" :style="{ width: (ward.maintenance / ward.total * 100) + '%' }"></div>
                    </div>
                    <span class="text-xs font-bold w-12 text-right text-yellow-600">{{ ward.maintenance }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="px-6 py-8 text-center text-gray-500">
              Loading bed data...
            </div>
          </div>
        </div>

        <!-- OT Schedule -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">🏥 Operation Theatre Schedule</h2>
            <p class="text-sm text-gray-600">Scheduled operations</p>
          </div>
          <div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            <div v-if="otSchedules && otSchedules.length > 0">
              <div v-for="op in otSchedules.slice(0, 5)" :key="op.id" class="px-6 py-4 hover:bg-gray-50 transition">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <p class="font-semibold text-gray-900">{{ op.operation_type }}</p>
                    <p class="text-xs text-gray-600">
                      <span class="font-mono">{{ op.operation_date }} @ {{ op.operation_time }}</span>
                    </p>
                  </div>
                  <span :class="getOperationStatusColor(op.status)" class="px-2 py-1 rounded text-xs font-medium">
                    {{ op.status }}
                  </span>
                </div>
                <div class="text-xs text-gray-600 space-y-1">
                  <p v-if="op.surgeon_doctor">💊 <strong>Surgeon:</strong> Dr. {{ op.surgeon_doctor?.first_name || 'N/A' }}</p>
                  <p v-if="op.theatre">🏥 <strong>Theatre:</strong> {{ op.theatre?.theatre_name || 'N/A' }}</p>
                </div>
              </div>
            </div>
            <div v-else class="px-6 py-8 text-center text-gray-500">
              <p class="text-sm">No operations scheduled</p>
              <p class="text-xs text-gray-400 mt-1">No operations found for the next 30 days</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 5: Room/Ward Allocation & Medical Equipment Status -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Room/Ward Allocation -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">🏘️ Room Type Distribution</h2>
            <p class="text-sm text-gray-600">Click on a room type to see patients</p>
          </div>
          <div class="divide-y divide-gray-200">
            <div v-if="bedStats.bed_types && bedStats.bed_types.length > 0">
              <div 
                v-for="type in bedStats.bed_types" 
                :key="type.bed_type" 
                @click="openBedTypeModal(type.bed_type)"
                class="px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
              >
                <div class="flex items-center justify-between mb-2">
                  <p class="font-medium text-gray-900">{{ type.bed_type || type }}</p>
                  <div class="text-right">
                    <p class="text-lg font-bold text-gray-900">{{ type.total || 0 }}</p>
                    <p class="text-xs text-gray-600">{{ type.available || 0 }} available</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                      :style="{ width: ((type.available || 0) / (type.total || 1) * 100) + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm font-bold text-gray-600">{{ Math.round((type.available || 0) / (type.total || 1) * 100) }}%</span>
                </div>
              </div>
            </div>
            <div v-else class="px-6 py-8 text-center text-gray-500">
              Loading room data...
            </div>
          </div>
        </div>

        <!-- Medical Equipment Status -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">⚙️ Medical Equipment Status</h2>
            <p class="text-sm text-gray-600">Operational status</p>
          </div>
          <div class="divide-y divide-gray-200">
            <div v-if="equipmentStats.total_equipment">
              <div class="px-6 py-4">
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div class="bg-green-50 rounded-lg p-3">
                    <p class="text-xs text-green-600 uppercase font-semibold">Working</p>
                    <p class="text-2xl font-bold text-green-700">{{ equipmentStats.working || 0 }}</p>
                    <p class="text-xs text-green-600">equipment</p>
                  </div>
                  <div class="bg-red-50 rounded-lg p-3">
                    <p class="text-xs text-red-600 uppercase font-semibold">Repair/Maintenance</p>
                    <p class="text-2xl font-bold text-red-700">{{ (equipmentStats.repair || 0) + (equipmentStats.under_maintenance || 0) }}</p>
                    <p class="text-xs text-red-600">equipment</p>
                  </div>
                </div>
              </div>
              <div class="px-6 py-4 bg-gray-50">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-semibold text-gray-700">Working Percentage:</span>
                  <span class="text-lg font-bold text-green-600">{{ Math.round(equipmentStats.working_percentage || 0) }}%</span>
                </div>
                <div class="w-full bg-gray-300 rounded-full h-2">
                  <div 
                    class="bg-green-500 h-2 rounded-full"
                    :style="{ width: (equipmentStats.working_percentage || 0) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="px-6 py-8 text-center text-gray-500">
              Loading equipment data...
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 6: Inventory Summary -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">📦 Overall Inventory Summary</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          <!-- Total Beds -->
          <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <p class="text-xs text-blue-600 uppercase font-semibold">Total Beds</p>
            <p class="text-3xl font-bold text-blue-700">{{ bedStats.total_beds || 0 }}</p>
            <p class="text-xs text-blue-600 mt-1">{{ bedStats.available_beds || 0 }} available</p>
          </div>
          
          <!-- Occupancy Rate -->
          <div class="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
            <p class="text-xs text-purple-600 uppercase font-semibold">Occupancy</p>
            <p class="text-3xl font-bold text-purple-700">{{ Math.round(bedStats.occupancy_rate || 0) }}%</p>
            <p class="text-xs text-purple-600 mt-1">{{ bedStats.occupied_beds || 0 }} occupied</p>
          </div>

          <!-- Total Equipment -->
          <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <p class="text-xs text-green-600 uppercase font-semibold">Equipment</p>
            <p class="text-3xl font-bold text-green-700">{{ equipmentStats.total_equipment || 0 }}</p>
            <p class="text-xs text-green-600 mt-1">{{ equipmentStats.working || 0 }} working</p>
          </div>

          <!-- Today's Operations -->
          <div class="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
            <p class="text-xs text-orange-600 uppercase font-semibold">Operations</p>
            <p class="text-3xl font-bold text-orange-700">{{ otStats.today_operations || 0 }}</p>
            <p class="text-xs text-orange-600 mt-1">{{ otStats.upcoming_operations || 0 }} upcoming</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bed Type Patients Modal -->
    <div v-if="showBedTypeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">Patients in {{ selectedBedType }}</h3>
          <button 
            @click="showBedTypeModal = false"
            class="text-gray-500 hover:text-gray-700"
          >✕</button>
        </div>

        <!-- Modal Content -->
        <div class="px-6 py-4">
          <div v-if="bedTypePatients.length > 0" class="space-y-3">
            <div v-for="bed in bedTypePatients" :key="bed.id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-bold text-gray-900">Bed #{{ bed.bed_number }}</p>
                  <p class="text-sm text-gray-500">Status: 
                    <span :class="bed.status === 'occupied' ? 'text-red-600' : 'text-green-600'">
                      {{ bed.status }}
                    </span>
                  </p>
                </div>
                <span class="text-sm font-bold text-gray-600">₹{{ bed.daily_rate }}/day</span>
              </div>

              <!-- Patient Info if occupied -->
              <div v-if="bed.patient_name" class="mt-3 bg-blue-50 rounded p-3">
                <p class="text-sm"><strong>Patient:</strong> {{ bed.patient_name }}</p>
                <p class="text-sm"><strong>Email:</strong> {{ bed.patient_email }}</p>
                <p class="text-sm"><strong>Phone:</strong> {{ bed.patient_phone }}</p>
                <p class="text-sm"><strong>Blood Group:</strong> {{ bed.patient?.blood_group || 'N/A' }}</p>
                <p v-if="bed.admitted_at" class="text-sm"><strong>Admitted:</strong> {{ bed.admitted_at }}</p>
              </div>
              <div v-else class="mt-3 text-sm text-gray-500">
                No patient assigned
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center text-gray-500">
            <p v-if="loadingBedType">Loading patients...</p>
            <p v-else>No beds found for {{ selectedBedType }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/authStore'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const router = useRouter()
const api = useApi()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref(null)
const dashboardData = ref({
  stats: {
    total_patients: 0,
    total_doctors: 0,
    today_appointments: 0,
    total_users: 0
  },
  recent_patients: [],
  top_doctors: [],
  department_load: [],
  nurse_role_breakdown: []
})

// New data variables for inventory
const bedStats = ref({
  total_beds: 0,
  available_beds: 0,
  occupied_beds: 0,
  occupancy_rate: 0,
  beds: [],
  bed_types: []
})

const equipmentStats = ref({
  total_equipment: 0,
  working: 0,
  under_maintenance: 0,
  repair: 0,
  working_percentage: 0
})

const otSchedules = ref([])
const otStats = ref({
  today_operations: 0,
  upcoming_operations: 0
})

// Bed Type Modal State
const showBedTypeModal = ref(false)
const selectedBedType = ref('')
const bedTypePatients = ref([])
const loadingBedType = ref(false)

// Format timestamp to readable date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get operation status color
const getOperationStatusColor = (status) => {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    postponed: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Fetch dashboard data
const fetchDashboardData = async () => {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.get('/admin/dashboard')
    dashboardData.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load dashboard data. Please try again.'
    console.error('Dashboard fetch error:', err)
  } finally {
    isLoading.value = false
  }
}

// Fetch bed statistics
const fetchBedStats = async () => {
  try {
    const response = await api.get('/admin/inventory/beds/stats')
    if (response.data.data) {
      bedStats.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to fetch bed stats:', err)
  }
}

// Fetch medical equipment statistics
const fetchEquipmentStats = async () => {
  try {
    const response = await api.get('/admin/inventory/equipment/stats')
    if (response.data.data) {
      equipmentStats.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to fetch equipment stats:', err)
  }
}

// Fetch operation schedules
const fetchOperationSchedules = async () => {
  try {
    const response = await api.get('/admin/inventory/operation-schedules?page=1&limit=10')
    if (response.data.data) {
      otSchedules.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to fetch operation schedules:', err)
  }
}

// Fetch OT statistics
const fetchOTStats = async () => {
  try {
    const response = await api.get('/admin/inventory/ot/stats')
    if (response.data.data) {
      otStats.value = response.data.data.operations_stats || {}
    }
  } catch (err) {
    console.error('Failed to fetch OT stats:', err)
  }
}

// Fetch patients in a specific bed type
const fetchPatientsByBedType = async (bedType) => {
  loadingBedType.value = true
  try {
    const response = await api.get(`/admin/inventory/beds/type/${bedType}`)
    if (response.data.data) {
      bedTypePatients.value = response.data.data
    }
  } catch (err) {
    console.error(`Failed to fetch patients for ${bedType}:`, err)
    bedTypePatients.value = []
  } finally {
    loadingBedType.value = false
  }
}

// Open bed type modal and fetch patients
const openBedTypeModal = (bedType) => {
  selectedBedType.value = bedType
  showBedTypeModal.value = true
  fetchPatientsByBedType(bedType)
}

// Load all data on component mount
onMounted(async () => {
  // Verify user is admin
  if (authStore.role !== 'admin') {
    error.value = 'Unauthorized: Admin access required'
    isLoading.value = false
    return
  }

  await Promise.all([
    fetchDashboardData(),
    fetchBedStats(),
    fetchEquipmentStats(),
    fetchOperationSchedules(),
    fetchOTStats()
  ])
})
</script>
