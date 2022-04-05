import Vue from 'vue';
import { isString, isObject } from 'element-ui/src/utils/types';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function noop() {};

export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
};
// 对象属性浅拷贝
function extend(to, _from) {
  for (let key in _from) {
    to[key] = _from[key];
  }
  return to;
};
// 将数组转为对象  key和value都是一个
export function toObject(arr) {
  var res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
};
/* 
    根据 多个属性获取属性值
    比如 .name.age.weight
    obj = {name:{age:{weight:100}}}
*/
export const getValueByPath = function(object, prop) {
  prop = prop || '';
  // 将.name.age.weight 转成[name,age,weight]
  const paths = prop.split('.');
  
  let current = object;
  let result = null;
  for (let i = 0, j = paths.length; i < j; i++) {
    const path = paths[i];
    if (!current) break;
    // 从最外层一直找到里层
    if (i === j - 1) {
      result = current[path];
      break;
    }
    current = current[path];
  }
  return result;
};

export function getPropByPath(obj, path, strict) {
  let tempObj = obj;
  path = path.replace(/\[(\w+)\]/g, '.$1');
  path = path.replace(/^\./, '');

  let keyArr = path.split('.');
  let i = 0;
  for (let len = keyArr.length; i < len - 1; ++i) {
    if (!tempObj && !strict) break;
    let key = keyArr[i];
    if (key in tempObj) {
      tempObj = tempObj[key];
    } else {
      if (strict) {
        throw new Error('please transfer a valid prop path to form item!');
      }
      break;
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj ? tempObj[keyArr[i]] : null
  };
};
// 生成（0-9999）的随机整数
export const generateId = function() {
  return Math.floor(Math.random() * 10000);
};

export const valueEquals = (a, b) => {
  // see: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
  if (a === b) return true;
  if (!(a instanceof Array)) return false;
  if (!(b instanceof Array)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i !== a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const escapeRegexpString = (value = '') => String(value).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

// TODO: use native Array.find, Array.findIndex when IE support is dropped
// 找到数组中某项值的下标  arrayFindIndex(arr,(item)=>item===xxx)
export const arrayFindIndex = function(arr, pred) {
  for (let i = 0; i !== arr.length; ++i) {
    if (pred(arr[i])) {
      return i;
    }
  }
  return -1;
};
// 从数组中找到某值
export const arrayFind = function(arr, pred) {
  const idx = arrayFindIndex(arr, pred);
  return idx !== -1 ? arr[idx] : undefined;
};

// coerce truthy value to array
export const coerceTruthyValueToArray = function(val) {
  if (Array.isArray(val)) {
    return val;
  } else if (val) {
    return [val];
  } else {
    return [];
  }
};
// document.documentMode是IE特有属性
export const isIE = function() {
  return !Vue.prototype.$isServer && !isNaN(Number(document.documentMode));
};
// navigator.userAgent
export const isEdge = function() {
  return !Vue.prototype.$isServer && navigator.userAgent.indexOf('Edge') > -1;
};

export const isFirefox = function() {
  return !Vue.prototype.$isServer && !!window.navigator.userAgent.match(/firefox/i);
};
// 给特定属性加前缀 ['transform', 'transition', 'animation']
export const autoprefixer = function(style) {
  if (typeof style !== 'object') return style;
  const rules = ['transform', 'transition', 'animation'];
  const prefixes = ['ms-', 'webkit-'];
  rules.forEach(rule => {
    const value = style[rule];
    if (rule && value) {
      // 给style对象增加ms-xxx的属性
      prefixes.forEach(prefix => {
        style[prefix + rule] = value;
      });
    }
  });
  return style;
};
// aAbB -->a-A-b-B -->a-a-b-b 小驼峰转成- 形式
export const kebabCase = function(str) {
  const hyphenateRE = /([^-])([A-Z])/g;
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase();
};
// 首字母大写
export const capitalize = function(str) {
  if (!isString(str)) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// 简单的判断两个参数是否相等  如果是对象则使用JSON.stringify 否则转成字符串再进行比较
export const looseEqual = function(a, b) {
  const isObjectA = isObject(a);
  const isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    return JSON.stringify(a) === JSON.stringify(b);
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b);
  } else {
    return false;
  }
};
// 数组比较 是否相等 这里的相等是仅比较值
export const arrayEquals = function(arrayA, arrayB) {
  arrayA = arrayA || [];
  arrayB = arrayB || [];

  if (arrayA.length !== arrayB.length) {
    return false;
  }

  for (let i = 0; i < arrayA.length; i++) {
    if (!looseEqual(arrayA[i], arrayB[i])) {
      return false;
    }
  }

  return true;
};
// 比较两个参数 是否值相等
export const isEqual = function(value1, value2) {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return arrayEquals(value1, value2);
  }
  return looseEqual(value1, value2);
};
// 判断是否为空  val可以是数字、(字符串、数组).length、对象、（File/Map/Set）.set
export const isEmpty = function(val) {
  // null or undefined
  if (val == null) return true;

  if (typeof val === 'boolean') return false;

  if (typeof val === 'number') return !val;

  if (val instanceof Error) return val.message === '';

  switch (Object.prototype.toString.call(val)) {
    // String or Array
    case '[object String]':
    case '[object Array]':
      return !val.length;

    // Map or Set or File
    case '[object File]':
    case '[object Map]':
    case '[object Set]': {
      return !val.size;
    }
    // Plain Object
    case '[object Object]': {
      return !Object.keys(val).length;
    }
  }

  return false;
};
// 使用requestAnimationFrame来进行节流
export function rafThrottle(fn) {
  let locked = false;
  return function(...args) {
    if (locked) return;
    locked = true;
    window.requestAnimationFrame(_ => {
      fn.apply(this, args);
      locked = false;
    });
  };
}
// 将obj装进数组里
export function objToArray(obj) {
  if (Array.isArray(obj)) {
    return obj;
  }
  return isEmpty(obj) ? [] : [obj];
}
