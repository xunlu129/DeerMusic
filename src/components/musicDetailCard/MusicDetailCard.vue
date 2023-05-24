<template>
    <div class="musicDetailCard" :class="isMusicDetailCardShow ? '' : 'hide'">
        <div class="closeCard" @click="$store.commit('changeMusicDetailCardState')">
            <i class="iconfont icon-arrow-down-bold"></i>
        </div>
        <div class="musicDetailCardContainer" v-if="!cleanCard && musicInfo.name">
            <div class="top">
                <div class="left">
                    <div class="discContainer">
                        <div class="needle"
                             :class="$store.state.isPlay ? 'needleRotate' : ''"
                             ref="needle">
                            <img src="~assets/img/MusicDetailCard/needle.png" alt="" :draggable="false" />
                        </div>
                        <!-- 通过音乐的加载时差删除discAnimation类名再添加,达到重置动画的效果 -->
                        <div class="disc" 
                             :class="[$store.state.isPlay ? '' : 'pause',
                                      $store.state.isMusicLoad ? '' : 'discAnimation']"
                             ref="disc">
                            <img src="~assets/img/MusicDetailCard/disc.png" alt="" :draggable="false" />
                            <img src="~assets/img/test.png" alt="" class="musicAvatar" v-if="!musicInfo.al" />
                            <img :src="musicInfo.al.picUrl + '?param==400y400'" alt="" class="musicAvatar" v-else />
                        </div>
                    </div>
                </div>
                <div class="right">
                    <div class="title">
                        <div class="musicName">{{ musicInfo.name }}</div>
                        <div class="musicInfo">
                            <div class="singer"
                                 @click="goToDetailPage('singerDetail', musicInfo.ar[0].id)">
                                歌手：<span>{{ musicInfo.ar[0].name }}</span>
                            </div>
                            <div class="album"
                                 @click="goToDetailPage('albumDetail', musicInfo.al.id)">
                                专辑：<span>{{ musicInfo.al.name }}</span>
                            </div>
                        </div>
                        <div class="tnsAndAlia">
                            <div class="tns" v-if="musicInfo.al.tns.length != 0">{{ musicInfo.al.tns[0] }}</div>
                            <div class="alia" v-if="musicInfo.alia.length != 0">{{ musicInfo.alia[0] }}</div>
                            <div v-else>&nbsp;</div>
                        </div>
                    </div>
                    <!-- 滚动歌词 -->

                </div>
            </div>
            <div class="bottom" v-loading="isCommentLoading" element-loading-background="rgba(255, 255, 255, 0.2)">
                <!--精彩评论-->
                <CommentCompn :commentType="'music'"
                              :comments="hotComments"
                              :commentId="$store.state.musicId + ''"
                              :musicTitle="musicInfo.name"
                              :isInputShow="false"
                              @getComment="getMusicComment($store.state.musicId)"
                              v-if="isHotCommentCompnShow(hotComments)">
                    <template #title>
                        <div>精彩评论</div>
                    </template>
                </CommentCompn>
                <!--最新评论-->
                <CommentCompn :commentType="'music'"
                              :comments="comment.comments"
                              :commentId="$store.state.musicId + ''"
                              :musicTitle="musicInfo.name"
                              :isInputShow="false"
                              @getComment="getMusicComment($store.state.musicId)"
                              v-if="isNewCommentCompnShow(comment)">
                    <template #title>
                        <div>最新评论</div>
                    </template>
                </CommentCompn>
                <div class="commentTip" 
                     v-if="!isHotCommentCompnShow(hotComments) &&
                           !isNewCommentCompnShow(comment)">
                    该歌曲还没有人评论哦，快来抢占沙发吧！
                </div>
                <!-- 分页 -->
                <div class="page" v-show="comment.comments && comment.comments.length != 0">
                    <el-pagination background
                                   layout="prev, pager, next"
                                   :total="comment.total"
                                   :page-size="20"
                                   :current-page="currentCommentPage"
                                   @current-change="commentPageChange">
                    </el-pagination>
                </div>
            </div>
            <GoTop scrollObj=".musicDetailCardContainer"></GoTop>
        </div>
        <div v-else class="tip">暂无播放音乐</div>
    </div>
