<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2024-12-21 21:13:53
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2024-12-30 22:33:48
 * @FilePath: \uni_drz_wc\pages\category\category.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="search-wrapper">
        <view class="search-input">
          <text class="iconfont icon-search"></text>
          <input 
            type="text" 
            v-model="searchKeyword"
            placeholder="搜索商品" 
            placeholder-class="search-placeholder"
            @confirm="handleSearch"
          />
        </view>
        <view class="search-button" @tap="handleSearch">搜索</view>
      </view>
    </view>

    <view class="content-wrapper" :style="{ paddingTop: (statusBarHeight + 72) + 'px' }">
      <!-- 左侧分类菜单 -->
      <scroll-view scroll-y class="category-menu">
        <view 
          v-for="(item, index) in categories" 
          :key="index"
          :class="['menu-item', currentCategory === index ? 'active' : '']"
          @tap="switchCategory(index)"
        >
          <text class="menu-text">{{item.name}}</text>
          <view class="menu-indicator"></view>
        </view>
      </scroll-view>
      
      <!-- 右侧商品列表 -->
      <scroll-view 
        scroll-y 
        class="category-content"
        :refresher-enabled="true"
        @refresherrefresh="onRefresh"
      >
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-container">
          <uni-load-more status="loading" />
        </view>
        
        <!-- 空状态 -->
        <view v-else-if="categories.length === 0" class="empty-container">
          <image 
            src="/static/images/no-data.png"
            mode="aspectFit" 
            class="empty-image"
          />
          <text class="empty-text">暂无分类数据</text>
        </view>
        
        <!-- 商品内容 -->
        <template v-else>
          <view class="content-banner">
            <image :src="categories[currentCategory].banner" mode="aspectFill" class="banner-image"/>
            <text class="banner-title">{{categories[currentCategory].name}}</text>
          </view>
          
          <view class="goods-grid">
            <view 
              class="goods-card" 
              v-for="(item, index) in categories[currentCategory].goods" 
              :key="index"
              @tap="goToDetail(item)"
            >
              <image :src="item.image" mode="aspectFill" class="goods-image"/>
              <view class="goods-info">
                <text class="goods-name">{{item.name}}</text>
                <text class="goods-desc" v-if="item.desc">{{item.desc}}</text>
                <text class="goods-stock">库存: {{item.stock}}</text>
                <text class="goods-price">¥{{item.price}}</text>
              </view>
            </view>
          </view>
        </template>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      currentCategory: 0,
      categories: [],
      loading: false,
      error: null,
      baseUrl: 'http://localhost:3000',
      searchKeyword: '',
      searchResults: []
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    this.fetchCategories()
  },
  methods: {
    fetchCategories() {
      this.loading = true
      this.error = null // 重置错误状态
      
      uni.request({
        url: `${this.baseUrl}/api/categories/with-products`,
        method: 'GET',
        success: (res) => {
          console.log('API响应数据:', res.data)
          // 检查数据结构
          if (res.data && Array.isArray(res.data.data)) {
            try {
              this.categories = res.data.data.map(category => ({
                id: category.id,
                name: category.name,
                banner: `https://picsum.photos/800/400?random=${category.id}`,
                goods: Array.isArray(category.products) ? category.products.map(product => ({
                  id: product.id,
                  image: product.image_url || '', // 添加默认值
                  name: product.name || '未命名商品',
                  price: product.price || '0.00',
                  stock: product.stock || 0
                })) : []
              }))
              
              // 确保至少有一个分类
              if (this.categories.length > 0) {
                this.currentCategory = 0
              } else {
                this.handleError('暂无分类数据')
              }
            } catch (error) {
              console.error('数据处理错误:', error)
              this.handleError('数据格式错误')
            }
          } else {
            this.handleError('获取数据失败')
          }
        },
        fail: (err) => {
          console.error('请求失败:', err)
          this.handleError('网络请求失败，请检查网络连接')
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    switchCategory(index) {
      if (index !== this.currentCategory) {
        this.currentCategory = index
      }
    },
    goToDetail(item) {
      if (!item || !item.id) {
        this.handleError('商品信息不完整')
        return
      }
      uni.navigateTo({
        url: `/pages/goods/detail?id=${item.id}`,
        fail: (err) => {
          console.error('页面跳转失败:', err)
          this.handleError('页面跳转失败')
        }
      })
    },
    handleError(message) {
      this.error = message
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    },
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      uni.request({
        url: `${this.baseUrl}/api/products/search`,
        method: 'GET',
        data: {
          keyword: this.searchKeyword
        },
        success: (res) => {
          if (res.data && Array.isArray(res.data.data)) {
            // 更新当前分类的商品列表为搜索结果
            this.categories = [{
              id: 'search',
              name: '搜索结果',
              banner: 'https://picsum.photos/800/400',
              goods: res.data.data.map(product => ({
                id: product.id,
                image: product.image_url || '',
                name: product.name || '未命名商品',
                price: product.price || '0.00',
                stock: product.stock || 0
              }))
            }]
            this.currentCategory = 0
          } else {
            this.handleError('未找到相关商品')
          }
        },
        fail: (err) => {
          console.error('搜索失败:', err)
          this.handleError('搜索失败，请重试')
        },
        complete: () => {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f7;
}

.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
}

.search-input {
  margin: 10rpx 0;
  display: flex;
  align-items: center;
  flex: 1;
  background: rgba(118, 118, 128, 0.12);
  border-radius: 10px;
  padding: 8rpx 16rpx;
}

.search-wrapper {
  margin: 10rpx 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 60%;
}

.search-button {
  padding: 8rpx 24rpx;
  background: #0066cc;
  color: #fff;
  border-radius: 10px;
  font-size: 28rpx;
  flex-shrink: 0;
  min-width: 80rpx;
  text-align: center;
}

.search-button:active {
  opacity: 0.8;
}

.icon-search {
  font-size: 28rpx;
  color: #86868b;
  margin-right: 10rpx;
}

.search-placeholder {
  color: #86868b;
  font-size: 28rpx;
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  top: -50rpx;
}

.category-menu {
  width: 200rpx;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
}

.menu-item {
  height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  padding: 0 20rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #1d1d1f;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
  z-index: 2;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text';
}

.menu-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 80%;
  background: transparent;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  z-index: 1;
}

.menu-item.active {
  background: transparent;
}

.menu-item.active .menu-text {
  color: #0066cc;
  font-weight: 500;
  transform: scale(1.02);
}

.menu-item.active .menu-indicator {
  background: rgba(0, 102, 204, 0.08);
  margin: 0 10rpx;
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  width: 4rpx;
  height: 32rpx;
  background: #0066cc;
  border-radius: 2rpx;
  transition: all 0.3s ease;
}

.menu-item:active {
  background: rgba(0, 0, 0, 0.02);
}

/* 添加滚动条样式 */
.category-menu::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

/* 添加顶部渐变阴影 */
.category-menu::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20rpx;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
  z-index: 2;
  pointer-events: none;
}

/* 添加底部渐变阴影 */
.category-menu::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20rpx;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
  z-index: 2;
  pointer-events: none;
}

/* 优化右侧内容区域的过渡效果 */
.category-content {
  flex: 1;
  height: 100%;
  padding: 20rpx;
  background: #f5f5f7;
  transition: all 0.3s ease;
}

.content-banner {
  position: relative;
  width: 100%;
  height: 240rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
}

.banner-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s;
}

.banner-title {
  position: absolute;
  bottom: 20rpx;
  left: 20rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 10rpx;
}

.goods-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.goods-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}

.goods-image {
  width: 100%;
  height: 280rpx;
  background: #f5f5f7;
  object-fit: cover;
}

.goods-info {
  padding: 16rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.goods-name {
  font-size: 28rpx;
  color: #1d1d1f;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  margin-bottom: 4rpx;
}

.goods-desc {
  font-size: 24rpx;
  color: #86868b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.goods-stock {
  font-size: 24rpx;
  color: #86868b;
  line-height: 1.4;
}

.goods-price {
  font-size: 32rpx;
  color: #0066cc;
  font-weight: 600;
  margin-top: 4rpx;
}

.loading-container {
  padding: 40rpx 0;
}

.empty-container {
  padding: 120rpx 0;
  text-align: center;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #86868b;
}
</style> 