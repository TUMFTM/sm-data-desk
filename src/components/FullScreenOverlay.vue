<template>
  <div class="fullscreen-overlay">
    <button class="slide-button close-btn" @click="$emit('close')">✕</button>
    <slot />
  </div>
</template>

<style scoped>
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 9999;
  padding: 1rem;
  box-sizing: border-box;
  overflow: auto;
}
</style>
