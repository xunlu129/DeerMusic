import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

const app = createApp(App)

app.config.globalProperties.HOST = "/api"
app.config.globalProperties.$axios = axios // 添加全局变量

app.mount('#app')
