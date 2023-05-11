<template>
    <div class="navBar">
        <!-- 如果传入的宽度是0则不设置宽度，宽度自适应 -->
        <div :class="index == activeNum ? 'active' : 'barItem'"
             v-for="(item, index) in SecondNavBarData"
             :key="index"
             @click="clickSecondBarItem(index)"
             :style="itemWidth == 0 ? '' : 'width:' + itemWidth + 'px;'">
            {{ item.name }}
        </div>
    </div>
</template>

<script>
export default {
    name: "SecondNavBar",
    data() {
        return {
            activeNum: 0,
        }
    },
    props: {
        SecondNavBarData: {
            type: Array,
            default() {
                return [];
            }
        },
        currentTag: {
            type: Object,
            default() {
                return {};
            }
        },
        itemWidth: {
            type: Number,
            default() {
                return 50;
            }
        }
    },
    methods: {
        clickSecondBarItem(index) {
            if (this.activeNum == index) {
                return;
            }
            this.activeNum = index;
            this.$emit("clickSecondBarItem", index);
        }
    },
    watch: {
        currentTag(current) {
            this.activeNum = this.SecondNavBarData.findIndex(
                (item) => item.name == current.name
            );
        },
    }
}
</script>

<style scoped>
.navBar {
    display: flex;
    flex-wrap: wrap;
}

.barItem {
    padding: 6px 12px;
    font-size: 14px;
    color: rgb(100, 100, 100);
    text-align: center;
    box-sizing: content-box;
    cursor: pointer;
}

.barItem:hover {
    color: black;
}

.active {
    padding: 6px 12px;
    font-size: 14px;
    color: #D89F55;
    background-color: #fdfaf6;
    border-radius: 20px;
    text-align: center;
    box-sizing: content-box;
    cursor: pointer;
}
</style>