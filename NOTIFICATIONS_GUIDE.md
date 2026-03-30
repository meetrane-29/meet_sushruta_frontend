# Real-Time Notifications & Patient Rating System - Complete Guide

## Overview

This guide covers the complete implementation of real-time notifications and patient rating system for the Meet Sushruta medical platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vue 3)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │   App    │  │  useWebSocket()  │  │useNotification() │   │
│  │   Vue    │  │      Service     │  │    Service       │   │
│  └──────────┘  └──────────────────┘  └──────────────────┘   │
│         │              │                       │              │
│         ├─→ ┌─────────────────────────────────┴──┐           │
│         │   │  NotificationBell                  │           │
│         │   │  (dropdown history)                │           │
│         │   └────────────────────────────────────┘           │
│         │                                                     │
│         ├─→ ┌─────────────────────────────────────┐          │
│         │   │  NotificationCenter                 │          │
│         │   │  (toast notifications)              │          │
│         │   └─────────────────────────────────────┘          │
│         │                                                     │
│         └─→ ┌─────────────────────────────────────────────┐  │
│             │  Dashboard: NotificationsCenter             │  │
│             │  (Full history with filtering)              │  │
│             └─────────────────────────────────────────────┘  │
│                                                               │
│         ┌──────────────────────────────────────┐             │
│         │  PatientRatingSystem                 │             │
│         │  - Rating summary cards              │             │
│         │  - Distribution chart                │             │
│         │  - Reviews list                      │             │
│         │  - Rating form                       │             │
│         └──────────────────────────────────────┘             │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    WebSocket Connection                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│         ws://localhost:8080/notifications                    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                   Backend (Go/Gin)                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WebSocket Handler: /notifications                  │   │
│  │  - Handle client connections                        │   │
│  │  - Authenticate users                              │   │
│  │  - Manage subscription groups                       │   │
│  │  - Broadcast notifications                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Notification Service                               │   │
│  │  - Create notifications for different events        │   │
│  │  - Push to connected clients                        │   │
│  │  - Store notification history (optional)            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Events that trigger notifications:                 │   │
│  │  - New appointment scheduled                        │   │
│  │  - Lab results ready                                │   │
│  │  - Urgent alerts (critical patient events)          │   │
│  │  - Patient messages/inquiries                       │   │
│  │  - Patient discharge readiness                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Components

### 1. useWebSocket.js Composable

**Location:** `src/composables/useWebSocket.js`

**Features:**
- WebSocket connection management
- Auto-reconnect with exponential backoff (1s → 2s → 4s → 8s → 16s)
- Event listener pattern
- Sound notifications
- Error handling

**Usage:**
```javascript
import { useWebSocket } from '@/composables/useWebSocket'

const { connect, disconnect, on, off, send, isConnected } = useWebSocket()

// Connect to WebSocket
connect(userId, userRole)

// Listen for notifications
on('appointment', (data) => {
  console.log('New appointment:', data)
})

// Send custom messages
send({ type: 'custom', data: {...} })

// Disconnect
disconnect()
```

### 2. useNotificationService.js Composable

**Location:** `src/composables/useNotificationService.js`

**Features:**
- Notification state management
- 8 notification types
- Auto-dismiss timers
- Unread tracking
- Type-specific notification creators

**Usage:**
```javascript
import { useNotificationService } from '@/composables/useNotificationService'

const { 
  notifications, 
  add, 
  remove, 
  clear,
  markAsRead,
  addAppointment,
  addLabResult,
  addUrgentAlert,
  getUnreadCount
} = useNotificationService()

// Add custom notification
add({
  type: 'info',
  title: 'Hello',
  message: 'Test notification'
})

// Add specific type
addAppointment({
  patientName: 'John Doe',
  time: '10:00 AM',
  reason: 'Checkup'
})

// Get unread count
const count = getUnreadCount()
```

### 3. NotificationCenter.vue

