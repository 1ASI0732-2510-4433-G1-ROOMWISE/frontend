<!-- src/profiles/views/BasicProfile.vue -->
<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <div class="avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="user-info">
          <div class="name-with-button">
            <h2>{{ userInfo.name }}</h2>
            <button class="my-hotel-button" @click="goToMyHotel">
              Mi hotel
            </button>
          </div>
          <p>{{ userInfo.email }}</p>
        </div>
      </div>

      <div class="profile-details">
        <div class="profile-field">
          <div class="field-label">Nombre</div>
          <div class="field-value">{{ userInfo.name }}</div>
        </div>

        <div class="profile-field">
          <div class="field-label">Usuario</div>
          <div class="field-value">{{ userInfo.username }}</div>
        </div>

        <div class="profile-field">
          <div class="field-label">Email</div>
          <div class="field-value">{{ userInfo.email }}</div>
        </div>

        <div class="profile-field">
          <div class="field-label">Teléfono</div>
          <div class="field-value">{{ userInfo.phone }}</div>
        </div>

        <div class="profile-field">
          <div class="field-label">Posición</div>
          <div class="field-value">{{ userInfo.position }}</div>
        </div>

        <div class="profile-field">
          <div class="field-label">Ubicación</div>
          <div class="field-value">{{ userInfo.location }}</div>
        </div>



        <div class="password-field">
          <div class="field-content">
            <div class="field-label">Contraseña</div>
            <div class="field-value">••••••••</div>
          </div>
        </div>

        <!-- Botón para crear hotel -->
        <div class="create-hotel-button-wrapper">
          <button class="create-hotel-button" @click="goToCreateHotel">
            Crear hotel
          </button>
        </div>
      </div>

      <div class="logout-button-wrapper">
        <button class="logout-button" @click="logout">
          Cerrar sesión
        </button>
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
      userInfo: {
        name: 'Omar Morales',
        username: 'omar',
        email: 'omarmoralesmm4533@gmail.com',
        phone: '+51 973265883',
        position: 'Administrador de Hotel',
        location: 'Jr los zafiros 2023'
      },
      loading: false
    };
  },
  methods: {
    goToCreateHotel() {
      this.$router.push('/CreateHotel');
    },
    goToMyHotel() {
      this.$router.push('/MyHotel');
    },
    async logout() {
      this.loading = true;
      try {
        await AuthService.logout();
        this.$router.push('/');
        this.$toast.add({
          severity: 'success',
          summary: 'Sesión cerrada',
          detail: 'Has cerrado sesión correctamente',
          life: 3000
        });
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al cerrar sesión',
          life: 3000
        });
        console.error('Logout error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.profile-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.profile-container {
  max-width: 600px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 2rem;
  background-color: #1e8449;
  color: white;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  overflow: hidden;
}

.avatar i {
  font-size: 3.5rem;
  color: #2c3e50;
}

.user-info h2 {
  margin: 0;
  font-size: 1.5rem;
}

.user-info p {
  margin: 0.5rem 0 0;
  opacity: 0.8;
  font-size: 1rem;
}

.name-with-button {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.my-hotel-button {
  background-color: #2980b9;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.my-hotel-button:hover {
  background-color: #1c5980;
}

.profile-details {
  padding: 1.5rem 2rem;
}

.profile-field {
  margin-bottom: 1.2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.field-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.field-value {
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
}

.password-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .profile-container {
    margin: 0 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .password-field {
    flex-direction: column;
    align-items: flex-start;
  }

  .password-button {
    margin-top: 1rem;
    width: 100%;
  }

  .name-with-button {
    flex-direction: column;
    align-items: center;
  }
}

.create-hotel-button-wrapper {
  margin-top: 2rem;
  margin-left: 18rem;
  text-align: center;
}

.create-hotel-button {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.create-hotel-button:hover {
  background-color: #1e8449;
}

.logout-button-wrapper {
  margin-top: -4.1rem;
  margin-left: 3rem;
  margin-bottom: 2rem;
}

.logout-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}
</style>
