<template>
  <div class="create-room-container">
    <h2>Create New Room</h2>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="createRoom" class="room-form">
      <div class="form-group">
        <label for="hotelId">Hotel ID:</label>
        <input
            type="number"
            id="hotelId"
            v-model.number="room.hotelId"
            class="form-control"
            required
            min="1"
            placeholder="Enter hotel ID"
        />
      </div>

      <div class="form-group">
        <label for="typeRoomId">Room Type ID:</label>
        <input
            type="number"
            id="typeRoomId"
            v-model.number="room.typeRoomId"
            class="form-control"
            required
            min="1"
            placeholder="Enter room type ID"
        />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Creating...' : 'Create Room' }}
        </button>
        <button type="button" class="btn-secondary" @click="resetForm">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'CreateRoomForm',
  data() {
    return {
      room: {
        hotelId: '',
        typeRoomId: ''
      },
      loading: false,
      errorMessage: ''
    };
  },
  methods: {
    async createRoom() {
      this.loading = true;
      this.errorMessage = '';

      if (!this.room.hotelId || !this.room.typeRoomId) {
        this.errorMessage = 'Please enter both hotel ID and room type ID.';
        this.loading = false;
        return;
      }

      // Simula la creación y emite el objeto de la nueva habitación
      const newRoom = {
        id: Date.now(),
        hotelId: this.room.hotelId,
        typeRoomId: this.room.typeRoomId
      };
      this.$emit('room-created', newRoom);
      this.resetForm();
      this.loading = false;
    },
    resetForm() {
      this.room = {
        hotelId: '',
        typeRoomId: ''
      };
    }
  }
};
</script>

<style scoped>
.create-room-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}

.room-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-weight: bold;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control::-webkit-inner-spin-button,
.form-control::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-control[type=number] {
  -moz-appearance: textfield;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f44336;
  color: white;
}

.btn-secondary:hover {
  background-color: #d32f2f;
}

.error-message {
  padding: 10px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin-bottom: 15px;
}
</style>