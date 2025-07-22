<template>
  <!-- Render the matched route component with a transition -->
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'page'" mode="in-out">
      <component :is="Component" :key="route.name" />
    </transition>
  </router-view>
</template>

<script setup>
// No JavaScript logic needed here; transitions are handled via CSS
</script>

<style>
/* Ensure the app takes up the full viewport */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

/* Zoom transition for components entering and leaving */
.zoom-enter-active,
.zoom-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Start state for zoom-in */
.zoom-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

/* End state for zoom-out */
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Default fade transition for route changes */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s;
}

/* Fade start and end states */
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
