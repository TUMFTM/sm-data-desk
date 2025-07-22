<template>
    <div :class="[containerClass, 'custom-slider']">
        <div :class="[headerClass]"> {{ project }} </div>
        <div :class="[infoClass, 'interact-scrollable']" :id="idName">
            <div v-html="html" class="custom-html" @vue:updated="onHTMLMounted"></div>
                <apexchart id="apexchart" type="line" :options="chartOptions" :series="series" height="350px"></apexchart>
                <div class="panel-content-flex">
                <div class="panel-controls">
                    <h5>Jahreszeit</h5>
                    <div class="button-row">
                        <button
                            class="panel-button"
                            :class="{'active-toggle': season === 'winter'}"
                            @click="setSeason('winter')"
                        >Winter</button>
                        <button
                            class="panel-button"
                            :class="{'active-toggle': season === 'summer'}"
                            @click="setSeason('summer')"
                        >Sommer</button>
                    </div>
                    <div class="spacer"></div>
                    <h5>Ladestrategie</h5>
                    <div class="button-row">
                        <button
                            class="panel-button"
                            :class="{'active-toggle': strategy === 1}"
                            @click="setStrategy(1)"
                        >Normal</button>
                        <button
                            class="panel-button"
                            :class="{'active-toggle': strategy === 2}"
                            @click="setStrategy(2)"
                        >Gesteuert</button>
                        <button
                            class="panel-button"
                            :class="{'active-toggle': strategy === 3}"
                            @click="setStrategy(3)"
                        >Bidirektional</button>
                    </div>
                    <div class="spacer"></div>
                    <h5>Elektro-Lkw</h5>
                    <div class="button-row">
                        <button
                            class="panel-button"
                            :class="{'active-toggle': fleetSize === 1}"
                            @click="setFleetSize(1)"
                        >1</button>
                        <button
                            class="panel-button"
                            :class="{'active-toggle': fleetSize === 20}"
                            @click="setFleetSize(20)"
                        >20</button>
                        <button
                            class="panel-button"
                            :class="{'active-toggle': fleetSize === 30}"
                            @click="setFleetSize(30)"
                        >30</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ApexCharts from "vue3-apexcharts";
import interact from 'interactjs';
import { touchHandler } from '@/components/TouchInteraction';


const regexPattern = /\/src\/projects\/([^\/]+)\/([^\/]+\.html)/i;
const replacementString = "$1";

const panels = import.meta.glob('@/projects/**/*.html', { 'as': 'raw' })

const lcKeys = Object.keys(panels).reduce(
    function (keys, k) {
        keys[k.replace(regexPattern, replacementString).toLowerCase()] = k;
        return keys
    }, {});

    function getPanel(key) { 
    // First try to find a direct match
    if (lcKeys[key.toLowerCase()]) {
        return panels[lcKeys[key.toLowerCase()]];
    }
    
    // Otherwise find the first HTML file for this project
    const projectId = key.toLowerCase();
    const projectFiles = Object.keys(lcKeys).filter(k => 
        k.toLowerCase().startsWith(projectId) && k.toLowerCase().endsWith('.html')
    );
    
    if (projectFiles.length > 0) {
        return panels[lcKeys[projectFiles[0]]];
    }
    
    console.error(`No HTML file found for project: ${key}`);
    return () => Promise.resolve('<p>No content found</p>');
}

