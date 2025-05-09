<template>
  <div class="profile-field">
    <label>{{ label }}:</label>
    <div class="value">{{ value }}</div>
  </div>
</template>

<script>
export default {
  name: 'ProfileField',
  props: {
    label: String,
    value: String
  }
};
</script>

<style scoped>
.profile-field {
  margin-bottom: 15px;
}

.profile-field label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.profile-field .value {
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>