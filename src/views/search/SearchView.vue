<template>
    <div class="searchContainer">
        <div class="title">
            搜索 {{ $route.params.id }}
        </div>
        <div class="multiMatch" v-if="$store.state.multiMatch.length != 0">
            <span>你可能感兴趣</span>
            <div class="matchList">
                <div class="matchItem" 
                     v-for="(item, index) in $store.state.multiMatch"
                     :key="index"
                     @click="item.order == 'artist' ? clickArtist(item.id) :
                             item.order == 'playlist' ? clickPlayList(item.id) :
                             clickVideo(item.resourceId)">
                    <div class="matchCover">
                        <img :src="item.img1v1Url + '?param==200y200'" alt=""
                             class="artistCover"
                             v-if="item.order == 'artist'"/>
                        <img :src="item.coverImgUrl + '?param==200y200'" alt=""
                             class="playlistCover"
                             v-if="item.order == 'playlist'"/>
                        <img :src="item.baseInfo.resource.mlogBaseData.coverUrl" alt=""
                             class="new_mlogCover"
                             v-if="item.order == 'new_mlog'"/>
                    </div>
                    <div class="matchContext">
                        <div v-if="item.order == 'artist'">
                            <div class="matchContextTop">
                                歌手：{{ item.name }}
                                <span v-if="item.alias.length != 0">({{ item.alias[0] }})</span>
                            </div>
                            <div class="matchContextBottom">
                                粉丝：{{ item.fansSize }}，歌曲：{{ item.musicSize }}
                            </div>
                        </div>
                        <div v-if="item.order == 'playlist'">
                            <div class="matchContextTop">
                                歌单：{{ item.name }}
                            </div>
                            <div class="matchContextBottom">
                                歌曲：{{ item.trackCount }}，播放：{{ item.playCount }}
                            </div>
                        </div>
                        <div v-if="item.order == 'new_mlog'" class="matchVideoContext">
                            视频：{{ item.baseInfo.resource.mlogBaseData.text }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 导航栏 -->
        <div class="navBar">
            <NavBar :navBarItem="navBarData" @clickBarItem="clickBarItem" style="padding-left: 5px;"></NavBar>
            <div class="info">{{ searchInfo }}</div>
        </div>        
        <router-view @getSearchInfo="getSearchInfo"></router-view>
    </div>
</template>

<script>
import { handleNum } from 'plugins/utils.js';
import NavBar from '@/components/navBar/NavBar.vue';

export default {
    name: "SearchView",
    components: {
        NavBar,
    },
    data() {
        return {
            // 多重匹配列表
            multiMatch: [],
            // 搜索信息
            searchInfo: "",
            // 导航栏列表
            navBarData: [
                {
                    name: "单曲",
                    path: `/search/searchsong/${this.$route.params.id}`,
                },
                {
                    name: "歌手",
                    path: `/search/searchsinger/${this.$route.params.id}`,
                },
                {
                    name: "专辑",
                    path: `/search/searchalbum/${this.$route.params.id}`,
                },
                {
                    name: "视频",
                    path: `/search/searchvideo/${this.$route.params.id}`,
                },
                {
                    name: "歌单",
                    path: `/search/searchmusiclist/${this.$route.params.id}`,
                },
                {
                    name: "用户",
                    path: `/search/searchuser/${this.$route.params.id}`,
                },
            ]
        }
    },
    methods: {
        // 请求
        // 获取多重匹配
        async getMultiMatch() {
            let res = await this.$request("/search/multimatch", {
                keywords: this.$route.params.id,
            });
            // console.log("多重匹配结果: ", res);
            // 选择三个多重匹配添加到multiMatch
            if (res.data.result.artist && this.multiMatch.length < 3) {
                for (let i = 0; i < res.data.result.artist.length; i ++) {
                    // 增加一个判别属性
                    res.data.result.artist[i].order = "artist";
                    // 处理大于一万的数字
                    res.data.result.artist[i].fansSize = handleNum(res.data.result.artist[i].fansSize);
                    this.multiMatch.push(res.data.result.artist[i]);
                    if (this.multiMatch.length == 3) break;
                }                
            }
            if (res.data.result.playlist && this.multiMatch.length < 3) {
                for (let i = 0; i < res.data.result.playlist.length; i ++) {
                    // 增加一个判别属性
                    res.data.result.playlist[i].order = "playlist";
                    // 处理大于一万的数字
                    res.data.result.playlist[i].playCount = handleNum(res.data.result.playlist[i].playCount);
                    this.multiMatch.push(res.data.result.playlist[i]);
                    if (this.multiMatch.length == 3) break;
                }                
            }
            if (res.data.result.new_mlog && this.multiMatch.length < 3) {
                for (let i = 0; i < res.data.result.new_mlog.length; i ++) {
                    // 增加一个判别属性
                    res.data.result.new_mlog[i].order = "new_mlog";
                    this.multiMatch.push(res.data.result.new_mlog[i]);
                    if (this.multiMatch.length == 3) break;
                }                
            }
            // console.log("你可能感兴趣: ", this.multiMatch);
            // 上传vuex解决切换导航栏时，重新渲染search页面导致的你可能感兴趣内容闪一下
            this.$store.commit("updateMultiMatch", this.multiMatch);
        },

        // 事件
        // 点击navBar的回调
        clickBarItem(path) {
            if (path != this.$route.path) {
                this.$router.push(path);
            }
        },

        // 点击感兴趣歌手的回调
        clickArtist(id) {
            // console.log("歌手id: ", id);
            this.$router.push({ name: 'singerDetail', params: { id } });
        },

        // 点击感兴趣歌单的回调
        clickPlayList(id) {
            // console.log("歌单id: ", id);
            this.$router.push({ name: 'musicListDetail', params: { id } });
        },

        // 点击感兴趣视频的回调
        clickVideo(id) {
            // console.log("视频id: ", id);
            this.$router.push({ name: 'videoDetail', params: { id, type: "mv" } });
        },

        // 更新返回的搜索信息
        getSearchInfo(info) {
            this.searchInfo = info;
            // console.log(this.searchInfo);
        }
    },
    created() {
        // console.log("渲染search页面");
        this.getMultiMatch();
    }
}
</script>

<style scoped>
.title {
    padding: 20px 0 10px 20px;
    font-size: 25px;
    font-weight: 600;
    color: rgb(50, 50, 50);
}

.multiMatch {
    padding: 10px 0 0 20px;
}

.multiMatch span {
    font-size: 14px;
    color: rgb(128, 128, 128);
}

.matchList {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

.matchItem {
    min-width: 400px;
    width: 400px;
    height: 100px;
    margin-right: 10px;
    border-radius: 5px;
    background-color: #f4f4f4;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.matchCover {
    height: 75px;
    width: auto;
    margin: 0 15px;
}

.artistCover {
    height: 100%;
    border-radius: 50%;
}

.playlistCover {
    height: 100%;
    border-radius: 5px;
}

.new_mlogCover {
    height: 100%;
    border-radius: 5px;
}

.matchContext {
    padding-right: 10px;
}

.matchContextTop {
    color: rgb(65, 65, 65);
    font-size: 18px;
    line-height: 25px;
    width: 285px;
    display: -webkit-box;
    text-overflow: ellipsis;
    overflow: hidden;
    -webkit-line-clamp: 1;  /* 第一行截断 */
    -webkit-box-orient: vertical;
}

.matchVideoContext {
    color: rgb(65, 65, 65);
    font-size: 18px;
    line-height: 25px;
    width: 225px;
    display: -webkit-box;
    text-overflow: ellipsis;
    overflow: hidden;
    -webkit-line-clamp: 2;  /* 第二行截断 */
    -webkit-box-orient: vertical;
}

.matchContextTop span {
    font-size: 18px;
    color: rgb(150, 150, 150);
}

.matchContextBottom {
    color: rgb(150, 150, 150);
    font-size: 15px;
    margin-top: 10px;
}

.navBar {
    display: flex;
    align-items: center;
}

.info {
    color: rgb(150, 150, 150);
    margin-right: 30px;
    white-space: nowrap;
}
</style>