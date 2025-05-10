<template>
  <div class="worker-management">
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
    </div>
    <div v-else class="content">
      <div class="header-container">
        <div class="header">
          <h1>Workers</h1>
          <div class="actions">
            <button @click="addWorker" class="add-button" title="Add New Worker">
              <i class="fas fa-plus"></i>
            </button>
            <button @click="addWorker" class="add-button-text">
              Add Worker
            </button>
          </div>
        </div>
      </div>

      <div v-if="workers.length === 0" class="empty-state">
        <p>There are no workers records yet</p>
        <button @click="addWorker" class="add-worker-btn">
          <i class="fas fa-plus-circle"></i> Add Your First Worker
        </button>
      </div>
      <div v-else class="table-container">
        <table class="worker-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="worker in workers" :key="worker.id" class="worker-row">
            <td>{{ worker.id || 'N/A' }}</td>
            <td>{{ worker.name || 'N/A' }}</td>
            <td>{{ worker.surname || 'N/A' }}</td>
            <td>{{ worker.email || 'N/A' }}</td>
            <td>{{ worker.phone || 'N/A' }}</td>
            <td>
                <span class="status-badge" :class="worker.state === 'active' ? 'active' : 'inactive'">
                  {{ worker.state || 'N/A' }}
                </span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import WorkerService from '../services/workerService.js';
import { jwtDecode } from "jwt-decode";

export default {
  name: 'WorkerManagement',
  setup() {
    const router = useRouter();
    const workerService = new WorkerService();
    const workers = ref([]);
    const isLoading = ref(true);
    const hotelId = ref(null);
    const role = ref(null);

    const getRole = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toString();
        } catch (error) {
          console.error('Error decoding token for role:', error);
        }
      }
      return null;
    };

    const getHotelId = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality']) {
            return parseInt(decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality']);
          } else {
            console.log('Hotel ID not found in token');
            return null;
          }
        } catch (error) {
          console.error('Failed to Convert Hotel ID:', error);
          return null;
        }
      }
      return null;
    };

    const loadHotelId = async () => {
      const tokenHotelId = await getHotelId();
      console.log('Hotel ID:', tokenHotelId);

      if (tokenHotelId) {
        hotelId.value = tokenHotelId;
        fetchWorkers();
      } else {
        isLoading.value = false;
        // Show notification
        alert('Hotel ID not found');
      }
    };

    const fetchWorkers = async () => {
      if (!hotelId.value) return;

      try {
        console.log('Fetching workers for hotelId:', hotelId.value);
        const fetchedWorkers = await workerService.getWorkersByHotelId(hotelId.value);
        console.log('Fetched workers:', fetchedWorkers);
        workers.value = fetchedWorkers;
        isLoading.value = false;
      } catch (error) {
        isLoading.value = false;
        console.error('Error fetching workers:', error);
        alert(`Failed to load workers: ${error}`);
      }
    };

    const addWorker = () => {
      router.push('/workers/add');
    };

    onMounted(async () => {
      role.value = await getRole();
      await loadHotelId();
    });

    return {
      workers,
      isLoading,
      role,
      addWorker
    };
  }
};
</script>

<style scoped>
.worker-management {
  width: 100%;
  height: 100%;
  padding: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #474C74;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-container {
  padding: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #474C74;
}

.add-button-text {
  background-color: #474C74;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
}

.add-button-text:hover {
  background-color: #3A3E5C;
}

.add-button:hover {
  color: #333;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-size: 18px;
  gap: 20px;
}

.add-worker-btn {
  background-color: #474C74;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-worker-btn:hover {
  background-color: #3A3E5C;
}

.table-container {
  padding: 16px;
  overflow-x: auto;
  flex-grow: 1;
}

.worker-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.worker-table th {
  background-color: #474C74;
  color: white;
  font-weight: bold;
  text-align: left;
  padding: 12px 16px;
}

.worker-table td {
  background-color: white;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.worker-row:hover td {
  background-color: #f5f7fa;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background-color: #e3f8e5;
  color: #28a745;
}

.status-badge.inactive {
  background-color: #fee8e7;
  color: #dc3545;
}
</style>