<template>
  <div class="appointment-calendar-view">
    <div class="calendar-header">
      <h1>📅 Appointment Calendar</h1>
      <div class="calendar-controls">
        <button @click="previousMonth" class="nav-btn">← Previous</button>
        <span class="current-month">{{ currentMonthYear }}</span>
        <button @click="nextMonth" class="nav-btn">Next →</button>
        <button @click="goToToday" class="today-btn">Today</button>
        <button @click="toggleBlockMode" :class="['block-btn', { active: blockMode }]">🔒 Block Time</button>
        <button @click="toggleDoctorView" :class="['doctor-btn', { active: doctorFilterActive }]">👨‍⚕️ Filter by Doctor</button>
      </div>
    </div>

    <!-- Doctor Filter Dropdown -->
    <div v-if="doctorFilterActive" class="doctor-filter">
      <label>Filter by Doctor:</label>
      <select v-model="selectedDoctor" class="doctor-select">
        <option value="">All Doctors</option>
        <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
          {{ doctor.name }}
        </option>
      </select>
    </div>

    <div class="calendar-container">
      <!-- Week Day Headers -->
      <div class="weekday-headers">
        <div v-for="day in weekDays" :key="day" class="weekday-header">
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="calendar-grid">
        <div
          v-for="day in filteredCalendarDays"
          :key="day.date"
          :class="['calendar-day', {
            'other-month': day.otherMonth,
            'today': day.isToday,
            'has-events': day.appointments.length > 0,
            'drag-over': dragOverDate === day.date && !blockMode
          }]"
          @click="selectDay(day)"
          @dragover.prevent
          @dragenter="dragOverDate = day.date"
          @dragleave="dragOverDate = null"
          @drop="handleDrop(day)"
        >
          <div class="day-number">{{ day.day }}</div>
          
          <!-- Block Time Slot Creator -->
          <div v-if="blockMode" class="block-time-creator">
            <input
              type="time"
              class="block-time-input"
              placeholder="HH:MM"
              @click.stop
            />
            <button @click.stop="createBlockTime(day.date)" class="block-create-btn">Block</button>
          </div>

          <!-- Appointments and Blocks -->
          <div class="day-appointments">
            <!-- Block Time Display -->
            <div
              v-for="(block, idx) in day.blockedTimes"
              :key="`block-${idx}`"
              class="block-time-badge"
              :title="`Blocked: ${block.reason}`"
            >
              <span class="block-time">🔒 {{ formatTime(block.startTime) }}</span>
            </div>

            <!-- Appointments (Draggable) -->
            <div
              v-for="(apt, idx) in day.appointments.slice(0, 2)"
              :key="idx"
              class="appointment-badge"
              :style="{ 
                backgroundColor: getDoctorColor(apt.doctorId),
                borderLeft: `3px solid ${getSpecializationColor(apt.specialization)}`
              }"
              :draggable="!blockMode"
              @dragstart="handleDragStart($event, apt, day)"
              @click.stop="selectAppointment(apt)"
              :title="`Dr. ${apt.doctorName} - ${apt.specialization}`"
            >
              <span class="time">{{ formatTime(apt.appointmentTime) }}</span>
              <span class="title">{{ apt.patientName.substring(0, 8) }}</span>
            </div>
            <div v-if="day.appointments.length > 2" class="more-badge">
              +{{ day.appointments.length - 2 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Day Details -->
    <div v-if="selectedDay" class="day-details">
      <h2>📋 Appointments for {{ formatDate(selectedDay.date) }}</h2>

      <!-- Drag Hint -->
      <div v-if="!blockMode && selectedDay.appointments.length > 0" class="drag-hint">
        💡 Tip: Drag appointments to reschedule them to a different day
      </div>

      <div v-if="selectedDay.appointments.length > 0" class="appointments-list">
        <div
          v-for="apt in selectedDay.appointments"
          :key="apt.id"
          class="appointment-item"
          :class="apt.status.toLowerCase()"
          :style="{ borderLeftColor: getSpecializationColor(apt.specialization) }"
        >
          <div class="apt-doctor-badge" :style="{ backgroundColor: getDoctorColor(apt.doctorId) }">
            <span>Dr. {{ apt.doctorName?.substring(0, 2).toUpperCase() || 'DR' }}</span>
          </div>
          <div class="apt-details">
            <h4>{{ apt.patientName }}</h4>
            <p class="apt-info">{{ apt.reason }}</p>
            <p class="apt-doctor">👨‍⚕️ Dr. {{ apt.doctorName }} - {{ apt.specialization }}</p>
            <p class="apt-status">Status: {{ apt.status }}</p>
          </div>
          <div class="apt-time">{{ formatTime(apt.appointmentTime) }}</div>
          <div class="apt-actions">
            <button @click="editAppointment(apt)" class="btn-edit">✏️ Edit</button>
            <button @click="completeAppointment(apt)" class="btn-complete" v-if="apt.status === 'scheduled'">✓ Complete</button>
            <button @click="cancelAppointment(apt)" class="btn-cancel">✕ Cancel</button>
          </div>
        </div>
      </div>
      <div v-else class="no-appointments">
        <p>No appointments scheduled for this day</p>
        <button @click="newAppointment" class="btn-new-apt">+ Add Appointment</button>
      </div>
    </div>

    <!-- Legend -->
    <div class="calendar-legend">
      <div class="legend-section">
        <h3>Status</h3>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-color scheduled"></div>
            <span>Scheduled</span>
          </div>
          <div class="legend-item">
            <div class="legend-color completed"></div>
            <span>Completed</span>
          </div>
          <div class="legend-item">
            <div class="legend-color cancelled"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      <div class="legend-section">
        <h3>Doctors</h3>
        <div class="legend-items">
          <div v-for="doctor in doctors" :key="doctor.id" class="legend-item">
            <div class="legend-color" :style="{ backgroundColor: getDoctorColor(doctor.id) }"></div>
            <span>Dr. {{ doctor.name }}</span>
          </div>
        </div>
      </div>

      <div class="legend-section">
        <h3>Specializations</h3>
        <div class="legend-items">
          <div v-for="spec in specializations" :key="spec" class="legend-item">
            <div class="legend-border" :style="{ borderColor: getSpecializationColor(spec) }}" ></div>
            <span>{{ spec }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

export default {
  name: 'AppointmentCalendarView',
  setup() {
    const { get, put, post, delete: del } = useApi();
    const currentDate = ref(new Date());
    const appointments = ref([]);
    const doctors = ref([]);
    const blockedTimes = ref([]);
    const selectedDay = ref(null);
    const selectedAppointment = ref(null);
    
    const blockMode = ref(false);
    const doctorFilterActive = ref(false);
    const selectedDoctor = ref('');
    const dragOverDate = ref(null);
    const draggedAppointment = ref(null);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Doctor color mapping
    const doctorColors = {
      'dr-1': '#FF6B6B', 'dr-2': '#4ECDC4', 'dr-3': '#45B7D1',
      'dr-4': '#96CEB4', 'dr-5': '#FFEAA7', 'dr-6': '#DDA15E',
      'dr-7': '#BC6C25', 'dr-8': '#9D84B7'
    };

    // Specialization colors
    const specializationColors = {
      'Cardiology': '#FF6B9D', 'Neurology': '#C44569', 'Orthopedics': '#80C4E9',
      'Pediatrics': '#D4A5E9', 'Surgery': '#666666', 'Dermatology': '#FF9671',
      'Psychiatry': '#8B7355', 'Dentistry': '#CEBD8F', 'ENT': '#00ADB5',
      'Ophthalmology': '#FFD93D', 'Urology': '#6BCB77', 'General': '#4D96FF'
    };

    const currentMonthYear = computed(() => {
      const options = { month: 'long', year: 'numeric' };
      return currentDate.value.toLocaleDateString('en-US', options);
    });

    const getDoctorColor = (doctorId) => {
      const key = doctorId || 'dr-0';
      return doctorColors[key] || '#007bff';
    };

    const getSpecializationColor = (specialization) => {
      return specializationColors[specialization] || '#999999';
    };

    // Extract all specializations from appointments
    const specializations = computed(() => {
      const specs = new Set(appointments.value.map(apt => apt.specialization).filter(Boolean));
      return Array.from(specs).sort();
    });

    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      const days = [];

      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(year, month - 1, day);
        days.push(createDayObject(date, day, true));
      }

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        days.push(createDayObject(date, i, false));
      }

      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push(createDayObject(date, i, true));
      }

      return days;
    });

    // Filter calendar days based on selected doctor
    const filteredCalendarDays = computed(() => {
      if (!selectedDoctor.value) return calendarDays.value;
      return calendarDays.value.map(day => ({
        ...day,
        appointments: day.appointments.filter(apt => apt.doctorId === parseInt(selectedDoctor.value))
      }));
    });

    const createDayObject = (date, dayNum, otherMonth) => {
      const dateStr = date.toISOString().split('T')[0];
      const today = new Date();
      const isToday = dateStr === today.toISOString().split('T')[0];

      return {
        date: dateStr,
        day: dayNum,
        otherMonth,
        isToday,
        appointments: getAppointmentsForDate(dateStr),
        blockedTimes: getBlockedTimesForDate(dateStr)
      };
    };

    const getAppointmentsForDate = (date) => {
      return appointments.value.filter(apt => {
        const aptDate = apt.appointmentTime.split(' ')[0];
        return aptDate === date;
      });
    };

    const getBlockedTimesForDate = (date) => {
      return blockedTimes.value.filter(block => block.date === date);
    };

    const handleDragStart = (event, appointment, fromDay) => {
      draggedAppointment.value = { appointment, fromDay };
      event.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (toDay) => {
      if (!draggedAppointment.value || blockMode.value) return;

      const { appointment } = draggedAppointment.value;
      const oldDate = appointment.appointmentTime.split(' ')[0];
      const newDate = toDay.date;

      if (oldDate === newDate) return;

      rescheduleAppointment(appointment, newDate);
      draggedAppointment.value = null;
      dragOverDate.value = null;
    };

    const rescheduleAppointment = async (appointment, newDate) => {
      try {
        const [time] = appointment.appointmentTime.split(' ');
        const newDateTime = `${newDate} ${time}`;
        
        await put(`/appointments/${appointment.id}`, {
          appointmentTime: newDateTime
        });

        // Update local state
        const index = appointments.value.findIndex(a => a.id === appointment.id);
        if (index !== -1) {
          appointments.value[index].appointmentTime = newDateTime;
        }

        alert(`✓ Appointment rescheduled to ${formatDate(newDate)}`);
      } catch (error) {
        console.error('Failed to reschedule appointment:', error);
        alert('Failed to reschedule appointment');
      }
    };

    const toggleBlockMode = () => {
      blockMode.value = !blockMode.value;
    };

    const toggleDoctorView = () => {
      doctorFilterActive.value = !doctorFilterActive.value;
      if (!doctorFilterActive.value) {
        selectedDoctor.value = '';
      }
    };

    const createBlockTime = async (date) => {
      const startTime = prompt('Enter block start time (HH:MM):');
      if (!startTime) return;

      const reason = prompt('Enter reason for blocking (e.g., Break, Training, Maintenance):');
      if (!reason) return;

      try {
        const newBlock = {
          date,
          startTime: `${date} ${startTime}`,
          reason,
          doctorId: selectedDoctor.value || null
        };

        blockedTimes.value.push(newBlock);
        
        // Persist to backend if needed
        // await post('/block-times', newBlock);

        alert(`✓ Time slot blocked for ${reason}`);
      } catch (error) {
        console.error('Failed to create block time:', error);
      }
    };

    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
    };

    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
    };

    const goToToday = () => {
      currentDate.value = new Date();
    };

    const selectDay = (day) => {
      if (!day.otherMonth) {
        selectedDay.value = day;
      }
    };

    const selectAppointment = (apt) => {
      selectedAppointment.value = apt;
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    };

    const formatTime = (dateTimeStr) => {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getAppointmentColor = (status) => {
      const colors = {
        scheduled: '#007bff',
        completed: '#28a745',
        cancelled: '#dc3545',
        'no-show': '#ff7675',
      };
      return colors[status?.toLowerCase()] || '#6c757d';
    };

    const editAppointment = (apt) => {
      alert(`Edit appointment for ${apt.patientName} - To be implemented`);
    };

    const completeAppointment = (apt) => {
      alert(`Mark appointment as completed - To be implemented`);
    };

    const cancelAppointment = (apt) => {
      alert(`Cancel appointment - To be implemented`);
    };

    const newAppointment = () => {
      alert('Add new appointment - To be implemented');
    };

    const fetchAppointments = async () => {
      try {
        const response = await get('/appointments');
        if (response && response.data) {
          let data = Array.isArray(response.data) ? response.data : response.data.data || [];
          // Ensure each appointment has doctor info
          appointments.value = data.map((apt, idx) => ({
            ...apt,
            doctorId: apt.doctorId || `dr-${idx % 8}`,
            doctorName: apt.doctorName || `Doctor ${idx}`,
            specialization: apt.specialization || 'General'
          }));
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await get('/doctors');
        if (response && response.data) {
          doctors.value = Array.isArray(response.data) ? response.data : response.data.data || [];
        }
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        // Mock data for testing
        doctors.value = [
          { id: 1, name: 'Smith' },
          { id: 2, name: 'Johnson' },
          { id: 3, name: 'Williams' }
        ];
      }
    };

    onMounted(() => {
      fetchAppointments();
      fetchDoctors();
      const today = new Date().toISOString().split('T')[0];
      const todayObj = calendarDays.value.find(d => d.date === today);
      if (todayObj) {
        selectedDay.value = todayObj;
      }
    });

    return {
      currentDate,
      currentMonthYear,
      calendarDays,
      filteredCalendarDays,
      weekDays,
      selectedDay,
      selectedAppointment,
      appointments,
      doctors,
      blockedTimes,
      blockMode,
      doctorFilterActive,
      selectedDoctor,
      dragOverDate,
      specializations,
      previousMonth,
      nextMonth,
      goToToday,
      selectDay,
      selectAppointment,
      formatDate,
      formatTime,
      getAppointmentColor,
      getDoctorColor,
      getSpecializationColor,
      editAppointment,
      completeAppointment,
      cancelAppointment,
      newAppointment,
      handleDragStart,
      handleDrop,
      toggleBlockMode,
      toggleDoctorView,
      createBlockTime
    };
  },
};
</script>

