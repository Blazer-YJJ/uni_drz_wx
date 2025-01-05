<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2024-12-29
 * @Description: 新品页面
 -->
<template>
	<view class="container">
		<!-- 顶部标题区域 -->
		<view class="header">
			<view class="header-content">
				<view class="nav-bar">
					<view class="back-button" @tap="goBack">
						<text class="back-arrow">‹</text>
					</view>
					<view class="main-title">探索新品</view>
				</view>
				<view class="subtitle-section">
					<text class="subtitle">发现独特设计，感受匠心之作</text>
				</view>
			</view>
		</view>
		
		<!-- 商品展示区域 -->
		<scroll-view 
			class="content" 
			scroll-y 
			@scrolltolower="loadMore"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 精选新品 -->
			<view class="featured-section" v-if="featuredProduct">
				<view class="featured-card" @tap="goToDetail(featuredProduct)">
					<view class="featured-image">
						<image :src="featuredProduct.image" mode="aspectFill" />
					</view>
					<view class="featured-overlay">
						<view class="featured-tag">精选新品</view>
						<view class="featured-info">
							<text class="featured-name">{{featuredProduct.name}}</text>
							<text class="featured-desc">{{featuredProduct.description}}</text>
							<view class="featured-price-box">
								<text class="price-symbol">¥</text>
								<text class="featured-price">{{featuredProduct.price}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 新品列表 -->
			<view class="products-grid">
				<view 
					class="product-item" 
					v-for="(item, index) in products" 
					:key="index"
					@tap="goToDetail(item)"
				>
					<view class="product-card">
						<view class="product-image">
							<image :src="item.image" mode="aspectFill" />
						</view>
						<view class="product-info">
							<view class="product-tag">{{item.tag}}</view>
							<text class="product-name">{{item.name}}</text>
							<text class="product-desc">{{item.description}}</text>
							<view class="product-bottom">
								<view class="price-box">
									<text class="price-symbol">¥</text>
									<text class="product-price">{{item.price}}</text>
								</view>
								<view class="buy-now">立即购买</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 加载状态 -->
			<view v-if="loading" class="loading-container">
				<uni-load-more status="loading" />
			</view>
			
			<!-- 空状态 -->
			<view v-if="!loading && products.length === 0" class="empty-state">
				<text class="empty-text">暂无新品</text>
				<text class="empty-desc">敬请期待更多精彩商品</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			products: [],
			featuredProduct: null,
			loading: false,
			refreshing: false,
			page: 1,
			hasMore: true,
			baseUrl: 'http://localhost:3000'
		}
	},
	onLoad() {
		// 加载数据
		this.getNewProducts(true)
	},
	methods: {
		// 处理图片URL的方法
		getImageUrl(url) {
			if (!url) return '';
			// 移除可能存在的api前缀
			return url.replace('http://jingchengcool.fun/api/', 'http://localhost:3000/')
					 .replace('http://localhost:3000/api/', 'http://localhost:3000/');
		},
		
		async getNewProducts(isRefresh = false) {
			if (isRefresh) {
				this.page = 1
				this.hasMore = true
			}
			
			if (!this.hasMore || this.loading) return
			
			this.loading = true
			try {
				const res = await uni.request({
					url: `${this.baseUrl}/api/products/new`,
					method: 'GET',
					header: {
						'content-type': 'application/json',
						'Accept': 'application/json'
					}
				})
				
				console.log('新品数据:', res.data)
				
				if (res.data && Array.isArray(res.data.data)) {
					const newProducts = res.data.data.map(item => ({
						id: item.id,
						image: this.getImageUrl(item.image_url),
						name: item.name || '未命名商品',
						description: item.description || '暂无描述',
						price: item.price || '0.00',
						created_at: item.created_at,
						tag: this.getTimeTag(item.created_at)
					}))
					
					console.log('处理后的商品数据:', newProducts) // 添加日志
					
					if (isRefresh) {
						if (newProducts.length > 0) {
							this.featuredProduct = {
								...newProducts[0],
								tag: '精选新品'
							}
							this.products = newProducts.slice(1)
						} else {
							this.products = []
							this.featuredProduct = null
						}
					} else {
						this.products = [...this.products, ...newProducts]
					}
					
					this.hasMore = newProducts.length >= 4
					if (this.hasMore) {
						this.page++
					}
				} else {
					if (isRefresh) {
						this.products = []
						this.featuredProduct = null
					}
					uni.showToast({
						title: '暂无新品数据',
						icon: 'none'
					})
				}
			} catch (err) {
				console.error('获取新品失败:', err)
				uni.showToast({
					title: '获取商品失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
				if (isRefresh) {
					this.refreshing = false
					uni.stopPullDownRefresh()
				}
			}
		},
		
		// 根据创建时间生成标签
		getTimeTag(created_at) {
			const createTime = new Date(created_at)
			const now = new Date()
			const diffDays = Math.floor((now - createTime) / (1000 * 60 * 60 * 24))
			
			if (diffDays < 3) {
				return '新品上市'
			} else if (diffDays < 7) {
				return '本周新品'
			} else if (diffDays < 30) {
				return '本月新品'
			} else {
				return '精选商品'
			}
		},
		
		onRefresh() {
			this.refreshing = true
			this.getNewProducts(true)
		},
		
		loadMore() {
			if (!this.loading && this.hasMore) {
				this.getNewProducts()
			}
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
		},
		
		goBack() {
			uni.navigateBack({
				fail: () => {
					uni.switchTab({
						url: '/pages/index/index'
					})
				}
			})
		},
		
		handleImageError(e) {
			console.error('图片加载失败:', e.target.src)
			// 图片加载失败时清空src
			e.target.src = ''
		}
	}
}
</script>

<style>
.container {
	min-height: 100vh;
	background: #f5f5f7;
	display: flex;
	flex-direction: column;
}

/* 顶部标题区域 */
.header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
}

