import { ref } from 'vue'
import { useApi } from './useApi'

/**
 * usePatientApi - Composable for patient-related API operations
 * Provides methods to fetch, create, update, and delete patient records
 */
export function usePatientApi() {
  const api = useApi()
  const loading = ref(false)
  const error = ref(null)

  /**
   * Fetch all patients with pagination and search
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page
   * @param {string} search - Search query (optional)
   * @returns {Promise} Response with patients data and metadata
   */
  const fetchPatients = async (page = 1, limit = 10, search = '') => {
    loading.value = true
    error.value = null

    try {
      const params = {
        page,
        limit,
      }

      if (search && search.trim()) {
        params.search = search.trim()
      }

      const response = await api.get('/patients', { params })

      // Handle different response formats from backend
      const data = response.data?.data || response.data

      return {
        patients: data.patients || data.data || data || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit,
        totalPages: Math.ceil((data.total || 0) / limit),
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch patients'
      console.error('[usePatientApi] fetchPatients error:', err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single patient by ID
   * @param {string} patientId - Patient ID (UUID)
   * @returns {Promise} Patient data
   */
  const fetchPatientById = async (patientId) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/patients/${patientId}`)
      return response.data?.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch patient'
      console.error('[usePatientApi] fetchPatientById error:', err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a patient's information
   * @param {string} patientId - Patient ID
   * @param {object} data - Patient data to update
   * @returns {Promise} Updated patient data
   */
  const updatePatient = async (patientId, data) => {
    loading.value = true
    error.value = null

    try {
      // Prepare update data - only send fields that are being updated
      const updateData = {}

      // User-related fields
      if (data.first_name !== undefined) updateData.first_name = data.first_name
      if (data.last_name !== undefined) updateData.last_name = data.last_name
      if (data.email !== undefined) updateData.email = data.email
      if (data.phone !== undefined) updateData.phone = data.phone

      // Patient-specific fields
      if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth
      if (data.gender !== undefined) updateData.gender = data.gender
      if (data.blood_group !== undefined) updateData.blood_group = data.blood_group
      if (data.address !== undefined) updateData.address = data.address
      if (data.medical_history !== undefined) updateData.medical_history = data.medical_history
      if (data.allergies !== undefined) updateData.allergies = data.allergies
      if (data.chronic_conditions !== undefined) updateData.chronic_conditions = data.chronic_conditions
      if (data.emergency_contact !== undefined) updateData.emergency_contact = data.emergency_contact
      if (data.emergency_contact_name !== undefined) updateData.emergency_contact_name = data.emergency_contact_name
      if (data.emergency_contact_phone !== undefined) updateData.emergency_contact_phone = data.emergency_contact_phone

      const response = await api.patch(`/patients/${patientId}`, updateData)
      return response.data?.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update patient'
      console.error('[usePatientApi] updatePatient error:', err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise} Success response
   */
  const deletePatient = async (patientId) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.del(`/patients/${patientId}`)
      return response.data?.data || response.data || { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete patient'
      console.error('[usePatientApi] deletePatient error:', err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Get patient's medical records
   * @param {string} patientId - Patient ID
   * @returns {Promise} Medical records data
   */
  const fetchPatientMedicalRecords = async (patientId) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/patients/${patientId}/medical-records`)
      return response.data?.data || response.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch medical records'
      console.error('[usePatientApi] fetchPatientMedicalRecords error:', err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Get patient's appointments
   * @param {string} patientId - Patient ID
   * @returns {Promise} Appointments data
   */
  const fetchPatientAppointments = async (patientId) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/patients/${patientId}/appointments`)
      return response.data?.data || response.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch appointments'
      console.error('[usePatientApi] fetchPatientAppointments error:', err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Get patient's prescriptions
   * @param {string} patientId - Patient ID
   * @returns {Promise} Prescriptions data
   */
  const fetchPatientPrescriptions = async (patientId) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/patients/${patientId}/prescriptions`)
      return response.data?.data || response.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch prescriptions'
      console.error('[usePatientApi] fetchPatientPrescriptions error:', err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchPatients,
    fetchPatientById,
    fetchPatientMedicalRecords,
    fetchPatientAppointments,
    fetchPatientPrescriptions,
    updatePatient,
    deletePatient,
  }
}

export default usePatientApi
