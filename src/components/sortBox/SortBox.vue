<template>
    <div class="sortBoxContainer">
        <el-popover placement="bottom-start"
                    width="400px"
                    popper-class="sortPop"
                    trigger="click"
                    hide-after="0"
                    :show-arrow="false"
                    v-model:visible="isSortPopShow"
                    @show="showSortPop">
            <template #reference>
                <div class="sortBox">
                    {{ currentTag.name }}<i class="iconfont icon-arrow-right-bold"></i>
                 </div>
            </template>
            <div class="tips" v-if="sortList.length == 0">玩命加载中...</div>
            <div class="sortList" v-else>
                <div class="sortItem"
                     :class="currentTag.name == item.name ? 'currentItem' : ''"
                     v-for="(item, index) in sortList"
                     :key="index"
                     @click="clickItem(item)">
                    {{ item.name }}
                </div>
            </div>
        </el-popover>
    </div>
</template>

<script>
export default {
    name: "SortBox",
    data() {
        return {
            // 是否显示分类选择框
            isSortPopShow: false,
        }
    },
    props: {
        sortList: {
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
        }
    },
    methods: {
        // pop框展示时的回调
        showSortPop() {
            // 判断是否有sortList数据
            if (this.sortList.length == 0) {
                console.log("正在获取分类列表");
                this.$emit("getSortList");
            }
        },
        // 点击分类item的回调
        clickItem(item) {
            this.$emit("clickSortBoxItem", item);
            this.isSortPopShow = false;
        }
    }
}
</script>

<style scoped>
.sortBox {
    padding: 5px 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    cursor: pointer;
}

.sortBox:hover {
    background-color: #f5f5f5;
}

.tips {
    width: 100%;
    text-align: center;
    font-size: 15px;
    padding: 20px 0;
    color: rgb(145, 145, 145);
}

.sortList {
    display: flex;
    flex-wrap: wrap;
}

.sortItem {
    font-size: 15px;
    width: 20%;
    text-align: center;
    color: rgb(85, 85, 85);
    padding: 5px 0;
    margin: 5px 9px;
    cursor: pointer;
    border-radius: 30px;
}

.sortItem:hover {
    color: #D89F55;
}

.currentItem {
    color: #D89F55;
    background-color: #fdfaf6;
}
</style>