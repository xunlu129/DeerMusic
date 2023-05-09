<template>
    <div class="bottomControl">
        <audio src="http://m801.music.126.net/20230508151725/1091255275e857df008440e62feeae76/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/25399030527/dadb/06f0/01e8/1524d4cc5a5f8c9ef493b918cc5b9777.mp3"
               ref="audioPlayer"
               autoplay></audio>
        <!--左边-->
        <div class="left">
            <div class="avatar">
                <img src="~assets/img/test.png" alt="" :draggable="false" />
            </div>
            <div class="musicInfo">
                <div class="musicName">
                    The Song of Deer
                </div>
                <div class="singer">
                    寻鹿XD
                </div>
            </div>
        </div>
        <!--中间-->
        <div class="center">
            <div class="buttons">
                <span @click="playType = playType == 'order' ? 'random' : 'order'">
                    <i class="iconfont icon-xunhuan" v-if="playType == 'order'"></i>
                    <i class="iconfont icon-suiji1" v-else></i>
                </span>
                <span>
                    <i class="iconfont icon-shangyishou"></i>
                </span>
                <span>
                    <i class="iconfont icon-icon_play" v-if="!this.$store.state.isPlay"></i>
                    <i class="iconfont icon-zantingtingzhi" v-else></i>
                </span>
                <span>
                    <i class="iconfont icon-xiayishou"></i>
                </span>
                <span>
                    <i class="iconfont icon-xihuan"></i>
                </span>
            </div>
            <!--进度条-->
            <div class="progressBar">
                <span class="currentTime">00:00</span>
                <el-slider class="progressSlider"
                           v-model="timeProgress"
                           :show-tooltip="false"></el-slider>
                <span class="totalTime">05:20</span>
            </div>
        </div>
        <!--右边-->
        <div class="right">
            <div class="volumeControl">
                <i class="iconfont icon-yinliang"></i>
                <el-slider class="volumeSlider"
                           v-model="volume"
                           :show-tooltip="false"></el-slider>
            </div>
            <div class="playList">
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
    </div>
</template>

<script>
export default {
    name: 'BottomControl',
    data() {
        return {
            // 播放模式（顺序播放，随机播放）
            // order random
            playType: "order",
            // 当前进度条位置
            timeProgress: 0,
            // 音量
            volume: 30,
            recondInfo: `<div style='text-align: center; font-size: 12px;'>
粤ICP备2020501116号<br>个人邮箱: 3181716884@qq.com<br>本站为仿网易云音乐展示项目, 仅供学习使用, 侵权必删!</div>`,
        }
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
    /* background-color: #fff; */
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
}

.singer {
    transform: scale(0.9);
    margin-left: -10px;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
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

.icon-yinliang {
  font-size: 25px;
  margin-right: 10px;
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

</style>