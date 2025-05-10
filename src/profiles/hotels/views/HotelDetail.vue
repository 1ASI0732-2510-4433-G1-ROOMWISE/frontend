<template>
  <div>
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <h4>Error al cargar la información</h4>
      <p>{{ error }}</p>
      <div class="mt-3">
        <button @click="retryLoading" class="btn btn-primary me-2">Reintentar</button>
        <button v-if="needsLogin" @click="goToLogin" class="btn btn-outline-primary">Iniciar sesión</button>
      </div>
    </div>

    <div v-else-if="!hasOwnerRole" class="text-center p-4">
      <div class="alert alert-warning">
        <h4>Acceso denegado</h4>
        <p>No tienes permisos para ver esta página. Esta vista es solo para propietarios de hoteles.</p>
      </div>
      <button @click="goToHome" class="btn btn-primary mt-3">Volver al inicio</button>
    </div>

    <div v-else-if="hotel" class="hotel-detail-container">
      <div class="hotel-header">
        <img
            src="https://i.pinimg.com/564x/29/1b/10/291b104087960aa6b0c63e1aca8a7977.jpg"
            alt="Hotel image"
            class="hotel-image"
        >
        <div class="hotel-image-overlay"></div>
        <h1 class="hotel-name">{{ hotel.name }}</h1>
        <div class="hotel-location">
          <i class="bi bi-geo-alt"></i>
          <span>{{ hotel.address }}</span>
        </div>
      </div>

      <div class="hotel-content">
        <h2>HOTEL INFO</h2>

        <div class="hotel-info-row">
          <span class="info-label">Name</span>
          <span class="info-value">{{ hotel.name }}</span>
        </div>

        <div class="hotel-info-row">
          <span class="info-label">Address</span>
          <span class="info-value">{{ hotel.address }}</span>
        </div>

        <div class="hotel-info-row">
          <span class="info-label">Phone</span>
          <span class="info-value">{{ hotel.phone }}</span>
        </div>

        <div class="hotel-info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{{ hotel.email }}</span>
        </div>

        <div class="hotel-info-row">
          <span class="info-label">Description</span>
          <span class="info-value">{{ hotel.description }}</span>
        </div>


      </div>
    </div>

    <div v-else class="text-center p-4">
      <div class="alert alert-info">
        <h4>Sin información disponible</h4>
        <p>No se encontró información del hotel para este propietario.</p>
      </div>
      <button @click="goToHome" class="btn btn-primary mt-3">Volver al inicio</button>
    </div>
  </div>
</template>

<script>
import { HotelService } from '../service/HotelService.js';
import { AuthManager } from '../service/AuthManager.js';

export default {
  name: 'HotelDetail',
  data() {
    return {
      loading: true,
      hasOwnerRole: false,
      hotel: null,
      error: null,
      needsLogin: false,
      hotelService: new HotelService()
    };
  },
  async created() {
    try {
      await this.checkAuthentication();
      if (this.hasOwnerRole) {
        await this.loadOwnerHotel();
      }
    } catch (error) {
      console.error('Error in initial load:', error);
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async retryLoading() {
      this.loading = true;
      this.error = null;
      this.needsLogin = false;

      try {
        await this.checkAuthentication();
        if (this.hasOwnerRole) {
          await this.loadOwnerHotel();
        }
      } catch (error) {
        console.error('Error al reintentar carga:', error);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },

    async checkAuthentication() {
      if (!AuthManager.isLoggedIn()) {
        console.log('Usuario no autenticado');
        this.needsLogin = true;
        throw new Error('Necesita iniciar sesión para acceder a esta página');
      }

      this.hasOwnerRole = AuthManager.hasRole('ROLE_OWNER');
      console.log('Usuario autenticado con rol de propietario:', this.hasOwnerRole);

      if (!this.hasOwnerRole) {
        throw new Error('El usuario no tiene permisos de propietario');
      }
    },

    async loadOwnerHotel() {
      try {
        console.log('Iniciando carga del hotel del propietario');
        this.hotel = await this.hotelService.fetchHotelByOwner();
        console.log('Hotel del propietario cargado:', this.hotel);

        if (!this.hotel) {
          this.error = 'No se encontró información del hotel para este propietario';
        }
      } catch (error) {
        console.error('Error al cargar hotel del propietario:', error);
        throw error;
      }
    },

    handleError(error) {
      // Determinar si se necesita iniciar sesión
      if (error.message.includes('token') ||
          error.message.includes('autenticación') ||
          error.message.includes('sesión') ||
          error.message.includes('iniciar sesión')) {
        this.needsLogin = true;
        this.error = 'Su sesión ha expirado o no es válida. Por favor inicie sesión nuevamente.';
      }
      // Error CORS
      else if (error.message.includes('CORS')) {
        this.error = `Error de configuración del servidor: No se permite la conexión desde esta aplicación.
                     Por favor contacte al administrador del sistema.`;
      }
      // Error general
      else {
        this.error = `Error al cargar la información: ${error.message}`;
      }
    },

    navigateToRoomTypes() {
      this.$router.push('/room-types-setup');
    },

    goToLogin() {
      // Limpiar token antiguo
      AuthManager.logout();
      // Guardar la ruta actual para redireccionar después del login
      localStorage.setItem('redirectAfterLogin', this.$route.fullPath);
      // Redireccionar a login
      this.$router.push('/login');
    },

    goToHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.hotel-detail-container {
  max-width: 100%;
  overflow-x: hidden;
}

.hotel-header {
  position: relative;
  height: 300px;
}

.hotel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hotel-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
}

.hotel-name {
  position: absolute;
  top: 16px;
  left: 16px;
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.hotel-location {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  color: white;
}

.hotel-content {
  padding: 16px;
}

.hotel-info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-label {
  flex: 1;
  font-weight: bold;
  color: #6c757d;
}

.info-value {
  flex: 1;
}

.alert {
  margin: 20px;
  padding: 15px;
  border-radius: 5px;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffecb5;
  color: #856404;
}

.alert-info {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.hotel-description {
  color: #6c757d;
  margin-bottom: 16px;
}

.text-center {
  text-align: center;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>