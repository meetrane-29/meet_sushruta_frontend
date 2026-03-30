<template>
  <div class="notification-bell">
    <!-- Bell icon with badge -->
    <button
      v-tooltip="unreadCount > 0 ? `${unreadCount} new notifications` : 'No new notifications'"
      class="bell-icon"
      :class="{ 'has-unread': unreadCount > 0 }"
      @click="togglePanel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
        />
      </svg>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>

    <!-- Dropdown panel -->
    <transition name="panel">
      <div v-if="isOpen" class="notification-panel">
        <!-- Panel header -->
        <div class="panel-header">
          <h3>Notifications</h3>
          <button v-if="notifications.length > 0" @click="clearAll" class="clear-btn">
            Clear All
          </button>
        </div>

        <!-- Filter tabs -->
        <div class="filter-tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab"
            :class="['tab', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Notification list -->
        <div class="notification-list">
          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <p>No notifications</p>
          </div>

          <div
            v-for="notification in filteredNotifications.slice(0, 10)"
            :key="notification.id"
            :class="['notification-item', notification.type, { unread: !notification.read }]"
            @click="markAsRead(notification.id)"
          >
            <!-- Icon -->
            <div class="notification-icon">
              <svg
                v-if="notification.type === 'appointment'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"
                />
              </svg>
              <svg
                v-else-if="notification.type === 'lab'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-2h3v-3h-3v3z"
                />
              </svg>
              <svg
                v-else-if="notification.type === 'urgent'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                />
              </svg>
              <svg
                v-else-if="notification.type === 'message'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                />
              </svg>
            </div>

            <!-- Content -->
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ truncate(notification.message, 60) }}</div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>

            <!-- Unread indicator -->
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>

          <div v-if="notifications.length > 10" class="view-all">
            <button @click="goToNotificationCenter" class="btn-link">
              View all notifications →
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Click outside to close -->
    <div v-if="isOpen" class="panel-overlay" @click="closePanel"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationService } from '@/composables/useNotificationService'
import { useRouter } from 'vue-router'

const router = useRouter()
const { notifications, markAsRead, getUnreadCount } = useNotificationService()

const isOpen = ref(false)
const activeTab = ref('All')
const filterTabs = ['All', 'Urgent', 'Appointments', 'Labs', 'Messages']

const unreadCount = computed(() => getUnreadCount())

const filteredNotifications = computed(() => {
  if (activeTab.value === 'All') return notifications.value

  const typeMap = {
    Urgent: 'urgent',
    Appointments: 'appointment',
    Labs: 'lab',
    Messages: 'message'
  }

  return notifications.value.filter((n) => n.type === typeMap[activeTab.value])
})

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const closePanel = () => {
  isOpen.value = false
}

const clearAll = () => {
  notifications.value.forEach((n) => markAsRead(n.id))
  closePanel()
}

const truncate = (text, length) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatTime = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

const goToNotificationCenter = () => {
  router.push('/dashboard/notifications')
  closePanel()
}

// Close panel when clicking outside
const handleClickOutside = (e) => {
  if (isOpen.value && !e.target.closest('.notification-bell')) {
    closePanel()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-block;
}

.bell-icon {
  position: relative;
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bell-icon:hover {
  background: #f0f0f0;
  color: #333;
}

.bell-icon.has-unread {
  color: #ff6b6b;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(255, 107, 107, 0.3);
}

.notification-panel {
  position: absolute;
  top: 45px;
  right: 0;
  width: 360px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 2001;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.clear-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #0056b3;
}

.filter-tabs {
  display: flex;
  overflow: auto;
  padding: 8px;
  gap: 4px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.tab {
  background: none;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  transition: all 0.2s;
  color: #555;
}

.tab:hover {
  border-color: #007bff;
  color: #007bff;
}

.tab.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #f9f9f9;
}

.notification-item.unread {
  background: #f0f7ff;
}

.notification-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.notification-item.appointment .notification-icon {
  background: #007bff;
}

.notification-item.lab .notification-icon {
  background: #28a745;
}

.notification-item.urgent .notification-icon {
  background: #dc3545;
}

.notification-item.message .notification-icon {
  background: #17a2b8;
}

.notification-item.discharge .notification-icon {
  background: #ffc107;
}

.notification-item.success .notification-icon {
  background: #28a745;
}

.notification-item.error .notification-icon {
  background: #dc3545;
}

.notification-item.info .notification-icon {
  background: #17a2b8;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 13px;
  color: #2c3e50;
  margin-bottom: 2px;
}

.notification-message {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  line-height: 1.3;
}

.notification-time {
  font-size: 11px;
  color: #999;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.view-all {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.btn-link {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  transition: color 0.2s;
}

.btn-link:hover {
  color: #0056b3;
}

.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.2s ease;
}

.panel-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.panel-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Scrollbar styling */
.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.notification-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>

<style>
/* Global tooltip style if needed */
[v-tooltip] {
  position: relative;
}
</style>
