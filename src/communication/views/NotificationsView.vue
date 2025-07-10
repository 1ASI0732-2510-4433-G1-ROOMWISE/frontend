<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <h1>Notifications</h1>
      <button class="add-notification-button" @click="goToAddNotification">
        <span class="button-icon">➕</span>
        Add Notification
      </button>
    </div>

    <div class="notifications-table-container">
      <table class="notifications-table">
        <thead>
        <tr>
          <th>TYPE</th>
          <th>DATE</th>
          <th>TITLE</th>
          <th>SENDER</th>
          <th>ACTIONS</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="isLoading">
          <td colspan="5" class="loading-message">Loading notifications...</td>
        </tr>
        <tr v-else-if="notifications.length === 0">
          <td colspan="5" class="empty-message">No notifications available</td>
        </tr>
        <tr v-for="notification in displayedNotifications" :key="notification.id">
          <td>{{ getNotificationType(notification.typesNotificationsId) }}</td>
          <td>{{ formatDate(notification.startDate) }}</td>
          <td>{{ notification.title }}</td>
          <td>{{ getSender(notification) }}</td>
          <td>
            <div class="actions-dropdown">
              <button class="dropdown-button">Actions ▼</button>
              <div class="dropdown-content">
                <button @click="viewNotification(notification)">View Details</button>
                <button @click="deleteNotification(notification)" class="delete-btn">Delete</button>
              </div>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span>{{ paginationText }}</span>
      <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1">◀</button>
        <button @click="nextPage" :disabled="currentPage >= totalPages">▶</button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="notification-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <span class="close-button" @click="closeModal">&times;</span>
        <h2>Notification Details</h2>
        <div class="notification-details">
          <div class="detail-row">
            <strong>Type:</strong> {{ getNotificationType(selectedNotification.typesNotificationsId) }}
          </div>
          <div class="detail-row">
            <strong>Title:</strong> {{ selectedNotification.title }}
          </div>
          <div class="detail-row">
            <strong>Date:</strong> {{ formatDate(selectedNotification.startDate) }}
          </div>
          <div class="detail-row">
            <strong>Sender:</strong> {{ getSender(selectedNotification) }}
          </div>
          <div class="detail-row full-width">
            <strong>Description:</strong>
            <p>{{ selectedNotification.description }}</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="close-modal-button">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NotificationService from '../services/notificationService.js';

const notificationService = new NotificationService();

export default {
  name: 'NotificationsView',
  data() {
    return {
      notifications: [],
      notificationTypes: [],
      userInfo: null,
      isLoading: true,
      currentPage: 1,
      perPage: 5,
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
      return this.notifications.slice(start, start + this.perPage);
    },
    paginationText() {
      if (this.notifications.length === 0) return '0 of 0';
      const start = (this.currentPage - 1) * this.perPage + 1;
      const end = Math.min(start + this.perPage - 1, this.notifications.length);
      return `${start}-${end} of ${this.notifications.length}`;
    }
  },
  async created() {
    await this.fetchUserInfo();
    await this.fetchNotifications();
    await this.fetchNotificationTypes();
  },
  methods: {
    async fetchUserInfo() {
      try {
        const userId = this.getUserIdFromToken();
        if (userId) {
          // Usar el endpoint para obtener la información del usuario
          const response = await fetch(`https://localhost:7138/api/v1/user/get-owner-id?id=${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            this.userInfo = await response.json();
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    },
    async fetchNotifications() {
      try {
        this.isLoading = true;
        const hotelId = this.getHotelIdFromToken();
        this.notifications = await notificationService.getAllNotifications(hotelId);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        this.notifications = [];
      } finally {
        this.isLoading = false;
      }
    },
    async fetchNotificationTypes() {
      try {
        this.notificationTypes = await notificationService.getNotificationTypes();
      } catch (error) {
        console.error('Error fetching notification types:', error);
      }
    },
    getHotelIdFromToken() {
      const token = localStorage.getItem('token');
      if (!token) return null;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality'];
      } catch (error) {
        console.error('Error parsing token:', error);
        return null;
      }
    },
    getUserIdFromToken() {
      const token = localStorage.getItem('token');
      if (!token) return null;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
      } catch (error) {
        console.error('Error parsing token:', error);
        return null;
      }
    },
    getNotificationType(typeId) {
      const type = this.notificationTypes.find(t => t.id === typeId);
      return type ? type.name : `Type ${typeId}`;
    },
    getSender(notification) {
      if (this.userInfo) {
        const userName = this.userInfo.name || this.userInfo.name || 'Unknown';
        const userId = this.getUserIdFromToken();
        return `${userName} (ID: ${userId})`;
      }

      // Fallback si no se pudo obtener la información del usuario
      const userId = this.getUserIdFromToken();
      return userId ? `User ID: ${userId}` : 'Unknown Sender';
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    viewNotification(notification) {
      this.selectedNotification = notification;
      this.showModal = true;
    },
    async deleteNotification(notification) {
      if (!confirm('Are you sure you want to delete this notification?')) return;

      try {
        await notificationService.deleteNotification(notification.id);
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        if (this.displayedNotifications.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification');
      }
    },
    closeModal() {
      this.showModal = false;
      this.selectedNotification = {};
    },
    goToAddNotification() {
      this.$router.push('/add-notification');
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
  margin-bottom: 1rem;
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
  display: block;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.8rem;
}

.dropdown-content button:hover {
  background-color: #f0f4f8;
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

.pagination-controls {
  display: flex;
  margin-left: 12px;
}

.pagination-controls button {
  border: 1px solid #e2e8f0;
  background-color: white;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  margin: 0 2px;
  border-radius: 4px;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-controls button:not(:disabled):hover {
  background-color: #f0f4f8;
}

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
    justify-content: center;
  }
}
</style>