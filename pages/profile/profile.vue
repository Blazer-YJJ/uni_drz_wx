<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="profile-user-card">
      <!-- 未登录状态 -->
      <view v-if="!isLogin" class="profile-login-section" @tap="handleWxLogin">
        <image class="profile-default-avatar" src="/static/default-avatar.png" mode="aspectFill" />
        <text class="profile-login-text">点击微信授权登录</text>
      </view>
      
      <!-- 已登录状态 -->
      <view v-else class="profile-user-section">
        <view class="profile-user-basic">
          <image class="profile-user-avatar" :src="userInfo.avatarUrl" mode="aspectFill" />
          <view class="profile-user-detail">
            <text class="profile-user-nickname">{{userInfo.nickName}}</text>
            <text class="profile-login-time">{{formatLoginTime}}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 订单卡片 -->
    <view class="profile-order-card">
      <view class="profile-card-header">
        <text class="profile-card-title">我的订单</text>
        <text class="profile-card-more">查看全部</text>
      </view>
      <view class="profile-order-list">
        <view v-if="orders.length === 0" class="profile-empty-tip">
          <text>暂无订单</text>
        </view>
        <view class="profile-order-item" v-for="order in orders" :key="order.id">
          <image :src="order.goodsImage" mode="aspectFill" class="profile-order-image"/>
          <view class="profile-order-info">
            <text class="profile-order-name">{{order.goodsName}}</text>
            <text class="profile-order-quantity">x{{order.quantity}}</text>
            <text class="profile-order-price">¥{{order.totalAmount}}</text>
            <view class="profile-status-box">
              <text :class="['profile-order-status', order.status === '已取消' ? 'profile-canceled' : '']">{{order.status}}</text>
            </view>
          </view>
          <button 
            class="profile-cancel-btn" 
            v-if="order.status === '待付款'"
            @tap="cancelOrder(order.id)"
          >取消订单</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        id: '',
        phone: ''
      },
      orders: [],
      baseUrl: 'http://localhost:3000',
      isDev: true
    }
  },
  onShow() {
    this.refreshOrders()
    this.getUserInfo()
  },
  onPullDownRefresh() {
    try {
      this.refreshOrders()
      uni.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
      uni.stopPullDownRefresh()
    } catch (e) {
      console.error('刷新数据失败：', e)
      uni.showToast({
        title: '刷新失败',
        icon: 'none'
      })
      uni.stopPullDownRefresh()
    }
  },
  methods: {
    refreshOrders() {
      const token = uni.getStorageSync('token');
      if (token) {
        this.getUserOrders();
      } else {
        this.orders = [];
      }
    },
    makePhoneCall() {
      uni.makePhoneCall({
        phoneNumber: this.userInfo.phone
      })
    },
    cancelOrder(orderId) {
      uni.showModal({
        title: '提示',
        content: '确定要取消该订单吗？',
        success: (res) => {
          if (res.confirm) {
            try {
              const app = getApp()
              const orders = app.globalData.orders.map(order => {
                if (order.id === orderId) {
                  const newOrder = {
                    id: order.id,
                    goodsId: order.goodsId,
                    goodsName: order.goodsName,
                    goodsImage: order.goodsImage,
                    quantity: order.quantity,
                    price: order.price,
                    totalAmount: order.totalAmount,
                    createTime: order.createTime,
                    status: '已取消'
                  }
                  return newOrder
                }
                return order
              })
              
              app.globalData.orders = orders
              uni.setStorageSync('orders', JSON.stringify(orders))
              
              this.refreshOrders()
              
              uni.showToast({
                title: '订单已取消',
                icon: 'success'
              })
            } catch (e) {
              console.error('取消订单失败：', e)
              uni.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    getUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.userInfo = JSON.parse(userInfo)
        }
      } catch (e) {
        console.error('获取用户信息失败：', e)
      }
    },
    onGetUserInfo(e) {
      if (e.detail.userInfo) {
        // 先获取微信登录凭证
        uni.login({
          provider: 'weixin',
          success: (loginRes) => {
            if (loginRes.code) {
              // 调用后端登录接口
              uni.request({
                url: `${this.baseUrl}/api/users/wx-login`,
                method: 'POST',
                data: {
                  code: loginRes.code,
                  userInfo: {
                    nickName: e.detail.userInfo.nickName,
                    avatarUrl: e.detail.userInfo.avatarUrl
                  }
                },
                success: (res) => {
                  console.log('登录响应:', res);
                  if (res.statusCode === 200 && res.data.token) {
                    // 保存用户信息和token
                    const userInfo = {
                      id: res.data.user.id,
                      nickName: res.data.user.nickname || e.detail.userInfo.nickName,
                      avatarUrl: res.data.user.avatar_url || e.detail.userInfo.avatarUrl,
                      phone: res.data.user.phone || ''
                    };

                    // 保存到本地存储
                    try {
                      uni.setStorageSync('token', `Bearer ${res.data.token}`);
                      uni.setStorageSync('userInfo', JSON.stringify(userInfo));
                      
                      // 更新页面显示
                      this.userInfo = userInfo;
                      
                      console.log('登录成功，token:', res.data.token);
                      console.log('用户信息:', userInfo);
                      
                      // 获取用户订单
                      this.getUserOrders();
                      
                      uni.showToast({
                        title: '登录成功',
                        icon: 'success'
                      });

                      // 检查是否需要返回之前的页面
                      this.checkAndNavigateBack();
                    } catch (e) {
                      console.error('保存登录信息失败：', e);
                      this.handleLoginError('登录失败，请重试');
                    }
                  } else {
                    this.handleLoginError(res.data?.message || '登录失败');
                  }
                },
                fail: (err) => {
                  console.error('登录请求失败:', err);
                  this.handleLoginError('网络请求失败');
                }
              });
            } else {
              this.handleLoginError('获取登录凭证失败');
            }
          },
          fail: (err) => {
            console.error('微信登录失败:', err);
            this.handleLoginError('微信登录失败');
          }
        });
      }
    },
    handleLoginError(message) {
      // 清除可能存在的无效登录信息
      uni.removeStorageSync('userInfo');
      uni.removeStorageSync('token');
      
      uni.showToast({
        title: message,
        icon: 'none'
      });
    },
    // 模拟微信登录
    wxLogin() {
      return new Promise((resolve) => {
        // 返回模拟的登录凭证
        resolve({
          code: 'mock_code_123',
          errMsg: 'login:ok'
        })
      })
    },
    // 模拟服务器登录
    serverLogin(code, userInfo) {
      return new Promise((resolve) => {
        // 返回模拟的登录结果
        resolve({
          success: true,
          data: {
            token: 'mock_token_123',
            userId: 'test_user_001'
          }
        })
      })
    },
    saveUserInfo() {
      try {
        uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))
        const app = getApp()
        app.globalData.userInfo = this.userInfo
      } catch (e) {
        console.error('保存用户信息失败：', e)
        uni.showToast({
          title: '保存用户信息失败',
          icon: 'none'
        })
      }
    },
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      
      // 新用户信息
      this.updateUserAvatar(avatarUrl)
        .then(updateResponse => {
          if (updateResponse.success) {
            this.userInfo.avatarUrl = avatarUrl
            this.saveUserInfo()
            
            uni.showToast({
              title: '头像更新成功',
              icon: 'success'
            })
          } else {
            throw new Error('更新头像失败')
          }
        })
        .catch(error => {
          console.error('更新头像失败：', error)
          uni.showToast({
            title: '更新头像失败',
            icon: 'none'
          })
        })
    },
    updateUserAvatar(avatarUrl) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: `${this.baseUrl}/api/users/update-avatar`,
          method: 'POST',
          data: {
            avatarUrl: avatarUrl
          },
          success: (res) => {
            if (res.data && res.data.success) {
              resolve(res.data)
            } else {
              reject(new Error(res.data?.message || '更新头像失败'))
            }
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    },
    checkAndNavigateBack() {
      try {
        const lastVisitedPage = uni.getStorageSync('lastVisitedPage')
        if (lastVisitedPage) {
          uni.removeStorageSync('lastVisitedPage')
          
          setTimeout(() => {
            uni.redirectTo({
              url: lastVisitedPage,
              fail: (err) => {
                console.error('回跳失败：', err)
                uni.showToast({
                  title: '页面跳转失败',
                  icon: 'none'
                })
              }
            })
          }, 1500)
        }
      } catch (e) {
        console.error('检查回跳页面失败：', e)
      }
    },
    // 获取用户订单
    getUserOrders() {
      const token = uni.getStorageSync('token');
      if (!token) return;

      uni.request({
        url: `${this.baseUrl}/api/orders/user`,
        method: 'GET',
        header: {
          'Authorization': token
        },
        success: (res) => {
          console.log('订单响应:', res);
          if (res.statusCode === 200 && Array.isArray(res.data)) {
            this.orders = res.data.map(order => ({
              id: order.id,
              goodsId: order.product_id,
              goodsName: order.product_name,
              goodsImage: order.product_image,
              quantity: order.quantity,
              price: order.price,
              totalAmount: order.total_amount,
              createTime: order.created_at,
              status: order.status
            }));
          } else {
            console.error('获取订单失败:', res);
            uni.showToast({
              title: '获取订单失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('获取订单请求失败:', err);
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        }
      });
    }
  }
}
</script>

<style scoped>
.profile-container {
  background: #f8f8f8;
  min-height: 100vh;
  padding: 20rpx;
}

.profile-user-card {
  background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%);
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.15);
  position: relative;
  min-height: 300rpx;
}

