import Vue from 'vue';
import Loading from './loading.vue';
import { addClass, removeClass, getStyle } from 'element-ui/src/utils/dom';
import { PopupManager } from 'element-ui/src/utils/popup';
import afterLeave from 'element-ui/src/utils/after-leave';
const Mask = Vue.extend(Loading);

const loadingDirective = {};
loadingDirective.install = Vue => {
  if (Vue.prototype.$isServer) return;
  // 开关
  const toggleLoading = (el, binding) => {
    // 显示loading
    if (binding.value) {
      // binding.modifiers 是修饰属性 比如v-loading.fullscreen.lock="fullscreenLoading">
      Vue.nextTick(() => {
        // 全屏
        if (binding.modifiers.fullscreen) {
          // getStyle = getAttribute || getCompute
          el.originalPosition = getStyle(document.body, 'position');
          el.originalOverflow = getStyle(document.body, 'overflow');
          el.maskStyle.zIndex = PopupManager.nextZIndex();
          // el.mask 是loading组件的最外层dom节点
          addClass(el.mask, 'is-fullscreen');
          insertDom(document.body, el, binding);
        } else {
          removeClass(el.mask, 'is-fullscreen');

          if (binding.modifiers.body) {
            el.originalPosition = getStyle(document.body, 'position');

            ['top', 'left'].forEach(property => {
              const scroll = property === 'top' ? 'scrollTop' : 'scrollLeft';
              el.maskStyle[property] = el.getBoundingClientRect()[property] +
                document.body[scroll] +
                document.documentElement[scroll] -
                parseInt(getStyle(document.body, `margin-${ property }`), 10) +
                'px';
            });
            ['height', 'width'].forEach(property => {
              el.maskStyle[property] = el.getBoundingClientRect()[property] + 'px';
            });

            insertDom(document.body, el, binding);
          } else {
            el.originalPosition = getStyle(el, 'position');
            insertDom(el, el, binding);
          }
        }
      });
      // 隐藏Loading
    } else {
      afterLeave(el.instance, _ => {
        if (!el.instance.hiding) return;
        el.domVisible = false;
        // 如果是全屏 挂载对象是document.body 否则是el
        const target = binding.modifiers.fullscreen || binding.modifiers.body
          ? document.body
          : el;
        removeClass(target, 'el-loading-parent--relative');
        removeClass(target, 'el-loading-parent--hidden');
        el.instance.hiding = false;
      }, 300, true);
      el.instance.visible = false;
      el.instance.hiding = true;
    }
  };
  const insertDom = (parent, el, binding) => {
    if (!el.domVisible && getStyle(el, 'display') !== 'none' && getStyle(el, 'visibility') !== 'hidden') {
      // 给最外层dom添加行内样式
      Object.keys(el.maskStyle).forEach(property => {
        el.mask.style[property] = el.maskStyle[property];
      });

      if (el.originalPosition !== 'absolute' && el.originalPosition !== 'fixed') {
        addClass(parent, 'el-loading-parent--relative');
      }
      if (binding.modifiers.fullscreen && binding.modifiers.lock) {
        addClass(parent, 'el-loading-parent--hidden');
      }
      el.domVisible = true;

      // dom的挂载
      parent.appendChild(el.mask);
      Vue.nextTick(() => {
        if (el.instance.hiding) {
          el.instance.$emit('after-leave');
        } else {
          // 组件显示
          el.instance.visible = true;
        }
      });
      el.domInserted = true;
      // el.domVisible dom节点已经是存在的 只是隐藏时
    } else if (el.domVisible && el.instance.hiding === true) {
      el.instance.visible = true;
      el.instance.hiding = false;
    }
  };
  // 指令注入
  Vue.directive('loading', {
    bind: function(el, binding, vnode) {
      // 这里分两种情况  如果el是普通的dom元素而不是组件时直接获取其属性值
      const textExr = el.getAttribute('element-loading-text');
      const spinnerExr = el.getAttribute('element-loading-spinner');
      const backgroundExr = el.getAttribute('element-loading-background');
      const customClassExr = el.getAttribute('element-loading-custom-class');
      // 否则就通过组件实例的上下文
      const vm = vnode.context;
      // Mask就是Vue.extent 
      const mask = new Mask({
        el: document.createElement('div'),
        data: {
          // 先从指令挂载的组件实例获取对应属性值
          /* 
            <el-table
              v-loading="loading"
              element-loading-text="拼命加载中"
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(0, 0, 0, 0.8)"
              :data="tableData"
              style="width: 100%">        
          */
          text: vm && vm[textExr] || textExr,
          spinner: vm && vm[spinnerExr] || spinnerExr,
          background: vm && vm[backgroundExr] || backgroundExr,
          customClass: vm && vm[customClassExr] || customClassExr,
          fullscreen: !!binding.modifiers.fullscreen
        }
      });
      el.instance = mask;// 实例 相当于Vue组件里的this
      el.mask = mask.$el;// 实例对应的dom
      el.maskStyle = {};// 实例对应的dom的样式对象

      binding.value && toggleLoading(el, binding);
    },

    update: function(el, binding) {
      el.instance.setText(el.getAttribute('element-loading-text'));
      if (binding.oldValue !== binding.value) {
        toggleLoading(el, binding);
      }
    },

    unbind: function(el, binding) {
      if (el.domInserted) {
        el.mask &&
        el.mask.parentNode &&
        el.mask.parentNode.removeChild(el.mask);
        toggleLoading(el, { value: false, modifiers: binding.modifiers });
      }
      el.instance && el.instance.$destroy();
    }
  });
};

export default loadingDirective;
