<template>
    <div class="navBarContainer">
        <div class="navBar">
            <div class="barItem" 
                 :class="index == activeNum ? 'active' : ''"
                 v-for="(item, index) in navBarItem"
                 :key="index"
                 @click="clickBarItem(item.path, index)">{{ item.name }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'NavBar',
    data() {
        return {
            activeNum: 0,
        }
    },
    props: {
        navBarItem: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    created() {
        // 根据地址判断 activeNum
        this.navBarItem.forEach((item, index) => {
            if (decodeURI(this.$route.path).search(item.path) != -1) {
                this.activeNum = index;
            }
        });
    },
    methods: {
        clickBarItem(path, index) {
            if (this.activeNum == index) {
                return;
            }
            // console.log(path);
            this.activeNum = index;
            this.$emit("clickBarItem", path);
        }
    }
}
</script>

<style scoped>
.navBarContainer {
    height: 80px;
    width: 100%;
    position: relative;
}

.navBar {
    display: flex;
    position: relative;
    left: 0px;
    top: 0;
    background-color: #fff;
    width: 100%;
    color: rgb(60, 60, 60);
    align-items: center;
    padding: 20px 0 26px 40px;
}

.barItem {
    margin: 0 15px;
    text-align: center;
    cursor: pointer;
    font-size: 18px;
}

.barItem:hover {
    color: black;
}

.active {
    font-size: 20px;
    color: rgb(40, 40, 40);
    font-weight: 600;
    padding-bottom: 7px;
    border-bottom: 4px solid rgb(216, 159, 85);
    transform: translateY(4px);
}
</style>