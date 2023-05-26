<template>
    <div class="FavoriteAlbumContainer">
        <div class="FavoriteAlbum">
            <div v-if="count != 0">
                <div class="title">收藏的专辑({{ count }})</div>
                    <ListCard :listCardData="favoriteAlbumList" @clickListCardItem="clickListCardItem"></ListCard>
                </div>
            <div v-else class="tip"><div>暂无收藏专辑</div></div>
        </div>
    </div>
  </template>

<script>
import ListCard from '@/components/listCard/ListCard.vue';

export default {
    name: "FavoriteAlbum",
    components: {
        ListCard,
    },
    data() {
        return {
            favoriteAlbumList: [],
            count: 0,
        }
    },
    methods: {
        // 请求
        // 请求已收藏的专辑
        async getFavoriteAlbumList() {
            let timestamp = Date.parse(new Date());
            let res = await this.$request("/album/sublist", {
                limit: 1000,
                timestamp,
            });
            // console.log("收藏专辑详情: ", res);
            this.favoriteAlbumList = res.data.data;
            this.count = res.data.count;
            this.$store.commit("updateSubAlbumList", res.data.data);
        },

        // 事件
        // 点击卡片的事件
        clickListCardItem(id) {
            this.$router.push({ name: "albumDetail", params: { id } });
        },
    },
    created() {
        if (this.$store.state.subAlbumList == null) {
            this.getFavoriteAlbumList();
        } else {
            this.favoriteAlbumList = this.$store.state.subAlbumList;
            this.count = this.$store.state.subAlbumList.length;
        }
    },
    watch: {
        "$store.state.subAlbumList"(current) {
            this.favoriteAlbumList = current;
            this.count = current.length;
        },
    },
}
</script>

<style scoped>
.FavoriteAlbumContainer {
    display: flex;
    justify-content: center;
    padding: 0 30px;
}

.FavoriteAlbum {
    max-width: 1500px;
    width: 100%;
}

.title {
    color: rgb(34, 34, 34);
    margin: 0 0 20px;
}

.tip {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(34, 34, 34);
}
</style>