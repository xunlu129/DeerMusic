<template>
    <div class="discoverContainer">
        <NavBar @clickBarItem="clickBarItem" :navBarItem="navBarData" style="padding-left: 40px;"></NavBar>
        <router-view class="discover"></router-view>
    </div>
</template>

<script>
import NavBar from '@/components/navBar/NavBar.vue';

export default {
    name: 'DiscoverView',
    components: {
        NavBar
    },
    data() {
        return {
            navBarData: [
                { name: "个性推荐", path: "/discover/recommend" },
                { name: "歌单", path: "/discover/musiclist" },
                { name: "排行榜", path: "/discover/ranking" },
                { name: "歌手", path: "/discover/singer" },
            ],
        }
    },
    methods: {
        // 接收NavBar传过来的点击事件
        clickBarItem(path) {
            this.$router.push(path)
        },
    }
}
</script>

<style scoped>
.discoverContainer {
  overflow: hidden;
  padding: 0 !important;
}

.discover {
  margin: auto;
  overflow: scroll;
  height: calc(100vh - 219px);
  padding: 0 30px;
}
</style>