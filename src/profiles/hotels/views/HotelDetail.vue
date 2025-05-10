<template>
  <div>
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!hasAccess" class="access-denied">
      <p>Access denied. You do not have permission to view this page.</p>
    </div>

    <base-layout v-else :role="userRole">
      <div class="hotel-detail">
        <div class="hotel-header">
          <div class="hotel-image" :style="{ backgroundImage: `url('https://i.pinimg.com/564x/29/1b/10/291b104087960aa6b0c63e1aca8a7977.jpg')` }">
            <div class="overlay"></div>
            <h1 class="hotel-name">{{ hotel.name }}</h1>
            <div class="hotel-location">
              <i class="location-icon">location_on</i>
              <span>{{ hotel.address }}</span>
            </div>
          </div>
        </div>

        <div class="hotel-info">
          <h2 class="section-title">HOTEL INFO</h2>

          <div class="info-row">
            <div class="info-label">Name</div>
            <div class="info-value">{{ hotel.name }}</div>
          </div>

          <div class="info-row">
            <div class="info-label">Address</div>
            <div class="info-value">{{ hotel.address }}</div>
          </div>

          <div class="info-row">
            <div class="info-label">Phone Number</div>
            <div class="info-value">{{ hotel.phoneNumber }}</div>
          </div>

          <div class="info-row">
            <div class="info-label">Email</div>
            <div class="info-value">{{ hotel.email }}</div>
          </div>

          <div class="info-row">
            <div class="info-label">Owner ID</div>
            <div class="info-value">{{ hotel.ownerId }}</div>
          </div>

          <h2 class="section-title">Description</h2>
          <p class="hotel-description">{{ hotel.description }}</p>

          <button class="save-button" @click="navigateToRoomTypes">Save</button>
        </div>
      </div>
    </base-layout>
  </div>
</template>

<script>
import JwtHelper from '../service/JwtHelper.js';

export default {
  name: 'HotelDetailView',
  components: {

  },
  props: {
    hotel: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      userRole: null,
      hasAccess: false
    };
  },
  mounted() {
    this.checkUserRole();
  },
  methods: {
    checkUserRole() {
      const token = localStorage.getItem('token');

      if (token) {
        this.userRole = JwtHelper.getRole(token);
        this.hasAccess = this.userRole === 'ROLE_OWNER';
      }

      this.loading = false;
    },
    navigateToRoomTypes() {
      this.$router.push({ name: 'room-types-setup' });
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #1C4257;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.access-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  font-size: 18px;
  color: #ff0000;
}

.hotel-detail {
  width: 100%;
}

.hotel-header {
  position: relative;
}

.hotel-image {
  height: 300px;
  width: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
}

.hotel-name {
  position: absolute;
  top: 16px;
  left: 16px;
  color: white;
  font-size: 24px;
  font-weight: bold;
  z-index: 1;
  margin: 0;
}

.hotel-location {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  color: white;
  z-index: 1;
}

.location-icon {
  margin-right: 8px;
  font-style: normal;
}

.hotel-info {
  padding: 16px;
}

.section-title {
  font-weight: bold;
  font-size: 16px;
  margin-top: 16px;
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-label {
  flex: 1;
  font-weight: bold;
  color: #808080;
}

.info-value {
  flex: 1;
}

.hotel-description {
  font-size: 14px;
  color: #606060;
  margin-bottom: 16px;
}

.save-button {
  width: 100%;
  background-color: #1C4257;
  color: white;
  border: none;
  padding: 16px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 16px;
}

.save-button:hover {
  background-color: #15333f;
}
</style>