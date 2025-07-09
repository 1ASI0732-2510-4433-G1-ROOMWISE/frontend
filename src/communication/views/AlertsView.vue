<template>
  <div class="alerts-view">
    <h1>Alerts</h1>
    <button @click="navigateToWriteAlert" class="btn-primary">New Alert</button>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="alerts.length === 0" class="empty-state">
      No alerts found
    </div>

    <div v-else class="alerts-list">
      <NotificationCard
          v-for="(alert, index) in alerts"
          :key="index"
          :notification="alert"
          @show-details="showAlertDetails"
      />
    </div>
  </div>
</template>

<script>
import NotificationCard from '@/components/notifications/NotificationCard.vue';
import notificationService from '@/services/notificationService';

export default {
  components: { NotificationCard },
  data() {
    return {
      alerts: [],
      loading: true,
      hotelId: null
    };
  },
  async created() {
    await this.loadHotelId();
    await this.fetchAlerts();
  },
  methods: {
    async loadHotelId() {
      // Implement based on your auth system
// SUGERENCIA: Obtener hotelId desde el sistema de autenticación actual (ej. Vuex, JWT, API de usuario actual)
// Esto evitaría problemas si se cambia el contexto de usuario o múltiples hoteles están involucrados.

      this.hotelId = 1; // Replace with actual hotel ID logic
    },
    async fetchAlerts() {
      try {
        this.alerts = await notificationService.getAlertNotifications(this.hotelId);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        this.$toast.error("Failed to load alerts");
      } finally {
        this.loading = false;
      }
    },
    showAlertDetails(alert) {
      this.$modal.show('alert-details', {
        title: alert.title,
        text: alert.description
      });
    },
    navigateToWriteAlert() {
      this.$router.push({ name: 'WriteAlert' });
    }
  }
};
</script>

<style scoped>
.alerts-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
h1 {
  margin-bottom: 20px;
}
.btn-primary {
  background: #2C5282;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}
.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