export default {
    name: "PanelContainer",
    components: {
        apexchart: ApexCharts
    },
    props: {
        top: Boolean,
        idName: String,
        project: String,
        file: String,
        splitMode: Boolean // New prop
    },
    data() {
        return {
            // Names of the corresponding css style classes
            topContainer: "container-top",
            sideContainer: "container-side",
            splitContainer: "container-split", // New container class
            topHeader: "header-top",
            sideHeader: "header-side",
            splitHeader: "header-split", // New header class
            topInfo: "info-frame-top",
            sideInfo: "info-frame-side",
            splitInfo: "info-frame-split", // New info frame class
            // Initialize the id and template of the specific information container
            id: this.idName,
            template: this.file,
            html: "",
            // Chart state
            season: 'winter',
            strategy: 1,
            fleetSize: 1,
            chartOptions: {
                colors: ["#f2e01d", "#4252c9", "#f2950a","#69fa97", "#aaaaaa", ],
                stroke: {
                  width: [2, 2, 2, 2, 3],
                  curve: 'smooth'
                },
                fill: {
                  opacity: [0.68, 0.08, .08, .08, 1]
                },
                dataLabels: {
                  enabled: false
                },
                tooltip: {
                  enabled: false,
                },
                chart: {
                  id: "vuechart-example",
                },
                xaxis: {
                  type: "datetime",
                },
                yaxis: {
                  labels: {
                    formatter: function (value) {
                      return value + " kW";
                    },
                    datetimeUTC: false,
                  },
                },
            },
            series: []
        }
    },
    computed: {
        // Compute classes based on props
        containerClass() {
            if (this.splitMode) return this.splitContainer;
            return this.top ? this.topContainer : this.sideContainer;
        },
        headerClass() {
            if (this.splitMode) return this.splitHeader;
            return this.top ? this.topHeader : this.sideHeader;
        },
        infoClass() {
            if (this.splitMode) return this.splitInfo;
            return this.top ? this.topInfo : this.sideInfo;
        }
    },
    async mounted() {
        try {
            if (this.template != null) {
                const panelFn = getPanel(this.template);
                if (typeof panelFn === 'function') {
                    this.html = await panelFn();
                } else {
                    console.error('panelFn is not a function:', panelFn);
                    this.html = "";
                }
            } else {
                this.html = "";
            }
        } catch (error) {
            console.error('Error loading panel:', error);
            this.html = "";
        }

        let element = document.getElementById(this.id);
        if (element) {
            this.initInteract(element);
        }
        // Load chart data after mount
        this.loadData();
    },
    methods: {
        initInteract() {
            touchHandler.addScroll(".interact-scrollable", this.scrollHandler);
            touchHandler.addTap('.button-tap', this.tapHandler);
            touchHandler.addTap('.button-tap-active', this.tapHandlerActive);
        },
        scrollHandler(action, target, delta, startEvent) {
        if (action == "scroll") {
            const dx = delta.x * 1.5;
            const dy = delta.y * 1.5;
            
            if (target.id == "left-frame") {
                target.scrollLeft = target.scrollLeft + dy;
                target.scrollTop = target.scrollTop + dx;
            } else if (target.id == "right-frame") {
                target.scrollLeft = target.scrollLeft - dy;
                target.scrollTop = target.scrollTop - dx;
            } else if (target.id == "top-frame") {
                target.scrollTop = target.scrollTop + dy;
                target.scrollLeft = target.scrollLeft + dx;
            } else if (target.id == "split-frame") {
                // Regular scrolling for split view (no rotation)
                target.scrollTop = target.scrollTop - dy;
                target.scrollLeft = target.scrollLeft - dx;
            }
        }
        },
        tapHandlerActive(action, target, event) {
            target.focus();
            target.click();
            target.classList.add('active');
            setTimeout(
                () => {
                    target.classList.remove('active');
                }, 10);
            event.preventDefault();
        },
        tapHandler(action, target, event) {
            if (event.type != "mouseup") {
                target.focus();
                target.click();
                event.stopPropagation();
                event.preventDefault();
            }
        },
        async onHTMLMounted(node) {
            for (const video of node.el.getElementsByClassName("video-js")) {
                videojs(video)
                // console.log(video)
            }
        },
        // --- Chart logic from trucks.vue ---
        loadData() {
            // Fetch the CSV data
            fetch("/src/projects/nefton/assets/data_example_share.csv")
                .then(response => response.text())
                .then(data => {
                    // Parse the CSV data
                    const rows = data.trim().split("\n");
                    // Extract timestamp and PV data based on filters
                    const timestamps = [];
                    const pvData = [];
                    const buildingData = [];
                    const chargingData = [];
                    const dischargingData = [];
                    const totalData = [];
                    const priceData = [];
                    // Column mappings
                    const chargingColMapping = { 1: 3, 10: 5, 20: 7, 30: 9 }
                    const dischargingColMapping = { 1: 4, 10: 6, 20: 8, 30: 10 }
                    // Skip the first row (header)
                    for (let i = 1; i < rows.length; i++) {
                        const columns = rows[i].split(",");
                        // Check if the row matches the filters
                        if (
                            columns[0] === this.season &&
                            parseInt(columns[2]) === this.strategy
                        ) {
                            timestamps.push(new Date(columns[1]).getTime());
                            buildingData.push(Number(columns[12]));
                            chargingData.push(Number(columns[chargingColMapping[this.fleetSize]])
                                              +Number(columns[12]));
                            pvData.push(-Number(columns[11]));
                            dischargingData.push(-Number(columns[dischargingColMapping[this.fleetSize]])
                                -Number(columns[11]));
                            totalData.push(
                                - Number(columns[11])
                                + Number(columns[12])
                                + Number(columns[chargingColMapping[this.fleetSize]])
                                - Number(columns[dischargingColMapping[this.fleetSize]]));
                            priceData.push(Number(columns[14]));
                        }
                    }
                    // Update chart data
                    this.series = [
                        {
                            name: "pv",
                            type: 'area',
                            data: timestamps.map((timestamp, index) => [timestamp, pvData[index]])
                        },
                        {
                            name: "building",
                            type: 'area',
                            data: timestamps.map((timestamp, index) => [timestamp, buildingData[index]])
                        },
                        {
                            name: "charging",
                            type: 'area',
                            data: timestamps.map((timestamp, index) => [timestamp, chargingData[index]])
                        },
                        {
                            name: "discharging",
                            type: 'area',
                            data: timestamps.map((timestamp, index) => [timestamp, dischargingData[index]])
                        },
                        {
                            name: "total",
                            type: 'line',
                            data: timestamps.map((timestamp, index) => [timestamp, totalData[index]])
                        }
                    ];
                })
                .catch(error => {
                    console.error("Error loading data:", error);
                });
        },
        setSeason(seasonValue) {
            this.season = seasonValue;
            this.loadData();
        },
        setStrategy(strategyValue) {
            this.strategy = strategyValue;
            this.loadData();
        },
        setFleetSize(fleetSizeValue) {
            this.fleetSize = fleetSizeValue;
            this.loadData();
        }
    }
}
</script>

<style scoped>
@import "@/assets/main.css";
.container-split {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: white;
    display: flex;
    flex-direction: column;
}

.header-split {
    background-color: rgb(0, 101, 189);
    color: aliceblue;
    font-size: 25px;
    font-weight: 600;
    height: 3rem;
    width: 100%;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.info-frame-split {
    background-color: rgb(255, 255, 255);
    flex: 1;
    overflow: auto;
    color: black;
    font-size: 18px;
    padding: 20px;
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    touch-action: pan-y; /* Enable vertical touch scrolling */
}

.panel-content-flex {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 2rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.panel-controls {
    min-width: 200px;
    display: flex;
    flex-direction: column;
}

.button-row {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.spacer {
    height: 20px;
}

.custom-html {
    overflow-x: hidden;
    touch-action: none;
    -ms-touch-action: none;
    margin-bottom: 1rem;
}
</style>
