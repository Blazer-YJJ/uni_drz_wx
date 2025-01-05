<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2024-12-23
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2024-12-27 20:17:59
 * @FilePath: \uni_drz_wc\pages\order\confirm.vue
 * @Description: 订单确认页
 -->
<template>
  <view class="container">
    <!-- 订单信息表单 -->
    <view class="order-form">
      <view class="form-item">
        <text class="label">下单人姓名</text>
        <input 
          type="text"
          v-model="orderForm.name"
          placeholder="请输入姓名"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">联系方式</text>
        <input 
          type="number"
          v-model="orderForm.phone"
          placeholder="请输入手机号"
          maxlength="11"
          class="input"
        />
      </view>
    </view>

    <!-- 商品信息预览 -->
    <view class="product-preview">
      <image :src="product.image_url" mode="aspectFill" class="preview-image"/>
      <view class="preview-info">
        <text class="preview-name">{{product.name}}</text>
        <text class="preview-price">¥{{product.price}}</text>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-bar">
      <button 
        class="submit-btn" 
        :disabled="submitting" 
        @tap="submitOrder"
      >
        {{submitting ? '提交中...' : '确认下单'}}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      product: {},
      orderForm: {
        name: '',
        phone: ''
      },
      submitting: false,
      baseUrl: 'http://localhost:3000'
    }
  },
  onLoad(options) {
    if (options.productId) {
      this.fetchProductDetail(options.productId)
    } else {
      this.handleError('商品信息不存在')
    }
  },
  methods: {
    // 获取商品详情
    fetchProductDetail(id) {
      uni.request({
        url: `${this.baseUrl}/api/products/detail/${id}`,
        success: (res) => {
          if (res.data && res.data.data) {
            this.product = res.data.data
          } else {
            this.handleError('获取商品信息失败')
          }
        },
        fail: () => {
          this.handleError('网络请求失败')
        }
      })
    },

    // 提交订单
    submitOrder() {
      // 表单验证
      if (!this.orderForm.name.trim()) {
        this.handleError('请输入下单人姓名')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.orderForm.phone)) {
        this.handleError('请输入正确的手机号')
        return
      }

      this.submitting = true
      
      // 构建订单数据
      const orderData = {
        items: [{
          product_id: this.product.id,
          name: this.product.name,
          quantity: 1,
          price: this.product.price,
          amount: this.product.price,
          image_url: this.product.image_url
        }],
        customer_name: this.orderForm.name,
        customer_phone: this.orderForm.phone
      }

      // 发送订单请求
      uni.request({
        url: `${this.baseUrl}/api/orders/submit`,
        method: 'POST',
        data: orderData,
        success: (res) => {
          if (res.data && res.data.data) {
            uni.showToast({
              title: '下单成功',
              icon: 'success'
            })
            
            // 延迟跳转到订单页面
            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/profile/profile'
              })
            }, 1500)
          } else {
            throw new Error(res.data?.message || '下单失败')
          }
        },
        fail: (err) => {
          console.error('提交订单失败:', err)
          this.handleError('提交订单失败，请重试')
        },
        complete: () => {
          this.submitting = false
        }
      })
    },

    handleError(message) {
      uni.showToast({
        title: message,
        icon: 'none'
      })
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background: #f5f5f7;
  padding: 24rpx;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.order-form {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.label {
  font-size: 28rpx;
  color: #1d1d1f;
  margin-bottom: 12rpx;
  display: block;
}

.input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f7;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1d1d1f;
}

.product-preview {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
}

.preview-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
}

.preview-info {
  flex: 1;
  margin-left: 24rpx;
}

.preview-name {
  font-size: 28rpx;
  color: #1d1d1f;
  margin-bottom: 12rpx;
  display: block;
}

.preview-price {
  font-size: 36rpx;
  color: #0066cc;
  font-weight: 600;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #0066cc;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:active {
  background: #005ab8;
}

.submit-btn[disabled] {
  background: #86868b;
  opacity: 0.6;
}
</style> 