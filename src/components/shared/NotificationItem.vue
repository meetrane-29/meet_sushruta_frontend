<template>
  <div :class="['notification-item', notification.type, { unread: !notification.read }]">
    <!-- Icon -->
    <div class="item-icon">
      <Component :is="iconComponent" />
    </div>

    <!-- Content -->
    <div class="item-content">
      <h4 class="item-title">{{ notification.title }}</h4>
      <p class="item-message">{{ notification.message }}</p>

      <!-- Type-specific details -->
      <div v-if="notification.type === 'appointment'" class="item-details">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"
          />
        </svg>
        <span>
          <strong>{{ notification.patientName }}</strong> - {{ notification.appointmentTime }}
        </span>
      </div>

      <div v-if="notification.type === 'lab'" class="item-details">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-2h3v-3h-3v3z"
          />
        </svg>
        <span><strong>{{ notification.testName }}</strong> for {{ notification.patientName }}</span>
      </div>

      <div v-if="notification.type === 'urgent'" class="item-details urgent-details">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
          />
        </svg>
        <span class="urgent-tag">URGENT - REQUIRES IMMEDIATE ATTENTION</span>
      </div>

      <div v-if="notification.type === 'message'" class="item-details">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
          />
        </svg>
        <span>From: <strong>{{ notification.patientName }}</strong></span>
      </div>

      <div v-if="notification.type === 'discharge'" class="item-details">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
          />
        </svg>
        <span>Patient: <strong>{{ notification.patientName }}</strong></span>
      </div>

      <!-- Timestamp -->
      <div class="item-timestamp">{{ formatTime(notification.timestamp) }}</div>
    </div>

    <!-- Actions -->
    <div class="item-actions">
      <button v-if="!notification.read" @click="handleMarkAsRead" class="btn-read">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
      </button>
      <button @click="handleDismiss" class="btn-dismiss">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
        </svg>
      </button>
    </div>

    <!-- Unread indicator dot -->
    <div v-if="!notification.read" class="unread-dot"></div>
  </div>
</template>

<script setup>
import { defineComponent, h, computed } from 'vue'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['dismiss', 'mark-as-read', 'action'])

// Icon components for each notification type
const AppointmentIcon = defineComponent({
  render: () =>
    h(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24' },
      h('path', {
        fill: 'currentColor',
        d: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z'
      })
    )
})

const LabIcon = defineComponent({
  render: () =>
    h(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24' },
      h('path', {
        fill: 'currentColor',
        d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-2h3v-3h-3v3z'
      })
    )
})

const UrgentIcon = defineComponent({
  render: () =>
    h(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24' },
      h('path', {
        fill: 'currentColor',
        d: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
      })
    )
})

const MessageIcon = defineComponent({
  render: () =>
    h(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24' },
      h('path', {
        fill: 'currentColor',
        d: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'
      })
    )
})

const SuccessIcon = defineComponent({
  render: () =>
    h(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24' },
      h('path', {
        fill: 'currentColor',
        d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
      })
    )
})

const iconMap = {
  appointment: AppointmentIcon,
  lab: LabIcon,
  urgent: UrgentIcon,
  message: MessageIcon,
  discharge: SuccessIcon,
  success: SuccessIcon,
  error: UrgentIcon,
  info: MessageIcon
}

const iconComponent = computed(() => iconMap[props.notification.type] || MessageIcon)

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

const handleMarkAsRead = () => {
  emit('mark-as-read', { id: props.notification.id })
}

const handleDismiss = () => {
  emit('dismiss', { id: props.notification.id })
}
</script>

<style scoped>
.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
  transition: all 0.2s;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification-item.unread {
  background: linear-gradient(135deg, #f0f7ff 0%, #f0f0ff 100%);
  border-color: #bde4ff;
}

.notification-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.notification-item.appointment .item-icon {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.notification-item.lab .item-icon {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
}

.notification-item.urgent .item-icon {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.notification-item.message .item-icon {
  background: linear-gradient(135deg, #17a2b8 0%, #0c5460 100%);
}

.notification-item.discharge .item-icon {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
}

.notification-item.success .item-icon {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
}

.notification-item.error .item-icon {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.notification-item.info .item-icon {
  background: linear-gradient(135deg, #17a2b8 0%, #0c5460 100%);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.item-message {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #555;
  line-height: 1.4;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0;
  font-size: 12px;
  color: #666;
  background: rgba(0, 0, 0, 0.02);
  padding: 6px 8px;
  border-radius: 4px;
}

.item-details svg {
  flex-shrink: 0;
  opacity: 0.6;
}

.urgent-details {
  background: #ffe0e0;
  border: 1px solid #ffb3b3;
}

.urgent-tag {
  color: #dc3545;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.item-timestamp {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  padding-left: 8px;
  border-left: 1px solid #e0e0e0;
}

.btn-read,
.btn-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-read:hover {
  background: #f0f0f0;
  color: #007bff;
}

.btn-dismiss:hover {
  background: #f0f0f0;
  color: #dc3545;
}

.unread-dot {
  position: absolute;
  top: 12px;
  left: 8px;
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
