<template>
  <div class="editable-field">
    <label>{{ label }}:</label>
    <input
        type="text"
        :value="value"
        readonly
        class="value-input"
    />
    <button @click="handleEdit" class="edit-button">{{ action }}</button>
  </div>
</template>

<script>
export default {
  name: 'EditableField',
  props: {
    label: String,
    value: String,
    action: String
  },
  methods: {
    handleEdit() {
      this.$emit('edit', this.label.toLowerCase());
    }
  }
};
</script>

<style scoped>
.editable-field {
  margin-bottom: 15px;
}

.editable-field label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.value-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
}

.edit-button {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}

.edit-button:hover {
  text-decoration: underline;
}
</style>