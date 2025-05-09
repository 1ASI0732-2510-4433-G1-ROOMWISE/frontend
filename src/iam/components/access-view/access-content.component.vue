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

      <pv-tab-view ref="tabView" class="mt-3">
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
  computed: {
    i18n() {
      return i18n;
    }
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  created() {
    this.checkAuthentication();
  },
  methods: {
    checkAuthentication() {
      if (AuthService.isAuthenticated()) {
        const role = AuthService.getCurrentUserRole();
        this.redirectBasedOnRole(role);
      }
    },
    handleSuccessfulLogin() {
      const role = AuthService.getCurrentUserRole();
      this.redirectBasedOnRole(role);
    },
    handleSuccessfulRegistration() {
      // Cambiar a la pestaña de login después de registro exitoso
      this.$refs.tabView.activeIndex = 0;
      this.toast.add({
        severity: 'success',
        summary: 'Registro exitoso',
        detail: 'Por favor inicia sesión con tus nuevas credenciales',
        life: 3000
      });
    },
    redirectBasedOnRole(role) {
      let redirectPath = '/panel'; // Ruta por defecto

      // Personaliza las rutas según el rol si es necesario
      switch(role) {
        case '1': // Owner
          redirectPath = '/owner-dashboard';
          break;
        case '2': // Admin
          redirectPath = '/admin-dashboard';
          break;
        case '3': // Worker
          redirectPath = '/worker-dashboard';
          break;
      }

      this.$router.push(redirectPath);
    },

    goToRegister() {
      this.$router.push('/register');
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