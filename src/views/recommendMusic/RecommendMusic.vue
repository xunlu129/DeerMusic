<template>
    <div class="recommendMusic">
        <!-- 每日推荐歌曲信息 -->
        <div class="recommendInfo">
            <div class="title">
                <div class="cover">
                    <img src="~assets/img/recommendMusic.png" alt="" />
                    <span class="date">{{ date }}</span>
                </div>
                <div class="titleInfo">
                    <div class="infoTop">每日歌曲推荐</div>
                    <div class="infoBottom">根据你的音乐口味生成，每天6:00更新</div>
                </div>
            </div>
            <!-- 操作按钮 -->
            <div class="buttons">
                <div class="buttonItem playAll" @click="playAll">
                    <i class="iconfont icon-bofang playAll"></i>
                    <span>播放全部</span>
                </div>
                <div class="buttonItem">
                    <i class="iconfont icon-xihuan"></i>
                    <span>收藏全部</span>
                </div>
            </div>
        </div>
        <!-- 歌曲列表 -->
        <div v-if="recommendMusic.length != 0" class="songList">
            <!--表格-->
            <el-table :data="recommendMusic"
                      style="width: 100%"
                      highlight-current-row
                      stripe
                      lazy
                      :row-key="(row) => { return row.id; }"
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
                <el-table-column label="音乐标题" min-width="350">
                    <template #default="scope">
                        <div class="musicName">{{ scope.row.name }} 
                            <div class="alia" v-if="scope.row.alia.length != 0">
                                ({{ scope.row.alia[0] }})
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="ar[0].name" label="歌手" min-width="120"></el-table-column>
                <el-table-column prop="al.name" label="专辑" min-width="170"></el-table-column>
                <el-table-column prop="dt" label="时长" min-width="50"></el-table-column>
            </el-table>
            <div class="placeholder"></div>
        </div>
    </div>
</template>

<script>
import { handleMusicTime } from "plugins/utils";

