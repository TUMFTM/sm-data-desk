<template>
    <div :class="[containerClass, 'custom-slider']">
        <div :class="[headerClass]"> {{ project }} </div>
        <div :class="[infoClass, 'interact-scrollable']" :id="idName">
            <div v-html="html" style="overflow-x: hidden; touch-action: none; -ms-touch-action: none;"
                @vue:updated="onHTMLMounted"></div>
        </div>
    </div>
</template>

<script>

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

// Supported image extensions for path replacement
const imageExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'];

function replaceImagePaths(htmlContent, projectName) {
    let processedHtml = htmlContent;
    
    // Replace simple image references with public asset paths
    imageExtensions.forEach(ext => {
        // Match src="filename.ext" (simple filename only, no path)
        const regex = new RegExp(`src="([^"/\\\\]+\\${ext})"`, 'gi');
        processedHtml = processedHtml.replace(regex, `src="/project-assets/${projectName}/$1"`);
    });
    
    return processedHtml;
}

async function getPanel(key) { 
    // First try to find a direct match
    if (lcKeys[key.toLowerCase()]) {
        const panelFn = panels[lcKeys[key.toLowerCase()]];
        const htmlContent = await panelFn();
        return replaceImagePaths(htmlContent, key.toLowerCase());
    }
    
    // Otherwise find the first HTML file for this project
    const projectId = key.toLowerCase();
    const projectFiles = Object.keys(lcKeys).filter(k => 
        k.toLowerCase().startsWith(projectId) && k.toLowerCase().endsWith('.html')
    );
    
    if (projectFiles.length > 0) {
        const panelFn = panels[lcKeys[projectFiles[0]]];
        const htmlContent = await panelFn();
        return replaceImagePaths(htmlContent, projectId);
    }
    
    console.error(`No HTML file found for project: ${key}`);
    return '<p>No content found</p>';
}

export default {
    name: "PanelContainer",
    props: {
        top: Boolean,
        idName: String,
        project: String,
        file: String,
        splitMode: Boolean
    },
    data() {
        return {
            topContainer: "container-top",
            sideContainer: "container-side",
            splitContainer: "container-split",
            topHeader: "header-top",
            sideHeader: "header-side",
            splitHeader: "header-split",
            topInfo: "info-frame-top",
            sideInfo: "info-frame-side",
            splitInfo: "info-frame-split",
            id: this.idName,
            template: this.file,
            html: ""
        }
    },
    computed: {
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
                this.html = await getPanel(this.template);
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
                    target.scrollTop = target.scrollTop - dy;
                    target.scrollLeft = target.scrollLeft - dx;
                }
            }
        },
        tapHandlerActive(action, target, event) {
            target.focus();
            target.click();
            target.classList.add('active');
            setTimeout(() => {
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
            }
        }
    }
}
</script>

<style scoped>
.header-side {
    background-color: rgb(0, 101, 189);
    color: aliceblue;
    font-size: 24px;
    height: 2.8vh;
    text-align: center;
    font-size: 25px;
    font-weight: 600;
    padding-right: 10px;
    padding-top: 6px;
    font-family: 'Barlow', sans-serif;
    line-height: 28px;
    letter-spacing: 0.02em;
}

.header-top {
    background-color: rgb(0, 101, 189);
    color: aliceblue;
    font-size: 24px;
    height: 2.8vh;
    text-align: center;
    font-size: 25px;
    font-weight: 600;
    padding-right: 10px;
    padding-top: 6px;
    font-family: 'Barlow', sans-serif;
    line-height: 28px;
    letter-spacing: 0.02em;
}

.info-frame-side {
    background-color: rgb(255, 255, 255);
    color: black;
    font-size: 18px;
    overflow: auto;
    position: fixed;
    width: 100%;
    /* height: 18vw; */
    bottom: 0;
    top: 1.5vw;
    padding: 10px;
    overflow-x: hidden;
}

.info-frame-top {
    background-color: rgb(255, 255, 255);
    overflow: auto;
    position: fixed;
    color: black;
    font-size: 18px;
    width: 100%;
    height: 17.2vh;
    bottom: 0;
    top: 3vh;
    padding: 10px;
    overflow-x: hidden;
}
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
</style>