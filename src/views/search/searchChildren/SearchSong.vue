<template>
    <div class="searchSong">
        <!-- 这里的播放效果样式不能直接简单的操作DOM，因为有分页，也可以做成无限滚动，或者根据索引渲染，但是太麻烦，摆了捏 -->
        <el-table :data="searchSongList"
                  style="width: 100%"
                  highlight-current-row
                  stripe
                  @row-dblclick="clickRow">
            <el-table-column label="" width="45" type="index" :index="handleIndex"></el-table-column>
            <el-table-column label="" width="42">
                <!--喜欢按钮-->
                <template #default="scope">
                    <div @click="likeMusic(scope.row.id)">
                        <i class="iconfont icon-xihuan" 
                            v-if="$store.state.likeMusicList.findIndex(
                                musicId => musicId == scope.row.id) == -1"></i>
                        <i class="iconfont icon-yixihuan red" v-else></i>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="" width="50">
                <!--下载按钮-->
                <template #default="scope">
                    <i class="iconfont icon-download" @click="downloadCurrentMusic(scope.row)"></i>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="音乐标题" min-width="350"></el-table-column>
            <el-table-column prop="ar[0].name" label="歌手" min-width="120"></el-table-column>
            <el-table-column prop="al.name" label="专辑" min-width="170"></el-table-column>
            <el-table-column prop="dt" label="时长" min-width="50"></el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="page" v-if="searchSongList.length != 0">
            <el-pagination background
                           layout="prev, pager, next"
                           :total="songCount"
                           :page-size="30"
                           :current-page="currentPage"
                           @current-change="pageChange"></el-pagination>
        </div>
    </div>
</template>

<script>
import { handleMusicTime } from "plugins/utils";

export default {
    name: "SearchSong",
    data() {
        return {
            // 搜索到的单曲列表
            searchSongList: [],
            // 搜索到的歌曲数量
            songCount: 0,
            searchInfo: "",
            // 当前页数
            currentPage: 1,
        }
    },
    methods: {
        // 请求
        // 搜索相关单曲的回调
        async getSearchSong() {
            let res = await this.$request("/cloudsearch", {
                keywords: this.$route.params.id,
                offset: (this.currentPage - 1) * 30,
            });
            console.log("搜索到的单曲: ", res);
            this.songCount = res.data.result.songCount;
            this.searchInfo = "找到 " + res.data.result.songCount + " 首单曲";
            this.searchSongList = res.data.result.songs;
            // 对数据的音乐时长进行处理
            this.searchSongList.forEach((item, index) => {
                this.searchSongList[index].dt = handleMusicTime(item.dt);
            });
            this.$emit("getSearchInfo", this.searchInfo);
        },

        // 事件
        // 将个位数序号前面加个0
        handleIndex(index) {
            index += 1;
            if (index < 10) {
                return "0" + index;
            } else {
                return index;
            }
        },

        // 双击table的row的回调
        async clickRow(row) {
            // 这里双击应该是要把当前双击的歌曲插入到当前的歌单中
            // 首先获取当前的歌单列表和歌曲索引
            let musicList = this.$store.state.musicList;
            let currentIndex = this.$store.state.currentIndex;
            // 先判断该歌曲是否已经在歌单中存在，避免重复点击导致歌单出现相同歌曲
            let isExist = musicList.find((item) => item.id == row.id);
            if (isExist) {
                // 如果已经存在 则只提交歌曲id并return出去
                this.$store.commit("updateMusicId", row.id);
                return;
            }
            this.$store.commit("changePlayState", false);
            // 将请求到的歌曲详情插入到歌单对应位置并提交至vuex
            musicList.splice(currentIndex + 1, 0, row);
            this.$store.commit("updateMusicId", row.id);
            this.$store.commit("updateMusicList", {
                musicList,
                musicListId: this.$store.state.musicListId,
            });
        },

        // 点击喜欢音乐
        async likeMusic(musicId) {
            // 判断是否登录
            if (!this.$store.state.isLogin) {
                this.$message.warning("只有登录后才能点赞哦!");
                return;
            }
            // console.log(musicId);
            // 判断是否已经喜欢该音乐，flag为true就表示还没喜欢，false表示已经喜欢了
            let flag = this.$store.state.likeMusicList.findIndex(id => id == musicId) == -1;
            // console.log(flag);
            // 获取时间戳
            var timestamp = Date.parse(new Date());
            let res = await this.$request("/like", {
                id: musicId,
                like: flag,
                timestamp,
            });
            if (res.data.code == 200) {
                this.updateLikeMusicList();
            } else {
                this.$message.error("喜欢失败,请稍后重试!");
            }
        },

        // 更新喜欢音乐列表
        async updateLikeMusicList() {
            // 获取时间戳
            var timestamp = Date.parse(new Date());
            // 因为喜欢音乐列表实时性较高，为了避免接口缓存，在请求后面加上一个时间戳
            let res = await this.$request("/likelist", {
                uid: window.localStorage.getItem("userId"),
                timestamp,
            });
            let likeMusicList = res.data.ids;
            // 将喜欢列表提交到vuex 供歌单中显示喜欢使用
            this.$store.commit("updateLikeMusicList", likeMusicList);
        },

        // 点击下载按钮的回调
        async downloadCurrentMusic(musicDetail) {
            let id = musicDetail.id;
            console.log(id);
            // 获取音乐URL
            let result = await this.$request("/song/url", { id: id });
            // console.log(result);
            console.log(result.data.data[0].url);
            if (result.data.data[0].url == null) {
                this.$message.error("该歌曲暂无版权，无法下载!");
                return;
            }
            let musicURL = result.data.data[0].url;
            let musicType = result.data.data[0].type.toLowerCase();
            // console.log("下载的音乐详情: ", musicDetail, "下载的音乐URL: ", musicURL);
            // 匹配资源的域名
            let url = musicURL.match(/http.*?\.net/);
            // 匹配域名名称，并匹配对应的代理
            let serve = url[0].match(/http:\/(\S*).music/)[1];
            if (
                serve != "/m7" &&
                serve != "/m701" &&
                serve != "/m702" &&
                serve != "/m8" &&
                serve != "/m801" &&
                serve != "/m802"
            ) {
                // 没有对应的代理
                this.$message.error("匹配不到对应的代理,下载失败!");
                return;
            }
            // 截取后面的参数
            let params = musicURL.slice(url[0].length);
            let downloadMusicInfo = {
                url: serve + params,
                name:
                    musicDetail.name +
                    " - " +
                    musicDetail.ar[0].name +
                    "." +
                    musicType,
            };
            console.log("下载音乐信息: ", downloadMusicInfo);
            this.$store.commit("updateDownloadMusicInfo", downloadMusicInfo);
        },

        // 点击翻页的回调
        pageChange(page) {
            this.currentPage = page;
            this.searchSongList = [];
            this.getSearchSong();
        },
    },
    created() {
        this.getSearchSong();
    }
}
</script>

<style scoped>
.searchSong {
    margin: 0 20px;
}

.icon-yixihuan:hover {
    color: #D73535 !important;
}

.red {
    color: #EC4141;
}

.page {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 30px 0 40px 0;
}
</style>