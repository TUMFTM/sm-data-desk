<template>
    <div class="outer-container d-flex flex-column">
        <div class="legend-title">Legende</div>
        <!-- <hr class="info-divider" /> -->
        <div class="legend-content flex-fill h-100">
            <slot></slot>
        </div>
    </div>
</template>

<script>

export default {
    name: "MapLegend",
    props: {
        title: String
    },
    data() {
        return {
        }
    },
    async mounted() {
    }
}

</script>

<style>
.outer-container {
    background-color: #0061C3;
    border-radius: 5px;
    height: 14.25vh;
    width: 30.5vw;
    position: fixed;
    bottom: 1.4vh;
    left: 0.5vw;
    letter-spacing: 0.02em;
}

.legend-title {
    width: 100%;
    height: 32px;
    color: aliceblue;
    text-align: left;
    font-size: 25px;
    font-weight: 600;
    padding-left: 10px;
    padding-top: 6px;
    font-family: 'Barlow', sans-serif;
    line-height: 28px;
    text-transform: uppercase;
}

.legend-content {
    margin: 10px;
    background-color: white;
    overflow: hidden;
}
</style>