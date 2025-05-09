<template>
  <div class="notification-card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="icon">
      <i :class="notificationIcon" :style="{ color: iconColor }"></i>
    </div>
    <div class="content">
      <h3>{{ notification.title }}</h3>
      <p>{{ notification.description }}</p>
      <span class="admin-id">Admin ID: {{ notification.adminsId }}</span>
    </div>
    <button @click="showDetails" class="info-btn">
      <i class="fas fa-info-circle"></i>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    notification: Object,
    required: true
  },
  data() {
    return { isHovered: false };
  },
  computed: {
    notificationIcon() {
      return this.notification.typesNotificationsId === 1 ? 'fas fa-envelope' : 'fas fa-bell';
    },
    iconColor() {
      return '#1976D2';
    }
  },
  methods: {
    showDetails() {
      this.$emit('show-details', {
        title: this.notification.title,
        description: this.notification.description
      });
    }
  }
};
</script>

<style scoped>
.notification-card {
  display: flex;
  padding: 16px;
  margin: 8px 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  align-items: center;
}
.notification-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
.icon {
  font-size: 24px;
  margin-right: 16px;
}
.content {
  flex: 1;
}
h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: bold;
}
p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #555;
}
.admin-id {
  font-size: 12px;
  color: #888;
}
.info-btn {
  background: none;
  border: none;
  color: #1976D2;
  font-size: 20px;
  cursor: pointer;
}
</style>