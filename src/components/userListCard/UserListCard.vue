<template>
    <div class="UserListCard"
         v-infinite-scroll="load"
         :infinite-scroll-disabled="disabled"
         :infinite-scroll-distance="300"
         :infinite-scroll-immediate="false">
        <div class="userItemContainer"
             v-for="(item, index) in userList"
             :key="index">
            <div class="userItem">
                <div class="left">
                    <img :src="item.avatarUrl + '?param200y200'" alt="" class="avatar" @click="goToPersonal(item.userId)" />
                </div>
                <div class="right">
                    <div class="userName"><span @click="goToPersonal(item.userId)">{{ item.nickname }}</span></div>
                    <div class="signature">{{ item.signature }}</div>
                    <div class="nums" v-if="userType == 'personalPage'">
                        <div class="musicListNum">{{ "歌单：" + item.playlistCount }}</div>
                        <div class="fenge">|</div>
                        <div class="followedsNum">{{ "粉丝：" + item.followeds }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "UserListCard",
    data() {
        return {
            // 是否禁止无限滚动
            disabled: false,
        }
    },
    props: {
        userList: {
            type: Array,
            default() {
                return [];
            }
        },
        // 是否使用上拉触底事件
        isLoad: {
            type: Boolean,
            default() {
                return false;
            }
        },
        userType: {
            type: String,
            default() {
                return "personalPage";
            }
        }
    },
    methods: {
        // 上拉触底事件
        load() {
            // console.log("触底加载更多收藏者");
            this.$emit("bottomLoad");
            // 触发load后加载数据 期间不允许再次触发load事件
            this.disabled = true;
        },
        // 点击用户跳转用户主页
        goToPersonal(userId) {
            this.$router.push({
                name: 'personal',
                params: { uid: userId },
            })
        },
    },
    watch: {
        // 数据更新后，可再次触发load事件
        userList() {
            // console.log("userList有变化");
            if (this.isLoad == true) {
                if (this.userList.length != 0) {
                    this.disabled = false;
                } else {
                    this.disabled = true;
                }
            } else {
                this.disabled = true;
            }
        }
    }
}
</script>

<style scoped>
.UserListCard {
    display: flex;
    flex-wrap: wrap;
    height: 100%;
}

.userItemContainer {
    margin: 0 auto;
}

.userItem {
    display: flex;
    width: 500px;
    padding: 15px 15px;
    border-radius: 10px;
}

.userItem:hover {
    background-color: #f9f9f9;
}

.avatar {
    height: 100px;
    width: 100px;
    object-fit: cover;
    border-radius: 50%;
    border: 1px solid #eee;
    margin-right: 15px;
    cursor: pointer;
}

.userName {
    font-size: 20px;
    margin: 12px 0 15px;
    color: #373737;
}

.userName span {
    cursor: pointer;
}

.signature {
    font-weight: lighter;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 350px;
    margin: 5px 0;
    font-size: 16px;
}

.nums {
    display: flex;
    font-size: 16px;
}

.fenge {
    color: #ccc;
    margin: 0 10px;
}
</style>