<script>
import { HotelService } from '../service/HotelService.js';
import { AuthManager } from '../service/AuthManager.js';
import { Hotel } from '../models/Hotel.js';

export default {
  name: 'CreateHotel',
  data() {
    return {
      hotel: {
        name: '',
        description: '',
        address: '',
        phone: '',
        email: ''
      },
      loading: false,
      error: null,
      success: null,
      hasOwnerRole: false,
      needsLogin: false,
      showSuccessAlert: false // Nueva propiedad para controlar la alerta
    };
  },
  created() {
    this.checkAuthentication();
  },
  methods: {
    checkAuthentication() {
      if (!AuthManager.isLoggedIn()) {
        console.log('Usuario no autenticado');
        this.needsLogin = true;
        this.error = 'Necesita iniciar sesión para acceder a esta página';
        return;
      }

      this.hasOwnerRole = AuthManager.hasRole('ROLE_OWNER');
      console.log('Usuario autenticado con rol de propietario:', this.hasOwnerRole);

      if (!this.hasOwnerRole) {
        this.error = 'El usuario no tiene permisos de propietario';
      }
    },

    validateForm() {
      if (!this.hotel.name) {
        this.error = 'El nombre del hotel es obligatorio';
        return false;
      }
      if (!this.hotel.address) {
        this.error = 'La dirección del hotel es obligatoria';
        return false;
      }
      if (!this.hotel.email) {
        this.error = 'El email del hotel es obligatorio';
        return false;
      }
      if (!this.hotel.phone) {
        this.error = 'El teléfono del hotel es obligatorio';
        return false;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.hotel.email)) {
        this.error = 'El formato del email no es válido';
        return false;
      }

      // Validar que el teléfono solo contenga números
      const phoneRegex = /^\d+$/;
      if (!phoneRegex.test(this.hotel.phone)) {
        this.error = 'El teléfono debe contener solo números';
        return false;
      }

      return true;
    },

    async createHotel() {
      this.error = null;
      this.success = null;
      this.showSuccessAlert = false;

      if (!this.validateForm()) {
        return;
      }

      this.loading = true;

      try {
        // Obtener el token y verificar autenticación
        const token = this.getCleanToken();
        if (!token) {
          this.needsLogin = true;
          throw new Error('No se encontró token de autenticación o el token no es válido');
        }

        // Obtener el ID del propietario desde el token
        const ownerId = this.getOwnerIdFromToken(token);
        if (!ownerId) {
          throw new Error('No se pudo obtener el ID del propietario');
        }

        // Crear objeto para enviar al API
        const hotelData = {
          ownersId: parseInt(ownerId),
          name: this.hotel.name,
          description: this.hotel.description,
          address: this.hotel.address,
          phone: parseInt(this.hotel.phone),
          email: this.hotel.email
        };

        console.log('Enviando datos de hotel:', hotelData);

        // Realizar la petición POST al API
        const response = await fetch('https://localhost:44390/api/hotel/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(hotelData),
          mode: 'cors'
        });

        console.log('Estado de la respuesta:', response.status);

        if (response.status === 401) {
          localStorage.removeItem('token');
          this.needsLogin = true;
          throw new Error('Su sesión ha expirado o no es válida. Por favor inicie sesión nuevamente.');
        }

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error en respuesta:', errorData);
          throw new Error(`Error al crear el hotel: ${errorData}`);
        }

        // Si todo va bien, mostrar mensaje de éxito y activar alerta
        this.success = '¡Hotel creado exitosamente!';
        this.showSuccessAlert = true;

        // Mostrar alerta del navegador
        alert('¡Hotel creado exitosamente!');

        // Limpiar el formulario
        this.hotel = {
          name: '',
          description: '',
          address: '',
          phone: '',
          email: ''
        };

        // Redireccionar a la vista de detalle después de 2 segundos
        setTimeout(() => {
          this.$router.push('/MyHotel');
        }, 2000);

      } catch (e) {
        console.error('Error al crear hotel:', e);
        this.handleError(e);
      } finally {
        this.loading = false;
      }
    },

    // Método auxiliar para extraer el ownerId del token JWT
    getOwnerIdFromToken(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"];
      } catch (e) {
        console.error('Error decodificando token:', e);
        return null;
      }
    },

    // Método mejorado para obtener un token limpio y válido
    getCleanToken() {
      const token = localStorage.getItem('token');

      if (!token) {
        return null;
      }

      // Verificar si el token tiene formato correcto
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('El token no tiene el formato JWT válido (debe tener 3 partes separadas por puntos)');
        localStorage.removeItem('token'); // Limpiar token inválido
        return null;
      }

      // Verificar si el token no ha expirado
      try {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const exp = payload.exp;

        if (exp && exp < Math.floor(Date.now() / 1000)) {
          console.error('El token ha expirado');
          localStorage.removeItem('token'); // Limpiar token expirado
          return null;
        }

        return token;
      } catch (e) {
        console.error('Error al validar token:', e);
        localStorage.removeItem('token'); // Limpiar token inválido
        return null;
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
        this.error = `Error al crear el hotel: ${error.message}`;
      }
    },

    goToLogin() {
      // Limpiar token antiguo
      localStorage.removeItem('token');
      // Guardar la ruta actual para redireccionar después del login
      localStorage.setItem('redirectAfterLogin', this.$route.fullPath);
      // Redireccionar a login
      this.$router.push('/login');
    },

    goToHome() {
      this.$router.push('/profile');
    },

    gotoHotelDetail() {
      this.$router.push('/MyHotel');
    },

    closeSuccessAlert() {
      this.showSuccessAlert = false;
    }
  }
};
</script>

