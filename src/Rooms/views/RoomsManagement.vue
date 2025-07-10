<template>
  <div class="rooms-management">
    <!-- Create Room Modal -->
    <div class="modal-overlay" v-if="showCreateModal" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Crear Nueva Habitación</h2>
          <button class="close-modal" @click="closeCreateModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createRoom">
            <div class="form-group">
              <label for="roomTypeId">Tipo de Habitación *</label>
              <select id="roomTypeId" v-model="newRoom.typeRoomId" required>
                <option value="">Selecciona un tipo de habitación</option>
                <option v-for="roomType in roomTypes" :key="roomType.id" :value="roomType.id">
                  {{ roomType.name }} - {{ roomType.description }}
                </option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" @click="closeCreateModal">Cancelar</button>
              <button type="submit" class="btn btn-create" :disabled="!newRoom.typeRoomId">Crear Habitación</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Create Room Type Modal -->
    <div class="modal-overlay" v-if="showCreateTypeModal" @click="closeCreateTypeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Crear Nuevo Tipo de Habitación</h2>
          <button class="close-modal" @click="closeCreateTypeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createRoomType">
            <div class="form-group">
              <label for="description">Descripción *</label>
              <input type="text" id="description" v-model="newRoomType.description" required placeholder="Ej: habitación royal" />
            </div>
            <div class="form-group">
              <label for="price">Precio *</label>
              <select id="price" v-model="newRoomType.price" required>
                <option value="">Selecciona un precio</option>
                <option value="100">$100</option>
                <option value="200">$200</option>
                <option value="300">$300</option>
                <option value="400">$400</option>
                <option value="500">$500</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" @click="closeCreateTypeModal">Cancelar</button>
              <button type="submit" class="btn btn-create" :disabled="!newRoomType.description || !newRoomType.price">Crear Tipo</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="rooms-container">
      <div class="rooms-header">
        <h1>Gestión de Habitaciones</h1>
        <div class="action-buttons">
          <button class="btn btn-blue" @click="openCreateModal" v-if="isAuthenticated">
            <i class="fas fa-plus"></i> Agregar Habitación
          </button>
          <button class="btn btn-purple" @click="openCreateTypeModal" v-if="isAuthenticated">
            <i class="fas fa-plus-circle"></i> Agregar Tipo
          </button>
        </div>
      </div>

      <div v-if="!isAuthenticated" class="auth-message">
        <i class="fas fa-lock"></i>
        <p>Debes iniciar sesión para gestionar las habitaciones</p>
        <button class="login-button" @click="goToLogin">Iniciar sesión</button>
      </div>

      <div v-else class="rooms-content">
        <div class="rooms-list" v-if="rooms.length > 0">
          <h3>Habitaciones ({{ rooms.length }})</h3>
          <div class="rooms-grid">
            <div v-for="room in rooms" :key="room.id" class="room-card">
              <div class="room-header">
                <h4>Habitación #{{ room.id }}</h4>
              </div>
              <div class="room-info">
                <p><strong>Tipo:</strong> {{ getRoomTypeName(room.typeRoomId) }}</p>
                <p><strong>Estado:</strong> <span class="status-badge">{{ room.status || 'Disponible' }}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fas fa-bed"></i>
          <h3>No hay habitaciones registradas</h3>
          <button class="btn btn-blue" @click="openCreateModal">
            <i class="fas fa-plus"></i> Agregar Primera Habitación
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RoomService from '../services/RoomService.js';
import AuthService from '../../iam/service/auth_service.js';

