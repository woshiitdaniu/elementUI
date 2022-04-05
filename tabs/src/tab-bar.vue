<!--
 * @Description: 
 * @Autor: Kaven
 * @Date: 2021-06-23 11:09:49
 * @LastEditors: Kaven
 * @LastEditTime: 2022-03-29 11:41:57
-->
<template>
<!-- 滚动滑块 -->
  <div class="el-tabs__active-bar" :class="`is-${ rootTabs.tabPosition }`" :style="barStyle"></div>
</template>
<script>
  import { arrayFind } from 'element-ui/src/utils/util';
  export default {
    name: 'TabBar',

    props: {
      tabs: Array
    },

    inject: ['rootTabs'],

    computed: {
      // 根据当前选中的tab的宽度计算滚动滑块的位置及宽度
      barStyle: {
        get() {
          let style = {};
          let offset = 0;
          let tabSize = 0;
          const sizeName = ['top', 'bottom'].indexOf(this.rootTabs.tabPosition) !== -1 ? 'width' : 'height';
          const sizeDir = sizeName === 'width' ? 'x' : 'y';
          // 首字母大写
          const firstUpperCase = str => {
            return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
          };
          // every 遇到false就立即结束并返回false
          this.tabs.every((tab, index) => {
            let $el = arrayFind(this.$parent.$refs.tabs || [], t => t.id.replace('tab-', '') === tab.paneName);
            if (!$el) { return false; }
            // 计算所有非选中tab的可视宽度 clientWidth包括padding
            if (!tab.active) {
              offset += $el[`client${firstUpperCase(sizeName)}`];
              return true;
            } else {
              // 循环到 选中的那个tab时
              tabSize = $el[`client${firstUpperCase(sizeName)}`];
              const tabStyles = window.getComputedStyle($el);
              // 使用clentW - padding = 纯width
              if (sizeName === 'width' && this.tabs.length > 1) {
                tabSize -= parseFloat(tabStyles.paddingLeft) + parseFloat(tabStyles.paddingRight);
              }
              // 偏移量  计算最后一个tab需要加上paddingLeft
              if (sizeName === 'width') {
                offset += parseFloat(tabStyles.paddingLeft);
              }
              return false;
            }
          });
          // translateX 这些偏移量是以节点的左边界计算的
          const transform = `translate${firstUpperCase(sizeDir)}(${offset}px)`;
          style[sizeName] = tabSize + 'px';// bar的宽度等于选中那个tab的宽度
          style.transform = transform;
          style.msTransform = transform;
          style.webkitTransform = transform;

          return style;
        }
      }
    }
  };
</script>
