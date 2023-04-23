<template>
    <div class="headerBar">
        <div class="left">
            <img src="~assets/img/logo.png" alt="" />
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
  margin: 0 50px 0 10px;
}

.left img {
  width: 100%;
}
</style>