<style scoped>
.appointment-calendar-view {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
}

.calendar-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.nav-btn,
.today-btn {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: #f0f0f0;
}

.today-btn {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.today-btn:hover {
  background: #0056b3;
}

.block-btn,
.doctor-btn {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.block-btn:hover,
.doctor-btn:hover {
  background: #f0f0f0;
}

.block-btn.active,
.doctor-btn.active {
  background: #ff9999;
  color: white;
  border-color: #ff9999;
}

.doctor-filter {
  background: white;
  padding: 15px 20px;
  margin-bottom: 15px;
  border-radius: 8px;
  display: flex;
  gap: 15px;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.doctor-filter label {
  font-weight: 600;
  color: #2c3e50;
}

.doctor-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.current-month {
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
  text-align: center;
}

/* Calendar Grid */
.calendar-container {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.weekday-header {
  text-align: center;
  font-weight: 700;
  color: #666;
  padding: 10px;
  text-transform: uppercase;
  font-size: 12px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.calendar-day {
  min-height: 110px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.calendar-day:hover {
  background: #f0f0f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.calendar-day.other-month {
  background: #f9f9f9;
  color: #ccc;
}

.calendar-day.today {
  background: #e7f3ff;
  border: 2px solid #007bff;
  border-radius: 6px;
}

.calendar-day.has-events {
  background: linear-gradient(135deg, #fff5f5 0%, #f5f8ff 100%);
}

.calendar-day.drag-over {
  background: #ffffcc;
  border: 2px dashed #ffcc00;
  box-shadow: 0 0 10px rgba(255, 204, 0, 0.3);
}

.day-number {
  font-weight: 700;
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 5px;
}

/* Block Time Management */
.block-time-creator {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.block-time-input {
  flex: 1;
  padding: 3px 6px;
  font-size: 11px;
  border: 1px solid #ddd;
  border-radius: 2px;
}

.block-create-btn {
  padding: 3px 8px;
  font-size: 10px;
  background: #ff9999;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-weight: 600;
}

.block-create-btn:hover {
  background: #ff7777;
}

.block-time-badge {
  display: flex;
  align-items: center;
  padding: 3px 6px;
  background: #ffe0e0;
  border: 1px solid #ffcccc;
  border-radius: 3px;
  color: #d32f2f;
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 2px;
}

.block-time {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day-number {
  font-weight: 700;
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 5px;
}

.day-appointments {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.appointment-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 3px;
  color: white;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: move;
  transition: all 0.2s ease;
}

.appointment-badge:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.appointment-badge .time {
  font-weight: 700;
}

.appointment-badge .title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-badge {
  padding: 3px 6px;
  font-size: 10px;
  color: #666;
  font-weight: 600;
}

/* Day Details Section */
.day-details {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.day-details h2 {
  color: #2c3e50;
  font-size: 20px;
  margin: 0 0 20px 0;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.drag-hint {
  background: #e8f4f8;
  border: 1px solid #b3e5fc;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  color: #01579b;
  font-size: 13px;
  font-weight: 500;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.appointment-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-left: 4px solid #007bff;
  border-radius: 6px;
  align-items: flex-start;
}

.appointment-item.completed {
  border-left-color: #28a745;
  opacity: 0.8;
  background: #f0f9f6;
}

.appointment-item.cancelled {
  border-left-color: #dc3545;
  opacity: 0.6;
  background: #fef0f0;
}

.apt-doctor-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  color: white;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.apt-details {
  flex: 1;
}

.apt-details h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 16px;
}

.apt-info,
.apt-doctor {
  margin: 5px 0;
  color: #666;
  font-size: 13px;
}

.apt-doctor {
  font-weight: 500;
  color: #0066cc;
}

.apt-status {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #999;
}

.apt-time {
  font-weight: 700;
  color: #007bff;
  font-size: 14px;
  min-width: 70px;
  text-align: center;
}

.apt-actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-complete,
.btn-cancel {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #007bff;
  color: white;
}

.btn-edit:hover {
  background: #0056b3;
}

.btn-complete {
  background: #28a745;
  color: white;
}

.btn-complete:hover {
  background: #1e7e34;
}

.btn-cancel {
  background: #dc3545;
  color: white;
}

.btn-cancel:hover {
  background: #c82333;
}

.no-appointments {
  text-align: center;
  padding: 40px;
  color: #999;
}

.btn-new-apt {
  margin-top: 15px;
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.btn-new-apt:hover {
  background: #1e7e34;
}

/* Legend */
.calendar-legend {
  display: flex;
  gap: 30px;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  flex-wrap: wrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-section h3 {
  font-size: 13px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  text-transform: uppercase;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-border {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 3px solid;
  flex-shrink: 0;
  background: white;
}

/* Status Legend Colors */
.legend-color.scheduled {
  background: #007bff;
}

.legend-color.completed {
  background: #28a745;
}

.legend-color.cancelled {
  background: #dc3545;
}

.legend-color.noshow {
  background: #ff7675;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}

.legend-color.scheduled {
  background: #007bff;
}

.legend-color.completed {
  background: #28a745;
}

.legend-color.cancelled {
  background: #dc3545;
}

.legend-color.noshow {
  background: #ff7675;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 15px;
  }

  .calendar-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
  }

  .calendar-day {
    min-height: 80px;
    padding: 5px;
    font-size: 12px;
  }

  .day-number {
    font-size: 12px;
  }

  .appointment-badge {
    font-size: 9px;
    padding: 2px 4px;
  }

  .apt-actions {
    flex-direction: column;
  }

  .btn-edit,
  .btn-complete,
  .btn-cancel {
    font-size: 11px;
  }
}
</style>
