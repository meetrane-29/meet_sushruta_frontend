<template>
  <div class="bed-management">
    <!-- Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
        <p class="text-xs text-green-600 uppercase font-semibold">Available</p>
        <p class="text-3xl font-bold text-green-700">{{ stats.available }}</p>
      </div>
      <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
        <p class="text-xs text-blue-600 uppercase font-semibold">Occupied</p>
        <p class="text-3xl font-bold text-blue-700">{{ stats.occupied }}</p>
      </div>
      <div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
        <p class="text-xs text-yellow-600 uppercase font-semibold">Maintenance</p>
        <p class="text-3xl font-bold text-yellow-700">{{ stats.maintenance }}</p>
      </div>
      <div class="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4">
        <p class="text-xs text-gray-500 uppercase font-semibold">Total</p>
        <p class="text-3xl font-bold text-gray-700">{{ stats.total }}</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-wrap gap-3 mb-5">
      <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option value="">All Statuses</option>
        <option value="available">Available</option>
        <option value="occupied">Occupied</option>
        <option value="maintenance">Maintenance</option>
        <option value="reserved">Reserved</option>
      </select>
      <select v-model="filterWard" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option value="">All Wards</option>
        <option v-for="ward in uniqueWards" :key="ward" :value="ward">{{ ward }}</option>
      </select>
      <button @click="loadBeds" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
        Refresh
      </button>
      <span class="self-center text-xs text-gray-400">Auto-refreshes every 30s</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10 text-gray-500">Loading beds...</div>

    <!-- Beds Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="bed in filteredBeds"
        :key="bed.id"
        :class="[
          'rounded-lg border-2 p-4 transition',
          bed.status === 'available'   ? 'border-green-300 bg-green-50' :
          bed.status === 'occupied'    ? 'border-blue-300 bg-blue-50' :
          bed.status === 'maintenance' ? 'border-yellow-300 bg-yellow-50' :
          'border-gray-300 bg-gray-50'
        ]"
      >
        <div class="flex items-start justify-between mb-1">
          <div>
            <p class="font-bold text-gray-900">Bed #{{ bed.bed_number }}</p>
            <p class="text-xs text-gray-500">{{ bed.ward }} Ward &bull; {{ bed.bed_type }}</p>
          </div>
          <span :class="statusBadge(bed.status)" class="text-xs px-2 py-1 rounded-full font-semibold">
            {{ bed.status }}
          </span>
        </div>

        <!-- Patient name on occupied beds -->
        <div v-if="bed.status === 'occupied'" class="mt-2 mb-1 bg-white bg-opacity-70 rounded p-2">
          <p class="text-sm font-semibold text-blue-800">
            Patient: {{ bed.patient_name || 'Unknown' }}
          </p>
          <p v-if="bed.admitted_at" class="text-xs text-gray-500">Admitted: {{ bed.admitted_at }}</p>
        </div>

        <p v-if="bed.daily_rate" class="text-xs text-gray-500 mt-1 mb-2">₹{{ bed.daily_rate }}/day</p>

        <!-- Action Buttons -->
        <div class="flex gap-2 mt-2">
          <button
            v-if="bed.status === 'available'"
            @click="openAdmitModal(bed)"
            class="flex-1 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Admit Patient
          </button>

          <button
            v-if="bed.status === 'occupied'"
            @click="openDischargeModal(bed)"
            class="flex-1 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Discharge
          </button>

          <button
            @click="openStatusModal(bed)"
            class="py-1.5 px-3 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Update
          </button>
        </div>
      </div>

      <div v-if="filteredBeds.length === 0 && !loading" class="col-span-3 text-center py-10 text-gray-400">
        No beds found matching filters
      </div>
    </div>

    <!-- ── Admit Patient Modal ── -->
    <div v-if="showAdmitModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="text-lg font-bold text-gray-800">Admit Patient to Bed #{{ selectedBed?.bed_number }}</h3>
          <button @click="closeAdmitModal" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div class="p-5 space-y-4">
          <!-- Patient Search -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search Patient</label>
            <input
              v-model="patientSearchQuery"
              @input="onPatientSearch"
              type="text"
              placeholder="Type name or phone number..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
              autocomplete="off"
            />
            <!-- Search Results Dropdown -->
            <div
              v-if="patientSearchResults.length > 0 && !selectedPatient"
              class="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto"
            >
              <button
                v-for="p in patientSearchResults"
                :key="p.id"
                @click="selectPatient(p)"
                class="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition text-sm border-b border-gray-100 last:border-0"
              >
                <span class="font-semibold text-gray-900">{{ p.user?.first_name }} {{ p.user?.last_name }}</span>
                <span class="text-gray-400 ml-2 text-xs">{{ p.user?.phone }}</span>
              </button>
            </div>
            <p v-if="patientSearchLoading" class="text-xs text-gray-400 mt-1">Searching...</p>
            <p v-if="patientSearchQuery.length > 1 && patientSearchResults.length === 0 && !patientSearchLoading && !selectedPatient" class="text-xs text-gray-400 mt-1">No patients found</p>
          </div>

          <!-- Selected Patient Display -->
          <div v-if="selectedPatient" class="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div>
              <p class="text-sm font-bold text-blue-800">{{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</p>
              <p class="text-xs text-blue-500">{{ selectedPatient.user?.phone }}</p>
            </div>
            <button @click="clearPatientSelection" class="text-blue-400 hover:text-red-500 text-sm font-medium">Change</button>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              v-model="admitForm.notes"
              rows="2"
              placeholder="Any admission notes"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            ></textarea>
          </div>
          <p v-if="admitError" class="text-red-600 text-sm bg-red-50 p-2 rounded">{{ admitError }}</p>
        </div>
        <div class="flex gap-3 p-5 border-t">
          <button @click="closeAdmitModal" class="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
          <button
            @click="submitAdmit"
            :disabled="admitting || !selectedPatient"
            class="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ admitting ? 'Admitting...' : 'Admit Patient' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Discharge Modal ── -->
    <div v-if="showDischargeModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="flex items-center justify-between p-5 border-b">
          <div>
            <h3 class="text-lg font-bold text-gray-800">Discharge from Bed #{{ selectedBed?.bed_number }}</h3>
            <p v-if="selectedBed?.patient_name" class="text-sm text-gray-500 mt-0.5">Patient: {{ selectedBed.patient_name }}</p>
          </div>
          <button @click="showDischargeModal = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div class="p-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Discharge Notes (optional)</label>
            <textarea
              v-model="dischargeForm.discharge_notes"
              rows="3"
              placeholder="Reason for discharge, condition at discharge, etc."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            ></textarea>
          </div>
          <p v-if="dischargeError" class="text-red-600 text-sm mt-2 bg-red-50 p-2 rounded">{{ dischargeError }}</p>
        </div>
        <div class="flex gap-3 p-5 border-t">
          <button @click="showDischargeModal = false" class="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
          <button @click="submitDischarge" :disabled="discharging" class="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition font-medium disabled:opacity-50">
            {{ discharging ? 'Discharging...' : 'Confirm Discharge' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Update Status Modal ── -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div class="flex items-center justify-between p-5 border-b">
          <h3 class="text-lg font-bold text-gray-800">Update Bed #{{ selectedBed?.bed_number }}</h3>
          <button @click="showStatusModal = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div class="p-5">
          <label class="block text-sm font-medium text-gray-700 mb-1">New Status</label>
          <select v-model="newStatus" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>
          <p v-if="statusError" class="text-red-600 text-sm mt-2 bg-red-50 p-2 rounded">{{ statusError }}</p>
        </div>
        <div class="flex gap-3 p-5 border-t">
          <button @click="showStatusModal = false" class="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
          <button @click="submitStatus" :disabled="updatingStatus" class="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition font-medium disabled:opacity-50">
            {{ updatingStatus ? 'Updating...' : 'Update Status' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApi } from '@/composables/useApi'

const api = useApi()

const beds = ref([])
const loading = ref(false)
const filterStatus = ref('')
const filterWard = ref('')

// Modals
const showAdmitModal = ref(false)
const showDischargeModal = ref(false)
const showStatusModal = ref(false)
const selectedBed = ref(null)

// Patient search state
const patientSearchQuery = ref('')
const patientSearchResults = ref([])
const patientSearchLoading = ref(false)
const selectedPatient = ref(null)
let searchDebounce = null

const admitForm = ref({ notes: '' })
const admitError = ref('')
const admitting = ref(false)

const dischargeForm = ref({ discharge_notes: '' })
const dischargeError = ref('')
const discharging = ref(false)

const newStatus = ref('available')
const statusError = ref('')
const updatingStatus = ref(false)

// Auto-refresh interval
let pollInterval = null

const stats = computed(() => {
  const s = { available: 0, occupied: 0, maintenance: 0, total: beds.value.length }
  beds.value.forEach(b => {
    if (b.status === 'available') s.available++
    else if (b.status === 'occupied') s.occupied++
    else if (b.status === 'maintenance') s.maintenance++
  })
  return s
})

const uniqueWards = computed(() => [...new Set(beds.value.map(b => b.ward).filter(Boolean))])

const filteredBeds = computed(() => {
  return beds.value.filter(b => {
    if (filterStatus.value && b.status !== filterStatus.value) return false
    if (filterWard.value && b.ward !== filterWard.value) return false
    return true
  })
})

const statusBadge = (status) => {
  const map = {
    available:   'bg-green-100 text-green-700',
    occupied:    'bg-blue-100 text-blue-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    reserved:    'bg-purple-100 text-purple-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const loadBeds = async () => {
  loading.value = true
  try {
    const res = await api.get('/beds/all?limit=200')
    beds.value = res.data?.data?.beds || []
  } catch (err) {
    console.error('Failed to load beds:', err)
  } finally {
    loading.value = false
  }
}

// ── Patient search ──
const onPatientSearch = () => {
  selectedPatient.value = null
  clearTimeout(searchDebounce)
  if (patientSearchQuery.value.length < 2) {
    patientSearchResults.value = []
    return
  }
  searchDebounce = setTimeout(async () => {
    patientSearchLoading.value = true
    try {
      const res = await api.get(`/patients?search=${encodeURIComponent(patientSearchQuery.value)}&limit=10`)
      const data = res.data?.data
      patientSearchResults.value = data?.patients || (Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Patient search failed:', err)
      patientSearchResults.value = []
    } finally {
      patientSearchLoading.value = false
    }
  }, 300)
}

const selectPatient = (patient) => {
  selectedPatient.value = patient
  patientSearchQuery.value = `${patient.user?.first_name || ''} ${patient.user?.last_name || ''}`.trim()
  patientSearchResults.value = []
}

const clearPatientSelection = () => {
  selectedPatient.value = null
  patientSearchQuery.value = ''
  patientSearchResults.value = []
}

// ── Modal openers ──
const openAdmitModal = (bed) => {
  selectedBed.value = bed
  admitForm.value = { notes: '' }
  admitError.value = ''
  patientSearchQuery.value = ''
  patientSearchResults.value = []
  selectedPatient.value = null
  showAdmitModal.value = true
}

const closeAdmitModal = () => {
  showAdmitModal.value = false
  clearPatientSelection()
}

const openDischargeModal = (bed) => {
  selectedBed.value = bed
  dischargeForm.value = { discharge_notes: '' }
  dischargeError.value = ''
  showDischargeModal.value = true
}

const openStatusModal = (bed) => {
  selectedBed.value = bed
  newStatus.value = bed.status
  statusError.value = ''
  showStatusModal.value = true
}

// ── Submit actions ──
const submitAdmit = async () => {
  if (!selectedPatient.value) {
    admitError.value = 'Please search and select a patient first'
    return
  }
  admitting.value = true
  admitError.value = ''
  try {
    await api.post('/beds/admit', {
      bed_id: selectedBed.value.id,
      patient_id: selectedPatient.value.id,
      notes: admitForm.value.notes
    })
    closeAdmitModal()
    await loadBeds()
  } catch (err) {
    admitError.value = err.response?.data?.message || err.response?.data?.error || 'Failed to admit patient'
  } finally {
    admitting.value = false
  }
}

const submitDischarge = async () => {
  discharging.value = true
  dischargeError.value = ''
  try {
    await api.post('/beds/discharge', {
      bed_id: selectedBed.value.id,
      discharge_notes: dischargeForm.value.discharge_notes
    })
    showDischargeModal.value = false
    await loadBeds()
  } catch (err) {
    dischargeError.value = err.response?.data?.message || err.response?.data?.error || 'Failed to discharge patient'
  } finally {
    discharging.value = false
  }
}

const submitStatus = async () => {
  updatingStatus.value = true
  statusError.value = ''
  try {
    await api.patch(`/beds/${selectedBed.value.id}/status`, { status: newStatus.value })
    showStatusModal.value = false
    await loadBeds()
  } catch (err) {
    statusError.value = err.response?.data?.message || err.response?.data?.error || 'Failed to update status'
  } finally {
    updatingStatus.value = false
  }
}

onMounted(() => {
  loadBeds()
  // Auto-refresh every 30 seconds
  pollInterval = setInterval(loadBeds, 30000)
})

onUnmounted(() => {
  clearInterval(pollInterval)
  clearTimeout(searchDebounce)
})
</script>
