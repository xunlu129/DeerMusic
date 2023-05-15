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
  // 用于在开发过程中快速启动一个本地开发服务器并提供静态文件服务、热更新、代理等功能
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
      // 代理到网易云音乐用于下载
      // 网易云音乐地址没有黑胶会员下载不了
      // 这里代理到一个大佬的服务器进行下载，侵删orz
      // 大佬的公开项目地址：https://gitee.com/PengGeee/vue_cloud_music
      '/m7': {
        // target: 'http://m7.music.126.net',
        target: 'http://www.codeman.ink',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/m7': ''
        }
      },
      '/m701': {
        // target: 'http://m701.music.126.net',
        target: 'http://www.codeman.ink',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/m701': ''
        }
      },
      '/m8': {
        // target: 'http://m8.music.126.net',
        target: 'http://www.codeman.ink',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/m8': ''
        }
      },
      '/m801': {
        // target: 'http://m801.music.126.net',
        target: 'http://www.codeman.ink',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/m801': ''
        }
      }
    },
  },
})