import { createStore } from 'vuex'

export default createStore({
    state: {
        // 是否登录
        isLogin: false,
        // 用户创建的歌单
        createdMusicList: [],
        // 已收藏的歌单
        collectMusicList: [],
    },
    mutations: {
        //更新登录状态
        updateLoginState(state, flag = false) {
            state.isLogin = flag;
        },
        // 更新用户创建的歌单
        updateCreatedMusicList(state, createdMusicList) {
            state.createdMusicList = createdMusicList;
        },
        // 更新已收藏的歌单
        updateCollectMusicList(state, collectMusicList) {
            state.collectMusicList = collectMusicList;
        },
    }
})