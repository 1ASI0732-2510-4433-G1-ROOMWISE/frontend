<script>
// Import the ToolbarComponent to be used within this component
import ToolbarComponent from "./public/components/toolbar.component.vue";

export default {
  name: "app",  // Name of the root component
  components: { ToolbarComponent },  // Register the ToolbarComponent locally
}
</script>

<template>
  <!-- Display a toast notification at the bottom-center of the screen -->
  <pv-toast position="bottom-center"/>
  
  <!-- Header section containing the toolbar component -->
  <header>
    <toolbar-component/>  <!-- Use the toolbar component -->
  </header>
  
  <!-- Main content area that renders the current route's view -->
  <div class="container">
    <router-view class="router-view" />  <!-- Render the component for the current route -->
  </div>
</template>

<style scoped>
/* Style for the container to use full height minus 80px for the header */
.container {
  display: flex;
  flex-direction: column;  /* Stack children (header and content) vertically */
  height: calc(100vh - 80px);  /* Make the container take full viewport height minus header */
}

/* Style for the router view section */
.router-view {
  flex: 1;  /* Take up the remaining space in the container */
  overflow-y: auto;  /* Enable vertical scrolling if content overflows */
}
</style>
