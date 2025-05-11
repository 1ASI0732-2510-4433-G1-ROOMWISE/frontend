<!-- src/views/Provider/ProviderManagement.vue -->
<template>
  <div class="provider-management">
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
    </div>
    <div v-else class="content">
      <div class="header-container">
        <div class="header">
          <h1>Providers</h1>
          <div class="actions">
            <button @click="addProvider" class="add-button-text">
              <i class="fas fa-plus"></i> Add Provider
            </button>
          </div>
        </div>

        <!-- Search and filter section -->
        <div class="search-filter">
          <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Search providers..."
                class="search-input"
                @input="filterProviders"
            />
          </div>
          <div class="filter-container">
            <select v-model="statusFilter" class="filter-select" @change="filterProviders">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="filteredProviders.length === 0 && !searchQuery && statusFilter === 'all'" class="empty-state">
        <p>There are no providers records yet</p>
        <button @click="addProvider" class="add-provider-btn">
          <i class="fas fa-plus-circle"></i> Add Your First Provider
        </button>
      </div>
      <div v-else-if="filteredProviders.length === 0" class="empty-state">
        <p>No providers match your search criteria</p>
        <button @click="resetFilters" class="reset-filter-btn">
          <i class="fas fa-undo"></i> Reset Filters
        </button>
      </div>
      <div v-else class="table-container">
        <table class="provider-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="provider in filteredProviders" :key="provider.id" class="provider-row">
            <td>{{ provider.id || 'N/A' }}</td>
            <td>{{ provider.name || 'N/A' }}</td>
            <td>{{ provider.address || 'N/A' }}</td>
            <td>{{ provider.email || 'N/A' }}</td>
            <td>{{ formatPhone(provider.phone) || 'N/A' }}</td>
            <td>
              <span class="status-badge" :class="provider.state === 'active' ? 'active' : 'inactive'">
                {{ provider.state || 'N/A' }}
              </span>
            </td>

          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="showDeleteModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete provider <strong>{{ providerToDelete?.name }}</strong>?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="cancel-btn">
            Cancel
          </button>
          <button @click="deleteProvider" class="confirm-delete-btn" :disabled="isDeleting">
            <span v-if="isDeleting">
              <i class="fas fa-spinner fa-spin"></i> Deleting...
            </span>
            <span v-else>
              <i class="fas fa-trash"></i> Delete
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <div class="toast-content">
        <i class="fas" :class="toast.icon"></i>
        <span>{{ toast.message }}</span>
      </div>
      <button @click="closeToast" class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import ProviderService from '../../providers/services/ProviderService.js';

