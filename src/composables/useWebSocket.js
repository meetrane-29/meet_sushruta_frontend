import { ref, computed } from 'vue'

/**
 * WebSocket Composable for Real-time Notifications
 * Handles connection, reconnection, and listening for events
 */
export function useWebSocket() {
  const WS_URL = `${import.meta.env.VITE_API_URL?.replace('http', 'ws') || 'ws://localhost:8080'}/notifications`

  const ws = ref(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = ref(5)
  const reconnectDelay = ref(1000)

  const listeners = {
    appointment: [],
    lab: [],
    urgent: [],
    message: [],
    discharge: [],
    general: []
  }

  const connect = (userId, userRole) => {
    console.log(`[WebSocket] Connecting to ${WS_URL}...`)
    
    try {
      ws.value = new WebSocket(WS_URL)
      
      ws.value.onopen = () => {
        console.log('[WebSocket] ✓ Connected')
        isConnected.value = true
        reconnectAttempts.value = 0
        
        // Send authentication
        if (userId && userRole) {
          send({
            type: 'auth',
            userId,
            userRole,
            timestamp: new Date().toISOString()
          })
        }
      }

      ws.value.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data)
          handleNotification(notification)
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err)
        }
      }

      ws.value.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        isConnected.value = false
      }

      ws.value.onclose = () => {
        console.log('[WebSocket] ✗ Disconnected')
        isConnected.value = false
        attemptReconnect(userId, userRole)
      }
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error)
      attemptReconnect(userId, userRole)
    }
  }

  const attemptReconnect = (userId, userRole) => {
    if (reconnectAttempts.value < maxReconnectAttempts.value) {
      reconnectAttempts.value++
      const delay = reconnectDelay.value * Math.pow(2, reconnectAttempts.value - 1)
      console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value})...`)
      
      setTimeout(() => {
        connect(userId, userRole)
      }, delay)
    } else {
      console.error('[WebSocket] Max reconnect attempts reached')
    }
  }

  const send = (data) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    }
  }

  const handleNotification = (notification) => {
    console.log('[Notification] Received:', notification.type, notification)
    
    const { type, data } = notification
    const callbacks = listeners[type] || listeners.general

    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (err) {
        console.error('[Notification] Callback error:', err)
      }
    })

    // Play sound if enabled
    playNotificationSound(type)
  }

  const playNotificationSound = (type) => {
    try {
      // Use Web Audio API or simple beep
      const context = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      
      // Different frequencies for different notification types
      const frequencies = {
        appointment: 800,
        lab: 600,
        urgent: 1000,
        message: 400,
        discharge: 700,
        general: 500
      }
      
      oscillator.frequency.value = frequencies[type] || 500
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)
      
      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.5)
    } catch (err) {
      console.error('[Sound] Failed to play notification sound:', err)
    }
  }

  const on = (type, callback) => {
    if (listeners[type]) {
      listeners[type].push(callback)
    }
  }

  const off = (type, callback) => {
    if (listeners[type]) {
      listeners[type] = listeners[type].filter(cb => cb !== callback)
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
  }

  return {
    connect,
    disconnect,
    send,
    on,
    off,
    isConnected
  }
}
