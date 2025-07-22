<template>
    <div class="outer-info-container d-flex flex-column">
        <div class="info-title"> Unterstützer </div>
        <!-- <hr class="info-divider" /> -->
        <div class="info-content flex-fill">
            <slot></slot>
        </div>
    </div>
</template>

<script>

export default {
    name: "TableInfo"
}

</script>

<style>
.outer-info-container {
    background-color: #0061C3;
    border-radius: 5px;
    height: 14.25vh;
    width: 30.5vw;
    position: fixed;
    bottom: 1.4vh;
    right: 0.5vw;
    letter-spacing: 0.02em;
}


.info-title {
    width: 100%;
    height: 32px;
    color: aliceblue;
    text-align: right;
    font-size: 25px;
    font-weight: 600;
    padding-right: 10px;
    padding-top: 6px;
    font-family: 'Barlow', sans-serif;
    line-height: 28px;
    text-transform: uppercase;
}

.info-content {
    margin: 10px;
    background-color: white;
    overflow: hidden;
}
</style>