<template>
    <div class="lyricsScroll">
        <!-- 占位 -->
        <div class="placeholder"></div>
        <!-- 歌词item -->
        <!-- 因为歌词快了一句,所以减1 -->
        <div class="lyricsItem"
            :class="lyricsIndex - 1 == index ? 'currentLyric' : ''"
            v-for="(item, index) in lyric"
            :key="index">
            <span>{{ item[1] }}</span>
            <span v-if="item[2]" class="tns">{{ item[2] }}</span>
        </div>
        <!-- 占位 -->
        <div class="placeholder"></div>
    </div>
</template>

<script>
let placeholderHeight = 0;

export default {
    name: "LyricsScroll",
    props: {
        lyric: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            // 当前歌词索引
            lyricsIndex: 0,
        }
    },
    methods: {
        // 实现歌词滚动
        lyricScroll(currentLyric) {
            // 获取歌词Items
            let lyricsArr = document.querySelectorAll(".lyricsItem");
            // 获取歌词框
            let lyrics = document.querySelector(".lyricsScroll");
            // placeholder的高度 .offsetTop是指该元素的上边界相对于最近的定位父元素上边界的偏移量
            if (placeholderHeight == 0) {
                placeholderHeight = lyricsArr[0].offsetTop - lyrics.offsetTop;
            }
            // console.log("当前歌词索引: ", currentLyric);
            if (lyricsArr[currentLyric - 1]) {
                let distance = lyricsArr[currentLyric - 1].offsetTop - lyrics.offsetTop;
                lyrics.scrollTo({
                    behavior: "smooth",
                    top: distance - placeholderHeight,
                });
            }
        },
        //获取当前歌词索引
        getCurrentLyricsIndex(currentTime) {
            let lyricsIndex = 0;
            this.lyric.some((item) => {
                if (lyricsIndex < this.lyric.length - 1) {
                    if (currentTime > item[0]) {
                        // 当前时间如果大于遍历到的歌词的时间，就表示还没定位到对应歌词，索引加一
                        lyricsIndex += 1;
                    }
                    // 返回false继续遍历
                    // 直到遍历到的歌词的时间大于等于当前时间，就表示定位到对应歌词了，返回true结束遍历
                    return currentTime <= item[0];
                }
            });
            // console.log("当前歌词索引: ", lyricsIndex);
            this.lyricsIndex = lyricsIndex;
        }
    },
    watch: {
        // 监听当前播放时间
        "$store.state.currentTime"(currentTime, lastTime) {
            // 如果两个时间间隔有1秒,则可得知进度条被拖动 需要重新校准歌词index
            // 当歌词数量大于1并且索引为零时,可能歌词位置差距较大,走这个if进行快速跳转
            if (
                (lastTime && Math.abs(currentTime - lastTime) >= 1) ||
                (this.lyricsIndex == 0 && this.lyric.length > 1)
            ) {
                // 处理播放时间跳转时歌词位置的校准
                if (this.lyric.length > 1) {
                    this.getCurrentLyricsIndex(currentTime);
                    // 滑动到当前歌词
                    this.lyricScroll(this.lyricsIndex);
                }
            }
            // 根据实时播放时间实现歌词滚动
            if (this.lyricsIndex < this.lyric.length) {
                if (currentTime >= this.lyric[this.lyricsIndex][0]) {
                    this.lyricsIndex += 1;
                    this.lyricScroll(this.lyricsIndex);
                }
            }
        },
        // 监听vuex中的musicId 重置歌词索引
        "$store.state.musicId"() {
            this.lyricsIndex = 0;
        },
        // 监听歌词获取
        lyric() {
            // console.log("获取了歌词");
            // 大于一秒，说明歌词在1秒后才请求成功 歌词可能不能马上跳转到当前时间 这里进行校准
            if (this.$store.state.currentTime > 1) {
                // 处理播放时间跳转时歌词位置的校准
                if (this.lyric.length > 1) {
                    this.getCurrentLyricsIndex(this.$store.state.currentTime);
                    this.$nextTick(() => {
                        // 滑动到当前歌词
                        this.lyricScroll(this.lyricsIndex);
                    });
                }
            }
        },
    }
}
</script>

<style scoped>
.lyricsScroll {
    width: 100%;
    height: 100%;
    overflow: hidden;
    overflow-y: scroll;
    padding-right: 8px;
}

.lyricsScroll:hover {
    padding-right: 0px !important;
}

.lyricsScroll::-webkit-scrollbar {
    display: none;
}

.lyricsScroll:hover::-webkit-scrollbar {
    display: initial;
}

.lyricsItem {
    font-size: 16px;
    margin: 35px 0px;
    transition: all 0.3s;
    line-height: 25px;
    display: flex;
    flex-direction: column;
}

.lyricsItem > span {
    text-align: center;
}

.tns {
    font-size: 14px;
    transition: all 0.3s;
}

.currentLyric {
    font-weight: 600;
    font-size: 20px;
    line-height: 30px;
    color: black;
}

.currentLyric .tns {
    font-weight: normal;
    font-size: 18px;
}

.placeholder {
    width: 100%;
    height: 35%;
}
</style>