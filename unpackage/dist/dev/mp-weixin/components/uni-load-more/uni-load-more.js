"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "uni-load-more",
  props: {
    status: {
      type: String,
      default: "more"
    }
  },
  computed: {
    text() {
      if (this.status === "loading") {
        return "加载中...";
      }
      return "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.status === "loading"
  }, $props.status === "loading" ? {} : {}, {
    b: common_vendor.t($options.text)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
