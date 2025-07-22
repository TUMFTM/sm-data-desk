<template>
    <button :class="{ active: isClicked }" :id="index">
        {{ name }}
    </button>
</template>

<script>
    import interact from 'interactjs';

    export default {
        name: "ProjectButton",
        props: {
            name: String,
            isClicked: Boolean,
            index: String,
        },
        data() {
            return {
                id: this.index
            }
        },
        methods: {
            sendMessage() {
                this.$emit("clickedButton");
            }
        },
        mounted: function() {
            let element = document.getElementById(this.id);
            interact(element).on("tap", () => this.sendMessage());
        }
    }
</script>

<style scoped>
    .active {
        background-color: rgb(245, 148, 59);
    }
    button {
        background-color: rgb(106, 117, 126);
        color: aliceblue;
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.2);
        z-index: 5;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        text-align: center;
        display: inline-block;
        transition-duration: 0.4s;
        cursor: pointer;
        padding: 10px;
        height: 6vh;
        min-width: 10vw;
        max-width: 10vw;
    }
</style>