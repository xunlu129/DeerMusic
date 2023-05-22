<template>
    <div class="bottomControl">
        <audio :src="musicUrl"
               ref="audioPlayer"
               autoplay
               @play="changeState(true)"
               @pause="changeState(false)"
               @ended="changeMusic('next')"
               @timeupdate="timeupdate"></audio>
        <!--左边-->
        <div class="left">
            <div class="avatar">
                <img :src="musicDetail.al.picUrl" alt="" v-if="musicDetail.al" :draggable="false" />
                <img src="~assets/img/test.png" alt="" v-else :draggable="false" />
            </div>
            <div class="musicInfo">
                <div class="musicName" v-if="musicDetail && musicDetail.name">
                    {{ musicDetail.name }}
                </div>
                <div class="singer" v-if="musicDetail && musicDetail.name">
                    {{ musicDetail.ar[0].name }}
                </div>
            </div>
            <div class="downloadContainer" v-if="musicDetail.name">
                <i class="iconfont icon-download" @click="downloadCurrentMusic"></i>
            </div>
        </div>
        <!--中间-->
        <div class="center">
            <div class="buttons">
                <span @click="playType = playType == 'order' ? 'single' : playType == 'single' ? 'random' : 'order'">
                    <i class="iconfont icon-xunhuan" v-if="playType == 'order'"></i>
                    <i class="iconfont icon-danquxunhuan" v-else-if="playType == 'single'"></i>
                    <i class="iconfont icon-suiji" v-else></i>
                </span>
                <span @click="musicList.length != 0 ? changeMusic('pre') : ''">
                    <i class="iconfont icon-shangyishou"></i>
                </span>
                <span @click="musicList.length != 0 ? changePlayState() : ''">
                    <i class="iconfont icon-bofang" v-if="!this.$store.state.isPlay"></i>
                    <i class="iconfont icon-zanting" v-else></i>
                </span>
                <span @click="musicList.length != 0 ? changeMusic('next') : ''">
                    <i class="iconfont icon-xiayishou"></i>
                </span>
                <span @click="musicList.length != 0 ? likeMusic() : ''">
                    <i class="iconfont icon-xihuan"
                       v-if="$store.state.likeMusicList.findIndex(
                            musicId => musicId == $store.state.musicId) == -1"></i>
                    <i class="iconfont icon-yixihuan" v-else></i>
                </span>
            </div>
            <!--进度条-->
            <div class="progressBar">
                <span class="currentTime">{{ handleTime(currentTime) }}</span>
                <el-slider class="progressSlider"
                           v-model="timeProgress"
                           :show-tooltip="false"
                           @change="changeProgress"
                           :disabled="musicList.length == 0"></el-slider>
                <span class="totalTime">{{ duration }}</span>
            </div>
        </div>
        <!--右边-->
        <div class="right">
            <div class="volumeControl">
                <div class="volumeIcon" @click="changeMutedState">
                    <i class="iconfont icon-jingyin" v-if="volume == 0"></i>
                    <i class="iconfont icon-yinliang" v-else></i>
                </div>                
                <el-slider class="volumeSlider"
                           v-model="volume"
                           :show-tooltip="false"
                           @input="changeVolume"></el-slider>
            </div>
            <div class="playList" @click="openDrawer">
                <i class="iconfont icon-bofangliebiao"></i>
            </div>
            <!-- 备案信息 -->
            <el-tooltip class="item"
                        placement="left"
                        :enterable="false">
                <template #content>
                    <div v-html="recondInfo"></div>
                </template>
                <el-link type="info"
                         href="https://beian.miit.gov.cn/"
                         target="_blank"
                         class="recondInfo">粤ICP备2020501116号</el-link>
            </el-tooltip>
        </div>
        <!-- 抽屉 -->
        <el-drawer v-model="drawer" :with-header="false" width="500" append-to-body="true">
            <div class="drawerHeader">
                <div class="total">共{{ musicList.length }}首</div>
                <div class="deleteAll" @click="removeAllSong">清空列表</div>
            </div>
            <el-table :data="musicList"
                      stripe
                      style="width: 100%"
                      :show-header="false"
                      @row-dblclick="clickRow"
                      @row-contextmenu="showContextMenu"
                      highlight-current-row
                      lazy>
                <el-table-column prop="name" width="250px"> </el-table-column>
                <el-table-column prop="ar[0].name" width="150px"> </el-table-column>
                <el-table-column prop="dt" width="92px"> </el-table-column>
            </el-table>
        </el-drawer>
    </div>
