<script setup>
import { computed, ref, watch, onMounted, onUpdated, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import '@nanoandrew4/vue3-carousel-3d/dist/style.css'

import DefaultPanelContainer from '@/components/MainView/PanelContainer.vue'
import ZoomControl from '@/components/MainView/ZoomControl.vue'
import LayerControl from '@/components/LayerControl.vue'
import ProjectCarousel from '@/components/ProjectCarousel.vue'
import MapCanvas from '@/components/MapCanvas.vue'
import MapLegend from '@/components/MapLegend.vue'

// ----------------------------------------
// Import project metadata and custom panels
// ----------------------------------------

// Eagerly import all CustomPanelContainer.vue files in projects
const customPanelContainers = import.meta.glob(
  '@/projects/**/*PanelContainer.vue',
  { eager: true }
)

// Scan each project folder for meta.json (eagerly loaded)
const metaFiles = import.meta.glob('@/projects/**/meta.json', { eager: true })

// Default map settings (static configuration) https://docs.maptiler.com/sdk-js/examples/built-in-styles/
const mapSettings = {
  style: `https://api.maptiler.com/maps/a7411f7b-1ce4-4d46-91d3-829ee4b8ec7a/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`,
  //  style: `https://api.maptiler.com/maps/satellite/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`,
  //  style: `https://api.maptiler.com/maps/hybrid/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`,
  center: [11.576124, 48.137154],
  zoom: 11,
  minZoom: 10,
  maxZoom: 18,
  attributionControl: false
}

// ----------------------------------------
// Utilities: Custom container resolver
// ----------------------------------------
function useCustomContainer(componentName, fallback = DefaultPanelContainer) {
  return computed(() => {
    const project = activeScenario.value
    if (!project) return fallback

    // Vite's glob keys use "/" and are relative to /src
    const customPath = `/src/projects/${project}/${componentName}.vue`
    return customPanelContainers[customPath]
      ? customPanelContainers[customPath].default
      : fallback
  })
}

// ----------------------------------------
// Reactive state and computed properties
// ----------------------------------------
const router = useRouter()
const route = useRoute()

// View mode: 'distributed' or 'blocks', persisted to localStorage
const viewMode = ref(localStorage.getItem('datentischViewMode') || 'distributed')

// List of all projects: id, title, thumbnail
const projects = Object.entries(metaFiles)
  .map(([path, mod]) => {
    const id = path.split('/').slice(-2, -1)[0]
    return {
      id,
      title: mod.default?.title ?? id,
      // Vite-compatible asset path
      thumbnail: new URL(
        `../projects/${id}/banner.png`,
        import.meta.url
      ).href
    }
  })
  .sort((a, b) => a.id.localeCompare(b.id))

// Extract route-based project ID
const projectId = computed(() => route.params.id)

// Currently active scenario ID (string) and index (number)
const activeScenario = ref(null)
const activeIdx = ref(0)

// Computed title and file name for the scenario panels
const scenarioTitle = computed(() => projects[activeIdx.value]?.title || '')
const scenarioFile = computed(() => activeScenario.value)

// Carousel reactive index and ref
const carouselActiveIndex = ref(null)
const carousel3dRef = ref(null)

// Map reference and layer info
const mapRef = ref(null)
const mapLayers = ref([])

// Derived flag: whether to show map alone (no left/right panels)
const BlockLeftPanelContainer = useCustomContainer(
  'BlockLeftPanelContainer',
  false
)
const BlockRightPanelContainer = useCustomContainer(
  'BlockRightPanelContainer',
  false
)
const isMapOnly = computed(() => {
  return !BlockLeftPanelContainer.value && !BlockRightPanelContainer.value
})
const isOneContainer = computed(() => {
  return !BlockLeftPanelContainer.value !== !BlockRightPanelContainer.value
})

// Banner style for blocks view
const bannerStyle = computed(() => ({
  backgroundColor: '#f5f5f5', // or any consistent color
  minHeight: '100vh',
  padding: '2rem'
}))


// Main panel container (custom or default)
const MainPanelContainer = useCustomContainer(
  'CustomPanelContainer',
  DefaultPanelContainer
)

// ----------------------------------------
// Functions: Navigation, view mode, projects
// ----------------------------------------
function goHome() {
  router.push({ name: 'Home' })
}

function setViewMode(mode) {
  viewMode.value = mode
  localStorage.setItem('datentischViewMode', mode)
}

function findProjectIndex(id) {
  return projects.findIndex((project) => project.id === id)
}

function selectScenario(id) {
  const i = findProjectIndex(id)
  if (i !== -1) {
    activeIdx.value = i
    carouselActiveIndex.value = i
    activeScenario.value = id
  }
}

function prevScenario() {
  activeIdx.value = (activeIdx.value - 1 + projects.length) % projects.length
}

function nextScenario() {
  activeIdx.value = (activeIdx.value + 1) % projects.length
}

function updateCarouselPosition(index) {
  if (!carousel3dRef.value) return

  if (typeof carousel3dRef.value.goToSlide === 'function') {
    carousel3dRef.value.goToSlide(index)
  }
  if (carousel3dRef.value.currentIndex !== undefined) {
    carousel3dRef.value.currentIndex = index
  }
}

function updateActiveProject(index) {
  if (index === activeIdx.value) return

  activeIdx.value = index
  const projectId = projects[index].id
  activeScenario.value = projectId

  router.replace(
    {
      name: 'Table',
      params: { id: projectId }
    },
    { replace: true }
  )

  if (mapRef.value && typeof mapRef.value.loadScenario === 'function') {
    mapRef.value
      .loadScenario(projectId)
      .then(() => {
        console.log('Loaded scenario from carousel:', projectId)
      })
      .catch((err) => {
        console.error('Error loading scenario:', err)
      })
  }
}

// ----------------------------------------
// Functions: Map and layer control
// ----------------------------------------
function updateLayerInfo() {
  if (mapRef.value && mapRef.value.getLayerInfo) {
    console.log('Updating layer info from map')
    mapLayers.value = mapRef.value.getLayerInfo() || []
    console.log('Updated layer info:', mapLayers.value)
  } else {
    console.warn(
      'Cannot update layer info – map reference or getLayerInfo missing'
    )
  }
}

function handleMapReady() {
  console.log('Map is ready, updating layer info')
  updateLayerInfo()
}

function handleCarouselReady() {
  console.log('Carousel ready event received')
  if (carouselActiveIndex.value > 0) {
    setTimeout(() => {
      updateCarouselPosition(carouselActiveIndex.value)
      }, 150)
  }
}

function handleLayerToggle(layerId) {
  if (mapRef.value) {
    mapRef.value.toggleLayer(layerId)
    mapLayers.value = mapRef.value.getLayerInfo() || []
  }
}

// ----------------------------------------
// Touch-swipe interaction for scenarios
// ----------------------------------------
function applyTouchInteraction(node) {
  let startX = null
  let startY = null
  let hasMoved = false

  node.el.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches && e.touches.length > 0) {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
        hasMoved = false
        console.log('Touch start:', startX, startY)
      }
    },
    { passive: true }
  )

  node.el.addEventListener(
    'touchmove',
    (e) => {
      if (
        startX === null ||
        startY === null ||
        !e.touches ||
        e.touches.length === 0
      )
        return

      const dx = startX - e.touches[0].clientX
      const dy = startY - e.touches[0].clientY

      // Ignore vertical scrolls
      if (Math.abs(dy) > Math.abs(dx)) return

      if (Math.abs(dx) > 5) {
        hasMoved = true
      }
    },
    { passive: true }
  )

  node.el.addEventListener(
    'touchend',
    (e) => {
      if (hasMoved && startX !== null && startY !== null) {
        const endX = e.changedTouches[0].clientX
        const dx = startX - endX
        const minSwipe = 50

        if (Math.abs(dx) >= minSwipe) {
          if (dx > 0) {
            nextScenario()
            console.log('Swiped left, next scenario:', activeScenario.value)
          } else {
            prevScenario()
            console.log('Swiped right, previous scenario:', activeScenario.value)
          }
          e.preventDefault()
        }
      }
      startX = null
      startY = null
      hasMoved = false
    }
  )
}

