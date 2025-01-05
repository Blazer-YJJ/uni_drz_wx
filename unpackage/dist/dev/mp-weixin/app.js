"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/category/category.js";
  "./pages/profile/profile.js";
  "./pages/category/new.js";
  "./pages/category/hot.js";
  "./pages/category/discount.js";
  "./pages/goods/detail.js";
}
const _sfc_main = {
  globalData: {
    userInfo: null,
    orders: []
  },
  onLaunch: function() {
    console.log("App Launch");
    try {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.globalData.userInfo = JSON.parse(userInfo);
      }
      const orders = common_vendor.index.getStorageSync("orders");
      if (orders) {
        this.globalData.orders = JSON.parse(orders);
        if (!Array.isArray(this.globalData.orders)) {
          this.globalData.orders = [];
        }
      }
    } catch (e) {
      console.error("获取数据失败", e);
      this.globalData.orders = [];
    }
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  }
};
const uniLoadMore = () => "./components/uni-load-more/uni-load-more.js";
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.component("uni-load-more", uniLoadMore);
  app.config.globalProperties.$config = {
    baseUrl: "http://jingchengcool.fun",
    isDev: true
  };
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
