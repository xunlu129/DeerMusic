<template>
    <div class="searchVideo">

        <!-- 分页 -->
        <div class="page" v-if="searchVideoList.length != 0">
            <el-pagination background
                           layout="prev, pager, next"
                           :total="videoCount"
                           :page-size="30"
                           :current-page="currentPage"
                           @current-change="pageChange"></el-pagination>
        </div>
    </div>
</template>

<script>
export default {
    name: "SearchVideo",
    data() {
        return {
            // 搜索到的视频列表
            searchVideoList: [],
            // 搜索到的视频数量
            videoCount: 0,
            searchInfo: "",
            // 当前页数
            currentPage: 1,
        }
    },
    methods: {
        // 请求
        // 搜索相关视频的回调
        async getSearchVideo() {
            let res = await this.$request("/cloudsearch", {
                keywords: this.$route.params.id,
                offset: 30 * (this.currentPage - 1),
                type: 1014,
            });
            console.log("搜索到的视频: ", res);
            this.videoCount = res.data.result.videoCount;
            this.searchInfo = "找到 " + res.data.result.videoCount + " 个视频";
            this.searchVideoList = res.data.result.videos;
            this.$emit("getSearchInfo", this.searchInfo);
        },

        // 点击翻页的回调
        pageChange(page) {
            this.currentPage = page;
            this.searchVideoList = [];
            this.getSearchSinger();
        },
    },
    created() {
        this.getSearchVideo();
    },
}
</script>

<style scoped>
.searchVideo {
    margin: 0 20px;
}

.page {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 10px 0 40px 0;
}
</style>