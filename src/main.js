// main.js: Bootstraps the Vue application, router, and icon library

// Core imports
import { createApp } from 'vue'
import App from './App.vue'

// Router setup
import { createRouter, createWebHistory } from 'vue-router'

// Global stylesheet
import './assets/main.css'

// View components and map styles
import HomeView from '@/views/HomeView.vue'
import MapView from '@/views/MapView.vue'
import 'maplibre-gl/dist/maplibre-gl.css'

// FontAwesome core and component
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Icons to be used in the app
import {
    faChevronUp,
    faChevronDown,
    faCircleInfo,
    faMagnifyingGlassPlus,
    faMagnifyingGlassMinus,
    faCircle,
    faAngleLeft,
    faAngleRight,
    faHome,
    faLayerGroup,
    faTimes
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the FontAwesome library
library.add(
    faChevronUp,
    faChevronDown,
    faCircleInfo,
    faMagnifyingGlassPlus,
    faMagnifyingGlassMinus,
    faCircle,
    faAngleLeft,
    faAngleRight,
    faHome,
    faLayerGroup,
    faTimes
)

// Define application routes with components and transitions
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: HomeView,
            meta: { transition: 'zoom' }
        },
        {
            path: '/project/:id',
            name: 'Table',
            component: MapView,
            props: true,
            meta: { transition: 'zoom' }
        }
    ]
})

// Create the Vue app, register router and components, and mount to the DOM
createApp(App)
    .use(router)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')

// Output registered routes for debugging
console.log('router ready', router.getRoutes())
