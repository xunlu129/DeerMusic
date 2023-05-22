<template>
    <div class="searchSinger">
        <ListCard :listCardData="searchSingerList"
                   @clickListCardItem="clickListCardItem"></ListCard>
        <!-- 分页 -->
        <div class="page" v-if="searchSingerList.length != 0">
            <el-pagination background
                           layout="prev, pager, next"
                           :total="singerCount"
                           :page-size="30"
                           :current-page="currentPage"
                           @current-change="pageChange"></el-pagination>
        </div>
    </div>
</template>

<script>
import ListCard from '@/components/listCard/ListCard.vue';

export default {
    name: "SearchSinger",
    components: {
        ListCard,
    },
    data() {
        return {
            // 搜索到的歌手列表
            searchSingerList: [],
            // 搜索到的歌手数量
            singerCount: 0,
            searchInfo: "",
            // 当前页数
            currentPage: 1,
        }
    },
    methods: {
        // 请求
        // 搜索相关歌手的回调
        async getSearchSinger() {
            let res = await this.$request("/cloudsearch", {
                keywords: this.$route.params.id,
                offset: 30 * (this.currentPage - 1),
                type: 100,
            });
            console.log("搜索到的歌手: ", res);
            this.singerCount = res.data.result.artistCount;
            this.searchInfo = "找到 " + res.data.result.artistCount + " 位歌手";
            this.searchSingerList = res.data.result.artists;
            this.$emit("getSearchInfo", this.searchInfo);
        },

        // 点击翻页的回调
        pageChange(page) {
            this.currentPage = page;
            this.searchSingerList = [];
            this.getSearchSinger();
        },

        // 点击卡片的回调
        // 跳转至singerDetail页面
        clickListCardItem(id) {
            console.log("歌手id: ", id);
        },
    },
    created() {
        this.getSearchSinger();
    },
}
</script>

<style scoped>
.searchSinger {
    margin: 0 20px;
}

.page {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 10px 0 40px 0;
}
</style>