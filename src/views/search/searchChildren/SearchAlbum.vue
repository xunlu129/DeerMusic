<template>
    <div class="searchAlbum">
        <ListCard :listCardData="searchAlbumList"
                   @clickListCardItem="clickListCardItem"></ListCard>
        <!-- 分页 -->
        <div class="page" v-if="searchAlbumList.length != 0">
            <el-pagination background
                           layout="prev, pager, next"
                           :total="albumCount"
                           :page-size="30"
                           :current-page="currentPage"
                           @current-change="pageChange"></el-pagination>
        </div>
    </div>
</template>

<script>
import ListCard from '@/components/listCard/ListCard.vue';

export default {
    name: "SearchAlbum",
    components: {
        ListCard,
    },
    data() {
        return {
            // 搜索到的歌手列表
            searchAlbumList: [],
            // 搜索到的歌手数量
            albumCount: 0,
            searchInfo: "",
            // 当前页数
            currentPage: 1,
        }
    },
    methods: {
        // 请求
        // 搜索相关专辑的回调
        async getSearchAlbum() {
            let res = await this.$request("/cloudsearch", {
                keywords: this.$route.params.id,
                offset: 30 * (this.currentPage - 1),
                type: 10,
            });
            console.log("搜索到的专辑: ", res);
            this.albumCount = res.data.result.albumCount;
            this.searchInfo = "找到 " + res.data.result.albumCount + " 张专辑";
            this.searchAlbumList = res.data.result.albums;
            this.$emit("getSearchInfo", this.searchInfo);
        },

        // 点击翻页的回调
        pageChange(page) {
            this.currentPage = page;
            this.searchAlbumList = [];
            this.getSearchAlbum();
        },

        // 点击卡片的回调
        // 跳转至albumDetail页面
        clickListCardItem(id) {
            console.log("专辑id: ", id);
        },
    },
    created() {
        this.getSearchAlbum();
    },
}
</script>

<style scoped>
.searchAlbum {
    margin: 0 20px;
}

.page {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 10px 0 40px 0;
}
</style>