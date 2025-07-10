<!-- src/views/Provider/ProviderManagement.vue -->
<template>
  <div class="provider-management">
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else class="content">
      <div class="header-container">
        <div class="header">
          <h1>Gestión de Proveedores</h1>
          <div class="actions">
            <button @click="showAddModal = true" class="add-button">
              Agregar Proveedor
            </button>
            <button @click="showAddSupplyModal = true" class="add-supply-button">
              Agregar Suministro
            </button>
            <button @click="showSupplyRequestModal = true" class="add-request-button">
              Crear Solicitud
            </button>
          </div>
        </div>
      </div>

      <div v-if="!providers.length" class="empty-state">
        <p>No hay proveedores registrados aún</p>
        <button @click="showAddModal = true" class="add-provider-btn">
          <i class="fas fa-plus-circle"></i> Agregar Primer Proveedor
        </button>
      </div>

      <div v-else class="table-container">
        <table class="provider-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Suministros</th>
            <th>Estado</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="provider in providers" :key="provider.id" class="provider-row">
            <td>{{ provider.id || 'N/A' }}</td>
            <td>{{ provider.name || 'N/A' }}</td>
            <td>{{ provider.address || 'N/A' }}</td>
            <td>{{ provider.email || 'N/A' }}</td>
            <td>{{ formatPhone(provider.phone) || 'N/A' }}</td>
            <td>
              <div class="supplies-list">
                <span v-if="provider.supplies && provider.supplies.length > 0"
                      v-for="supply in provider.supplies"
                      :key="supply.id"
                      class="supply-tag">
                  {{ supply.name }}
                  <span class="supply-details">(Stock: {{ supply.stock }}, ${{ supply.price }})</span>
                </span>
                <span v-else class="no-supplies">Sin suministros</span>
              </div>
            </td>
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

    <!-- Add Provider Modal -->
    <div v-if="showAddModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Agregar Proveedor</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addProvider">
            <div class="form-group">
              <label>Nombre *</label>
              <input v-model="newProvider.name" type="text" required class="form-input" placeholder="Nombre del proveedor">
            </div>
            <div class="form-group">
              <label>Dirección</label>
              <input v-model="newProvider.address" type="text" class="form-input" placeholder="Dirección completa">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="newProvider.email" type="email" class="form-input" placeholder="ejemplo@correo.com">
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="newProvider.phone" type="number" class="form-input" placeholder="Ej: 1234567890">
            </div>

            <div class="form-group">
              <label>Estado</label>
              <select v-model="newProvider.state" class="form-select">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn">Cancelar</button>
          <button @click="addProvider" class="confirm-btn" :disabled="!newProvider.name || isAdding">
            <span v-if="isAdding">
              <i class="fas fa-spinner fa-spin"></i> Agregando...
            </span>
            <span v-else>Agregar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Supply Modal -->
    <div v-if="showAddSupplyModal" class="modal-backdrop" @click="closeAddSupplyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Agregar Suministro</h3>
          <button @click="closeAddSupplyModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addSupply">
            <div class="form-group">
              <label>Proveedor *</label>
              <select v-model="newSupply.providerId" required class="form-select">
                <option value="">Seleccionar proveedor</option>
                <option v-for="provider in availableProviders" :key="provider.id" :value="provider.id">
                  {{ provider.name }} - {{ provider.email }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Nombre del Suministro *</label>
              <input v-model="newSupply.name" type="text" required class="form-input" placeholder="Ej: Alimentos, Bebidas, Limpieza">
            </div>
            <div class="form-group">
              <label>Precio</label>
              <input v-model="newSupply.price" type="number" step="0.01" class="form-input" placeholder="0.00">
            </div>
            <div class="form-group">
              <label>Stock</label>
              <input v-model="newSupply.stock" type="number" class="form-input" placeholder="0">
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="newSupply.state" class="form-select">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeAddSupplyModal" class="cancel-btn">Cancelar</button>
          <button @click="addSupply" class="confirm-btn" :disabled="!newSupply.name || !newSupply.providerId || isAddingSupply">
            <span v-if="isAddingSupply">
              <i class="fas fa-spinner fa-spin"></i> Agregando...
            </span>
            <span v-else>Agregar Suministro</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Supply Request Modal -->
    <div v-if="showSupplyRequestModal" class="modal-backdrop" @click="closeSupplyRequestModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>Crear Solicitud de Suministro</h3>
          <button @click="closeSupplyRequestModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createSupplyRequest">
            <div class="form-group">
              <label>Suministro *</label>
              <select v-model="newSupplyRequest.supplyId" required class="form-select">
                <option value="">Seleccionar suministro</option>
                <option v-for="supply in availableSupplies" :key="supply.id" :value="supply.id">
                  {{ supply.name }} - ${{ supply.price }} (Stock: {{ supply.stock }})
                </option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Cantidad *</label>
                <input v-model="newSupplyRequest.count" type="number" required min="1" class="form-input" placeholder="Cantidad solicitada">
              </div>
              <div class="form-group">
                <label>Monto Total</label>
                <input v-model="calculatedAmount" type="number" step="0.01" class="form-input" readonly placeholder="Se calcula automáticamente">
              </div>
            </div>
            <div class="form-group">
              <label>Notas adicionales</label>
              <textarea v-model="newSupplyRequest.notes" class="form-textarea" rows="3" placeholder="Comentarios o especificaciones adicionales"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeSupplyRequestModal" class="cancel-btn">Cancelar</button>
          <button @click="createSupplyRequest" class="confirm-btn" :disabled="!newSupplyRequest.supplyId || !newSupplyRequest.count || isCreatingRequest">
            <span v-if="isCreatingRequest">
              <i class="fas fa-spinner fa-spin"></i> Creando...
            </span>
            <span v-else>Crear Solicitud</span>
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
import { ref, reactive, onMounted, computed } from 'vue';

export default {
  name: 'ProviderManagement',
  setup() {
    const providers = ref([]);
    const availableProviders = ref([]);
    const paymentOwner = ref(null);
    const availableSupplies = ref([]);
    const isLoading = ref(true);
    const showAddModal = ref(false);
    const showAddSupplyModal = ref(false);
    const showSupplyRequestModal = ref(false);
    const isAdding = ref(false);
    const isAddingSupply = ref(false);
    const isCreatingRequest = ref(false);

    const newProvider = reactive({
      name: '',
      address: '',
      email: '',
      phone: '',
      supply: '',
      state: 'active'
    });

    const newSupply = reactive({
      providerId: '',
      name: '',
      price: '',
      stock: '',
      state: 'active'
    });

    const newSupplyRequest = reactive({
      supplyId: '',
      count: '',
      notes: ''
    });

    const toast = reactive({
      show: false,
      message: '',
      type: 'success',
      icon: 'fa-check-circle'
    });

    const calculatedAmount = computed(() => {
      const selectedSupply = availableSupplies.value.find(s => s.id == newSupplyRequest.supplyId);
      if (selectedSupply && newSupplyRequest.count) {
        return (parseFloat(selectedSupply.price) * parseInt(newSupplyRequest.count)).toFixed(2);
      }
      return '0.00';
    });

    const getTokenData = () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');

      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        token,
        hotelId: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality"],
        ownerId: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"]
      };
    };

    const formatPhone = (phone) => {
      if (!phone) return '';
      const phoneStr = phone.toString();
      return phoneStr.length === 10
          ? `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`
          : phoneStr;
    };

    const fetchProviders = async () => {
      try {
        const { token, hotelId } = getTokenData();

        const response = await fetch(`https://localhost:7138/api/provider/get-all/${hotelId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const providersData = await response.json();

          // Fetch supplies for each provider
          for (let provider of providersData) {
            try {
              const suppliesResponse = await fetch(`https://localhost:7138/api/supply/provider/${provider.id}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });
              provider.supplies = suppliesResponse.ok ? await suppliesResponse.json() : [];
            } catch (error) {
              console.error(`Error fetching supplies for provider ${provider.id}:`, error);
              provider.supplies = [];
            }
          }

          providers.value = providersData;
        } else {
          throw new Error('Error al obtener proveedores');
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        showToast('Error al cargar proveedores', 'error', 'fa-exclamation-circle');
      }
    };

    const fetchAvailableProviders = async () => {
      try {
        const { token } = getTokenData();
        const providerPromises = [];

        for (let i = 1; i <= 3; i++) {
          providerPromises.push(
              fetch(`https://localhost:7138/api/provider/${i}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              }).then(response => response.ok ? response.json() : null)
                  .catch(() => null)
          );
        }

        const results = await Promise.all(providerPromises);
        availableProviders.value = results.filter(provider => provider !== null);
      } catch (error) {
        console.error('Error fetching available providers:', error);
      }
    };

    const fetchPaymentOwner = async () => {
      try {
        const { token, ownerId } = getTokenData();

        // URL CORRECTA según el Swagger
        const response = await fetch(`https://localhost:7138/get-payments-owner-id?ownerId=${ownerId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // La respuesta es un array, tomar el primer elemento
          paymentOwner.value = data[0] || null;
        } else if (response.status === 404) {
          console.log('Payment owner not found - this might be expected for new users');
          paymentOwner.value = null;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching payment owner:', error);
        paymentOwner.value = null;
      }
    };

    const fetchAvailableSupplies = async () => {
      try {
        const { token } = getTokenData();

        const response = await fetch('https://localhost:7138/api/supply/get-all-supply', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          availableSupplies.value = await response.json();
        }
      } catch (error) {
        console.error('Error fetching supplies:', error);
      }
    };

    const addProvider = async () => {
      if (!newProvider.name) return;

      try {
        isAdding.value = true;
        const { token } = getTokenData();

        const response = await fetch('https://localhost:7138/api/provider/create-provider', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newProvider.name,
            address: newProvider.address,
            email: newProvider.email,
            phone: parseInt(newProvider.phone) || 0,
            supply: newProvider.supply,
            state: newProvider.state
          })
        });

        if (response.ok) {
          await fetchProviders();
          closeModal();
          showToast('Proveedor agregado exitosamente', 'success', 'fa-check-circle');
        } else {
          throw new Error('Error al crear proveedor');
        }
      } catch (error) {
        console.error('Error adding provider:', error);
        showToast(`Error al agregar proveedor: ${error.message}`, 'error', 'fa-exclamation-circle');
      } finally {
        isAdding.value = false;
      }
    };

    const addSupply = async () => {
      if (!newSupply.name || !newSupply.providerId) return;

      try {
        isAddingSupply.value = true;
        const { token } = getTokenData();

        const response = await fetch('https://localhost:7138/api/supply/create-supply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            providersId: parseInt(newSupply.providerId),
            name: newSupply.name,
            price: parseFloat(newSupply.price) || 0,
            stock: parseInt(newSupply.stock) || 0,
            state: newSupply.state
          })
        });

        if (response.ok) {
          await Promise.all([fetchProviders(), fetchAvailableSupplies()]);
          closeAddSupplyModal();
          showToast('Suministro agregado exitosamente', 'success', 'fa-check-circle');
        } else {
          throw new Error('Error al crear suministro');
        }
      } catch (error) {
        console.error('Error adding supply:', error);
        showToast(`Error al agregar suministro: ${error.message}`, 'error', 'fa-exclamation-circle');
      } finally {
        isAddingSupply.value = false;
      }
    };

    const createSupplyRequest = async () => {
      if (!newSupplyRequest.supplyId || !newSupplyRequest.count || !paymentOwner.value) return;

      try {
        isCreatingRequest.value = true;
        const { token } = getTokenData();

        const response = await fetch('https://localhost:7138/api/supplies-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentsOwnersId: paymentOwner.value.id,
            suppliesId: parseInt(newSupplyRequest.supplyId),
            count: parseInt(newSupplyRequest.count),
            amount: parseFloat(calculatedAmount.value)
          })
        });

        if (response.ok) {
          closeSupplyRequestModal();
          showToast('Solicitud de suministro creada exitosamente', 'success', 'fa-check-circle');
        } else {
          throw new Error('Error al crear solicitud');
        }
      } catch (error) {
        console.error('Error creating supply request:', error);
        showToast(`Error al crear solicitud: ${error.message}`, 'error', 'fa-exclamation-circle');
      } finally {
        isCreatingRequest.value = false;
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      Object.assign(newProvider, { name: '', address: '', email: '', phone: '', supply: '', state: 'active' });
    };

    const closeAddSupplyModal = () => {
      showAddSupplyModal.value = false;
      Object.assign(newSupply, { providerId: '', name: '', price: '', stock: '', state: 'active' });
    };

    const closeSupplyRequestModal = () => {
      showSupplyRequestModal.value = false;
      Object.assign(newSupplyRequest, { supplyId: '', count: '', notes: '' });
    };

    const showToast = (message, type = 'success', icon = 'fa-check-circle') => {
      Object.assign(toast, { show: true, message, type, icon });
      setTimeout(() => toast.show = false, 3000);
    };

    const closeToast = () => toast.show = false;

    onMounted(async () => {
      try {
        isLoading.value = true;
        await Promise.all([
          fetchProviders(),
          fetchAvailableProviders(),
          fetchPaymentOwner(),
          fetchAvailableSupplies()
        ]);
      } finally {
        isLoading.value = false;
      }
    });

    return {
      providers,
      availableProviders,
      availableSupplies,
      isLoading,
      showAddModal,
      showAddSupplyModal,
      showSupplyRequestModal,
      isAdding,
      isAddingSupply,
      isCreatingRequest,
      newProvider,
      newSupply,
      newSupplyRequest,
      calculatedAmount,
      toast,
      formatPhone,
      addProvider,
      addSupply,
      createSupplyRequest,
      closeModal,
      closeAddSupplyModal,
      closeSupplyRequestModal,
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
  gap: 10px;
}

