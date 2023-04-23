<template>
    <div class="headerBar">
        <div class="left">
            <img src="~assets/img/logo.png" alt="" />
        </div>
        <div class="center">
            <div class="buttons">
                <div class="button" @click="$router.go(-1)"><ArrowLeft /></div>
                <div class="button" @click="$router.go(1)"><ArrowRight /></div>
            </div>
        </div>
        <div class="right">
            <div class="user">
                <div class="avatar">
                    <!--登录框-->
                    <el-popover placement="bottom"
                                width="400"
                                trigger="click">
                        <template #reference>
                            <img src="~assets/img/avatar.jpg" alt="" />
                        </template>
                    </el-popover>
                </div>
                <div class="userName">点击头像登录</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        
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
</style>