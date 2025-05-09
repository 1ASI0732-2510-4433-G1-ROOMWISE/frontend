<template>
  <div class="write-alert-view">
    <h1>Create New Alert</h1>

    <form @submit.prevent="submitAlert">
      <div class="form-group">
        <label>Title</label>
        <input v-model="form.title" required>
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea v-model="form.description" required></textarea>
      </div>

      <div class="form-group">
        <label>Owner ID</label>
        <input v-model.number="form.ownersId" type="number">
      </div>

      <div class="form-group">
        <label>Admin ID</label>
        <input v-model.number="form.adminsId" type="number">
      </div>

      <div class="form-group">
        <label>Worker ID</label>
        <input v-model.number="form.workersId" type="number">
      </div>

      <button type="submit" class="btn-submit">Send Alert</button>
    </form>
  </div>
</template>

<script>
import notificationService from '@/services/notificationService';

export default {
  data() {
    return {
      form: {
        typesNotificationsId: 2,
        ownersId: 0,
        adminsId: 0,
        workersId: 0,
        title: '',
        description: ''
      }
    };
  },
  methods: {
    async submitAlert() {
      try {
        const notification = new Notification(
            this.form.typesNotificationsId,
            this.form.ownersId,
            this.form.adminsId,
            this.form.workersId,
            this.form.title,
            this.form.description
        );

        const success = await notificationService.createAlert(notification);
        if (success) {
          this.$toast.success("Alert created successfully");
          this.$router.go(-1);
        }
      } catch (error) {
        console.error("Error creating alert:", error);
        this.$toast.error("Failed to create alert");
      }
    }
  }
};
</script>

<style scoped>
.write-alert-view {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}
h1 {
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
textarea {
  min-height: 100px;
}
.btn-submit {
  background: #2C5282;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
</style>