.add-button {
  background-color: #52A8E8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #4A96D3;
}

.add-supply-button {
  background-color: #B565A7;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-supply-button:hover {
  background-color: #A055A0;
}

.add-request-button {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-request-button:hover {
  background-color: #218838;
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

.add-provider-btn {
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

.add-provider-btn:hover {
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

.supplies-list {
  max-width: 200px;
}

.supply-tag {
  display: inline-block;
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin: 2px;
}

.supply-details {
  display: block;
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

.no-supplies {
  color: #999;
  font-style: italic;
  font-size: 12px;
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

.large-modal {
  max-width: 600px;
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

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #474C74;
}

.form-textarea {
  resize: vertical;
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

.confirm-btn {
  background-color: #474C74;
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

.confirm-btn:hover {
  background-color: #3A3E5C;
}

.confirm-btn:disabled {
  background-color: #ccc;
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
}

.toast.success {
  border-left: 4px solid #28a745;
}

.toast.error {
  border-left: 4px solid #dc3545;
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

.toast-close {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
}

/* Mobile responsive */
@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 12px;
  }

  .actions {
    width: 100%;
    justify-content: space-between;
  }

  .provider-table th:nth-child(3),
  .provider-table td:nth-child(3),
  .provider-table th:nth-child(4),
  .provider-table td:nth-child(4) {
    display: none;
  }
}
</style>