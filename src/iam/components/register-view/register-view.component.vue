<script>
import i18n from "../../../i18n.js";
import AuthService from "../../service/auth_service.js";

export default {
  name: "register-view",
  computed: {
    i18n() {
      return i18n
    }
  },
  data() {
    return {
      formData: {
        username: "",
        name: "",
        surname: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        state: "ACTIVE",
        role: "owner" // Nuevo campo para seleccionar el tipo de usuario
      },
      terms: false,
      loading: false
    }
  },
  methods: {
    validateForm() {
      if (!this.terms) {
        this.showErrorToast('You must accept the terms and conditions');
        return false;
      }
      if (this.formData.password !== this.formData.confirmPassword) {
        this.showErrorToast('Passwords do not match');
        return false;
      }
      if (this.formData.password.length < 8) {
        this.showErrorToast('Password must be at least 8 characters');
        return false;
      }
      return true;
    },
    async register() {
      if (!this.validateForm()) return;

      this.loading = true;

      try {
        const { confirmPassword, role, ...registrationData } = this.formData;
        registrationData.phone = parseInt(registrationData.phone) || 0;

        // Selección del endpoint según el rol
        const signupMethod = role === 'owner'
            ? AuthService.signupOwner
            : AuthService.signupWorker;

        const success = await signupMethod(registrationData);

        if (success) {
          this.$toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Registration successful! Please login.',
            life: 3000
          });
          this.$emit('registration-success');
        } else {
          this.showErrorToast('Registration failed');
        }
      } catch (error) {
        this.showErrorToast('Registration error. Please try again.');
        console.error('Registration error:', error);
      } finally {
        this.loading = false;
      }
    },
    showErrorToast(message) {
      this.$toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        position: 'center',
        life: 3000
      });
    }
  }
}
</script>

<template>
  <div class="mb-4">
    <div class="flex align-items-center">
      <pv-radio-button v-model="formData.role" inputId="role-owner" value="owner" />
      <label for="role-owner" class="ml-2">Owner</label>

      <pv-radio-button v-model="formData.role" inputId="role-worker" value="worker" class="ml-4" />
      <label for="role-worker" class="ml-2">Worker</label>
    </div>
  </div>

  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="formData.username"
                     label="Username"
                     type="text"
                     class="w-12"
                     required/>
      <label slot="label">
        Username
      </label>
    </pv-float-label>
  </div>

  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="formData.email"
                     label="Email"
                     type="email"
                     class="w-12"
                     required/>
      <label slot="label">
        Email
      </label>
    </pv-float-label>
  </div>

  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="formData.name"
                     label="Name"
                     type="text"
                     class="w-12"
                     required/>
      <label slot="label">
        Name
      </label>
    </pv-float-label>
  </div>

  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="formData.surname"
                     label="Surname"
                     type="text"
                     class="w-12"
                     required/>
      <label slot="label">
        Surname
      </label>
    </pv-float-label>
  </div>

  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="formData.phone"
                     label="Phone"
                     type="tel"
                     class="w-12"
                     required/>
      <label slot="label">
        Phone
      </label>
    </pv-float-label>
  </div>

  <div class="mb-4">
    <pv-float-label class="w-full">
      <pv-password v-model="formData.password"
                   label="Password"
                   type="password"
                   toggleMask
                   :feedback="true"
                   class="w-full"
                   required/>
      <label slot="label">
        Password
      </label>
    </pv-float-label>
  </div>

  <div class="mb-4">
    <pv-float-label class="w-full">
      <pv-password v-model="formData.confirmPassword"
                   label="Confirm Password"
                   type="password"
                   toggleMask
                   :feedback="false"
                   class="w-full"
                   required/>
      <label slot="label">
        Confirm Password
      </label>
    </pv-float-label>
  </div>

  <div class="mt-4">
    <pv-checkbox v-model="terms"
                 aria-label="Terms and conditions"
                 id="terms-and-conditions"
                 binary
                 required/>
    <label for="terms-and-conditions" class="ml-2">
      I agree to the Terms and Conditions
    </label>
  </div>

  <div class="mt-4 text-center align-content-center">
    <pv-button @click="register"
               class="w-10 border-round-3xl"
               label="Sign Up"
               :loading="loading"/>
  </div>
</template>