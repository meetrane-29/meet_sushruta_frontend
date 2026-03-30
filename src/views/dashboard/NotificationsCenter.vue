<template>
  <div class="notifications-center">
    <!-- Header -->
    <div class="header">
      <h1>📬 Notification Center</h1>
      <div class="header-actions">
        <button @click="markAllAsRead" class="btn-mark-all" v-if="unreadCount > 0">
          Mark All as Read
        </button>
        <button @click="clearAll" class="btn-clear" v-if="notifications.length > 0">
          Clear All
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-label">Total Notifications</span>
        <span class="stat-value">{{ notifications.length }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Unread</span>
        <span class="stat-value unread">{{ unreadCount }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Urgent</span>
        <span class="stat-value urgent">{{ urgentCount }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label>Filter by Type:</label>
        <div class="filter-buttons">
          <button
            v-for="type in filterTypes"
            :key="type"
            :class="['filter-btn', { active: activeFilter === type }]"
            @click="activeFilter = type"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label>Filter by Status:</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Statuses</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
        </select>
      </div>

      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search notifications..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Notifications List -->
    <div class="notifications-list">
      <div v-if="filteredNotifications.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
          <path fill="currentColor" opacity="0.5" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
        <p>{{ emptyStateMessage }}</p>
      </div>

      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        :class="['notification-card', notification.type, { unread: !notification.read }]"
      >
        <!-- Icon -->
        <div class="card-icon">
          <svg
            v-if="notification.type === 'appointment'"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
            width="24"
            height="24"
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
            width="24"
            height="24"
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
            width="24"
            height="24"
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
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </div>

        <!-- Content -->
        <div class="card-content">
          <div class="content-header">
            <h3>{{ notification.title }}</h3>
            <span v-if="!notification.read" class="badge-unread">New</span>
            <span v-if="notification.type === 'urgent'" class="badge-urgent">Urgent</span>
          </div>

          <p class="content-message">{{ notification.message }}</p>

          <!-- Type-specific details -->
          <div v-if="notification.type === 'appointment'" class="content-details">
            <p>
              <strong>Patient:</strong> {{ notification.patientName }}<br />
              <strong>Time:</strong> {{ notification.appointmentTime }}<br />
              <strong>Reason:</strong> {{ notification.reason }}
            </p>
          </div>

          <div v-if="notification.type === 'lab'" class="content-details">
            <p>
              <strong>Test:</strong> {{ notification.testName }}<br />
              <strong>Patient:</strong> {{ notification.patientName }}
            </p>
          </div>

          <div v-if="notification.type === 'message'" class="content-details">
            <p>
              <strong>From:</strong> {{ notification.patientName }}<br />
              <strong>Preview:</strong> {{ notification.preview }}...
            </p>
          </div>

          <div v-if="notification.type === 'discharge'" class="content-details">
            <p>
              <strong>Patient:</strong> {{ notification.patientName }} (Bed {{ notification.bedNumber }})
            </p>
          </div>

          <div class="content-timestamp">{{ formatTime(notification.timestamp) }}</div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <button
            v-if="!notification.read"
            @click="handleMarkAsRead(notification.id)"
            class="btn-action btn-mark-read"
            title="Mark as read"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </button>

          <button
            @click="handleAction(notification)"
            class="btn-action btn-view"
            v-if="notification.type !== 'info'"
            :title="`View ${notification.type}`"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              />
            </svg>
          </button>

          <button
            @click="handleRemove(notification.id)"
            class="btn-action btn-delete"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationService } from '@/composables/useNotificationService'

const router = useRouter()
const { notifications, markAsRead, remove, clear } = useNotificationService()

const activeFilter = ref('All')
const statusFilter = ref('')
const searchQuery = ref('')

const filterTypes = ['All', 'Appointment', 'Lab', 'Urgent', 'Message', 'Discharge', 'System']

const typeMap = {
  Appointment: 'appointment',
  Lab: 'lab',
  Urgent: 'urgent',
  Message: 'message',
  Discharge: 'discharge',
  System: ['success', 'error', 'info']
}

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const urgentCount = computed(() => {
  return notifications.value.filter(n => n.type === 'urgent').length
})

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  // Filter by type
  if (activeFilter.value !== 'All') {
    const typeFilter = typeMap[activeFilter.value]
    if (Array.isArray(typeFilter)) {
      filtered = filtered.filter(n => typeFilter.includes(n.type))
    } else {
      filtered = filtered.filter(n => n.type === typeFilter)
    }
  }

  // Filter by status
  if (statusFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.read)
  } else if (statusFilter.value === 'read') {
    filtered = filtered.filter(n => n.read)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      n =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        (n.patientName && n.patientName.toLowerCase().includes(query))
    )
  }

  return filtered
})