export default {
  name: 'RoomsManagement',
  data() {
    return {
      rooms: [],
      roomTypes: [],
      hotelId: null,
      isAuthenticated: false,
      showCreateModal: false,
      showCreateTypeModal: false,
      newRoom: { typeRoomId: '', hotelId: null },
      newRoomType: { description: '', price: '' }
    };
  },
  async mounted() {
    this.isAuthenticated = AuthService.isAuthenticated();
    if (this.isAuthenticated) {
      await this.getHotelIdFromToken();
      if (this.hotelId) {
        await this.loadRooms();
        await this.loadRoomTypes();
      }
    }
  },
  methods: {
    async getHotelIdFromToken() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.hotelId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality"];
        this.newRoom.hotelId = this.hotelId;
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    },

    async loadRooms() {
      try {
        const response = await RoomService.getAllRooms(this.hotelId);
        this.rooms = response || [];
      } catch (error) {
        console.error('Error loading rooms:', error);
      }
    },

    async loadRoomTypes() {
      try {
        const promises = [];
        for (let i = 1; i <= 15; i++) {
          promises.push(
              fetch(`https://localhost:7138/api/types-rooms/get-type-room-by-id?id=${i}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                }
              })
          );
        }

        const responses = await Promise.allSettled(promises);
        this.roomTypes = [];

        for (let i = 0; i < responses.length; i++) {
          const result = responses[i];
          if (result.status === 'fulfilled' && result.value.ok) {
            try {
              const roomType = await result.value.json();
              if (roomType && roomType.id) {
                this.roomTypes.push(roomType);
              }
            } catch (error) {
              console.warn(`Error parsing room type ${i + 1}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading room types:', error);
      }
    },

    openCreateModal() {
      this.showCreateModal = true;
      this.newRoom = { typeRoomId: '', hotelId: this.hotelId };
    },

    closeCreateModal() {
      this.showCreateModal = false;
    },

    openCreateTypeModal() {
      this.showCreateTypeModal = true;
      this.newRoomType = { description: '', price: '' };
    },

    closeCreateTypeModal() {
      this.showCreateTypeModal = false;
    },

    async createRoom() {
      try {
        const response = await fetch('https://localhost:7138/api/rooms/create-room', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newRoom)
        });

        if (response.ok) {
          this.showSuccessAlert('Habitación creada exitosamente');
          this.closeCreateModal();
          await this.loadRooms();
        } else {
          this.showErrorAlert('Error al crear la habitación');
        }
      } catch (error) {
        console.error('Error creating room:', error);
      }
    },

    async createRoomType() {
      try {
        const response = await fetch('https://localhost:7138/api/types-rooms/create-type-room', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: this.newRoomType.description.trim(),
            price: parseFloat(this.newRoomType.price)
          })
        });

        if (response.ok) {
          this.showSuccessAlert('Tipo de habitación creado exitosamente');
          this.closeCreateTypeModal();
          await this.loadRoomTypes();
        } else {
          this.showErrorAlert('Error al crear el tipo de habitación');
        }
      } catch (error) {
        console.error('Error creating room type:', error);
      }
    },

    getRoomTypeName(typeRoomId) {
      const roomType = this.roomTypes.find(rt => rt.id === typeRoomId);
      return roomType ? roomType.name || roomType.description : `Tipo ${typeRoomId}`;
    },

    showSuccessAlert(message) {
      this.showAlert(message, 'success');
    },

    showErrorAlert(message) {
      this.showAlert(message, 'error');
    },

    showAlert(message, type) {
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${type}`;
      alertDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      `;

      document.body.appendChild(alertDiv);

      setTimeout(() => {
        alertDiv.remove();
      }, 3000);
    },

    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.rooms-management {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.rooms-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.rooms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.rooms-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-blue {
  background-color: #3498db;
  color: white;
}

.btn-blue:hover {
  background-color: #2980b9;
}

.btn-purple {
  background-color: #9b59b6;
  color: white;
}

.btn-purple:hover {
  background-color: #8e44ad;
}

.btn-create {
  background-color: #28a745;
  color: white;
}

.btn-create:hover {
  background-color: #218838;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

.auth-message {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 2, 0.1);
}

.rooms-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.rooms-list h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.4rem;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.room-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f9f9f9;
  transition: box-shadow 0.3s ease;
}

.room-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.room-header h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.room-info p {
  margin: 0.5rem 0;
  color: #555;
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: #d4edda;
  color: #155724;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state i {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4rem;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #666;
}

.close-modal:hover {
  background: #e74c3c;
  color: white;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.form-group select, .form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group select:focus, .form-group input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.login-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  background-color: #3498db;
  color: white;
  margin: 0.5rem;
}

.login-button:hover {
  background-color: #2980b9;
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
}

.alert-success {
  background-color: #28a745;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.alert-error {
  background-color: #dc3545;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>