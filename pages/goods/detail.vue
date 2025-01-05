<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2024-12-07
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2024-12-29 17:33:23
 * @FilePath: \uni_drz_wc\pages\goods\detail.vue
 * @Description: 商品详情页
 -->
<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <view class="back-button" @tap="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="title">商品详情</text>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <uni-load-more status="loading" />
    </view>
    
    <template v-else>
      <!-- 商品画廊 -->
      <view class="gallery">
        <image 
          :src="product.image_url" 
          mode="aspectFill" 
          class="gallery-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
        <view class="gallery-overlay">
          <text class="gallery-price">¥{{product.price}}</text>
        </view>
      </view>
      
      <!-- 商品信息 -->
      <view class="product-info">
        <view class="info-section">
          <text class="product-name">{{product.name}}</text>
          <view class="product-meta">
            <text class="meta-item">库存 {{product.stock}}</text>
            <text class="meta-divider">·</text>
            <text class="meta-item">已售 {{product.total_sold || 0}}</text>
          </view>
        </view>
        
        <view class="info-section">
          <text class="section-title">商品描述</text>
          <view class="product-desc">
            <text v-for="(line, index) in descriptionLines" 
              :key="index" 
              class="desc-line"
            >{{line}}</text>
          </view>
        </view>
        
        <view class="info-section">
          <text class="section-title">下单说明</text>
          <view class="delivery-info">
            <text class="delivery-text">下单后，待设计师联系，然后进行制作并向您交付</text>
            <text class="delivery-tip">实际交付时间以设计师为准</text>
          </view>
        </view>

        <!-- 添加下单信息表单 -->
        <view class="info-section">
          <text class="section-title">下单信息</text>
          <view class="order-form">
            <view class="form-item">
              <text class="form-label">姓名</text>
              <input 
                type="text"
                v-model="orderForm.name"
                placeholder="请输入姓名"
                placeholder-class="input-placeholder"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="form-label">联系方式</text>
              <input 
                type="number"
                v-model="orderForm.phone"
                placeholder="请输入手机号"
                placeholder-class="input-placeholder"
                maxlength="11"
                class="form-input"
              />
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部操作栏 -->
      <view class="action-bar">
        <button 
          class="action-button" 
          :disabled="submitting || !product.stock"
          :class="{'button-disabled': !product.stock}"
          @tap="placeOrder"
        >
          <text v-if="!product.stock" class="button-text">暂时缺货</text>
          <text v-else-if="submitting" class="button-text">提交中...</text>
          <text v-else class="button-text">立即下单</text>
        </button>
      </view>
    </template>
  </view>
</template>

