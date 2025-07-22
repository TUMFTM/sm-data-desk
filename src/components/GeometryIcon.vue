<template>
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    class="geometry-icon"
    aria-hidden="true"
  >
    <!-- Draw a rectangle for Polygon types -->
    <rect
      v-if="type.includes('polygon')"
      x="2"
      y="4"
      width="12"
      height="8"
      :fill="color"
      rx="1"
    />

    <!-- Draw a line for LineString types -->
    <line
      v-else-if="type.includes('line')"
      x1="2"
      y1="8"
      x2="14"
      y2="8"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- Draw a circle for Point types -->
    <circle
      v-else-if="type.includes('point')"
      cx="8"
      cy="8"
      r="4"
      :fill="color"
    />

    <!-- Fallback: A default square for unknown types -->
    <rect v-else x="2" y="2" width="12" height="12" :fill="color" rx="1" />
  </svg>
</template>

<script setup>
defineProps({
  // The geometry type, e.g., "polygon", "point"
  type: {
    type: String,
    default: ''
  },
  // The color for the shape
  color: {
    type: String,
    default: '#888888'
  }
})
</script>

<style scoped>
.geometry-icon {
  display: inline-block;
  margin-right: 0.6em;
  vertical-align: middle; /* Aligns the icon nicely with the text */
  flex-shrink: 0; /* Prevents the icon from shrinking in flex layouts */
}
</style>
