<template>
  <div v-if="showIndicator" class="offline-indicator" :class="{ 'is-offline': isOffline }">
    <div class="indicator-content">
      <span v-if="isOffline" class="offline-badge">
        📡 Offline Mode
      </span>
      <span v-else-if="unsyncedCount > 0" class="sync-badge">
        🔄 {{ unsyncedCount }} item{{ unsyncedCount !== 1 ? 's' : '' }} to sync
      </span>
      <span v-else class="online-badge">
        ✓ Online
      </span>
      
      <button v-if="!isOffline && unsyncedCount > 0" @click="syncNow" class="sync-btn">
        Sync Now
      </button>
    </div>

    <!-- Expanded Details -->
    <div v-if="expanded" class="indicator-details">
      <div class="detail-row">
        <span>Draft Prescriptions:</span>
        <strong>{{ stats.draftPrescriptions }}</strong>
      </div>
      <div class="detail-row">
        <span>Draft Notes:</span>
        <strong>{{ stats.draftNotes }}</strong>
      </div>
      <div class="detail-row">
        <span>Sync Queue:</span>
        <strong>{{ stats.syncQueueLength }}</strong>
      </div>
      <div class="detail-row">
        <span>Storage Used:</span>
        <strong>{{ stats.storageUsed }}</strong>
      </div>
      <button v-if="stats.unsyncedItems > 0" @click="clearData" class="clear-btn">
        Clear Offline Data
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOfflineStorage } from '@/composables/useOfflineStorage'
import { useApi } from '@/composables/useApi'

const { 
  isOffline, 
  unsyncedCount, 
  syncOfflineData, 
  getOfflineStats, 
  clearOfflineData 
} = useOfflineStorage()
const { get, post } = useApi()

const expanded = ref(false)
const stats = ref({
  isOffline: false,
  unsyncedItems: 0,
  draftPrescriptions: 0,
  draftNotes: 0,
  syncQueueLength: 0,
  storageUsed: '0 KB'
})

const showIndicator = ref(false)
const syncing = ref(false)

const updateStats = () => {
  stats.value = getOfflineStats()
  showIndicator.value = isOffline.value || unsyncedCount.value > 0
}

const syncNow = async () => {
  syncing.value = true
  try {
    await syncOfflineData({ get, post })
    updateStats()
    alert('✓ Sync completed!')
  } catch (error) {
    alert('✗ Sync failed: ' + error.message)
  } finally {
    syncing.value = false
  }
}

const clearData = () => {
  if (confirm('Are you sure you want to clear all offline data?')) {
    clearOfflineData()
    updateStats()
    alert('✓ Offline data cleared')
  }
}

onMounted(() => {
  updateStats()
  // Update stats every 5 seconds
  setInterval(updateStats, 5000)
})
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  cursor: pointer;
  max-width: 300px;
  transition: all 0.3s ease;
}

.offline-indicator.is-offline {
  background: #fff3cd;
  border: 2px solid #ffc107;
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  user-select: none;
  font-weight: 500;
}

.offline-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ff6b6b;
  font-weight: 600;
}

.sync-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ffc107;
}

.online-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #28a745;
  font-size: 12px;
}

.sync-btn {
  margin-left: auto;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.sync-btn:hover {
  background: #0056b3;
}

.sync-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.indicator-details {
  border-top: 1px solid #ddd;
  padding: 12px 16px;
  background: #f9f9f9;
  border-radius: 0 0 8px 8px;
  font-size: 13px;
  max-height: 200px;
  overflow-y: auto;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-row:last-of-type {
  border-bottom: none;
}

.detail-row span {
  color: #666;
}

.detail-row strong {
  color: #2c3e50;
  font-weight: 600;
}

.clear-btn {
  margin-top: 10px;
  width: 100%;
  padding: 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.clear-btn:hover {
  background: #c82333;
}
</style>