.profile-login-section {
  padding: 90rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.profile-default-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.profile-login-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 500;
}

.profile-user-section {
  padding: 90rpx 40rpx;
}

.profile-user-basic {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.profile-user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.profile-user-detail {
  flex: 1;
}

.profile-user-nickname {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 8rpx;
  display: block;
}

.profile-login-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.profile-order-card {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.profile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.profile-card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.profile-card-more {
  font-size: 24rpx;
  color: #999;
}

.profile-order-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  position: relative;
  min-height: 120rpx;
}

.profile-order-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
}

.profile-order-info {
  flex: 1;
  margin-left: 20rpx;
  padding-right: 120rpx;
  position: relative;
}

.profile-order-name {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.profile-order-price {
  font-size: 32rpx;
  color: #ff6b81;
  font-weight: bold;
  margin-top: 10rpx;
  display: block;
}

.profile-order-status {
  font-size: 24rpx;
  color: #67c23a;
  margin-top: 6rpx;
  display: block;
}

.profile-order-status.profile-canceled {
  color: #999;
}

.profile-cancel-btn {
  position: absolute;
  right: 0;
  bottom: 20rpx;
  font-size: 24rpx;
  color: #ff6b81;
  background: rgba(255, 107, 129, 0.1);
  border: 1px solid rgba(255, 107, 129, 0.3);
  padding: 0 30rpx;
  height: 50rpx;
  line-height: 50rpx;
  border-radius: 25rpx;
  margin: 0;
}

.profile-empty-tip {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.profile-order-quantity {
  font-size: 24rpx;
  color: #666;
  margin-top: 6rpx;
  display: block;
}

.profile-status-box {
  margin-top: 10rpx;
}
</style> 