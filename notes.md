## 初始化

### 项目依赖

**dependencies**

- `axios`: 用于在浏览器和Node.js中发送http请求的Promise based库。
- `core-js`: 提供ES6+功能的polyfill库。
- `element-plus`: 基于Vue 3的UI组件库。
- `@element-plus/icons-vue`: 基于 Vue3 的element图标
- `less`: 一种CSS预处理器，允许使用变量，嵌套规则，mixins等特性，生成更加简洁、易于维护的CSS。
- `less-loader`: 用于webpack构建中编译less文件的loader。
- `vue`: 用于构建用户界面的渐进式JavaScript框架。
- `vue-router`: Vue官方的路由管理器，用于构建SPA（单页面应用）。
- `vuex`: 用于Vue.js的集中式状态管理模式。

**devDependencies**（一般搭建vue3时会安装大部分，没有就 `npm install --save-dev` ）

- `@babel/core`: Babel 的核心包，用于将新版本的 JavaScript 代码转换为旧版本的浏览器能够识别的代码。
- `@babel/eslint-parser`: 一个与 ESLint 集成的 Babel 解析器，用于在 ESLint 中解析 JavaScript 代码。
- `@vue/cli-plugin-babel`: Vue CLI 的 Babel 插件，用于在 Vue 项目中集成 Babel。
- `@vue/cli-plugin-eslint`: Vue CLI 的 ESLint 插件，用于在 Vue 项目中集成 ESLint。
- `@vue/cli-service`: Vue CLI 的命令行服务，用于管理项目的构建、开发、打包等。
- `eslint`: ESLint 是一个用于检查 JavaScript 代码风格和语法错误的工具。
- `eslint-plugin-vue`: 一个 ESLint 插件，用于检查 Vue.js 代码风格和语法错误。
- `vue-template-compiler`: Vue.js 的模板编译器，用于将 Vue.js 的模板编译成 JavaScript 代码。

### vue.config.js

`devServer` 是 `webpack-dev-server` 提供的一个选项，它是一个基于 Express 的开发服务器，用于在开发过程中快速启动一个本地开发服务器并提供静态文件服务、热更新、代理等功能。

在配置 `devServer` 时，可以指定本地开发服务器的端口号、代理配置、请求重定向等信息。其中，常用的选项包括：

- `port`: 指定服务器端口号，默认为 8080。
- `host`: 指定服务器地址，默认为 `localhost`。
- `contentBase`: 指定提供静态文件的目录，默认为项目根目录。
- `hot`: 启用模块热替换（Hot Module Replacement）功能。
- `proxy`: 配置代理，用于解决跨域问题。
- `historyApiFallback`: 配置单页面应用的路由 fallback 行为。

使用 `devServer` 可以提高开发效率，免去每次手动启动本地服务器的烦恼，同时可以加快开发过程中的反馈速度。

```js
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 简化路径导入时的写法
  configureWebpack: {
    resolve: {
      alias: {
        'assets': '@/assets',
        'components': '@/components',
        'network': '@/network',
        'views': '@/views',
        'plugins': '@/plugins',
      }
    }
  },
  devServer: {
    port: 8088, // 自定义端口
    open: true, // 项目建成自动打开窗口
    proxy: {
      "/api": {
        target: "http://localhost:3000",  // 连接本地的网易云api
        changeOrigin: true, // 是否改变源地址（跨域问题），设置为 true 可以通过更改请求头中的 host 和 origin 属性来更改请求的源地址
        ws: true, // 表示开启 WebSocket 代理。如果后端服务使用了 WebSocket，那么这个选项需要设置为 true
        pathRewrite: {
          "^/api": "" // 路径重写，去掉 /api 前缀
        }
      },
    },
  },
})
```

### main.js

```js
import { createApp } from 'vue'
import App from './App.vue'
// 我们使用的是Element Plus UI框架（vue3专用）
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'	// element图标
// 还有更多的全局配置都可以在这引入
import axios from 'axios'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  	app.component(key, component)	// 全部注册以便随时使用
}

//测试用，实际可按情况更改
app.config.globalProperties.HOST = "/api"
app.config.globalProperties.$axios = axios // 添加全局变量

app.mount('#app')
```



## 配置路由

### main.js

```js
import router from './router'

app.use(router)
```

### router/index.js

```js
import { createRouter, createWebHistory } from 'vue-router'
// 每创建一个新页面就引入
/* const Index = () => import('components/Index.vue') */

const routes = [
	// 这里定义路由跳转
    /* 
    { path: '/', redirect: '/index' },
    {
        path: '/index',
        component: Index,
        redirect: '/discover',
        children: []
    }
    */
]

const router = createRouter({
    history: createWebHistory(),
    routes
  })

export default router
```

## 页面显示

### APP.vue

建好页面文件，配置好路由就可以在 APP.vue 引入 `<router-view>` 标签啦

```vue
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
};
</script>

<style>
</style>
```

