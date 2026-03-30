<template>
  <div id="app">
    <!-- Top Navigation with Notification Bell & Offline Indicator -->
    <div v-if="showAppBars" class="app-header">
      <div class="header-content">
        <div class="header-brand">Meet Sushruta</div>
        <div class="header-actions">
          <OfflineIndicator />
          <NotificationBell />
        </div>
      </div>
    </div>

    <!-- Main Router View -->
    <RouterView />

    <!-- Global Notification Center (Toast Notifications) -->
    <NotificationCenter
      :notifications="recentNotifications"
      @close="removeNotification"
      @action="handleNotificationAction"
    />
  </div>
</template>

<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import OfflineIndicator from '@/components/shared/OfflineIndicator.vue'
import NotificationBell from '@/components/shared/NotificationBell.vue'
import NotificationCenter from '@/components/shared/NotificationCenter.vue'
import { useWebSocket } from '@/composables/useWebSocket'
import { useNotificationService } from '@/composables/useNotificationService'

const router = useRouter()
const route = useRoute()

// WebSocket and Notification Services
const { connect, disconnect, on, off, isConnected } = useWebSocket()
const { notifications, add, remove, markAsRead } = useNotificationService()

// Show app bars only on certain routes
const showAppBars = computed(() => {
  const hiddenRoutes = ['/login', '/register', '/admin-registration', '/not-found']
  return !hiddenRoutes.includes(route.path)
})

// Show only recent notifications in center (last 5)
const recentNotifications = computed(() => {
  return notifications.value.slice(0, 5)
})

// Handle notification removal from center
const removeNotification = (id) => {
  remove(id)
}

// Handle notification actions
const handleNotificationAction = (action) => {
  switch (action.type) {
    case 'view-lab-results':
      router.push(`/dashboard/lab-results/${action.data.labId}`)
      break
    case 'open-message':
      router.push(`/dashboard/messages/${action.data.messageId}`)
      break
    case 'process-discharge':
      router.push(`/dashboard/discharges/${action.data.patientId}`)
      break
    case 'acknowledge-urgent':
      markAsRead(action.id)
      break
  }
}

// Initialize WebSocket on mount
onMounted(async () => {
  // Get user info from localStorage or auth store
  const authData = localStorage.getItem('auth')
  if (authData) {
    try {
      const user = JSON.parse(authData)
      const userId = user.id || user.userId
      const userRole = user.role || 'doctor'

      // Connect to WebSocket
      await connect(userId, userRole)

      // Listen for different notification types
      on('appointment', (data) => {
        add({
          type: 'appointment',
          title: 'New Appointment',
          message: `Appointment scheduled with patient ${data.patientName}`,
          patientName: data.patientName,
          appointmentTime: data.appointmentTime,
          reason: data.reason,
          data
        })
      })

      on('lab', (data) => {
        add({
          type: 'lab',
          title: 'Lab Results Ready',
          message: `Lab results are ready for ${data.testName}`,
          testName: data.testName,
          patientName: data.patientName,
          data
        })
      })

      on('urgent', (data) => {
        add({
          type: 'urgent',
          title: '⚠️ URGENT ALERT',
          message: data.message,
          data
        })
      })

      on('message', (data) => {
        add({
          type: 'message',
          title: 'Patient Message',
          message: `New message from ${data.patientName}`,
          patientName: data.patientName,
          preview: data.message?.substring(0, 50),
          data
        })
      })

      on('discharge', (data) => {
        add({
          type: 'discharge',
          title: 'Discharge Alert',
          message: `Patient ${data.patientName} is ready for discharge`,
          patientName: data.patientName,
          bedNumber: data.bedNumber,
          data
        })
      })

      on('general', (data) => {
        add({
          type: 'info',
          title: data.title || 'Notification',
          message: data.message,
          data
        })
      })
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  disconnect()
  off('appointment')
  off('lab')
  off('urgent')
  off('message')
  off('discharge')
  off('general')
})
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-brand {
  font-size: 18px;
  font-weight: 700;
  color: #007bff;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

@media (max-width: 768px) {
  .app-header {
    padding: 8px 12px;
  }

  .header-content {
    padding: 8px 12px;
  }

  .header-brand {
    font-size: 16px;
  }

  .header-actions {
    gap: 12px;
  }
}
</style>