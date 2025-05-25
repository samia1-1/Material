/**
 * 图片处理相关功能
 */
import Tiff from "tiff.js";

export default {
  created() {
    // 初始化Tiff.js
    window.Tiff = Tiff;
    window.Tiff.initialize({TOTAL_MEMORY: 100000000}); // 100MB
  },

  methods: {
    // 上传图片 - 简单触发
    imgUpload(event) {
      event?.stopPropagation?.();
      this.triggerUpload?.();
    },

    // 重置图片 - 整合所有清理操作
    resetImage(showNotification = true) {
      if (!this.image_src) {
        showNotification && this.showMessage("没有图片需要重置", "info");
        return;
      }

      // 清理资源
      this.image_src?.startsWith('blob:') && URL.revokeObjectURL(this.image_src);

      // 重置状态
      Object.assign(this, {
        image_src: "",
        form_data: undefined,
        isShowStatistic: false,
        statisticData: null,
        apiReturnedUrl: ""
      });

      // 重置函数调用
      this.resetDataFields?.();
      this.resetImageTransform?.();

      // 清除会话存储
      ["url", "apiUrl"].forEach(key => sessionStorage.removeItem(key));

      // 通知
      showNotification && this.showMessage("图片已重置", "success");
    },

    // 添加文件上传API处理方法
    processWithFileUploadAPI(file) {
      if (!file) {
        this.isLoading = false;
        return Promise.resolve();
      }

      return this.uploadImage(file).catch(error => {
        console.error('文件上传API处理失败:', error);
        this.isLoading = false;
        return Promise.reject(error);
      });
    },

    // 简化示例图片加载
    loadExampleImage(item) {
      this.image_src && this.resetImage(false);
      this.isLoading = true;
      this.showMessage("正在加载图片...", "info");

      const isTiff = this.isTiffImage?.(item.fileName || '') || item.isTiff;
      const fileType = item.fileType || (isTiff ? 'image/tiff' : 'image/jpeg');
      const fileName = item.fileName || `example-${Date.now()}${this.getExtensionFromMimeType(fileType)}`;

      // 批量设置会话存储
      Object.entries({
        "originalFormat": fileType,
        "originalFileName": fileName,
        "isExampleImage": "true",
        "exampleCategory": item.categoryId || "0"
      }).forEach(([key, value]) => sessionStorage.setItem(key, value));

      // 重置图片变换
      this.resetImageTransform?.();

      // 获取图片URL
      const imageUrl = this.getUrlFromItem(item);

      // 控制台打印URL帮助调试
      console.log("加载示例图片:", imageUrl, "类型:", fileType, "是否TIFF:", isTiff);

      // 统一处理逻辑 - 无论TIFF还是普通图片
      const fetchPromise = fetch(imageUrl)
        .then(response => {
          if (!response.ok) throw new Error('无法获取图片');
          return isTiff ? response.arrayBuffer() : response.blob();
        })
        .catch(error => {
          console.error("获取图片失败:", error, imageUrl);
          throw error;
        });

      // 根据格式处理
      if (isTiff) {
        fetchPromise
          .then(arrayBuffer => {
            const originalFile = new File([arrayBuffer], fileName, { type: 'image/tiff' });
            this.form_data = originalFile;

            return this.processTiffArrayBuffer(arrayBuffer)
              .then(dataUrl => {
                this.image_src = dataUrl;
                return this.processWithFileUploadAPI(originalFile);
              });
          })
          .catch(this.handleImageError);
      } else {
        fetchPromise
          .then(blob => {
            const url = URL.createObjectURL(blob);
            this.image_src = url;

            const imageFile = new File([blob], fileName, { type: fileType });
            this.form_data = imageFile;

            return this.processWithFileUploadAPI(imageFile);
          })
          .catch(this.handleImageError);
      }
    },

    // 简化错误处理
    handleImageError(error) {
      console.error('处理图片失败:', error);
      this.showMessage('无法处理图片: ' + error.message, 'error');
      this.isLoading = false;
    },

    // 简化TIFF处理
    processTiffArrayBuffer(arrayBuffer) {
      return new Promise((resolve, reject) => {
        try {
          // 验证并处理TIFF
          if (!this.isTiffBuffer(arrayBuffer)) {
            const url = URL.createObjectURL(new Blob([arrayBuffer]));
            this.isLoading = false;
            return resolve(url);
          }

          // 创建TIFF对象并渲染
          const tiff = new window.Tiff({ buffer: arrayBuffer });

          // 尝试获取Canvas的不同方式
          const canvas = tiff.toCanvas?.() || tiff.getCanvas?.() ||
                        this.createTiffCanvas(tiff, tiff.width(), tiff.height());

          const dataUrl = canvas.toDataURL('image/png');
          this.originalImageSrc = dataUrl;
          this.isLoading = false;

          tiff.close();
          resolve(dataUrl);
        } catch (error) {
          console.error('TIFF处理失败:', error);
          // 创建错误占位图
          const canvas = document.createElement('canvas');
          canvas.width = 400; canvas.height = 300;

          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, 400, 300);
          ctx.fillStyle = '#ff0000';
          ctx.textAlign = 'center';
          ctx.font = '16px Arial';
          ctx.fillText('无法处理TIFF图像', 200, 150);

          const fallbackUrl = canvas.toDataURL('image/png');
          this.isLoading = false;
          resolve(fallbackUrl);
        }
      });
    },

    // 简化的TIFF Canvas创建
    createTiffCanvas(tiff, width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      try {
        // 尝试读取RGBA数据
        if (tiff.readRGBAImage) {
          const rgba = tiff.readRGBAImage();
          const imgData = ctx.createImageData(width, height);
          imgData.data.set(rgba);
          ctx.putImageData(imgData, 0, 0);
        } else {
          throw new Error('无法读取TIFF数据');
        }
      } catch (err) {
        // 创建错误提示
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.fillText('TIFF预览不可用', width/2, height/2);
      }

      return canvas;
    },

    // 统一获取URL方法
    getUrlFromItem(item) {
      return item?.imgUrl?.__esModule ? item.imgUrl.default : item.imgUrl;
    },

    // TIFF检测简化
    isTiffImage(url) {
      if (!url) return false;
      url = typeof url === 'object' && url.__esModule ? url.default : url;
      return typeof url === 'string' && /\.(tif|tiff)$/i.test(url);
    },

    // 简化TIFF缓冲区检测
    isTiffBuffer(buffer) {
      if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 4) return false;

      const header = new Uint8Array(buffer.slice(0, 4));

      // 检查小端序(II*\0)或大端序(MM\0*)
      return (header[0] === 73 && header[1] === 73 && header[2] === 42 && header[3] === 0) ||
             (header[0] === 77 && header[1] === 77 && header[2] === 0 && header[3] === 42);
    },

    // 简化辅助方法
    getExtensionFromMimeType(mimeType) {
      const extensions = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/tiff': '.tif',
        'image/tif': '.tif'
      };
      return extensions[mimeType] || '.jpg';
    },

    showMessage(message, type) {
      this.$message ?
        this.$message({ message, type, duration: 3000 }) :
        console.log(`[${type}] ${message}`);
    },

    checkBeforeImageOperation() {
      if (this.form_data || sessionStorage.getItem("url")) return true;
      this.showMessage("请先上传图片", "warning");
      return false;
    },

    // 图片加载完成后的处理函数
    onImageLoad(e) {
      // 重置变换状态
      this.imageTransform.scale = 1;
      this.imageTransform.translateX = 0;
      this.imageTransform.translateY = 0;

      this.$nextTick(() => {
        this.autoFitImage(e.target);
      });
    },

    // 自动调整图片大小以填充容器
    autoFitImage(imgElement) {
      if (!imgElement || !this.$refs.imageContainer) return;

      const container = this.$refs.imageContainer;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const imgWidth = imgElement.naturalWidth;
      const imgHeight = imgElement.naturalHeight;

      // 计算宽高比
      const containerRatio = containerWidth / containerHeight;
      const imgRatio = imgWidth / imgHeight;

      let scale = 1;

      // 采用缩放策略以充分利用空间
      if (imgRatio > containerRatio) {
        // 图片较宽，以容器宽度为准
        scale = containerWidth / imgWidth;

        // 适当增加缩放比例
        const scaledHeight = imgHeight * scale;
        if (scaledHeight < containerHeight * 0.8) {
          scale = scale * 1.2;
        }
      } else {
        // 图片较高，以容器高度为准
        scale = containerHeight / imgHeight;

        // 适当增加缩放比例
        const scaledWidth = imgWidth * scale;
        if (scaledWidth < containerWidth * 0.8) {
          scale = scale * 1.2;
        }
      }

      // 应用缩放，确保不超过合理范围
      this.imageTransform.scale = Math.min(Math.max(scale, 0.5), 5);

      // 重置平移状态，确保图片居中显示
      this.imageTransform.translateX = 0;
      this.imageTransform.translateY = 0;
    },
  }
}
