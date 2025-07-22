<template>
    <div class="zoom-control">
        <font-awesome-icon class="zoom-in" :icon="['fas', 'magnifying-glass-plus']" height="35" width="35" />
        <font-awesome-icon class="zoom-out" :icon="['fas', 'magnifying-glass-minus']" height="35" width="35" />
    </div>
    <div class="zoom-control">
        <font-awesome-icon class="zoom-in" :icon="['fas', 'magnifying-glass-plus']" height="35" width="35" />
        <font-awesome-icon class="zoom-out" :icon="['fas', 'magnifying-glass-minus']" height="35" width="35" />
    </div>
</template>

<script>
export default {
    name: "ZoomControl",
}
</script>

<style>
.zoom-control {
    z-index: 5;
    cursor: pointer;
    pointer-events: all;
    background-color: aliceblue;
    color: rgb(106, 117, 126);
    width: 4.5vw;
    padding: 8px;
    display: flex;
    justify-content: space-between;
    border-radius: 12px;
}
</style>