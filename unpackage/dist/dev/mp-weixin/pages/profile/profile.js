"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {
        id: "",
        phone: ""
      },
      orders: [],
      baseUrl: "http://localhost:3000",
      isDev: true
    };
  },
  onShow() {
    this.refreshOrders();
    this.getUserInfo();
  },
  onPullDownRefresh() {
    try {
      this.refreshOrders();
      common_vendor.index.showToast({
        title: "刷新成功",
        icon: "success",
        duration: 1e3
      });
      common_vendor.index.stopPullDownRefresh();
    } catch (e) {
      console.error("刷新数据失败：", e);
      common_vendor.index.showToast({
        title: "刷新失败",
        icon: "none"
      });
      common_vendor.index.stopPullDownRefresh();
    }
  },
  methods: {
    refreshOrders() {
      const token = common_vendor.index.getStorageSync("token");
      if (token) {
        this.getUserOrders();
      } else {
        this.orders = [];
      }
    },
    makePhoneCall() {
      common_vendor.index.makePhoneCall({
        phoneNumber: this.userInfo.phone
      });
    },
    cancelOrder(orderId) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消该订单吗？",
        success: (res) => {
          if (res.confirm) {
            try {
              const app = getApp();
              const orders = app.globalData.orders.map((order) => {
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
                    status: "已取消"
                  };
                  return newOrder;
                }
                return order;
              });
              app.globalData.orders = orders;
              common_vendor.index.setStorageSync("orders", JSON.stringify(orders));
              this.refreshOrders();
              common_vendor.index.showToast({
                title: "订单已取消",
                icon: "success"
              });
            } catch (e) {
              console.error("取消订单失败：", e);
              common_vendor.index.showToast({
                title: "操作失败，请重试",
                icon: "none"
              });
            }
          }
        }
      });
    },
    getUserInfo() {
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (userInfo) {
          this.userInfo = JSON.parse(userInfo);
        }
      } catch (e) {
        console.error("获取用户信息失败：", e);
      }
    },
    onGetUserInfo(e) {
      if (e.detail.userInfo) {
        common_vendor.index.login({
          provider: "weixin",
          success: (loginRes) => {
            if (loginRes.code) {
              common_vendor.index.request({
                url: `${this.baseUrl}/api/users/wx-login`,
                method: "POST",
                data: {
                  code: loginRes.code,
                  userInfo: {
                    nickName: e.detail.userInfo.nickName,
                    avatarUrl: e.detail.userInfo.avatarUrl
                  }
                },
                success: (res) => {
                  var _a;
                  console.log("登录响应:", res);
                  if (res.statusCode === 200 && res.data.token) {
                    const userInfo = {
                      id: res.data.user.id,
                      nickName: res.data.user.nickname || e.detail.userInfo.nickName,
                      avatarUrl: res.data.user.avatar_url || e.detail.userInfo.avatarUrl,
                      phone: res.data.user.phone || ""
                    };
                    try {
                      common_vendor.index.setStorageSync("token", `Bearer ${res.data.token}`);
                      common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo));
                      this.userInfo = userInfo;
                      console.log("登录成功，token:", res.data.token);
                      console.log("用户信息:", userInfo);
                      this.getUserOrders();
                      common_vendor.index.showToast({
                        title: "登录成功",
                        icon: "success"
                      });
                      this.checkAndNavigateBack();
                    } catch (e2) {
                      console.error("保存登录信息失败：", e2);
                      this.handleLoginError("登录失败，请重试");
                    }
                  } else {
                    this.handleLoginError(((_a = res.data) == null ? void 0 : _a.message) || "登录失败");
                  }
                },
                fail: (err) => {
                  console.error("登录请求失败:", err);
                  this.handleLoginError("网络请求失败");
                }
              });
            } else {
              this.handleLoginError("获取登录凭证失败");
            }
          },
          fail: (err) => {
            console.error("微信登录失败:", err);
            this.handleLoginError("微信登录失败");
          }
        });
      }
    },
    handleLoginError(message) {
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.showToast({
        title: message,
        icon: "none"
      });
    },
    // 模拟微信登录
    wxLogin() {
      return new Promise((resolve) => {
        resolve({
          code: "mock_code_123",
          errMsg: "login:ok"
        });
      });
    },
    // 模拟服务器登录
    serverLogin(code, userInfo) {
      return new Promise((resolve) => {
        resolve({
          success: true,
          data: {
            token: "mock_token_123",
            userId: "test_user_001"
          }
        });
      });
    },
    saveUserInfo() {
      try {
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(this.userInfo));
        const app = getApp();
        app.globalData.userInfo = this.userInfo;
      } catch (e) {
        console.error("保存用户信息失败：", e);
        common_vendor.index.showToast({
          title: "保存用户信息失败",
          icon: "none"
        });
      }
    },
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      this.updateUserAvatar(avatarUrl).then((updateResponse) => {
        if (updateResponse.success) {
          this.userInfo.avatarUrl = avatarUrl;
          this.saveUserInfo();
          common_vendor.index.showToast({
            title: "头像更新成功",
            icon: "success"
          });
        } else {
          throw new Error("更新头像失败");
        }
      }).catch((error) => {
        console.error("更新头像失败：", error);
        common_vendor.index.showToast({
          title: "更新头像失败",
          icon: "none"
        });
      });
    },
    updateUserAvatar(avatarUrl) {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: `${this.baseUrl}/api/users/update-avatar`,
          method: "POST",
          data: {
            avatarUrl
          },
          success: (res) => {
            var _a;
            if (res.data && res.data.success) {
              resolve(res.data);
            } else {
              reject(new Error(((_a = res.data) == null ? void 0 : _a.message) || "更新头像失败"));
            }
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    },
    checkAndNavigateBack() {
      try {
        const lastVisitedPage = common_vendor.index.getStorageSync("lastVisitedPage");
        if (lastVisitedPage) {
          common_vendor.index.removeStorageSync("lastVisitedPage");
          setTimeout(() => {
            common_vendor.index.redirectTo({
              url: lastVisitedPage,
              fail: (err) => {
                console.error("回跳失败：", err);
                common_vendor.index.showToast({
                  title: "页面跳转失败",
                  icon: "none"
                });
              }
            });
          }, 1500);
        }
      } catch (e) {
        console.error("检查回跳页面失败：", e);
      }
    },
    // 获取用户订单
    getUserOrders() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token)
        return;
      common_vendor.index.request({
        url: `${this.baseUrl}/api/orders/user`,
        method: "GET",
        header: {
          "Authorization": token
        },
        success: (res) => {
          console.log("订单响应:", res);
          if (res.statusCode === 200 && Array.isArray(res.data)) {
            this.orders = res.data.map((order) => ({
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
            console.error("获取订单失败:", res);
            common_vendor.index.showToast({
              title: "获取订单失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          console.error("获取订单请求失败:", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !_ctx.isLogin
  }, !_ctx.isLogin ? {
    b: common_assets._imports_0$1,
    c: common_vendor.o((...args) => _ctx.handleWxLogin && _ctx.handleWxLogin(...args))
  } : {
    d: $data.userInfo.avatarUrl,
    e: common_vendor.t($data.userInfo.nickName),
    f: common_vendor.t(_ctx.formatLoginTime)
  }, {
    g: $data.orders.length === 0
  }, $data.orders.length === 0 ? {} : {}, {
    h: common_vendor.f($data.orders, (order, k0, i0) => {
      return common_vendor.e({
        a: order.goodsImage,
        b: common_vendor.t(order.goodsName),
        c: common_vendor.t(order.quantity),
        d: common_vendor.t(order.totalAmount),
        e: common_vendor.t(order.status),
        f: common_vendor.n(order.status === "已取消" ? "profile-canceled" : ""),
        g: order.status === "待付款"
      }, order.status === "待付款" ? {
        h: common_vendor.o(($event) => $options.cancelOrder(order.id), order.id)
      } : {}, {
        i: order.id
      });
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dd383ca2"]]);
wx.createPage(MiniProgramPage);
