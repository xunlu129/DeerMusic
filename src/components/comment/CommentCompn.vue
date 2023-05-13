<template>
    <div class="commentCompn">
        <!--歌单发表评论区-->
        <div class="commentOperation" v-if="commentType != '' && commentType != 'music' && isInputShow">
            <el-input type="textarea"
                    class="commentArea"
                    maxlength="140"
                    show-word-limit
                    v-model="commentInput"
                    placeholder="留下你的评论"></el-input>
            <div class="submitCommentButton">
                <el-button round class="submitComment">
                    评论
                </el-button>
            </div>
        </div>
        <!--评论条目区-->
        <div class="commentHeader" v-if="comments.length != 0"><slot name="title"></slot></div>
        <div class="commentItem" v-for="(item, index) in comments" :key="index">
            <div class="commentCreatorAvatar">
                <img :src="item.user.avatarUrl + '?param=100y100'" alt="" />
            </div>
            <div class="commentMain">
                <div class="commentContent">
                    <span class="commentUserNickName">
                        {{ item.user.nickname }}&nbsp;:&nbsp;
                    </span>
                    <span>{{ item.content }}</span>
                </div>
                <div class="replied">
                    <div class="repliedItem" v-for="(item1, index1) in item.beReplied" :key="index1">
                        <span class="repliedUser">
                            @{{ item1.user.nickname }}&nbsp;:&nbsp;
                        </span>
                        <span class="repliedContent">{{ item1.content }}</span>
                    </div>
                </div>
                <div class="commentBottom">
                    <div class="commentCreatedTime">
                        {{ showDate(item.time) }}
                    </div>
                    <div class="commentButtons">
                        <div :class="item.liked ? 'likeCurrentComment' : ''">
                            <i class="iconfont icon-good"></i>
                            {{ item.likedCount }}
                        </div>
                        <div><i class="iconfont icon-zhuanfa"></i></div>
                        <div><i class="iconfont icon-pinglun" 
                                @click="replyComment(item.commentId, item.user.nickname)"></i></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { formatDate } from "plugins/utils";

export default {
    name: "CommentCompn",
    props: {
        // 评论数据
        comments: {
            type: Array,
            default() {
                return [];
            }
        },
        // 评论类型
        commentType: {
            type: String,
            default() {
                return "";
            }
        },
        // 评论Id
        commentId: {
            type: String,
            default() {
                return "";
            }
        },
        // 歌曲评论需要歌曲名
        musicTitle: {
            type: String,
            default() {
                return "";
            }
        },
        // 是否显示输入文本框
        isInputShow: {
            type: Boolean,
            default() {
                return true;
            }
        }
    },
    data() {
        return {
            // 是否显示评论对话框
            isCommentDialogShow: false,
            // 评论模式   true是常规评论   false是楼层评论
            commentMode: true,
            // 评论输入内容
            commentInput: "",
            // 楼层回复前面几个字的长度
            floorCommentInputLength: 0,
            // 用于暂存楼层评论id
            floorCommentId: "",
        }
    },
    methods: {
        showDate(value) {
            // 1、先将时间戳转成Date对象
            const date = new Date(value);
            // 2、将date进行格式化
            return formatDate(date, "yyyy-MM-dd");
        },
        // 点击楼层评论的回调
        // commentId是评论id  nickName是评论作者
        replyComment(commentId, nickName) {
            // console.log(commentId, nickName);
            // isInputShow为false 说明没有文本框
            if (this.isInputShow == false) {
                // 将其转给hotComment处理
                this.$emit("transToHotComment", { commentId, nickName });
            }
            if (this.commentType != "music") {
                // 让父元素滚到评论框
                this.$emit("scrollToComment");
                // 让评论框获得焦点
                let input = document.querySelector(".commentArea");
                // 阻止focus定位
                input.children[0].focus({ preventScroll: true });
            }
            this.commentInput = "回复" + nickName + "：";
            this.floorCommentInputLength = this.commentInput.length;
            this.floorCommentId = commentId;
            // 将评论模式改为楼层评论
            this.commentMode = false;
            console.log("楼层回复输入字符长度: ", this.floorCommentInputLength, "回复评论id: ", this.floorCommentId);
        },
    }
}
</script>

<style scoped>
.commentCompn {
    margin-bottom: 40px;
    width: 100%;
}

.el-textarea {
    --el-input-focus-border: #c0c4cc;
    --el-input-focus-border-color: #c0c4cc;
    --el-input-hover-border-color: #c0c4cc;
    --el-input-border-radius: 6px;
}

.el-textarea /deep/ .el-textarea__inner {
    height: 85px !important;
    resize: none;
    font-size: 17px;
    padding: 8px 15px;
}

.submitCommentButton {
    width: 100%;
    text-align: right;
    margin: 10px 0;
}

.submitComment:hover {
    background-color: #f2f2f2;
    color: #606266;
    border-color: #dcdfe6;
}

.submitComment:focus {
    background-color: #fff;
    color: #606266;
    border-color: #dcdfe6;
}

.commentHeader {
    font-size: 18px;
    color: rgb(26, 26, 26);
    font-weight: 600;
    padding: 10px 0;
}

.commentItem {
    display: flex;
    margin: 5px 0;
    padding: 20px 0;
    border-bottom: 1px solid #eee;
}

.commentCreatorAvatar {
    width: 45px;
    height: 45px;
    margin: 0px 20px 0 0;
}

.commentCreatorAvatar img {
    width: 100%;
    border-radius: 50%;
    cursor: pointer;
}

.commentMain {
    width: calc(100% - 70px);
}

.commentContent > span {
    line-height: 25px;
}

.commentUserNickName {
    color: #6191c2;
    cursor: pointer;
}

.commentUserNickName:hover {
    color: #507ba6;
}

.replied {
    background-color: #f4f4f4;
    margin: 7px 0;
    border-radius: 5px;
}

.repliedItem {
    padding: 10px 14px;
    line-height: 20px;
}

.repliedUser {
    color: #6191c2;
    cursor: pointer;
}

.repliedUser:hover {
    color: #507ba6;
}

.commentBottom {
    margin-top: 4px;
    color: rgb(172, 172, 172);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.commentButtons {
    display: flex;
    align-items: center;
}
.commentButtons div {
    padding: 0 8px;
}

.likeCurrentComment i {
  color: #EC4141 !important;
}

.icon-good, .icon-pinglun {
    font-size: 18px;
}
</style>