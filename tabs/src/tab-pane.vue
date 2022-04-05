<!--
 * @Description: 
 * @Autor: Kaven
 * @Date: 2021-06-23 11:09:49
 * @LastEditors: Kaven
 * @LastEditTime: 2022-03-29 11:48:14
-->
<template>
  <div
    class="el-tab-pane"
    v-if="(!lazy || loaded) || active"
    v-show="active"
    role="tabpanel"
    :aria-hidden="!active"
    :id="`pane-${paneName}`"
    :aria-labelledby="`tab-${paneName}`"
  >
    <slot></slot>
  </div>
</template>
<script>
  export default {
    name: 'ElTabPane',

    componentName: 'ElTabPane',

    props: {
      label: String,
      labelContent: Function,
      name: String,
      closable: Boolean,
      disabled: Boolean,
      lazy: Boolean
    },

    data() {
      return {
        index: null,
        loaded: false
      };
    },

    computed: {
      isClosable() {
        return this.closable || this.$parent.closable;
      },
      // 父组件当前的name 等于 pane的name/下标时表示选中
      active() {
        const active = this.$parent.currentName === (this.name || this.index);
        if (active) {
          this.loaded = true;
        }
        return active;
      },
      paneName() {
        return this.name || this.index;
      }
    },

    updated() {
      this.$parent.$emit('tab-nav-update');
    }
  };
</script>
