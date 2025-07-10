<template>
  <div class="main-view flex align-content-center justify-content-center flex-wrap">
    <div class="mx-8 p-5 bg-white border-round-2xl" style="width: 450px;">
      <div class="flex flex-column align-items-center justify-content-center">
        <p class="font-bold text-2xl text-primary-800 mt-1 pt-1 pb-0 mb-0">
          {{ i18n.global.t('login-view.title') }}
        </p>
        <p class="text-center">
          {{ i18n.global.t('login-view.sub.text') }}
          <a class="underline text-primary" href="#" @click.prevent="goToRegister">
            {{ i18n.global.t('login-view.sub.link') }}
          </a>
        </p>
      </div>

      <pv-tab-view ref="tabView" class="mt-3" v-model:activeIndex="activeTab">
        <pv-tab-panel :header="i18n.global.t('login-view.login')">
          <login-view @successful-login="handleSuccessfulLogin"/>
        </pv-tab-panel>
        <pv-tab-panel :header="i18n.global.t('login-view.signup')">
          <register-view @successful-registration="handleSuccessfulRegistration"/>
        </pv-tab-panel>
      </pv-tab-view>

      <!-- Mensajes de error generales -->
      <pv-toast position="top-center" />
    </div>
  </div>
</template>

<script>
import i18n from "../../../i18n.js";
import RegisterView from "../register-view/register-view.component.vue";
import LoginView from "../login-view/login-view.component.vue";
import AuthService from "../../service/auth_service.js";
import { useToast } from 'primevue/usetoast';

export default {
  name: "access-content",
  components: { LoginView, RegisterView },
  data() {
    return {
      activeTab: 0
    };
  },
  computed: {
    i18n() {
      return i18n;
    }
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  mounted() {
    // Configurar la pestaña activa según el meta.defaultTab de la ruta
    this.setActiveTab();
  },
  watch: {
    // Observar cambios en la ruta para actualizar la pestaña activa
    '$route'(to, from) {
      this.setActiveTab();
    }
  },
  methods: {
    setActiveTab() {
      // Configurar la pestaña activa basada en el meta de la ruta
      if (this.$route.meta.defaultTab === 'register') {
        this.activeTab = 1;
      } else {
        this.activeTab = 0;
      }
    },
    handleSuccessfulLogin() {
      const role = AuthService.getCurrentUserRole();
      this.redirectBasedOnRole(role);
    },
    handleSuccessfulRegistration() {
      // Cambiar a la pestaña de login después de registro exitoso
      this.activeTab = 0;
      // También cambiar la ruta para mantener consistencia
      this.$router.push('/login');
      this.toast.add({
        severity: 'success',
        summary: 'Registro exitoso',
        detail: 'Por favor inicia sesión con tus nuevas credenciales',
        life: 3000
      });
    },
    goToRegister() {
      this.$router.push('/register');
    },
    redirectBasedOnRole(role) {
      // Implementar la lógica de redirección basada en el rol
      switch (role) {
        case 1: // ROLE_OWNER
          this.$router.push('/panel');
          break;
        case 2: // ROLE_ADMIN
          this.$router.push('/panel');
          break;
        case 3: // ROLE_WORKER
          this.$router.push('/panel');
          break;
        default:
          console.error('Rol no reconocido:', role);
          // Si el rol no es reconocido, logout y mantener en login
          AuthService.logout();
          this.toast.add({
            severity: 'error',
            summary: 'Error de autenticación',
            detail: 'Rol de usuario no válido',
            life: 3000
          });
      }
    }
  }
};
</script>

<style scoped>
.main-view {
  background-image: url("../../../assets/img/hotel-background.jpg");
  background-size: cover;
  min-height: 100vh;
  padding: 2rem;
}

/* Estilos para hacer responsive el diseño */
@media screen and (max-width: 600px) {
  .main-view > div {
    width: 90% !important;
    margin: 0 auto;
    padding: 1.5rem;
  }
}

/* Animación de entrada */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>