// ----------------------------------------
// Watchers: Persist view mode and synchronize state
// ----------------------------------------
watch(viewMode, (newMode) => {
  localStorage.setItem('datentischViewMode', newMode)
  console.log('View mode changed to:', newMode)
})

// When the route param "id" changes, update carousel and active index
watch(
  () => route.params.id,
  async (newProjectId) => {
    if (!newProjectId) return

    const idx = findProjectIndex(newProjectId)
    if (idx !== -1) {
      carouselActiveIndex.value = idx
      activeIdx.value = idx

      await nextTick()
      updateCarouselPosition(idx)
    }
  },
  { immediate: true }
)

// Whenever activeIdx changes: load scenario on map and log
watch(activeIdx, (newIndex) => {
  const projectId = projects[newIndex]?.id
  if (mapRef.value?.loadScenario && projectId) {
    mapRef.value.loadScenario(projectId).catch((err) => {
      console.error('Error loading scenario:', err)
    })
  }
  console.log('activeIdx changed:', newIndex)
  console.log('New active scenario:', activeScenario.value)
  console.log('New title:', scenarioTitle.value)
  console.log('New panel file:', scenarioFile.value)
})

// Whenever activeScenario changes: wait for mapRef then load scenario
watch(
  activeScenario,
  async (newScenario) => {
    console.log(`Watch triggered: Loading scenario ${newScenario}`)
    await nextTick()

    if (!mapRef.value) {
      console.error('Map reference is not available yet')
      return
    }
    if (typeof mapRef.value.loadScenario === 'function') {
      try {
        await mapRef.value.loadScenario(newScenario)
      } catch (err) {
        console.error('Error loading scenario:', err)
      }
    } else {
      console.warn('loadScenario method not found on map reference')
    }
  },
  { immediate: false }
)

