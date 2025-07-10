<template>
  <div class="add-notification-container">
    <div class="add-notification-card">
      <div class="form-header">
        <h1>Create New Notification</h1>
        <p>Fill out the form below to send a new notification</p>
      </div>

      <form @submit.prevent="submitNotification" class="notification-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="typesNotificationsId">Notification Type *</label>
            <select
                v-model="typesNotificationsId"
                id="typesNotificationsId"
                class="form-select"
                required
            >
              <option value="">Select notification type</option>
              <option
                  v-for="type in notificationTypes"
                  :key="type.id"
                  :value="type.id"
              >
                {{ type.name }}
              </option>
            </select>
            <span class="input-icon">🔔</span>
          </div>

          <div class="form-group">
            <label for="title">Title *</label>
            <input
                v-model="title"
                type="text"
                id="title"
                class="form-input"
                placeholder="Notification title"
                required
            />
            <span class="input-icon">✏️</span>
          </div>

          <div class="form-group">
            <label for="ownersId">Owner</label>
            <input
                :value="ownerDisplayName"
                type="text"
                id="ownersId"
                class="form-input"
                placeholder="Owner (auto-assigned)"
                readonly
                disabled
            />
            <span class="input-icon">👤</span>
          </div>

          <div class="form-group">
            <label for="adminsId">Admin</label>
            <select
                v-model="adminsId"
                id="adminsId"
                class="form-select"
            >
              <option value="">Select admin (optional)</option>
              <option
                  v-for="admin in uniqueAdmins"
                  :key="admin.id"
                  :value="admin.id"
              >
                {{ admin.name }} (ID: {{ admin.id }})
              </option>
            </select>
            <span class="input-icon">👔</span>
          </div>

          <div class="form-group">
            <label for="workersId">Worker</label>
            <select
                v-model="workersId"
                id="workersId"
                class="form-select"
            >
              <option value="">Select worker (optional)</option>
              <option
                  v-for="worker in uniqueWorkers"
                  :key="worker.id"
                  :value="worker.id"
              >
                {{ worker.name }} (ID: {{ worker.id }})
              </option>
            </select>
            <span class="input-icon">👷</span>
          </div>

          <div class="form-group full-width">
            <label for="description">Description *</label>
            <div class="textarea-container">
              <textarea
                  v-model="description"
                  id="description"
                  class="form-textarea"
                  placeholder="Enter detailed notification description..."
                  rows="4"
                  required
              ></textarea>
              <span class="textarea-icon">📝</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="resetForm">
            Clear Form
          </button>
          <button type="submit" class="primary-button" :disabled="isSubmitting">
            <span class="button-icon">📨</span>
            {{ isSubmitting ? 'Creating...' : 'Create Notification' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script>
import Notification from '../model/Notification.js';
import NotificationService from '../services/notificationService.js';

const notificationService = new NotificationService();

export default {
  name: 'AddNotificationView',
  data() {
    return {
      typesNotificationsId: '',
      ownersId: null,
      adminsId: null,
      workersId: null,
      title: '',
      description: '',
      notificationTypes: [],
      admins: [],
      workers: [],
      ownerDisplayName: '',
      hotelId: null,
      isSubmitting: false,
      message: '',
      messageType: '',
      dataLoaded: false
    };
  },
  computed: {
    // Filtrar admins únicos por ID
    uniqueAdmins() {
      const seen = new Set();
      return this.admins.filter(admin => {
        if (seen.has(admin.id)) {
          return false;
        }
        seen.add(admin.id);
        return true;
      });
    },
    // Filtrar workers únicos por ID
    uniqueWorkers() {
      const seen = new Set();
      return this.workers.filter(worker => {
        if (seen.has(worker.id)) {
          return false;
        }
        seen.add(worker.id);
        return true;
      });
    }
  },
  async created() {
    await this.initializeForm();
  },
  methods: {
    async initializeForm() {
      try {
        // Evitar múltiples inicializaciones
        if (this.dataLoaded) return;

        // Get claims from token
        const claims = this.getTokenClaims();
        if (!claims.sid) {
          this.showMessage('Unable to get user information. Please log in again.', 'error');
          return;
        }

        // Set owner ID from claims
        this.ownersId = parseInt(claims.sid);
        this.hotelId = claims.locality ? parseInt(claims.locality) : null;

        // Set display name for owner
        this.ownerDisplayName = `Owner ID: ${this.ownersId}`;

        // Load all required data in parallel
        await this.loadAllData();
        this.dataLoaded = true;

      } catch (error) {
        console.error('Error initializing form:', error);
        this.showMessage('Error initializing form. Please refresh the page.', 'error');
      }
    },

    async loadAllData() {
      try {
        // Cargar datos en paralelo con Promise.allSettled para manejar errores individualmente
        const results = await Promise.allSettled([
          this.fetchNotificationTypes(),
          this.fetchAdmins(),
          this.fetchWorkers()
        ]);

        // Verificar qué promesas fallaron
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const dataTypes = ['notification types', 'admins', 'workers'];
            console.error(`Failed to load ${dataTypes[index]}:`, result.reason);
          }
        });

        // Solo mostrar error si falló algo crítico (notification types)
        if (results[0].status === 'rejected') {
          this.showMessage('Failed to load notification types. Please refresh the page.', 'error');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        this.showMessage('Error loading form data. Please refresh the page.', 'error');
      }
    },

    getTokenClaims() {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }

        const payload = JSON.parse(atob(parts[1]));

        return {
          sid: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"],
          locality: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality"]
        };
      } catch (error) {
        console.error('Error decoding token:', error);
        return {};
      }
    },

    async fetchNotificationTypes() {
      try {
        this.notificationTypes = await notificationService.getNotificationTypes();
      } catch (error) {
        console.error('Failed to load notification types:', error);
        throw error; // Re-throw para manejar en loadAllData
      }
    },

    async fetchAdmins() {
      try {
        if (!this.hotelId) {
          console.warn('Hotel ID not available, skipping admin fetch');
          return;
        }

        const data = await this.fetchUserData('admins', this.hotelId);
        this.admins = this.normalizeUserData(data);
      } catch (error) {
        console.error('Failed to load admins:', error);
        this.admins = [];
      }
    },

    async fetchWorkers() {
      try {
        if (!this.hotelId) {
          console.warn('Hotel ID not available, skipping worker fetch');
          return;
        }

        const data = await this.fetchUserData('workers', this.hotelId);
        this.workers = this.normalizeUserData(data);
      } catch (error) {
        console.error('Failed to load workers:', error);
        this.workers = [];
      }
    },

    // Método unificado para obtener datos de usuarios
    async fetchUserData(userType, hotelId) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }

      const endpoints = {
        admins: `https://localhost:7138/api/v1/user/get-all-admins?hotelId=${hotelId}`,
        workers: `https://localhost:7138/api/v1/user/get-all-workers?hotelId=${hotelId}`
      };

      const response = await fetch(endpoints[userType], {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${userType}: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`${userType} API returned invalid response format`);
      }

      return await response.json();
    },

    // Normalizar datos de usuarios y eliminar duplicados
    normalizeUserData(data) {
      let users = [];

      // Manejar diferentes estructuras de respuesta
      if (Array.isArray(data)) {
        users = data;
      } else if (data && Array.isArray(data.data)) {
        users = data.data;
      } else if (data && data.admins && Array.isArray(data.admins)) {
        users = data.admins;
      } else if (data && data.workers && Array.isArray(data.workers)) {
        users = data.workers;
      }

      // Filtrar duplicados por ID y asegurar que tengan las propiedades necesarias
      const uniqueUsers = users.filter((user, index, self) => {
        return user &&
            user.id &&
            user.name &&
            index === self.findIndex(u => u.id === user.id);
      });

      return uniqueUsers;
    },

    async submitNotification() {
      // Validaciones
      if (!this.typesNotificationsId || !this.title || !this.description) {
        this.showMessage('Please fill in all required fields.', 'error');
        return;
      }

      if (!this.ownersId) {
        this.showMessage('Owner ID is required but not available. Please log in again.', 'error');
        return;
      }

      this.isSubmitting = true;
      this.message = '';

      try {
        const newNotification = new Notification(
            parseInt(this.typesNotificationsId),
            this.ownersId,
            this.adminsId ? parseInt(this.adminsId) : 0,
            this.workersId ? parseInt(this.workersId) : 0,
            this.title,
            this.description
        );

        const result = await notificationService.createNotification(newNotification);

        if (result) {
          this.showMessage('Notification created successfully!', 'success');
          this.resetForm();
          this.$emit('notification-created', result);
        } else {
          this.showMessage('Failed to create notification. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error creating notification:', error);

        let errorMessage = 'An error occurred while creating the notification.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showMessage(errorMessage, 'error');
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.typesNotificationsId = '';
      this.adminsId = null;
      this.workersId = null;
      this.title = '';
      this.description = '';
      this.message = '';
      // Don't reset ownersId as it comes from token
    },

    showMessage(text, type) {
      this.message = text;
      this.messageType = type;

      // Auto-hide message after 5 seconds
      setTimeout(() => {
        this.message = '';
      }, 5000);
    }
  }
};
</script>

