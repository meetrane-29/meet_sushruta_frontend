<template>
  <div class="notification-container">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification-toast', notification.type]"
      >
        <div class="notification-content">
          <div class="notification-header">
            <h4>{{ notification.title }}</h4>
            <button @click="close(notification.id)" class="close-btn">×</button>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          
          <!-- Appointment Details -->
          <div v-if="notification.type === 'appointment'" class="notification-details">
            <small>
              <strong>Patient:</strong> {{ notification.patientName }} <br />
              <strong>Time:</strong> {{ notification.appointmentTime }} <br />
              <strong>Reason:</strong> {{ notification.reason }}
            </small>
          </div>

          <!-- Lab Details -->
          <div v-if="notification.type === 'lab'" class="notification-details">
            <small>
              <strong>Test:</strong> {{ notification.testName }} <br />
              <strong>Patient:</strong> {{ notification.patientName }}
            </small>
            <button @click="viewResults(notification.data)" class="view-btn">
              View Results →
            </button>
          </div>

          <!-- Urgent Alert Details -->
          <div v-if="notification.type === 'urgent'" class="notification-urgent">
            <div class="urgency-indicator">URGENT - IMMEDIATE ACTION REQUIRED</div>
          </div>

          <!-- Message Details -->
          <div v-if="notification.type === 'message'" class="notification-details">
            <small>
              <strong>From:</strong> {{ notification.patientName }} <br />
              <strong>Preview:</strong> {{ notification.preview }}...
            </small>
            <button @click="openMessage(notification.data)" class="view-btn">
              Read Full Message →
            </button>
          </div>

          <!-- Discharge Details -->
          <div v-if="notification.type === 'discharge'" class="notification-details">
            <small>
              <strong>Patient:</strong> {{ notification.patientName }} <br />
              <strong>Bed:</strong> {{ notification.bedNumber }}
            </small>
            <button @click="processDischarge(notification.data)" class="action-btn">
              Start Discharge Process
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="notification.type === 'urgent'" class="notification-actions">
          <button @click="acknowledgeUrgent(notification.id)" class="btn-acknowledge">
            Acknowledge
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  notifications: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'action'])

const close = (id) => {
  emit('close', id)
}

const viewResults = (data) => {
  emit('action', { type: 'view-lab-results', data })
}

const openMessage = (data) => {
  emit('action', { type: 'open-message', data })
}

const processDischarge = (data) => {
  emit('action', { type: 'process-discharge', data })
}

const acknowledgeUrgent = (id) => {
  emit('action', { type: 'acknowledge-urgent', id })
  close(id)
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  pointer-events: none;
}

.notification-toast {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  pointer-events: auto;
  animation: slideIn 0.3s ease;
  border-left: 4px solid #007bff;
  max-width: 100%;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-leave-to {
  transform: translateX(400px);
  opacity: 0;
}

/* Type-specific colors */
.notification-toast.appointment {
  border-left-color: #007bff;
  background: linear-gradient(135deg, #f0f7ff 0%, #f0f0ff 100%);
}

.notification-toast.lab {
  border-left-color: #28a745;
  background: linear-gradient(135deg, #f0fff0 0%, #f0fff5 100%);
}

.notification-toast.urgent {
  border-left-color: #dc3545;
  border-width: 3px;
  background: linear-gradient(135deg, #fff0f0 0%, #ffe0e0 100%);
}

.notification-toast.message {
  border-left-color: #17a2b8;
  background: linear-gradient(135deg, #f0f8ff 0%, #f0ffff 100%);
}

.notification-toast.discharge {
  border-left-color: #ffc107;
  background: linear-gradient(135deg, #fffef0 0%, #fffff0 100%);
}

.notification-toast.success {
  border-left-color: #28a745;
}

.notification-toast.error {
  border-left-color: #dc3545;
}

.notification-toast.info {
  border-left-color: #17a2b8;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-header h4 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 0;
  margin-left: 8px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.notification-message {
  margin: 0 0 10px 0;
  color: #555;
  font-size: 13px;
  line-height: 1.4;
}

.notification-details {
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 10px;
  border-radius: 4px;
  margin: 8px 0;
  font-size: 12px;
}

.notification-details small {
  color: #555;
  line-height: 1.6;
}

.notification-details strong {
  color: #2c3e50;
}

.notification-urgent {
  background: #ffe0e0;
  border: 1px solid #ff9999;
  padding: 10px;
  border-radius: 4px;
  margin-top: 8px;
}

.urgency-indicator {
  color: #dc3545;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.view-btn,
.action-btn,
.btn-acknowledge {
  display: inline-block;
  margin-top: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn {
  background: #007bff;
  color: white;
}

.view-btn:hover {
  background: #0056b3;
}

.action-btn {
  background: #ffc107;
  color: #333;
}

.action-btn:hover {
  background: #ffb300;
}

.btn-acknowledge {
  background: #6c757d;
  color: white;
  width: 100%;
}

.btn-acknowledge:hover {
  background: #5a6268;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ddd;
}

/* Mobile responsive */
@media (max-width: 600px) {
  .notification-container {
    max-width: calc(100vw - 20px);
    left: 10px;
    right: 10px;
  }

  .notification-toast {
    font-size: 12px;
  }
}
</style>
