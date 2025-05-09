<!-- src/views/admin/AdminAdd.vue -->
<template>
  <div class="admin-add-container">
    <div class="header">
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>Add Admin</h1>
    </div>

    <div class="form-container">
      <form @submit.prevent="addAdmin">
        <div class="form-group">
          <label for="id">ID</label>
          <input
              id="id"
              v-model="adminData.id"
              type="number"
              required
              placeholder="Enter ID"
          >
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
              id="username"
              v-model="adminData.username"
              required
              placeholder="Enter username"
          >
        </div>

        <div class="form-group">
          <label for="name">Name</label>
          <input
              id="name"
              v-model="adminData.name"
              required
              placeholder="Enter name"
          >
        </div>

        <div class="form-group">
          <label for="surname">Surname</label>
          <input
              id="surname"
              v-model="adminData.surname"
              required
              placeholder="Enter surname"
          >
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
              id="email"
              v-model="adminData.email"
              type="email"
              required
              placeholder="Enter email"
          >
        </div>

        <div class="form-group">
          <label for="phone">Phone</label>
          <input
              id="phone"
              v-model="adminData.phone"
              type="number"
              required
              placeholder="Enter phone number"
          >
        </div>

        <div class="form-group">
          <label for="state">State</label>
          <input
              id="state"
              v-model="adminData.state"
              required
              placeholder="Enter state"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
              id="password"
              v-model="adminData.password"
              type="password"
              required
              placeholder="Enter password"
          >
        </div>

        <button type="submit" :disabled="isLoading" class="submit-button">
          <span v-if="isLoading">Adding...</span>
          <span v-else>Add Admin</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import AdminService from '@/services/AdminService';
import NotificationService from '@/services/NotificationService';
import { getIdentity } from '@/services/AuthService';

export default {
  name: 'AdminAdd',
  data() {
    return {
      adminData: {
        id: '',
        username: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
        state: '',
        password: '',
      },
      isLoading: false,
      adminService: new AdminService(),
      notificationService: new NotificationService(),
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async addAdmin() {
      this.isLoading = true;
      try {
        // Convert data types as needed
        const payload = {
          ...this.adminData,
          id: parseInt(this.adminData.id),
          phone: parseInt(this.adminData.phone),
        };

        await this.adminService.createAdmin(payload);

        // Get owner ID from token
        const ownersId = await getIdentity();

        // Create notification
        const notificationData = {
          type: 1,
          ownerId: parseInt(ownersId),
          adminId: parseInt(this.adminData.id),
          workersId: 0,
          title: 'Welcome to SweetManager!',
          description: 'Welcome to SweetManager! We\'re thrilled to support your hotel management journey with streamlined operations, improved communication, and enhanced guest satisfaction. Let\'s succeed together!',
        };

        const isNotificationCreated = await this.notificationService.createNotification(notificationData);

        if (isNotificationCreated) {
          this.$toast.success('Admin added and notification sent successfully!');
        } else {
          this.$toast.error('Failed to create notification!');
        }

        this.$router.push({ name: 'AdminManagement' });
      } catch (error) {
        console.error('Error adding admin:', error);
        this.$toast.error(`Failed to add admin: ${error.message}`);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.admin-add-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 15px;
}

.form-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.submit-button {
  background-color: #474C74;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>