</template>

<script>
// 引入分析图片主题色的依赖
import rgbaster from 'rgbaster';
import CommentCompn from '@/components/comment/CommentCompn.vue';
import GoTop from "@/components/goTop/GoTop.vue";

// 定时器名称
let timer;

export default {
    name: "MusicDetailCard",
    components: {
        CommentCompn,
        GoTop,
    },
    data() {
        return {
            // 是否显示歌曲详情卡片
            isMusicDetailCardShow: false,
            // 当前歌曲信息
            musicInfo: {},
            // 是否删除卡片渲染的内容
            cleanCard: true,
            // 歌词
            lyric: [[0, "正在加载歌词"]],
            // 当前评论页数
            currentCommentPage: 1,
            // 评论数据
            comment: {},
            // 评论是否在加载中
            isCommentLoading: false,
            // 热门评论
            hotComments: [],
            // 是否已经渲染顶部背景主题色
            isColor: false,
            // 记录上次翻评论的音乐id 只有当音乐相同时才触发滚动 防止切歌时触发滚动 切歌时会触发翻页函数
            prevMusicId: "",
        }
    },
    methods: {
        // 请求
        // 请求并处理歌词数据
        async getLyric(id) {
            let res = await this.$request("/lyric", { id });
            console.log("歌词数据: ", res);
            // 原歌词
            let lyrics = res.data.lrc.lyric;
            // 对获取到的原歌词进行处理
            let arr = lyrics.split("\n");
            // 歌词翻译
            let tlyrics = "";
            let tarr = [];
            if (res.data.tlyric) {
                tlyrics = res.data.tlyric.lyric;
                // 对获取到的翻译歌词进行处理
                if (tlyrics != "") {
                    tarr = tlyrics.split("\n");
                }
            }
            let time = "";
            let value = "";
            let result = [];
            //去除空行
            let array = [];
            arr.forEach((item) => {
                if (item != "") {
                array.push(item);
                }
            });
            arr = array;
            arr.forEach((item) => {
                time = item.split("]")[0];
                //去掉时间里的中括号得到xx:xx.xxx, 再分成一个数组["xx", "xx.xxx"]
                var t = time.slice(1).split(":");
                value = item.split("]")[1];
                if (tarr.length != 0) {
                    // 在翻译歌词数组中查找与当前原歌词时间相同的元素
                    let tvalue = tarr.find((titem) => {
                        return titem.startsWith(time);
                    });
                    if (tvalue) {
                        // 截取翻译歌词部分
                        tvalue = tvalue.split("]")[1];
                        // 将结果压入最终数组
                        // [parseInt(t[0], 10) * 60 + parseFloat(t[1]) 表示将字符串转换为秒单位的浮点数
                        result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value, tvalue]);
                    } else {
                        // 将没有翻译歌词的结果压入最终数组
                        result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
                    }
                } else {
                    // 将没有翻译歌词的结果压入最终数组
                    result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
                }
            });
            this.lyric = result;
            console.log("歌词数据: ", this.lyric);
        },

        // 请求评论数据
        async getMusicComment(id, type) {
            // 获取时间戳
            var timestamp = Date.parse(new Date());
            this.isCommentLoading = true;
            if (type == "changePage" && this.$store.state.musicId == this.prevMusicId) {
                // 换页滚回评论区顶部 只有当歌曲没变时触发
                let musicDetailCardContainer = document.querySelector(".musicDetailCardContainer");
                let top = document.querySelector(".top");
                musicDetailCardContainer.scrollTo({
                    behavior: "smooth",
                    top: top.clientHeight,
                });
                // console.log("滚回评论区顶部");
            } else if (type == "changePage" && this.$store.state.musicId != this.prevMusicId) {
                // 切歌滚回顶部
                let musicDetailCardContainer = document.querySelector(".musicDetailCardContainer");
                let top = document.querySelector(".top");
                musicDetailCardContainer.scrollTo({
                    behavior: "smooth",
                    top: top.clientHeight - 550,
                });
            }
            // 当页数为第一页时，请求10条热门数据
            if (this.currentCommentPage == 1) {
                let res = await this.$request("/comment/hot", {
                    id,
                    limit: 10,
                    type: 0,
                    timestamp,
                });
                // console.log("歌曲热门评论: ", res);
                if (res.data.code != 200) {
                    this.$message.error("获取热门评论失败,请稍后重试!");
                    return;
                }
                this.hotComments = res.data.hotComments;
            }
            // 获取最新评论
            let res = await this.$request("/comment/music", {
                id,
                offset: (this.currentCommentPage - 1) * 20,
                timestamp,
            });
            // console.log("歌曲最新评论: ", res);
            if (res.data.code !== 200) {
                this.$message.error("获取评论失败,请稍后重试!");
            }
            this.comment = res.data;
            this.isCommentLoading = false;
        },

        // 事件
        // 精彩评论组件是否显示
        isHotCommentCompnShow(comments) {
            if (this.currentCommentPage != 1) return false;
            if (comments.length != 0) {
                return true;
            } else {
                return false;
            }
        },

        // 最新评论组件是否显示
        isNewCommentCompnShow(comment) {
            if (!comment.comments) return false;
            if (this.currentCommentPage != 1) return true;
            if (comment.comments.length != 0) {
                return true;
            } else {
                return false;
            }
        },

        //点击分页按钮的回调
        commentPageChange(page) {
            this.currentCommentPage = page;
            this.getMusicComment(this.$store.state.musicId, "changePage");
            // 更新 prevMusicId，切歌时会自动触发一次
            this.prevMusicId = this.$store.state.musicId;
            // console.log("触发了翻页");
        },

        // 点击跳转至对应的详情页面
        goToDetailPage(name, id) {
            this.$router.push({ name, params: { id } });
            this.$store.commit("changeMusicDetailCardState", false);
        },

        // 获取歌曲封面主题色进行背景渲染 这玩意儿挺吃性能的
        async getBackgroundColor(imgUrl) {
            let result = await rgbaster(imgUrl);
            // console.log("主题色: ", result[0].color);
            let dominantColor = result[0].color;
            let rgbValues = dominantColor.match(/\d+/g);
            if (result) {
                if ((rgbValues[0] > 240 && rgbValues[1] > 240 && rgbValues[2] > 240)
                    || (rgbValues[0] < 15 && rgbValues[1] < 15 && rgbValues[2] < 15)) {
                    this.isColor = true;
                    // 获取的主题色接近纯黑或纯白时 设置默认顶部背景色
                    let musicDetailCard = document.querySelector('.musicDetailCard');
                    musicDetailCard.style.backgroundImage = `linear-gradient(to bottom, #e3e2e3, white)`;
                } else {
                    this.isColor = true;
                    // 将 dominantColor 设置为组件的顶部背景色，并设置透明度为 0.5
                    let musicDetailCard = document.querySelector('.musicDetailCard');
                    musicDetailCard.style.backgroundImage = `linear-gradient(to bottom, rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.1), white)`;
                }
            } else {
                this.isColor = true;
                // 设置默认顶部背景色
                let musicDetailCard = document.querySelector('.musicDetailCard');
                musicDetailCard.style.backgroundImage = `linear-gradient(to bottom, #e3e2e3, white)`;
            }
        }
    },
    watch: {
        "$store.state.isMusicDetailCardShow"(isMusicDetailCardShow) {
            if (!this.isColor) {
                // 只需要还没有播放任何歌曲而且第一次打开的时侯渲染就好了 后面不刷新页面会一直渲染着
                this.isColor = true;
                // 设置默认顶部背景色
                let musicDetailCard = document.querySelector('.musicDetailCard');
                musicDetailCard.style.backgroundImage = `linear-gradient(to bottom, #e3e2e3, white)`;
            }
            this.isMusicDetailCardShow = isMusicDetailCardShow;
            // 性能优化
            // 如果卡片没有展示就不发送请求和渲染里面的内容
            // 删除定时器 避免用户在关闭卡片的1s内又打开卡片 导致展示内容被删除
            clearTimeout(timer);
            this.cleanCard = false;
            if (
                isMusicDetailCardShow &&
                !this.comment.comments &&
                this.$store.state.musicId != ""
            ) {
                // console.log("请求歌词和评论");
                this.getLyric(this.$store.state.musicId);
                this.getMusicComment(this.$store.state.musicId);
            }
            // 当卡片关闭时，延迟3s再删除里面渲染的内容，提升体验
            else if (isMusicDetailCardShow == false) {
                timer = setTimeout(() => {
                    this.cleanCard = true;
                }, 3000);
            }
        },
        // 当vuex中的歌曲id发生变化时,需要重新获取评论和歌词
        "$store.state.musicId"(musicId) {
            // 清空歌词
            this.lyric = [[0, "正在加载歌词"]];
            // 重置评论和页数
            this.currentCommentPage = 1;
            this.comment = {};
            // 更新当前歌曲信息
            if (musicId != '') {
                this.musicInfo = this.$store.state.musicList[this.$store.state.currentIndex];
                this.getBackgroundColor(this.musicInfo.al.picUrl + '?param==300y300');
                // 优化性能,仅在卡片展示时才发送请求
                if (this.isMusicDetailCardShow) {
                    this.getLyric(musicId);
                    this.getMusicComment(musicId);
                }
            } else {
                this.musicInfo = {};
                this.hotComments = [];
                this.comment = {};
                // 设置默认顶部背景色
                this.isColor = true;
                let musicDetailCard = document.querySelector('.musicDetailCard');
                musicDetailCard.style.backgroundImage = `linear-gradient(to bottom, #e3e2e3, white)`;
            }
        }
    }
}
</script>

