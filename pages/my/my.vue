<template>
  <view class="container">
    <!-- 顶部用户信息 -->
    <view class="header">
      <view class="user-info">
        <view class="avatar-box">
          <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        </view>
        <view v-if="isLogin">
          <text class="user-name">{{userInfo.nickname || '未设置昵称'}}</text>
          <text class="user-id">ID: {{userInfo.id || '未登录'}}</text>
        </view>
        <view v-else class="login-btn" @tap="goToLogin">
          点击登录
        </view>
      </view>
    </view>

    <!-- 订单区域 -->
    <view class="order-section">
      <view class="section-header">
        <text class="section-title">我的订单</text>
        <text class="view-all" @tap="viewAllOrders">查看全部</text>
      </view>
      <view class="order-grid">
        <view class="order-item" v-for="(item, index) in orderTypes" :key="index" @tap="handleOrderClick(item)">
          <view class="order-icon">
            <image :src="item.icon" mode="aspectFit" style="width: 48rpx; height: 48rpx;" />
          </view>
          <text class="order-name">{{item.name}}</text>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" v-for="(item, index) in menuItems" :key="index" @tap="handleMenuClick(item)">
        <image class="menu-icon" :src="item.icon" mode="aspectFit" />
        <text class="menu-name">{{item.name}}</text>
        <text class="menu-arrow">></text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      isLogin: false,
      userInfo: {},
      orderTypes: [
        { name: '待付款', icon: '/static/my/unpaid.png' },
        { name: '待发货', icon: '/static/my/unshipped.png' },
        { name: '待收货', icon: '/static/my/unreceived.png' },
        { name: '已完成', icon: '/static/my/completed.png' }
      ],
      menuItems: [
        { name: '收货地址', icon: '/static/my/address.png' },
        { name: '联系客服', icon: '/static/my/service.png' },
        { name: '设置', icon: '/static/my/settings.png' }
      ]
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    this.checkLoginStatus()
  },
  methods: {
    checkLoginStatus() {
      // 检查登录状态的逻辑
      const token = uni.getStorageSync('token')
      this.isLogin = !!token
      if (this.isLogin) {
        this.getUserInfo()
      }
    },
    getUserInfo() {
      // 获取用户信息的逻辑
    },
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    },
    viewAllOrders() {
      uni.navigateTo({
        url: '/pages/order/list'
      })
    },
    handleOrderClick(item) {
      console.log('点击订单类型:', item)
      // 处理订单点击事件
    },
    handleMenuClick(item) {
      console.log('点击菜单项:', item)
      // 处理菜单点击事件
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: #f5f5f7;
  padding-top: 200rpx;
  box-sizing: border-box;
}

.header {
  position: relative;
  padding: 0 30rpx;
  padding-top: v-bind('statusBarHeight + "px"');
  background: linear-gradient(180deg, #ffffff 0%, #f8f8fa 100%);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.user-info {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
}

.avatar-box {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  margin-right: 24rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #f0f0f0;
  border: 4rpx solid #ffffff;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1);
}

.login-btn {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  color: #1d1d1f;
  font-weight: 500;
}

.user-name {
  font-size: 32rpx;
  color: #1d1d1f;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 26rpx;
  color: #86868b;
}

.order-section {
  margin: 20rpx 30rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  color: #1d1d1f;
  font-weight: 600;
}

.view-all {
  font-size: 26rpx;
  color: #0066cc;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.order-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  border-radius: 40rpx;
  transition: all 0.3s ease;
}

.order-icon:active {
  transform: scale(0.95);
  background: #ebebeb;
}

.order-name {
  font-size: 26rpx;
  color: #1d1d1f;
}

.menu-list {
  margin: 20rpx 30rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid rgba(0,0,0,0.05);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 20rpx;
}

.menu-name {
  flex: 1;
  font-size: 28rpx;
  color: #1d1d1f;
}

.menu-arrow {
  font-size: 24rpx;
  color: #86868b;
}
</style> 