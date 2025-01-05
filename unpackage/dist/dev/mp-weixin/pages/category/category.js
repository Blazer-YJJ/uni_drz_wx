"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      statusBarHeight: 0,
      currentCategory: 0,
      categories: [],
      loading: false,
      error: null,
      baseUrl: "http://localhost:3000",
      searchKeyword: "",
      searchResults: []
    };
  },
  onLoad() {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    this.fetchCategories();
  },
  methods: {
    fetchCategories() {
      this.loading = true;
      this.error = null;
      common_vendor.index.request({
        url: `${this.baseUrl}/api/categories/with-products`,
        method: "GET",
        success: (res) => {
          console.log("API响应数据:", res.data);
          if (res.data && Array.isArray(res.data.data)) {
            try {
              this.categories = res.data.data.map((category) => ({
                id: category.id,
                name: category.name,
                banner: `https://picsum.photos/800/400?random=${category.id}`,
                goods: Array.isArray(category.products) ? category.products.map((product) => ({
                  id: product.id,
                  image: product.image_url || "",
                  // 添加默认值
                  name: product.name || "未命名商品",
                  price: product.price || "0.00",
                  stock: product.stock || 0
                })) : []
              }));
              if (this.categories.length > 0) {
                this.currentCategory = 0;
              } else {
                this.handleError("暂无分类数据");
              }
            } catch (error) {
              console.error("数据处理错误:", error);
              this.handleError("数据格式错误");
            }
          } else {
            this.handleError("获取数据失败");
          }
        },
        fail: (err) => {
          console.error("请求失败:", err);
          this.handleError("网络请求失败，请检查网络连接");
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    switchCategory(index) {
      if (index !== this.currentCategory) {
        this.currentCategory = index;
      }
    },
    goToDetail(item) {
      if (!item || !item.id) {
        this.handleError("商品信息不完整");
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/goods/detail?id=${item.id}`,
        fail: (err) => {
          console.error("页面跳转失败:", err);
          this.handleError("页面跳转失败");
        }
      });
    },
    handleError(message) {
      this.error = message;
      common_vendor.index.showToast({
        title: message,
        icon: "none",
        duration: 2e3
      });
    },
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        common_vendor.index.showToast({
          title: "请输入搜索关键词",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      common_vendor.index.request({
        url: `${this.baseUrl}/api/products/search`,
        method: "GET",
        data: {
          keyword: this.searchKeyword
        },
        success: (res) => {
          if (res.data && Array.isArray(res.data.data)) {
            this.categories = [{
              id: "search",
              name: "搜索结果",
              banner: "https://picsum.photos/800/400",
              goods: res.data.data.map((product) => ({
                id: product.id,
                image: product.image_url || "",
                name: product.name || "未命名商品",
                price: product.price || "0.00",
                stock: product.stock || 0
              }))
            }];
            this.currentCategory = 0;
          } else {
            this.handleError("未找到相关商品");
          }
        },
        fail: (err) => {
          console.error("搜索失败:", err);
          this.handleError("搜索失败，请重试");
        },
        complete: () => {
          this.loading = false;
        }
      });
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
    a: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    b: $data.searchKeyword,
    c: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    d: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    e: $data.statusBarHeight + "px",
    f: common_vendor.f($data.categories, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: index,
        c: common_vendor.n($data.currentCategory === index ? "active" : ""),
        d: common_vendor.o(($event) => $options.switchCategory(index), index)
      };
    }),
    g: $data.loading
  }, $data.loading ? {
    h: common_vendor.p({
      status: "loading"
    })
  } : $data.categories.length === 0 ? {
    j: common_assets._imports_0
  } : {
    k: $data.categories[$data.currentCategory].banner,
    l: common_vendor.t($data.categories[$data.currentCategory].name),
    m: common_vendor.f($data.categories[$data.currentCategory].goods, (item, index, i0) => {
      return common_vendor.e({
        a: item.image,
        b: common_vendor.t(item.name),
        c: item.desc
      }, item.desc ? {
        d: common_vendor.t(item.desc)
      } : {}, {
        e: common_vendor.t(item.stock),
        f: common_vendor.t(item.price),
        g: index,
        h: common_vendor.o(($event) => $options.goToDetail(item), index)
      });
    })
  }, {
    i: $data.categories.length === 0,
    n: common_vendor.o((...args) => _ctx.onRefresh && _ctx.onRefresh(...args)),
    o: $data.statusBarHeight + 72 + "px"
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
