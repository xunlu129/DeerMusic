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
                            { path: '/discover/musiclist/musiclistindex', component: MusicListIndex },
                        ]
                    },
                    { path: '/discover/ranking', component: Ranking },
                    { path: '/discover/singer', component: Singer },
                ]
            },
            { path: '/musiclistdetail/:id', name: 'musicListDetail', component: MusicListDetail },
            { path: '/personal/:uid', name: 'personal', component: Personal },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
  })

export default router