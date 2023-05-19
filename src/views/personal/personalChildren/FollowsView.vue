<template>
    <div class="follows">
        <div class="title">{{ username + "的关注" }}</div>
        <!--使用.slice()将列表的值复制到一个新数组中。
            然后在UserListCard组件的watch中才可以监听到userList的变化-->
        <UserListCard :userList="userList.slice()"
                      :isLoad="isMore"
                      @bottomLoad="bottomLoad"></UserListCard>
        <GoTop scrollObj=".follows"></GoTop>
    </div>
</template>

<script>
import UserListCard from '@/components/userListCard/UserListCard.vue';
import GoTop from '@/components/goTop/GoTop.vue';

export default {
    name: "FollowsView",
    components: {
        UserListCard,
        GoTop,
    },
    data() {
        return {
            // 当前页数
            currentPage: 1,
            // 用户列表
            userList: [],
            // 用户名
            username: "",
            // 是否还有更多
            isMore: false,
        }
    },
    methods: {
        // 获取关注列表
        async getFollows() {
            let res = await this.$request("/user/follows", {
                uid: this.$route.params.uid,
                offset: (this.currentPage - 1) * 30,
            });
            // console.log("关注列表: ", res);
            this.isMore = res.data.more;
            this.userList.push(...res.data.follow);
        },

        // 获取当前用户信息
        async getUserInfo() {
            let res = await this.$request(`/user/detail?uid=${this.$route.params.uid}`);
            // console.log(res);
            this.username = res.data.profile.nickname;
        },

        // 用户列表触底的回调
        bottomLoad() {
            // console.log("触底了");
            this.currentPage += 1;
            this.getFollows();
        },
    },
    created() {
        this.getUserInfo();
        this.getFollows();
    }
}
</script>

<style scoped>
.follows {
    overflow-y: scroll;
}

.title {
    font-size: 20px;
    color: #373737;
    font-weight: bold;
    margin: 30px 40px;
}
</style>