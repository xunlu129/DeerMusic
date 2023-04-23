<template>
    <el-container>
        <el-header>
            <HeaderBar></HeaderBar>
        </el-header>
    </el-container>
</template>

<script>
import HeaderBar from "components/headerBar/HeaderBar.vue"

export default {
    components: {
        HeaderBar,
    }
}
</script>

<style scoped>
.el-header {
  background-color: rgb(242, 242, 242);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2); /* 添加阴影 */
  height: 65px !important;
  padding: 0;
  margin: 0;
  z-index: 100;
}
</style>