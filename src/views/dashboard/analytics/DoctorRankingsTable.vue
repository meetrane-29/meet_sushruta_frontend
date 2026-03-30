<template>
  <div class="rankings-table">
    <div v-if="loading" class="loading">
      <p>Loading rankings...</p>
    </div>
    <div v-else-if="rankings && rankings.length > 0" class="table-container">
      <table class="rankings">
        <thead>
          <tr>
            <th class="rank">Rank</th>
            <th class="name">Doctor Name</th>
            <th class="specialization">Specialization</th>
            <th class="metric">Appointments</th>
            <th class="metric">Patients</th>
            <th class="metric">Rating</th>
            <th class="metric">Completion %</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(doctor, index) in rankings" :key="doctor.id" :class="getRankClass(index)">
            <td class="rank">
              <span class="rank-badge" :class="getRankBadgeClass(index)">
                {{ index + 1 }}
              </span>
            </td>
            <td class="name">
              <div class="doctor-info">
                <div class="doctor-avatar">
                  {{ getInitials(doctor.doctorName) }}
                </div>
                <span>{{ doctor.doctorName }}</span>
              </div>
            </td>
            <td class="specialization">{{ doctor.specialization || 'N/A' }}</td>
            <td class="metric">{{ doctor.appointmentCount || 0 }}</td>
            <td class="metric">{{ doctor.patientCount || 0 }}</td>
            <td class="metric rating">
              <div class="rating-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(doctor.rating || 0) }">★</span>
              </div>
              <span class="rating-value">{{ (doctor.rating || 0).toFixed(1) }}</span>
            </td>
            <td class="metric">{{ (doctor.completionRate || 0).toFixed(1) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="no-data">
      <p>No rankings data available</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rankings: {
    type: Array,
    required: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

function getRankClass(index) {
  if (index === 0) return 'rank-1';
  if (index === 1) return 'rank-2';
  if (index === 2) return 'rank-3';
  return '';
}

function getRankBadgeClass(index) {
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  if (index === 2) return 'bronze';
  return '';
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
}
</script>

<style scoped>
.rankings-table {
  width: 100%;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
}

.rankings {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.rankings thead {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%);
}

.rankings th {
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
}

.rankings th.rank,
.rankings th.metric {
  text-align: center;
}

.rankings tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.3s ease;
}

.rankings tbody tr:hover {
  background: #f9fafb;
}

.rankings tbody tr.rank-1 {
  background: linear-gradient(90deg, #fef3c7 0%, rgba(254, 243, 199, 0) 100%);
}

.rankings tbody tr.rank-2 {
  background: linear-gradient(90deg, #e5e7eb 0%, rgba(229, 231, 235, 0) 100%);
}

.rankings tbody tr.rank-3 {
  background: linear-gradient(90deg, #fed7aa 0%, rgba(254, 215, 170, 0) 100%);
}

.rankings td {
  padding: 16px 12px;
  color: #2c3e50;
}

.rankings td.rank,
.rankings td.metric {
  text-align: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: bold;
  color: white;
  font-size: 16px;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

.rank-badge.silver {
  background: linear-gradient(135deg, #d1d5db, #9ca3af);
  box-shadow: 0 2px 4px rgba(156, 163, 175, 0.3);
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #fed7aa, #fdba74);
  color: #92400e;
  box-shadow: 0 2px 4px rgba(253, 215, 170, 0.3);
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.doctor-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.rating-stars {
  display: flex;
  gap: 2px;
  justify-content: center;
  margin-bottom: 4px;
}

.star {
  font-size: 16px;
  color: #d1d5db;
  transition: color 0.2s ease;
}

.star.filled {
  color: #f59e0b;
}

.rating-value {
  display: block;
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

@media (max-width: 900px) {
  .rankings th,
  .rankings td {
    padding: 12px 8px;
    font-size: 13px;
  }

  .rankings th.specialization,
  .rankings td.specialization {
    display: none;
  }
}

@media (max-width: 600px) {
  .rankings th,
  .rankings td {
    padding: 10px 6px;
    font-size: 12px;
  }

  .rankings th.metric:nth-child(n+5),
  .rankings td.metric:nth-child(n+5) {
    display: none;
  }

  .doctor-avatar {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
}
</style>
