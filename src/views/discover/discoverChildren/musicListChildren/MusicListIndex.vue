<template>
    <div class="musicListIndex">
        <!--精选歌单入口展示-->
        <div class="highqualityEntry">
            <img :src="theFirstOfHighquality.coverImgUrl" alt="" class="backgroundImg"/>
            <div class="cover">
                <img :src="theFirstOfHighquality.coverImgUrl" alt="" />
            </div>
            <div class="EntryInfo">
                <!--加上v-if等待图片加载后再显示“精品歌单”-->
                <div class="tag" v-if="theFirstOfHighquality.coverImgUrl"><i class="iconfont icon-huangguan"></i> 精品歌单</div>
                <div class="name">{{ theFirstOfHighquality.name }}</div>
                <div class="desc">{{ theFirstOfHighquality.copywriter }}</div>
            </div>
        </div>
        <!--歌单列表分类导航栏-->
        <div class="musicListNavBar">
            <div class="left">
                <SortBox :sortList="sortList"
                         :currentTag="currentTag"
                         @getSortList="getSortList"
                         @clickSortBoxItem="clickSortBoxItem"></SortBox>
            </div>
            <div class="right">
                <SecondNavBar :SecondNavBarData="hotTags"
                              :itemWidth="0"
                              :currentTag="currentTag"
                              @clickSecondBarItem="clickSecondBarItem"></SecondNavBar>
            </div>
        </div>
        <!--展示歌单列表-->
        <ListCard :listCardData="musicList.playlists"
                  @clickListCardItem="clickListCardItem"></ListCard>
        <!--分页-->
        <div class="page" v-if="musicList.playlists">
            <el-pagination background 
                           layout="prev, pager, next" 
                           :total="musicList.total"
                           :page-size="50"
                           :current-page="currentPage"
                           @current-change="pageChange"></el-pagination>
        </div>
    </div>
</template>

<script>
import SortBox from '@/components/sortBox/SortBox.vue';
import SecondNavBar from '@/components/secondNavBar/SecondNavBar.vue';
import ListCard from '@/components/listCard/ListCard.vue';

export default {
    name: "MusicListIndex",
    components: {
        SortBox,
        SecondNavBar,
        ListCard,
    },
    data() {
        return {
            theFirstOfHighquality: {},
            // 分类数据
            sortList: [],
            // 当前分类
            currentTag: {},
            // 热门歌单tag
            hotTags: [],
            // 歌单列表
            musicList: {},
            // 当前页数
            currentPage: 1,
        }
    },
    methods: {
        // 处理请求事件
        // 获取高质量歌单的第一条数据
        async getTheFirstOfHighquality() {
            let result = await this.$request("/top/playlist/highquality", {
                limit: 1,
            });
            // console.log("精品歌单: ", result);
            this.theFirstOfHighquality = result.data.playlists[0];
            console.log("精品歌单详情: ", this.theFirstOfHighquality);
        },
        // 获取歌单分类数据
        async getSortList() {
            let res = await this.$request("/playlist/catlist");
            console.log("歌单分类列表: ", res);
            this.sortList = res.data.sub;
        },
        // 获取热门歌单tag数据
        async getHotTag() {
            let res = await this.$request("/playlist/hot");
            console.log("热门歌单tag: ", res);
            this.currentTag = res.data.tags[0];
            this.hotTags = res.data.tags;
        },
        // 根据分类名获取歌单列表
        async getMusicList() {
            this.musicList = {};
            let result = await this.$request("/top/playlist", {
                cat: this.currentTag.name,
                offset: 50 * (this.currentPage - 1),
            });
            console.log(this.currentTag.name + "风格的歌单列表: ", result);
            this.musicList = result.data;
        },

        // 处理点击事件
        // 点击sortBoxItem中的回调
        clickSortBoxItem(item) {
            this.currentTag = item;
            this.currentPage = 1;
            this.getMusicList();
        },
        // 点击SecondBarItem中的回调
        clickSecondBarItem(index) {
            // console.log(this.hotTags[index]);
            this.currentTag = this.hotTags[index];
            this.currentPage = 1;
            this.getMusicList();
        },
        // 点击歌单的回调
        clickListCardItem(id) {
            // console.log(id);
            this.$router.push({ name: "musicListDetail", params: { id } });
        },
        //当页数发生改变时
        pageChange(page) {
            this.currentPage = page;
            this.getMusicList();
        },
    },
    async created() {
        this.getTheFirstOfHighquality();
        await this.getHotTag();
        this.getMusicList();
    },
}
</script>

<style scoped>
.highqualityEntry {
    position: relative;
    width: 100%;
    height: 180px;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    cursor: pointer;
}
.backgroundImg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    width: 100%;
    transform: translateY(-500px);
    filter: blur(50px) brightness(70%);
}

.cover {
    width: 150px;
    height: 150px;
    margin: 15px;
}

.cover img {
    border-radius: 10px;
    width: 100%;
}

.tag {
    color: #d59e54;
    border: 1px solid #d59e54;
    padding: 5px 10px;
    width: 110px;
    font-size: 16px;
    margin: 40px 10px 20px;
    border-radius: 20px;
}

.tag i {
    font-size: 18px;
}

.name {
    color: white;
    font-size: 18px;
    margin: 10px 0;
}

.desc {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
}

.musicListNavBar {
    padding: 20px 0;
    display: flex;
    justify-content: space-between;
    font-size: 16px;
}

.right {
    margin-top: 2px;
}

.page {
    width: 100%;
    display: flex;
    justify-content: center;
    padding-bottom: 40px;
}
</style>