const emptyStateMessage = computed(() => {
  if (notifications.value.length === 0) {
    return 'No notifications yet'
  }
  if (searchQuery.value) {
    return 'No notifications match your search'
  }
  if (activeFilter.value !== 'All') {
    return `No ${activeFilter.value.toLowerCase()} notifications`
  }
  return 'No unread notifications'
})

const formatTime = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now - date

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

const handleMarkAsRead = (id) => {
  markAsRead(id)
}

const handleRemove = (id) => {
  remove(id)
}

const handleAction = (notification) => {
  switch (notification.type) {
    case 'appointment':
      router.push(`/dashboard/appointments/${notification.data?.appointmentId || ''}`)
      break
    case 'lab':
      router.push(`/dashboard/lab-results/${notification.data?.labId || ''}`)
      break
    case 'message':
      router.push(`/dashboard/messages/${notification.data?.messageId || ''}`)
      break
    case 'discharge':
      router.push(`/dashboard/discharges/${notification.data?.patientId || ''}`)
      break
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => {
    if (!n.read) {
      markAsRead(n.id)
    }
  })
}

const clearAll = () => {
  if (confirm('Are you sure you want to clear all notifications?')) {
    clear()
  }
}
</script>

<style scoped>
.notifications-center {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-mark-all,
.btn-clear {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-mark-all:hover {
  background: #e8f4f8;
  border-color: #007bff;
  color: #007bff;
}

.btn-clear:hover {
  background: #ffe8e8;
  border-color: #dc3545;
  color: #dc3545;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat {
  background: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-value.unread {
  color: #007bff;
}

.stat-value.urgent {
  color: #dc3545;
}

.filters {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.filter-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  background: white;
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.25);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  color: #999;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

.notification-card {
  display: flex;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  border-left: 4px solid #e0e0e0;
}

.notification-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.notification-card.unread {
  background: #f0f7ff;
  border-left-color: #007bff;
}

.notification-card.appointment {
  border-left-color: #007bff;
}

.notification-card.lab {
  border-left-color: #28a745;
}

.notification-card.urgent {
  border-left-color: #dc3545;
}

.notification-card.message {
  border-left-color: #17a2b8;
}

.notification-card.discharge {
  border-left-color: #ffc107;
}

.card-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.notification-card.appointment .card-icon {
  background: #007bff;
}

.notification-card.lab .card-icon {
  background: #28a745;
}

.notification-card.urgent .card-icon {
  background: #dc3545;
}

.notification-card.message .card-icon {
  background: #17a2b8;
}

.notification-card.discharge .card-icon {
  background: #ffc107;
}

.notification-card.success .card-icon {
  background: #28a745;
}

.notification-card.error .card-icon {
  background: #dc3545;
}

.notification-card.info .card-icon {
  background: #17a2b8;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.content-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 600;
}

.badge-unread {
  display: inline-block;
  padding: 2px 8px;
  background: #007bff;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

.badge-urgent {
  display: inline-block;
  padding: 2px 8px;
  background: #dc3545;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

.content-message {
  margin: 6px 0;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.content-details {
  margin: 10px 0;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}

.content-details p {
  margin: 0;
  line-height: 1.6;
}

.content-timestamp {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  align-items: center;
}

.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  background: #f0f0f0;
}

.btn-mark-read:hover {
  color: #007bff;
}

.btn-view:hover {
  color: #17a2b8;
}

.btn-delete:hover {
  color: #dc3545;
}

@media (max-width: 768px) {
  .notifications-center {
    padding: 12px;
  }

  .header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .header h1 {
    font-size: 22px;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .notification-card {
    flex-direction: column;
  }

  .card-icon {
    width: 40px;
    height: 40px;
  }

  .card-actions {
    justify-content: flex-end;
  }

  .filter-buttons {
    flex-direction: column;
  }

  .filter-btn {
    width: 100%;
  }
}
</style>
