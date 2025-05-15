<script>
import ReportsView from "../../analytics/components/reports-view/reports-view.component.vue";
import NotificationsView from "../../communication/views/NotificationsView.vue";
// Modificamos las importaciones para usar el componente de notificaciones correcto

export default {
  name: "control-panel-page",
  components: { ReportsView, NotificationsView }, // Actualizamos los componentes registrados
  data() {
    return {
      modules: [
        {
          title: "Gestión de trabajadores",
          icon: new URL("../../assets/img/11 (1).png", import.meta.url).href,
          route: "/workers"
        },
        {
          title: "Gestión de rooms",
          icon: new URL("../../assets/img/11 (2).png", import.meta.url).href,
          route: "/type-rooms"
        },
        {
          title: "Gestión de proveedores",
          icon: new URL("../../assets/img/11 (3).png", import.meta.url).href,
          route: "/providers"
        },
        {
          title: "Gestión de administradores",
          icon: new URL("../../assets/img/11 (4).png", import.meta.url).href,
          route: "/admins"
        }
      ]
    };
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
    }
  }
}
</script>

<template>
  <div class="control-panel-container">
    <h1 class="panel-title">Panel de control</h1>

    <div class="modules-container">
      <div v-for="(module, index) in modules" :key="index" class="module-card">
        <div class="module-icon">
          <!-- Si no tienes los iconos como imágenes, puedes usar estos SVGs como alternativa -->
          <template v-if="module.title.includes('trabajadores')">
            <img :src="module.icon" alt="Gestión de trabajadores" onerror="this.onerror=null; this.src=''; this.innerHTML='<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'#27ae60\' stroke-width=\'1\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\'></path><circle cx=\'9\' cy=\'7\' r=\'4\'></circle><path d=\'M23 21v-2a4 4 0 0 0-3-3.87\'></path><path d=\'M16 3.13a4 4 0 0 1 0 7.75\'></path></svg>'">
          </template>
          <template v-else-if="module.title.includes('rooms')">
            <img :src="module.icon" alt="Gestión de rooms" onerror="this.onerror=null; this.src=''; this.innerHTML='<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'#2980b9\' stroke-width=\'1\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\'></path><polyline points=\'3.27 6.96 12 12.01 20.73 6.96\'></polyline><line x1=\'12\' y1=\'22.08\' x2=\'12\' y2=\'12\'></line></svg>'">
          </template>
          <template v-else-if="module.title.includes('proveedores')">
            <img :src="module.icon" alt="Gestión de proveedores" onerror="this.onerror=null; this.src=''; this.innerHTML='<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'#e67e22\' stroke-width=\'1\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\'></path><circle cx=\'9\' cy=\'7\' r=\'4\'></circle><path d=\'M23 21v-2a4 4 0 0 0-3-3.87\'></path><path d=\'M16 3.13a4 4 0 0 1 0 7.75\'></path></svg>'">
          </template>
          <template v-else-if="module.title.includes('administradores')">
            <img :src="module.icon" alt="Gestión de administradores" onerror="this.onerror=null; this.src=''; this.innerHTML='<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'#8e44ad\' stroke-width=\'1\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\'></path><circle cx=\'12\' cy=\'7\' r=\'4\'></circle></svg>'">
          </template>
        </div>
        <div class="module-action">
          <button
              class="action-button"
              @click="navigateTo(module.route)"
          >
            {{ module.title }} <span class="arrow">›</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Sección de notificaciones actualizada -->
    <div class="notifications-section">
      <h2 class="section-title">Notificaciones</h2>
      <NotificationsView />
    </div>

    <!-- ReportsView componente se muestra después de los módulos -->
    <div class="reports-section">
      <reports-view/>
    </div>
  </div>
</template>

<style scoped>
.control-panel-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.panel-title {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 30px;
  font-weight: 600;
  padding-left: 10px;
}

.section-title {
  color: #2c3e50;
  font-size: 22px;
  margin-bottom: 15px;
  font-weight: 500;
  padding-left: 10px;
}

.modules-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Fuerza 4 columnas */
  gap: 20px;
  margin-bottom: 40px;
}

.module-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s, box-shadow 0.3s;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.module-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  padding: 20px;
  background-color: #f8f9fa;
}

.module-icon img, .module-icon svg {
  max-width: 100px;
  max-height: 100px;
}

.module-action {
  padding: 15px;
}

.action-button {
  width: 100%;
  padding: 12px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #45a049;
}

.arrow {
  font-size: 24px;
  margin-left: 10px;
}

.notifications-section {
  margin-top: 20px;
  margin-bottom: 40px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.reports-section {
  margin-top: 40px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

@media (max-width: 768px) {
  .modules-container {
    grid-template-columns: 1fr;
  }

  .module-icon {
    height: 120px;
  }
}
</style>