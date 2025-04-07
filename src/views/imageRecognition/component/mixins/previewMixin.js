/**
 * 示例图片预览相关功能
 * 负责处理示例图片的预览和缓存
 */
import { getImagesByCategory } from '../config/preloadImages';
import Tiff from "tiff.js"; // 确保导入Tiff.js

export default {
  data() {
    return {
      // 图片预览相关
      previewCache: new Map(),
      categoryImages: {},
      allImages: [],
    };
  },

  methods: {
    // 获取图片预览URL - 带缓存
    getImagePreviewUrl(item) {
      // 检查缓存中是否已有预览
      const cacheKey = `${item.categoryId}_${item.name}`;
      if (this.previewCache.has(cacheKey)) {
        return this.previewCache.get(cacheKey);
      }

      // 默认返回原始URL
      const originalUrl = typeof item.imgUrl === 'object' && item.imgUrl.__esModule ?
                        item.imgUrl.default : item.imgUrl;

      // 如果是TIFF格式，异步生成预览
      if (item.isTiff) {
        this.$nextTick(() => this.generateTiffPreview(item, cacheKey));
      }

      return originalUrl;
    },

    // 生成TIFF预览
    generateTiffPreview(item, cacheKey) {
      // 避免重复处理
      if (this.previewCache.has(`${cacheKey}_processing`)) return;

      this.previewCache.set(`${cacheKey}_processing`, true);

      // 获取图片URL
      const imageUrl = typeof item.imgUrl === 'object' && item.imgUrl.__esModule ?
                      item.imgUrl.default : (item.imgUrl || item.showUrl);
      const fileName = item.name || 'unknown';

      // 获取图片数据
      fetch(imageUrl)
        .then(response => response.ok ? response.arrayBuffer() : Promise.reject(new Error('图片加载失败')))
        .then(arrayBuffer => {
          try {
            // 记录文件信息用于调试
            const fileSize = arrayBuffer.byteLength;
            const header = new Uint8Array(arrayBuffer.slice(0, 4));

            // 检查是否为TIFF格式
            const isTiffByHeader = this.isTiffCheckHeader(header);

            if (!isTiffByHeader) {
              // 非TIFF格式，使用普通图片处理
              return this.createImageThumbnail(imageUrl, fileName)
                .then(dataUrl => {
                  this.previewCache.set(cacheKey, dataUrl);
                  this.$forceUpdate();
                });
            }

            // 尝试用Tiff.js处理
            try {
              // 初始化TIFF处理
              if (!window.Tiff) window.Tiff = Tiff;
              window.Tiff.initialize({TOTAL_MEMORY: 100000000});

              const tiff = new window.Tiff({buffer: arrayBuffer});
              const width = tiff.width();
              const height = tiff.height();

              // 获取Canvas
              let canvas;
              if (typeof tiff.toCanvas === 'function') {
                canvas = tiff.toCanvas();
              } else if (typeof tiff.getCanvas === 'function') {
                canvas = tiff.getCanvas();
              } else {
                // 手动创建Canvas
                canvas = this.createManualTiffCanvas(tiff, width, height);
              }

              // 创建并保存缩略图
              return this.createThumbnailFromCanvas(canvas, fileName)
                .then(dataUrl => {
                  this.previewCache.set(cacheKey, dataUrl);
                  tiff.close();
                  this.$forceUpdate();
                });
            } catch (error) {
              console.error(`TIFF处理失败: ${error.message}`);
              // 降级使用普通图片处理
              return this.createImageThumbnail(imageUrl, fileName)
                .then(dataUrl => {
                  this.previewCache.set(cacheKey, dataUrl);
                  this.$forceUpdate();
                });
            }
          } catch (error) {
            console.error(`TIFF格式检查失败: ${error.message}`);
            // 出错时使用普通图片处理
            return this.createImageThumbnail(imageUrl, fileName)
              .then(dataUrl => {
                this.previewCache.set(cacheKey, dataUrl);
                this.$forceUpdate();
              });
          }
        })
        .catch(error => {
          console.error(`图片处理失败: ${error.message}`);
          this.previewCache.set(cacheKey, imageUrl);
        })
        .finally(() => {
          this.previewCache.delete(`${cacheKey}_processing`);
        });
    },

    // 改进：更可靠的TIFF格式检测
    isTiffCheckHeader(header) {
      if (!header || header.length < 4) return false;

      // 输出调试信息
      console.log('预览TIFF头部检测:', Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' '));

      // 标准TIFF头部检查 (II*\0 或 MM\0*)
      const isTiffLE = header[0] === 73 && header[1] === 73 && header[2] === 42 && header[3] === 0;
      const isTiffBE = header[0] === 77 && header[1] === 77 && header[2] === 0 && header[3] === 42;

      // 根据webpack处理的图片，可能得到的是转换后的其他格式
      // 如果头部不是标准TIFF格式，但文件名表明是TIFF，尝试降级处理
      if (!isTiffLE && !isTiffBE) {
        // 检查是否为JPEG起始标记 (FFD8)
        const isJPEG = header[0] === 0xFF && header[1] === 0xD8;
        // 检查是否为PNG起始标记 (89504E47)
        const isPNG = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;

        if (isJPEG) {
          console.log('检测到JPEG格式，可能是转换后的TIFF');
        } else if (isPNG) {
          console.log('检测到PNG格式，可能是转换后的TIFF');
        }
      }

      return isTiffLE || isTiffBE;
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
        // 创建一个提示性的画布
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '16px Arial';
        ctx.fillText('TIFF预览不可用', width/2, height/2);
      }

      return canvas;
    },

    // 从Canvas创建缩略图
    createThumbnailFromCanvas(canvas, fileName) {
      return new Promise((resolve, reject) => {
        try {
          // 创建缩略图尺寸
          const maxDim = 200;
          let thumbWidth = canvas.width;
          let thumbHeight = canvas.height;

          // 等比例缩放
          if (canvas.width > canvas.height && canvas.width > maxDim) {
            thumbWidth = maxDim;
            thumbHeight = (canvas.height / canvas.width) * maxDim;
          } else if (canvas.height > maxDim) {
            thumbHeight = maxDim;
            thumbWidth = (canvas.width / canvas.height) * maxDim;
          }

          // 创建缩略图Canvas
          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.width = thumbWidth;
          thumbCanvas.height = thumbHeight;

          // 绘制缩略图
          const ctx = thumbCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);

          // 为TIFF文件添加标识
          if (fileName && /\.(tif|tiff)/i.test(fileName)) {
            this.addTiffMarker(ctx, thumbWidth, thumbHeight);
          }

          // 返回数据URL
          resolve(thumbCanvas.toDataURL('image/png'));
        } catch (error) {
          console.error('缩略图创建失败:', error);
          reject(error);
        }
      });
    },

    // 从图像URL创建缩略图
    createImageThumbnail(imageUrl, fileName) {
      return new Promise((resolve, reject) => {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous'; // 允许跨域

          // 设置超时处理
          const timeout = setTimeout(() => {
            console.warn('图片加载超时，使用占位图');
            resolve(this.createPlaceholderImage(fileName));
          }, 10000); // 10秒超时

          img.onload = () => {
            clearTimeout(timeout);
            try {
              // 创建缩略图尺寸
              const maxDim = 200;
              let thumbWidth = img.width;
              let thumbHeight = img.height;

              // 等比例缩放
              if (img.width > img.height && img.width > maxDim) {
                thumbWidth = maxDim;
                thumbHeight = (img.height / img.width) * maxDim;
              } else if (img.height > maxDim) {
                thumbHeight = maxDim;
                thumbWidth = (img.width / img.height) * maxDim;
              }

              // 创建Canvas并绘制
              const canvas = document.createElement('canvas');
              canvas.width = thumbWidth;
              canvas.height = thumbHeight;

              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

              // 为TIFF文件添加标识
              if (fileName && /\.(tif|tiff)/i.test(fileName)) {
                this.addTiffMarker(ctx, thumbWidth, thumbHeight);
              }

              // 返回数据URL
              resolve(canvas.toDataURL('image/png'));
            } catch (error) {
              console.error('图片处理失败:', error);
              resolve(this.createPlaceholderImage(fileName));
            }
          };

          img.onerror = () => {
            clearTimeout(timeout);
            console.error(`图片加载失败: ${fileName}`);
            resolve(this.createPlaceholderImage(fileName));
          };

          // 设置图片源
          img.src = imageUrl;
        } catch (error) {
          console.error('创建缩略图过程出错:', error);
          resolve(this.createPlaceholderImage(fileName));
        }
      });
    },

    // 创建占位图像 (出错时使用)
    createPlaceholderImage(fileName) {
      try {
        const isTiff = /\.(tif|tiff)/i.test(fileName);
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 150;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 200, 150);

        // 添加格式标识
        if (isTiff) {
          this.addTiffMarker(ctx, 200, 150);
        }

        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '16px Arial';
        ctx.fillText('图像预览不可用', 100, 75);

        return canvas.toDataURL('image/png');
      } catch (error) {
        // 如果连占位图都创建失败，返回空字符串
        console.error('创建占位图失败:', error);
        return '';
      }
    },

    // 在Canvas上添加TIFF标记
    addTiffMarker(ctx, width, height) {
      try {
        // 右上角添加TIFF标记
        ctx.fillStyle = 'rgba(0, 120, 215, 0.8)';
        ctx.fillRect(width - 40, 0, 40, 16);
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TIFF', width - 20, 11);
      } catch (error) {
        console.error('添加TIFF标记失败:', error);
      }
    },

    // 加载所有分类的图片
    loadImagesForAllCategories() {
      this.allImages = []; // 清空列表

      // 加载每个分类的图片
      this.categories.forEach(category => {
        if (category.id !== 0) { // 跳过"所有分类"
          this.loadImagesForCategory(category);
        }
      });
    },

    // 加载特定分类的图片
    loadImagesForCategory(category) {
      try {
        if (category.id === 0) return;

        // 获取预导入的图片数据
        const images = getImagesByCategory(category.folder);

        // 保存到分类图片对象中
        this.$set(this.categoryImages, category.id, images);

        // 添加到所有图片数组
        this.allImages.push(...images);
      } catch (error) {
        console.error(`无法加载分类 ${category.name} 的图片:`, error);
        this.$set(this.categoryImages, category.id, []);
      }
    },

    // 获取分类图片
    getCategoryImages(categoryId) {
      return categoryId === 0 ?
        (this.allImages || []) :
        (this.categoryImages[categoryId] || []);
    }
  }
};
