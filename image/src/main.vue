<template>
  <div class="el-image">
    <slot v-if="loading" name="placeholder">
      <div class="el-image__placeholder"></div>
    </slot>
    <slot v-else-if="error" name="error">
      <div class="el-image__error">{{ t('el.image.error') }}</div>
    </slot>
    <!-- 开始会先显示loading组件或error组件 -->
    <img
      v-else
      class="el-image__inner"
      v-bind="$attrs"
      v-on="$listeners"
      @click="clickHandler"
      :src="src"
      :style="imageStyle"
      :class="{ 'el-image__inner--center': alignCenter, 'el-image__preview': preview }">
      <!-- 预览 -->
    <template v-if="preview">
      <image-viewer :z-index="zIndex" :initial-index="imageIndex" v-if="showViewer" :on-close="closeViewer" :url-list="previewSrcList"/>
    </template>
  </div>
</template>

<script>
  import ImageViewer from './image-viewer';
  import Locale from 'element-ui/src/mixins/locale';
  import { on, off, getScrollContainer, isInContainer } from 'element-ui/src/utils/dom';
  import { isString, isHtmlElement } from 'element-ui/src/utils/types';
  import throttle from 'throttle-debounce/throttle';
  /* 
    object-fit 属性指定元素的内容应该如何去适应指定容器的高度与宽度。
    object-fit 一般用于 img 和 video 标签，一般可以对这些元素进行保留原始比例的剪切、缩放或者直接进行拉伸等
  */
  const isSupportObjectFit = () => document.documentElement.style.objectFit !== undefined;

  const ObjectFit = {
    NONE: 'none',
    CONTAIN: 'contain',
    COVER: 'cover',
    FILL: 'fill',
    SCALE_DOWN: 'scale-down'
  };

  let prevOverflow = '';

  export default {
    name: 'ElImage',

    mixins: [Locale],
    inheritAttrs: false,

    components: {
      ImageViewer
    },

    props: {
      src: String,
      fit: String,
      lazy: Boolean,
      scrollContainer: {},
      previewSrcList: {
        type: Array,
        default: () => []
      },
      zIndex: {
        type: Number,
        default: 2000
      }
    },

    data() {
      return {
        loading: true,
        error: false,
        show: !this.lazy,
        imageWidth: 0,
        imageHeight: 0,
        showViewer: false
      };
    },

    computed: {
      // css3中 object-fit 可以控制图片与容器之间的比例关系，但是浏览器支持度比较低IE不支持
      imageStyle() {
        const { fit } = this;
        if (!this.$isServer && fit) {
          return isSupportObjectFit()
            ? { 'object-fit': fit }
            : this.getImageStyle(fit);
        }
        return {};
      },
      alignCenter() {
        return !this.$isServer && !isSupportObjectFit() && this.fit !== ObjectFit.FILL;
      },
      preview() {
        const { previewSrcList } = this;
        return Array.isArray(previewSrcList) && previewSrcList.length > 0;
      },
      imageIndex() {
        let previewIndex = 0;
        const srcIndex = this.previewSrcList.indexOf(this.src);
        if (srcIndex >= 0) {
          previewIndex = srcIndex;
        }
        return previewIndex;
      }
    },

    watch: {
      src(val) {
        this.show && this.loadImage();
      },
      show(val) {
        val && this.loadImage();
      }
    },

    mounted() {
      if (this.lazy) {
        // 监听滚动事件
        this.addLazyLoadListener();
      } else {
        this.loadImage();
      }
    },

    beforeDestroy() {
      this.lazy && this.removeLazyLoadListener();
    },

    methods: {
      // 加载图片
      loadImage() {
        if (this.$isServer) return;

        // reset status
        // 显示Loading
        this.loading = true;
        this.error = false;
        // 创建image对象并 监听onload 和onerror事件
        const img = new Image();
        // 加载完毕
        img.onload = e => this.handleLoad(e, img);
        img.onerror = this.handleError.bind(this);

        // bind html attrs
        // so it can behave consistently
        // 设置img属性
        Object.keys(this.$attrs)
          .forEach((key) => {
            const value = this.$attrs[key];
            img.setAttribute(key, value);
          });
        /**
         * 开始加载 这里有个特点，当一个页面多个img同时加载同一个src的图片时，
         * 只有有一个加载完，其他img就会复用该图片缓存，而不会多次去加载
         * */ 
        img.src = this.src;
      },
      handleLoad(e, img) {
        // 设置template上的img对象宽高属性
        this.imageWidth = img.width;
        this.imageHeight = img.height;
        // 隐藏loading和error
        this.loading = false;
        this.error = false;
      },
      handleError(e) {
        this.loading = false;
        this.error = true;
        this.$emit('error', e);
      },
      handleLazyLoad() {
        // 判断是否在容器的可视范围内
        if (isInContainer(this.$el, this._scrollContainer)) {
          
          this.show = true;
          this.removeLazyLoadListener();
        }

        /* 
          整个懒加载流程：添加img容器滚动事件-->判断当前img是否在容器可视范围内-->是，this.show=true,触发watch()则调用loadImg方法-->
          new img()-->this.loading=true--->onload(),this.loading=false-->图片显示
        
        */
      },
      // 给img的外层父节点绑定滚动事件
      addLazyLoadListener() {
        if (this.$isServer) return;

        const { scrollContainer } = this;
        let _scrollContainer = null;
        // 传进来的是dom
        if (isHtmlElement(scrollContainer)) {
          _scrollContainer = scrollContainer;
        // 字符串 则需要 querySelector
        } else if (isString(scrollContainer)) {
          _scrollContainer = document.querySelector(scrollContainer);
        } else {
          // 什么都没传时   需要主动获取容器
          _scrollContainer = getScrollContainer(this.$el);
        }

        if (_scrollContainer) {
          this._scrollContainer = _scrollContainer;
          // 使用节流 处理滚动事件
          this._lazyLoadHandler = throttle(200, this.handleLazyLoad);
          on(_scrollContainer, 'scroll', this._lazyLoadHandler);
          this.handleLazyLoad();
        }
      },
      removeLazyLoadListener() {
        const { _scrollContainer, _lazyLoadHandler } = this;

        if (this.$isServer || !_scrollContainer || !_lazyLoadHandler) return;

        off(_scrollContainer, 'scroll', _lazyLoadHandler);
        this._scrollContainer = null;
        this._lazyLoadHandler = null;
      },
      /**
       * simulate object-fit behavior to compatible with IE11 and other browsers which not support object-fit
       * 让图片适应容器 根据宽高比来设置图片的宽或高auto
       */
      getImageStyle(fit) {
        const { imageWidth, imageHeight } = this;
        const {
          clientWidth: containerWidth,
          clientHeight: containerHeight
        } = this.$el;

        if (!imageWidth || !imageHeight || !containerWidth || !containerHeight) return {};

        const imageAspectRatio = imageWidth / imageHeight;
        const containerAspectRatio = containerWidth / containerHeight;

        if (fit === ObjectFit.SCALE_DOWN) {
          const isSmaller = imageWidth < containerWidth && imageHeight < containerHeight;
          fit = isSmaller ? ObjectFit.NONE : ObjectFit.CONTAIN;
        }

        switch (fit) {
          case ObjectFit.NONE:
            return { width: 'auto', height: 'auto' };
          case ObjectFit.CONTAIN: // 保持原有尺寸比例。内容被缩放。
            return (imageAspectRatio < containerAspectRatio) ? { width: 'auto' } : { height: 'auto' };
          case ObjectFit.COVER:// 保持原有尺寸比例。但部分内容可能被剪切
            return (imageAspectRatio < containerAspectRatio) ? { height: 'auto' } : { width: 'auto' };
          default:
            return {};
        }
      },
      clickHandler() {
        // don't show viewer when preview is false
        if (!this.preview) {
          return;
        }
        // prevent body scroll
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        this.showViewer = true;
      },
      closeViewer() {
        document.body.style.overflow = prevOverflow;
        this.showViewer = false;
      }
    }
  };
</script>
