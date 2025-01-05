"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  // 移除组件引入
  components: {
    // 移除局部组件注册
  },
  data() {
    return {
      product: {},
      loading: true,
      baseUrl: "http://localhost:3000",
      imageLoaded: false,
      isLoggedIn: false,
      submitting: false,
      isDev: true,
      orderForm: {
        name: "",
        phone: ""
      },
      statusBarHeight: 20
    };
  },
  computed: {
    descriptionLines() {
      return this.product.description ? this.product.description.split("\n").filter((line) => line.trim()) : ["暂无描述"];
    }
  },
  onLoad(options) {
    if (options.id) {
      this.fetchProductDetail(options.id);
    } else {
      this.handleError("商品ID不存在");
    }
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
  },
  onShow() {
    this.checkLoginStatus();
  },
  methods: {
    fetchProductDetail(id) {
      this.loading = true;
      common_vendor.index.request({
        url: `${this.baseUrl}/api/products/detail/${id}`,
        method: "GET",
        success: (res) => {
          console.log("商品详情:", res.data);
          if (res.data && res.data.data) {
            this.product = {
              ...res.data.data,
              image_url: res.data.data.image_url || "",
              price: res.data.data.price || "0.00",
              stock: res.data.data.stock || 0,
              total_sold: res.data.data.total_sold || 0
            };
          } else {
            this.handleError("获取商品信息失败");
          }
        },
        fail: (err) => {
          console.error("请求失败:", err);
          this.handleError("网络请求失败");
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    handleImageLoad() {
      this.imageLoaded = true;
    },
    handleImageError() {
      this.product.image_url = "/static/images/default-product.png";
    },
    handleError(message) {
      common_vendor.index.showToast({
        title: message,
        icon: "none"
      });
    },
    checkLoginStatus() {
      try {
        const token = common_vendor.index.getStorageSync("token");
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (!token || !userInfo) {
          this.isLoggedIn = false;
          return;
        }
        const parsedUserInfo = JSON.parse(userInfo);
        this.isLoggedIn = !!(parsedUserInfo.id && token);
        console.log("登录状态:", this.isLoggedIn);
        console.log("Token:", token);
        console.log("用户信息:", parsedUserInfo);
      } catch (e) {
        console.error("检查登录状态失败：", e);
        this.isLoggedIn = false;
      }
    },
    placeOrder() {
      if (this.submitting)
        return;
      this.checkLoginStatus();
      if (!this.isLoggedIn) {
        common_vendor.index.showModal({
          title: "提示",
          content: "您还未登录，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              const currentPage = `/pages/goods/detail?id=${this.product.id}`;
              common_vendor.index.setStorageSync("lastVisitedPage", currentPage);
              common_vendor.index.switchTab({
                url: "/pages/profile/profile"
              });
            }
          }
        });
        return;
      }
      if (!this.product.stock) {
        this.handleError("商品库存不足");
        return;
      }
      if (!this.orderForm.name.trim()) {
        this.handleError("请输入姓名");
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(this.orderForm.phone)) {
        this.handleError("请输入正确的手机号");
        return;
      }
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.handleError("登录已过期，请重新登录");
        return;
      }
      const orderData = {
        customer_name: this.orderForm.name.trim(),
        customer_phone: this.orderForm.phone.trim(),
        items: [
          {
            product_id: this.product.id,
            quantity: 1
          }
        ]
      };
      this.submitting = true;
      console.log("发送订单数据:", orderData);
      console.log("使用的token:", token);
      common_vendor.index.request({
        url: `${this.baseUrl}/api/orders`,
        method: "POST",
        data: orderData,
        header: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.replace("Bearer ", "")}`
        },
        success: (res) => {
          var _a;
          console.log("下单响应:", res.data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            const app = getApp();
            const orders = app.globalData.orders || [];
            orders.unshift({
              id: res.data.id || Date.now(),
              goodsId: this.product.id,
              goodsName: this.product.name,
              goodsImage: this.product.image_url,
              quantity: 1,
              price: this.product.price,
              totalAmount: this.product.price,
              createTime: (/* @__PURE__ */ new Date()).toISOString(),
              status: "待付款"
            });
            app.globalData.orders = orders;
            common_vendor.index.setStorageSync("orders", JSON.stringify(orders));
            common_vendor.index.showToast({
              title: "下单成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.switchTab({
                url: "/pages/profile/profile"
              });
            }, 1500);
          } else if (res.statusCode === 401) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("userInfo");
            this.isLoggedIn = false;
            common_vendor.index.showModal({
              title: "提示",
              content: "登录已过期，请重新登录",
              success: (res2) => {
                if (res2.confirm) {
                  const currentPage = `/pages/goods/detail?id=${this.product.id}`;
                  common_vendor.index.setStorageSync("lastVisitedPage", currentPage);
                  common_vendor.index.switchTab({
                    url: "/pages/profile/profile"
                  });
                }
              }
            });
          } else {
            this.handleError(((_a = res.data) == null ? void 0 : _a.message) || "下单失败");
          }
        },
        fail: (err) => {
          console.error("下单失败:", err);
          this.handleError("网络请求失败");
        },
        complete: () => {
          this.submitting = false;
        }
      });
    },
    getUserId() {
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (!userInfo)
          return null;
        const user = JSON.parse(userInfo);
        return user.id ? parseInt(user.id) : null;
      } catch (e) {
        console.error("获取用户ID失败：", e);
        return null;
      }
    },
    // 生成订单编号
    generateOrderNo() {
      const date = /* @__PURE__ */ new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const random = Math.floor(Math.random() * 1e4).toString().padStart(4, "0");
      return `ORDER${year}${month}${day}${random}`;
    },
    // 获取token
    getToken() {
      try {
        return common_vendor.index.getStorageSync("token") || "";
      } catch (e) {
        console.error("获取token失败：", e);
        return "";
      }
    },
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  _easycom_uni_load_more2();
}
const _easycom_uni_load_more = () => "../../components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.statusBarHeight + "px",
    c: $data.loading
  }, $data.loading ? {
    d: common_vendor.p({
      status: "loading"
    })
  } : common_vendor.e({
    e: $data.product.image_url,
    f: common_vendor.o((...args) => $options.handleImageLoad && $options.handleImageLoad(...args)),
    g: common_vendor.o((...args) => $options.handleImageError && $options.handleImageError(...args)),
    h: common_vendor.t($data.product.price),
    i: common_vendor.t($data.product.name),
    j: common_vendor.t($data.product.stock),
    k: common_vendor.t($data.product.total_sold || 0),
    l: common_vendor.f($options.descriptionLines, (line, index, i0) => {
      return {
        a: common_vendor.t(line),
        b: index
      };
    }),
    m: $data.orderForm.name,
    n: common_vendor.o(($event) => $data.orderForm.name = $event.detail.value),
    o: $data.orderForm.phone,
    p: common_vendor.o(($event) => $data.orderForm.phone = $event.detail.value),
    q: !$data.product.stock
  }, !$data.product.stock ? {} : $data.submitting ? {} : {}, {
    r: $data.submitting,
    s: $data.submitting || !$data.product.stock,
    t: !$data.product.stock ? 1 : "",
    v: common_vendor.o((...args) => $options.placeOrder && $options.placeOrder(...args))
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