<script>
export default {
  // 移除组件引入
  components: {
    // 移除局部组件注册
  },
  data() {
    return {
      product: {},
      loading: true,
      baseUrl: 'http://localhost:3000',
      imageLoaded: false,
      isLoggedIn: false,
      submitting: false,
      isDev: true,
      orderForm: {
        name: '',
        phone: ''
      },
      statusBarHeight: 20
    }
  },
  computed: {
    descriptionLines() {
      return this.product.description ? 
        this.product.description.split('\n').filter(line => line.trim()) : 
        ['暂无描述']
    }
  },
  onLoad(options) {
    if (options.id) {
      this.fetchProductDetail(options.id)
    } else {
      this.handleError('商品ID不存在')
    }
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },
  onShow() {
    this.checkLoginStatus()
  },
  methods: {
    fetchProductDetail(id) {
      this.loading = true
      uni.request({
        url: `${this.baseUrl}/api/products/detail/${id}`,
        method: 'GET',
        success: (res) => {
          console.log('商品详情:', res.data)
          if (res.data && res.data.data) {
            this.product = {
              ...res.data.data,
              image_url: res.data.data.image_url || '',
              price: res.data.data.price || '0.00',
              stock: res.data.data.stock || 0,
              total_sold: res.data.data.total_sold || 0
            }
          } else {
            this.handleError('获取商品信息失败')
          }
        },
        fail: (err) => {
          console.error('请求失败:', err)
          this.handleError('网络请求失败')
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    handleImageLoad() {
      this.imageLoaded = true
    },
    handleImageError() {
      this.product.image_url = '/static/images/default-product.png'
    },
    handleError(message) {
      uni.showToast({
        title: message,
        icon: 'none'
      })
    },
    checkLoginStatus() {
      try {
        const token = uni.getStorageSync('token');
        const userInfo = uni.getStorageSync('userInfo');
        
        if (!token || !userInfo) {
          this.isLoggedIn = false;
          return;
        }

        const parsedUserInfo = JSON.parse(userInfo);
        this.isLoggedIn = !!(parsedUserInfo.id && token);
        
        console.log('登录状态:', this.isLoggedIn);
        console.log('Token:', token);
        console.log('用户信息:', parsedUserInfo);
      } catch (e) {
        console.error('检查登录状态失败：', e);
        this.isLoggedIn = false;
      }
    },
    placeOrder() {
      if (this.submitting) return
      
      // 重新检查登录状态
      this.checkLoginStatus()
      
      if (!this.isLoggedIn) {
        uni.showModal({
          title: '提示',
          content: '您还未登录，是否前往登录？',
          success: (res) => {
            if (res.confirm) {
              const currentPage = `/pages/goods/detail?id=${this.product.id}`
              uni.setStorageSync('lastVisitedPage', currentPage)
              
              uni.switchTab({
                url: '/pages/profile/profile'
              })
            }
          }
        })
        return
      }

      if (!this.product.stock) {
        this.handleError('商品库存不足')
        return
      }

      // 表单验证
      if (!this.orderForm.name.trim()) {
        this.handleError('请输入姓名')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.orderForm.phone)) {
        this.handleError('请输入正确的手机号')
        return
      }

      const token = uni.getStorageSync('token')
      if (!token) {
        this.handleError('登录已过期，请重新登录')
        return
      }

      // 准备订单数据
      const orderData = {
        customer_name: this.orderForm.name.trim(),
        customer_phone: this.orderForm.phone.trim(),
        items: [
          {
            product_id: this.product.id,
            quantity: 1
          }
        ]
      }

      this.submitting = true
      console.log('发送订单数据:', orderData) // 添加日志
      console.log('使用的token:', token) // 添加日志

      // 发送请求到后端API
      uni.request({
        url: `${this.baseUrl}/api/orders`,
        method: 'POST',
        data: orderData,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.replace('Bearer ', '')}`
        },
        success: (res) => {
          console.log('下单响应:', res.data)  // 添加日志
          if (res.statusCode === 200 || res.statusCode === 201) {
            // 下单成功，更新本地订单数据
            const app = getApp()
            const orders = app.globalData.orders || []
            orders.unshift({
              id: res.data.id || Date.now(),
              goodsId: this.product.id,
              goodsName: this.product.name,
              goodsImage: this.product.image_url,
              quantity: 1,
              price: this.product.price,
              totalAmount: this.product.price,
              createTime: new Date().toISOString(),
              status: '待付款'
            })

            app.globalData.orders = orders
            uni.setStorageSync('orders', JSON.stringify(orders))

            // 显示成功提示
            uni.showToast({
              title: '下单成功',
              icon: 'success'
            })

            // 跳转到个人中心
            setTimeout(() => {
              uni.switchTab({
                url: '/pages/profile/profile'
              })
            }, 1500)
          } else if (res.statusCode === 401) {
            // 处理未授权的情况
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            this.isLoggedIn = false
            
            uni.showModal({
              title: '提示',
              content: '登录已过期，请重新登录',
              success: (res) => {
                if (res.confirm) {
                  const currentPage = `/pages/goods/detail?id=${this.product.id}`
                  uni.setStorageSync('lastVisitedPage', currentPage)
                  uni.switchTab({
                    url: '/pages/profile/profile'
                  })
                }
              }
            })
          } else {
            this.handleError(res.data?.message || '下单失败')
          }
        },
        fail: (err) => {
          console.error('下单失败:', err)
          this.handleError('网络请求失败')
        },
        complete: () => {
          this.submitting = false
        }
      })
    },
    getUserId() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo) return null;
        
        const user = JSON.parse(userInfo);
        // 确保返回数字类型的 id
        return user.id ? parseInt(user.id) : null;
      } catch (e) {
        console.error('获取用户ID失败：', e)
        return null
      }
    },
    // 生成订单编号
    generateOrderNo() {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      return `ORDER${year}${month}${day}${random}`
    },
    // 获取token
    getToken() {
      try {
        return uni.getStorageSync('token') || ''
      } catch (e) {
        console.error('获取token失败：', e)
        return ''
      }
    },
    // 返回上一页
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: #fff;
  padding-top: calc(var(--status-bar-height) + 44px);
}

/* 商品画廊 */
.gallery {
  width: 100%;
  height: 100vw;
  position: relative;
  background: #f5f5f7;
  margin-top: 0;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%);
}

.gallery-price {
  font-size: 56rpx;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-family: -apple-system, SF Pro Display;
}

/* 商品信息 */
.product-info {
  padding: 32rpx;
}

.info-section {
  margin-bottom: 48rpx;
}

.info-section:last-child {
  margin-bottom: 160rpx;
}

.product-name {
  font-size: 40rpx;
  color: #1d1d1f;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 16rpx;
  font-family: -apple-system, SF Pro Display;
}

.product-meta {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
}

.meta-item {
  font-size: 28rpx;
  color: #86868b;
}

.meta-divider {
  margin: 0 12rpx;
  color: #86868b;
}

.section-title {
  font-size: 32rpx;
  color: #1d1d1f;
  font-weight: 600;
  margin-bottom: 16rpx;
  font-family: -apple-system, SF Pro Text;
}

.product-desc {
  padding: 20rpx 24rpx;
  background: #f5f5f7;
  border-radius: 16rpx;
}

.desc-line {
  font-size: 30rpx;
  color: #424245;
  line-height: 1.6;
  font-family: -apple-system, SF Pro Text;
  display: block;
  margin-bottom: 16rpx;
}

.desc-line:last-child {
  margin-bottom: 0;
}

.delivery-info {
  background: #f5f5f7;
  padding: 24rpx;
  border-radius: 16rpx;
}

.delivery-text {
  font-size: 28rpx;
  color: #1d1d1f;
  display: block;
  margin-bottom: 8rpx;
}

.delivery-tip {
  font-size: 24rpx;
  color: #86868b;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 0.5px solid rgba(0,0,0,0.1);
  z-index: 100;
}

.action-button {
  width: 100%;
  height: 96rpx;
  background: #0071e3;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button:active {
  transform: scale(0.98);
  background: #0077ED;
}

.button-text {
  color: #fff;
  font-size: 34rpx;
  font-weight: 500;
  font-family: -apple-system, SF Pro Text;
}

.button-disabled {
  background: #86868b;
  opacity: 0.6;
}

/* 加载状态 */
.loading-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.order-form {
  background: #f5f5f7;
  padding: 24rpx;
  border-radius: 16rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 28rpx;
  color: #1d1d1f;
  margin-bottom: 12rpx;
  display: block;
  font-family: -apple-system, SF Pro Text;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #1d1d1f;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-input:focus {
  box-shadow: 0 0 0 3px rgba(0,113,227,0.1);
}

.input-placeholder {
  color: #86868b;
  font-size: 30rpx;
}

/* 顶部导航栏 */
.header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(20px);
	border-bottom: 0.5px solid rgba(0,0,0,0.1);
}

.nav-bar {
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 16px;
	position: relative;
}

.back-arrow {
	color: #007AFF;
	font-size: 38px;
	font-family: SF Pro Text;
	line-height: 1;
	font-weight: 300;
}

.back-button {
	position: absolute;
	left: 16px;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.title {
	font-size: 17px;
	font-weight: 600;
	color: #1d1d1f;
}

/* 内容区域不需要重复添加顶部内边距 */
.content {
  padding-top: 0;
}
</style> 