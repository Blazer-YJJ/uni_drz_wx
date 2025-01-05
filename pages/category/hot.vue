<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2024-12-29 20:30:08
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2024-12-30 00:18:48
 * @FilePath: \uni_drz_wc\pages\category\hot.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <view class="back-button" @tap="goBack">
            <text class="back-arrow">‹</text>
        </view>
        <text class="title">热卖精选</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <scroll-view class="content" scroll-y @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="isRefreshing">
      <!-- 精选商品展示 -->
      <view class="featured-section animate-fade-in">
        <view class="featured-card" v-if="featuredProduct">
          <image class="featured-image" :src="featuredProduct.image" mode="aspectFill"></image>
          <view class="featured-overlay">
            <view class="featured-tag">热门推荐</view>
            <view class="featured-info">
              <text class="featured-title">{{ featuredProduct.name }}</text>
              <text class="featured-desc">{{ featuredProduct.description }}</text>
              <view class="featured-price">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ featuredProduct.price }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="products-section">
        <view class="section-header">
          <text class="section-title">发现设计</text>
          <text class="section-subtitle">精心挑选的热门设计</text>
        </view>
        
        <view class="products-grid">
          <view v-for="(product, index) in products" :key="product.id" 
                class="product-card animate-slide-up"
                :style="{ animationDelay: index * 0.1 + 's' }"
                @tap="goToDetail(product)">
            <view class="product-image-wrapper">
              <image class="product-image" :src="product.image" mode="aspectFill"></image>
              <view class="product-tag" v-if="product.tag">{{ product.tag }}</view>
            </view>
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <text class="product-desc">{{ product.description }}</text>
              <view class="product-stats">
                <view class="stat-item">
                  <text class="stat-value">{{ product.sales }}+</text>
                  <text class="stat-label">已售</text>
                </view>
              </view>
              <view class="product-bottom">
                <view class="price-box">
                  <text class="price-symbol">¥</text>
                  <text class="product-price">{{ product.price }}</text>
                </view>
                <view class="buy-button">立即下单</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="loading-state" v-if="isLoading">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 20,
      isRefreshing: false,
      isLoading: false,
      featuredProduct: null,
      products: [],
      baseUrl: 'http://localhost:3000'
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },
  methods: {
    goBack() {
      uni.switchTab({
        url: '/pages/category/category'
      })
    },
    async loadProducts() {
      try {
        const response = await uni.request({
          url: `${this.baseUrl}/api/products/hot`,
          method: 'GET'
        });

        if (response.statusCode === 200 && response.data.data) {
          const products = response.data.data;
          
          // 设置销量最高的商品为精选商品
          if (products.length > 0) {
            const sortedProducts = [...products].sort((a, b) => b.total_sold - a.total_sold);
            this.featuredProduct = {
              id: sortedProducts[0].id,
              name: sortedProducts[0].name,
              description: `已售 ${sortedProducts[0].total_sold}`,
              price: sortedProducts[0].price,
              image: sortedProducts[0].image_url
            };
          }

          // 更新商品列表
          this.products = products.map(item => ({
            id: item.id,
            name: item.name,
            description: '精选好物',
            price: item.price,
            image: item.image_url,
            sales: item.total_sold,
            tag: item.total_sold > 5 ? '热门' : ''
          }));
        }
      } catch (error) {
        console.error('获取商品数据失败:', error);
        uni.showToast({
          title: '获取商品数据失败',
          icon: 'none'
        });
      }
    },
    async onRefresh() {
      this.isRefreshing = true;
      await this.loadProducts();
      this.isRefreshing = false;
      uni.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    },
    async loadMore() {
      if (this.isLoading) return;
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isLoading = false;
    },
    goToDetail(item) {
      if (!item || !item.id) {
        uni.showToast({
          title: '商品信息不完整',
          icon: 'none'
        })
        return
      }
      uni.navigateTo({
        url: `/pages/goods/detail?id=${item.id}`,
        fail: (err) => {
          console.error('页面跳转失败:', err)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    }
  },
  onShow() {
    this.loadProducts();
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f7;
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
  
  .iconfont {
    font-size: 24px;
    color: #1d1d1f;
  }
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  text-align: center;
}

/* 内容区域 */
.content {
  padding-top: calc(var(--status-bar-height) + 44px);
  min-height: 100vh;
  box-sizing: border-box;
}

/* 精选商品区域 */
.featured-section {
  padding: 16px;
}

.featured-card {
  position: relative;
  height: 480rpx;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.featured-tag {
  display: inline-block;
  padding: 6px 12px;
  background: #007AFF;
  color: #fff;
  font-size: 14px;
  border-radius: 100px;
  margin-bottom: 12px;
}

.featured-info {
  color: #fff;
}

.featured-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.featured-desc {
  font-size: 15px;
  opacity: 0.8;
  margin-bottom: 12px;
  display: block;
}

.featured-price {
  font-size: 20px;
  font-weight: 600;
}

/* 商品列表区域 */
.products-section {
  padding: 16px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  display: block;
}

.section-subtitle {
  font-size: 15px;
  color: #86868b;
  margin-top: 4px;
  display: block;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.product-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.product-image-wrapper {
  position: relative;
  padding-top: 100%;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: rgba(0,0,0,0.75);
  color: #fff;
  font-size: 12px;
  border-radius: 100px;
  backdrop-filter: blur(4px);
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}

.product-desc {
  font-size: 14px;
  color: #86868b;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.product-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
  margin-left: 4px;
}

.product-bottom {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-box {
  display: flex;
  align-items: baseline;
}
.price-value {
  color: #ea4909;
  font-size: 30px;
  font-weight: 600;
}
.price-symbol {
  font-size: 15px;
  color: #ea4909;
  margin-right: 2px;
}

.product-price {
  font-size: 20px;
  font-weight: 600;
  color: #ea4909;
}

.buy-button {
  padding: 12px 0;
  background: #007AFF;
  color: #fff;
  font-size: 14px;
  border-radius: 100px;
  font-weight: 500;
  text-align: center;
  width: 100%;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #007AFF;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: #86868b;
  margin-top: 8px;
}

/* 动画效果 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease backwards;
}

.animate-slide-up {
  animation: slideUp 0.6s ease backwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