// After activeScenario updates, update layers
watch(
  activeScenario,
  async () => {
    await nextTick()
    updateLayerInfo()
  }
)

// ----------------------------------------
// Lifecycle: mounted and updated hooks
// ----------------------------------------
onMounted(async () => {
  console.log('MapView mounted with route params:', route.params)

  if (route.params.id) {
    const idx = findProjectIndex(route.params.id)
    console.log('Found project index:', idx, 'for ID:', route.params.id)

    if (idx !== -1) {
      activeIdx.value = idx
      carouselActiveIndex.value = idx
      activeScenario.value = route.params.id
      console.log(
        'Initialized with project:',
        route.params.id,
        'at index:',
        idx
      )

      await nextTick()
      updateCarouselPosition(idx)
    } else if (projects.length > 0) {
      activeScenario.value = projects[0].id
      console.log('Fallback to first project:', projects[0].id)
    }
  } else if (projects.length > 0) {
    activeScenario.value = projects[0].id
    console.log('No project in route, using first:', projects[0].id)
  }
})

onUpdated(() => {
  console.log('MapView component updated')
})

// ----------------------------------------
// Logging available projects on startup
// ----------------------------------------
console.log('Found projects:')
for (const [path, mod] of Object.entries(metaFiles)) {
  const id = path.split('/').slice(-2, -1)[0]
  console.log(`  ${id}: ${mod.default?.title ?? id}`)
}
</script>

