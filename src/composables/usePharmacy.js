import { ref } from 'vue'
import { useApi } from './useApi'

export function usePharmacy() {
  const { get, post, patch, delete: deleteRequest } = useApi()
  
  // State
  const medicines = ref([])
  const lowStockMedicines = ref([])
  const expiringMedicines = ref([])
  const dispenseHistory = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
  })

  // ========== Medicine CRUD ==========

  /**
   * Create a new medicine
   */
  const createMedicine = async (medicineData) => {
    loading.value = true
    error.value = null
    try {
      const response = await post('/pharmacy/medicines', medicineData)
      medicines.value.unshift(response)
      return response
    } catch (err) {
      error.value = err.message || 'Failed to create medicine'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get all medicines with pagination and search
   */
  const listMedicines = async (page = 1, limit = 10, search = '') => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
      })
      const response = await get(`/pharmacy/medicines?${params.toString()}`)
      medicines.value = response.data || []
      pagination.value = {
        total: response.total || 0,
        page,
        limit,
      }
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch medicines'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get a single medicine by ID
   */
  const getMedicine = async (id) => {
    loading.value = true
    error.value = null
    try {
      return await get(`/pharmacy/medicines/${id}`)
    } catch (err) {
      error.value = err.message || 'Failed to fetch medicine'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a medicine
   */
  const updateMedicine = async (id, medicineData) => {
    loading.value = true
    error.value = null
    try {
      const response = await patch(`/pharmacy/medicines/${id}`, medicineData)
      // Update in local list
      const index = medicines.value.findIndex(m => m.id === id)
      if (index !== -1) {
        medicines.value[index] = response
      }
      return response
    } catch (err) {
      error.value = err.message || 'Failed to update medicine'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a medicine (soft delete)
   */
  const deleteMedicine = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteRequest(`/pharmacy/medicines/${id}`)
      medicines.value = medicines.value.filter(m => m.id !== id)
    } catch (err) {
      error.value = err.message || 'Failed to delete medicine'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========== Stock Management ==========

  /**
   * Add stock to a medicine
   */
  const addStock = async (medicineId, quantity, reason = '') => {
    loading.value = true
    error.value = null
    try {
      const response = await patch(`/pharmacy/medicines/${medicineId}/stock`, {
        quantity,
        reason,
      })
      // Update in local list
      const index = medicines.value.findIndex(m => m.id === medicineId)
      if (index !== -1) {
        medicines.value[index] = response
      }
      return response
    } catch (err) {
      error.value = err.message || 'Failed to add stock'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove stock from a medicine
   */
  const removeStock = async (medicineId, quantity, reason = '') => {
    loading.value = true
    error.value = true
    try {
      const response = await patch(`/pharmacy/medicines/${medicineId}/stock`, {
        quantity: -quantity,
        reason,
      })
      // Update in local list
      const index = medicines.value.findIndex(m => m.id === medicineId)
      if (index !== -1) {
        medicines.value[index] = response
      }
      return response
    } catch (err) {
      error.value = err.message || 'Failed to remove stock'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get medicines with low stock
   */
  const getLowStockMedicines = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const response = await get(`/pharmacy/medicines/low-stock?page=${page}&limit=${limit}`)
      lowStockMedicines.value = response.data || []
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch low-stock medicines'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get medicines expiring within 30 days
   */
  const getExpiringMedicines = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const response = await get(`/pharmacy/medicines/expiring?page=${page}&limit=${limit}`)
      expiringMedicines.value = response.data || []
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch expiring medicines'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========== Dispensing ==========

  /**
   * Dispense medication for a prescription
   */
  const dispenseMedicine = async (prescriptionId) => {
    loading.value = true
    error.value = null
    try {
      return await post('/pharmacy/dispense', {
        prescription_id: prescriptionId,
      })
    } catch (err) {
      error.value = err.message || 'Failed to dispense medicine'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get dispense history for a prescription
   */
  const getDispenseHistory = async (prescriptionId) => {
    loading.value = true
    error.value = null
    try {
      const response = await get(`/pharmacy/dispense/${prescriptionId}`)
      dispenseHistory.value = response || []
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch dispense history'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========== Dashboard Stats ==========

  /**
   * Get pharmacy dashboard statistics
   */
  const getDashboardStats = async () => {
    loading.value = true
    error.value = null
    try {
      // Fetch all required data in parallel
      const [allMeds, lowStock, expiring] = await Promise.all([
        get('/pharmacy/medicines?page=1&limit=1'),
        get('/pharmacy/medicines/low-stock?page=1&limit=1'),
        get('/pharmacy/medicines/expiring?page=1&limit=1'),
      ])

      return {
        totalMedicines: allMeds.total || 0,
        lowStockCount: lowStock.total || 0,
        expiringCount: expiring.total || 0,
        lowStockMedicines: lowStock.data || [],
        expiringMedicines: expiring.data || [],
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch dashboard stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    medicines,
    lowStockMedicines,
    expiringMedicines,
    dispenseHistory,
    loading,
    error,
    pagination,

    // Medicine CRUD
    createMedicine,
    listMedicines,
    getMedicine,
    updateMedicine,
    deleteMedicine,

    // Stock Management
    addStock,
    removeStock,
    getLowStockMedicines,
    getExpiringMedicines,

    // Dispensing
    dispenseMedicine,
    getDispenseHistory,

    // Dashboard
    getDashboardStats,
  }
}
