import { ref, reactive } from 'vue'

/**
 * Notification Service for managing and displaying notifications
 */
export function useNotificationService() {
  const notifications = ref([])
  let notificationId = 0

  const NOTIFICATION_TYPES = {
    APPOINTMENT: 'appointment',
    LAB: 'lab',
    URGENT: 'urgent',
    MESSAGE: 'message',
    DISCHARGE: 'discharge',
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info'
  }

  const NOTIFICATION_DURATION = {
    appointment: 5000,
    lab: 5000,
    urgent: 10000,      // Longer for urgent alerts
    message: 5000,
    discharge: 5000,
    success: 4000,
    error: 6000,
    info: 4000
  }

  const add = (notification) => {
    const id = ++notificationId
    const notif = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification
    }

    notifications.value.unshift(notif)

    // Auto-remove after duration
    const duration = NOTIFICATION_DURATION[notification.type] || 5000
    setTimeout(() => {
      remove(id)
    }, duration)

    return id
  }

  const remove = (id) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const clear = () => {
    notifications.value = []
  }

  const addAppointment = (data) => {
    return add({
      type: NOTIFICATION_TYPES.APPOINTMENT,
      title: '📅 New Appointment',
      message: `${data.patientName} scheduled for ${data.time}`,
      patientName: data.patientName,
      appointmentTime: data.time,
      reason: data.reason,
      data
    })
  }

  const addLabResult = (data) => {
    return add({
      type: NOTIFICATION_TYPES.LAB,
      title: '🧪 Lab Result Ready',
      message: `Lab test results for ${data.patientName} are ready`,
      patientName: data.patientName,
      testName: data.testName,
      status: 'completed',
      data
    })
  }

  const addUrgentAlert = (data) => {
    return add({
      type: NOTIFICATION_TYPES.URGENT,
      title: '⚠️ URGENT: ' + (data.title || 'Urgent Alert'),
      message: data.message,
      severity: 'critical',
      priority: 'high',
      data
    })
  }

  const addPatientMessage = (data) => {
    return add({
      type: NOTIFICATION_TYPES.MESSAGE,
      title: '💬 Patient Message',
      message: `New message from ${data.patientName}`,
      patientName: data.patientName,
      preview: data.message?.substring(0, 50),
      data
    })
  }

  const addDischargeAlert = (data) => {
    return add({
      type: NOTIFICATION_TYPES.DISCHARGE,
      title: '👋 Patient Ready for Discharge',
      message: `${data.patientName} - Bed ${data.bedNumber}`,
      patientName: data.patientName,
      bedNumber: data.bedNumber,
      data
    })
  }

  const addSuccess = (message) => {
    return add({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: '✅ Success',
      message
    })
  }

  const addError = (message) => {
    return add({
      type: NOTIFICATION_TYPES.ERROR,
      title: '❌ Error',
      message
    })
  }

  const addInfo = (message) => {
    return add({
      type: NOTIFICATION_TYPES.INFO,
      title: 'ℹ️ Info',
      message
    })
  }

  const markAsRead = (id) => {
    const notif = notifications.value.find(n => n.id === id)
    if (notif) {
      notif.read = true
    }
  }

  const getUnreadCount = () => {
    return notifications.value.filter(n => !n.read).length
  }

  const getByType = (type) => {
    return notifications.value.filter(n => n.type === type)
  }

  return {
    notifications,
    NOTIFICATION_TYPES,

    // Generic methods
    add,
    remove,
    clear,
    markAsRead,
    
    // Specific notification methods
    addAppointment,
    addLabResult,
    addUrgentAlert,
    addPatientMessage,
    addDischargeAlert,
    addSuccess,
    addError,
    addInfo,

    // Query methods
    getUnreadCount,
    getByType
  }
}
