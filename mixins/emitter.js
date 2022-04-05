/*
 * @Description: 
 * @Autor: Kaven
 * @Date: 2021-06-23 11:09:49
 * @LastEditors: Kaven
 * @LastEditTime: 2022-03-30 19:09:09
 */
function broadcast(componentName, eventName, params) {
  this.$children.forEach(child => {
    var name = child.$options.componentName;

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
export default {
  methods: {
    // 混入dispatch方法
    dispatch(componentName, eventName, params) {
      var parent = this.$parent || this.$root;
      var name = parent.$options.componentName;
      // 循环往上找 $options.componentName直到等于componentName
      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }
      // 找到对应的父组件实例 并调用指定的event
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    // 往子组件广播指定事件
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    }
  }
};
