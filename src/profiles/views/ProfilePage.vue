<template>
  <div class="profile-page">
    <BaseLayout :role="userRole">
      <div class="profile-container">
        <!-- Contenido del perfil según el rol -->
        <div v-if="loading" class="loading">
          <p>Loading profile...</p>
        </div>

        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
        </div>

        <div v-else>
          <!-- Vista para OWNER -->
          <div v-if="userRole === 'ROLE_OWNER'" class="owner-profile">
            <div class="profile-header">
              <div class="avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="user-info">
                <h2>MAURI WIWI</h2>
                <p>mau@gmail.com</p>
              </div>
            </div>

            <div class="profile-details">
              <ProfileField label="Business Name" value="Sweet Manager Inc." />
              <ProfileField label="Location" value="123 Sweet St, Candyland" />
              <ProfileField label="Contact Number" value="(123) 456-7890" />
              <ProfileField label="Total Employees" value="50" />
              <ProfileField label="Supervision Areas" value="All Areas" />
              <PasswordField />
            </div>
          </div>

          <!-- Vista para ADMIN o WORKER -->
          <div v-else class="user-profile">
            <div class="profile-header">
              <div class="avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="user-info">
                <h2>{{ userInfo.name || 'N/A' }}</h2>
                <p>{{ userInfo.email || 'N/A' }}</p>
              </div>
            </div>

            <div class="profile-details">
              <EditableField
                  label="Name"
                  :value="userInfo.name"
                  action="Change name"
                  @edit="handleFieldEdit('name')"
              />
              <EditableField
                  label="Username"
                  :value="userInfo.username"
                  action="Change username"
                  @edit="handleFieldEdit('username')"
              />
              <EditableField
                  label="Email"
                  :value="userInfo.email"
                  action="Change email"
                  @edit="handleFieldEdit('email')"
              />
              <EditableField
                  label="Phone"
                  :value="userInfo.phone"
                  action="Change phone"
                  @edit="handleFieldEdit('phone')"
              />

              <ProfileField
                  v-if="userRole === 'ROLE_WORKER'"
                  label="Assigned Area"
                  value="SECURITY STAFF"
              />

              <PasswordField @change-password="handleChangePassword" />
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import AuthService from '../../iam/service/auth_service.js';
import ProfileField from '../../profiles/views/ProfileField.vue';
import EditableField from '../../profiles/views/EditableField.vue';
import PasswordField from '../../profiles/views/PassordField.vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44390/api/v1';

export default {
  name: 'ProfilePage',
  components: {
    ProfileField,
    EditableField,
    PasswordField
  },
  setup() {
    const router = useRouter();
    const userInfo = ref({});
    const userRole = ref('');
    const loading = ref(true);
    const error = ref(null);
    const showPasswordDialog = ref(false);

    const fetchUserInfo = async () => {
      try {
        loading.value = true;
        error.value = null;

        const token = await AuthService.getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }
        //added to avoid 401 error
        const decodedToken = AuthService.getDecodedToken();
        if (!decodedToken) {
          throw new Error('Invalid token');
        }

        userRole.value = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
        const hotelId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality'];

        console.log('User role:', userRole.value);
        console.log('User ID:', userId);
        console.log('Hotel ID:', hotelId);

        // Manejar el caso OWNER directamente
        if (userRole.value === 'ROLE_OWNER') {
          userInfo.value = {
            role: userRole.value,
            name: 'MAURI WIWI',
            username: 'mauri_wiwi_777',
            email: 'mau@gmail.com',
            phone: '941691025'
          };
          loading.value = false;
          return;
        }

        // Para ADMIN y WORKER, obtener datos del servidor
        const endpoint = userRole.value === 'ROLE_ADMIN'
            ? '/api/v1/user/get-all-admins'
            : '/api/v1/user/get-all-workers';

        const response = await axios.get(`${API_BASE_URL}${endpoint}?hotelId=${hotelId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 200) {
          const users = response.data;
          const currentUser = users.find(user => user.id.toString() === userId.toString());

          if (currentUser) {
            userInfo.value = {
              role: userRole.value,
              name: currentUser.name || 'N/A',
              username: currentUser.username || 'N/A',
              email: currentUser.email || 'N/A',
              phone: currentUser.phone || 'N/A'
            };
          } else {
            throw new Error('User not found in the list');
          }
        } else {
          throw new Error(`Failed to load user info. Status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
        error.value = err.message || 'Failed to load profile information';

        // Redirigir a login si el token es inválido
        if (err.message.includes('token') || err.message.includes('authentication')) {
          router.push('/login');
        }
      } finally {
        loading.value = false;
      }
    };

    const handleFieldEdit = (field) => {
      console.log(`Edit ${field} requested`);
      // Implementar lógica de edición aquí
      // Puedes mostrar un modal/dialog para editar el campo
    };

    const handleChangePassword = () => {
      console.log('Change password requested');
      // Implementar lógica de cambio de contraseña aquí
    };

    onMounted(() => {
      fetchUserInfo();
    });

    return {
      userInfo,
      userRole,
      loading,
      error,
      showPasswordDialog,
      handleFieldEdit,
      handleChangePassword
    };
  }
};
</script>

<style scoped>
.profile-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  overflow: hidden;
}

.avatar i {
  font-size: 3.5rem;
  color: #666;
}

.user-info h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.user-info p {
  margin: 0.5rem 0 0;
  color: #666;
  font-size: 1rem;
}

.profile-details {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error {
  color: #d32f2f;
  background-color: #ffebee;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>