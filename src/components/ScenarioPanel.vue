<template>
    <!-- wrapper: gives the element its size + rotation -->
    <div :class="['panel-container', positionClass]">
        <!-- header -------------------------------------------------------------->
        <div :class="['panel__header', headerModClass, { marked: selected }]" ref="title">
            {{ title }}
            <font-awesome-icon :icon="collapsed ? ['fas', 'chevron-up'] : ['fas', 'chevron-down']" height="40"
                width="40" />
        </div>

        <!-- map‑select button -->
        <button v-show="!selected" class="panel__map-btn" ref="button">
            Auf der Karte anzeigen
        </button>

        <!-- html content ------------------------------------------------------->
        <div ref="content" class="panel__content" :class="contentModClass" v-html="html" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import interact from 'interactjs'

/* ------------------------------------------------------------------ props */
const props = defineProps({
    /** unique id of the scenario this panel belongs to           */ scenario: String,
    /** html fragment inside /panels/ folder                       */ htmlFile: String,
    /** header title                                               */ title: String,
    /** which edge: 'upper-left' | 'lower-left' | 'upper-right' |
     *  'lower-right' | 'top-left' | 'top-right'                   */ position: { type: String, default: 'upper-left' },
    /** is the scenario currently active?                          */ selected: Boolean
})
const emit = defineEmits(['mapSelected'])

/* --------------------------------------------------------- position logic */
const positionClass = computed(() => ({
    'upper-left': 'upper-left',
    'lower-left': 'lower-left',
    'upper-right': 'upper-right',
    'lower-right': 'lower-right',
    'top-left': 'top-left',
    'top-right': 'top-right'
}[props.position]))

const headerModClass = computed(() => /top-/.test(props.position)
    ? 'panel__header--top' : 'panel__header--side')

const contentModClass = computed(() => /top-/.test(props.position)
    ? 'panel__content--top' : 'panel__content--side')

/* --------------------------------------------------------- state + fetch */
const collapsed = ref(true)
const html = ref('')

async function fetchHtml() {
    try {
        // First attempt to fetch from project root
        const path = `/src/projects/${props.scenario}/${props.htmlFile || 'index.html'}`
        html.value = await fetch(path).then(r => r.text())
    } catch (error) {
        // Fallback to old location for backward compatibility
        console.warn(`Couldn't find HTML at project root, trying legacy path`)
        const legacyPath = `/src/projects/${props.scenario}/panels/${props.htmlFile || 'overview.html'}`
        html.value = await fetch(legacyPath).then(r => r.text())
    }
}

/* --------------------------------------------------------- refs & hooks */
const titleEl = ref(null)
const contentEl = ref(null)
const buttonEl = ref(null)

onMounted(async () => {
    await fetchHtml()

    // tap header → collapse/expand
    interact(titleEl.value).on('tap', () => {
        collapsed.value = !collapsed.value
        contentEl.value.style.display = collapsed.value ? 'none' : 'block'
        buttonEl.value.style.display = collapsed.value ? 'none' : 'block'
    })

    // “show on map” button
    interact(buttonEl.value).on('tap', () =>
        emit('mapSelected', props.scenario, props.htmlFile)
    )

    // drag to scroll
    interact(contentEl.value).draggable({
        inertia: true,
        listeners: {
            move(e) {
                contentEl.value.scrollLeft -= e.delta.x / 3
                contentEl.value.scrollTop -= e.delta.y / 3
            }
        }
    })
})
</script>

<style scoped>
/* ---------------------------------------------------------------- size & rotation wrappers */
.panel-container {
    position: fixed;
    z-index: 5;
}

.upper-left,
.lower-left,
.upper-right,
.lower-right {
    width: 35vh;
}

.top-left,
.top-right {
    width: 28vw;
}

.upper-left {
    bottom: 25vh;
    left: -0.85%;
    transform: rotate(90deg);
}

.lower-left {
    top: 3vh;
    left: -0.85%;
    transform: rotate(90deg);
}

.upper-right {
    bottom: 25vh;
    right: -0.85%;
    transform: rotate(-90deg);
}

.lower-right {
    top: 3vh;
    right: -0.85%;
    transform: rotate(-90deg);
}

.top-left {
    top: 0;
    left: 20%;
    transform: rotate(180deg);
}

.top-right {
    top: 0;
    left: 52%;
    transform: rotate(180deg);
}

/* ---------------------------------------------------------------- header */
.panel__header {
    background: rgb(0, 101, 189);
    color: aliceblue;
    font-size: 22px;
    padding: 4px 5px 0 12px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    position: absolute;
    bottom: 0;
}

.panel__header--side {
    height: 4.6vw;
}

.panel__header--top {
    height: 6.5vh;
}

.marked {
    background: rgb(227, 114, 34);
}

/* ---------------------------------------------------------------- button */
.panel__map-btn {
    background: rgb(227, 114, 34);
    color: aliceblue;
    font-size: 20px;
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: none;
    padding: 2px 8px;
}

/* ---------------------------------------------------------------- content */
.panel__content {
    background: aliceblue;
    overflow: auto;
    font-size: 16px;
    padding: 8px;
    box-shadow: 0 -10px 15px rgba(0, 0, 0, .6);
    display: none;
}

.panel__content--top {
    height: 14.5vh;
}

.panel__content--side {
    height: 14vw;
}
</style>