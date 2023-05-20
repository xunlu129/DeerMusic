<template>
    <div class="headerBar">
        <!--LOGO-->
        <div class="left">
            <img src="~assets/img/logo.png" alt="" />
        </div>
        <div class="center">
            <!--返回和前进-->
            <div class="buttons">
                <div class="button" @click="$router.go(-1)"><ArrowLeft /></div>
                <div class="button" @click="$router.go(1)"><ArrowRight /></div>
            </div>
            <!--搜索框-->
            <div class="search">
                <!-- <el-popover popper-class="searchPop" 
                            popper-style="width: 350px; height: 450px; padding: 12px 12px 0 12px !important;" 
                            placement="bottom" 
                            :visible="isSearchPopShow"
                            show-arrow="false">
                    <template #reference>
                        <el-input placeholder="请输入内容" 
                                  prefix-icon="Search" 
                                  v-model="searchInput"
                                  @focus="searchPopShow()"
                                  @blur="searchPopHide()"></el-input>
                    </template>
                    <div style="width: 100%; height: 100%;">
                        这里是热搜榜
                        <el-button @click="searchPopHide()">确认</el-button>
                    </div>
                </el-popover> -->
                <!-- 因为element-plus的气泡组件实在实现不了我想要的效果，干脆自己写了一个:-( -->
                <el-input placeholder="请输入内容" 
                          prefix-icon="Search" 
                          v-model="searchInput"
                          @input="inputSearch"
                          @focus="searchPopShow()"
                          @keyup.enter="onSubmit"
                          ref="searchInput"></el-input>
                <div :class="{ 'searchPopShow': isSearchPopShow, 'searchPopHide': !isSearchPopShow }"
                     ref="searchPop"
                     id="searchPop">
                    <!-- 热搜榜 -->
                    <div class="hotSearch" v-if="!searchSuggestList.songs">
                        <div class="hotSearchTitle">热搜榜</div>
                        <div class="hotSearchItem"
                             v-for="(item, index) in hotSearchList"
                             :key="index"
                             @click="clickHotSearchItem(item.searchWord)">
                            <div class="hotSearchIndex"
                                 :class="index < 3 ? 'topThree' : ''">
                                {{ index + 1 }}
                            </div>
                            <div class="hotSearchInfo">
                                <div class="hotSearchWord"
                                     :class="index < 3 ? 'hotSearchWordTopThree' : ''">
                                    {{ item.searchWord }}
                                </div>
                                <div class="hotSearchContent">{{ item.content }}</div>
                            </div>
                        </div>
                    </div>
                    <!-- 搜索建议 -->
                    <div class="searchSuggest">
                        <div class="hotSearchTitle" v-if="searchSuggestList.songs">
                            搜索建议
                        </div>
                        <!-- 单曲 -->
                        <div class="searchSuggestItem"
                             v-if="searchSuggestList.songs && searchSuggestList.songs.length != 0">
                            <div class="searchSuggestItemTitle">
                                <i class="iconfont icon-yinle"></i> 单曲
                            </div>
                            <div class="suggestItemDetail"
                                 v-for="(item, index) in searchSuggestList.songs"
                                 :key="index"
                                 @click="clickSuggestSong(item.id)">
                                {{ item.name }}
                                <span v-if="item.alias.length != 0">({{ item.alias[0] }})</span>
                                {{ " - " + item.artists[0].name }}
                            </div>
                        </div>
                        <!-- 歌手 -->
                        <div class="searchSuggestItem"
                             v-if="searchSuggestList.artists &&
                                   searchSuggestList.artists.length != 0">
                            <div class="searchSuggestItemTitle">
                                <i class="iconfont icon-mic"></i> 歌手
                            </div>
                            <div class="suggestItemDetail"
                                 v-for="(item, index) in searchSuggestList.artists"
                                 :key="index"
                                 @click="clickSuggestSinger(item.id)">
                                {{ item.name }}
                            </div>
                        </div>
                        <!-- 专辑 -->
                        <div class="searchSuggestItem"
                             v-if="searchSuggestList.albums &&
                                   searchSuggestList.albums.length != 0">
                            <div class="searchSuggestItemTitle">
                                <i class="iconfont icon-more"></i> 专辑
                            </div>
                            <div class="suggestItemDetail"
                                 v-for="(item, index) in searchSuggestList.albums"
                                 :key="index"
                                 @click="clickSuggestAlbum(item.id)">
                                {{ item.name + " - " + item.artist.name }}
                            </div>
                        </div>
                        <!-- 歌单 -->
                        <div class="searchSuggestItem"
                             v-if="searchSuggestList.playlists &&
                                   searchSuggestList.playlists.length != 0">
                            <div class="searchSuggestItemTitle">
                                <i class="iconfont icon-gedan"></i> 歌单
                            </div>
                            <div class="suggestItemDetail"
                                 v-for="(item, index) in searchSuggestList.playlists"
                                 :key="index"
                                 @click="clickSuggestMusicList(item.id)">
                                {{ item.name }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--账户相关-->
        <div class="right">
            <div class="user">
                <div class="avatar">
                    <!--登录框-->
                    <el-popover popper-class="accountPop" 
                                placement="bottom" 
                                width="350" 
                                trigger="click" 
                                hide-after="0"
                                v-if="!userInfo.avatarUrl"
                                @show="isAccountPopShow = true"
                                @hide="isAccountPopShow = false">
                        <template #reference>
                            <img src="~assets/img/avatar.jpg" alt="" />
                        </template>
                        <Login v-if="isAccountPopShow" 
                               @getUserInfo="(info) => {userInfo = info; isAccountPopShow = false;}"/>
                    </el-popover>
                    <img :src="userInfo.avatarUrl" alt="" v-else @click="goToPersonal" />
                </div>
                <div class="userName" v-if="userInfo.avatarUrl">{{ userInfo.nickname }}</div>
                <div class="userName" v-else>点击头像登录</div>
            </div>
        </div>
        <!--注册框-->

    </div>
</template>

<script>
import { handleMusicTime } from 'plugins/utils';
import Login from 'components/login/LoginPop.vue'
// 节流定时器名称
let timer;

export default {
    components: {Login},
    name: 'HeaderBar',
    data() {
        return {
            // 用户信息
            userInfo: {},
            // 是否显示登录框
            isAccountPopShow: false,
            // 是否显示热搜框
            isSearchPopShow: false,
            // 需要搜索的内容
            searchInput: '',
            // 热搜列表数据
            hotSearchList: [],
            // 搜索建议列表
            searchSuggestList: {},
        }
    },
    methods: {
        // 请求
        // 获取当前用户信息
        async getCurrentUserInfo() {
            var timestamp = Date.parse(new Date());
            let res = await this.$request('/user/account', {
                timestamp,
            });
            if (res.data.profile != null) {
                this.userInfo = res.data.profile;
                // 更新登录状态
                this.$store.commit('updateLoginState', true);
                // 将请求到的用户id存入localstorage
                window.localStorage.setItem('userId', res.data.profile.userId);
            } else {
                // 未登录
                this.$store.commit('updateLoginState', false);
                // 如果localstorage存有userId就清除
                if (window.localStorage.getItem('userId')) {
                    window.localStorage.removeItem('userId');
                }
            }
        },

        // 获取热搜列表
        async getHotSearch() {
            let res = await this.$request('/search/hot/detail');
            console.log("热搜列表: ", res);
            this.hotSearchList = res.data.data;
        },

        // 获取搜索建议
        async getSearchSuggest(keywords) {
            let res = await this.$request('/search/suggest', { keywords });
            console.log("搜索建议: ", res);
            this.searchSuggestList = res.data.result;
        },

        // 根据id获取歌曲详情
        async getMusicInfo(ids) {
            let res = await this.$request('/song/detail', { ids });
            // console.log("获取歌曲详情: ", res);
            // 处理时间
            res.data.songs[0].dt = handleMusicTime(res.data.songs[0].dt);
            return res.data.songs[0];
        },


        // 事件
        // 显示搜索框
        searchPopShow() {
            var searchPop = document.getElementById('searchPop');
            searchPop.classList.remove('searchPopHidden');
            // 设置延时，让searchPopHidden被移除后出现透明的searchPopHide，再显示搜索框，以达到淡入效果
            setTimeout(() => {
                this.isSearchPopShow = true;
            }, 50);
        },

        // 隐藏搜索框
        searchPopHide() {
            this.isSearchPopShow = false;
            var searchPop = document.getElementById('searchPop');
            // 设置延时，让搜索框淡出后再隐藏透明的searchPopHide
            setTimeout(() => {
                searchPop.classList.add('searchPopHidden');
            }, 300);
            
        },

        // 点击搜索框和气泡框外的空白处关闭气泡
        handleOutsideClick(event) {
            const inputElement = this.$refs.searchInput.$el; // 输入框元素
            const popoverElement = this.$refs.searchPop; // 气泡框元素
            if (
                !inputElement.contains(event.target) &&
                !popoverElement.contains(event.target)
            ) {
                this.searchPopHide();
            }
        },

        // 在搜索框中输入的回调
        inputSearch(e) {
            // console.log(e);
            clearTimeout(timer);
            if (e != '') {
                timer = setTimeout(() => {
                    this.getSearchSuggest(e);
                }, 500);
            } else {
                // 清空searchSuggestList
                this.searchSuggestList = {};
                return;
            }
        },

        // 点击热搜榜item的回调
        clickHotSearchItem(searchWord) {
            this.searchInput = searchWord;
            this.goSearch();
        },

        // 在输入框按下回车的回调
        onSubmit(e) {
            // console.log(e);
            if (e.key === 'Enter' && this.searchInput != '') {
                this.goSearch();
            }
        },

        // 跳转至搜索详情页面
        goSearch() {
            this.searchPopHide();
            this.$router.push({ name: 'search', params: { id: this.searchInput } });
        },

        // 点击搜索建议中单曲的回调
        async clickSuggestSong(id) {
            console.log("搜索音乐id: ", id);
            let row = await this.getMusicInfo(id);
            this.searchPopHide();
            // 首先获取当前的歌单列表和歌曲索引
            let musicList = this.$store.state.musicList;
            let currentIndex = this.$store.state.currentIndex;
            // 先判断该歌曲是否已经在歌单中存在，避免重复点击导致歌单出现相同歌曲
            let isExist = musicList.find((item) => item.id == row.id);
            if (isExist) {
                // 如果已经存在 则只提交歌曲id并return出去
                this.$store.commit('updateMusicId', row.id);
                return;
            }
            this.$store.commit('changePlayState', false);
            // 将请求到的歌曲详情插入到歌单对应位置并提交至vuex
            // 数组的 splice() 方法用于在数组中插入、删除或替换元素
            // currentIndex + 1: 表示要插入新元素的位置为当前索引的下一个
            // 0: 表示要删除的元素数量
            musicList.splice(currentIndex + 1, 0, row);
            this.$store.commit('updateMusicId', row.id);
            this.$store.commit('updateMusicList', {
                musicList,
                musicListId: this.$store.state.musicListId,
            });
        },

        // 点击搜索建议中歌手的回调
        clickSuggestSinger(id) {
            console.log("搜索歌手id: ", id);
            this.searchPopHide();
        },

        // 点击搜索建议中专辑的回调
        clickSuggestAlbum(id) {
            console.log("搜索专辑id: ", id);
            this.searchPopHide();
        },

        // 点击搜索建议中歌单的回调
        clickSuggestMusicList(id) {
            console.log("搜索歌单id: ", id);
            this.$router.push({ name: 'musicListDetail', params: { id } });
            this.searchPopHide();
        },

        // 跳转到个人主页
        goToPersonal() {
            if (this.$route.path != `/personal/${this.userInfo.userId}`) {
                this.$router.push({
                    name: 'personal',
                    params: { uid: this.userInfo.userId },
                })
            }
        }
    },
    async created() {
        this.getHotSearch();
        this.getCurrentUserInfo();

        if (document.cookie.search('MUSIC_U=') != -1) {
            // 如果本地存有cookie，则先暂时判定为已登录，
            // 以解决登录状态下在视频页等需要登录的页面刷新因为登录状态默认为false，
            // 需要等待获取用户信息请求结束后更新用户状态才有进入视频页的权限，导致被返回到发现音乐页面，体验很差
            // 后面获取用户信息将再次确认用户是否登录
            this.$store.commit('updateLoginState', true);
        }
    },
    watch: {
        '$store.state.isLogin'(current) {
            // 如果退出登录后数据还没清空，则清空数据
            if (!current && this.userInfo.nickname) {
                this.userInfo = {};
            }
        },
    },
    mounted() {
        // 页面渲染后创建点击事件的监听器
        window.addEventListener("click", this.handleOutsideClick);
        // 页面渲染后给搜索框增加隐藏类，否则存在一个透明的搜索框
        var searchPop = document.getElementById('searchPop');
        searchPop.classList.add('searchPopHidden');
    },
    beforeUnmount() {
        // 页面结束渲染前销毁点击事件的监听器
        window.removeEventListener("click", this.handleOutsideClick);
    },
}
</script>

<style scoped>
.headerBar {
    display: flex;
    align-items: center;
    width: 100%;
    height: 65px;
    position: relative;
    z-index: 30000;
}
.left {
    width: 160px;
    margin: 0 50px 0 20px;
}

.left img {
    width: 100%;
}

.center {
  display: flex;
  align-items: center;
}

.buttons {
    height: 25px;
}

.button {
    display: inline-block;
    text-align: center;
    cursor: pointer;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: background-color 0.1s ease-in-out;
    margin: 0 5px;
    border-radius: 50%;
    height: 25px;
}

.button:hover {
    background-color: #f5f5f5;
}

.button svg {
    font-size: 12px;
    padding: 5px;
    height: 25px;
}

.right {
  display: flex;
  position: absolute;
  right: 50px;
  top: 0;
  height: 65px;
  line-height: 65px;
  align-items: center;
}

.user {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 7px;
  cursor: pointer;
  line-height: 30px;
}

.avatar img {
  width: 100%;
}

.userName {
    width: 150px;
    font-size: 16px;
    color: rgb(100, 100, 100);
}

.search {
    margin: 0px 0px 0px 50px;
}

.el-input {
    --el-input-focus-border: #c0c4cc;
    --el-input-focus-border-color: #c0c4cc;
    --el-input-border-radius: 30px;
    width: 80%;
    --el-input-height: 35px;
}

.searchPopShow {
    position: absolute;
    top: 60px;
    left: 244px;
    width: 380px;
    height: 480px;
    background-color: #fff;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    border-radius: 5px;
    opacity: 1; /* 透明度为1 */
    transition: opacity 0.3s ease;
}

.searchPopHide {
    position: absolute;
    top: 60px;
    left: 244px;
    width: 380px;
    height: 480px;
    background-color: #fff;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    border-radius: 5px;
    opacity: 0; /* 透明度为0 */
    transition: opacity 0.3s ease;
}

.searchPopHidden {
    display: none;  /* 真正隐藏搜索框 */
}

.hotSearch {
    height: 100%;
    overflow: hidden;
    overflow-y: scroll;
}

.hotSearchTitle {
    font-size: 18px;
    padding: 20px 0 8px 25px;
}

.hotSearchItem {
    display: flex;
    align-items: center;
    padding: 10px 0;
    height: 60px;
    cursor: pointer;
}

.hotSearchItem:hover {
    background-color: #f2f2f2;
}

.hotSearchIndex {
    margin-left: 20px;
    width: 40px;
    color: #aaa;
}

.topThree {
    color: #e13e3e;
}

.hotSearchWord {
    font-size: 15px;
    color: rgb(51, 51, 51);
}

.hotSearchWordTopThree {
    font-weight: 600;
    color: black;
}

.hotSearchContent {
    font-size: 13px;
    margin-top: 5px;
    color: rgb(132, 132, 132);
}

.searchSuggest {
    height: 100%;
    overflow: hidden;
    overflow-y: scroll;
}

.searchSuggestItemTitle {
    background-color: #f7f7f7;
    padding: 10px 10px;
    font-size: 17px;
}

.suggestItemDetail {
    padding: 10px 32px;
    line-height: 20px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

.suggestItemDetail:hover {
    background-color: #f2f2f2;
}

.suggestItemDetail span {
    color: #ccc;
}

</style>