<style lang="less" scoped>
.musicDetailCard {
    position: fixed;
    width: 100%;
    height: calc(100vh - 80px);
    bottom: 80px;
    left: 0;
    z-index: 1000;
    transition: bottom 0.5s ease;
    background-color: white;
}

.hide {
    bottom: calc(-100vh + 60px);
}

.closeCard .iconfont {
    position: absolute;
    top: 20px;
    left: 50px;
    font-size: 25px !important;
}

.musicDetailCardContainer {
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
}

.top {
    display: flex;
    justify-content: center;
}

.left {
    width: 300px;
    margin: 0 100px 0 -60px;
}

.discContainer {
    margin: 80px 0 70px 0;
    width: 300px;
    position: relative;
}

.needle {
    position: relative;
    left: 50%;
    width: 125px;
    height: 100px;
    z-index: 10000;
    transition: all 1s;
    transform-origin: 7px 7px;
}

.needle img {
    width: 100%;
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.3));
}

.needleRotate {
    transform-origin: 7px 7px;
    transform: rotate(25deg);
}

.disc {
    width: 300px;
    height: 300px;
    position: relative;
    top: -12px;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.disc img:nth-child(1) {
    width: 100%;
}

.disc .musicAvatar {
    position: absolute;
    top: 47px;
    left: 47px;
    width: 206px;
    z-index: -1;
}

/* 碟子设置旋转动画 */
.discAnimation {
    /* infinite动画无限循环 */
    animation: disc 25s linear infinite;
    /* 动画延迟一秒 */
    /* animation-delay: 0.8s; */
}


@keyframes disc {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.pause {
    /* 停止播放时动画保持在当前的进度位置上 */
    animation-play-state: paused;
    -webkit-animation-play-state: paused;
}

.right {
    width: 450px;
}

.title {
    width: 100%;
    margin: 60px 0 15px;
    color: rgb(145, 145, 145);
}

.title div {
    margin: 5px 0;
}

.musicName {
    margin: 10px 0 !important;
    font-size: 30px;
    color: rgb(22, 22, 22);
    white-space: nowrap;
}

.musicInfo {
    display: flex;
    align-items: center;
}

.musicInfo span {
    width: 150px;
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
}

.musicInfo span:hover {
    color: #507ba6;
}

.singer, .album {
    display: flex;
    align-items: center;
    margin-right: 20px !important;
}

.tnsAndAlia {
    display: flex;
    align-items: center;
}

.tnsAndAlia div {
    margin-right: 20px;
    white-space: nowrap;
}

.bottom {
    margin: 50px auto;
    width: 55vw;
}

.commentTip {
    padding: 30px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #6d6d6d;
}

.page {
    width: 100%;
    display: flex;
    justify-content: center;
    padding-bottom: 40px;
}

.tip {
    font-size: 25px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
</style>