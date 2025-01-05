<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2024-12-23 01:43:32
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2024-12-23 01:45:52
 * @FilePath: \uni_drz_wc\components\uni-load-more\uni-load-more.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="uni-load-more">
    <view v-if="status === 'loading'" class="uni-load-more__img">
      <view class="loading-icon"></view>
    </view>
    <text class="uni-load-more__text">{{text}}</text>
  </view>
</template>

<script>
export default {
  name: 'uni-load-more',
  props: {
    status: {
      type: String,
      default: 'more'
    }
  },
  computed: {
    text() {
      if (this.status === 'loading') {
        return '加载中...'
      }
      return ''
    }
  }
}
</script>

<style>
.uni-load-more {
  display: flex;
  flex-direction: row;
  height: 80rpx;
  align-items: center;
  justify-content: center;
}

.uni-load-more__text {
  font-size: 28rpx;
  color: #999;
}

.uni-load-more__img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.loading-icon {
  width: 100%;
  height: 100%;
  border: 2px solid #e5e5e5;
  border-top-color: #007aff;
  border-radius: 50%;
  animation: loading 1s linear infinite;
}

@keyframes loading {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 