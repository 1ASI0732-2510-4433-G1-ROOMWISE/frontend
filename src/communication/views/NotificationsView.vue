<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <h1>Notificaciones</h1>
      <button class="add-notification-button">
        <span class="button-icon">➕</span>
        Agregar Notificación
      </button>
    </div>

    <div class="notifications-table-container">
      <table class="notifications-table">
        <thead>
        <tr>
          <th>TIPO</th>
          <th>FECHA</th>
          <th>HORA</th>
          <th>ESTADO</th>
          <th>MENSAJE</th>
          <th>ACCIONES</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="isLoading">
          <td colspan="6" class="loading-message">Cargando notificaciones...</td>
        </tr>
        <tr v-else-if="notifications.length === 0">
          <td colspan="6" class="empty-message">No hay notificaciones disponibles</td>
        </tr>
        <tr v-for="notification in displayedNotifications" :key="notification.id">
          <td>{{ getNotificationType(notification.typesNotificationsId) }}</td>
          <td>{{ formatDate(notification.createdAt) }}</td>
          <td>{{ formatTime(notification.createdAt) }}</td>
          <td>{{ notification.read ? 'Leído' : 'No leído' }}</td>
          <td>{{ notification.title }}</td>
          <td>
            <div class="actions-dropdown">
              <button class="dropdown-button">Acciones ▼</button>
              <div class="dropdown-content">
                <button @click="viewNotification(notification)">Ver detalles</button>
                <button @click="markAsRead(notification)" v-if="!notification.read">Marcar como leído</button>
                <button @click="deleteNotification(notification)">Eliminar</button>
              </div>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span>Notificaciones por página</span>
      <select v-model="perPage" @change="handlePerPageChange">
        <option value="3">3</option>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
      </select>
      <span>{{ paginationText }}</span>
      <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1">
          <span class="pagination-arrow">◀</span>
        </button>
        <button @click="nextPage" :disabled="currentPage >= totalPages">
          <span class="pagination-arrow">▶</span>
        </button>
      </div>
    </div>

    <!-- Modal para ver detalles -->
    <div v-if="showModal" class="notification-modal">
      <div class="modal-content">
        <span class="close-button" @click="closeModal">&times;</span>
        <h2>Detalles de la notificación</h2>
        <div class="notification-details">
          <div class="detail-row">
            <strong>Tipo:</strong>
            <span>{{ getNotificationType(selectedNotification.typesNotificationsId) }}</span>
          </div>
          <div class="detail-row">
            <strong>Título:</strong>
            <span>{{ selectedNotification.title }}</span>
          </div>
          <div class="detail-row">
            <strong>Fecha:</strong>
            <span>{{ formatDate(selectedNotification.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <strong>Hora:</strong>
            <span>{{ formatTime(selectedNotification.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <strong>Descripción:</strong>
            <p>{{ selectedNotification.description }}</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="close-modal-button">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import notificationService from '../services/notificationService.js';
import AuthService from '../../iam/service/auth_service.js';

export default {
  name: 'NotificationsView',
  data() {
    return {
      notifications: [],
      isLoading: true,
      currentPage: 1,
      perPage: 3,
      showModal: false,
      selectedNotification: {},
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.notifications.length / this.perPage);
    },
    displayedNotifications() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.notifications.slice(start, end);
    },
    paginationText() {
      if (this.notifications.length === 0) return '0-0 de 0';
      const start = (this.currentPage - 1) * this.perPage + 1;
      const end = Math.min(start + this.perPage - 1, this.notifications.length);
      return `${start}-${end} de ${this.notifications.length}`;
    }
  },
  async created() {
    await this.fetchNotifications();
  },
  methods: {
    async fetchNotifications() {
      try {
        this.isLoading = true;
        const hotelId = AuthService.getCurrentHotelId();
        this.notifications = await notificationService.getAllNotifications(hotelId);

        // Añadimos un campo 'read' temporal para simular el estado
        this.notifications = this.notifications.map(n => ({
          ...n,
          read: false,
          createdAt: new Date().toISOString() // Simulamos una fecha de creación
        }));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        this.isLoading = false;
      }
    },
    getNotificationType(typeId) {
      const types = {
        1: 'Solicitud',
        2: 'Recordatorio',
        3: 'Comentario',
        // Agregar más tipos según sea necesario
      };
      return types[typeId] || 'Otro';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    },
    formatTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    handlePerPageChange() {
      this.currentPage = 1; // Reset to first page
    },
    viewNotification(notification) {
      this.selectedNotification = notification;
      this.showModal = true;
    },
    async markAsRead(notification) {
      // Aquí iría la lógica para marcar como leído en el backend
      notification.read = true;
    },
    async deleteNotification(notification) {
      // Implementar lógica para eliminar notificación
      if (confirm('¿Está seguro que desea eliminar esta notificación?')) {
        // Aquí iría el código para eliminar en el backend
        this.notifications = this.notifications.filter(n => n !== notification);
      }
    },
    closeModal() {
      this.showModal = false;
    }
  }
};
</script>

<style scoped>
.notifications-container {
  background-color: #f5f7fa;
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
  margin: 0;
  height: auto;
  min-height: auto;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.notifications-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
  font-weight: 600;
}

.add-notification-button {
  display: flex;
  align-items: center;
  background-color: #437f54;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-notification-button:hover {
  background-color: #356745;
}

.button-icon {
  margin-right: 8px;
}

.notifications-table-container {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.notifications-table {
  width: 100%;
  border-collapse: collapse;
}

.notifications-table th,
.notifications-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #edf2f7;
}

.notifications-table th {
  background-color: #437f54;
  color: white;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.notifications-table tr:nth-child(even) {
  background-color: #f8fafc;
}

.notifications-table tr:hover {
  background-color: #f0f4f8;
}

.loading-message,
.empty-message {
  text-align: center;
  padding: 1rem;
  color: #718096;
}

.actions-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  background-color: #437f54;
  color: white;
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background-color: white;
  min-width: 140px;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.1);
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
}

.dropdown-content button {
  color: #4a5568;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  display: block;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;
}

.dropdown-content button:hover {
  background-color: #f0f4f8;
  color: #437f54;
}

.actions-dropdown:hover .dropdown-content {
  display: block;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.85rem;
  color: #4a5568;
}

.pagination select {
  margin: 0 8px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: white;
}

.pagination-controls {
  display: flex;
  margin-left: 12px;
}

.pagination-controls button {
  border: 1px solid #e2e8f0;
  background-color: white;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination-controls button:first-child {
  border-radius: 4px 0 0 4px;
}

.pagination-controls button:last-child {
  border-radius: 0 4px 4px 0;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-controls button:not(:disabled):hover {
  background-color: #f0f4f8;
}

/* Modal styles */
.notification-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.close-button {
  position: absolute;
  top: 12px;
  right: 15px;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
}

.close-button:hover {
  color: #2d3748;
}

.notification-details {
  margin: 15px 0;
}

.detail-row {
  margin-bottom: 12px;
}

.detail-row strong {
  display: inline-block;
  min-width: 90px;
  color: #4a5568;
}

.modal-actions {
  margin-top: 20px;
  text-align: right;
}

.close-modal-button {
  background-color: #e2e8f0;
  color: #4a5568;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.close-modal-button:hover {
  background-color: #cbd5e0;
}

@media (max-width: 768px) {
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-notification-button {
    margin-top: 0.75rem;
  }

  .notifications-table th,
  .notifications-table td {
    padding: 0.5rem 0.4rem;
    font-size: 0.8rem;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination > * {
    margin: 5px;
  }
}
</style>