export default {
  name: 'ProviderManagement',
  setup() {
    const router = useRouter();
    const providerService = new ProviderService();
    const providers = ref([]);
    const filteredProviders = ref([]);
    const isLoading = ref(true);
    const hotelId = ref(null);
    const role = ref(null);
    const searchQuery = ref('');
    const statusFilter = ref('all');
    const showDeleteModal = ref(false);
    const providerToDelete = ref(null);
    const isDeleting = ref(false);

    // Toast notification state
    const toast = reactive({
      show: false,
      message: '',
      type: 'success',
      icon: 'fa-check-circle',
      timeout: null
    });

    // Filter providers based on search query and status
    const filterProviders = () => {
      if (!providers.value.length) return;

      let filtered = [...providers.value];

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(provider => {
          return provider.name?.toLowerCase().includes(query) ||
              provider.address?.toLowerCase().includes(query) ||
              provider.email?.toLowerCase().includes(query) ||
              provider.phone?.toString().includes(query) ||
              provider.id?.toString().includes(query);
        });
      }

      // Filter by status
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(provider => provider.state === statusFilter.value);
      }

      filteredProviders.value = filtered;
    };

    const resetFilters = () => {
      searchQuery.value = '';
      statusFilter.value = 'all';
      filterProviders();
    };

    const formatPhone = (phone) => {
      if (!phone) return '';
      const phoneStr = phone.toString();
      if (phoneStr.length === 10) {
        return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
      }
      return phoneStr;
    };

    const getRole = async () => {
      try {
        return await providerService.getRoleFromToken();
      } catch (error) {
        console.error('Error getting role:', error);
        return null;
      }
    };

    const getHotelId = async () => {
      try {
        return await providerService.getHotelIdFromToken();
      } catch (error) {
        console.error('Error getting hotel ID:', error);
        return null;
      }
    };

    const loadHotelId = async () => {
      const tokenHotelId = await getHotelId();
      console.log('Hotel ID:', tokenHotelId);

      if (tokenHotelId) {
        hotelId.value = tokenHotelId;
        fetchProviders();
      } else {
        isLoading.value = false;
        showToast('Hotel ID not found. Please log in again.', 'error', 'fa-exclamation-circle');
      }
    };

    const fetchProviders = async () => {
      if (!hotelId.value) return;

      try {
        isLoading.value = true;
        console.log('Fetching providers for hotelId:', hotelId.value);
        const fetchedProviders = await providerService.getProvidersByHotelId(hotelId.value);
        console.log('Fetched providers:', fetchedProviders);
        providers.value = fetchedProviders;
        filterProviders(); // Initialize filtered providers
        isLoading.value = false;
      } catch (error) {
        isLoading.value = false;
        console.error('Error fetching providers:', error);
        showToast(`Failed to load providers: ${error.message}`, 'error', 'fa-exclamation-circle');
      }
    };

    const addProvider = () => {
      router.push('/provider/add');
    };

    const editProvider = (provider) => {
      router.push(`/provider/edit/${provider.id}`);
    };

    const confirmDelete = (provider) => {
      providerToDelete.value = provider;
      showDeleteModal.value = true;
    };

    const deleteProvider = async () => {
      if (!providerToDelete.value) return;

      try {
        isDeleting.value = true;
        // Simulate API call for now - you'd implement this method in your service
        // await providerService.deleteProvider(providerToDelete.value.id);

        // For demonstration, let's just wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Remove from local array
        providers.value = providers.value.filter(p => p.id !== providerToDelete.value.id);

        // Close modal
        showDeleteModal.value = false;
        providerToDelete.value = null;

        // Show success message
        showToast('Provider deleted successfully', 'success', 'fa-check-circle');

        // Filter the list again
        filterProviders();
      } catch (error) {
        console.error('Error deleting provider:', error);
        showToast(`Failed to delete provider: ${error.message}`, 'error', 'fa-exclamation-circle');
      } finally {
        isDeleting.value = false;
      }
    };

    const showToast = (message, type = 'success', icon = 'fa-check-circle') => {
      // Clear any existing timeout
      if (toast.timeout) {
        clearTimeout(toast.timeout);
      }

      // Set toast properties
      toast.show = true;
      toast.message = message;
      toast.type = type;
      toast.icon = icon;

      // Auto-hide after 3 seconds
      toast.timeout = setTimeout(() => {
        closeToast();
      }, 3000);
    };

    const closeToast = () => {
      toast.show = false;
      if (toast.timeout) {
        clearTimeout(toast.timeout);
        toast.timeout = null;
      }
    };

    // Event handler for provider-added
    const handleProviderAdded = () => {
      fetchProviders();
      showToast('Provider added successfully', 'success', 'fa-check-circle');
    };

    // Event handler for provider-updated
    const handleProviderUpdated = () => {
      fetchProviders();
      showToast('Provider updated successfully', 'success', 'fa-check-circle');
    };

    onMounted(async () => {
      // Add event listeners
      document.addEventListener('provider-added', handleProviderAdded);
      document.addEventListener('provider-updated', handleProviderUpdated);

      role.value = await getRole();
      await loadHotelId();
    });

    onUnmounted(() => {
      // Clean up event listeners
      document.removeEventListener('provider-added', handleProviderAdded);
      document.removeEventListener('provider-updated', handleProviderUpdated);

      // Clear any active timeout
      if (toast.timeout) {
        clearTimeout(toast.timeout);
      }
    });

    return {
      providers,
      filteredProviders,
      isLoading,
      role,
      searchQuery,
      statusFilter,
      showDeleteModal,
      providerToDelete,
      isDeleting,
      toast,
      addProvider,
      editProvider,
      confirmDelete,
      deleteProvider,
      filterProviders,
      resetFilters,
      formatPhone,
      closeToast
    };
  }
};
</script>

<style scoped>
.provider-management {
  width: 100%;
  height: 100%;
  padding: 20px;
  position: relative;
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
  gap: 8px;
}

.add-button-text:hover {
  background-color: #3A3E5C;
}

.search-filter {
  display: flex;
  margin-top: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 12px;
  color: #666;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.filter-container {
  min-width: 150px;
}

.filter-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
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
  margin-top: 40px;
}

.add-provider-btn, .reset-filter-btn {
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

.add-provider-btn:hover, .reset-filter-btn:hover {
  background-color: #3A3E5C;
}

.table-container {
  padding: 16px;
  overflow-x: auto;
  flex-grow: 1;
}

.provider-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.provider-table th {
  background-color: #474C74;
  color: white;
  font-weight: bold;
  text-align: left;
  padding: 12px 16px;
}

.provider-table td {
  background-color: white;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.provider-row:hover td {
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

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.edit-btn {
  color: #007bff;
}

.edit-btn:hover {
  background-color: #e6f2ff;
}

.delete-btn {
  color: #dc3545;
}

.delete-btn:hover {
  background-color: #fff0f0;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #474C74;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.warning-text {
  color: #dc3545;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  gap: 12px;
}

.cancel-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #e9ecef;
}

.confirm-delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.confirm-delete-btn:hover {
  background-color: #c82333;
}

.confirm-delete-btn:disabled {
  background-color: #e9989f;
  cursor: not-allowed;
}

/* Toast notification */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  z-index: 1100;
  min-width: 300px;
  max-width: 400px;
}

.toast.success {
  border-left: 4px solid #28a745;
}

.toast.error {
  border-left: 4px solid #dc3545;
}

.toast.info {
  border-left: 4px solid #17a2b8;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-content i {
  font-size: 18px;
}

.toast.success i {
  color: #28a745;
}

.toast.error i {
  color: #dc3545;
}

.toast.info i {
  color: #17a2b8;
}

.toast-close {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
}

/* Mobile responsive adjustments */
@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .actions {
    width: 100%;
    justify-content: flex-start;
  }

  .add-button-text {
    width: 100%;
    justify-content: center;
  }

  .search-filter {
    flex-direction: column;
  }

  .filter-container {
    width: 100%;
  }

  .provider-table th:nth-child(3),
  .provider-table td:nth-child(3),
  .provider-table th:nth-child(4),
  .provider-table td:nth-child(4) {
    display: none;
  }
}
</style>