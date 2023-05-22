<template>
    <div class="searchMusicList">
        <ListCard :listCardData="searchMusicList"
                   @clickListCardItem="clickListCardItem"></ListCard>
        <!-- 分页 -->
        <div class="page" v-if="searchMusicList.length != 0">
            <el-pagination background
                           layout="prev, pager, next"
                           :total="musicListCount"
                           :page-size="30"
                           :current-page="currentPage"
                           @current-change="pageChange"></el-pagination>
        </div>
    </div>
</template>

<script>
import ListCard from '@/components/listCard/ListCard.vue';

export default {
    name: "SearchMusicList",
    components: {
        ListCard,
    },
    data() {
        return {
            // 搜索到的歌单列表
            searchMusicList: [],
            // 搜索到的歌单数量
            musicListCount: 0,
            searchInfo: "",
            // 当前页数
            currentPage: 1,
        }
    },
    methods: {
        // 请求
        // 搜索相关歌单的回调
        async getSearchMusicList() {
            let res = await this.$request("/cloudsearch", {
                keywords: this.$route.params.id,
                offset: 30 * (this.currentPage - 1),
                type: 1000,
            });
            console.log("搜索到的歌单: ", res);
            this.musicListCount = res.data.result.playlistCount;
            this.searchInfo = "找到 " + res.data.result.playlistCount + " 个歌单";
            this.searchMusicList = res.data.result.playlists;
            this.$emit("getSearchInfo", this.searchInfo);
        },

        // 点击翻页的回调
        pageChange(page) {
            this.currentPage = page;
            this.searchMusicList = [];
            this.getSearchMusicList();
        },

        // 点击卡片的回调
        // 跳转至musicListDetail页面
        clickListCardItem(id) {
            // console.log("歌单id: ", id);
            this.$router.push({ name: "musicListDetail", params: { id } });
        },
    },
    created() {
        this.getSearchMusicList();
    },
}
</script>

<style scoped>
.searchMusicList {
    margin: 0 20px;
}

.page {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 10px 0 40px 0;
}
</style>