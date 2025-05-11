<template>
  <div class="room-list">
    <h2>Lista de Habitaciones</h2>

    <div class="alert alert-danger" v-if="errorMessage">
      {{ errorMessage }}
    </div>

    <div class="filter-section">
      <label for="hotel-select">Filtrar por hotel:</label>
      <select id="hotel-select" v-model="selectedHotelId">
        <option value="">Todos los hoteles</option>
        <option v-for="hotel in hotels" :key="hotel.id" :value="hotel.id">
          {{ hotel.name }}
        </option>
      </select>
    </div>

    <div class="loading" v-if="isLoading">
      <p>Cargando habitaciones...</p>
    </div>

    <div class="no-records" v-else-if="filteredRooms.length === 0">
      <p>No hay habitaciones registradas</p>
    </div>

    <div class="table-responsive" v-else>
      <table class="table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Hotel ID</th>
          <th>Tipo de Habitación ID</th>
          <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="room in filteredRooms" :key="room.id">
          <td>{{ room.id }}</td>
          <td>{{ room.hotelId }}</td>
          <td>{{ room.typeRoomId }}</td>
          <td>
            <button
                class="btn btn-info btn-sm"
                @click="viewDetails(room.id)"
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
export default {
  name: 'RoomList',
  data() {
    return {
      rooms: [
        { id: 1, hotelId: 101, typeRoomId: 1 },
        { id: 2, hotelId: 102, typeRoomId: 2 },
        { id: 3, hotelId: 101, typeRoomId: 3 }
      ],
      hotels: [
        { id: 101, name: 'Hotel Central' },
        { id: 102, name: 'Hotel Plaza' }
      ],
      selectedHotelId: '',
      isLoading: false,
      errorMessage: ''
    };
  },
  computed: {
    filteredRooms() {
      if (!this.selectedHotelId) return this.rooms;
      return this.rooms.filter(r => r.hotelId === Number(this.selectedHotelId));
    }
  },
  methods: {
    viewDetails(id) {
      console.log(`Ver detalles de la habitación con ID: ${id}`);
    },
    refreshList() {
      // No hace nada en modo estático
    },
    addRoom(room) {
      this.rooms.push(room);
    }
  }
};
</script>

<style scoped>
.room-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
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