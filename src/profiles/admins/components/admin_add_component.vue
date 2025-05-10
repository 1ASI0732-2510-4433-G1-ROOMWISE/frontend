<!-- src/views/AddAdmin.vue -->
<template>
  <div class="add-admin-container">
    <div class="header">
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="title">Add Admin</h1>
    </div>

    <div class="admin-form-card">
      <form @submit.prevent="addAdmin" class="admin-form">
        <div class="form-group">
          <div class="input-icon">
            <i class="fas fa-key"></i>
          </div>
          <input
              v-model="admin.id"
              type="number"
              placeholder="ID"
              class="form-control"
              required
          />
        </div>

        <div class="form-group">
          <div class="input-icon">
            <i class="fas fa-user"></i>
          </div>
          <input
              v-model="admin.username"
              type="text"
              placeholder="Username"
              class="form-control"
              required
          />
        </div>

        <div class="form-group">
          <div class="input-icon">
            <i class="fas fa-user"></i>
          </div>
          <input
              v-model="admin.name"
              type="text"
              placeholder="Name"
              class="form-control"
              required
          />
        </div>

        <div class="form-group">
          <div class="input-icon">
            <i class="fas fa-user"></i>
          </div>
          <input
              v-model="admin.surname"
              type="text"
              placeholder="Surname"
              class="form-control"
              required
          />
        </div>

        <div class="form-group">
          <div class="input-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <input
              v-model="admin.email"
              type="email"
              placeholder="Email"
              class="form-control"
              required
          />
        </div>

        <div class="form-group">
          <div class="input-icon">
            <i class="fas fa-phone"></i>
          </div>
          <input
              v-model="admin.phone"
              type="tel"
              placeholder="Phone"
              class="form-control"
              required
          />
        </div>

        <div class="form-group">
          <div class="input-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <select
              v-model="admin.state"
              class="form-control"
              required
          >
            <option value="" disabled>Select State</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="form-group">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
          </div>
          <input
              v-model="admin.password"
              type="password"
              placeholder="Password"
              class="form-control"
              required
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="button-container">
          <button type="submit" class="submit-button" :disabled="isLoading">
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin"></i>
              Loading...
            </span>
            <span v-else>
              Add Admin
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AdminService from '../../admins/services/AdminService';
import NotificationService from '../../../communication/services/notificationService.js';
import Notification from '../../../communication/model/Notification';

export default {
  name: 'AddAdmin',

  data() {
    return {
      admin: {
        id: '',
        username: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
        state: 'active', // Set default state
        password: ''
      },
      isLoading: false,
      errorMessage: '',
      adminService: new AdminService(),
      notificationService: new NotificationService() // Now correctly instantiated
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async addAdmin() {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        // Check if the ID is already being used
        const hotelId = this.adminService.getHotelIdFromToken();
        if (hotelId) {
          const existingAdmins = await this.adminService.getAdminsByHotelId(hotelId);
          const idExists = existingAdmins.some(admin => admin.id === parseInt(this.admin.id));

          if (idExists) {
            this.errorMessage = 'An admin with this ID already exists.';
            this.isLoading = false;
            return;
          }
        }

        // Convert string fields to appropriate types
        const adminData = {
          id: this.admin.id ? parseInt(this.admin.id) : null,
          username: this.admin.username,
          name: this.admin.name,
          surname: this.admin.surname,
          email: this.admin.email,
          phone: this.admin.phone ? this.admin.phone.toString() : null, // Ensure phone is string
          state: this.admin.state,
          password: this.admin.password,
          hotelId: hotelId // Add hotelId to the request
        };

        // Create admin
        const response = await this.adminService.createAdmin(adminData);

        // Get owner ID from token
        const ownerId = this.adminService.getUserIdFromToken();

        if (ownerId) {
          // Create welcome notification
          const notification = new Notification(
              1, // Notification type (1 = message)
              parseInt(ownerId), // User ID
              parseInt(this.admin.id), // Admin ID
              0, // Workers ID
              'Welcome to SweetManager!', // Title
              'Welcome to SweetManager! We\'re thrilled to support your hotel management journey with streamlined operations, improved communication, and enhanced guest satisfaction. Let\'s succeed together!' // Description
          );

          // Try to create notification but don't block admin creation on failure
          try {
            await this.notificationService.createNotification(notification);
            this.toast?.success('Admin added and notification sent successfully!');
          } catch (notificationError) {
            console.error('Notification error:', notificationError);
            // Continue with success message even if notification fails
            this.toast?.success('Admin added successfully!');
          }
        } else {
          this.toast?.success('Admin added successfully!');
        }

        // Dispatch a custom event that admin was added
        document.dispatchEvent(new CustomEvent('admin-added'));

        // Return to previous page
        this.$router.go(-1);
      } catch (error) {
        console.error('Error adding admin:', error);

        // Extract the most useful error message
        let errorMessage = 'Failed to add admin';

        if (error.response && error.response.data) {
          // Handle structured error response
          if (typeof error.response.data === 'string') {
            errorMessage = `${errorMessage}: ${error.response.data}`;
          } else if (error.response.data.message) {
            errorMessage = `${errorMessage}: ${error.response.data.message}`;
          }
        } else if (error.message) {
          errorMessage = `${errorMessage}: ${error.message}`;
        }

        this.errorMessage = errorMessage;
        // Use optional chaining to prevent errors if toast is undefined
        this.toast?.error?.(errorMessage);
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.add-admin-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-right: 10px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #474C74;
}

.admin-form-card {
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 25px;
}

.form-group {
  position: relative;
  margin-bottom: 15px;
}

.input-icon {
  position: absolute;
  left: 10px;
  top: 12px;
  color: #666;
}

.form-control {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.submit-button {
  background-color: #474C74;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #3A3E5C;
}

.submit-button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin: 10px 0;
  padding: 10px;
  background-color: #fadbd8;
  border-radius: 4px;
  text-align: center;
}
</style>