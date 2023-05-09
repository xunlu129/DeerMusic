import { createRouter, createWebHistory } from 'vue-router'
const Index = () => import('views/IndexVue.vue')
const Discover = () => import('views/discover/DiscoverView.vue')
const Recommend = () => import('views/discover/discoverChildren/RecommendView.vue')
const MusicList = () => import('views/discover/discoverChildren/MusicListView.vue')
const Ranking = () => import('views/discover/discoverChildren/RankingView.vue')
const Singer = () => import('views/discover/discoverChildren/SingerView.vue')

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
                        
                    },
                    { path: '/discover/ranking', component: Ranking },
                    { path: '/discover/singer', component: Singer },
                ]
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
  })

export default router