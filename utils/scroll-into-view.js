/*
 * @Description: 
 * @Autor: Kaven
 * @Date: 2021-06-23 11:09:49
 * @LastEditors: Kaven
 * @LastEditTime: 2022-03-15 18:17:16
 */
import Vue from 'vue';

export default function scrollIntoView(container, selected) {
  if (Vue.prototype.$isServer) return;

  if (!selected) {
    container.scrollTop = 0;
    return;
  }

  const offsetParents = [];
  let pointer = selected.offsetParent;
  while (pointer && container !== pointer && container.contains(pointer)) {
    offsetParents.push(pointer);
    pointer = pointer.offsetParent;
  }
  // offsetTop 为元素顶部到容器的顶部的高度
  // offsetHeight为元素的高度  包括内容+padding+border
  const top = selected.offsetTop + offsetParents.reduce((prev, curr) => (prev + curr.offsetTop), 0);
  const bottom = top + selected.offsetHeight;
  const viewRectTop = container.scrollTop;
  const viewRectBottom = viewRectTop + container.clientHeight;

  // 重置滚动条位置
  if (top < viewRectTop) {
    container.scrollTop = top;
  } else if (bottom > viewRectBottom) {
    container.scrollTop = bottom - container.clientHeight;
  }
}
