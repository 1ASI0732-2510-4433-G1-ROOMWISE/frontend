<script>
import LanguageSwitcher from "./language-switcher.component.vue";
import AuthService from "../../iam/service/auth_service.js";
import router from "../../router/index.js";

export default {
  name: "toolbar-component",
  components: { LanguageSwitcher },
  data() {
    return {
      items: [
        { label: 'Home', to: '/home' },
      ],
      user: null,
      loading: false,
      userRoles: {
        OWNER: 1,
        ADMIN: 2,
        WORKER: 3
      }
    }
  },
  created() {
    this.checkAuthentication();
  },
  computed: {
    isLogged() {
      return AuthService.isAuthenticated();
    },
    userRole() {
      // Obtener el rol del usuario desde el token almacenado
      const token = AuthService.getToken();
      if (!token) return null;

      // Decodificar el token para obtener el rol (esto depende de cómo esté estructurado tu JWT)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.roleId || payload.rolesId;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
  },
  methods: {
    async checkAuthentication() {
      if (this.isLogged) {
        this.loading = true;
        try {
          // Aquí puedes agregar lógica para obtener datos adicionales del usuario
          // si tu API lo permite
          // this.user = await AuthService.getCurrentUser();
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          this.loading = false;
        }
      }
    },
    async logout() {
      this.loading = true;
      try {
        await AuthService.logout();
        this.$router.push('/login');
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
    },
    sendToProfile() {
      router.push('/profile');
    },
    sendToCompany() {
      router.push('/company');
    },
    sendToRooms() {
      router.push('/rooms');
    },
    sendToSupply() {
      if (this.hasRole([this.userRoles.OWNER, this.userRoles.ADMIN])) {
        router.push('/supply');
      } else {
        this.showAccessDenied();
      }
    },
    hasRole(requiredRoles) {
      if (!Array.isArray(requiredRoles)) {
        requiredRoles = [requiredRoles];
      }
      return requiredRoles.includes(parseInt(this.userRole));
    },
    showAccessDenied() {
      this.$toast.add({
        severity: 'error',
        summary: 'Acceso denegado',
        detail: 'No tienes permisos para acceder a esta sección',
        life: 3000
      });
    }
  }
}
</script>

<template>
  <pv-toolbar class="bg-primary pt-1 pb-1" style="border-radius: 0;">
    <template #start>
      <router-link v-if="isLogged" to="/" custom v-slot="{ navigate, href }">
        <pv-button :href="href" class="p-button-text text-white" @click="navigate">
          <h2>Sweet Manager</h2>
        </pv-button>
      </router-link>

      <router-link v-if="isLogged" to="/panel" custom v-slot="{ navigate, href }">
        <pv-button :href="href" class="p-button-text text-white ml-2" @click="navigate">
          {{ $t('control-panel') }}
        </pv-button>
      </router-link>
    </template>

    <template #center>
      <language-switcher />
    </template>

    <template #end>
      <div v-if="isLogged" class="flex align-items-center gap-2">
        <pv-button
            v-if="hasRole([userRoles.OWNER, userRoles.ADMIN])"
            class="p-button-text text-white"
            @click="sendToRooms"
            :loading="loading"
        >
          {{ $t('rooms') }}
        </pv-button>

        <pv-button
            v-if="hasRole([userRoles.OWNER, userRoles.ADMIN])"
            class="p-button-text text-white"
            @click="sendToSupply"
            :loading="loading"
        >
          {{ $t('supply') }}
        </pv-button>

        <pv-button
            v-if="hasRole(userRoles.OWNER)"
            class="p-button-text text-white"
            @click="sendToCompany"
            :loading="loading"
        >
          {{ $t('my-company') }}
        </pv-button>

        <pv-button
            class="p-button-text text-white"
            @click="sendToProfile"
            :loading="loading"
        >
          {{ $t('my-profile') }}
        </pv-button>

        <pv-button
            class="p-button-text text-white"
            @click="logout"
            :loading="loading"
        >
          {{ $t('logout') }}
        </pv-button>
      </div>
    </template>
  </pv-toolbar>
</template>

<style scoped>
.p-button.p-button-loading {
  opacity: 0.8;
}

.gap-2 {
  gap: 0.5rem;
}
</style>