**Location:** `src/components/shared/NotificationCenter.vue`

**Purpose:** Toast notification display at top-right of screen

**Features:**
- Fixed position toast notifications
- Type-specific styling and icons
- Auto-dismiss with transitions
- Detailed information display
- Action buttons (Mark read, Dismiss)

**Props:**
```javascript
{
  notifications: Array,  // Array of notification objects
}
```

**Events:**
```javascript
@close="removeNotification"          // Notification dismissed
@action="handleNotificationAction"   // Action button clicked
```

**Supported Notification Types:**
- `appointment` - New appointment
- `lab` - Lab results ready
- `urgent` - Urgent alerts
- `message` - Patient messages
- `discharge` - Discharge readiness
- `success` - Success messages
- `error` - Error messages
- `info` - Informational messages

### 4. NotificationBell.vue

**Location:** `src/components/shared/NotificationBell.vue`

**Purpose:** Notification bell icon with history dropdown

**Features:**
- Bell icon with unread badge
- Dropdown panel with last 10 notifications
- Filter tabs (All, Urgent, Appointments, Labs, Messages)
- Mark as read / View functionality

**Usage:**
```vue
<NotificationBell />
```

### 5. NotificationItem.vue

**Location:** `src/components/shared/NotificationItem.vue`

**Purpose:** Reusable notification card component

**Features:**
- Type-specific icons and styling
- Mark as read button
- Delete button
- Animated entrance/exit
- Unread indicator pulse

**Props:**
```javascript
{
  notification: {
    id: number,
    type: string,
    title: string,
    message: string,
    timestamp: Date,
    read: boolean,
    // ...type-specific fields
  }
}
```

**Events:**
```javascript
@dismiss="removeNotification"
@mark-as-read="markAsRead"
@action="handleAction"
```

### 6. NotificationsCenter Page

**Location:** `src/views/dashboard/NotificationsCenter.vue`

**Route:** `/dashboard/notifications`

**Purpose:** Full notification history and management

**Features:**
- Show all notifications with pagination
- Filter by type and status
- Search functionality
- Mark all as read
- Clear all
- Statistics (total, unread, urgent)

### 7. PatientRatingSystem.vue

**Location:** `src/views/PatientRatingSystem.vue`

**Features:**
- Overall rating summary
- Rating distribution chart
- Recent reviews section
- Filter by doctor and rating
- Multi-category rating form

## Setup & Integration

### Step 1: Install Dependencies

No additional dependencies required. The implementation uses Vue 3's built-in features and Web APIs.

### Step 2: App.vue Integration

The main App.vue already includes:
- NotificationBell integration
- NotificationCenter integration
- OfflineIndicator integration
- WebSocket initialization
- Event listener setup for all notification types

### Step 3: Environment Configuration

Set the WebSocket URL in your `.env` file:

```env
VITE_API_URL=http://localhost:8080
```

The WebSocket URL will be automatically derived from the API URL:
- If `VITE_API_URL=http://localhost:8080` → WebSocket: `ws://localhost:8080/notifications`
- If `VITE_API_URL=https://api.example.com` → WebSocket: `wss://api.example.com/notifications`

### Step 4: Accessing Features

Users can access notifications through:

1. **Bell Icon (Header)** - Quick access to recent notifications
2. **Toast Notifications** - Auto-displayed system-wide
3. **Full Notification Center** - `/dashboard/notifications` route
4. **Ratings Tab** - In Doctor Dashboard's "Patient Ratings" tab

## Backend Integration

### WebSocket Endpoint

**Endpoint:** `GET /notifications` (WebSocket upgrade)

**Expected Format:**

```javascript
// Client sends on connection (authentication)
{
  "type": "auth",
  "userId": "12345",
  "userRole": "doctor",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Server broadcasts notifications
{
  "type": "appointment|lab|urgent|message|discharge|general",
  "data": {
    // Type-specific data
  }
}
```

