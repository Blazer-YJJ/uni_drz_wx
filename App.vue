<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2024-12-07 09:09:08
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2024-12-07 17:00:31
 * @FilePath: \uni_drz_wc\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script>
export default {
  globalData: {
    userInfo: null,
    orders: []
  },
  onLaunch: function() {
    console.log('App Launch')
    try {
      // 初始化用户信息
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.globalData.userInfo = JSON.parse(userInfo)
      }
      // 初始化订单数据
      const orders = uni.getStorageSync('orders')
      if (orders) {
        this.globalData.orders = JSON.parse(orders)
        // 确保是数组
        if (!Array.isArray(this.globalData.orders)) {
          this.globalData.orders = []
        }
      }
    } catch (e) {
      console.error('获取数据失败', e)
      // 初始化为空数组
      this.globalData.orders = []
    }
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style>
/* 全局样式 */
page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
    Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
    sans-serif;
}

.container {
  padding: 20rpx;
}

/* 通用样式 */
.price {
  color: #ff6b81;
  font-weight: bold;
}

.card {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}
</style>