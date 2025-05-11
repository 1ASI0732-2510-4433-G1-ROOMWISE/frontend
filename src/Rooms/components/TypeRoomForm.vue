<template>
  <div class="type-room-form">
    <h2>Crear Tipo de Habitación</h2>

    <div class="alert alert-success" v-if="successMessage">
      {{ successMessage }}
    </div>

    <div class="alert alert-danger" v-if="errorMessage">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="description">Descripción:</label>
        <input
            type="text"
            id="description"
            v-model="typeRoom.description"
            class="form-control"
            required
            :class="{ 'is-invalid': validationErrors.description }"
        />
        <div class="invalid-feedback" v-if="validationErrors.description">
          {{ validationErrors.description }}
        </div>
      </div>

      <div class="form-group">
        <label for="price">Precio:</label>
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input
              type="number"
              id="price"
              v-model.number="typeRoom.price"
              class="form-control"
              required
              step="0.01"
              min="0"
              :class="{ 'is-invalid': validationErrors.price }"
          />
          <div class="invalid-feedback" v-if="validationErrors.price">
            {{ validationErrors.price }}
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading">
            <i class="spinner-border spinner-border-sm me-1"></i>
            Guardando...
          </span>
          <span v-else>Guardar</span>
        </button>
        <button type="button" class="btn btn-secondary" @click="resetForm">
          Limpiar
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import TypeRoomService from '../services/TypeRoomService.js';
import TypeRoom from '../models/TypeRoom.js';
import AuthService from '../../../src/iam/service/auth_service.js';

export default {
  name: 'TypeRoomForm',

  data() {
    return {
      typeRoom: new TypeRoom(),
      isLoading: false,
      successMessage: '',
      errorMessage: '',
      validationErrors: {
        description: '',
        price: ''
      }
    };
  },

  methods: {
    validateForm() {
      let isValid = true;
      this.validationErrors = {
        description: '',
        price: ''
      };

      // Validar descripción
      if (!this.typeRoom.description.trim()) {
        this.validationErrors.description = 'La descripción es obligatoria';
        isValid = false;
      } else if (this.typeRoom.description.length < 3) {
        this.validationErrors.description = 'La descripción debe tener al menos 3 caracteres';
        isValid = false;
      }

      // Validar precio
      if (this.typeRoom.price === null || this.typeRoom.price === undefined) {
        this.validationErrors.price = 'El precio es obligatorio';
        isValid = false;
      } else if (this.typeRoom.price <= 0) {
        this.validationErrors.price = 'El precio debe ser mayor que 0';
        isValid = false;
      }

      return isValid;
    },

    async submitForm() {
      // Limpiar mensajes previos
      this.errorMessage = '';
      this.successMessage = '';

      // Validación de formulario
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;

      try {
        const result = await TypeRoomService.createTypeRoom(this.typeRoom);

        if (result) {
          this.successMessage = 'Tipo de habitación creado exitosamente';
          this.resetForm();
          this.$emit('type-room-created');
          // Redirigir a /rooms después de crear
          this.$router.push('/rooms');
        } else {
          this.errorMessage = 'Error al crear el tipo de habitación. No se recibió respuesta válida del servidor.';
        }
      } catch (error) {
        console.error('Error creando tipo de habitación:', error);

        if (error.friendlyMessage) {
          this.errorMessage = error.friendlyMessage;
        } else if (error.response) {
          const statusCode = error.response.status;
          const backendMsg = error.response.data?.message || 'Error desconocido';

          if (statusCode === 400) {
            this.errorMessage = `Datos inválidos: ${backendMsg}`;
          } else if (statusCode === 401) {
            this.errorMessage = 'No está autorizado para realizar esta acción. Verifique si ha iniciado sesión correctamente.';
            if (!AuthService.isAuthenticated()) {
              this.$router.push('/login');
            }
          } else if (statusCode === 409) {
            this.errorMessage = `Ya existe un tipo de habitación con esta descripción: ${backendMsg}`;
          } else {
            this.errorMessage = `Error del servidor (${statusCode}): ${backendMsg}`;
          }
        } else if (error.request) {
          this.errorMessage = 'No se pudo conectar al servidor. Verifique que el servidor esté en funcionamiento y que CORS esté configurado correctamente.';
        } else {
          this.errorMessage = error.message || 'Error al procesar la solicitud';
        }
      } finally {
        this.isLoading = false;
      }
    },

    resetForm() {
      this.typeRoom = new TypeRoom();
      this.validationErrors = {
        description: '',
        price: ''
      };
    }
  }
};
</script>

<style scoped>
.type-room-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.input-group {
  display: flex;
  width: 100%;
}

.input-group-text {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #e9ecef;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 4px 0 0 4px;
}

.input-group .form-control {
  border-radius: 0 4px 4px 0;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: text-bottom;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

.me-1 {
  margin-right: 0.25rem;
}

.type-room-form {
  width: 400px;
  margin-left: 39vw; /* Ajusta este valor para moverlo más a la derecha */
  margin-top: 40px;
  padding: 32px 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra los campos del formulario */
}

.form-group, .form-actions {
  width: 100%;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}
</style>