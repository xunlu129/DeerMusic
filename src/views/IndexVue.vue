<template>
    <el-container>
        <el-header>
            <HeaderBar></HeaderBar>
        </el-header>
        <el-container>
            <!--侧边栏-->
            <el-aside width="220px">
                <el-menu active-text-color="black"
                         text-color="rgb(75, 75, 75)"
                         router :default-active="defaultActive">
                    <el-menu-item index="/discover">
                        <i class="iconfont icon-yinle"></i>
                        <span>发现音乐</span>
                    </el-menu-item>
                    <el-menu-item index="/video">
                        <i class="iconfont icon-shipin"></i>
                        <span>视频</span>
                    </el-menu-item>
                    <el-menu-item index="/favorites">
                        <i class="iconfont icon-wodeshoucang"></i>
                        <span>收藏</span>
                    </el-menu-item>
                    <el-menu-item index="/recommendmusic">
                        <i class="iconfont icon-good"></i>
                        <span>每日推荐</span>
                    </el-menu-item>
                    <el-menu-item-group v-if="createdMusicList.length != 0" title="创建的歌单">
                        <el-menu-item v-for="(item, index) in createdMusicList"
                                      :key="index"
                                      :index="'/musiclistdetail/' + item.id">
                            <i class="iconfont icon-gedan"></i>
                            <span>{{ item.name }}</span>
                        </el-menu-item>
                    </el-menu-item-group>
                    <el-menu-item-group v-if="collectedMusicList.length != 0" title="收藏的歌单">
                        <el-menu-item v-for="(item, index) in collectedMusicList"
                                      :key="index"
                                      :index="'/musiclistdetail/' + item.id">
                            <i class="iconfont icon-gedan"></i>
                            <span>{{ item.name }}</span>
                        </el-menu-item>
                    </el-menu-item-group>
                </el-menu>
            </el-aside>
            <!-- 主体内容 -->
            <el-main>
                <!-- 给router-view添加key有可能对性能有一定的损耗，
                但是可以解决push同一个地址不同参数时不会重新渲染router-view的问题 -->
                <router-view class="routerView" :key="$route.fullPath"></router-view>
                <!-- 用于下载的a标签 -->
                <a :href="downloadMusicInfo.url"
                   :download="downloadMusicInfo.name"
                   target="_blank"
                   id="downloadCurrentMusic"></a>
            </el-main>
        </el-container>
        <BottomControl></BottomControl>
    </el-container>
</template>

<script>
import axios from "axios";
import HeaderBar from "@/components/headerBar/HeaderBar.vue"
import BottomControl from "@/components/BottomControl/BottomControl.vue";

export default {
    components: {
        HeaderBar,
        BottomControl,
    },
    data() {
        return {
            defaultActive: '',
            // 创建的歌单
            createdMusicList: [],
            // 收藏的歌单
            collectedMusicList: [],
            // 下载的音乐的信息
            downloadMusicInfo: {
                name: "",
                url: "",
            },
        }
    },
    created() {
        if (this.$route.path.search("/musiclistdetail") == -1) {
            this.defaultActive = "/" + this.$route.path.split("/")[1];
        } else {
            this.defaultActive = this.$route.path;
        }
    },
    methods: {
        // 请求
        // 请求用户歌单
        async getUserMusicList() {
            if (!this.$store.state.isLogin) {
                // 说明已经退出登录
                this.$message.error("请先进行登录操作");
                return;
            }
            let timestamp = Date.parse(new Date());
            let res = await this.$request("/user/playlist", {
                uid: window.localStorage.getItem("userId"),
                timestamp,
            });
            // console.log("用户歌单: ", res);
            // 对数据进行处理分类
            res = res.data.playlist;
            let index = res.findIndex((item) => item.subscribed == true);
            this.createdMusicList = res.slice(0, index);
            this.collectedMusicList = res.slice(index);
            this.createdMusicList[0].name = "我喜欢的音乐";
            // console.log(this.createdMusicList, this.collectedMusicList);
            // 将创建的歌单上传至vuex
            this.$store.commit("updateCreatedMusicList", this.createdMusicList);
            // 将收藏的歌单上传至vuex
            this.$store.commit("updateCollectMusicList", this.collectedMusicList);
        },
        // 获取喜欢音乐列表
        async getLikeMusicList() {
            if (!this.$store.state.isLogin) {
                // 说明已经退出登录
                this.$message.error("请先进行登录操作");
                return;
            }
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
    },
    watch: {
        // 监听收藏歌单的变化
        "$store.state.collectMusicList"(current) {
            this.collectedMusicList = current;
        },
        "$route.path"(current) {
            // 取路由中的首地址 用于侧边栏的导航active
            if (current.search("/musiclistdetail") == -1) {
                this.defaultActive = "/" + current.split("/")[1];
            } else {
                this.defaultActive = current;
            }
        },
        // 监听vuex中的登录状态
        "$store.state.isLogin"(current) {
            if (current) {
                this.getUserMusicList();
                this.getLikeMusicList();
            } else {
                // 清空收藏和创建歌单
                this.createdMusicList = [];
                this.collectedMusicList = [];
            }
        },
        // 监听当前下载音乐信息
        "$store.state.downloadMusicInfo"(current) {
            // console.log(current.url);
            axios.get(current.url, { responseType: "blob" })
            .then((res) => {
                let blob = res.data;
                let url = URL.createObjectURL(blob);
                console.log(url);
                let a = document.querySelector("#downloadCurrentMusic");
                this.downloadMusicInfo.url = url;
                this.downloadMusicInfo.name = current.name;
                this.$nextTick(() => {
                    a.click();
                    // 用完释放URL对象
                    URL.revokeObjectURL(url);
                });
            })
            .catch((err) => {
                console.log(err);
                if (err.request.statusText == "Forbidden") {
                    this.$message.error("该歌曲暂无版权，无法下载!");
                } else {
                    this.$message.error("下载失败，请稍后尝试");
                }
            });
        },
    },
}
</script>

<style scoped>
.el-header {
  background-color: rgb(242, 242, 242);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2); /* 添加阴影 */
  height: 65px !important;
  padding: 0;
  margin: 0;
  z-index: 100;
}

.iconfont {
  font-size: 18px;
  margin: 5px !important;
  color: rgb(150, 150, 150);
}

.el-main {
  padding: 0;
}

.routerView {
    padding: 0 20px;
    margin: 0;
    width: 100%;
    height: calc(100vh - 145px);
}
</style>