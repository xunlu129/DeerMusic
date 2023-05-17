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
                <el-popover popper-class="searchPop" 
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
                    <!--热搜榜-->
                    <div style="width: 100%; height: 100%;">
                        这里是热搜榜
                        <el-button @click="searchPopHide()">确认</el-button>
                    </div>
                </el-popover>
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
import Login from 'components/login/LoginPop.vue'

export default {
    components: {Login},
    name: 'HeaderBar',
    data() {
        return {
            userInfo: {},
            isAccountPopShow: false,
            isSearchPopShow: false,
            searchInput: '',
        }
    },
    methods: {
        searchPopShow() {
            this.isSearchPopShow = true;
        },

        searchPopHide() {
            this.isSearchPopShow = false;
        },

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


</style>