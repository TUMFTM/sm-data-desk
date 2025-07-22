<template>
  <!-- Main container for homepage content -->
  <div class="home-container">
    <!-- Background logo watermark -->
    <div class="logo-background">
      <img src="@/assets/smartie_logo.svg" alt="Logo" class="big-logo">
    </div>

    <!-- Page title -->
    <h1 class="home-title">Projects</h1>

    <!-- Grid of project cards -->
    <div class="projects-grid">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        :data-id="project.id"
        @click="openProject(project.id)"
      >
        <div class="project-image">
          <img :src="project.thumbnail" :alt="project.title">
        </div>
        <div class="project-info">
          <h2>{{ project.title }}</h2>
        </div>
      </div>
    </div>

    <!-- Selector for view modes -->
    <div class="view-mode-selector">
      <div class="view-mode-options">
        <button
          class="view-mode-btn"
          :class="{ active: viewMode === 'distributed' }"
          @click="setViewMode('distributed')"
        >
          <span class="view-icon distributed-icon"></span>
          <span>Distributed</span>
        </button>
        <button
          class="view-mode-btn"
          :class="{ active: viewMode === 'blocks' }"
          @click="setViewMode('blocks')"
        >
          <span class="view-icon blocks-icon"></span>
          <span>Blocks</span>
        </button>
      </div>
    </div>

    <!-- Table information component -->
    <TableInfo />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TableInfo from '@/components/MainView/DataTableInfo.vue'

// Persisted view mode state for layout preference
const viewMode = ref(localStorage.getItem('datentischViewMode') || 'distributed')

// Update view mode and save to localStorage
function setViewMode(mode) {
  viewMode.value = mode
  localStorage.setItem('datentischViewMode', mode)
}

// Dynamically import project metadata files
const metaFiles = import.meta.glob('@/projects/**/meta.json', { eager: true })

// Build a sorted array of project objects with id, title, and thumbnail URL
const projects = Object.entries(metaFiles)
  .map(([path, mod]) => {
    const id = path.split('/').slice(-2, -1)[0]
    return {
      id,
      title: mod.default?.title ?? id,
      thumbnail: new URL(`../projects/${id}/banner.png`, import.meta.url).href
    }
  })
  .sort((a, b) => a.id.localeCompare(b.id))

const router = useRouter()

// Navigate to project detail view
function openProject(id) {
  router.push({ name: 'Table', params: { id } })
}
</script>

<style>
.home-container {
  width: 100%;
  height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
  overflow-y: auto;
  background-color: #f0f2f5;
  background-image:
    radial-gradient(circle at 25px 25px, rgba(0, 97, 195, 0.05) 2%, transparent 2%),
    radial-gradient(circle at 75px 75px, rgba(0, 97, 195, 0.05) 2%, transparent 2%);
  background-size: 100px 100px;
}

.home-title {
  color: #0061C3;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: bold;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto 80px;
  z-index: 5;
}

.project-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  z-index: 5;
}

.project-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.project-image {
  height: 200px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-info {
  padding: 1.5rem;
}

.project-info h2 {
  margin: 0;
  color: #555555;
  font-size: 1.5rem;
  font-weight: bold;  
  text-align: center;
}

.view-mode-selector {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 12px;
  z-index: 100;
}

.view-mode-options {
  display: flex;
  gap: 12px;
}

.view-mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 180px;
}

.view-mode-btn.active {
  border-color: #0061C3;
  background: #f0f7ff;
}

.view-icon {
  width: 80px;
  height: 60px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  background: #f5f5f5;
}

.distributed-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Crect x='10' y='10' width='80' height='40' fill='%230061C3' opacity='0.2'/%3E%3Crect x='10' y='50' width='20' height='5' fill='%230061C3'/%3E%3Crect x='70' y='50' width='20' height='5' fill='%230061C3'/%3E%3Crect x='40' y='5' width='20' height='5' fill='%230061C3'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

.blocks-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Crect x='0' y='10' width='45' height='40' fill='%230061C3' opacity='0.7'/%3E%3Crect x='55' y='10' width='45' height='40' fill='%230061C3' opacity='0.2'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

.table-info-container {
  margin: 30px 0 80px;
}

.logo-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.big-logo {
  width: 180%;
  height: 180%;
  opacity: 0.08;
}
</style>