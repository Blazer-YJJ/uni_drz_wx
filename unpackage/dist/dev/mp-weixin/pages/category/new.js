"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      products: [],
      featuredProduct: null,
      loading: false,
      refreshing: false,
      page: 1,
      hasMore: true,
      baseUrl: "http://localhost:3000"
    };
  },
  onLoad() {
    this.getNewProducts(true);
  },
  methods: {
    // 处理图片URL的方法
    getImageUrl(url) {
      if (!url)
        return "";
      return url.replace("http://jingchengcool.fun/api/", "http://localhost:3000/").replace("http://localhost:3000/api/", "http://localhost:3000/");
    },
    async getNewProducts(isRefresh = false) {
      if (isRefresh) {
        this.page = 1;
        this.hasMore = true;
      }
      if (!this.hasMore || this.loading)
        return;
      this.loading = true;
      try {
        const res = await common_vendor.index.request({
          url: `${this.baseUrl}/api/products/new`,
          method: "GET",
          header: {
            "content-type": "application/json",
            "Accept": "application/json"
          }
        });
        console.log("新品数据:", res.data);
        if (res.data && Array.isArray(res.data.data)) {
          const newProducts = res.data.data.map((item) => ({
            id: item.id,
            image: this.getImageUrl(item.image_url),
            name: item.name || "未命名商品",
            description: item.description || "暂无描述",
            price: item.price || "0.00",
            created_at: item.created_at,
            tag: this.getTimeTag(item.created_at)
          }));
          console.log("处理后的商品数据:", newProducts);
          if (isRefresh) {
            if (newProducts.length > 0) {
              this.featuredProduct = {
                ...newProducts[0],
                tag: "精选新品"
              };
              this.products = newProducts.slice(1);
            } else {
              this.products = [];
              this.featuredProduct = null;
            }
          } else {
            this.products = [...this.products, ...newProducts];
          }
          this.hasMore = newProducts.length >= 4;
          if (this.hasMore) {
            this.page++;
          }
        } else {
          if (isRefresh) {
            this.products = [];
            this.featuredProduct = null;
          }
          common_vendor.index.showToast({
            title: "暂无新品数据",
            icon: "none"
          });
        }
      } catch (err) {
        console.error("获取新品失败:", err);
        common_vendor.index.showToast({
          title: "获取商品失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
        if (isRefresh) {
          this.refreshing = false;
          common_vendor.index.stopPullDownRefresh();
        }
      }
    },
    // 根据创建时间生成标签
    getTimeTag(created_at) {
      const createTime = new Date(created_at);
      const now = /* @__PURE__ */ new Date();
      const diffDays = Math.floor((now - createTime) / (1e3 * 60 * 60 * 24));
      if (diffDays < 3) {
        return "新品上市";
      } else if (diffDays < 7) {
        return "本周新品";
      } else if (diffDays < 30) {
        return "本月新品";
      } else {
        return "精选商品";
      }
    },
    onRefresh() {
      this.refreshing = true;
      this.getNewProducts(true);
    },
    loadMore() {
      if (!this.loading && this.hasMore) {
        this.getNewProducts();
      }
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
    },
    goBack() {
      common_vendor.index.navigateBack({
        fail: () => {
          common_vendor.index.switchTab({
            url: "/pages/index/index"
          });
        }
      });
    },
    handleImageError(e) {
      console.error("图片加载失败:", e.target.src);
      e.target.src = "";
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
    b: $data.featuredProduct
  }, $data.featuredProduct ? {
    c: $data.featuredProduct.image,
    d: common_vendor.t($data.featuredProduct.name),
    e: common_vendor.t($data.featuredProduct.description),
    f: common_vendor.t($data.featuredProduct.price),
    g: common_vendor.o(($event) => $options.goToDetail($data.featuredProduct))
  } : {}, {
    h: common_vendor.f($data.products, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.tag),
        c: common_vendor.t(item.name),
        d: common_vendor.t(item.description),
        e: common_vendor.t(item.price),
        f: index,
        g: common_vendor.o(($event) => $options.goToDetail(item), index)
      };
    }),
    i: $data.loading
  }, $data.loading ? {
    j: common_vendor.p({
      status: "loading"
    })
  } : {}, {
    k: !$data.loading && $data.products.length === 0
  }, !$data.loading && $data.products.length === 0 ? {} : {}, {
    l: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    m: $data.refreshing,
    n: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
