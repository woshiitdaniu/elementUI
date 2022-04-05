/*
 * @Description: 
 * @Autor: Kaven
 * @Date: 2021-06-23 11:09:49
 * @LastEditors: Kaven
 * @LastEditTime: 2022-03-29 16:03:17
 */
import { addClass, removeClass } from 'element-ui/src/utils/dom';
/* 
  .collapse-transition {
      transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out;
  }

  整个过程分两个阶段：
  1.显示阶段 height 从0 - scrollHeight
  2.隐藏阶段 height 从scrollHeight - 0
  整个采用transition 控制动画时长 属性和节奏
*/
class Transition {
  // 这里的el 是transition组件的dom节点
  // 相当于keyframe的0%
  beforeEnter(el) {
    addClass(el, 'collapse-transition');
    if (!el.dataset) el.dataset = {};
    // 将paddingTop和bottom先存在自定义属性中
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;

    el.style.height = '0';
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
  }
  // 显示过程的动画 相当于keyframe的(0%-100%)的过程
  enter(el) {
    el.dataset.oldOverflow = el.style.overflow;
    // dom的scrollHeight是不会因为节点的高度为0而为0  它是内容的高度
    if (el.scrollHeight !== 0) {
      // 将高度还原
      el.style.height = el.scrollHeight + 'px';
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    } else {
      el.style.height = '';
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    }
    // 将overflow设置为hidden才会将内容隐藏
    el.style.overflow = 'hidden';
  }
  // 完成显示后 变回原样 相当于keyframe的100%
  afterEnter(el) {
    // for safari: remove class then reset height is necessary
    removeClass(el, 'collapse-transition');
    el.style.height = '';
    el.style.overflow = el.dataset.oldOverflow;
  }

  beforeLeave(el) {
    if (!el.dataset) el.dataset = {};
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;
    el.dataset.oldOverflow = el.style.overflow;

    el.style.height = el.scrollHeight + 'px';
    el.style.overflow = 'hidden';
  }

  leave(el) {
    if (el.scrollHeight !== 0) {
      // for safari: add class after set height, or it will jump to zero height suddenly, weired
      addClass(el, 'collapse-transition');
      el.style.height = 0;
      el.style.paddingTop = 0;
      el.style.paddingBottom = 0;
    }
  }

  afterLeave(el) {
    removeClass(el, 'collapse-transition');
    el.style.height = '';
    el.style.overflow = el.dataset.oldOverflow;
    el.style.paddingTop = el.dataset.oldPaddingTop;
    el.style.paddingBottom = el.dataset.oldPaddingBottom;
  }
}

export default {
  name: 'ElCollapseTransition',
  functional: true,// 定义函数式组件
  render(h, { children }) {
    // 设置各种on 方法
    const data = {
      on: new Transition()
    };

    return h('transition', data, children);
  }
};
