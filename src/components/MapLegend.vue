<template>
  <div class="map-legend">
    <h1 class="map-legend__header">Legend</h1>
    <div v-if="isLoading" class="map-legend__content loading-message">
      Loading layers...
    </div>
    <div v-else class="map-legend__content">
      <div
        v-for="group in processedLayers"
        :key="group.id"
        class="legend-group"
      >
        <strong>{{ group.name }}</strong>
        <ul>
          <template v-if="group.children && group.children.length > 0">
            <li
              v-for="child in group.children"
              :key="child.id"
              v-show="group.visible"
              class="legend-item"
            >
              <GeometryIcon :type="child.id" :color="getColor(child.id)" />
              <span>{{ child.type }}</span>
            </li>
          </template>
          <li v-else v-show="group.visible" class="legend-item-empty">
            <GeometryIcon type="unknown" :color="getColor('unknown')" />
            <span>(No features found)</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import GeometryIcon from './GeometryIcon.vue' // Make sure GeometryIcon.vue is in the same folder

const props = defineProps({
  project: String,
  layerInfo: {
    type: Array,
    default: () => []
  }
})

const processedLayers = ref([])
const isLoading = ref(true)

watch(
  () => props.layerInfo,
  async (newLayerInfo) => {
    // Log the props to ensure they are being received correctly
    console.log('MapLegend received props:', { project: props.project, layerInfo: newLayerInfo });

    if (!newLayerInfo || !newLayerInfo.length) {
      processedLayers.value = []
      isLoading.value = false
      return
    }

    isLoading.value = true

    const promises = newLayerInfo.map(async (layer) => {
      try {
        // Ensure the project prop is not empty before constructing the path
        if (!props.project) {
          throw new Error('The "project" prop is empty. Cannot construct file path.');
        }

        const filePath = `projects/${props.project}/${layer.id}`;
        console.log(`Attempting to fetch layer from: ${filePath}`);
        
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} for file ${filePath}`);
        }
        
        const geojsonData = await response.json();
        const uniqueFeatureTypes = new Map();

        if (geojsonData.features && geojsonData.features.length > 0) {
          for (const feature of geojsonData.features) {
            const geomType = feature.geometry?.type;
            if (geomType && !uniqueFeatureTypes.has(geomType)) {
              uniqueFeatureTypes.set(geomType, {
                id: geomType.toLowerCase(),
                type: geomType,
                visible: layer.visible,
              });
            }
          }
        } else {
          console.warn(`Layer "${layer.name}" (${filePath}) loaded but has no features.`);
        }
        
        return { ...layer, children: Array.from(uniqueFeatureTypes.values()) };
      } catch (error) {
        console.error(`Failed to process layer "${layer.name}" (${layer.id}):`, error);
        return { ...layer, children: [] };
      }
    });

    processedLayers.value = await Promise.all(promises);
    isLoading.value = false;
  },
  { immediate: true, deep: true }
);

function getColor(id) {
  if (!id) return '#888888';
  const lowerId = id.toLowerCase();
  if (lowerId.includes('flow') || lowerId.includes('line')) return '#ff6600';
  if (lowerId.includes('point')) return '#007cbf';
  if (lowerId.includes('polygon')) return '#6ecf68';
  return '#888888';
}
</script>

<style scoped>
.map-legend {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 30vw;
  max-width: 400px;
  max-height: 25vh;
  overflow: hidden;
  z-index: 10;
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  padding: 0;
}
.map-legend__header {
  background: var(--h1-background, rgb(0, 101, 189));
  color: aliceblue;
  font-size: 22px;
  font-weight: bold;
  padding: 0 12px;
  display: flex;
  align-items: center;
}
.map-legend__content {
  background: white;
  font-size: 14px;
  overflow-y: auto;
  flex: 1;
  padding: 10px 12px;
}
.loading-message {
  color: #777;
  font-style: italic;
}
.legend-group {
  margin-bottom: 0.7em;
}
.legend-group strong {
  display: block;
  margin-bottom: 0.3em;
}
.legend-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.legend-item {
  display: flex;
  align-items: center;
  padding-top: 5px;
}
.legend-item-empty {
  display: flex;
  align-items: center;
  padding-top: 5px;
  color: #888;
  font-style: italic;
}
</style>
