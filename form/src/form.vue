<template>
  <form class="el-form" :class="[
    labelPosition ? 'el-form--label-' + labelPosition : '',
    { 'el-form--inline': inline }
  ]">
    <slot></slot>
  </form>
</template>
<script>
  import objectAssign from 'element-ui/src/utils/merge';

  export default {
    name: 'ElForm',

    componentName: 'ElForm',

    provide() {
      return {
        elForm: this
      };
    },

    props: {
      model: Object,// 是用来获取每个Item的值的
      rules: Object,
      labelPosition: String,
      labelWidth: String,
      labelSuffix: {
        type: String,
        default: ''
      },
      inline: Boolean,
      inlineMessage: Boolean,
      statusIcon: Boolean,
      showMessage: {
        type: Boolean,
        default: true
      },
      size: String,
      disabled: Boolean,
      validateOnRuleChange: {
        type: Boolean,
        default: true
      },
      hideRequiredAsterisk: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      rules() {
        // remove then add event listeners on form-item after form rules change
        this.fields.forEach(field => {
          field.removeValidateEvents();
          field.addValidateEvents();
        });

        if (this.validateOnRuleChange) {
          this.validate(() => {});
        }
      }
    },
    computed: {
      autoLabelWidth() {
        if (!this.potentialLabelWidthArr.length) return 0;
        const max = Math.max(...this.potentialLabelWidthArr);
        return max ? `${max}px` : '';
      }
    },
    data() {
      return {
        fields: [],
        potentialLabelWidthArr: [] // use this array to calculate auto width
      };
    },
    created() {
      // 监听 添加item实例的事件
      this.$on('el.form.addField', (field) => {
        if (field) {
          this.fields.push(field);
        }
      });
      /* istanbul ignore next */
      this.$on('el.form.removeField', (field) => {
        if (field.prop) {
          this.fields.splice(this.fields.indexOf(field), 1);
        }
      });
    },
    methods: {
      // 下面的方法大部分都是通过this.$refs来直接调用de 
      resetFields() {
        if (!this.model) {
          console.warn('[Element Warn][Form]model is required for resetFields to work.');
          return;
        }
        this.fields.forEach(field => {
          field.resetField();
        });
      },
      // 删除 校验提示  可以是单个  也可以批量
      clearValidate(props = []) {
        const fields = props.length
          ? (typeof props === 'string'
            ? this.fields.filter(field => props === field.prop)
            : this.fields.filter(field => props.indexOf(field.prop) > -1)
          ) : this.fields;
        fields.forEach(field => {
          field.clearValidate();
        });
      },
      // 校验表单内容
      validate(callback) {
        if (!this.model) {
          console.warn('[Element Warn][Form]model is required for validate to work!');
          return;
        }

        let promise;
        // if no callback, return promise
        if (typeof callback !== 'function' && window.Promise) {
          promise = new window.Promise((resolve, reject) => {
            callback = function(valid) {
              valid ? resolve(valid) : reject(valid);
            };
          });
        }
        // 判断校验结果的标记
        let valid = true;
        let count = 0;
        // 如果需要验证的fields为空，调用验证时立刻返回callback
        if (this.fields.length === 0 && callback) {
          callback(true);
        }
        let invalidFields = {};
        // 调用每一个item的validate方法
        this.fields.forEach(field => {
          field.validate('', (message, field) => {
            // 看是否有校验提示  有表示校验不通过
            if (message) {
              valid = false;
            }
            // 收集不合法的表单项 field
            invalidFields = objectAssign({}, invalidFields, field);
            // 只有等到 所有item都验证完才调用回调将结果传出
            if (typeof callback === 'function' && ++count === this.fields.length) {
              callback(valid, invalidFields);
            }
          });
        });
        // 可以看到 如果不传回调 而使用async await的话  返回的是promise但是结果参数只有true or false
        // 而如果手动传了回调 参数有两个  callback(valid, invalidFields);
        if (promise) {
          return promise;
        }
      },
      /* 
        单独对某个表单进行校验
      */
      validateField(props, cb) {
        props = [].concat(props);
        const fields = this.fields.filter(field => props.indexOf(field.prop) !== -1);
        if (!fields.length) {
          console.warn('[Element Warn]please pass correct props!');
          return;
        }

        fields.forEach(field => {
          field.validate('', cb);
        });
      },
      getLabelWidthIndex(width) {
        const index = this.potentialLabelWidthArr.indexOf(width);
        // it's impossible
        if (index === -1) {
          throw new Error('[ElementForm]unpected width ', width);
        }
        return index;
      },
      registerLabelWidth(val, oldVal) {
        if (val && oldVal) {
          const index = this.getLabelWidthIndex(oldVal);
          this.potentialLabelWidthArr.splice(index, 1, val);
        } else if (val) {
          this.potentialLabelWidthArr.push(val);
        }
      },
      deregisterLabelWidth(val) {
        const index = this.getLabelWidthIndex(val);
        this.potentialLabelWidthArr.splice(index, 1);
      }
    }
  };
</script>
