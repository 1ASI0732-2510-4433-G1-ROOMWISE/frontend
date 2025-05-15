<template>
  <div class="add-notification-container">
    <div class="add-notification-card">
      <div class="form-header">
        <h1>Create New Notification</h1>
        <p>Fill out the form below to send a new notification</p>
      </div>

      <form @submit.prevent="submitNotification" class="notification-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="typesNotificationsId">Notification Type</label>
            <input
                v-model="typesNotificationsId"
                type="number"
                id="typesNotificationsId"
                class="form-input"
                placeholder="Enter notification type ID"
                required
            />
            <span class="input-icon">🔔</span>
          </div>

          <div class="form-group">
            <label for="title">Title</label>
            <input
                v-model="title"
                type="text"
                id="title"
                class="form-input"
                placeholder="Notification title"
                required
            />
            <span class="input-icon">✏️</span>
          </div>

          <div class="form-group">
            <label for="ownersId">Owner ID (optional)</label>
            <input
                v-model="ownersId"
                type="number"
                id="ownersId"
                class="form-input"
                placeholder="Enter owner ID"
            />
            <span class="input-icon">👤</span>
          </div>

          <div class="form-group">
            <label for="adminsId">Admin ID (optional)</label>
            <input
                v-model="adminsId"
                type="number"
                id="adminsId"
                class="form-input"
                placeholder="Enter admin ID"
            />
            <span class="input-icon">👔</span>
          </div>

          <div class="form-group">
            <label for="workersId">Worker ID (optional)</label>
            <input
                v-model="workersId"
                type="number"
                id="workersId"
                class="form-input"
                placeholder="Enter worker ID"
            />
            <span class="input-icon">👷</span>
          </div>

          <div class="form-group full-width">
            <label for="description">Description</label>
            <div class="textarea-container">
              <textarea
                  v-model="description"
                  id="description"
                  class="form-textarea"
                  placeholder="Enter detailed notification description..."
                  rows="4"
                  required
              ></textarea>
              <span class="textarea-icon">📝</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="resetForm">
            Clear Form
          </button>
          <button type="submit" class="primary-button">
            <span class="button-icon">📨</span>
            Create Notification
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Notification from '../model/Notification.js';
import notificationService from '../services/notificationService.js';

export default {
  data() {
    return {
      typesNotificationsId: 0,
      ownersId: null,
      adminsId: null,
      workersId: null,
      title: '',
      description: '',
    };
  },
  methods: {
    async submitNotification() {
      const newNotification = new Notification(
          this.typesNotificationsId,
          this.ownersId,
          this.adminsId,
          this.workersId,
          this.title,
          this.description
      );

      try {
        const success = await notificationService.createNotification(newNotification);
        if (success) {
          alert('Notification created successfully!');
          this.resetForm();
        } else {
          alert('Failed to create notification.');
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    },
    resetForm() {
      this.typesNotificationsId = 0;
      this.ownersId = null;
      this.adminsId = null;
      this.workersId = null;
      this.title = '';
      this.description = '';
    },
  },
};
</script>

<style scoped>


.add-notification-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120vh;
  background-color: #f5f7fa;
  padding: 2rem;
}

.add-notification-card {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-header {
  padding: 2rem 2rem 1rem;
  background-color: #437f54;
  color: white;
}

.form-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.form-header p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.notification-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  position: relative;
  margin-bottom: 0;
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.form-input:focus {
  outline: none;
  border-color: #437f54;
  box-shadow: 0 0 0 3px rgba(67, 127, 84, 0.1);
  background-color: white;
}

.textarea-container {
  position: relative;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  resize: vertical;
  background-color: #f8fafc;
  min-height: 120px;
  overflow-y: auto; /* Solo una barra de desplazamiento vertical */
}

.form-textarea:focus {
  outline: none;
  border-color: #437f54;
  box-shadow: 0 0 0 3px rgba(67, 127, 84, 0.1);
  background-color: white;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 2.5rem;
  transform: translateY(-50%);
  font-size: 1rem;
  opacity: 0.6;
}

.textarea-icon {
  position: absolute;
  left: 1rem;
  top: 0.65rem; /* Ajustado para estar un poco más arriba que antes */
  font-size: 1rem;
  opacity: 0.6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #edf2f7;
}

.primary-button {
  background-color: #437f54;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-button:hover {
  background-color: #356745;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(67, 127, 84, 0.2);
}

.secondary-button {
  background-color: white;
  color: #4a5568;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background-color: #f8fafc;
  border-color: #cbd5e0;
}

.button-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: span 1;
  }

  .add-notification-card {
    max-width: 100%;
  }
}
</style>
