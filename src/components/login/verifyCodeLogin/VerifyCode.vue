<template>
    <el-form ref="form"
             :model="loginForm"
             label-width="70px"
             label-position="right"
             :rules="rules">
        <el-form-item label="手机号:" prop="phone">
            <input class="loginInput" type="text" v-model="loginForm.phone" />
        </el-form-item>
        <el-form-item label="验证码:" prop="captcha" class="captcha">
            <input class="loginInput" type="text" v-model="loginForm.captcha" />
            <!--获取验证码按钮组件-->
            <TimerButton class="btn-primary"></TimerButton>
        </el-form-item>
        <div class="loginButton">
            <el-button class="login-primary" color="rgb(163, 122, 94)" plain>登 录</el-button>
        </div>
  </el-form>
</template>

<script>
import TimerButton from '@/components/timerButton/TimerButton.vue';

export default {
    components: {TimerButton},
    name: 'VerifyCodeLogin',
    data() {
        return {
            loginForm: {
                phone: '',
                captcha: '',
            },
            rules: {
                phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
                captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
            },
        }
    }
}
</script>

<style scoped>
.el-form {
  padding-top: 10px;
}

.loginInput {
    width: 90%;
    height: 32px;
    border-radius: 5px;
    outline: none;
    border: 1px solid rgb(182, 182, 182);
    padding-left: 5px;
}

.captcha input {
    width: 50%;
    margin-right: 15px;
}

.loginButton {
  width: 100%;
  text-align: center;
}

.login-primary {
    padding: 8px 77px;
}
</style>