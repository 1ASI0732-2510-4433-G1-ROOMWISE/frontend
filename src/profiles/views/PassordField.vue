<template>
  <div class="password-field">
    <label>Password:</label>
    <div class="password-input-container">
      <input
          :type="showPassword ? 'text' : 'password'"
          :value="showPassword ? 'realpassword' : '********'"
          readonly
          class="password-input"
      />
      <button @click="togglePassword" class="toggle-button">
        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
      </button>
    </div>
    <button @click="handleChangePassword" class="change-button">Change password</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'PasswordField',
  setup() {
    const showPassword = ref(false);

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const handleChangePassword = () => {
      // Lógica para cambiar contraseña
      console.log('Change password clicked');
    };

    return {
      showPassword,
      togglePassword,
      handleChangePassword
    };
  }
};
</script>

<style scoped>
.password-field {
  margin-bottom: 15px;
}

.password-field label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.password-input-container {
  position: relative;
  margin-bottom: 5px;
}

.password-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  padding-right: 40px;
}

.toggle-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.change-button {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}

.change-button:hover {
  text-decoration: underline;
}
</style>