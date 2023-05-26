<template>
    <div class="favoritesContainer">
        <NavBar @clickBarItem="clickBarItem" :navBarItem="navBarData" style="padding-left: 40px;"></NavBar>
        <router-view class="favorites"></router-view>
    </div>
</template>

<script>
import NavBar from '@/components/navBar/NavBar.vue';

export default {
    name: "FavoritesView",
    components: {
        NavBar,
    },
    data() {
        return {
            navBarData: [
                { name: "专辑", path: "/favorites/favoriteAlbum" },
                { name: "歌手", path: "/favorites/favoriteSinger" },
                { name: "视频", path: "/favorites/favoriteVideo" },
            ]
        }
    },
    methods: {
        // 事件
        // 点击navbaritem的回调
        clickBarItem(path) {
            this.$router.push(path);
        },
    },
    created() {
        if (!this.$store.state.isLogin) {
            this.$message.error("收藏页面只有登录后才能访问哦!");
            this.$router.replace("/index");
        }
    },
}
</script>

<style scoped>
.favoritesContainer {
    padding: 0 !important;
    overflow-y: hidden;
}

.favorites {
    margin: auto;
    height: calc(100vh - 225px);
    overflow-y: scroll;
}
</style>