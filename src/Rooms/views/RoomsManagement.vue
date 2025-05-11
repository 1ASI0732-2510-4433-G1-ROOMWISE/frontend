<template>
  <div class="rooms-management">
    <h1>Gestión de Habitaciones</h1>
    <div class="tabs">
      <button
          class="tab-button"
          :class="{ active: activeTab === 'create' }"
          @click="activeTab = 'create'"
      >
        Crear Habitación
      </button>
      <button
          class="tab-button"
          :class="{ active: activeTab === 'list' }"
          @click="activeTab = 'list'"
      >
        Room List
      </button>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <div class="tab-content">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <component
              :is="currentTabComponent"
              ref="currentTab"
              @room-created="handleRoomCreated"
          ></component>
        </keep-alive>
      </transition>
    </div>
  </div>
</template>

<script>
import CreateRoomForm from '../components/CreateRoomForm.vue';
import RoomList from '../components/RoomList.vue';

export default {
  name: 'RoomsManagement',
  components: {
    CreateRoomForm,
    RoomList
  },
  data() {
    return {
      activeTab: 'create',
      successMessage: ''
    };
  },
  computed: {
    currentTabComponent() {
      return this.activeTab === 'create' ? 'CreateRoomForm' : 'RoomList';
    }
  },
  methods: {
    handleRoomCreated(room) {
      this.activeTab = 'list';
      this.successMessage = '¡Habitación creada correctamente!';
      // Añade la nueva habitación a RoomList si el método existe
      if (
          this.$refs.currentTab &&
          typeof this.$refs.currentTab.addRoom === 'function'
      ) {
        this.$refs.currentTab.addRoom(room);
      }
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }
};
</script>

<style scoped>
.rooms-management {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s, color 0.3s;
}

.tab-button:hover {
  background-color: #f5f5f5;
}

.tab-button.active {
  border-bottom: 3px solid #4caf50;
  font-weight: bold;
  color: #4caf50;
}

.tab-content {
  padding: 20px 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  text-align: center;
}
</style>