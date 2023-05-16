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
                    <div class="buttonItem playAll" @click="playAll">
                        <i class="iconfont icon-bofang playAll"></i>
                        <span>播放全部</span>
                    </div>
                    <div class="buttonItem" v-if="!isCreated" @click="collectList">
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
            <el-tabs model-value="first" @tab-click="clickTab">
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
                              :infinite-scroll-immediate="false"
                              @row-dblclick="clickRow">
                        <el-table-column label="" width="42" type="index" :index="handleIndex"></el-table-column>
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
                    <div class="loadMore" v-if="isMore && !this.$store.state.isLogin">
                        登陆后查看更多音乐
                    </div>
                    <div class="placeholder" v-else></div>
                </el-tab-pane>
                <el-tab-pane label="评论" name="second">
                    <div class="commentList"
                         v-if="comments.comments"
                         v-loading="isCommentLoading">
                        <!--精彩评论-->
                        <CommentCompn :commentType="'musicList'"
                                      :comments="comments.hotComments"
                                      :commentId="musicListDetail.id + ''"
                                      :isInputShow="isHotCommentCompnShow(comments.hotComments) ? true : false"
                                      @scrollToComment="scrollToComment"
                                      @getComment="getMusicListComment"
                                      v-if="isHotCommentCompnShow(comments.hotComments)"
                                      ref="hotComments">
                            <template #title>
                                <div>精彩评论</div>
                            </template>
                        </CommentCompn>
                        <!--最新评论-->
                        <CommentCompn :comments="comments.comments"
                                      :commentType="'musicList'"
                                      :commentId="musicListDetail.id + ''"
                                      :isInputShow="isNewCommentCompnShow(comments.hotComments) ? true : false"
                                      @scrollToComment="scrollToComment"
                                      @getComment="getMusicListComment"
                                      @transToHotComment="
                                                (info) =>
                                                $refs.hotComments.replyComment(info.commentId, info.nickName)">
                            <template #title>
                                <div>最新评论</div>
                            </template>
                        </CommentCompn>
                    </div>
                    <!-- 分页 -->
                    <div class="page" v-show="comments.comments && comments.comments.length != 0">
                        <el-pagination background
                                       layout="prev, pager, next"
                                       :total="comments.total"
                                       :page-size="50"
                                       :current-page="currentCommentPage"
                                       @current-change="commentPageChange">
                        </el-pagination>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="收藏者" name="third">
                    <!--使用.slice()将followedsListData.followedsList的值复制到一个新数组中。
                        然后在UserListCard组件的watch中才可以监听到userList的变化-->
                    <UserListCard userType="musicListDetailPage"
                                  :userList="followedsListData.followedsList.slice()"
                                  :isLoad="followedsListData.isMore"
                                  @bottomLoad="bottomLoad"></UserListCard>
                </el-tab-pane>
            </el-tabs>
        </div>
        <!-- 返回顶部组件 -->
        <GoTop scrollObj=".musicListDetail"></GoTop>
    </div>
</template>

<script>
import { formatDate, handleNum, handleMusicTime } from "plugins/utils";
import CommentCompn from "@/components/comment/CommentCompn.vue";
import UserListCard from "@/components/userListCard/UserListCard.vue";
import GoTop from "@/components/goTop/GoTop.vue";

