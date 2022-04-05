/*
 * @Description: 
 * @Autor: Kaven
 * @Date: 2021-06-23 11:09:49
 * @LastEditors: Kaven
 * @LastEditTime: 2022-03-30 19:25:45
 */
import Vue from 'vue';

export function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isHtmlElement(node) {
  return node && node.nodeType === Node.ELEMENT_NODE;
}

/**
 *  - Inspired:
 *    https://github.com/jashkenas/underscore/blob/master/modules/isFunction.js
 */
let isFunction = (functionToCheck) => {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

if (typeof /./ !== 'function' && typeof Int8Array !== 'object' && (Vue.prototype.$isServer || typeof document.childNodes !== 'function')) {
  isFunction = function(obj) {
    return typeof obj === 'function' || false;
  };
}

export {
  isFunction
};
// 判断未定义
export const isUndefined = (val)=> {
  return val === void 0;
};

export const isDefined = (val) => {
  return val !== undefined && val !== null;
};
