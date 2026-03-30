import { ref, computed } from 'vue'

/**
 * Composable for managing offline data storage and sync
 * Supports draft prescriptions, notes, and other patient data
 */
export function useOfflineStorage() {
  const STORAGE_PREFIX = 'ms_offline_'
  const SYNC_QUEUE_KEY = `${STORAGE_PREFIX}sync_queue`
  const OFFLINE_FLAG_KEY = `${STORAGE_PREFIX}is_offline`

  const isOffline = ref(navigator.onLine === false)
  const syncQueue = ref([])
  const unsyncedCount = ref(0)

  // Initialize
  const initializeOfflineMode = () => {
    // Listen for online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load existing sync queue
    loadSyncQueue()
    updateUnsyncedCount()
  }

  const handleOnline = () => {
    isOffline.value = false
    console.log('[Offline] ✓ Back online!')
  }

  const handleOffline = () => {
    isOffline.value = true
    console.log('[Offline] ✗ Now offline')
  }

  // Draft Prescriptions
  const saveDraftPrescription = (prescription) => {
    const key = `${STORAGE_PREFIX}prescription_${prescription.patientId}_${Date.now()}`
    const data = {
      ...prescription,
      savedAt: new Date().toISOString(),
      status: 'draft'
    }
    localStorage.setItem(key, JSON.stringify(data))
    addToSyncQueue('prescription', 'create', data, key)
    updateUnsyncedCount()
    return key
  }

  const getDraftPrescriptions = (patientId = null) => {
    const prescriptions = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`${STORAGE_PREFIX}prescription_`)) {
        const data = JSON.parse(localStorage.getItem(key))
        if (!patientId || data.patientId === patientId) {
          prescriptions.push({ ...data, storageKey: key })
        }
      }
    }
    return prescriptions.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
  }

  const deleteDraftPrescription = (storageKey) => {
    localStorage.removeItem(storageKey)
    updateUnsyncedCount()
  }

  // Draft SOAP Notes
  const saveDraftSOAPNotes = (notes) => {
    const key = `${STORAGE_PREFIX}notes_${notes.patientId}_${Date.now()}`
    const data = {
      ...notes,
      savedAt: new Date().toISOString(),
      status: 'draft'
    }
    localStorage.setItem(key, JSON.stringify(data))
    addToSyncQueue('soap-notes', 'create', data, key)
    updateUnsyncedCount()
    return key
  }

  const getDraftNotes = (patientId = null) => {
    const notes = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`${STORAGE_PREFIX}notes_`)) {
        const data = JSON.parse(localStorage.getItem(key))
        if (!patientId || data.patientId === patientId) {
          notes.push({ ...data, storageKey: key })
        }
      }
    }
    return notes.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
  }

  const deleteDraftNotes = (storageKey) => {
    localStorage.removeItem(storageKey)
    updateUnsyncedCount()
  }

  // Search Index for offline patient search
  const buildPatientSearchIndex = (patients) => {
    const key = `${STORAGE_PREFIX}patient_search_index`
    const index = {
      timestamp: new Date().toISOString(),
      patients: patients.map(p => ({
        id: p.id,
        name: p.name.toLowerCase(),
        uhid: p.uhid,
        phone: p.phone,
        email: p.email
      }))
    }
    localStorage.setItem(key, JSON.stringify(index))
  }

  const searchPatientsOffline = (query) => {
    const key = `${STORAGE_PREFIX}patient_search_index`
    const indexStr = localStorage.getItem(key)
    if (!indexStr) return []

    const index = JSON.parse(indexStr)
    const q = query.toLowerCase()

    return index.patients.filter(p =>
      p.name.includes(q) || 
      p.uhid.includes(q) || 
      p.phone.includes(q) ||
      p.email.includes(q)
    )
  }

  // Sync Queue Management
  const addToSyncQueue = (type, action, data, storageKey) => {
    const queueItem = {
      id: `${type}_${action}_${Date.now()}`,
      type,
      action,
      data,
      storageKey,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3
    }
    syncQueue.value.push(queueItem)
    saveSyncQueue()
  }

  const saveSyncQueue = () => {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue.value))
  }

  const loadSyncQueue = () => {
    const data = localStorage.getItem(SYNC_QUEUE_KEY)
    syncQueue.value = data ? JSON.parse(data) : []
  }

  const updateUnsyncedCount = () => {
    const draftPrescriptions = getDraftPrescriptions()
    const draftNotes = getDraftNotes()
    unsyncedCount.value = draftPrescriptions.length + draftNotes.length + syncQueue.value.length
  }

  // Sync Process
  const syncOfflineData = async (apiClient) => {
    console.log(`[Offline] Starting sync of ${syncQueue.value.length} items...`)
    
    for (const item of syncQueue.value) {
      if (item.attempts >= item.maxAttempts) {
        console.warn(`[Offline] Max attempts reached for ${item.id}`)
        continue
      }

      try {
        let endpoint = ''
        let method = 'post'

        switch (item.type) {
          case 'prescription':
            endpoint = '/prescriptions'
            break
          case 'soap-notes':
            endpoint = '/soap-notes'
            break
          default:
            continue
        }

        // Make API call
        const response = await apiClient[method](endpoint, item.data)
        
        // Remove from local storage if sync succeeded
        if (item.storageKey) {
          localStorage.removeItem(item.storageKey)
        }

        // Remove from sync queue
        syncQueue.value = syncQueue.value.filter(q => q.id !== item.id)
        saveSyncQueue()
        
        console.log(`[Offline] ✓ Synced ${item.id}`)
      } catch (error) {
        item.attempts++
        console.warn(`[Offline] Failed to sync ${item.id}:`, error.message)
      }
    }

    saveSyncQueue()
    updateUnsyncedCount()
    console.log(`[Offline] Sync complete. ${syncQueue.value.length} items pending.`)
  }

  // Clear all offline data
  const clearOfflineData = () => {
    const keysToDelete = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key))
    syncQueue.value = []
    unsyncedCount.value = 0
  }

  // Get offline stats
  const getOfflineStats = () => {
    return {
      isOffline: isOffline.value,
      unsyncedItems: unsyncedCount.value,
      draftPrescriptions: getDraftPrescriptions().length,
      draftNotes: getDraftNotes().length,
      syncQueueLength: syncQueue.value.length,
      storageUsed: getStorageUsed()
    }
  }

  const getStorageUsed = () => {
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        total += localStorage.getItem(key).length
      }
    }
    return `${(total / 1024).toFixed(2)} KB`
  }

  return {
    // State
    isOffline,
    unsyncedCount,
    syncQueue,

    // Initialization
    initializeOfflineMode,

    // Prescription Management
    saveDraftPrescription,
    getDraftPrescriptions,
    deleteDraftPrescription,

    // SOAP Notes Management
    saveDraftSOAPNotes,
    getDraftNotes,
    deleteDraftNotes,

    // Offline Search
    buildPatientSearchIndex,
    searchPatientsOffline,

    // Sync Management
    syncOfflineData,
    addToSyncQueue,
    clearOfflineData,

    // Stats
    getOfflineStats,
    getStorageUsed
  }
}