export default {
    name: "MusicListDetail",
    components: {
        CommentCompn,
        UserListCard,
        GoTop,
    },
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
            // 评论
            comments: {},
            // 评论是否在加载
            isCommentLoading: false,
            // 当前评论页数
            currentCommentPage: 1,
            // 收藏者列表的变量
            followedsListData: {
                // 当前页数
                currentPage: 1,
                // 列表
                followedsList: [],
                // 是否还有更多
                isMore: false,
                // 是否已经加载过列表数据 （用于点击收藏者tab后第一次加载数据）
                isLoaded: false,
            },
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
            // console.log("歌曲详情:", res);
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

        // 获取歌单全部歌曲详情
        async getAllMusicDetail() {
            var timestamp = Date.parse(new Date());
            let res = await this.$request("/playlist/track/all", {
                id: this.$route.params.id,
                timestamp,
            });
            // 处理时间
            res.data.songs.forEach((item, index) => {
                res.data.songs[index].dt = handleMusicTime(item.dt);
            });
            // console.log("全部歌曲: ", res);
            return res.data.songs;
        },

        // 获取歌单评论
        async getMusicListComment(type) {
            // 获取时间戳
            var timestamp = Date.parse(new Date());
            this.isCommentLoading = true;
            if (type == "changePage") {
                this.scrollToComment();
            }
            let res = await this.$request("/comment/playlist", {
                id: this.$route.params.id,
                offset: (this.currentCommentPage - 1) * 50,
                limit: 50,
                timestamp,
            });
            // console.log("评论详情: ", res);
            if (res.data.code !== 200) {
                this.$message.error("获取评论失败,请稍后重试!");
            }
            this.comments = res.data;
            this.isCommentLoading = false;
        },

        scrollToComment() {
            let musicListDetail = document.querySelector(".musicListDetail");
            let listInfo = document.querySelector(".listInfo");
            // 将父容器musicListDetail标签滚动到子容器listInfo标签的下面
            musicListDetail.scrollTo({
                behavior: "smooth",
                top: listInfo.clientHeight - 20,
            });
        },

        // 获取歌单收藏者
        async getMusicListFolloweds() {
            let res = await this.$request("/playlist/subscribers", {
                id: this.$route.params.id,
                offset: (this.followedsListData.currentPage - 1) * 20,
            });
            this.followedsListData.isMore = res.data.more;
            this.followedsListData.followedsList.push(...res.data.subscribers);
            // console.log("歌单收藏者: ", this.followedsListData.followedsList);
        },

        // 点击喜欢音乐
        async likeMusic(musicId) {
            // 判断是否登录
            if (!this.$store.state.isLogin) {
                this.$message.warning("只有登陆后才能点赞哦!");
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
                serve != "/m8" &&
                serve != "/m801"
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

        // 点击收藏按钮的回调
        async collectList() {
            if (!this.$store.state.isLogin) {
                return;
            }
            this.isSub = !this.isSub;
            // 请求
            let timestamp = Date.parse(new Date());
            await this.$request("/playlist/subscribe", {
                id: this.$route.params.id,
                t: this.isSub ? 1 : 2,
                timestamp,
            });
            // 请求收藏歌单列表并保存至vuex
            this.getUserMusicList();
        },

        // 请求用户歌单
        async getUserMusicList() {
            let timestamp = Date.parse(new Date());
            // 先从localStorage里面读取用户信息
            let res = await this.$request("/user/playlist", {
                uid: window.localStorage.getItem("userId"),
                timestamp,
            });
            res = res.data.playlist;
            let index = res.findIndex((item) => item.subscribed == true);
            this.collectedMusicList = res.slice(index);
            // 将收藏的歌单上传至vuex
            this.$store.commit("updateCollectMusicList", this.collectedMusicList);
        },


        // 事件函数
        // 点击播放全部按钮的回调
        async playAll() {
            // 一定要先更新歌单再更新歌曲，不然播放时获取不到歌单
            // 如果歌单发生变化，则提交歌单到vuex
            if (this.musicListDetail.id != this.$store.state.musicListId) {
                // 判断是否登录选择播放的歌曲
                if (this.$store.state.isLogin) {
                    let result = await this.getAllMusicDetail();
                    // console.log(result);
                    this.$store.commit("updateMusicList", {
                        musicList: result,
                        musicListId: this.musicListDetail.id,
                    });
                } else {
                    this.$store.commit("updateMusicList", {
                        musicList: this.musicListDetail.tracks,
                        musicListId: this.musicListDetail.id,
                    });
                }
            }     
            // 将当前播放歌曲设为该歌单第一首
            this.$store.commit("updateMusicId", this.musicListDetail.tracks[0].id);       
        },

        // 双击table的row的回调
        async clickRow(row) {
            // console.log(row);
            // 一定要先更新歌单再更新歌曲，不然播放时获取不到歌单
            // 如果歌单发生变化,则提交歌单到vuex
            if (this.musicListDetail.id != this.$store.state.musicListId) {
                // 判断是否登录选择播放的歌曲
                if (this.$store.state.isLogin) {
                    let result = await this.getAllMusicDetail();
                    this.$store.commit("updateMusicList", {
                        musicList: result,
                        musicListId: this.musicListDetail.id,
                    });
                } else {
                    this.$store.commit("updateMusicList", {
                        musicList: this.musicListDetail.tracks,
                        musicListId: this.musicListDetail.id,
                    });
                }
            }
            // let result = await this.$request("/song/url", { id: row.id, br: 320000 });
            // console.log(result.data.data[0].url);
            // this.$store.commit("updateMusicUrl", result.data.data[0].url);
            // 将musicId提交到vuex中 供bottomControl查询歌曲url和其它操作
            this.$store.commit("updateMusicId", row.id);
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

        // 触底加载所有音乐的回调
        loadMore() {
            if (!this.$store.state.isLogin) {
                this.$message.error("请先进行登录操作!");
                return;
            }
            // console.log("加载所有音乐");
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

        // 点击el-tab-pane的回调
        clickTab(e) {
            // console.log(e.index);
            if (e.index == 1 && !this.comments.comments) {
                this.getMusicListComment();
            } else if (e.index == 2 && !this.followedsListData.isLoaded) {
                this.getMusicListFolloweds();
                this.followedsListData.isLoaded = true;
            }
        },

        // 评论点击翻页的回调
        commentPageChange(page) {
            this.currentCommentPage = page;
            this.getMusicListComment("changePage");
        },

        // 精彩评论组件是否显示
        isHotCommentCompnShow(comments) {
            if (comments) {
                if (comments.length != 0) {
                    return true;
                }
            } else {
                return false;
            }
        },

        // 最新评论组件是否显示
        isNewCommentCompnShow(comments) {
            if (this.currentCommentPage != 1) {
                return true;
            } else {
                if (comments) {
                    if (comments.length == 0) {
                        return true;
                    }
                }
                return false;
            }
        },

        // 收藏者列表触底的回调
        bottomLoad() {
            this.followedsListData.currentPage += 1;
            this.getMusicListFolloweds();
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

        // 格式化时间
        showDate(time) {
            // 1、先将时间戳转成Date对象
            const date = new Date(time);
            // 2、将date进行格式化
            return formatDate(date, "yyyy-MM-dd");
        },

        // 更改当前播放音乐的样式
        handleDOM(current, last) {
            // console.log(current, last);
            if (document.querySelector(".musicListDetail")) {
                let tableRows = document
                .querySelector(".musicListDetail")
                .querySelectorAll(".el-table__row");
                // 遍历当前musicList 找到当前播放的index的行进行渲染
                // console.log(tableRows);
                let index = this.musicListDetail.tracks.findIndex(
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
                    let lastIndex = this.musicListDetail.tracks.findIndex(
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
        this.$nextTick(() => {
            // 判断是否和正在播放的歌单相同
            if (this.$route.params.id == this.$store.state.musicListId) {
                this.handleDOM(this.$store.state.musicId);
            }
        });
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
        // 监听当前播放歌曲进行渲染
        "$store.state.musicId"(current, last) {
            this.handleDOM(current, last);
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

.songList {
    margin: 0 20px;
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




.page {
    width: 100%;
    display: flex;
    justify-content: center;
    padding-bottom: 40px;
}
</style>