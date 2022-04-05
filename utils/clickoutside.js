/*
 * @Description: 
 * @Autor: Kaven
 * @Date: 2021-06-23 11:09:49
 * @LastEditors: Kaven
 * @LastEditTime: 2022-03-30 11:41:44
 */
import Vue from 'vue';
import { on } from 'element-ui/src/utils/dom';

const nodeList = [];
const ctx = '@@clickoutsideContext';// 定义唯一标记

let startClick;
let seed = 0;
// 监听document 的mousedown 和 mouseup事件
// 服务端渲染是不存在 document 的
!Vue.prototype.$isServer && on(document, 'mousedown', e => (startClick = e));

// 借助事件冒泡 以及 e.target来获取点击时的目标dom节点
!Vue.prototype.$isServer && on(document, 'mouseup', e => {
  // 鼠标释放后调用documentHandler方法--->createDocumentHandler
  nodeList.forEach(node => node[ctx].documentHandler(e, startClick));
});

function createDocumentHandler(el, binding, vnode) {
  // mouseup 鼠标弹起时指针所对的dom节点   mousedown 鼠标按下时指针所对的dom节点
  /* 
    dom.contains 可以判断某个dom元素是否含在里面
  */
  return function(mouseup = {}, mousedown = {}) {

    // 如果是包含点击目标或子节点的 直接return
    if (!vnode ||
      !vnode.context ||
      !mouseup.target ||
      !mousedown.target ||
      // 鼠标点击的dom节点被包含在目标el节点范围内
      el.contains(mouseup.target) ||
      el.contains(mousedown.target) ||
      // 或者点击的就是其自身而不是其范围外
      el === mouseup.target ||
      (vnode.context.popperElm &&
      (vnode.context.popperElm.contains(mouseup.target) ||
      vnode.context.popperElm.contains(mousedown.target)))) return;

    if (binding.expression &&
      el[ctx].methodName &&
      vnode.context[el[ctx].methodName]) {
        // 当设置了回调函数时 点击容器外时触发该函数
      vnode.context[el[ctx].methodName]();
    // 执行指令的函数 
    } else {
      el[ctx].bindingFn && el[ctx].bindingFn();
    }
  };
}

/**
 * v-clickoutside
 * @desc 点击元素外面才会触发的事件
 * @example
 * ```vue
 * <div v-element-clickoutside="handleClose">
 * ```
 */
export default {
  bind(el, binding, vnode) {
    nodeList.push(el);
    const id = seed++;
    //  const ctx = '@@clickoutsideContext';
    el[ctx] = {
      id,// 这里用id 是因为后面要进行组件销毁的时候 只销毁对应的指令
      documentHandler: createDocumentHandler(el, binding, vnode),// 这里借助了函数的柯里化返回了一个新的函数
      methodName: binding.expression,
      bindingFn: binding.value
    };
  },

  update(el, binding, vnode) {
    el[ctx].documentHandler = createDocumentHandler(el, binding, vnode);
    el[ctx].methodName = binding.expression;
    el[ctx].bindingFn = binding.value;
  },

  unbind(el) {
    let len = nodeList.length;

    for (let i = 0; i < len; i++) {
      if (nodeList[i][ctx].id === el[ctx].id) {
        nodeList.splice(i, 1);
        break;
      }
    }
    delete el[ctx];
  }
};