.header-content {
	padding-top: var(--status-bar-height);
}

/* 内容区域 */
.content {
	flex: 1;
	margin-top: calc(var(--status-bar-height) + 44px + 40px + 20px); /* 增加20px的额外空间 */
	height: calc(100vh - var(--status-bar-height) - 44px - 40px - 20px);
}

.nav-bar {
	height: 80px;
	display: flex;
	align-items: center;
	padding: 0 16px;
	position: relative;
	margin-top: 20px; /* 添加顶部间距 */
}

.back-button {
	height: 44px;
	display: flex;
	align-items: center;
	z-index: 2;
	padding: 0 4px; /* 增加点击区域 */
}

.back-arrow {
	font-size: 38px;
	color: #007AFF;
	font-family: SF Pro Text;
	line-height: 1;
	font-weight: 300;
}

.main-title {
	flex: 1;
	font-size: 24px;
	font-weight: 600;
	color: #1d1d1f;
	font-family: SF Pro Display;
	margin-left: 12px; /* 减小左边距 */
	letter-spacing: -0.5px;
}

.subtitle-section {
	padding: 8px 16px 16px;
}

.subtitle {
	font-size: 15px;
	line-height: 1.4;
	color: #86868b;
	font-family: SF Pro Text;
	display: block;
}

/* 激活状态 */
.back-button:active {
	opacity: 0.6;
}

/* 适配刘海屏 */
@supports (padding-top: constant(safe-area-inset-top)) {
	.header-content {
		padding-top: constant(safe-area-inset-top);
	}
}

@supports (padding-top: env(safe-area-inset-top)) {
	.header-content {
		padding-top: env(safe-area-inset-top);
	}
}

/* 精选新品区域 */
.featured-section {
	padding: 20rpx;
	margin-top: 0;
	margin-bottom: 20rpx;
}

.featured-card {
	position: relative;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08);
	transform: translateZ(0);
	transition: transform 0.3s ease;
	background: #ffffff;
}

.featured-image {
	width: 100%;
	height: 400rpx;
	position: relative;
	background: #f5f5f7;
	overflow: hidden;
}

.featured-image image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.featured-overlay {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 30rpx;
	background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%);
}

.featured-tag {
	display: inline-block;
	padding: 6rpx 20rpx;
	background: rgba(255,255,255,0.9);
	color: #1d1d1f;
	font-size: 22rpx;
	border-radius: 100rpx;
	margin-bottom: 12rpx;
	font-weight: 500;
	backdrop-filter: blur(4px);
}

.featured-name {
	font-size: 36rpx;
	font-weight: 600;
	margin-bottom: 6rpx;
	display: block;
	color: #ffffff;
	text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

.featured-desc {
	font-size: 26rpx;
	opacity: 0.9;
	margin-bottom: 12rpx;
	display: block;
	color: #ffffff;
	text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	line-height: 1.4;
}

.featured-price-box {
	display: flex;
	align-items: baseline;
}

.featured-price {
	font-size: 44rpx;
	font-weight: 600;
	color: #ffffff;
	text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

/* 商品网格 */
.products-grid {
	padding: 12rpx;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12rpx;
	background: #f5f5f7;
}

.product-card {
	background: #ffffff;
	border-radius: 12rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
	height: 100%;
}

.product-image {
	width: 100%;
	height: 300rpx;
	position: relative;
	background: #f5f5f7;
	overflow: hidden;
}

.product-image image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.product-info {
	padding: 16rpx;
	display: flex;
	flex-direction: column;
	flex: 1;
}

.product-tag {
	position: absolute;
	top: 12rpx;
	right: 12rpx;
	background: rgba(0,0,0,0.75);
	color: #ffffff;
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 100rpx;
	backdrop-filter: blur(4px);
	z-index: 1;
}

.product-name {
	font-size: 24rpx;
	color: #1d1d1f;
	font-weight: 600;
	margin: 8rpx 0;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	line-height: 1.4;
}

.product-desc {
	font-size: 20rpx;
	color: #86868b;
	margin-bottom: 12rpx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 1;
	overflow: hidden;
	line-height: 1.4;
}

.product-bottom {
	margin-top: auto;
	padding-top: 12rpx;
	border-top: 0.5px solid rgba(0,0,0,0.05);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.price-box {
	display: flex;
	align-items: baseline;
}

.price-symbol {
	font-size: 20rpx;
	color: #1d1d1f;
	margin-right: 2rpx;
}

.product-price {
	font-size: 28rpx;
	color: #1d1d1f;
	font-weight: 600;
}

.buy-now {
	font-size: 20rpx;
	color: #007AFF;
	font-weight: 500;
	padding: 4rpx 12rpx;
	background: rgba(0,122,255,0.1);
	border-radius: 100rpx;
	transition: all 0.3s ease;
}

.buy-now:active {
	background: rgba(0,122,255,0.2);
}

/* 加载状态 */
.loading-container {
	padding: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 空状态 */
.empty-state {
	padding: 120rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.empty-text {
	font-size: 32rpx;
	color: #1d1d1f;
	font-weight: 600;
	margin-bottom: 8rpx;
}

.empty-desc {
	font-size: 26rpx;
	color: #86868b;
}

/* 下拉刷新样式 */
::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
	color: transparent;
}

/* 图片加载动画 */
@keyframes imageFadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.featured-image image,
.product-image image {
	animation: imageFadeIn 0.3s ease-in;
}
</style> 