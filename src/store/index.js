import { createStore } from 'vuex'

export default createStore({
    state: {
        // 是否登录
        isLogin: false,
        // 用户创建的歌单
        createdMusicList: [],
        // 已收藏的歌单
        collectMusicList: [],
        // 是否正在播放音乐
        isPlay: false,
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
        // 修改播放状态
        changePlayState(state, isPlay) {
            state.isPlay = isPlay;
        },
    }
})