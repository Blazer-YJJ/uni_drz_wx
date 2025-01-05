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

    <!-- 主要内容区域 -->
    <scroll-view class="content" scroll-y>
      <!-- 商品图片轮播 -->
      <swiper class="product-swiper" circular autoplay interval="4000" duration="500">
        <swiper-item v-for="(image, index) in productImages" :key="index">
          <image class="product-image" :src="image" mode="aspectFill"></image>
        </swiper-item>
      </swiper>

      <!-- 商品信息卡片 -->
      <view class="product-info-card">
        <view class="product-header">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-brief">{{ product.brief }}</text>
        </view>

        <view class="price-section">
          <view class="price-box">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ product.price }}</text>
          </view>
          <text class="price-desc">含税包邮</text>
        </view>

        <!-- 商品标签 -->
        <view class="tags-section">
          <view class="tag" v-for="(tag, index) in product.tags" :key="index">
            {{ tag }}
          </view>
        </view>
      </view>

      <!-- 商品详情 -->
      <view class="detail-section">
        <view class="section-title">商品详情</view>
        <view class="detail-content">
          <text class="detail-text">{{ product.description }}</text>
          <view class="detail-images">
            <image v-for="(image, index) in product.detailImages" 
                   :key="index" 
                   :src="image" 
                   mode="widthFix" 
                   class="detail-image"></image>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-buttons">
        <view class="action-button">
          <text class="iconfont icon-cart"></text>
          <text class="action-text">购物车</text>
        </view>
        <view class="action-button">
          <text class="iconfont icon-heart"></text>
          <text class="action-text">收藏</text>
        </view>
      </view>
      <view class="buy-buttons">
        <button class="add-cart-btn">加入购物车</button>
        <button class="buy-now-btn">立即购买</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 20,
      product: {
        id: 1,
        name: '天然翡翠手镯 A货玉镯',
        brief: '缅甸天然翡翠，冰种飘绿，完美无瑕',
        price: '6999.00',
        tags: ['正品保证', '七天退换', '终身保养', '专业鉴定', 'GIC证书'],
        description: `【产品介绍】
这款翡翠手镯采用缅甸天然翡翠玉料，经过精心雕琢而成。玉质细腻，色泽均匀，具有很高的收藏价值。

【材质规格】
• 材质：天然A货翡翠
• 尺寸：内径54-55mm
• 宽度：8-9mm
• 厚度：4-5mm
• 颜色：冰种飘绿
• 种水：高冰种

【工艺特点】
• 传统手工雕琢
• 精细抛光处理
• 完美无暇工艺
• 考究细节处理

【佩戴建议】
• 避免剧烈碰撞
• 定期专业保养
• 防止化学品接触
• 佩戴时轻取轻放`,
        detailImages: [
          'https://img14.360buyimg.com/n0/jfs/t1/197058/40/4757/145645/6116e9a8E6fb9e6e1/fb50f89523f8b0ba.jpg',
          'https://img14.360buyimg.com/n0/jfs/t1/180096/12/16440/167636/6116e9a8E43c4a05f/e0647be9f63f4e87.jpg',
          'https://img14.360buyimg.com/n0/jfs/t1/186085/25/16455/180603/6116e9a8E2b4963c9/4f5cd0b489c27e8d.jpg',
          'https://img14.360buyimg.com/n0/jfs/t1/181689/31/16577/138621/6116e9a8E0e0d8ece/9a5f04781c232f12.jpg'
        ]
      },
      productImages: [
        'https://img14.360buyimg.com/n0/jfs/t1/197058/40/4757/145645/6116e9a8E6fb9e6e1/fb50f89523f8b0ba.jpg',
        'https://img14.360buyimg.com/n0/jfs/t1/180096/12/16440/167636/6116e9a8E43c4a05f/e0647be9f63f4e87.jpg',
        'https://img14.360buyimg.com/n0/jfs/t1/186085/25/16455/180603/6116e9a8E2b4963c9/4f5cd0b489c27e8d.jpg',
        'https://img14.360buyimg.com/n0/jfs/t1/181689/31/16577/138621/6116e9a8E0e0d8ece/9a5f04781c232f12.jpg'
      ],
      specifications: [
        {
          title: '材质',
          value: '天然A货翡翠'
        },
        {
          title: '尺寸',
          value: '内径54-55mm'
        },
        {
          title: '颜色',
          value: '冰种飘绿'
        },
        {
          title: '证书',
          value: 'GIC国际证书'
        }
      ]
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },
  methods: {
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f7;
  position: relative;
  padding-bottom: 100px;
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
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
}

/* 内容区域 */
.content {
  padding-top: calc(var(--status-bar-height) + 44px);
  min-height: 100vh;
  box-sizing: border-box;
}

/* 商品轮播 */
.product-swiper {
  height: 750rpx;
  background: #fff;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品信息卡片 */
.product-info-card {
  margin: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
}

.product-header {
  margin-bottom: 16px;
}

.product-name {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  display: block;
}

.product-brief {
  font-size: 15px;
  color: #86868b;
  display: block;
}

.price-section {
  margin-bottom: 16px;
}

.price-box {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.price-symbol {
  font-size: 20px;
  color: #ea4909;
  margin-right: 4px;
}

.price-value {
  font-size: 36px;
  font-weight: 600;
  color: #ea4909;
  font-family: SF Pro Display;
}

.price-desc {
  font-size: 13px;
  color: #86868b;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  background: rgba(0,122,255,0.1);
  color: #007AFF;
  font-size: 13px;
  border-radius: 100px;
  font-weight: 500;
}

/* 商品详情 */
.detail-section {
  margin: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 16px;
}

.detail-content {
  color: #1d1d1f;
}

.detail-text {
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 16px;
  display: block;
}

.detail-images {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-image {
  width: 100%;
  border-radius: 12px;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.05);
}

.action-buttons {
  display: flex;
  gap: 24px;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.action-text {
  font-size: 12px;
  color: #86868b;
}

.buy-buttons {
  display: flex;
  gap: 12px;
}

.add-cart-btn {
  padding: 12px 24px;
  background: rgba(0,122,255,0.1);
  color: #007AFF;
  font-size: 15px;
  border-radius: 100px;
  font-weight: 500;
}

.buy-now-btn {
  padding: 12px 24px;
  background: #007AFF;
  color: #fff;
  font-size: 15px;
  border-radius: 100px;
  font-weight: 500;
}

/* 动画效果 */
.animate-fade-in {
  animation: fadeIn 0.8s ease backwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style> 