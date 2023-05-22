<template>
    <div class="searchUser">
        <UserListCard :userList="searchUserList" userType="searchUserPage"></UserListCard>
        <!-- 分页 -->
        <div class="page" v-if="searchUserList.length != 0">
            <el-pagination background
                           layout="prev, pager, next"
                           :total="userCount"
                           :page-size="30"
                           :current-page="currentPage"
                           @current-change="pageChange"></el-pagination>
        </div>
    </div>
</template>

<script>
import UserListCard from '@/components/userListCard/UserListCard.vue';

export default {
    name: "SearchUser",
    components: {
        UserListCard,
    },
    data() {
        return {
            // 搜索到的用户列表
            searchUserList: [],
            // 搜索到的用户数量
            userCount: 0,
            searchInfo: "",
            // 当前页数
            currentPage: 1,
        }
    },
    methods: {
        // 请求
        // 搜索相关用户的回调
        async getSearchUser() {
            let res = await this.$request("/cloudsearch", {
                keywords: this.$route.params.id,
                offset: 30 * (this.currentPage - 1),
                type: 1002,
            });
            console.log("搜索到的用户: ", res);
            this.userCount = res.data.result.userprofileCount;
            this.searchInfo = "找到 " + res.data.result.userprofileCount + " 位用户";
            this.searchUserList = res.data.result.userprofiles;
            this.$emit("getSearchInfo", this.searchInfo);
        },

        // 点击翻页的回调
        pageChange(page) {
            this.currentPage = page;
            this.searchUserList = [];
            this.getSearchUser();
        },
    },
    created() {
        this.getSearchUser();
    },
}
</script>

<style scoped>
.searchUser {
    margin: 0 20px;
}

.page {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 30px 0 40px 0;
}
</style>