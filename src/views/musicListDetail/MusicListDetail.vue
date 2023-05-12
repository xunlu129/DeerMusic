<template>
    <div class="musicListDetail" v-if="musicListDetail">
        <!--歌单信息-->
        <div class="listInfo">
            <!--歌单封面-->
            <div class="listAvatar">
                <img :src="musicListDetail.coverImgUrl" alt="" />
            </div>
            <div class="right">
                <!--标题-->
                <div class="title">
                    <div class="titleTag">歌单</div>
                    <div class="titleContent">{{ musicListDetail.name }}</div>
                </div>
                <!--用户信息-->
                <div class="user">
                    <div class="userAvatar">
                        <img :src="musicListDetail.creator.avatarUrl" alt="" />
                    </div>
                    <div class="userName">
                        {{ musicListDetail.creator.nickname }}
                    </div>
                    <div class="createTime">
                        <!--过滤器showDate将时间戳createTime格式化为日期字符串-->
                        {{ showDate(musicListDetail.createTime) }}创建
                    </div>
                </div>
                <!-- 操作按钮 -->
                <div class="buttons">
                    <div class="buttonItem playAll">
                        <i class="iconfont icon-bofang playAll"></i>
                        <span>播放全部</span>
                    </div>
                    <div class="buttonItem" v-if="!isCreated">
                        <i class="iconfont icon-xihuan" :class="isSub ? 'red' : ''"></i>
                        <span>{{ isSub ? "已收藏" : "收藏" }}({{ subscribedCount }})</span>
                    </div>
                    <div class="buttonItem">
                        <i class="iconfont icon-zhuanfa"></i>
                        <span>分享({{ shareCount }})</span>
                    </div>
                </div>
                <!--标签-->
                <div class="tags">
                    标签&nbsp;:
                    <div class="tagItems" v-for="(item, index) in musicListDetail.tags" :key="index">
                        <div class="tagItem">{{ item }}</div>
                        <span v-if="index != musicListDetail.tags.length - 1">/</span>
                    </div>
                    <div style="margin-left: 5px;" v-if="musicListDetail.tags.length == 0">暂无标签</div>
                </div>
                <!--歌曲列表的歌曲数量和播放量-->
                <div class="otherInfo">
                    <div class="musicNum">
                        歌曲&nbsp;:&nbsp;
                        <div class="item">{{ trackCount }}</div>
                    </div>
                    <div class="playCount">
                        播放&nbsp;:&nbsp;
                        <div class="item">{{ playCount }}</div>
                    </div>
                </div>
                <!--简介-->
                <div class="desc">
                    简介&nbsp;:&nbsp;
                    <div class="item">{{ musicListDetail.description ? musicListDetail.description : "暂无简介" }}</div>
                </div>
            </div>
        </div>
        <!--歌曲列表-->
        <div class="songList">
            <el-tabs model-value="first">
                <el-tab-pane label="歌曲列表" name="first">
                    <!--表格-->
                    <el-table :data="musicListDetail.tracks"
                              style="width: 100%"
                              highlight-current-row
                              stripe
                              lazy
                              :row-key="(row) => { return row.id; }"
                              v-infinite-scroll="this.$store.state.isLogin ? loadMore : ''"
                              :infinite-scroll-disabled="scrollLoadDisabled"
                              :infinite-scroll-distance="1500"
                              :infinite-scroll-immediate="false">
                        <el-table-column label="" width="42" type="index" :index="handleIndex"></el-table-column>
                        <el-table-column label="" width="42">
                            <!--喜欢按钮-->
                            <template #default="scope">
                                <i class="iconfont icon-xihuan" 
                                   v-if="$store.state.likeMusicList.findIndex(musicId => musicId == scope.row.id) == -1"></i>
                                <i class="iconfont icon-yixihuan red" v-else></i>
                            </template>
                        </el-table-column>
                        <el-table-column label="" width="45">
                            <!--下载按钮-->
                            <i class="iconfont icon-download"></i>
                        </el-table-column>
                        <el-table-column prop="name" label="音乐标题" min-width="350"></el-table-column>
                        <el-table-column prop="ar[0].name" label="歌手" min-width="120"></el-table-column>
                        <el-table-column prop="al.name" label="专辑" min-width="170"></el-table-column>
                        <el-table-column prop="dt" label="时长" min-width="50"></el-table-column>
                    </el-table>
                    <div class="loadMore" v-if="isMore && !this.$store.state.isLogin">
                        登陆后查看更多音乐
                    </div>
                    <div class="placeholder" v-else></div>
                </el-tab-pane>
                <el-tab-pane label="评论" name="second">

                </el-tab-pane>
                <el-tab-pane label="收藏者" name="third">
                    
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
import { formatDate, handleNum, handleMusicTime } from "plugins/utils";

