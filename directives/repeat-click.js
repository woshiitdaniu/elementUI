/*
 * @Description: 
 * @Autor: Kaven
 * @Date: 2021-06-23 11:09:49
 * @LastEditors: Kaven
 * @LastEditTime: 2022-03-30 11:04:29
 */
import { once, on } from 'element-ui/src/utils/dom';
/* 处理重复点击 指令 比如数量的+ - */
export default {
  bind(el, binding, vnode) {
    let interval = null;
    let startTime;
    // 将具体事件 授权给当前组件实例binding.expression后面指定的方法
    const handler = () => vnode.context[binding.expression].apply();
    const clear = () => {
      // 这里仅处理那种快速释放的点击事件 因为大于100毫秒的已经在定时器里处理了
      if (Date.now() - startTime < 100) {
        handler();
      }
      clearInterval(interval);
      interval = null;
    };
    // 初始时给当前dom绑定mouseDown事件
    on(el, 'mousedown', (e) => {
      if (e.button !== 0) return;
      startTime = Date.now();
      // 同时给当前dom绑定mouseup 一次性事件
      once(document, 'mouseup', clear);
      // 多次点击时 只触发最后一次
      clearInterval(interval);
      // 如果长按不放会一直每隔100毫秒执行handler
      interval = setInterval(handler, 100);
    });
  }
};
