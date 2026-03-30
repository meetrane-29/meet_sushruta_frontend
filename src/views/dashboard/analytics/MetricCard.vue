<template>
  <div class="metric-card" :class="color">
    <div class="metric-icon">{{ icon }}</div>
    <div class="metric-content">
      <h3>{{ title }}</h3>
      <p class="metric-value">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: String,
    default: '📊',
  },
  color: {
    type: String,
    default: 'blue', // blue, green, purple, orange, teal, red
  },
});
</script>

<style scoped>
.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 15px;
  align-items: center;
  border-left: 5px solid #4f46e5;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.metric-card.green {
  border-left-color: #22c55e;
}

.metric-card.purple {
  border-left-color: #8b5cf6;
}

.metric-card.orange {
  border-left-color: #f59e0b;
}

.metric-card.teal {
  border-left-color: #06b6d4;
}

.metric-card.red {
  border-left-color: #ef4444;
}

.metric-icon {
  font-size: 32px;
  min-width: 50px;
  text-align: center;
}

.metric-content h3 {
  margin: 0 0 5px 0;
  font-size: 13px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  margin: 0;
  font-size: 26px;
  font-weight: bold;
  color: #2c3e50;
}
</style>