export default {
    name: "MusicListDetail",
    data() {
        return {
            // 歌单列表数据详情
            musicListDetail: null,
            // 是否已收藏该歌单
            isSub: false,
            // 是否是用户创建的歌单
            isCreated: false,
            // 歌单收藏数
            subscribedCount: 0,
            // 歌单分享数
            shareCount: 0,
            // 歌曲数:
            trackCount: 0,
            // 歌单播放数
            playCount: 0,
            // 是否还有更多音乐
            isMore: false,
            // 是否禁止滚动加载
            scrollLoadDisabled: false,
        }
    },
    methods: {
        // 请求
        // 根据传来的 id 查询歌单
        async getmusicListDetail() {
            var timestamp = Date.parse(new Date());
            let res = await this.$request("/playlist/detail", {
                id: this.$route.params.id,
                timestamp,
            });
            console.log(this.$route.params.id + "歌单详情: ", res);
            this.musicListDetail = res.data.playlist;
            // 判断是否还有更多音乐
            if (
                this.musicListDetail.tracks.length !=
                this.musicListDetail.trackIds.length
            ) {
                this.isMore = true;
            }
            // 处理大于一万的数字
            this.subscribedCount = handleNum(this.musicListDetail.subscribedCount);
            this.shareCount = handleNum(this.musicListDetail.shareCount);
            this.trackCount = handleNum(this.musicListDetail.trackCount);
            this.playCount = handleNum(this.musicListDetail.playCount);
            // 处理播放时间
            this.musicListDetail.tracks.forEach((item, index) => {
                this.musicListDetail.tracks[index].dt = handleMusicTime(item.dt);
            });
        },
        // 获取歌曲详情
        async getMusicDetail(ids) {
            if (this.isMore == false) return;
            this.scrollLoadDisabled = true;
            let res = await this.$request("/song/detail", { ids });
            console.log("歌曲详情:", res);
            // 处理时间
            res.data.songs.forEach((item, index) => {
                res.data.songs[index].dt = handleMusicTime(item.dt);
            });
            this.musicListDetail.tracks.push(...res.data.songs);
            // 判断是否还有更多音乐
            if (
                this.musicListDetail.tracks.length <
                this.musicListDetail.trackIds.length
            ) {
                this.isMore = true;
                this.scrollLoadDisabled = false;
            } else {
                this.isMore = false;
            }
        },

        // 事件函数
        // 将个位数序号前面加个0
        handleIndex(index) {
            index += 1;
            if (index < 10) {
                return "0" + index;
            } else {
                return index;
            }
        },
        // 判断用户是否收藏了该歌单
        getIsSub() {
            this.isSub = this.$store.state.collectMusicList.find(
                (item) => item.id == this.$route.params.id
            );
            // if (this.isSub) {
            //     console.log("是否收藏了该歌单: 是");
            // } else {
            //     console.log("是否收藏了该歌单: 否");
            // }
        },
        // 判断是否是用户创建的歌单
        getIsCreated() {
            this.isCreated = this.$store.state.createdMusicList.find(
                (item) => item.id == this.$route.params.id
            );
            // if (this.isSub) {
            //     console.log("是否用户创建的歌单: 是");
            // } else {
            //     console.log("是否用户创建的歌单: 否");
            // }
        },
        // 点击加载所有音乐的回调
        loadMore() {
            if (!this.$store.state.isLogin) {
                this.$message.error("请先进行登录操作!");
                return;
            }
            console.log("加载所有音乐");
            let arr = this.musicListDetail.trackIds.slice(
                this.musicListDetail.tracks.length
            );
            if (arr.length > 100) {
                arr = arr.slice(0, 100);
            }
            // console.log(arr.length);
            let ids = "";
            arr.forEach((item) => {
                ids += item.id + ",";
            });
            ids = ids.substr(0, ids.length - 1);
            // console.log(ids);
            this.getMusicDetail(ids);
        },

        // 格式化时间
        showDate(time) {
            // 1、先将时间戳转成Date对象
            const date = new Date(time);
            // 2、将date进行格式化
            return formatDate(date, "yyyy-MM-dd");
        },
    },
    async mounted() {
        await this.getmusicListDetail();
        if (this.$store.state.isLogin) {
            // 先判断是否是用户创建的歌单
            this.getIsCreated();
            // 如果不是 再判断是否是收藏的歌单
            if (!this.isCreated) {
                this.getIsSub();
            }
        }
    },
    watch: {
        // 监听createdMusicList的变化
        "$store.state.createdMusicList"(current, last) {
            // 如果在收藏页面刷新，收藏歌单还没获取到，但是收藏按钮已经渲染了，所以在第一次获取到数据时，再渲染一次
            // 如果是刚刷新，last则为空
            if (last.length == 0) {
                this.getIsCreated();
                if (!this.isCreated) {
                    this.getIsSub();
                }
            }
        },
    }
}
</script>

