### 项目依赖

- `axios`: 用于在浏览器和Node.js中发送http请求的Promise based库。
- `core-js`: 提供ES6+功能的polyfill库。
- `element-plus`: 基于Vue 3的UI组件库。
- `less`: 一种CSS预处理器，允许使用变量，嵌套规则，mixins等特性，生成更加简洁、易于维护的CSS。
- `less-loader`: 用于webpack构建中编译less文件的loader。
- `vue`: 用于构建用户界面的渐进式JavaScript框架。
- `vue-router`: Vue官方的路由管理器，用于构建SPA（单页面应用）。
- `vuex`: 用于Vue.js的集中式状态管理模式。
- `vue-template-compiler`: Vue的模板编译器，用于编译.vue文件中的模板部分。（`npm install --save-dev vue-template-compiler`）

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
  devServer: {
    port: 8088, // 自定义端口
    open: true, // 项目建成自动打开窗口
    proxy: {
      "/api": {
        target: "http://localhost:3000",  // 连接本地的网易云api
        changeOrigin: true, // 是否改变源地址，设置为 true 可以通过更改请求头中的 host 和 origin 属性来更改请求的源地址
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
import axios from 'axios'

const app = createApp(App)

app.config.globalProperties.HOST = "/api"
app.config.globalProperties.$axios = axios // 添加全局变量

app.mount('#app')
```

