<template>
  <div class="type-room-list">
    <div class="alert alert-danger" v-if="errorMessage">
      {{ errorMessage }}
    </div>

    <div class="loading" v-if="isLoading">
      <p>Cargando tipos de habitaciones...</p>
    </div>

    <div class="table-responsive" v-if="typeRooms.length > 0 && !isLoading">
      <table class="table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="typeRoom in typeRooms" :key="typeRoom.id">
          <td>{{ typeRoom.id }}</td>
          <td>{{ typeRoom.description }}</td>
          <td>{{ formatPrice(typeRoom.price) }}</td>
          <td>
            <button
                class="btn btn-info btn-sm"
                @click="viewDetails(typeRoom.id)"
            >
              Ver detalles
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import TypeRoomService from '../services/TypeRoomService.js';

export default {
  name: 'TypeRoomList',

  data() {
    return {
      typeRooms: [],
      isLoading: false,
      errorMessage: ''
    };
  },

  created() {
    this.loadTypeRooms();
  },

  methods: {
    async loadTypeRooms() {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        this.typeRooms = await TypeRoomService.getAllTypeRooms();
      } catch (error) {
        console.error('Error cargando los tipos de habitaciones:', error);

        if (error.response) {
          // El servidor respondió con un código de estado diferente de 2xx
          this.errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`;
        } else if (error.request) {
          // La solicitud se hizo pero no se recibió respuesta
          this.errorMessage = 'No se pudo conectar al servidor. Verifique la conexión y que el servidor esté en funcionamiento.';
        } else {
          // Algo ocurrió al configurar la solicitud
          this.errorMessage = error.message || 'Error al procesar la solicitud';
        }
      } finally {
        this.isLoading = false;
      }
    },

    formatPrice(price) {
      return `$${parseFloat(price).toFixed(2)}`;
    },

    viewDetails(id) {
      // Aquí podrías implementar la navegación a una vista de detalles
      // Por ejemplo: this.$router.push(`/type-rooms/${id}`);
      console.log(`Ver detalles del tipo de habitación con ID: ${id}`);
    },

    // Este método puede ser llamado desde un componente padre para actualizar la lista
    refreshList() {
      this.loadTypeRooms();
    }
  }
};
</script>

<style scoped>
.type-room-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.table th, .table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.table th {
  background-color: #f2f2f2;
}

.table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.loading, .no-records {
  text-align: center;
  padding: 20px;
  color: #666;
}

.btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>