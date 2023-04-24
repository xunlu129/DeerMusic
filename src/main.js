import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import store from './store'
// 全局样式表
import "./assets/css/base.css"

const app = createApp(App)

app.config.globalProperties.HOST = "/api"
app.config.globalProperties.$axios = axios // 添加全局变量

app.use(ElementPlus, { locale: zhCn })
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(store)
app.use(router)
app.mount('#app')
