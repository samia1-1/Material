/**
 * 示例图片预览功能
 */
import { getImagesByCategory } from '../config/preloadImages';
import Tiff from "tiff.js";

export default {
  data() {
    return {
      previewCache: new Map(),
      categoryImages: {},
      allImages: [],
    };
  },

  methods: {
    // 获取图片预览URL - 带缓存
    getImagePreviewUrl(item) {
      const cacheKey = `${item.categoryId}_${item.name}`;
      if (this.previewCache.has(cacheKey)) return this.previewCache.get(cacheKey);

      // 获取原始URL
      const originalUrl = this.getUrlFromItem(item);

      // 异步生成TIFF预览
      if (item.isTiff) this.$nextTick(() => this.generateTiffPreview(item, cacheKey));

      return originalUrl;
    },

    // 生成TIFF预览
    generateTiffPreview(item, cacheKey) {
      if (this.previewCache.has(`${cacheKey}_processing`)) return;

      this.previewCache.set(`${cacheKey}_processing`, true);
      const imageUrl = this.getUrlFromItem(item);
      const fileName = item.name || 'unknown';

      // 获取并处理图片数据
      fetch(imageUrl)
        .then(response => response.ok ? response.arrayBuffer() : Promise.reject('图片加载失败'))
        .then(arrayBuffer => {
          // 检查是否为TIFF格式
          const header = new Uint8Array(arrayBuffer.slice(0, 4));
          const isTiff = this.isTiffCheckHeader(header);

          return isTiff ? this.processTiffPreview(arrayBuffer, fileName) :
                         this.createImageThumbnail(imageUrl, fileName);
        })
        .then(dataUrl => {
          this.previewCache.set(cacheKey, dataUrl);
          this.$forceUpdate();
        })
        .catch(error => {
          console.error(`图片处理失败: ${error}`);
          this.previewCache.set(cacheKey, imageUrl);
        })
        .finally(() => {
          this.previewCache.delete(`${cacheKey}_processing`);
        });
    },

    // 处理TIFF数据生成预览
    processTiffPreview(arrayBuffer, fileName) {
      try {
        if (!window.Tiff) window.Tiff = Tiff;
        window.Tiff.initialize({TOTAL_MEMORY: 100000000});

        const tiff = new window.Tiff({buffer: arrayBuffer});
        const width = tiff.width();
        const height = tiff.height();

        // 获取Canvas
        const canvas = typeof tiff.toCanvas === 'function' ? tiff.toCanvas() :
                      typeof tiff.getCanvas === 'function' ? tiff.getCanvas() :
                      this.createManualTiffCanvas(tiff, width, height);

        // 创建缩略图
        const result = this.createThumbnailFromCanvas(canvas, fileName);
        tiff.close();
        return result;
      } catch (error) {
        console.error(`TIFF处理失败: ${error.message}`);
        return this.createPlaceholderImage(fileName);
      }
    },

    // TIFF格式检测 - 简化版
    isTiffCheckHeader(header) {
      if (!header || header.length < 4) return false;

      // 标准TIFF头部检查 (II*\0 或 MM\0*)
      return (header[0] === 73 && header[1] === 73 && header[2] === 42 && header[3] === 0) || // LE
             (header[0] === 77 && header[1] === 77 && header[2] === 0 && header[3] === 42);   // BE
    },

    // 手动创建TIFF Canvas
    createManualTiffCanvas(tiff, width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      try {
        if (typeof tiff.readRGBAImage === 'function') {
          const rgba = tiff.readRGBAImage();
          const ctx = canvas.getContext('2d');
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

    // 从Canvas创建缩略图
    createThumbnailFromCanvas(canvas, fileName) {
      return new Promise((resolve, reject) => {
        try {
          // 创建缩略图Canvas
          const maxDim = 200;
          const { width: thumbWidth, height: thumbHeight } = this.calculateThumbDimensions(
            canvas.width, canvas.height, maxDim
          );

          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.width = thumbWidth;
          thumbCanvas.height = thumbHeight;

          // 绘制缩略图
          const ctx = thumbCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);

          resolve(thumbCanvas.toDataURL('image/png'));
        } catch (error) {
          console.error('缩略图创建失败:', error);
          resolve(this.createPlaceholderImage(fileName));
        }
      });
    },

    // 计算缩略图尺寸
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

      return { width: thumbWidth, height: thumbHeight };
    },

    // 从图像URL创建缩略图 - 简化超时处理
    createImageThumbnail(imageUrl, fileName) {
      return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const timeout = setTimeout(() => {
          resolve(this.createPlaceholderImage(fileName));
        }, 10000);

        img.onload = () => {
          clearTimeout(timeout);
          try {
            // 创建缩略图尺寸
            const maxDim = 200;
            const { width: thumbWidth, height: thumbHeight } = this.calculateThumbDimensions(
              img.width, img.height, maxDim
            );

            // 创建Canvas并绘制
            const canvas = document.createElement('canvas');
            canvas.width = thumbWidth;
            canvas.height = thumbHeight;
            canvas.getContext('2d').drawImage(img, 0, 0, thumbWidth, thumbHeight);

            resolve(canvas.toDataURL('image/png'));
          } catch (error) {
            resolve(this.createPlaceholderImage(fileName));
          }
        };

        img.onerror = () => {
          clearTimeout(timeout);
          resolve(this.createPlaceholderImage(fileName));
        };

        img.src = imageUrl;
      });
    },

    // 创建占位图像
    createPlaceholderImage(fileName) {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 150;
      this.drawPlaceholder(canvas, '图像预览不可用');
      return canvas.toDataURL('image/png');
    },

    // 绘制占位符
    drawPlaceholder(canvas, message) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#888';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px Arial';
      ctx.fillText(message, canvas.width/2, canvas.height/2);
    },

    // 工具方法：获取URL
    getUrlFromItem(item) {
      return typeof item.imgUrl === 'object' && item.imgUrl.__esModule ?
             item.imgUrl.default : item.imgUrl;
    },

    // 加载分类图片
    loadImagesForAllCategories() {
      this.allImages = [];
      this.categories.forEach(category => {
        if (category.id !== 0) this.loadImagesForCategory(category);
      });
    },

    loadImagesForCategory(category) {
      try {
        if (category.id === 0) return;
        const images = getImagesByCategory(category.folder);
        this.$set(this.categoryImages, category.id, images);
        this.allImages.push(...images);
      } catch (error) {
        console.error(`无法加载分类 ${category.name} 的图片:`, error);
        this.$set(this.categoryImages, category.id, []);
      }
    },

    // 获取分类图片
    getCategoryImages(categoryId) {
      return categoryId === 0 ? (this.allImages || []) : (this.categoryImages[categoryId] || []);
    }
  }
};
