<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2024-12-29
 * @Description: 折扣页面
 -->
<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-bar">
				<view class="back-button" @tap="goBack">
					<text class="back-arrow">‹</text>
				</view>
				<text class="title">低价好设计</text>
			</view>
		</view>
		
		<!-- 主要内容区域 -->
		<scroll-view class="content" scroll-y @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="isRefreshing">
			<!-- 折扣商品列表 -->
			<view class="products-grid">
				<view v-for="(product, index) in products" 
						:key="product.id" 
						class="product-card animate-slide-up"
						:style="{ animationDelay: index * 0.1 + 's' }">
					<view class="product-image-wrapper">
						<image class="product-image" :src="product.image" mode="aspectFill"></image>
					</view>
					<view class="product-info">
						<text class="product-name">{{ product.name }}</text>
						<view class="price-section">
							<view class="current-price">
								<text class="price-symbol">¥</text>
								<text class="price-value">{{ product.discountPrice }}</text>
							</view>
						</view>
						<view class="product-brief">{{ product.brief }}</view>
						<button class="buy-button" @tap.stop="navigateToDetail(product.id)">立即下单</button>
					</view>
				</view>
			</view>
			
			<!-- 加载状态 -->
			<view class="loading-state" v-if="isLoading">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
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
			products: [],
			baseUrl: 'http://localhost:3000'
		}
	},
	onLoad() {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight
		this.loadProducts()
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		// 加载商品数据
		async loadProducts() {
			try {
				this.isLoading = true
				const res = await uni.request({
					url: `${this.baseUrl}/api/products/low-price`,
					method: 'GET'
				})
				
				console.log('折扣商品数据:', res)
				
				if (res.statusCode === 200 && res.data.data) {
					// 处理返回的数据
					this.products = res.data.data.map(item => ({
						id: item.id,
						name: item.name,
						brief: item.description,
						discountPrice: item.price,
						// 处理图片URL：替换域名并移除/api前缀
						image: item.image_url ? 
							item.image_url
								.replace('http://jingchengcool.fun', 'http://localhost:3000')
								.replace('/api/', '/') : 
							'http://localhost:3000/static/default-product.png',
						created_at: item.created_at
					}))
					console.log('处理后的商品数据:', this.products)
				} else {
					throw new Error('获取数据失败')
				}
			} catch (error) {
				console.error('获取折扣商品失败:', error)
				uni.showToast({
					title: '获取商品失败',
					icon: 'none'
				})
			} finally {
				this.isLoading = false
				this.isRefreshing = false
			}
		},
		// 刷新数据
		async onRefresh() {
			this.isRefreshing = true
			await this.loadProducts()
			uni.showToast({
				title: '刷新成功',
				icon: 'success'
			})
		},
		// 加载更多
		async loadMore() {
			if (this.isLoading) return
			this.isLoading = true
			await new Promise(resolve => setTimeout(resolve, 1000))
			this.isLoading = false
		},
		// 跳转到商品详情页
		navigateToDetail(productId) {
			if (!productId) {
				console.error('商品ID不存在')
				uni.showToast({
					title: '商品信息错误',
					icon: 'none'
				})
				return
			}
			
			console.log('准备跳转到商品详情页，商品ID:', productId)
			const url = 'pages/goods/detail'
			
			// 使用switchTab进行跳转
			uni.navigateTo({
				url: `/${url}?id=${productId}`,
				success: (res) => {
					console.log('跳转成功:', res)
				},
				fail: (err) => {
					console.error('跳转失败:', err)
					// 如果跳转失败，尝试不带前导斜杠
					uni.navigateTo({
						url: `${url}?id=${productId}`,
						fail: (err2) => {
							console.error('第二次跳转也失败:', err2)
							uni.showToast({
								title: '页面跳转失败',
								icon: 'none',
								duration: 2000
							})
						}
					})
				}
			})
		}
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

/* 内容区域 */
.content {
	padding: 16px;
	padding-top: calc(var(--status-bar-height) + 64px);
	min-height: 100vh;
	box-sizing: border-box;
}

/* 商品网格 */
.products-grid {
	display: flex;
	flex-direction: column;
	gap: 16px;
	// padding-bottom: 24px;
    margin-top: 10px;
}

/* 基础动画关键帧 */
@keyframes float {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-5px);
	}
}

@keyframes shine {
	0% {
		background-position: -100% 0;
	}
	100% {
		background-position: 100% 0;
	}
}

@keyframes pulse {
	0% {
		transform: scale(1);
		box-shadow: 0 4px 16px rgba(0,0,0,0.05);
	}
	50% {
		transform: scale(1.02);
		box-shadow: 0 8px 24px rgba(0,0,0,0.1);
	}
	100% {
		transform: scale(1);
		box-shadow: 0 4px 16px rgba(0,0,0,0.05);
	}
}

.product-card {
	background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
	border-radius: 20px;
	overflow: hidden;
	box-shadow: 0 4px 16px rgba(0,0,0,0.05);
	display: flex;
	height: 320rpx;
	margin-top: 0px;
	position: relative;
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.98);
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}
}

.product-image-wrapper {
	width: 280rpx;
	height: 320rpx;
	position: relative;
	flex-shrink: 0;
	overflow: hidden;
	
	&::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg,
			rgba(255,255,255,0.1) 0%,
			rgba(255,255,255,0) 100%);
		border-radius: 20px 0 0 20px;
	}
}

.product-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.3s ease;
	
	&:hover {
		transform: scale(1.05);
	}
}

.product-info {
	flex: 1;
	padding: 24rpx;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	gap: 16rpx;
	background: linear-gradient(135deg,
		rgba(255,255,255,0.9) 0%,
		rgba(255,255,255,0.95) 100%);
	backdrop-filter: blur(10px);
}

.product-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #1d1d1f;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.price-section {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin: 8rpx 0;
	position: relative;
	
	&::after {
		content: '';
		position: absolute;
		bottom: -4rpx;
		left: 0;
		width: 100%;
		height: 1px;
		background: linear-gradient(90deg,
			rgba(255,59,48,0.2) 0%,
			rgba(255,59,48,0.1) 100%);
	}
}

.current-price {
	display: flex;
	align-items: baseline;
}

.price-symbol {
	font-size: 28rpx;
	color: #ff3b30;
	font-weight: 500;
}

.price-value {
	font-size: 40rpx;
	font-weight: 600;
	color: #ff3b30;
	text-shadow: 0 1px 2px rgba(255,59,48,0.2);
}

.product-brief {
	font-size: 24rpx;
	color: #86868b;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	opacity: 0.9;
}

.buy-button {
	padding: 16rpx 0;
	background: linear-gradient(135deg, #007AFF 0%, #0055FF 100%);
	color: #fff;
	font-size: 28rpx;
	border-radius: 100px;
	font-weight: 500;
	text-align: center;
	width: 100%;
	margin-top: auto;
	box-shadow: 0 2px 8px rgba(0,122,255,0.3);
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(90deg,
			rgba(255,255,255,0) 0%,
			rgba(255,255,255,0.2) 50%,
			rgba(255,255,255,0) 100%);
		background-size: 200% 100%;
		animation: shine 2s infinite;
	}
	
	&:active {
		transform: translateY(2rpx);
		box-shadow: 0 1px 4px rgba(0,122,255,0.2);
	}
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

.animate-slide-up {
	animation: slideUp 0.6s ease backwards;
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