<style scoped>
.musicListDetail {
    overflow-y: scroll;
}

.listInfo {
    display: flex;
    align-items: center;
    padding: 40px 20px;
}

.listAvatar {
    width: 200px;
    height: 200px;
    overflow: hidden;
    border-radius: 10px;
    margin-right: 30px;
    position: relative;
}

.listAvatar::after {
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    background: url("~assets/img/imgLoading.png") no-repeat;
    background-size: contain;
    z-index: -1;
}

.listAvatar img {
    width: 200px;
}

.right {
    width: calc(100% - 250px);
}

.title {
    display: flex;
    align-items: center;
}

.titleTag {
    color: #D89F55;
    border: 1px solid #D89F55;
    padding: 1px 2px;
    border-radius: 2px;
    margin-right: 15px;
}

.titleContent {
    font-size: 25px;
    font-weight: 600;
    color: #373737;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 90%;
}

.user {
    display: flex;
    align-items: center;
    margin-top: 10px;
    font-size: 14px;
}

.userAvatar {
    height: 30px;
    width: 30px;
    margin-right: 12px;
}

.userAvatar img {
    width: 100%;
    border-radius: 50%;
}

.userName {
    color: #6191c2;
    margin-right: 12px;
    cursor: pointer;
    padding-top: 2px;
}

.userName:hover {
    color: #507ba6;
}

.createTime {
    padding-top: 2px;
}

.buttons {
    margin-top: 10px;
    display: flex;
}

.buttonItem {
    font-size: 15px;
    padding: 7px 17px;
    margin-right: 15px;
    border: 1px solid #ccc;
    border-radius: 20px;
}

.buttonItem i { 
    font-size: 17px;
    margin-right: 3px;
}

.playAll {
    font-size: 15px !important;
    background-color: #D89F55;
    color: white;
}

.red {
    color: #EC4141;
}

.tags {
    margin-top: 12px;
    display: flex;
    font-size: 14px;
}

.tagItems {
    display: flex;
    align-items: center;
}

.tagItem {
    color: #6191c2;
    margin: 0 5px;
    cursor: pointer;
}

.tagItem:hover {
    color: #507ba6;
}

.otherInfo {
    margin-top: 10px;
    display: flex;
    font-size: 14px;
}

.musicNum {
    margin-right: 15px;
    display: flex;
    align-items: center;
}

.playCount {
    display: flex;
    align-items: center;
}

.desc {
    margin-top: 10px;
    font-size: 14px;
    display: flex;
    align-items: center;
    white-space: nowrap;
}

.item {
    margin-left: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.icon-yixihuan:hover {
    color: #D73535 !important;
}

.loadMore {
    width: 100%;
    height: 50px;
    font-size: 15px;
    color: #aaa;
    text-align: center;
    line-height: 50px;
}

.placeholder {
    width: 100%;
    height: 50px;
}

</style>