### Event Types & Payloads

#### 1. Appointment Notification
```javascript
{
  "type": "appointment",
  "data": {
    "appointmentId": "apt-001",
    "patientId": "pat-001",
    "patientName": "John Doe",
    "appointmentTime": "2024-01-15T10:00:00Z",
    "reason": "Follow-up checkup",
    "status": "scheduled"
  }
}
```

#### 2. Lab Result Notification
```javascript
{
  "type": "lab",
  "data": {
    "labId": "lab-001",
    "patientId": "pat-001",
    "patientName": "Jane Smith",
    "testName": "Blood Test - CBC",
    "status": "in_progress",
    "completionTime": "2024-01-15T11:00:00Z"
  }
}
```

#### 3. Urgent Alert
```javascript
{
  "type": "urgent",
  "data": {
    "patientId": "pat-001",
    "title": "Critical Value Alert",
    "message": "Patient blood pressure critically elevated: 180/120",
    "severity": "critical",
    "action": "immediate_review_required"
  }
}
```

#### 4. Patient Message
```javascript
{
  "type": "message",
  "data": {
    "messageId": "msg-001",
    "patientId": "pat-001",
    "patientName": "Robert Wilson",
    "message": "I have questions about my medication...",
    "timestamp": "2024-01-15T10:15:00Z"
  }
}
```

#### 5. Discharge Alert
```javascript
{
  "type": "discharge",
  "data": {
    "patientId": "pat-001",
    "patientName": "Sarah Lee",
    "bedNumber": "305-B",
    "admissionId": "adm-001",
    "readyForDischarge": true
  }
}
```

#### 6. General Notification
```javascript
{
  "type": "general",
  "data": {
    "title": "System Update",
    "message": "Maintenance scheduled for tonight"
  }
}
```

## Database Schema (for Notification History)

If you want to store notification history:

```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  doctor_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE INDEX idx_notifications_doctor ON notifications(doctor_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

## Common Use Cases

### 1. New Appointment Notification

Trigger when appointment is booked:
```javascript
// Backend
event := AppointmentCreatedEvent{
  DoctorID: doctorID,
  PatientName: patient.Name,
  Time: appointment.Time,
  Reason: appointment.Reason,
}
notificationService.NotifyDoctor(event)

// Frontend automatically receives
// → Toast notification appears
// → notification added to history
// → unread count increments
```

### 2. Lab Results Ready

Trigger when lab test completes:
```javascript
// Backend
event := LabResultsReadyEvent{
  DoctorID: doctorID,
  PatientName: patient.Name,
  TestName: lab.Name,
}
notificationService.NotifyDoctor(event)

// Frontend
// → Lab notification displays
// → User can click to view results
```

### 3. Urgent Patient Alert

Trigger for critical events:
```javascript
// Backend
event := UrgentAlertEvent{
  DoctorID: doctorID,
  Message: "Critical blood pressure reading",
  Severity: "critical",
}
notificationService.NotifyDoctor(event)

// Frontend
// → Red urgent notification displays
// → Sound notification plays
// → 10-second auto-dismiss (longer)
// → Goes to urgent section of history
```

## Testing

### Unit Tests for Composables

```javascript
import { useNotificationService } from '@/composables/useNotificationService'
import { useWebSocket } from '@/composables/useWebSocket'

describe('useNotificationService', () => {
  it('should add notification', () => {
    const { add, notifications } = useNotificationService()
    add({ type: 'info', title: 'Test', message: 'Test notification' })
    expect(notifications.value.length).toBe(1)
  })

  it('should mark notification as read', () => {
    const { add, markAsRead, notifications } = useNotificationService()
    const id = add({ type: 'info', title: 'Test', message: 'Test' })
    markAsRead(id)
    expect(notifications.value[0].read).toBe(true)
  })

  it('should get unread count', () => {
    const { add, getUnreadCount } = useNotificationService()
    add({ type: 'info', title: 'Test', message: 'Test' })
    expect(getUnreadCount()).toBe(1)
  })
})

