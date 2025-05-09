<!-- src/views/admin/AdminManagement.vue -->
<template>
  <BaseLayout :role="role">
    <template #content>
      <div class="admin-management-container">
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
        </div>

        <div v-else>
          <div class="header-section">
            <h1>Admins</h1>
            <button @click="addAdmin" class="add-button">
              <i class="fas fa-plus"></i> Add Admin
            </button>
          </div>

          <div v-if="admins.length === 0" class="empty-state">
            <p>There are no admins records yet</p>
          </div>

          <div v-else class="table-container">
            <table class="admin-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="admin in admins" :key="admin.id">
                <td>{{ admin.id || 'N/A' }}</td>
                <td>{{ admin.name || 'N/A' }}</td>
                <td>{{ admin.surname || 'N/A' }}</td>
                <td>{{ admin.email || 'N/A' }}</td>
                <td>{{ admin.phone || 'N/A' }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </BaseLayout>
</template>

<script>
import BaseLayout from '@/layouts/BaseLayout.vue';
import AdminService from '@/services/AdminService';
import { getRole, getHotelId } from '@/services/AuthService';

export default {
  name: 'AdminManagement',
  components: {
    BaseLayout,
  },
  data() {
    return {
      admins: [],
      isLoading: true,
      hotelId: null,
      role: null,
      adminService: new AdminService(),
    };
  },
  async created() {
    await this.loadHotelId();
    this.role = await getRole();
  },
  methods: {
    async loadHotelId() {
      try {
        const tokenHotelId = await getHotelId();
        console.log('Hotel ID:', tokenHotelId);

        if (tokenHotelId) {
          this.hotelId = tokenHotelId;
          await this.fetchAdmins();
        } else {
          this.isLoading = false;
          this.$toast.error('Hotel ID not found');
        }
      } catch (error) {
        console.error('Error loading hotel ID:', error);
        this.isLoading = false;
        this.$toast.error('Error loading hotel information');
      }
    },
    async fetchAdmins() {
      if (!this.hotelId) return;

      try {
        console.log('Fetching admins for hotelId:', this.hotelId);
        const fetchedAdmins = await this.adminService.getAdminsByHotelId(this.hotelId);
        console.log('Fetched admins:', fetchedAdmins);
        this.admins = fetchedAdmins;
      } catch (error) {
        console.error('Error fetching admins:', error);
        this.$toast.error(`Failed to load admins: ${error.message}`);
      } finally {
        this.isLoading = false;
      }
    },
    addAdmin() {
      this.$router.push({ name: 'AdminAdd' });
    },
  },
};
</script>

<style scoped>
.admin-management-container {
  padding: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #474C74;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button {
  background-color: #474C74;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.admin-table th {
  background-color: #474C74;
  color: white;
  padding: 12px;
  text-align: left;
}

.admin-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.admin-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.admin-table tr:hover {
  background-color: #f1f1f1;
}
</style>