<template>
  <main
    :class="{
      'distributed-view-mode': viewMode === 'distributed',
      'blocks-view-mode': viewMode === 'blocks'
    }"
  >
    <div class="home-button top-right" @click="goHome">
      <font-awesome-icon :icon="['fas', 'home']" />
    </div>
    <div class="home-button bottom-left" @click="goHome">
      <font-awesome-icon :icon="['fas', 'home']" />
    </div>

    <!-- Distributed View Mode -->
    <template v-if="viewMode === 'distributed'">
      <div class="rotate-left">
        <MainPanelContainer
          :key="`left-${activeScenario}`"
          :project="scenarioTitle"
          :file="scenarioFile"
          idName="left-frame"
          :top="false"
        />
      </div>
      <div class="rotate-right">
        <MainPanelContainer
          :key="`right-${activeScenario}`"
          :project="scenarioTitle"
          :file="scenarioFile"
          idName="right-frame"
          :top="false"
        />
      </div>
      <div class="rotate-top">
        <MainPanelContainer
          :key="`top-${activeScenario}`"
          :project="scenarioTitle"
          :file="scenarioFile"
          idName="top-frame"
          :top="true"
        />
      </div>
      <ProjectCarousel
        ref="carousel3dRef"
        :projects="projects"
        :activeIndex="carouselActiveIndex"
        @update:activeIndex="updateActiveProject"
        @select="selectScenario"
        @carousel-ready="handleCarouselReady"
      />
      <MapCanvas
        ref="mapRef"
        :map-settings="mapSettings"
        :initial-scenario="scenarioTitle"
        :view-mode="viewMode"
        @map-ready="handleMapReady"
      />
    </template>

    <!-- Blocks View Mode -->
    <template v-else-if="viewMode === 'blocks'">
      <div class="blocks-wrapper" :style="bannerStyle">
        <!-- Map-only layout -->
        <div v-if="isMapOnly" class="grid-container map-only">
          <div class="block block-description" v-if="scenarioFile">
            <MainPanelContainer
              :key="`split-${activeScenario}`"
              :project="scenarioTitle"
              :file="scenarioFile"
              idName="split-frame"
              :top="false"
              split-mode
            />
          </div>
          <div class="block block-map">
            <div class="map-block-wrapper">
              <MapCanvas
                ref="mapRef"
                :map-settings="mapSettings"
                :initial-scenario="scenarioTitle"
                :view-mode="viewMode"
                @map-ready="handleMapReady"
              />
              <!-- Legend positioned top-left -->
              <MapLegend
                class="map-legend-top-left"
                :project="projectId"
                :layer-info="mapLayers"
              />
            </div>
          </div>
          <ProjectCarousel
            ref="carousel3dRef"
            :projects="projects"
            :activeIndex="carouselActiveIndex"
            :useGrid="true"
            @update:activeIndex="updateActiveProject"
            @select="selectScenario"
            @carousel-ready="handleCarouselReady"
          />
        </div>

        <!-- Mixed panels + map layout -->
        <div v-else-if="BlockLeftPanelContainer && BlockRightPanelContainer" class="grid-container">
          <div class="block block-description" v-if="scenarioFile">
            <MainPanelContainer
              :key="`split-${activeScenario}`"
              :project="scenarioTitle"
              :file="scenarioFile"
              idName="split-frame"
              :top="false"
              split-mode
            />
          </div>
          <div class="block block-graphic1" v-if="BlockLeftPanelContainer">
            <BlockLeftPanelContainer
              :key="`split-${activeScenario}`"
              :project="scenarioTitle"
              :file="scenarioFile"
              idName="split-frame"
              :top="false"
              split-mode
            />
          </div>
          <div class="block block-graphic2" v-if="BlockRightPanelContainer">
            <BlockRightPanelContainer
              :key="`split-${activeScenario}`"
              :project="scenarioTitle"
              :file="scenarioFile"
              idName="split-frame"
              :top="false"
              split-mode
            />
          </div>
          <div class="block block-map">
            <div class="map-block-wrapper">
              <MapCanvas
                ref="mapRef"
                :map-settings="mapSettings"
                :initial-scenario="scenarioTitle"
                :view-mode="viewMode"
                @map-ready="handleMapReady"
              />
            </div>
          </div>
          <ProjectCarousel
            ref="carousel3dRef"
            :projects="projects"
            :activeIndex="carouselActiveIndex"
            :useGrid="true"
            @update:activeIndex="updateActiveProject"
            @select="selectScenario"
            @carousel-ready="handleCarouselReady"
          />
        </div>

        <!-- One panel + map layout -->
        <div v-else-if="isOneContainer" class="grid-container one-panel-map">
          <div class="block block-description" v-if="scenarioFile">
            <MainPanelContainer
              :key="`split-${activeScenario}`"
              :project="scenarioTitle"
              :file="scenarioFile"
              idName="split-frame"
              :top="false"
              split-mode
            />
          </div>

          <div class="block block-graphic1" v-if="BlockLeftPanelContainer">
            <BlockLeftPanelContainer
              :key="`split-${activeScenario}`"
              :project="scenarioTitle"
              :file="scenarioFile"
              idName="split-frame"
              :top="false"
              split-mode
            />
          </div>
          <div class="block block-graphic2" v-else>
            <BlockRightPanelContainer
              :key="`split-${activeScenario}`"
              :project="scenarioTitle"
              :file="scenarioFile"
              idName="split-frame"
              :top="false"
              split-mode
            />
          </div>

          <div class="block block-map">
            <div class="map-block-wrapper">
              <MapCanvas
                ref="mapRef"
                :map-settings="mapSettings"
                :initial-scenario="scenarioTitle"
                :view-mode="viewMode"
                @map-ready="handleMapReady"
              />
            </div>
          </div>

          <ProjectCarousel
            ref="carousel3dRef"
            :projects="projects"
            :activeIndex="carouselActiveIndex"
            :useGrid="true"
            @update:activeIndex="updateActiveProject"
            @select="selectScenario"
            @carousel-ready="handleCarouselReady"
          />
        </div>

      </div>
    </template>

    <!-- Loading indicator when scenario not ready -->
    <div v-if="!activeScenario" class="map-loading">
      <div class="map-loading-spinner"></div>
      <div class="map-loading-text">Loading map...</div>
    </div>

    <!-- Zoom control (visible when not in blocks view) -->
    <div
      v-if="viewMode !== 'blocks'"
      class="top-zoom"
      :class="{ 'split-view-zoom': viewMode === 'split' }"
    >
      <ZoomControl />
    </div>

    <!-- Layer control -->
    <div class="layer-control-container">
      <LayerControl :layers="mapLayers" @toggle-layer="handleLayerToggle" />
    </div>
  </main>
