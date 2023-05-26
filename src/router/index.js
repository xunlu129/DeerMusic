import { createRouter, createWebHistory } from 'vue-router'
const Index = () => import('views/IndexVue.vue')
const Discover = () => import('views/discover/DiscoverView.vue')
const Recommend = () => import('views/discover/discoverChildren/RecommendView.vue')
const MusicList = () => import('views/discover/discoverChildren/MusicListView.vue')
const Ranking = () => import('views/discover/discoverChildren/RankingView.vue')
const Singer = () => import('views/discover/discoverChildren/SingerView.vue')
const MusicListIndex = () => import('views/discover/discoverChildren/musicListChildren/MusicListIndex.vue')
const MusicListDetail = () => import('views/musicListDetail/MusicListDetail.vue')
const Personal = () => import('views/personal/PersonalView.vue')
const Follows = () => import('views/personal/personalChildren/FollowsView.vue')
const Followeds = () => import('views/personal/personalChildren/FollowedsView.vue')
const Video = () => import('views/video/VideoView.vue')
const Favorites = () => import('views/favorites/FavoritesView.vue')
const FavoriteAlbum = () => import('views/favorites/favoritesChildren/FavoriteAlbum.vue')
const FavoriteVideo = () => import('views/favorites/favoritesChildren/FavoriteVideo.vue')
const FavoriteSinger = () => import('views/favorites/favoritesChildren/FavoriteSinger.vue')
const RecommendMusic = () => import('views/recommendMusic/RecommendMusic.vue')
const Search = () => import('views/search/SearchView.vue')
const SearchSong = () => import('views/search/searchChildren/SearchSong.vue')
const SearchSinger = () => import('views/search/searchChildren/SearchSinger.vue')
const SearchAlbum = () => import('views/search/searchChildren/SearchAlbum.vue')
const SearchVideo = () => import('views/search/searchChildren/SearchVideo.vue')
const SearchMusicList = () => import('views/search/searchChildren/SearchMusicList.vue')
const SearchUser = () => import('views/search/searchChildren/SearchUser.vue')
const SingerDetail = () => import('views/singerDetail/SingerDetail.vue')
const AlbumDetail = () => import('views/albumDetail/AlbumDetail.vue')
const VideoDetail = () => import('views/videoDetail/VideoDetail.vue')

const routes = [
    {path: '/', redirect: '/index'},
    {
        path: "/index",
        component: Index,
        redirect: '/discover',
        children: [
            {
                path: '/discover',
                component: Discover,
                redirect: '/discover/recommend',
                children: [
                    { path: '/discover/recommend', component: Recommend },
                    {
                        path: '/discover/musiclist',
                        component: MusicList,
                        redirect: '/discover/musiclist/musiclistindex',
                        children: [
                            { path: '/discover/musiclist/musiclistindex', name: 'musicListIndex', component: MusicListIndex },
                        ]
                    },
                    { path: '/discover/ranking', component: Ranking },
                    { path: '/discover/singer', component: Singer },
                ]
            },
            {
                path: '/video', component: Video,
            },
            {
                path: '/favorites', component: Favorites,
                redirect: '/favorites/favoritealbum',
                children: [
                    { path: '/favorites/favoritealbum', component: FavoriteAlbum },
                    { path: '/favorites/favoritesinger', component: FavoriteSinger },
                    { path: '/favorites/favoritevideo', component: FavoriteVideo },
                ]
            },
            { path: '/recommendmusic', component: RecommendMusic },
            { path: '/musiclistdetail/:id', name: 'musicListDetail', component: MusicListDetail },
            { path: '/singerdetail/:id', name: 'singerDetail', component: SingerDetail },
            { path: '/albumdetail/:id', name: 'albumDetail', component: AlbumDetail },
            { path: '/videodetail/:id/:type', name: 'videoDetail', component: VideoDetail },
            { path: '/personal/:uid', name: 'personal', component: Personal },
            { path: '/personal/follows/:uid', name: 'follows', component: Follows },
            { path: '/personal/followeds/:uid', name: 'followeds', component: Followeds },
            {
                path: '/search/:id', name: 'search', component: Search,
                // 带参数重定向时不能直接这样写redirect: '/search/searchsong/:id',
                // 它没有继承动态参数 :id 的值
                redirect: (to) => {
                    return { name: 'searchSong', params: { id: to.params.id } };
                },
                children: [
                    { path: '/search/searchsong/:id', name: 'searchSong', component: SearchSong },
                    { path: '/search/searchsinger/:id', name: 'searchSinger', component: SearchSinger },
                    { path: '/search/searchalbum/:id', name: 'searchAlbum', component: SearchAlbum },
                    { path: '/search/searchvideo/:id', name: 'searchVideo', component: SearchVideo },
                    { path: '/search/searchmusiclist/:id', name: 'searchMusicList', component: SearchMusicList },
                    { path: '/search/searchuser/:id', name: 'searchUser', component: SearchUser },
                ]
            },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
  })

export default router