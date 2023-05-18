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
                    <div class="tags">
                        <div class="level">{{ "Lv" + userInfo.level }}</div>
                        <div class="gender"
                             :class="userInfo.gender == 1 ? 'nan' : 'nv'"
                             v-if="userInfo.gender == 1 || userInfo.gender == 2">
                            <!-- 1男 2女 -->
                            <i class="iconfont icon-nan" v-if="userInfo.gender == 1"></i>
                            <i class="iconfont icon-nv" v-if="userInfo.gender == 2"></i>
                        </div>
                    </div>
                </div>
                <div class="rightBottom">
                    <!-- 动态 关注 粉丝 -->
                    <div class="dataNums">
                        <div class="numItem">
                            <div class="box">
                                <div class="numItemTop">{{ userInfo.eventCount }}</div>
                                <div class="numItemBottom">动态</div>
                            </div>
                        </div>
                        <div class="numItem">
                            <div class="box">
                                <div class="numItemTop">{{ userInfo.newFollows }}</div>
                                <div class="numItemBottom">关注</div>
                            </div>
                        </div>
                        <div class="numItem">
                            <div class="box">
                                <div class="numItemTop">{{ userInfo.followeds }}</div>
                                <div class="numItemBottom">粉丝</div>
                            </div>
                        </div>
                    </div>
                    <!-- 其它信息 -->
                    <div class="otherInfo">
                        <div class="otherInfoItem">
                            <div class="otherInfoKey">用户id：</div>
                            <div class="ptherInfoValue">
                                {{ userInfo.userId }}
                            </div>
                        </div>
                        <div class="otherInfoItem">
                            <div class="otherInfoKey">所在地区：</div>
                            <div class="ptherInfoValue">
                                {{ userInfo.province + " " + userInfo.city }}
                            </div>
                        </div>
                        <div class="otherInfoItem">
                            <div class="otherInfoKey">个人介绍：</div>
                            <div class="ptherInfoValue">
                                {{ userInfo.signature == "" ? "暂无介绍" : userInfo.signature }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="musicList">
            <el-tabs model-value="first" @tab-click="clickTab">
                <el-tab-pane label="创建的歌单" name="first">
                    <ListCard :listCardData="createdMusicList" @clickListCardItem="clickListCardItem"></ListCard>
                </el-tab-pane>
                <el-tab-pane label="收藏的歌单" name="second">
                    <ListCard :listCardData="collectedMusicList" @clickListCardItem="clickListCardItem"></ListCard>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
import provinceAndCity from 'assets/json/province.json';
import ListCard from 'components/listCard/ListCard.vue';

export default {
    name: "PersonalView",
    components: {
        ListCard,
    },
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
            // 增加用户等级
            res.data.profile['level'] = res.data.level;
            // 地区码转义
            if (res.data.profile.province != 1000000) {
                // 1000000就是没设置
                for (var i = 0; i < provinceAndCity.length; i ++) {
                    // 确定省
                    if (provinceAndCity[i].code == res.data.profile.province) {
                        res.data.profile.province = provinceAndCity[i].name;
                        for (var j = 0; j < provinceAndCity[i].cityList.length; j ++) {
                            // 确定市
                            if (provinceAndCity[i].cityList[j].code == res.data.profile.city) {
                                res.data.profile.city = provinceAndCity[i].cityList[j].name;
                                break;
                            }
                        }
                        break;
                    }
                }
            } else {
                res.data.profile.province = "未知";
                res.data.profile.city = "";
            }
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

        // 请求用户歌单
        async getUserMusicList() {
            let timestamp = Date.parse(new Date());
            let res = await this.$request('/user/playlist', {
                uid: this.$route.params.uid,
                timestamp,
            });
            // console.log("用户歌单: ", res);
            // 对数据进行处理分类
            res = res.data.playlist;
            res[0].name = `${this.userInfo.nickname}喜欢的音乐`;
            let index = res.findIndex((item) => item.subscribed == true);
            this.createdMusicList = res.slice(0, index);
            this.collectedMusicList = res.slice(index);
            console.log("用户歌单: ", res);
        },

        // 点击歌单的回调
        clickListCardItem(id) {
            this.$router.push({ name: 'musicListDetail', params: { id } });
        },
    },
    async created() {
        await this.getUserInfo();
        this.getUserMusicList();
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

.right {
    flex: 1;    /* 将元素的伸缩比例设置为 1，即在可用空间中平均分配剩余空间给这个元素 */
    margin-left: 30px;
}

.rightTop {
    width: 100%;
    border-bottom: 1px solid #ddd;
}

.username {
    color: #373737;
    font-size: 30px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
}

.logout {
    margin-right: 10px;
    color: #373737;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    cursor: pointer;
    font-weight: lighter;
    padding: 5px 15px;
    border: 1px solid #ccc;
}

.logout:hover {
    background-color: #f2f2f2;
}

.logout i {
    font-size: 18px;
    margin-right: 5px;
}

.logout span {
    font-size: 18px;
}

.tags {
    display: flex;
    margin: 15px 0;
}

.level {
    font-size: 12px;
    background-color: #f0f0f0;
    padding: 2px 8px;
    border-radius: 10px;
    color: #373737;
    margin-right: 10px;
}

.gender {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.nan {
    background-color: #BFF3FF;
    color: #57B1DB;
}

.nv {
    background-color: #FFCCE7;
    color: #EF77A9;
}

.gender .iconfont {
    font-size: 14px;
    cursor: auto !important;
}

.dataNums {
    display: flex;
    margin: 10px 0 10px;
}

.numItem {
    border-left: 1px solid #ddd;
    padding: 0 25px;
    text-align: center;
}

.numItem:nth-child(1) {
    border-left: none;
    padding-left: 0;
}

.box {
    cursor: pointer;
}

.box:hover .numItemTop {
    color: black;
}

.box:hover .numItemBottom {
    color: #3f3f3f;
}

.numItemTop {
    color: #454545;
    font-size: 20px;
}

.numItemBottom {
    color: #5e5e5e;
    font-size: 12px;
}

.otherInfo {
    font-size: 13px;
    user-select: text !important;
}

.otherInfoItem {
    display: flex;
    padding: 5px 0;
}

.otherInfoKey {
    color: #3d3d3d;
}

.otherInfoValue {
    color: #5e5e5e;
    width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.musicList {
    padding: 0 20px;
    max-width: 1500px;
    margin: 0 auto;
    padding-bottom: 30px;
}
</style>