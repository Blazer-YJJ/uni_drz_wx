<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2024-12-07 09:09:08
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2024-12-30 22:31:28
 * @FilePath: \uni_drz_wc\pages\index\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
	<view class="container">
		<!-- 顶部标题栏 -->
		<view class="header-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="header-content">
				<text class="main-title">好设计</text>
				<text class="sub-title">遇见美好生活</text>
			</view>
		</view>

		<!-- 轮播图部分 - 新设计 -->
		<view class="banner-section">
			<view v-if="bannerLoading" class="banner-loading">
				<uni-load-more status="loading" />
			</view>
			<swiper 
				v-else-if="bannerList.length > 0"
				class="banner-swiper" 
				circular 
				:indicator-dots="true" 
				:autoplay="true" 
				:interval="4000" 
				:duration="800"
				indicator-color="rgba(255, 255, 255, 0.6)"
				indicator-active-color="#ffffff"
			>
				<swiper-item 
					v-for="item in bannerList" 
					:key="item.id"
					@tap="handleBannerClick(item)"
					class="banner-item"
				>
					<view class="banner-card">
						<image 
							:src="item.image" 
							mode="aspectFill" 
							class="banner-image"
							@error="handleBannerError(item)"
						/>
						<view class="banner-info">
							<text class="banner-title">{{item.title}}</text>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<!-- 分类导航 -->
		<view class="category-nav">
			<view 
				class="category-item" 
				v-for="(item, index) in categories" 
				:key="index"
				@tap="handleCategoryClick(item)"
			>
				<view class="category-icon">
					<image :src="item.icon" mode="aspectFit" class="category-icon-image" />
				</view>
				<text class="category-name">{{item.name}}</text>
			</view>
		</view>

		<!-- 热门商品区域 -->
		<view class="section hot-section">
			<view class="section-header">
				<text class="section-title">热门商品</text>
				<view class="section-more" @tap="goToMore('hot')">
					<text>查看更多</text>
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
			
			<view v-if="loading" class="loading-container">
				<uni-load-more status="loading" />
			</view>
			
			<scroll-view v-else scroll-x class="hot-scroll">
				<view class="hot-list">
					<view 
						class="hot-item" 
						v-for="(item, index) in hotProducts" 
						:key="index" 
						@tap="goToDetail(item)"
					>
						<view class="hot-card">
							<image :src="item.image" mode="aspectFill" class="hot-image"/>
							<view class="hot-info">
								<text class="hot-name">{{item.name}}</text>
								<view class="hot-price-box">
									<text class="price-symbol">¥</text>
									<text class="hot-price">{{item.price}}</text>
								</view>
								<text class="hot-sold">已售 {{item.soldCount}}</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 推荐商品区域 -->
		<view class="section index-recommend-section">
			<view class="section-header">
				<text class="section-title">为你推荐</text>
			</view>
			
			<view v-if="recommendLoading" class="loading-container">
				<uni-load-more status="loading" />
			</view>
			
			<view v-else class="index-recommend-grid">
				<view 
					class="index-recommend-item" 
					v-for="(item, index) in recommendProducts" 
					:key="index" 
					@tap="goToDetail(item)"
				>
					<view class="index-recommend-card">
						<image :src="item.image" mode="aspectFill" class="index-recommend-image"/>
						<view class="index-recommend-info">
							<text class="index-recommend-name">{{item.name}}</text>
							<text class="index-recommend-desc">{{item.desc}}</text>
							<view class="index-recommend-bottom">
								<view class="index-recommend-price-box">
									<text class="price-symbol">¥</text>
									<text class="index-recommend-price">{{item.price}}</text>
								</view>
								<text class="index-recommend-stock">库存: {{item.stock}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	components: {
		// 移除局部组件注册
	},
	data() {
		return {
			statusBarHeight: 0,
			bannerList: [],
			hotProducts: [],
			recommendProducts: [],
			loading: false,
			
			recommendLoading: false,
			bannerLoading: false,
			baseUrl: 'http://localhost:3000',
			categories: [
				{ 
					name: '新品', 
					icon: '/static/index/icon-new.png',
					url: '/pages/category/new'
				},
				{ 
					name: '热卖', 
					icon: '/static/index/icon-hot.png',
					url: '/pages/category/hot'
				},
				{ 
					name: '折扣', 
					icon: '/static/index/icon-discount.png',
					url: '/pages/category/discount'
				},
				{ 
					name: '分类', 
					icon: '/static/index/icon-category.png',
					url: '/pages/category/category'
				}
			]
		}
	},
	onLoad() {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight
		this.getBanners()
		this.getHotProducts()
		this.getRecommendProducts()
	},
	methods: {
		getBanners() {
			this.bannerLoading = true
			uni.request({
				url: `${this.baseUrl}/api/banners/public`,
				method: 'GET',
				success: (res) => {
					console.log('轮播图响应:', res)
					if (res.statusCode === 200 && res.data.status === 'success' && Array.isArray(res.data.data)) {
						this.bannerList = res.data.data.map(item => ({
							id: item.id,
							image: item.image_url,
							title: item.title,
							link: item.link_url || ''
						}))
						console.log('处理后的轮播图数据:', this.bannerList)
					} else {
						console.error('轮播图数据格式错误:', res)
						this.bannerList = []
						uni.showToast({
							title: '获取轮播图失败',
							icon: 'none'
						})
					}
				},
				fail: (err) => {
					console.error('获取轮播图失败:', err)
					this.bannerList = []
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
				},
				complete: () => {
					this.bannerLoading = false
				}
			})
		},
		getHotProducts() {
			this.loading = true
			uni.request({
				url: `${this.baseUrl}/api/products/hot`,
				method: 'GET',
				success: (res) => {
					console.log('热门商品数据:', res.data)
					if (res.data && Array.isArray(res.data.data)) {
						this.hotProducts = res.data.data.map(item => ({
							id: item.id,
							image: item.image_url || '',
							name: item.name || '未命名商品',
							price: item.price || '0.00',
							soldCount: item.total_sold || 0
						}))
					}
				},
				fail: (err) => {
					console.error('获取热门商品失败:', err)
					uni.showToast({
						title: '获取热门商品失败',
						icon: 'none'
					})
				},
				complete: () => {
					this.loading = false
				}
			})
		},
		getRecommendProducts() {
			this.recommendLoading = true
			uni.request({
				url: `${this.baseUrl}/api/products/recommend`,
				method: 'GET',
				success: (res) => {
					console.log('推荐商品数据:', res.data)
					if (res.data && Array.isArray(res.data.data)) {
						this.recommendProducts = res.data.data.map(item => ({
							id: item.id,
							image: item.image_url || '',
							name: item.name || '未命名商品',
							desc: item.description || '暂无描述',
							price: item.price || '0.00',
							stock: item.stock || 0
						}))
					}
				},
				fail: (err) => {
					console.error('获取推荐商品失败:', err)
					uni.showToast({
						title: '获取推荐商品失败',
						icon: 'none'
					})
				},
				complete: () => {
					this.recommendLoading = false
				}
			})
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
		handleBannerClick(item) {
			console.log('点击轮播图:', item)  // 添加点击事件日志
			if (item.link) {
				uni.navigateTo({
					url: item.link,
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
		handleBannerError(item) {
			console.error('轮播图加载失败:', item)
		},
		handleCategoryClick(item) {
			console.log('点击分类:', item)
			if (item.url) {
				// 如果是分类页面，使用 switchTab
				if (item.name === '分类') {
					uni.switchTab({
						url: '/pages/category/category',
						fail: (err) => {
							console.error('页面跳转失败:', err)
							uni.showToast({
								title: '页面跳转失败',
								icon: 'none'
							})
						}
					})
				} else {
					// 其他页面使用 navigateTo
					uni.navigateTo({
						url: item.url,
						fail: (err) => {
							console.error('页面跳转失败:', err)
							uni.showToast({
								title: '页面跳转失败',
								icon: 'none'
							})
						}
					})
				}
			}
		}
	}
}
</script>

<style>
	/* 基础动画 */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes slideInRight {
		from {
			transform: translateX(-30rpx);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	/* 容器样式 */
	.container {
		min-height: 100vh;
		background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
		padding-bottom: env(safe-area-inset-bottom);
	}

	/* 顶部标题栏 */
	.header-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(20px);
		animation: fadeInUp 0.6s ease-out;
	}

	.header-content {
		padding: 50rpx 30rpx;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4rpx;
	}

	.main-title {
		font-size: 36rpx;
		color: #1d1d1f;
		font-weight: 600;
		font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display';
		letter-spacing: 0.5px;
	}

	.sub-title {
		font-size: 24rpx;
		color: #86868b;
		font-weight: 400;
	}

	/* 轮播图区域 */
	.banner-section {
		margin: 20rpx 30rpx;
		margin-top: v-bind('(statusBarHeight + 92) + "px"');
		border-radius: 30rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08);
		animation: scaleIn 0.6s ease-out;
	}

	.banner-swiper {
		height: 360rpx;
	}

	.banner-card {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.banner-image {
		width: 100%;
		height: 100%;
		transform: scale(1.01);
		transition: transform 0.3s ease;
	}

	.banner-info {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 40rpx 30rpx;
		background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%);
	}

	.banner-title {
		font-size: 32rpx;
		color: #ffffff;
		font-weight: 600;
		text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
	}

	/* 分类导航 */
	.category-nav {
		display: flex;
		justify-content: space-around;
		padding: 20rpx;
		margin: 20rpx 30rpx;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
		animation: fadeInUp 0.6s ease-out;
	}

	.category-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10rpx;
		flex: 1;
	}

	.category-icon {
		width: 90rpx;
		height: 90rpx;
		background: #f5f5f7;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12rpx;
		transition: all 0.3s ease;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
		position: relative;
		overflow: hidden;
	}

	.category-icon::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
		border-radius: 50%;
	}

	.category-icon-image {
		width: 80rpx;
		height: 80rpx;
		object-fit: contain;
	}

	.category-icon:active {
		transform: scale(0.92);
		background: #ebebeb;
	}

	.category-name {
		font-size: 24rpx;
		color: #333333;
		font-weight: 500;
		margin-top: 8rpx;
		text-align: center;
		width: 100%;
	}

	/* 热门商品区域 */
	.hot-section {
		margin: 20rpx 30rpx;
		background: rgba(255, 255, 255, 0.8);
		border-radius: 30rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
		animation: scaleIn 0.8s ease-out;
	}

	.hot-scroll {
		padding: 20rpx;
	}

	.hot-list {
		display: flex;
		padding: 10rpx;
	}

	.hot-item {
		margin-right: 24rpx;
		animation: slideInRight 0.6s ease-out;
	}

	.hot-card {
		width: 280rpx;
		background: #ffffff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
		transition: transform 0.3s ease;
	}

	.hot-card:active {
		transform: scale(0.98);
	}

	.hot-image {
		width: 280rpx;
		height: 280rpx;
		border-radius: 20rpx 20rpx 0 0;
	}

	.hot-info {
		padding: 20rpx;
	}

	.hot-name {
		font-size: 28rpx;
		color: #1d1d1f;
		font-weight: 600;
		margin-bottom: 12rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		display: block;
	}

	.hot-price-box {
		display: flex;
		align-items: baseline;
		margin-bottom: 8rpx;
	}

	.price-symbol {
		font-size: 24rpx;
		color: #1d1d1f;
		margin-right: 4rpx;
	}

	.hot-price {
		font-size: 36rpx;
		color: #1d1d1f;
		font-weight: 600;
	}

	.hot-sold {
		font-size: 24rpx;
		color: #86868b;
	}

	/* 推荐商品区域 */
	.index-recommend-section {
		padding: 20rpx;
		background: #fff;
	}

	.index-recommend-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
	}

	.index-recommend-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
	}

	.index-recommend-card {
		background: #fff;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.index-recommend-image {
		width: 100%;
		height: 300rpx;
		background: #f5f5f5;
	}

	.index-recommend-info {
		padding: 16rpx;
	}

	.index-recommend-name {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 8rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.index-recommend-desc {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 8rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		overflow: hidden;
	}

	.index-recommend-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 8rpx;
	}

	.index-recommend-price {
		font-size: 32rpx;
		color: #ff6b81;
		font-weight: bold;
	}

	.index-recommend-stock {
		font-size: 24rpx;
		color: #999;
	}

	/* 加载状态 */
	.loading-container {
		padding: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 通用样式 */
	.section-header {
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 0.5px solid rgba(0,0,0,0.1);
	}

	.section-title {
		font-size: 34rpx;
		color: #1d1d1f;
		font-weight: 600;
		font-family: -apple-system, SF Pro Display;
	}

	.section-more {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #0066cc;
		font-weight: 500;
	}

	.section-more text {
		margin-left: 4rpx;
	}
</style>
