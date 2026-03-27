<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Doctors Management</h1>
        <p class="text-gray-600 mt-1">View and manage all doctors in the system</p>
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

    <!-- Search and Filter -->
    <div v-if="!loading && !error" class="flex flex-col md:flex-row gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or specialization..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        v-model="selectedSpecialization"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Specializations</option>
        <option v-for="spec in specializations" :key="spec" :value="spec">
          {{ spec }}
        </option>
      </select>
    </div>

    <!-- Doctors Grid -->
    <div v-if="!loading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="doctor in filteredDoctors"
        :key="doctor.id"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
      >
        <!-- Doctor Avatar -->
        <div class="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-5xl">
          👨‍⚕️
        </div>

        <!-- Doctor Info -->
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900">{{ doctor.user?.first_name }} {{ doctor.user?.last_name }}</h3>
          <p class="text-blue-600 font-medium mt-1">{{ doctor.specialization }}</p>
          <p class="text-sm text-gray-600 mt-2">{{ doctor.department || 'General' }}</p>
          
          <!-- Consultation Fee -->
          <div class="mt-3 pt-3 border-t border-gray-200">
            <p class="text-sm text-gray-600">Consultation Fee</p>
            <p class="text-lg font-semibold text-gray-900">₹{{ doctor.consultation_fee || '--' }}</p>
          </div>

          <!-- Status Badge -->
          <div class="mt-4">
            <span
              :class="{
                'bg-green-100 text-green-800': doctor.user?.active,
                'bg-gray-100 text-gray-800': !doctor.user?.active
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ doctor.user?.active ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 flex gap-2">
            <button
              @click="viewDoctorDetails(doctor)"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              View Details
            </button>
            <button
              @click="editDoctor(doctor)"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredDoctors.length === 0" class="col-span-full py-12 text-center text-gray-600">
        <p class="text-lg">No doctors found</p>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="!loading && !error && doctors.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Total Doctors</p>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ doctors.length }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Active Doctors</p>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ activeDoctors }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Specializations</p>
        <p class="text-3xl font-bold text-blue-600 mt-2">{{ uniqueSpecializations }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const api = useApi()
const doctors = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedSpecialization = ref('')

const specializations = computed(() => {
  const specs = new Set()
  doctors.value.forEach(doc => {
    if (doc.specialization) {
      specs.add(doc.specialization)
    }
  })
  return Array.from(specs).sort()
})

const filteredDoctors = computed(() => {
  return doctors.value.filter(doc => {
    const name = `${doc.user?.first_name || ''} ${doc.user?.last_name || ''}`.toLowerCase()
    const spec = (doc.specialization || '').toLowerCase()
    const search = searchQuery.value.toLowerCase()

    const matchesSearch = name.includes(search) || spec.includes(search)
    const matchesSpec = !selectedSpecialization.value || doc.specialization === selectedSpecialization.value

    return matchesSearch && matchesSpec
  })
})

const activeDoctors = computed(() => {
  return doctors.value.filter(doc => doc.user?.active).length
})

const uniqueSpecializations = computed(() => {
  return specializations.value.length
})

const refreshData = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/doctors')
    doctors.value = response.data.data || response.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load doctors. Please try again.'
    console.error('Doctors fetch error:', err)
  } finally {
    loading.value = false
  }
}

const viewDoctorDetails = (doctor) => {
  console.log('View doctor details:', doctor)
  // Can be expanded to show a modal or navigate to detail page
}

const editDoctor = (doctor) => {
  console.log('Edit doctor:', doctor)
  // Can be expanded to show an edit modal
}

onMounted(() => {
  refreshData()
})
</script>
