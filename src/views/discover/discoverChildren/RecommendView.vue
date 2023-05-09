<template>
    <div class="recommendContainer">
        <div class="recommend">
            <!--轮播图-->
            <div class="carousel">
                <el-carousel :interval="4000" type="card" height="200px">
                    <el-carousel-item v-for="(item, index) in bannerData" :key="index">
                        <img :src="item.imageUrl" alt="" />
                    </el-carousel-item>
                </el-carousel>
            </div>
            <!-- 推荐歌单 -->
            <div class="recommendMusicList">
                <h2>推荐歌单<i class="iconfont icon-arrow-right-bold"></i></h2>
                <ListCard :listCardData="musicList"
                           @clickListCardItem="clickListCardItem"></ListCard>
            </div>
        </div>
    </div>
</template>

<script>
import ListCard from '@/components/listCard/ListCard.vue';

export default {
    name: 'RecommendView',
    components: { ListCard },
    data() {
        return {
            // 轮播图数据
            bannerData: [],
            // recommend页面显示的musicList
            musicList: [],
        }
    },
    methods: {
        // 请求轮播图数据
        async getBannerData() {
            let result = await this.$request("/banner");
            console.log("轮播图数据: ", result);
            this.bannerData = result.data.banners;
        },
        // 请求推荐歌单数据的前十个
        getMusicList() {
            this.$request("/personalized", { limit: 10 }).then((res) => {
                console.log("推荐歌单", res);
                this.musicList = res.data.result;
            });
        },
        // 点击歌单封面的回调
        clickListCardItem(id) {
            console.log(id);
        },
    },
    created() {
        this.getBannerData();
        this.getMusicList();
    }
}
</script>

<style scoped>
.recommendContainer {
  display: flex;
  justify-content: center;
}

.recommend {
  max-width: 1500px;
}

.carousel {
  width: 100%;
}

.el-carousel {
  margin: auto;
  width: 1080px;
}

.el-carousel__item {
  border-radius: 10px;
}

.el-carousel__item img {
  height: 100%;
}

.recommendMusicList {
  margin: 20px 10px;
}

.recommendMusicList h2 {
  color: #373737;
}

.icon-arrow-right-bold {
    font-size: 20px;
}
</style>