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
        id: "", // Add ID field for DNI/identification
        username: "",
        name: "",
        surname: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "", // Added this field as it was missing in data but used in template
        state: "ACTIVE",
        role: "owner" // Field to select user type
      },
      terms: false,
      loading: false
    }
  },
  methods: {
    validateForm() {
      // Check if ID is provided
      if (!this.formData.id) {
        this.showErrorToast('Identification number is required');
        return false;
      }

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
        // Convert phone to integer
        const phone = parseInt(this.formData.phone) || 0;

        // Convert ID to integer if it's a number
        const id = parseInt(this.formData.id) || this.formData.id;

        let success = false;

        // Use the correct method for each role and pass individual parameters
        if (this.formData.role === 'owner') {
          success = await AuthService.signupOwner(
              id,
              this.formData.username,
              this.formData.name,
              this.formData.surname,
              this.formData.email,
              phone,
              this.formData.password
          );
        } else if (this.formData.role === 'worker') {
          success = await AuthService.signupWorker(
              id,
              this.formData.username,
              this.formData.name,
              this.formData.surname,
              this.formData.email,
              phone,
              this.formData.password
          );
        }

        if (success) {
          this.$toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Registration successful! Please login.',
            life: 3000
          });
          this.$emit('registration-success');
          this.$router.push('/'); // Redirect to login page after successful registration
        } else {
          this.showErrorToast('Registration failed');
        }
      } catch (error) {
        this.showErrorToast(`Registration error: ${error.response?.data?.message || error.message}`);
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
      <label for="role-worker" class="ml-2"></label>
    </div>
  </div>

  <!-- Added ID/DNI field -->
  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="formData.id"
                     label="Identification Number (DNI)"
                     type="text"
                     class="w-12"
                     required/>
      <label slot="label">
        Identification Number (DNI)
      </label>
    </pv-float-label>
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