</template>

<script>
import { handleMusicTime, returnSecond } from "plugins/utils";
// 当前最后播放秒数
let lastSecond = 0;
// 总时长的秒数
let durationNum = 0;
// 保存当前音量
let volumeSave = 0;
// 当前音乐类型，用于下载
let musicType = "";

export default {
    name: 'BottomControl',
    data() {
        return {
            musicList: [],
            musicUrl: "",
            musicDetail: {},
            // 记录当前的index，用于切歌
            currentMusicIndex: 0,
            // 播放模式（顺序播放，随机播放）
            // order random
            playType: "order",
            // 音乐总时长
            duration: "00:00",
            // 当前播放时间位置
            currentTime: 0,
            // 当前进度条位置
            timeProgress: 0,
            // 音量
            volume: 35,
            // 是否静音
            isMuted: false,
            // 抽屉是否显示
            drawer: false,
            // 抽屉是否被打开过（如果没打开过，里面的数据是不会渲染的）
            hasDrawerOpened: false,
            recondInfo: `<div style='text-align: center; font-size: 12px;'>
粤ICP备2020501116号<br>个人邮箱: 3181716884@qq.com<br>本站为仿网易云音乐展示项目, 仅供学习使用, 侵权必删!</div>`,
        }
    },
    methods: {
        // 请求
        // 请求歌曲url
        async getMusicDetail(id) {
            if (id == '') return;
            this.$store.commit("updateMusicLoadState", true);
            let result = await this.$request("/song/url", { id });
            // console.log(result);
            // 获取不到url
            if (result.data.data[0].url == null) {
                this.$message.error("该歌曲暂无版权，将为您播放下一首歌曲");
                this.changeMusic("next");
                return;
            }
            console.log("正在播放的音乐: ", result.data.data[0].url);
            this.musicUrl = result.data.data[0].url;
            musicType = result.data.data[0].type.toLowerCase();
            // 不知什么原因第一次播放音量不等于this.volume,所以每次获取歌曲时更新同步一下音量
            this.$refs.audioPlayer.volume = this.volume / 100;
            this.$store.commit("updateMusicLoadState", false);
        },

        // 点击喜欢音乐
        async likeMusic() {
            // 判断是否登录
            if (!this.$store.state.isLogin) {
                this.$message.warning("只有登录后才能喜欢哦!");
                return;
            }
            // 判断是否已经喜欢该音乐，flag为true就表示还没喜欢，false表示已经喜欢了
            let flag = this.$store.state.likeMusicList.findIndex(id => id == this.musicDetail.id) == -1;
            // console.log(flag);
            // 获取时间戳
            var timestamp = Date.parse(new Date());
            let res = await this.$request("/like", {
                id: this.musicDetail.id,
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

        // 事件
        // 拖动音量条的回调
        changeVolume(e) {
            // 改变audio的音量
            // input事件 实时触发
            this.$refs.audioPlayer.volume = e / 100;
            if (this.isMuted && e > 0) {
                this.isMuted = false;
                // console.log("取消静音");
            } else if (e == 0 && this.isMuted == false) {
                this.isMuted = true;
                // console.log("静音");
            }
        },

        // 点击小喇叭的回调 （切换静音状态）
        changeMutedState() {
            if (this.isMuted) {
                this.volume = volumeSave;
            } else {
                volumeSave = this.volume;
                this.volume = 0;
            }
            // 不知为什么@input监听不到这个函数改变this.volume的值，所以这里也要主动同步音量
            this.$refs.audioPlayer.volume = this.volume / 100;
            console.log(volumeSave, this.isMuted);
            this.isMuted = !this.isMuted;
        },

        // 点击播放键的回调
        changePlayState() {
            !this.$store.state.isPlay ? this.playMusic() : this.pauseMusic();
        },
        // 播放音乐的函数
        playMusic() {
            this.$refs.audioPlayer.play();
        },
        // 暂停音乐的函数
        pauseMusic() {
            this.$refs.audioPlayer.pause();
        },
        // audio开始或暂停播放的回调  在vuex中改变状态
        changeState(state) {
            this.$store.commit("changePlayState", state);
            // console.log("更新播放状态: ", state);
        },

        // 切歌函数
        changeMusic(type, id) {
            if (type == "click") {
                // 点击抽屉row进行切歌
                this.$store.commit("updateMusicId", id);
            } else if (type == "pre") {
                let currentMusicIndex = this.currentMusicIndex;
                let preIndex;
                if (this.playType == "order") {
                    preIndex = currentMusicIndex - 1 < 0 ? this.musicList.length - 1 : currentMusicIndex - 1;
                } else if (this.playType == "single") {
                    preIndex = currentMusicIndex;
                } else if (this.playType == "random") {
                    if (this.musicList.length == 1) {
                        preIndex = currentMusicIndex;
                    } else {
                        // Math.floor(Math.random()*n); 可均衡获取0到n-1的随机整数。
                        preIndex = currentMusicIndex;
                        while (preIndex == currentMusicIndex) {
                            preIndex = Math.floor(Math.random() * this.musicList.length);
                        }
                    }
                }
                // console.log("上一首歌的id: ", this.musicList[preIndex].id);
                this.$store.commit("updateMusicId", this.musicList[preIndex].id);
                // 如果播放列表只有一首歌，vuex里的musicId不变是不会继续播放的，要加一个更新播放源
                if (this.musicList.length == 1 || this.playType == "single") {
                    this.getMusicDetail(this.musicList[preIndex].id);
                }
            } else if (type == "next") {
                let currentMusicIndex = this.currentMusicIndex;
                let nextIndex;
                if (this.playType == "order") {
                    nextIndex = currentMusicIndex + 1 == this.musicList.length ? 0 : currentMusicIndex + 1;
                } else if (this.playType == "single") {
                    nextIndex = currentMusicIndex;
                } else if (this.playType == "random") {
                    if (this.musicList.length == 1) {
                        nextIndex = currentMusicIndex;
                    } else {
                        // Math.floor(Math.random()*n); 可均衡获取0到n-1的随机整数。
                        nextIndex = currentMusicIndex;
                        while (nextIndex == currentMusicIndex) {
                            nextIndex = Math.floor(Math.random() * this.musicList.length);
                        }
                    }
                }
                // console.log("下一首歌的id: ", this.musicList[nextIndex].id);
                this.$store.commit("updateMusicId", this.musicList[nextIndex].id);
                // 如果播放列表只有一首歌，vuex里的musicId不变是不会继续播放的，要加一个更新播放源
                if (this.musicList.length == 1 || this.playType == "single") {
                    this.getMusicDetail(this.musicList[nextIndex].id);
                }
            }
        },

        // 根据id找到 musicList中对应的musicDetail
        getMusicDetailFromMusicList() {
            let index = this.musicList.findIndex(
                (item) => item.id == this.$store.state.musicId
            );
            if (index != -1) {
                // 记录当前音乐的index
                this.currentMusicIndex = index;
                // 将索引传至vuex
                this.$store.commit("updateCurrentIndex", index);
                this.musicDetail = this.musicList[index];
                console.log("当前音乐详情: ", this.musicDetail);
                // 直接从audio标签中的duration属性拿时长会有请求时差问题，所以直接在musicInfo中拿
                this.duration = this.musicList[index].dt;
            }
        },

        // 当前播放时间位置
        timeupdate() {
            // console.log(e);
            // console.log(this.$refs.audioPlayer.currentTime);
            // 节流
            let time = this.$refs.audioPlayer.currentTime;
            // 将当前播放时间保存到vuex  如果保存到vuex这步节流,会导致歌词不精准,误差最大有1s
            this.$store.commit("updateCurrentTime", time);
            // 将节流转为秒为单位
            // Math.floor() 函数总是返回小于等于一个给定数字的最大整数。
            time = Math.floor(time);
            // console.log(time);
            if (time !== lastSecond) {
                lastSecond = time;
                this.currentTime = time;
                // 计算进度条的位置
                this.timeProgress = Math.floor((time / durationNum) * 100);
                // console.log(this.timeProgress);
            }
        },

        // 拖动进度条的回调
        changeProgress(e) {
            // console.log(e);
            // 修改当前播放时间
            this.currentTime = Math.floor((e / 100) * durationNum);
            // 改变audio的实际当前播放时间
            this.$refs.audioPlayer.currentTime = this.currentTime;
        },

        // 点击打开抽屉的回调
        openDrawer() {
            // 关闭也是这个回调，所以直接取反
            this.drawer = !this.drawer;
            this.hasDrawerOpened = true;
            setTimeout(() => {
                this.handleDrawerListDOM(this.currentMusicIndex);
            }, 100); // 延迟执行，等待里面的数据渲染了再处理DOM，可以根据实际情况调整延迟时间
        },

        // 双击抽屉列表中的row的回调
        clickRow(row) {
            // console.log(row.id);
            this.changeMusic("click", row.id);
        },

        // 操作drawerList中DOM的函数
        handleDrawerListDOM(currentIndex, lastIndex) {
            // 目前没什么好思路 直接操作原生DOM
            this.$nextTick(() => {
                // 用了append-to-body="true"，把抽屉嵌入到了主body里了，并且类名叫el-overlay
                let tableRows = document
                .querySelector(".el-overlay")
                .querySelectorAll(".el-table__row");
                // console.log(tableRows);
                // 直接修改dom样式的颜色无效  可能是因为第三方组件 style scoped的原因
                // 通过引入全局样式解决
                if (tableRows[currentIndex]) {
                    tableRows[currentIndex].children[0]
                        .querySelector(".cell")
                        .classList.add("currentRow");
                    tableRows[currentIndex].children[1]
                        .querySelector(".cell")
                        .classList.add("currentRow");
                    // console.log("引入currentRow");
                }
                if (
                    (lastIndex && lastIndex != -1 && tableRows[lastIndex]) ||
                    lastIndex == 0
                ) {
                    // 将上一首的类名删掉
                    tableRows[lastIndex].children[0]
                        .querySelector(".cell")
                        .classList.remove("currentRow");
                    tableRows[lastIndex].children[1]
                        .querySelector(".cell")
                        .classList.remove("currentRow");
                    // console.log("移除currentRow");
                }
            });
        },

        // 点击下载按钮的回调
        downloadCurrentMusic() {
            // console.log(this.musicDetail, this.musicUrl);
            // 匹配资源的域名
            let url = this.musicUrl.match(/http.*?\.net/);
            // 匹配域名名称，并匹配对应的代理
            let serve = url[0].match(/http:\/(\S*).music/)[1];
            if (
                serve != "/m7" &&
                serve != "/m701" &&
                serve != "/m8" &&
                serve != "/m801"
            ) {
                // 没有对应的代理
                this.$message.error("匹配不到对应的代理,下载失败!");
                return;
            }
            // 截取后面的参数
            let params = this.musicUrl.slice(url[0].length);
            let downloadMusicInfo = {
                url: serve + params,
                name:
                    this.musicDetail.name +
                    " - " +
                    this.musicDetail.ar[0].name +
                    "." +
                    musicType,
            };
            console.log("下载音乐信息: ", downloadMusicInfo);
            this.$store.commit("updateDownloadMusicInfo", downloadMusicInfo);
        },

        // 右击抽屉歌曲的回调
        showContextMenu(row, column, event) {
            // 阻止浏览器默认的菜单弹出
            event.preventDefault();
            // 操纵原生DOM生成样式
            const contextMenu = document.createElement('div');
            contextMenu.classList.add('context-menu');
            // 移除歌曲按钮样式
            const deleteButton = document.createElement('div');
            deleteButton.classList.add('menu-button');
            const icon = document.createElement('i');
            icon.classList.add('iconfont', 'icon-shanchu');
            deleteButton.appendChild(icon);
            const text = document.createElement('span');
            text.textContent = '从播放列表中删除';
            deleteButton.appendChild(text);
            // 删除按钮的回调
            deleteButton.addEventListener('click', () => {
                this.removeSong(row.id);
                document.body.removeChild(contextMenu);
                document.removeEventListener('mousedown', handleClickOutside);
            });
            contextMenu.appendChild(deleteButton);
            // 设置弹出框位置随鼠标位置
            if (event.pageX > window.innerWidth - 200) {
                contextMenu.style.left = (event.pageX - 190) + 'px';
            } else {
                contextMenu.style.left = (event.pageX + 10) + 'px';
            }
            contextMenu.style.top = (event.pageY + 10) + 'px';
            document.body.appendChild(contextMenu);
            // 点击空白处关闭弹出框
            const handleClickOutside = (event) => {
                if (!contextMenu.contains(event.target)) {
                    document.body.removeChild(contextMenu);
                    document.removeEventListener('mousedown', handleClickOutside);
                }
            };
            // 添加事件监听器
            document.addEventListener('mousedown', handleClickOutside);
        },

        // 点击删除按钮的回调
        removeSong(id) {
            console.log("从播放列表中删除: ", id);
            // 首先获取当前的歌单列表和歌曲索引
            let musicList = this.$store.state.musicList;
            let currentIndex = this.$store.state.currentIndex;
            // 找到要删除的歌的索引
            let index = musicList.findIndex(song => song.id == id);
            if (currentIndex == index) {
                // 如果要删除的歌是当前播放的
                if (musicList.length != 1) {
                    // 播放列表不止一首歌，需要先切下一首
                    this.changeMusic('next');
                } else {
                    // 如果只剩一首了，要先重置播放器
                    // 先暂停当前播放的音乐
                    this.pauseMusic();
                    // 不知道为什么播放器不更新vuex里的状态，所以这里主动更新了
                    this.$store.commit("changePlayState", false);
                    lastSecond = 0;
                    durationNum = 0;
                    this.musicUrl = "";
                    this.musicDetail = {};
                    this.duration = "00:00";
                    this.currentTime = 0;
                    this.timeProgress = 0;
                }                
            }
            // 不用考虑当前播放歌曲不是要删除的歌时去更新索引渲染，因为更新歌单时会自动更新渲染
            // 从播放列表中删除
            musicList.splice(index, 1);
            // 将新播放列表上传vuex
            this.$store.commit('updateMusicList', {
                musicList,
                musicListId: this.$store.state.musicListId,
            });
            // 更新当前播放歌曲要在更新列表之后
            if (musicList.length == 0) {
                this.$store.commit("updateMusicId", '');
            }
        },

        // 清空播放列表
        removeAllSong() {
            // 先暂停当前播放的音乐，重置播放器
            this.pauseMusic();
            // 不知道为什么播放器不更新vuex里的状态，所以这里主动更新了
            this.$store.commit("changePlayState", false);
            lastSecond = 0;
            durationNum = 0;
            this.musicUrl = "";
            this.musicDetail = {};
            this.duration = "00:00";
            this.currentTime = 0;
            this.timeProgress = 0;
            // 将空播放列表上传vuex
            this.$store.commit('updateMusicList', {
                musicList: [],
                musicListId: this.$store.state.musicListId,
            });
            // 更新当前播放歌曲要在更新列表之后
            this.$store.commit("updateMusicId", '');
        },

        // 格式化当前时间
        handleTime(time) {
            return handleMusicTime(time);
        }
    },
    watch: {
        // 监听播放列表的变化，一定要有这个，否则vuex中musicId没变化时，抽屉列表不渲染
        "$store.state.musicList"(list) {
            this.musicList = list;
            this.getMusicDetailFromMusicList();
        },
        // 监听vuex中musicId的变化
        "$store.state.musicId"(id) {
            // console.log("vuex中的id发生了变化");
            // 先暂停当前播放的音乐
            this.pauseMusic();
            this.musicList = this.$store.state.musicList;
            // console.log(this.musicList.length);
            this.getMusicDetailFromMusicList();
            this.getMusicDetail(id);
            // 转义从store获取的已格式化的总时长为秒数
            durationNum = returnSecond(this.duration);
        },
        // 监听播放状态
        "$store.state.isPlay"(isPlay) {
            if (isPlay) {
                this.playMusic();
            } else {
                this.pauseMusic();
            }
        },
        // 监听currentIndex的变化
        "$store.state.currentIndex"(currentIndex, lastIndex) {
            // console.log(currentIndex, lastIndex);
            if (this.hasDrawerOpened) {
                this.handleDrawerListDOM(currentIndex, lastIndex);
            }
        },
    }
}
</script>

<style scoped>
.bottomControl {
    /* border-top: 1px solid #ddd; */
    width: 100%;
    height: 80px;
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 13px 20px;
    box-shadow: 0px -1px 3px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
}

.left {
    display: flex;
    align-items: center;
    width: 250px;
}

.avatar {
    width: 54px;
    height: 54px;
    border-radius: 5px;
    overflow: hidden;
    margin-right: 15px;
    cursor: pointer;
}

.avatar img {
    width: 100%;
}

.musicInfo {
    color: rgb(37, 37, 37);
    font-size: 17px;
    width: 181px;
}

.musicName {
    margin-bottom: 8px;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    color: #313131;
}

.singer {
    transform: scale(0.9);
    margin-left: -10px;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    color: #313131;
}

.musicName:hover, .singer:hover {
    color: black;
}

.downloadContainer i {
    font-size: 25px;
    position: absolute;
    bottom: 13px;
}

.center {
    margin-top: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.buttons {
    display: flex;
    align-items: center;
    height: 16px;
}

.buttons i {
    font-size: 25px;
    color: #313131;
}

.buttons span:nth-child(3) i {
    font-size: 30px;
}

.buttons span {
    display: inline-block;
    width: 70px;
    box-sizing: border-box;
    text-align: center;
}

.icon-xunhuan:hover, 
.icon-danquxunhuan:hover,
.icon-suiji:hover, 
.icon-shangyishou:hover, 
.icon-bofang:hover, 
.icon-zanting:hover,
.icon-xiayishou:hover {
    color: #D89F55;
}

.icon-xihuan {
    color: #4e4e4e !important;
}

.icon-xihuan:hover {
    color: black !important;
}

.icon-yixihuan {
    color: #EC4141 !important;
}

.progressBar {
    display: flex;
    align-items: center;
    height: 15px;
    margin-top: 18px;
    overflow: hidden;
}

.currentTime, .totalTime {
    font-size: 15px;
    color: #aaa;
    margin: 0 10px;
    width: 45px;
    text-align: center;
}

.progressSlider {
    width: 400px;
}

.right {
    display: flex;
    align-items: center;
    position: relative;
    width: 250px;
}

.volumeControl {
    display: flex;
    align-items: center;
    margin-left: 105px;
    margin-right: 20px;
}

.volumeIcon {
    width: 25px;
    height: 25px;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.icon-jingyin {
    font-size: 20px;
    color: rgb(130, 130, 130);
}

.icon-yinliang {
    font-size: 25px;
}

.volumeSlider {
    width: 60px;
}

.icon-bofangliebiao {
    font-size: 25px;
}

.recondInfo {
    position: absolute;
    font-size: 12px;
    width: 140px;
    right: 5px;
    bottom: -10px;
}

.drawerHeader {
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.total {
    font-size: 16px;
    color: #aaa;
}

.deleteAll {
    font-size: 14px;
    color: #6191c2;
    cursor: pointer;
}

.deleteAll:hover {
    color: #507ba6;
}
</style>