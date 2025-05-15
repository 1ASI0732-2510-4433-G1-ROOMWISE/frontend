// Componente para agregar acceso a notificaciones en el panel de control
<template>
  <div class="panel-item-container">
    <router-link to="/notifications" class="panel-item">
      <div class="panel-item-icon">
        <img src="../assets/images/notifications-icon.svg" alt="Notificaciones" class="panel-icon">
      </div>
      <div class="panel-item-button">
        <span class="panel-button-text">Gestión de notificaciones</span>
        <span class="panel-button-arrow">→</span>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotificationsPanelItem'
}
</script>

<style scoped>
.panel-item-container {
  display: flex;
  justify-content: center;
  margin: 1rem;
}

.panel-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 230px;
  text-decoration: none;
  color: inherit;
}

.panel-item-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  height: 150px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.panel-icon {
  width: 70%;
  height: auto;
}

.panel-item-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #437f54;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.panel-button-arrow {
  font-size: 1.2rem;
}

.panel-item:hover .panel-item-icon {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.panel-item:hover .panel-item-button {
  background-color: #356745;
}
</style>