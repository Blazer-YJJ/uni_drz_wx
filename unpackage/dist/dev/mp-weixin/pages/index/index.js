"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
      baseUrl: "http://localhost:3000",
      categories: [
        {
          name: "新品",
          icon: "/static/index/icon-new.png",
          url: "/pages/category/new"
        },
        {
          name: "热卖",
          icon: "/static/index/icon-hot.png",
          url: "/pages/category/hot"
        },
        {
          name: "折扣",
          icon: "/static/index/icon-discount.png",
          url: "/pages/category/discount"
        },
        {
          name: "分类",
          icon: "/static/index/icon-category.png",
          url: "/pages/category/category"
        }
      ]
    };
  },
  onLoad() {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    this.getBanners();
    this.getHotProducts();
    this.getRecommendProducts();
  },
  methods: {
    getBanners() {
      this.bannerLoading = true;
      common_vendor.index.request({
        url: `${this.baseUrl}/api/banners/public`,
        method: "GET",
        success: (res) => {
          console.log("轮播图响应:", res);
          if (res.statusCode === 200 && res.data.status === "success" && Array.isArray(res.data.data)) {
            this.bannerList = res.data.data.map((item) => ({
              id: item.id,
              image: item.image_url,
              title: item.title,
              link: item.link_url || ""
            }));
            console.log("处理后的轮播图数据:", this.bannerList);
          } else {
            console.error("轮播图数据格式错误:", res);
            this.bannerList = [];
            common_vendor.index.showToast({
              title: "获取轮播图失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          console.error("获取轮播图失败:", err);
          this.bannerList = [];
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          this.bannerLoading = false;
        }
      });
    },
    getHotProducts() {
      this.loading = true;
      common_vendor.index.request({
        url: `${this.baseUrl}/api/products/hot`,
        method: "GET",
        success: (res) => {
          console.log("热门商品数据:", res.data);
          if (res.data && Array.isArray(res.data.data)) {
            this.hotProducts = res.data.data.map((item) => ({
              id: item.id,
              image: item.image_url || "",
              name: item.name || "未命名商品",
              price: item.price || "0.00",
              soldCount: item.total_sold || 0
            }));
          }
        },
        fail: (err) => {
          console.error("获取热门商品失败:", err);
          common_vendor.index.showToast({
            title: "获取热门商品失败",
            icon: "none"
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    getRecommendProducts() {
      this.recommendLoading = true;
      common_vendor.index.request({
        url: `${this.baseUrl}/api/products/recommend`,
        method: "GET",
        success: (res) => {
          console.log("推荐商品数据:", res.data);
          if (res.data && Array.isArray(res.data.data)) {
            this.recommendProducts = res.data.data.map((item) => ({
              id: item.id,
              image: item.image_url || "",
              name: item.name || "未命名商品",
              desc: item.description || "暂无描述",
              price: item.price || "0.00",
              stock: item.stock || 0
            }));
          }
        },
        fail: (err) => {
          console.error("获取推荐商品失败:", err);
          common_vendor.index.showToast({
            title: "获取推荐商品失败",
            icon: "none"
          });
        },
        complete: () => {
          this.recommendLoading = false;
        }
      });
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
    handleBannerClick(item) {
      console.log("点击轮播图:", item);
      if (item.link) {
        common_vendor.index.navigateTo({
          url: item.link,
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
    handleBannerError(item) {
      console.error("轮播图加载失败:", item);
    },
    handleCategoryClick(item) {
      console.log("点击分类:", item);
      if (item.url) {
        if (item.name === "分类") {
          common_vendor.index.switchTab({
            url: "/pages/category/category",
            fail: (err) => {
              console.error("页面跳转失败:", err);
              common_vendor.index.showToast({
                title: "页面跳转失败",
                icon: "none"
              });
            }
          });
        } else {
          common_vendor.index.navigateTo({
            url: item.url,
            fail: (err) => {
              console.error("页面跳转失败:", err);
              common_vendor.index.showToast({
                title: "页面跳转失败",
                icon: "none"
              });
            }
          });
        }
      }
    }
  }
};
const __injectCSSVars__ = () => {
  common_vendor.useCssVars((_ctx) => ({
    "3c41f844": _ctx.statusBarHeight + 92 + "px"
  }));
};
const __setup__ = _sfc_main.setup;
_sfc_main.setup = __setup__ ? (props, ctx) => {
  __injectCSSVars__();
  return __setup__(props, ctx);
} : __injectCSSVars__;
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
    a: $data.statusBarHeight + "px",
    b: $data.bannerLoading
  }, $data.bannerLoading ? {
    c: common_vendor.p({
      status: "loading"
    })
  } : $data.bannerList.length > 0 ? {
    e: common_vendor.f($data.bannerList, (item, k0, i0) => {
      return {
        a: item.image,
        b: common_vendor.o(($event) => $options.handleBannerError(item), item.id),
        c: common_vendor.t(item.title),
        d: item.id,
        e: common_vendor.o(($event) => $options.handleBannerClick(item), item.id)
      };
    })
  } : {}, {
    d: $data.bannerList.length > 0,
    f: common_vendor.f($data.categories, (item, index, i0) => {
      return {
        a: item.icon,
        b: common_vendor.t(item.name),
        c: index,
        d: common_vendor.o(($event) => $options.handleCategoryClick(item), index)
      };
    }),
    g: common_vendor.o(($event) => _ctx.goToMore("hot")),
    h: $data.loading
  }, $data.loading ? {
    i: common_vendor.p({
      status: "loading"
    })
  } : {
    j: common_vendor.f($data.hotProducts, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.price),
        d: common_vendor.t(item.soldCount),
        e: index,
        f: common_vendor.o(($event) => $options.goToDetail(item), index)
      };
    })
  }, {
    k: $data.recommendLoading
  }, $data.recommendLoading ? {
    l: common_vendor.p({
      status: "loading"
    })
  } : {
    m: common_vendor.f($data.recommendProducts, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.desc),
        d: common_vendor.t(item.price),
        e: common_vendor.t(item.stock),
        f: index,
        g: common_vendor.o(($event) => $options.goToDetail(item), index)
      };
    })
  }, {
    n: common_vendor.s(_ctx.__cssVars())
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