</template>

<style>
@import '@/assets/main.css';

/* Global Layout Styles */
.top-zoom {
  width: 60vw;
  height: fit-content;
  position: fixed;
  left: 50%;
  top: 1vh;
  transform: translateX(-50%) rotate(180deg);
  display: flex;
  justify-content: space-between;
}

.outer-slideshow-container {
  height: 15.4%;
  width: 36vw;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #0061c3;
  border-radius: 8px;
  z-index: 4;
}

.slideshow-title {
  width: 100%;
  height: 32px;
  font-size: 25px;
  font-weight: 600;
  padding-top: 6px;
  text-align: center;
  background: #0061c3;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.slideshow-content {
  margin: 10px;
  background: #fff;
  overflow: hidden;
  height: calc(100% - 0px);
  position: relative;
}

.fill {
  width: 100%;
  height: 100%;
  background-position: center;
  background-size: cover;
}

.item,
.active,
.carousel-inner {
  height: 100%;
}

.home-button {
  position: fixed;
  width: 50px;
  height: 50px;
  background: #0061c3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  color: white;
  font-size: 24px;
  transition: transform 0.2s, background-color 0.2s;
}

.home-button:hover {
  transform: scale(1.1);
  background-color: #0052a8;
}

.home-button.top-right {
  top: 20px;
  right: 20px;
  transform: rotate(180deg);
}

.home-button.top-right:hover {
  transform: scale(1.1) rotate(180deg);
}

.home-button.bottom-left {
  bottom: 20px;
  left: 20px;
}

.layer-control-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.map-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.map-loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 97, 195, 0.2);
  border-top: 5px solid #0061c3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.map-loading-text {
  margin-top: 15px;
  font-size: 18px;
  color: #0061c3;
}

.blocks-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-container {
  display: grid;
  width: 100%;
  height: 100%;
  margin-bottom: 3rem;
  gap: 1rem;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 28% 28% 28% 16%;
  grid-template-areas:
    'description graphic1 graphic2'
    'description graphic1 graphic2'
    'description map map'
    'carousel map map';
  padding: 1rem;
  box-sizing: border-box;
}

.grid-container.one-panel-map {
  display: grid;
  width: 100%;
  height: 100%;
  margin-bottom: 3rem;
  gap: 1rem;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 28% 28% 28% 16%;
  grid-template-areas:
    'description graphic graphic'
    'description graphic graphic'
    'description map map'
    'carousel map map';
  padding: 1rem;
  box-sizing: border-box;
}

.map-only {
  grid-template-areas:
    'description map map'
    'description map map'
    'description map map'
    'carousel map map';
}

.block-map--full {
  grid-area: map;
  width: 100%;
  height: 100%;
  background: rgba(246, 183, 212, 0.85);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.block {
  background: rgba(216, 215, 215, 0.85);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.block-description {
  grid-area: description;
}

.description-content {
  padding: 1rem;
  overflow: auto;
  height: 100%;
}

.block-graphic1 {
  grid-area: graphic1;
  height: auto;
}

.block-graphic2 {
  grid-area: graphic2;
  height: auto;
}

.grid-container.one-panel-map .block-graphic1,
.grid-container.one-panel-map .block-graphic2 {
  grid-area: graphic;
  height: auto;
}

.graphic-content {
  padding: 1rem;
  text-align: center;
  height: 100%;
  overflow: auto;
}

.block-map {
  grid-area: map;
  overflow: hidden;
}

.map-block-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container :deep(.maplibregl-map) {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
}

.map-legend-top-left {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 10;
  width: 100%;          
  max-width: 400px;       
  max-height: 20%;        
  overflow-y: auto;
}

</style>
