<template>
  <div class="project-selector block-carousel" :class="{ 'grid-mode': props.useGrid }">
    <Carousel3d
      ref="carousel3dRef"
      :count="projects.length"
      :perspective="1"
      :space="100"
      :width="200"
      :height="100"
      :controls-visible="true"
      :clickable="true"
      :display="5"
      bias="center"
      :loop="true"
      :autoplay="false"
      :autoplay-timeout="5000"
      :disable3d="false"
      :inverse-scaling="30"
      :index="activeIndex"
      @after-slide-change="onAfterSlideChange"
    >
      <Slide
        v-for="(project, index) in projects"
        :key="project.id"
        :index="index"
        class="carousel-slide"
      >
        <div class="project-slide" @click="selectProject(project.id)">
          <img :src="project.thumbnail" :alt="project.title" class="project-thumbnail" />
          <div class="project-title">{{ project.title }}</div>
        </div>
      </Slide>
    </Carousel3d>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { Carousel3d, Slide } from '@nanoandrew4/vue3-carousel-3d'
import '@nanoandrew4/vue3-carousel-3d/dist/style.css'

const props = defineProps({
  projects: { type: Array, required: true },
  activeIndex: { type: Number, required: true },
  useGrid: { type: Boolean, default: false }
})

const emits = defineEmits(['update:activeIndex', 'select', 'carousel-ready'])

const carousel3dRef = ref(null)
const isCarouselReady = ref(false)

defineExpose({
  goToSlide: (index) => {
    if (carousel3dRef.value && typeof carousel3dRef.value.goToSlide === 'function') {
      carousel3dRef.value.goToSlide(index)
    } else {
    }
  },
  get currentIndex() {
    return carousel3dRef.value?.currentIndex
  },
  set currentIndex(value) {
    if (carousel3dRef.value) {
      carousel3dRef.value.currentIndex = value
    }
  },
  get isReady() {
    return isCarouselReady.value && !!carousel3dRef.value
  }
})

function selectProject(id) {
  emits('select', id)
}

function onAfterSlideChange(index) {
  emits('update:activeIndex', index)
}

watch(
  () => props.activeIndex,
  async (newIndex) => {
    await nextTick()
    if (carousel3dRef.value) {
      if (typeof carousel3dRef.value.goToSlide === 'function') {
        carousel3dRef.value.goToSlide(newIndex)
      }
      if (carousel3dRef.value.currentIndex !== undefined) {
        carousel3dRef.value.currentIndex = newIndex
      }
    }
  }
)

onMounted(async () => {
  await nextTick()
  // Wait a bit longer for the carousel to fully initialize
  setTimeout(async () => {
    if (carousel3dRef.value) {
      isCarouselReady.value = true
      // Emit that carousel ready
      emits('carousel-ready')
      // Force initial position if activeIndex is not 0
      if (props.activeIndex > 0) {
        if (typeof carousel3dRef.value.goToSlide === 'function') {
          carousel3dRef.value.goToSlide(props.activeIndex)
        }
      }
    }
  }, 200) // Increased delay to ensure carousel is fully initialized
})
watch(
  () => props.activeIndex,
  async (newIndex, oldIndex) => {
    // Force carousel to update position when activeIndex changes
    if (isCarouselReady.value && carousel3dRef.value && newIndex !== oldIndex) {
      await nextTick()
      if (typeof carousel3dRef.value.goToSlide === 'function') {
        carousel3dRef.value.goToSlide(newIndex)
      }
      // try setting the currentIndex directly
      if (carousel3dRef.value.currentIndex !== undefined) {
        console.log(`:karussell_pferd: DEBUG: ProjectCarousel - Setting currentIndex to ${newIndex}`)
        carousel3dRef.value.currentIndex = newIndex
      }
    }
  },
  { immediate: false } // Don't run immediately, let onMounted handle initial positioning
)

</script>

<style scoped>
.project-selector {
  position: fixed;
  bottom: 1.4vh;
  background: #0061C3;
  padding: 10px 10px 0 10px;
  border-radius: 8px;
  width: 30vw;
  z-index: 4;
  height: 14.25vh;
  box-sizing: border-box;
}

.project-selector h3 {
  text-align: center;
  color: white;
  font-size: 16px;
  margin: 0 0 5px 0;
  text-transform: uppercase;
  font-weight: 600;
}

.distributed-view-mode .project-selector {
  left: 50%;
  transform: translateX(-50%);
}

.project-selector.grid-mode {
  position: relative;
  bottom: auto;
  width: 100%;
  height: 100%;
  z-index: auto;
  border-radius: 8px;
  padding: 10px;
}

.carousel-slide {
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
  overflow: hidden;
  border-radius: 5px;
  border: 2px solid transparent;
}

.carousel-3d-slide.current {
  border-color: white !important;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.8) !important;
}

.carousel-3d-container {
  padding: 0;
  overflow: visible;
  height: 120px !important;
}

.carousel-3d-controls {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  z-index: 10;
}

.carousel-3d-controls a {
  color: white !important;
  opacity: 0.9;
  background: rgba(0, 97, 195, 0.8);
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  border: 1px solid white;
  transition: all 0.2s ease;
  font-size: 18px;
  text-decoration: none;
}

.carousel-3d-controls a:hover {
  transform: scale(1.1);
  opacity: 1;
  background: rgba(0, 97, 195, 1);
}

.carousel-3d-controls .prev {
  left: 5px;
}

.carousel-3d-controls .next {
  right: 5px;
}

.project-slide {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.project-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 5px;
}

.project-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
