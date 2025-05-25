/**
 * 示例图片预览功能
 */
import { getImagesByCategory } from '../config/preloadImages';
import Tiff from "tiff.js";

export default {
  data: () => ({
    previewCache: new Map(),
    categoryImages: {},
    allImages: [],
    processingPreviews: new Set(),
  }),

  methods: {
    // 获取图片预览URL - 缓存优化
    getImagePreviewUrl(item) {
      if (!item) return '';

      // 生成缓存键
      const cacheKey = `${item.categoryId}_${item.name}`;

      // 检查缓存
      if (this.previewCache.has(cacheKey)) {
        return this.previewCache.get(cacheKey);
      }

      // 获取默认URL
      const originalUrl = this.getUrlFromItem(item);

      // 异步生成TIFF预览，避免阻塞UI
      if (item.isTiff && !this.processingPreviews.has(cacheKey)) {
        this.$nextTick(() => this.generateTiffPreview(item, cacheKey));
      }

      return originalUrl;
    },

    // 生成TIFF预览 - 优化加载流程
    generateTiffPreview(item, cacheKey) {
      // 防止重复处理
      if (this.processingPreviews.has(cacheKey)) return;
      this.processingPreviews.add(cacheKey);

      // 获取资源
      const imageUrl = this.getUrlFromItem(item);
      const fileName = item.name || 'unknown';

      // 获取并处理图片数据
      fetch(imageUrl)
        .then(response => response.ok ? response.arrayBuffer() : Promise.reject('图片加载失败'))
        .then(arrayBuffer => {
          // 根据头部判断处理方式
          const header = new Uint8Array(arrayBuffer.slice(0, 4));
          return this.isTiffCheckHeader(header) ?
                 this.processTiffPreview(arrayBuffer, fileName) :
                 this.createImageThumbnail(imageUrl, fileName);
        })
        .then(dataUrl => {
          // 更新缓存和视图
          this.previewCache.set(cacheKey, dataUrl);
          this.$forceUpdate();
        })
        .catch(error => {
          console.error(`图片处理失败: ${error}`);
          this.previewCache.set(cacheKey, imageUrl);
        })
        .finally(() => {
          this.processingPreviews.delete(cacheKey);
        });
    },

    // 处理TIFF预览 - 简化实现
    processTiffPreview(arrayBuffer, fileName) {
      try {
        // 确保Tiff库可用
        if (!window.Tiff) window.Tiff = Tiff;
        window.Tiff.initialize({TOTAL_MEMORY: 100000000});

        // 创建TIFF实例
        const tiff = new window.Tiff({buffer: arrayBuffer});

        // 获取Canvas - 使用函数链优先尝试可用方法
        const canvas = this.getTiffCanvas(tiff);

        // 创建缩略图
        const result = this.createThumbnailFromCanvas(canvas, fileName);

        // 清理资源
        tiff.close();
        return result;
      } catch (error) {
        console.error(`TIFF处理失败: ${error.message}`);
        return this.createPlaceholderImage(fileName);
      }
    },

    // 简化获取Canvas方法
    getTiffCanvas(tiff) {
      return tiff.toCanvas?.() ||
             tiff.getCanvas?.() ||
             this.createManualTiffCanvas(tiff, tiff.width(), tiff.height());
    },

    // TIFF格式检测 - 简化版
    isTiffCheckHeader(header) {
      if (!header || header.length < 4) return false;

      // 标准TIFF头部检查: II*\0 (小端) 或 MM\0* (大端)
      return (header[0] === 73 && header[1] === 73 && header[2] === 42 && header[3] === 0) ||
             (header[0] === 77 && header[1] === 77 && header[2] === 0 && header[3] === 42);
    },

    // 手动创建TIFF Canvas - 简化实现
    createManualTiffCanvas(tiff, width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      try {
        // 读取RGBA数据并渲染
        if (typeof tiff.readRGBAImage === 'function') {
          const rgba = tiff.readRGBAImage();
          const imgData = ctx.createImageData(width, height);
          imgData.data.set(rgba);
          ctx.putImageData(imgData, 0, 0);
        } else {
          throw new Error('无法读取TIFF图像数据');
        }
      } catch (err) {
        this.drawPlaceholder(canvas, 'TIFF预览不可用');
      }

      return canvas;
    },

    // Canvas缩略图创建 - 简化错误处理
    createThumbnailFromCanvas(canvas, fileName) {
      return new Promise((resolve) => {
        try {
          // 计算适合的缩略图尺寸
          const maxDim = 200;
          const { width: thumbWidth, height: thumbHeight } = this.calculateThumbDimensions(
            canvas.width, canvas.height, maxDim
          );

          // 创建并绘制缩略图
          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.width = thumbWidth;
          thumbCanvas.height = thumbHeight;

          const ctx = thumbCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);

          resolve(thumbCanvas.toDataURL('image/png'));
        } catch (error) {
          console.error('缩略图创建失败:', error);
          resolve(this.createPlaceholderImage(fileName));
        }
      });
    },

    // 缩略图尺寸计算 - 保留算法
    calculateThumbDimensions(srcWidth, srcHeight, maxDim) {
      let thumbWidth = srcWidth;
      let thumbHeight = srcHeight;

      if (srcWidth > srcHeight && srcWidth > maxDim) {
        thumbWidth = maxDim;
        thumbHeight = (srcHeight / srcWidth) * maxDim;
      } else if (srcHeight > maxDim) {
        thumbHeight = maxDim;
        thumbWidth = (srcWidth / srcHeight) * maxDim;
      }

      return { width: Math.round(thumbWidth), height: Math.round(thumbHeight) };
    },

    // 标准图像缩略图 - 简化超时逻辑
    createImageThumbnail(imageUrl, fileName) {
      return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // 添加超时处理
        const timeoutId = setTimeout(() => {
          resolve(this.createPlaceholderImage(fileName));
        }, 8000);  // 减少超时时间以提高响应速度

        // 图片加载完成处理
        img.onload = () => {
          clearTimeout(timeoutId);
          try {
            // 创建缩略图
            const maxDim = 200;
            const { width, height } = this.calculateThumbDimensions(
              img.naturalWidth, img.naturalHeight, maxDim
            );

            // 绘制缩略图
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/png'));
          } catch (error) {
            resolve(this.createPlaceholderImage(fileName));
          }
        };

        // 错误处理
        img.onerror = () => {
          clearTimeout(timeoutId);
          resolve(this.createPlaceholderImage(fileName));
        };

        img.src = imageUrl;
      });
    },

    // 占位图像创建 - 简化实现
    createPlaceholderImage(fileName) {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 150;
      this.drawPlaceholder(canvas, '图像预览不可用');
      return canvas.toDataURL('image/png');
    },

    // 绘制占位符 - 基本功能
    drawPlaceholder(canvas, message) {
      const ctx = canvas.getContext('2d');

      // 绘制背景
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制文本
      ctx.fillStyle = '#888';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px Arial';
      ctx.fillText(message, canvas.width/2, canvas.height/2);
    },

    // 获取URL - 处理不同类型
    getUrlFromItem(item) {
      if (!item || !item.imgUrl) return '';
      return typeof item.imgUrl === 'object' && item.imgUrl.__esModule ?
             item.imgUrl.default : item.imgUrl;
    },

    // 分类图片加载 - 统一入口
    loadImagesForAllCategories() {
      this.allImages = [];
      this.categories?.forEach(category => {
        if (category.id !== 0) this.loadImagesForCategory(category);
      });
    },

    // 加载分类图片 - 错误处理
    loadImagesForCategory(category) {
      try {
        if (category.id === 0) return;  // 跳过"全部"分类

        // 加载图片并更新状态
        const images = getImagesByCategory(category.folder);
        this.$set(this.categoryImages, category.id, images);
        this.allImages.push(...images);
      } catch (error) {
        console.error(`无法加载分类 ${category.name} 的图片:`, error);
        this.$set(this.categoryImages, category.id, []);
      }
    },

    // 获取分类图片 - 简化逻辑
    getCategoryImages(categoryId) {
      return categoryId === 0 ? this.allImages : (this.categoryImages[categoryId] || []);
    },

    // 重构加载示例图片方法，完全避免递归和事件循环
    loadExampleImage(item) {
      // 使用更安全的方法检测是否为直接调用
      if (this.$options?.name === 'ImageContent') {
        // 如果是由ImageContent组件直接调用，则执行图片加载逻辑
        if (typeof this.doLoadExampleImage === 'function') {
          this.doLoadExampleImage(item);
        } else {
          console.error('缺少doLoadExampleImage方法');
        }
      } else {
        // 从mixin调用，查找父组件的方法并直接调用
        let parent = this.$parent;
        while (parent) {
          if (typeof parent.doLoadExampleImage === 'function') {
            parent.doLoadExampleImage(item);
            return;
          }
          parent = parent.$parent;
        }
        console.error('找不到处理示例图片的组件');
      }
    }
  }
};
