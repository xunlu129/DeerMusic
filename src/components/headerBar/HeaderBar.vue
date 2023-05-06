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
                        <el-button @click="searchPopHide(); test()">确认</el-button>
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
                                hide-after="0">
                        <template #reference>
                            <img src="~assets/img/avatar.jpg" alt="" />
                        </template>
                        <Login />
                    </el-popover>
                </div>
                <div class="userName">点击头像登录</div>
            </div>
        </div>
        <!--注册框-->

    </div>
</template>

<script>
import Login from 'components/login/LoginPop.vue'
import { ref } from 'vue';

export default {
    components: {Login},
    name: 'HeaderBar',
    
    setup() {
        let isAccountPopShow = ref(false);
        let isSearchPopShow = ref(false);
        let searchInput = ref('');

        const searchPopShow = () => {
            isSearchPopShow.value = true;
        }

        const searchPopHide = () => {
            isSearchPopShow.value = false;
        }

        const test = () => {
            console.log("test");
        }

        return {
            isAccountPopShow,
            isSearchPopShow,
            searchInput,
            searchPopShow,
            searchPopHide,
            test
        }
    }
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