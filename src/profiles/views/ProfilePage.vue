<template>
  <div class="profile-page">
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Cargando...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="init">Reintentar</button>
    </div>

    <div v-else class="profile">
      <div class="header">
        <div class="avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="info">
          <h2>{{ user.name }} {{ user.surname }}</h2>
          <p>{{ user.email }}</p>
          <button v-if="isAuth" @click="$router.push('/MyHotel')" class="btn-hotel">
            Mi hotel
          </button>
        </div>
      </div>

      <div class="fields">
        <div v-for="field in fields" :key="field.key" class="field">
          <label>{{ field.label }}</label>
          <span :class="field.key === 'state' ? getStateClass(user[field.key]) : ''">
            {{ formatValue(field.key, user[field.key]) }}
          </span>
        </div>
      </div>

      <div v-if="isAuth" class="actions">
        <button @click="$router.push('/CreateHotel')" class="btn-create">
          Crear hotel
        </button>
        <button @click="showPaymentModal = true" class="btn-payment">
          Payment Owner
        </button>
        <button @click="logout" class="btn-logout">
          Cerrar sesión
        </button>
      </div>

      <div v-else class="auth-msg">
        <i class="fas fa-info-circle"></i>
        <p>Para ver tu información completa, inicia sesión.</p>
        <button @click="$router.push('/login')" class="btn-login">
          Iniciar sesión
        </button>
      </div>
    </div>

    <!-- Modal para crear Payment Owner -->
    <div v-if="showPaymentModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Crear Payment Owner</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea
                id="description"
                v-model="paymentForm.description"
                placeholder="Ingresa una descripción para el payment"
                rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="finalAmount">Monto Final</label>
            <select id="finalAmount" v-model="paymentForm.finalAmount">
              <option value="">Selecciona un monto</option>
              <option value="100">100</option>
              <option value="150">150</option>
              <option value="200">200</option>
              <option value="250">250</option>
              <option value="300">300</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">
            Cancelar
          </button>
          <button @click="createPaymentOwner" class="btn-submit" :disabled="!canSubmit || creatingPayment">
            <i v-if="creatingPayment" class="fas fa-spinner fa-spin"></i>
            {{ creatingPayment ? 'Creando...' : 'Crear Payment' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from "../../iam/service/auth_service.js";

export default {
  name: 'BasicProfile',
  data() {
    return {
      user: {},
      isAuth: false,
      loading: true,
      error: null,
      showPaymentModal: false,
      creatingPayment: false,
      paymentForm: {
        description: '',
        finalAmount: ''
      },
      fields: [
        { key: 'name', label: 'Nombre' },
        { key: 'surname', label: 'Apellido' },
        { key: 'username', label: 'Usuario' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'state', label: 'Estado' },
        { key: 'id', label: 'ID Usuario' }
      ]
    };
  },
  computed: {
    canSubmit() {
      return this.paymentForm.description.trim() && this.paymentForm.finalAmount;
    }
  },
  async mounted() {
    await this.init();
  },
  methods: {
    async init() {
      this.loading = true;
      this.error = null;

      try {
        this.isAuth = AuthService.isAuthenticated();
        if (this.isAuth) {
          await this.fetchUser();
        }
      } catch (err) {
        this.error = err.message || 'Error al cargar el perfil';
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token');

      const userId = this.getUserId(token);
      const url = `https://localhost:7138/api/v1/user/get-owner-id?id=${userId}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      this.user = await res.json();
    },

    getUserId(token) {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload + '='.repeat((4 - payload.length % 4) % 4)));
      return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"];
    },

    formatValue(key, value) {
      if (key === 'phone') return value ? `+51 ${value}` : '';
      if (key === 'state') return value === 'ACTIVE' ? 'Activo' : 'Inactivo';
      return value || '';
    },

    getStateClass(state) {
      return state === 'ACTIVE' ? 'active' : 'inactive';
    },

    closeModal() {
      this.showPaymentModal = false;
      this.paymentForm = {
        description: '',
        finalAmount: ''
      };
    },

    async createPaymentOwner() {
      if (!this.canSubmit) return;

      this.creatingPayment = true;

      try {
        const token = localStorage.getItem('token');
        const ownerId = this.getUserId(token);

        const paymentData = {
          ownerId: ownerId,
          description: this.paymentForm.description.trim(),
          finalAmount: parseInt(this.paymentForm.finalAmount)
        };

        const response = await fetch('https://localhost:7138/create-payment-owner', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        this.$toast?.add({
          severity: 'success',
          summary: 'Payment Owner creado',
          detail: 'El payment owner se ha creado exitosamente',
          life: 3000
        });

        this.closeModal();

      } catch (error) {
        console.error('Error creating payment owner:', error);
        this.$toast?.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Error al crear el payment owner',
          life: 3000
        });
      } finally {
        this.creatingPayment = false;
      }
    },

    async logout() {
      try {
        await AuthService.logout();
        this.isAuth = false;
        this.user = {};
        this.$router.push('/');
        this.$toast?.add({
          severity: 'success',
          summary: 'Sesión cerrada',
          life: 3000
        });
      } catch (err) {
        this.$toast?.add({
          severity: 'error',
          summary: 'Error al cerrar sesión',
          life: 3000
        });
      }
    }
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem 0;
}

.profile, .loading, .error {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.loading, .error {
  padding: 3rem;
  text-align: center;
}

.loading i, .error i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error {
  color: #e74c3c;
}

.header {
  display: flex;
  align-items: center;
  padding: 2rem;
  background: #1e8449;
  color: white;
  border-radius: 8px 8px 0 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
}

.avatar i {
  font-size: 3.5rem;
  color: #2c3e50;
}

.info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.info p {
  margin: 0;
  opacity: 0.8;
}

.btn-hotel {
  background: #2980b9;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.fields {
  padding: 1.5rem 2rem;
}

.field {
  margin-bottom: 1.2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.field label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.field span {
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
}

.active {
  color: #27ae60;
  font-weight: 600;
}

.inactive {
  color: #e74c3c;
  font-weight: 600;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  gap: 1rem;
}

.btn-create {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  flex: 1;
}

.btn-payment {
  background: #A020F0;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  flex: 1;
}

.btn-logout {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  flex: 1;
}

.auth-msg {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.auth-msg i {
  font-size: 2rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.auth-msg p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.btn-login {
  background: #1e8449;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
}

.close-btn:hover {
  color: #333;
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
  color: #333;
  font-weight: 500;
}

.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group select {
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-submit {
  background: #f39c12;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-submit:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .profile {
    margin: 0 1rem;
  }

  .header {
    flex-direction: column;
    text-align: center;
  }

  .avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .actions {
    flex-direction: column;
    gap: 1rem;
  }

  .modal {
    width: 95%;
    margin: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>