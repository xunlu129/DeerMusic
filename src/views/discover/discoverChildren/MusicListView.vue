<template>
    <div class="musicListContainer">
        <div class="musicList">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
export default {
    name: "MusicList",
}
</script>

<style scoped>
.musicListContainer {
    display: flex;
    justify-content: center;
    width: 100%;
}

.musicList {
    max-width: 1500px;
    padding: 10px;
    width: 100%;
}
</style>