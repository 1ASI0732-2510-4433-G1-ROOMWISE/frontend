<script>
import i18n from "../../../i18n.js";
import AuthService from "../../service/auth_service.js";

export default {
  name: "login-view",
  computed: {
    i18n() {
      return i18n
    }
  },
  data() {
    return {
      email: "",
      password: "",
      roleId: 1, // 1: Owner, 2: Admin, 3: Worker
      loading: false,
      error: null,
      roles: [
        { label: 'Owner', value: 1 }
      ]
    }
  },
  methods: {
    async login() {
      this.error = null;

      if (!this.email || !this.password) {
        this.error = 'Please enter email and password';
        return;
      }

      this.loading = true;

      try {
        const success = await AuthService.login(this.email, this.password, this.roleId);

        if (success) {
          this.$router.push('/panel');
        } else {
          this.error = 'Invalid credentials or role';
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<template>
  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="email"
                     :label="i18n.global.t('login-view.login-panel.email')"
                     type="email"
                     class="w-12"
                     required/>
      <label>{{ i18n.global.t('login-view.login-panel.email') }}</label>
    </pv-float-label>
  </div>

  <div class="mb-4">
    <pv-float-label class="w-full">
      <pv-password v-model="password"
                   :label="i18n.global.t('login-view.login-panel.password')"
                   type="password"
                   toggleMask
                   class="w-full"
                   required/>
      <label>{{ i18n.global.t('login-view.login-panel.password') }}</label>
    </pv-float-label>
  </div>

  <div class="mb-4">
    <pv-dropdown v-model="roleId"
                 :options="roles"
                 optionLabel="label"
                 optionValue="value"
                 placeholder="Select role"
                 class="w-full"/>
  </div>

  <div v-if="error" class="p-3 mb-4 bg-red-100 text-red-700 rounded">
    {{ error }}
  </div>

  <div class="mt-4 text-center">
    <pv-button @click="login"
               :label="i18n.global.t('login-view.login-panel.login')"
               :loading="loading"
               class="w-full"/>
  </div>
</template>