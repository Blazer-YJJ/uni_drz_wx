/*
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2024-12-07 09:09:08
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2024-12-27 20:48:35
 * @FilePath: \uni_drz_wc\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import App from './App.vue'
import { createSSRApp } from 'vue'

// 导入uni-ui组件
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue'

export function createApp() {
  const app = createSSRApp(App)
  
  // 全局注册组件
  app.component('uni-load-more', uniLoadMore)
  
  // 添加全局配置
  app.config.globalProperties.$config = {
    baseUrl: 'http://jingchengcool.fun',
    isDev: true
  }

  return {
    app
  }
}