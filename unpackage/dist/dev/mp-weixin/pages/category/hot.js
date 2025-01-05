"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      statusBarHeight: 20,
      isRefreshing: false,
      isLoading: false,
      featuredProduct: null,
      products: [],
      baseUrl: "http://localhost:3000"
    };
  },
  onLoad() {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
  },
  methods: {
    goBack() {
      common_vendor.index.switchTab({
        url: "/pages/category/category"
      });
    },
    async loadProducts() {
      try {
        const response = await common_vendor.index.request({
          url: `${this.baseUrl}/api/products/hot`,
          method: "GET"
        });
        if (response.statusCode === 200 && response.data.data) {
          const products = response.data.data;
          if (products.length > 0) {
            const sortedProducts = [...products].sort((a, b) => b.total_sold - a.total_sold);
            this.featuredProduct = {
              id: sortedProducts[0].id,
              name: sortedProducts[0].name,
              description: `已售 ${sortedProducts[0].total_sold}`,
              price: sortedProducts[0].price,
              image: sortedProducts[0].image_url
            };
          }
          this.products = products.map((item) => ({
            id: item.id,
            name: item.name,
            description: "精选好物",
            price: item.price,
            image: item.image_url,
            sales: item.total_sold,
            tag: item.total_sold > 5 ? "热门" : ""
          }));
        }
      } catch (error) {
        console.error("获取商品数据失败:", error);
        common_vendor.index.showToast({
          title: "获取商品数据失败",
          icon: "none"
        });
      }
    },
    async onRefresh() {
      this.isRefreshing = true;
      await this.loadProducts();
      this.isRefreshing = false;
      common_vendor.index.showToast({
        title: "刷新成功",
        icon: "success"
      });
    },
    async loadMore() {
      if (this.isLoading)
        return;
      this.isLoading = true;
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      this.isLoading = false;
    },
    goToDetail(item) {
      if (!item || !item.id) {
        common_vendor.index.showToast({
          title: "商品信息不完整",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/goods/detail?id=${item.id}`,
        fail: (err) => {
          console.error("页面跳转失败:", err);
          common_vendor.index.showToast({
            title: "页面跳转失败",
            icon: "none"
          });
        }
      });
    }
  },
  onShow() {
    this.loadProducts();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.statusBarHeight + "px",
    c: $data.featuredProduct
  }, $data.featuredProduct ? {
    d: $data.featuredProduct.image,
    e: common_vendor.t($data.featuredProduct.name),
    f: common_vendor.t($data.featuredProduct.description),
    g: common_vendor.t($data.featuredProduct.price)
  } : {}, {
    h: common_vendor.f($data.products, (product, index, i0) => {
      return common_vendor.e({
        a: product.image,
        b: product.tag
      }, product.tag ? {
        c: common_vendor.t(product.tag)
      } : {}, {
        d: common_vendor.t(product.name),
        e: common_vendor.t(product.description),
        f: common_vendor.t(product.sales),
        g: common_vendor.t(product.price),
        h: product.id,
        i: index * 0.1 + "s",
        j: common_vendor.o(($event) => $options.goToDetail(product), product.id)
      });
    }),
    i: $data.isLoading
  }, $data.isLoading ? {} : {}, {
    j: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    k: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    l: $data.isRefreshing
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4be31c9"]]);
wx.createPage(MiniProgramPage);