describe('useWebSocket', () => {
  it('should connect and set isConnected', async () => {
    const { connect, isConnected } = useWebSocket()
    // Note: This requires a mock WebSocket server
    // connect('user-1', 'doctor')
    // await timeout(100)
    // expect(isConnected.value).toBe(true)
  })
})
```

### Manual Testing Checklist

- [ ] Bell icon appears in header
- [ ] Unread badge shows on bell icon
- [ ] Dropdown opens when clicking bell
- [ ] Toast notifications display (use NotificationService to create test notifications)
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Click "View" on notification navigates correctly
- [ ] Notifications history page loads with all notifications
- [ ] Filter by type works
- [ ] Search functionality works
- [ ] Ratings tab shows in doctor dashboard
- [ ] Can submit a rating
- [ ] WebSocket reconnects on connection loss
- [ ] Sound notification plays (if enabled)

## Performance Optimizations

1. **Notification Limit**: Only keep last 100 notifications in memory
2. **Toast Limit**: Only show max 5 toasts at once
3. **Browser Memory**: Notifications are not persisted between page reloads (by design)
4. **WebSocket**: Uses exponential backoff for reconnection (max 5 attempts)
5. **Sound**: Web Audio context is created once and reused

## Troubleshooting

### WebSocket keeps disconnecting

**Cause:** Backend not listening or wrong URL

**Solution:**
1. Check `.env` for correct `VITE_API_URL`
2. Check backend is running and listening
3. Check browser console for connection errors
4. Verify firewall rules allow WebSocket traffic

### Notifications don't appear

**Cause:** WebSocket not connected or service not initialized

**Solution:**
1. Check browser console for errors
2. Verify user is authenticated
3. Check Network tab in DevTools for WebSocket connection
4. Verify `App.vue` initialization code ran

### Sounds not playing

**Cause:** Browser audio permissions or Web Audio context issues

**Solution:**
1. Check browser audio settings
2. Allow Audio when prompted
3. Check browser console for audio errors
4. Some browsers require user interaction before audio plays

### High CPU/Memory Usage

**Cause:** Too many notifications or event listeners

**Solution:**
1. Limit notification history to 100
2. Clear old notifications periodically
3. Check for memory leaks in event listeners
4. Use `off()` to remove listeners when done

## Future Enhancements

1. **Notification Preferences**: Let users choose which notifications to receive
2. **Desktop Notifications**: Native browser notifications with Notification API
3. **Email Notifications**: Send summaries via email
4. **Notification Scheduling**: Queue notifications for off-hours
5. **Analytics**: Track notification interaction rates
6. **Notification Templates**: Customizable templates for different notification types
7. **Notification Persistence**: Store in database
8. **Read Receipts**: Confirm notification was read on mobile
9. **Real-time Collaboration**: Multiple doctors working together
10. **Sound/Alert Customization**: Different sounds for different alert types

## File Structure

```
src/
├── composables/
│   ├── useWebSocket.js (200 lines)
│   └── useNotificationService.js (210 lines)
├── components/
│   └── shared/
│       ├── NotificationCenter.vue (400 lines)
│       ├── NotificationBell.vue (350 lines)
│       ├── NotificationItem.vue (300 lines)
│       └── OfflineIndicator.vue (existing)
├── views/
│   ├── PatientRatingSystem.vue (1000 lines)
│   └── dashboard/
│       ├── DoctorDashboardV2.vue (updated)
│       └── NotificationsCenter.vue (400 lines)
├── router/
│   └── index.js (updated with /dashboard/notifications route)
└── App.vue (updated with integration)
```

## Summary

The real-time notifications and patient rating system is fully integrated and ready for:
- Development testing with mock notifications
- Backend integration when WebSocket endpoint is ready
- Production deployment with proper error handling and fallbacks
