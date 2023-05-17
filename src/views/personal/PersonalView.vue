<template>
    <div class="Personal">
        <!-- 用户信息 -->
        <div class="userInfo" v-if="userInfo.avatarUrl">
            <div class="left">
                <img :src="userInfo.avatarUrl + '?param=400y400'" alt="" class="avatar" />
            </div>
            <div class="right">
                <div class="rightTop">
                    <div class="username">
                        <div>{{ userInfo.nickname }}</div>
                        <div class="logout" @click="logout" v-if="isCurrentUser && this.$store.state.isLogin">
                            <i class="iconfont icon-zhuxiao"></i>
                            <span>退出登录</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "PersonalView",
    data() {
        return {
            // 用户信息
            userInfo: {},
            // 创建的歌单
            createdMusicList: [],
            // 收藏的歌单
            collectedMusicList: [],
            // 该用户是否当前登录用户
            isCurrentUser: false,
        }
    },
    methods: {
        // 请求
        // 获取用户信息
        async getUserInfo() {
            let res = await this.$request("/user/detail", {
                uid: this.$route.params.uid,
            });
            if (!res) {
                this.$message.error("获取用户信息失败!");
                return;
            }
            // console.log("用户信息: ", res);
            res.data.profile['level'] = res.data.level;
            this.userInfo = res.data.profile;
            console.log("用户信息: ", this.userInfo);
        },

        // 点击退出登录的回调
        async logout() {
            let timestamp = Date.parse(new Date());
            let res = await this.$request('/logout', { timestamp });
            console.log("尝试退出登录: ", res);
            if (res.data.code != 200) {
                this.$message('退出登录失败, 请稍后重试!');
                return;
            }
            // 删除localstoarge的userId
            window.localStorage.removeItem('userId');
            // 在vuex中更新登录状态、清除缓存
            this.$store.commit('updateLoginState', false);
            this.$store.commit('updateCreatedMusicList', []);
            this.$store.commit('updateCollectMusicList', []);
            this.$store.commit('updateLikeMusicList', []);
            this.$message.success('退出成功!');
            this.isCurrentUser = false;
        },
    },
    async created() {
        await this.getUserInfo();
        // 判断该用户是不是当前登录用户
        if (window.localStorage.getItem('userId')) {
            this.isCurrentUser = window.localStorage.getItem('userId') == this.$route.params.uid;
        }
    },
    watch: {
        '$store.state.isLogin'(current) {
            if (window.localStorage.getItem('userId') && current) {
                this.isCurrentUser = window.localStorage.getItem('userId') == this.$route.params.uid;
            }
        },
    },
}
</script>

<style scoped>
.Personal {
    height: calc(100vh - 145px);
    overflow-y: scroll;
}

.userInfo {
    margin: 40px 20px;
    display: flex;
}

.avatar {
    height: 200px;
    width: 200px;
    object-fit: cover;
    border-radius: 50%;
}
</style>