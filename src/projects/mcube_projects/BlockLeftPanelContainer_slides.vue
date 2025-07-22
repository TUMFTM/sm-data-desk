<template>
  <div class="slide-container">
    <!-- обычный блок -->
    <div class="image-wrapper">
      <div class="image-inner">
        <img :src="currentSlide" alt="Slide" class="slide-image" />
      </div>
    </div>

    <div class="slide-controls">
      <button class="slide-button" @click="prevSlide">◀</button>
      <button class="slide-button fullscreen-button" @click="showOverlay = true">⤢</button>
      <button class="slide-button" @click="nextSlide">▶</button>
    </div>

    <!-- fullscreen overlay -->
    <FullscreenOverlay v-if="showOverlay" @close="showOverlay = false">
      <div class="fullscreen-slide">
        <div class="image-wrapper">
          <div class="image-inner">
            <img :src="currentSlide" alt="Slide" class="slide-image" />
          </div>
        </div>

        <div class="slide-controls">
          <button class="slide-button" @click="prevSlide">◀</button>
          <button class="slide-button" @click="showOverlay = false">x</button>
          <button class="slide-button" @click="nextSlide">▶</button>
        </div>
      </div>
    </FullscreenOverlay>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FullscreenOverlay from '@/components/FullscreenOverlay.vue'

const showOverlay = ref(false)

const slides = [
  new URL('../../projects/mcube_projects/assets/slides/slide1.png', import.meta.url).href,
  new URL('../../projects/mcube_projects/assets/slides/slide2.png', import.meta.url).href,
  new URL('../../projects/mcube_projects/assets/slides/slide3.png', import.meta.url).href
]

const currentIndex = ref(0)
const currentSlide = computed(() => slides[currentIndex.value])

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % slides.length
}

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length
}
</script>

<style scoped>
.slide-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.slide-button {
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  background: #0061c3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.slide-controls {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 1;
}

.fullscreen-slide {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.image-wrapper {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  box-sizing: border-box;
}

.image-inner {
  max-height: 100%;
  max-width: 100%;
}

.slide-image {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  display: block;
}

.slide-controls {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem;
}
</style>
