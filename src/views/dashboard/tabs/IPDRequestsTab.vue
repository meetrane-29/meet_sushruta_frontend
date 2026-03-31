<template>
  <div class="ipd-requests">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-lg font-bold text-gray-800">IPD Admission Requests</h3>
        <p class="text-sm text-gray-500">Active IPD patients with requesting doctor</p>
      </div>
      <button @click="loadAdmissions" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
        Refresh
      </button>
    </div>

    <!-- Filter -->
    <div class="flex flex-wrap gap-3 mb-5">
      <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="discharged">Discharged</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search patient or doctor name..."
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-300 focus:outline-none"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10 text-gray-400">Loading IPD requests...</div>

    <!-- Table -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requesting Doctor</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ward / Bed</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admission Date</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Emergency</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="adm in filteredAdmissions"
            :key="adm.id"
            class="hover:bg-gray-50 transition"
          >
            <td class="px-4 py-3 font-medium text-gray-900">{{ adm.patient_name }}</td>
            <td class="px-4 py-3">
              <span class="font-semibold text-blue-700">Dr. {{ adm.doctor_name }}</span>
            </td>
            <td class="px-4 py-3 text-gray-600">
              <span>{{ adm.ward || 'N/A' }}</span>
              <span v-if="adm.bed_number" class="ml-1 text-xs text-gray-400">(#{{ adm.bed_number }})</span>
            </td>
            <td class="px-4 py-3 text-gray-600 max-w-xs truncate" :title="adm.reason">{{ adm.reason || '—' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ adm.admission_date }}</td>
            <td class="px-4 py-3">
              <span :class="statusBadge(adm.status)" class="px-2 py-1 rounded-full text-xs font-semibold">
                {{ adm.status }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span v-if="adm.is_emergency" class="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                EMERGENCY
              </span>
              <span v-else class="text-gray-400 text-xs">—</span>
            </td>
          </tr>
          <tr v-if="filteredAdmissions.length === 0">
            <td colspan="7" class="px-4 py-10 text-center text-gray-400">No IPD admissions found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-4 text-sm text-gray-600">
      <span>Showing {{ filteredAdmissions.length }} of {{ totalAdmissions }} records</span>
      <div class="flex gap-2">
        <button
          @click="prevPage"
          :disabled="page <= 1"
          class="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Prev
        </button>
        <span class="px-3 py-1.5">{{ page }}</span>
        <button
          @click="nextPage"
          :disabled="admissions.length < limit"
          class="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const api = useApi()

const admissions = ref([])
const loading = ref(false)
const filterStatus = ref('active')
const searchQuery = ref('')
const page = ref(1)
const limit = 20
const totalAdmissions = ref(0)

const filteredAdmissions = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return admissions.value.filter(a => {
    if (filterStatus.value && a.status !== filterStatus.value) return false
    if (q && !a.patient_name?.toLowerCase().includes(q) && !a.doctor_name?.toLowerCase().includes(q)) return false
    return true
  })
})

const statusBadge = (status) => {
  const map = {
    active:     'bg-green-100 text-green-700',
    discharged: 'bg-gray-100 text-gray-600',
    cancelled:  'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

const loadAdmissions = async () => {
  loading.value = true
  try {
    const res = await api.get(`/admissions?page=${page.value}&limit=${limit}`)
    const data = res.data?.data || {}
    admissions.value = data.admissions || []
    totalAdmissions.value = data.total || admissions.value.length
  } catch (err) {
    console.error('Failed to load admissions:', err)
  } finally {
    loading.value = false
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    loadAdmissions()
  }
}

const nextPage = () => {
  page.value++
  loadAdmissions()
}

onMounted(loadAdmissions)
</script>