<template>
  <div class="create-hotel-container">
    <!-- Mostrar spinner durante la carga -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Mostrar mensaje de error si existe -->
    <div v-else-if="error" class="alert alert-danger">
      <h4>Error</h4>
      <p>{{ error }}</p>
      <div class="mt-3">
        <button @click="checkAuthentication" class="btn btn-primary me-2">Reintentar</button>
        <button v-if="needsLogin" @click="goToLogin" class="btn btn-outline-primary">Iniciar sesión</button>
      </div>
    </div>

    <!-- Si no tiene rol de propietario -->
    <div v-else-if="!hasOwnerRole" class="text-center p-4">
      <div class="alert alert-warning">
        <h4>Acceso denegado</h4>
        <p>No tienes permisos para crear hoteles. Esta vista es solo para propietarios de hoteles.</p>
      </div>
      <button @click="goToHome" class="btn btn-primary mt-3">Volver al inicio</button>
    </div>

    <!-- Alerta modal de éxito -->
    <div v-if="showSuccessAlert" class="success-alert-overlay">
      <div class="success-alert">
        <div class="success-icon">✓</div>
        <h3>¡Hotel creado exitosamente!</h3>
        <p>Tu hotel ha sido registrado correctamente en el sistema.</p>
        <button @click="closeSuccessAlert" class="btn btn-success">Aceptar</button>
      </div>
    </div>

    <!-- Formulario de creación -->
    <div v-else class="hotel-form">
      <!-- Mensaje de éxito (dentro del formulario) -->
      <div v-if="success" class="alert alert-success">
        {{ success }}
      </div>

      <h1 class="hotel-form-title">Crear Nuevo Hotel</h1>

      <form @submit.prevent="createHotel">
        <div class="form-group">
          <label for="hotelName">Nombre del Hotel*</label>
          <input
              type="text"
              id="hotelName"
              v-model="hotel.name"
              class="form-control"
              placeholder="Nombre del hotel"
              required
          >
        </div>

        <div class="form-group">
          <label for="hotelAddress">Dirección*</label>
          <input
              type="text"
              id="hotelAddress"
              v-model="hotel.address"
              class="form-control"
              placeholder="Dirección completa"
              required
          >
        </div>

        <div class="form-group">
          <label for="hotelEmail">Email*</label>
          <input
              type="email"
              id="hotelEmail"
              v-model="hotel.email"
              class="form-control"
              placeholder="correo@ejemplo.com"
              required
          >
        </div>

        <div class="form-group">
          <label for="hotelPhone">Teléfono*</label>
          <input
              type="tel"
              id="hotelPhone"
              v-model="hotel.phone"
              class="form-control"
              placeholder="Solo números"
              required
          >
        </div>

        <div class="form-group">
          <label for="hotelDescription">Descripción</label>
          <textarea
              id="hotelDescription"
              v-model="hotel.description"
              class="form-control"
              rows="4"
              placeholder="Describe tu hotel..."
          ></textarea>
        </div>

        <div class="form-buttons">
          <button
              type="submit"
              class="btn btn-primary save-button"
              :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Crear Hotel
          </button>
          <button
              type="button"
              class="btn btn-outline-secondary cancel-button"
              @click="goToHome"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.create-hotel-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.hotel-form {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-top: 20px;
}

.hotel-form-title {
  color: #1C4257;
  margin-bottom: 25px;
  text-align: center;
  font-weight: bold;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-control:focus {
  border-color: #1C4257;
  box-shadow: 0 0 0 0.2rem rgba(28, 66, 87, 0.25);
}

.form-buttons {
  margin-top: 30px;
  display: flex;
  gap: 15px;
}

.save-button {
  padding: 12px 24px;
  background-color: #1C4257;
  color: white;
  border: none;
  flex: 1;
  font-size: 16px;
}

.save-button:hover {
  background-color: #153241;
}

.cancel-button {
  padding: 12px 24px;
  flex: 1;
  font-size: 16px;
}

.alert {
  margin-bottom: 20px;
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

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.text-center {
  text-align: center;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Estilos para campos requeridos */
label:after {
  content: "*";
  color: red;
  margin-left: 4px;
}

label[for="hotelDescription"]:after {
  content: "";
}

/* Estilos para la alerta de éxito */
.success-alert-overlay {
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

.success-alert {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  padding: 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

.success-icon {
  background-color: #28a745;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  margin: 0 auto 20px;
}

.success-alert h3 {
  color: #28a745;
  margin-bottom: 15px;
}

.success-alert p {
  color: #555;
  margin-bottom: 20px;
}

.success-alert button {
  padding: 10px 30px;
  font-size: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>