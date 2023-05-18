<template>
    <!-- 使用注意：滚动的盒子必须有个固定的高度，且设有 overflow-y:scroll; 否则会出现scrollTop=0的情况 -->
    <div class="GoTop"
         :class="isGoTopShow ? 'showBtn' : 'hideBtn'"
         @click="goTop">
        <i class="iconfont icon-fanhuidingbu"></i>
    </div>
</template>

<script>
let obj;

export default {
    name: "GoTop",
    props: {
        // 滚动对象的选择器
        scrollObj: {
            type: String,
            default() {
                return "";
            }
        }
    },
    data() {
        return {
            // 是否显示该组件
            isGoTopShow: false,
            // // 是否是第一次加载  第一次加载组件不需要添加hideBtn类
            // isFirstLoad: true,
        }
    },
    methods: {
        goTop() {
            this.el.scrollTo({
                behavior: "smooth",
                top: 0,
            });
        }
    },
    mounted() {
        if (this.scrollObj == "") {
            obj = document;
            this.el = document.documentElement;
        } else {
            obj = document.querySelector(this.scrollObj);
            this.el = obj;
        }
        obj.onscroll = () => {
            // console.log(e);
            // console.log(obj.scrollTop);
            if (this.el.scrollTop >= 500 && this.isGoTopShow == false) {
                this.isGoTopShow = true;
                // this.isFirstLoad ? (this.isFirstLoad = false) : "";
            } else if (this.el.scrollTop < 500 && this.isGoTopShow) {
                this.isGoTopShow = false;
            }
        }
    }
}
</script>

<style scoped>
.GoTop {
    position: fixed;
    background-color: #f8f8f8;
    border-radius: 50%;
    height: 50px;
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 10000;
    cursor: pointer;
    margin-bottom: 30px;
    right: 50px;
}

.showBtn {
    animation: showBtn 0.7s ease;
    animation-fill-mode: forwards;
}

.hideBtn {
    animation: hideBtn 0.3s ease-in;
    animation-fill-mode: forwards;
}

.GoTop i {
    font-size: 25px;
    color: #888;
}

.GoTop:hover {
    box-shadow: 0 20px 25px -8px rgba(0, 0, 0, 0.1),
        0 10px 10px -8px rgba(0, 0, 0, 0.04);
}

/* 出现时的动画 */
@keyframes showBtn {
    0% {
        bottom: -50px;
    }
    50% {
        bottom: 110px;
    }
    100% {
        bottom: 85px;
    }
}

/* 隐藏时的动画 */
@keyframes hideBtn {
    from {
        bottom: 85px;
    }
    to {
        bottom: -50px;
    }
}
</style>