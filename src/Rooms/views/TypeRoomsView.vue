<template>
  <div class="type-rooms-container">
    <h1>Gestión de Tipos de Habitaciones</h1>

    <div class="row">
      <div class="col-md-6">
        <TypeRoomForm @type-room-created="refreshList" />
      </div>

      <div class="col-md-6">
        <TypeRoomList ref="typeRoomList" />
      </div>
    </div>
  </div>
</template>

<script>
import TypeRoomForm from '../components/TypeRoomForm.vue';
import TypeRoomList from '../components/TypeRoomList.vue';

export default {
  name: 'TypeRoomsView',

  components: {
    TypeRoomForm: TypeRoomForm,
    TypeRoomList
  },

  methods: {
    refreshList() {

      this.$refs.typeRoomList.refreshList();
    }
  }
};
</script>

<style scoped>
.type-rooms-container {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: -15px;
}

.col-md-6 {
  width: 100%;
  padding: 15px;
}

@media (min-width: 768px) {
  .col-md-6 {
    width: 50%;
  }
}
</style>