export default {
    name: "RecommendMusic",
    data() {
        return {
            // 每日推荐歌曲列表
            recommendMusic: [],
            // 每日推荐id （自己起的，用于上传vuex当musicListId，只是作为一个唯一标识）
            recommendMusicListId: "recommendMusic",
            // 今天日期号数
            date: "",
        };
    },
    methods: {
        // 请求
        // 获取每日推荐歌曲
        async getRecommendMusic() {
            let res = await this.$request("/recommend/songs");
            // console.log("每日推荐: ", res);
            this.recommendMusic = res.data.data.dailySongs;
            // 处理时间
            this.recommendMusic.forEach((item, index) => {
                this.recommendMusic[index].dt = handleMusicTime(item.dt);
            });
        },

        // 事件
        // 点击播放全部按钮的回调
        async playAll() {
            // 一定要有这一步，否则当监听的musicId没变化时，颜色不渲染
            this.handleDOM(this.$store.state.musicId);
            // 一定要先更新歌单再更新歌曲，不然播放时获取不到歌单
            // 更新vuex中的歌单
            this.$store.commit("updateMusicList", {
                musicList: this.recommendMusic,
                musicListId: this.recommendMusicListId,
            });
            this.$store.commit("updateCurrentIndex", 0);
            // 将当前播放歌曲设为该歌单第一首
            this.$store.commit("updateMusicId", this.recommendMusic[0].id);
        },

        // 双击table的row的回调
        async clickRow(row) {
            // console.log(row);
            // 一定要有这一步，否则当监听的musicId没变化时，颜色不渲染
            this.handleDOM(this.$store.state.musicId);
            // 一定要先更新歌单再更新歌曲，不然播放时获取不到歌单
            // 求得当前歌曲在该歌单的索引上传到vuex
            let currentIndex = this.recommendMusic.findIndex((item) => item.id == row.id);
            // 更新vuex中的歌单
            this.$store.commit("updateMusicList", {
                musicList: this.recommendMusic,
                musicListId: this.recommendMusicListId,
            });
            this.$store.commit("updateCurrentIndex", currentIndex);
            this.$store.commit("updateMusicId", row.id);
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

        // 将个位数序号前面加个0
        handleIndex(index) {
            index += 1;
            if (index < 10) {
                return "0" + index;
            } else {
                return index;
            }
        },

        // 更改当前播放音乐的样式
        handleDOM(current, last) {
            // console.log(current, last);
            if (document.querySelector(".recommendMusic")) {
                let tableRows = document
                .querySelector(".recommendMusic")
                .querySelectorAll(".el-table__row");
                // 遍历当前musicList 找到当前播放的index的行进行渲染
                // console.log(tableRows);
                let index = this.recommendMusic.findIndex(
                    (item) => item.id == current
                );
                // console.log(index);
                if (index != -1) {
                    // 直接修改dom样式的颜色无效  可能是因为第三方组件的原故
                    // 通过引入全局样式解决
                    // 将正在播放的音乐前面的索引换成小喇叭
                    tableRows[index].children[0].querySelector(
                        ".cell"
                    ).innerHTML = `<div><i class="iconfont icon-yinliang1"></i></div>`;
                    tableRows[index].children[0].querySelector(".iconfont").classList.add("currentRow");
                    tableRows[index].children[3].querySelector(".cell").classList.add("currentRow");
                }
                // 清除上一首的样式
                if (last != -1) {
                    let lastIndex = this.recommendMusic.findIndex(
                        (item) => item.id == last
                    );
                    if (lastIndex != -1) {
                        // 将上一个播放的dom的小喇叭换回索引
                        tableRows[lastIndex].children[0].querySelector(
                            ".cell"
                        ).innerHTML = `<div>${
                            lastIndex + 1 < 10 ? "0" + (lastIndex + 1) : lastIndex + 1
                        }</div>`;
                        // 将上一首的类名删掉  小喇叭的html已经被替换了，不需要再还原
                        tableRows[lastIndex].children[3].querySelector(".cell").classList.remove("currentRow");
                    }
                }
            }
        },
    },
    created() {
        if (!this.$store.state.isLogin) {
            this.$message.error("只有登录后才能进入每日推荐页面哦!");
            this.$router.replace("/index");
        }
        // 获取当前日期
        let currentDate = new Date();
        this.date = currentDate.getDate();
        // console.log(this.date);
    },
    async mounted() {
        if (this.$store.state.isLogin) {
            await this.getRecommendMusic();
            // 判断是否和上一次打开的歌单相同
            if (this.recommendMusicListId == this.$store.state.musicListId) {
                setTimeout(() => {
                    this.handleDOM(this.$store.state.musicId);
                }, 50); // 延迟执行，等待里面的数据渲染了再处理DOM，可以根据实际情况调整延迟时间
            }
        }
    },
    watch: {
        // 监听当前播放歌曲进行渲染
        "$store.state.musicId"(current, last) {
            this.handleDOM(current, last);
        },
    },
}
</script>

<style scoped>
.recommendInfo {
    padding: 20px;
}

.title {
    display: flex;
}

.cover {
    width: 120px;
    position: relative;
    margin-left: -10px;
}

.cover img {
    width: 100%;
}

.date {
    position: absolute;
    left: 50%; /* 将左侧位置设为50% */
    transform: translateX(-50%); /* 使用负的50%水平偏移量来实现居中 */
    top: 30%;
    font-size: 50px;
    font-weight: 900;
    color: #D89F55;
}

.titleInfo {
    padding: 20px 15px;
}

.infoTop {
    font-size: 25px;
    font-weight: 600;
    color: #373737;
    margin: 5px 0 10px 0;
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

.placeholder {
    width: 100%;
    height: 50px;
}

.songList {
    margin: 0 20px;
}

.icon-yixihuan:hover {
    color: #D73535 !important;
}

.red {
    color: #EC4141;
}

.musicName {
    display: flex;
    align-items: center;
}

.alia {
    color: #aaa;
    margin-left: 5px;
    text-overflow: ellipsis !important;
    overflow: hidden !important;
    white-space: nowrap !important;
}
</style>