<script>

// Default style object with width set to 450px
const defaultStyle = { width: '450px' }

export default {
  name: "create-and-edit",  // Name of the component

  // Props accepted by the component
  props: { 
    entity: null,  // Entity to be created or edited
    visible: Boolean,  // Controls visibility of the dialog
    entityName: '',  // Name of the entity (e.g., 'Product')
    edit: Boolean,  // Flag to indicate if the action is edit or create
    size: 'default'  // Size of the dialog, can be 'default', 'standard', or 'large'
  },

  // Methods for the component
  methods: {
    // Method triggered when cancel is clicked, emits 'canceled' event
    onCancel() {
      this.$emit('canceled');
    },

    // Method triggered when save is clicked, emits 'saved' event with the entity data
    onSave() {
      this.$emit('saved', this.entity);
    },

    // Returns the header title based on whether the entity is being created or edited
    getHeaderTitle() {
      return `${this.edit ? this.$t('actions.edit') : this.$t('actions.new')} ${this.entityName}`;
    },

    // Returns the label for the submit button, 'Update' if editing, 'Create' if new
    getSubmitLabel() {
      return this.edit ? this.$t('actions.update') : this.$t('actions.create');
    },

    // Returns the dialog's style based on the size prop
    getDialogStyle() {
      let dialogStyle = defaultStyle;

      // Adjust the width based on the 'size' prop
      dialogStyle = this.size === 'standard' ? { width: '600px'} : defaultStyle;
      dialogStyle = this.size === 'large' ? { width: '900px'} : defaultStyle;

      return dialogStyle;
    }
  }
}
</script>

<template>
  <!-- Create / Update Dialog -->
  <pv-dialog v-bind:visible="visible" :modal="true" :style="getDialogStyle()" class="p-fluid" :header="entityName">
    <template #header>
      <div class="flex justify-content-start">
        <div>{{ getHeaderTitle() }}</div>  <!-- Display header title based on create or edit -->
      </div>
    </template>
    
    <!-- Slot for the content inside the dialog -->
    <slot name="content"></slot>

    <template #footer>
      <div class="flex justify-content-end">
        <!-- Save button that triggers the onSave method -->
        <pv-button type="button" :label="getSubmitLabel()" class="p-button-text" icon="pi pi-check" @click="onSave"/>
        
        <!-- Cancel button that triggers the onCancel method -->
        <pv-button type="button" :label="$t('actions.cancel')" severity="secondary" class="p-button-text" icon="pi pi-times" @click="onCancel"/>
      </div>
    </template>
  </pv-dialog>
</template>
