<template>
    <div :class="[top ? topPanel : sidePanel]">
        <div :class="[{ marked: selected }, { headerTop: top }, headerSide]" ref="title" :id="id">
            {{ project }}
            <div v-if="collapsed">
                <font-awesome-icon :icon="['fas', 'chevron-up']" height="40" width="40" />
            </div>
            <div v-else>
                <font-awesome-icon :icon="['fas', 'chevron-down']" height="40" width="40" />
            </div>
        </div>
        <div v-show="!selected">
            <button class="map-button" ref="button" :id="'button-' + [id]"> Auf der Karte anzeigen </button>
        </div>
        <div class="content" :class="[top ? topContent : sideContent]" ref="content" :id="'content-' + [id]">
            <div v-html="html"></div>
        </div>
    </div>
</template>

<script>
import interact from 'interactjs'

const regexPattern = /\/src\/projects\/([^\/]+)\/([^\/]+\.html)/i;
const replacementString = "$1";

const panels = import.meta.glob('@/projects/**/*.html', { query: '?raw', import: 'default' })

const lcKeys = Object.keys(panels).reduce(
    function (keys, k) {
        keys[k.replace(regexPattern, replacementString).toLowerCase()] = k;
        return keys
    }, {});

function getPanel(key) { return panels[lcKeys[key.toLowerCase()]] }

export default {
    name: "ProjectPanel",
    props: {
        project: String,
        file: String,
        id: String,
        top: Boolean,
        selected: Boolean
    },
    data() {
        return {
            collapsed: true,
            topPanel: "top-panel",
            sidePanel: "side-panel",
            topContent: "top-content",
            sideContent: "side-content",
            headerSide: "headerSide",
            template: this.file,
            html: "",
            name: this.project,
            idName: this.id,
        }
    },
    async mounted() {
        // Fill content with html template
        this.html = await getPanel(this.template)();
        // Make content collapsible on click
        let collapsible = this.$refs.title;
        let content = this.$refs.content;
        let button = this.$refs.button;
        interact(collapsible).on("tap", () => {
            if (content.style.display === "block") {
                content.style.display = "none";
                button.style.display = "none";
                this.collapsed = true;
            } else {
                content.style.display = "block";
                button.style.display = "block";
                this.collapsed = false;
            }
        });
        // Send message to parent when button is clicked
        interact(button).on("tap", () => this.sendMessage());
        // Initialize scroll interaction
        this.initInteract(content);
    },
    methods: {
        sendMessage() {
            this.$emit("mapSelected", this.name, this.idName);
        },
        initInteract() {
            interact.pointerMoveTolerance(2);
            const interactable = interact(".content");
            interactable.draggable({
                autoScroll: false,
                inertia: true,
                listeners: {
                    start: this.dragStartHandler,
                    move: this.dragMoveHandler,
                    end: this.dragMoveHandler
                }
            });
            interactable
                .on('dragmove dragend', this.dragMoveHandler)
                .gesturable({
                    enabled: true
                })
                .on('gesture', {
                    start: this.dragStartHandler,
                    move: this.dragMoveHandler,
                    end: this.dragMoveHandler
                });
        },
        dragStartHandler(e) {
            const node = e.target;
            if (node.id === "content-lower-left" || node.id === "content-upper-left" || node.id === "content-upper-right" || node.id === "content-lower-right") {
                node.interact_pos = {
                    left: node.scrollLeft,
                    top: node.scrollTop,
                    x: e.clientX,
                    y: e.clientY,
                };
            } else if (node.id === "content-top-right" || node.id === "content-top-left") {
                node.interact_pos = {
                    left: node.scrollLeft,
                    top: node.scrollTop,
                    x: e.clientX,
                    y: e.clientY,
                }
            }
        },
        dragMoveHandler(e) {
            const node = e.target;
            const dx = e.delta.x / 3;
            const dy = e.delta.y / 3;
            if (node.id === "content-lower-left" || node.id === "content-upper-left") {
                node.scrollLeft = node.scrollLeft + dy;
                node.scrollTop = node.scrollTop + dx;
            } else if (node.id === "content-lower-right" || node.id === "content-upper-right") {
                node.scrollLeft = node.scrollLeft - dy;
                node.scrollTop = node.scrollTop - dx;
            } else if (node.id === "content-top-right" || node.id === "content-top-left") {
                node.scrollTop = node.scrollTop + dy;
                node.scrollLeft = node.scrollLeft + dx;
            }
        }
    }
}
</script>

<style>
.side-panel {
    height: 18.5vw;
    position: relative;
}

.top-panel {
    height: 21vh;
}

.headerSide {
    background-color: rgb(0, 101, 189);
    color: aliceblue;
    font-size: 22px;
    padding-left: 12px;
    padding-top: 4px;
    padding-right: 5px;
    height: 4.6vw;
    width: 100%;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: space-between;
}

.headerTop {
    background-color: rgb(0, 101, 189);
    color: aliceblue;
    font-size: 22px;
    padding-left: 12px;
    padding-top: 4px;
    padding-right: 5px;
    height: 6.5vh;
    width: 100%;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: space-between;
}

.marked {
    background-color: rgb(227, 114, 34);
}

.map-button {
    background-color: rgb(227, 114, 34);
    color: aliceblue;
    font-size: 20px;
    width: fit-content;
    bottom: 12px;
    position: absolute;
    transform: translateX(-50%);
    left: 50%;
    display: none;
}

.content {
    overflow: auto;
    font-size: 16px;
    background-color: aliceblue;
    padding: 8px;
    box-shadow: 0 -10px 15px 0 rgba(0, 0, 0, 0.6);
    display: none;
    overflow-y: hidden;
    overflow-x: hidden;
}

.top-content {
    height: 14.5vh;
}

.side-content {
    height: 14vw;
}
</style>