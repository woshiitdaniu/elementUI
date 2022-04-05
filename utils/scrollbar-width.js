/*
 * @Description: 
 * @Autor: Kaven
 * @Date: 2021-06-23 11:09:49
 * @LastEditors: Kaven
 * @LastEditTime: 2022-03-15 21:50:57
 */
import Vue from 'vue';

let scrollBarWidth;

export default function() {
  if (Vue.prototype.$isServer) return 0;
  if (scrollBarWidth !== undefined) return scrollBarWidth;

  // 思路：通过生成一个div 然后填入内容  然后间接的计算出当前浏览器滚动条的宽度
  const outer = document.createElement('div');
  outer.className = 'el-scrollbar__wrap';
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  // offsetWidth  等于内容+padding+border
  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  // widthNoScroll = scrollBarWidth + inner.offsetWidth
  scrollBarWidth = widthNoScroll - widthWithScroll;

  return scrollBarWidth;
};
