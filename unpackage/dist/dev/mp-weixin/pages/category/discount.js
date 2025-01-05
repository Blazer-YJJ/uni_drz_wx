"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      statusBarHeight: 20,
      isRefreshing: false,
      isLoading: false,
      products: [],
      baseUrl: "http://localhost:3000"
    };
  },
  onLoad() {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    this.loadProducts();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 加载商品数据
    async loadProducts() {
      try {
        this.isLoading = true;
        const res = await common_vendor.index.request({
          url: `${this.baseUrl}/api/products/low-price`,
          method: "GET"
        });
        console.log("折扣商品数据:", res);
        if (res.statusCode === 200 && res.data.data) {
          this.products = res.data.data.map((item) => ({
            id: item.id,
            name: item.name,
            brief: item.description,
            discountPrice: item.price,
            // 处理图片URL：替换域名并移除/api前缀
            image: item.image_url ? item.image_url.replace("http://jingchengcool.fun", "http://localhost:3000").replace("/api/", "/") : "http://localhost:3000/static/default-product.png",
            created_at: item.created_at
          }));
          console.log("处理后的商品数据:", this.products);
        } else {
          throw new Error("获取数据失败");
        }
      } catch (error) {
        console.error("获取折扣商品失败:", error);
        common_vendor.index.showToast({
          title: "获取商品失败",
          icon: "none"
        });
      } finally {
        this.isLoading = false;
        this.isRefreshing = false;
      }
    },
    // 刷新数据
    async onRefresh() {
      this.isRefreshing = true;
      await this.loadProducts();
      common_vendor.index.showToast({
        title: "刷新成功",
        icon: "success"
      });
    },
    // 加载更多
    async loadMore() {
      if (this.isLoading)
        return;
      this.isLoading = true;
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      this.isLoading = false;
    },
    // 跳转到商品详情页
    navigateToDetail(productId) {
      if (!productId) {
        console.error("商品ID不存在");
        common_vendor.index.showToast({
          title: "商品信息错误",
          icon: "none"
        });
        return;
      }
      console.log("准备跳转到商品详情页，商品ID:", productId);
      const url = "pages/goods/detail";
      common_vendor.index.navigateTo({
        url: `/${url}?id=${productId}`,
        success: (res) => {
          console.log("跳转成功:", res);
        },
        fail: (err) => {
          console.error("跳转失败:", err);
          common_vendor.index.navigateTo({
            url: `${url}?id=${productId}`,
            fail: (err2) => {
              console.error("第二次跳转也失败:", err2);
              common_vendor.index.showToast({
                title: "页面跳转失败",
                icon: "none",
                duration: 2e3
              });
            }
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.statusBarHeight + "px",
    c: common_vendor.f($data.products, (product, index, i0) => {
      return {
        a: product.image,
        b: common_vendor.t(product.name),
        c: common_vendor.t(product.discountPrice),
        d: common_vendor.t(product.brief),
        e: common_vendor.o(($event) => $options.navigateToDetail(product.id), product.id),
        f: product.id,
        g: index * 0.1 + "s"
      };
    }),
    d: $data.isLoading
  }, $data.isLoading ? {} : {}, {
    e: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    f: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    g: $data.isRefreshing
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b3132178"]]);
wx.createPage(MiniProgramPage);
