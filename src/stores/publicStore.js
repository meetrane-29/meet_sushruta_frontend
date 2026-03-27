import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/composables/useApi'

export const usePublicStore = defineStore('public', () => {
  const doctors = ref([])
  const specialties = ref([])
  const loading = ref(false)
  const error = ref('')

  // Fetch public data once and cache it
  const fetchPublicData = async () => {
    if (doctors.value.length > 0 && specialties.value.length > 0) {
      return // Already cached
    }

    loading.value = true
    error.value = ''
    try {
      const [doctorsRes, specialtiesRes] = await Promise.all([
        api.get('/doctors?limit=100'),
        api.get('/specialties')
      ])

      // Transform API response to match frontend expectations
      const rawDoctors = (doctorsRes.data?.data && Array.isArray(doctorsRes.data.data)) ? doctorsRes.data.data : []
      doctors.value = rawDoctors.map(doc => ({
        id: doc.id,
        name: `Dr. ${doc.user?.first_name || 'Dr'} ${doc.user?.last_name || ''}`.trim(),
        specialization: doc.specialization,
        experience: 10, // Default since API doesn't have experience field
        slug: doc.user?.first_name ? doc.user.first_name.toLowerCase() + '-' + (doc.user.last_name || '').toLowerCase() : 'unknown'
      }))
      specialties.value = specialtiesRes.data.data || []
    } catch (err) {
      console.error('Failed to fetch public data:', err)
      error.value = 'Failed to load public data'
    } finally {
      loading.value = false
    }
  }

  return {
    doctors,
    specialties,
    loading,
    error,
    fetchPublicData
  }
})
