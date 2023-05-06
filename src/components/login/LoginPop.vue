<template>
    <div class="login">
        <el-tabs stretch>
            <el-tab-pane label="二维码登录" lazy>
                <!--二维码组件-->
                <QrCode @getUserInfo="getUserInfo" />
                <div class="tips">提示：请使用网易云音乐app扫码登录</div>
            </el-tab-pane>
            <el-tab-pane label="验证码登录" lazy>
                <!--手机验证码组件-->
                <VerifyCode />
                <div class="tips" style="margin-top: 20px;">提示：若登录失败，请使用二维码登录</div>
            </el-tab-pane>
        </el-tabs>
        <div class="regEnter">注册</div>
    </div>
</template>

<script>
import QrCode from './qrCodeLogin/QrCode.vue';
import VerifyCode from './verifyCodeLogin/VerifyCode.vue';

export default {
    components: {QrCode, VerifyCode},
    name: 'LoginPop',
    methods: {
        getUserInfo(info) {
            this.$emit('getUserInfo', info);
        },
  },
}
</script>

<style scoped>
.tips {
    color: rgb(130, 130, 130);
    text-align: center;
    font-size: 15px;
}

.regEnter {
    text-align: center;
    cursor: pointer;
    margin-top: 12px;
    font-size: 15px;
}

.regEnter:hover {
  text-decoration: underline;
}
</style>