<style scoped>
.add-notification-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 2rem;
}

.add-notification-card {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 1rem;
}

.form-header {
  padding: 2rem 2rem 1rem;
  background-color: #437f54;
  color: white;
}

.form-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.form-header p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.notification-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  position: relative;
  margin-bottom: 0;
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #437f54;
  box-shadow: 0 0 0 3px rgba(67, 127, 84, 0.1);
  background-color: white;
}

.form-input:disabled {
  background-color: #e2e8f0;
  color: #718096;
  cursor: not-allowed;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1em;
  padding-right: 2.5rem;
}

.textarea-container {
  position: relative;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  resize: vertical;
  background-color: #f8fafc;
  min-height: 120px;
  overflow-y: auto;
}

.form-textarea:focus {
  outline: none;
  border-color: #437f54;
  box-shadow: 0 0 0 3px rgba(67, 127, 84, 0.1);
  background-color: white;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 2.5rem;
  transform: translateY(-50%);
  font-size: 1rem;
  opacity: 0.6;
}

.textarea-icon {
  position: absolute;
  left: 1rem;
  top: 0.65rem;
  font-size: 1rem;
  opacity: 0.6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #edf2f7;
}

.primary-button {
  background-color: #437f54;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-button:hover:not(:disabled) {
  background-color: #356745;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(67, 127, 84, 0.2);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  background-color: white;
  color: #4a5568;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background-color: #f8fafc;
  border-color: #cbd5e0;
}

.button-icon {
  font-size: 1rem;
}

.message {
  width: 100%;
  max-width: 800px;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: span 1;
  }

  .add-notification-card {
    max-width: 100%;
  }
}
</style>