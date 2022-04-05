/*
 * @Description: 
 * @Autor: Kaven
 * @Date: 2021-06-23 11:09:49
 * @LastEditors: Kaven
 * @LastEditTime: 2022-03-30 11:34:33
 */
import { hasOwn } from 'element-ui/src/utils/util';
// vnode 其实就是一个对象  判断是不是vnode就判断该对象是不是具备某些特定属性
// componentOptions
export function isVNode(node) {
  return node !== null && typeof node === 'object' && hasOwn(node, 'componentOptions');
};
