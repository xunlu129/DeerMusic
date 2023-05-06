import { createStore } from 'vuex'

export default createStore({
    state: {
        // 是否登录
        isLogin: false,
    },
    mutations: {
        //更新登录状态
        updateLoginState(state, flag = false) {
            state.isLogin = flag;
        },
    }
})