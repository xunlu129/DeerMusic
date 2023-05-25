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
        // 当前播放的歌单
        musicList: [],
        // 当前播放歌单的id
        musicListId: '',
        // 音乐的Id
        musicId: '',
        // 当前播放音乐的索引
        currentIndex: -1,
        // 实时播放时长
        currentTime: 0,
        // 音乐是否在加载中
        isMusicLoad: false,
        // 用户喜欢的音乐列表
        likeMusicList: [],
        // 要下载的音乐信息
        downloadMusicInfo: {
            name: '',
            url: '',
        },
        // 查询的歌单分类
        musicListTag: {},
        // 搜索页面你可能感兴趣内容
        multiMatch: [],
        // 音乐详情卡片的显隐
        isMusicDetailCardShow: false,
    },
    mutations: {
        //更新登录状态
        updateLoginState(state, flag = false) {
            state.isLogin = flag;
        },
        // 更新用户创建的歌单
        updateCreatedMusicList(state, createdMusicList) {
            state.createdMusicList = createdMusicList;
            // console.log("用户创建的歌单: ", state.createdMusicList);
        },
        // 更新已收藏的歌单
        updateCollectMusicList(state, collectMusicList) {
            state.collectMusicList = collectMusicList;
            // console.log("已收藏的歌单: ", state.collectMusicList);
        },
        // 修改播放状态
        changePlayState(state, isPlay) {
            state.isPlay = isPlay;
        },
        // 更新歌单列表和歌单id
        updateMusicList(state, payload) {
            // 当歌单id发生变化时,重置当前播放音乐索引
            if (payload.musicListId != state.musicListId) {
                state.musicListId = payload.musicListId;
            }
            // 对歌单进行深拷贝再赋值 直接赋值是浅拷贝
            // 歌单是固定的死数据，而vuex中的musicList是动态的
            let musicList = payload.musicList.slice(0)
            state.musicList = musicList;
            // console.log("当前播放歌单 " + state.musicListId + " 列表: ", state.musicList);
        },
        // 更新音乐Id
        updateMusicId(state, musicId) {
            state.musicId = musicId;
            console.log("当前音乐id: ", state.musicId);
        },
        // 当前播放音乐的索引
        updateCurrentIndex(state, index) {
            state.currentIndex = index;
            // console.log("当前音乐的索引: ", state.currentIndex);
        },
        // 更新实时播放时长
        updateCurrentTime(state, currentTime) {
            state.currentTime = currentTime;
        },
        // 更新音乐的加载状态
        updateMusicLoadState(state, isLoad) {
            state.isMusicLoad = isLoad;
        },
        // 更新用户喜欢的音乐列表
        updateLikeMusicList(state, likeMusicList) {
            state.likeMusicList = likeMusicList;
            // console.log("喜欢的音乐列表: ", state.likeMusicList);
        },
        // 更新当前下载的音乐信息
        updateDownloadMusicInfo(state, info) {
            state.downloadMusicInfo = info;
        },
        // 更新要查询的歌单分类（用于其他页面跳转）
        updateMusicListTag(state, musicListTag) {
            state.musicListTag = musicListTag;
            // console.log("当前歌单类别: ", state.musicListTag);
        },
        updateMultiMatch(state, multiMatch) {
            state.multiMatch = multiMatch;
        },
        // 切换音乐详情卡片的显隐
        changeMusicDetailCardState(state) {
            state.isMusicDetailCardShow = !state.isMusicDetailCardShow;
            // console.log("音乐详情卡片显隐: ", state.isMusicDetailCardShow);
        },
    }
})