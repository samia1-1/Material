<template>
  <div class="image-content">
    <el-container class="main-container">
      <!-- 左侧操作面板 -->
      <operation-panel
        :operation-buttons="operationButtons"
        :data-fields="dataFields"
        @operation-click="handleOperationClick"
        @get-statistic="getStatistic">
      </operation-panel>

      <!-- 主图片显示区域 -->
      <image-viewer
        ref="imageViewer"
        :image-src="imageSrc"
        :is-loading="isLoading"
        :is-timeout-mode="isTimeoutMode"
        :image-transform="imageTransform"
        @upload-file="processUploadedFile"
        @retry-request="retryLastRequest"
        @dismiss-timeout="dismissTimeout"
        @image-click="handleCenterPicClick"
        @image-load="onImageLoad">
      </image-viewer>
    </el-container>

    <!-- 示例图片展示 -->
    <ExampleGallery @load-example="handleExampleClick" />

    <!-- 底部留白 -->
    <div class="bottom-spacer"></div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
import Loading from "@/components/Loading/index.vue";
import OperationPanel from './OperationPanel.vue';
import ImageViewer from './ImageViewer.vue';
import ExampleGallery from './ExampleGallery.vue';
import { categoryConfig, getImagesByCategory } from '../imageConfig';
import Tiff from 'tiff.js';

// 共享的TIFF处理工具
const TiffUtils = (() => {
  let initialized = false;

  const initialize = () => {
    if (!initialized) {
      window.Tiff = Tiff;
      window.Tiff.initialize({ TOTAL_MEMORY: 100000000 });
      initialized = true;
    }
  };

  const isTiffBuffer = (buffer) => {
    if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 4) return false;
    const header = new Uint8Array(buffer.slice(0, 4));
    return (header[0] === 73 && header[1] === 73 && header[2] === 42 && header[3] === 0) ||
           (header[0] === 77 && header[1] === 77 && header[2] === 0 && header[3] === 42);
  };

  const createTiffCanvas = (tiff, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    try {
      if (typeof tiff.readRGBAImage === 'function') {
        const rgba = tiff.readRGBAImage();
        const imgData = ctx.createImageData(width, height);
        imgData.data.set(rgba);
        ctx.putImageData(imgData, 0, 0);
      } else {
        throw new Error('Cannot read TIFF RGBA data');
      }
    } catch (err) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#888';
      ctx.textAlign = 'center';
      ctx.font = '14px Arial';
      ctx.fillText('TIFF Preview Unavailable', width / 2, height / 2);
    }
    return canvas;
  };

  const processTiffArrayBuffer = (arrayBuffer) => {
    return new Promise((resolve) => {
      initialize();
      try {
        if (!isTiffBuffer(arrayBuffer)) {
          const blob = new Blob([arrayBuffer]);
          resolve(URL.createObjectURL(blob));
          return;
        }

        const tiff = new window.Tiff({ buffer: arrayBuffer });
        const canvas = tiff.toCanvas?.() || tiff.getCanvas?.() || createTiffCanvas(tiff, tiff.width(), tiff.height());
        const dataUrl = canvas.toDataURL('image/png');
        tiff.close();
        resolve(dataUrl);
      } catch (error) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 200, 150);
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'center';
        ctx.font = '14px Arial';
        ctx.fillText('TIFF处理错误', 100, 75);
        resolve(canvas.toDataURL('image/png'));
      }
    });
  };

  const createThumbnailFromCanvas = (canvas) => {
    try {
      const maxDim = 200;
      let thumbWidth = canvas.width;
      let thumbHeight = canvas.height;

      if (canvas.width > canvas.height) {
        if (canvas.width > maxDim) {
          thumbWidth = maxDim;
          thumbHeight = (canvas.height / canvas.width) * maxDim;
        }
      } else {
        if (canvas.height > maxDim) {
          thumbHeight = maxDim;
          thumbWidth = (canvas.width / canvas.height) * maxDim;
        }
      }

      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = Math.round(thumbWidth);
      thumbCanvas.height = Math.round(thumbHeight);
      const ctx = thumbCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
      return thumbCanvas.toDataURL('image/png');
    } catch (error) {
      const placeholderCanvas = document.createElement('canvas');
      placeholderCanvas.width = 200;
      placeholderCanvas.height = 150;
      const ctx = placeholderCanvas.getContext('2d');
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 200, 150);
      ctx.fillStyle = '#888';
      ctx.textAlign = 'center';
      ctx.font = '14px Arial';
      ctx.fillText('Thumbnail Error', 100, 75);
      return placeholderCanvas.toDataURL('image/png');
    }
  };

  return { initialize, isTiffBuffer, createTiffCanvas, processTiffArrayBuffer, createThumbnailFromCanvas };
})();

// 暴露给其他组件使用
window.TiffUtils = TiffUtils;

export default {
  name: "ImageContent",
  components: {
    Loading,
    OperationPanel,
    ImageViewer,
    ExampleGallery
  },

  data() {
    return {
      // 本地组件状态
      categories: categoryConfig,
      lastRequest: null,
      isShowStatistic: false
    };
  },

  computed: {
    // 从 Vuex store 获取状态
    ...mapState('imageRecognition', [
      'imageSrc',
      'isLoading',
      'isTimeoutMode',
      'imageTransform',
      'dataFields',
      'categoryImages',
      'allImages',
      'previewCache',
      'lastUploadTime',
      'statisticData'
    ]),

    ...mapGetters('imageRecognition', [
      'imageTransformStyle',
      'hasImage',
      'canZoomIn',
      'canZoomOut'
    ]),

    operationButtons() {
      return [
        { label: '上传图片', handler: this.triggerUpload, icon: 'el-icon-upload' },
        { label: '重置图片', handler: this.handleResetImage, icon: 'el-icon-refresh-left'},
        { label: '放大', handler: this.handleZoomIn, icon: 'el-icon-zoom-in' },
        { label: '缩小', handler: this.handleZoomOut, icon: 'el-icon-zoom-out' },
        { label: '图像分割', handler: this.handleSegmentation, icon: 'el-icon-crop' },
        { label: '降维处理', handler: this.handleReduction, icon: 'el-icon-s-operation' },
        { label: '显示分析', handler: this.handleDisplay, icon: 'el-icon-view' }
      ];
    }
  },

  created() {
    this.loadImagesForAllCategories();
    const tempUrl = sessionStorage.getItem("url");
    if (tempUrl) {
      this.SET_LOADING(true);
      this.getStatistic();
    }
  },

  beforeDestroy() {
    if (this.imageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(this.imageSrc);
    }
  },

  methods: {
    // Vuex mutations 和 actions
    ...mapMutations('imageRecognition', [
      'SET_LOADING',
      'SET_TIMEOUT_MODE',
      'SET_LAST_UPLOAD_TIME',
      'SET_CATEGORY_IMAGES',
      'SET_ALL_IMAGES',
      'SET_IMAGE_TRANSFORM'
    ]),

    ...mapActions('imageRecognition', [
      'uploadImage',
      'resetImage',
      'zoomIn',
      'zoomOut',
      'setPreviewCache'
    ]),

    // --- UI Interaction Methods ---
    showMessage(message, type = 'info') {
      this.$message({ message, type, duration: 3000 });
    },

    handleExampleClick(item) {
      this.loadExampleImage(item);
    },

    triggerUpload() {
      const now = Date.now();
      if (now - this.lastUploadTime < 500) return;
      this.SET_LAST_UPLOAD_TIME(now);

      const imageViewer = this.$refs.imageViewer;
      if (!imageViewer) {
        this.showMessage('请先加载界面', 'warning');
        return;
      }

      // 触发隐藏的文件上传
      if (imageViewer && imageViewer.triggerHiddenUpload) {
        imageViewer.triggerHiddenUpload();
      } else {
        this.showMessage('上传组件未就绪', 'warning');
      }
    },

    async handleResetImage() {
      const result = await this.resetImage();
      if (result.success) {
        this.showMessage(result.message, 'success');
      } else {
        this.showMessage(result.message, 'info');
      }
    },

    handleZoomIn() {
      this.zoomIn();
    },

    handleZoomOut() {
      this.zoomOut();
    },

    handleCenterPicClick() {
      if (this.isLoading || this.imageSrc) {
        return;
      }
      this.triggerUpload();
    },

    onImageLoad(e) {
      this.autoFitImage(e.target);
    },

    autoFitImage(img) {
      if (!img || !this.$refs.imageViewer || !this.$refs.imageViewer.$refs.imageContainer) return;
      const cont = this.$refs.imageViewer.$refs.imageContainer;
      const scale = Math.min(cont.clientWidth / img.naturalWidth, cont.clientHeight / img.naturalHeight, 1);
      // 保留现有的平移值，只重置缩放
      this.SET_IMAGE_TRANSFORM({
        ...this.imageTransform,
        scale,
        translateX: 0, // 新图片时重置位置
        translateY: 0
      });
    },

    // --- File & Upload Logic ---
    async processUploadedFile(file) {
      try {
        // 快速检查基本条件
        if (!file) {
          throw new Error('未选择文件');
        }

        if (!file.type.startsWith('image/')) {
          throw new Error('请选择图片文件');
        }

        // 立即显示本地图片，让用户可以操作
        this.displayLocalImage(file);

        // 后台尝试上传
        this.uploadImageInBackground(file);

      } catch (error) {
        console.error('File processing error:', error);
        const errorMessage = error.message || error.toString() || '文件处理失败';
        this.showMessage(errorMessage, 'error');
      }
    },

    // 立即显示本地图片
    displayLocalImage(file) {
      // 创建本地URL用于显示
      const localUrl = URL.createObjectURL(file);

      // 如果有之前的blob URL，先释放
      if (this.imageSrc && this.imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(this.imageSrc);
      }

      // 设置图片源并重置变换状态
      this.$store.commit('imageRecognition/SET_IMAGE_SRC', localUrl);
      this.SET_IMAGE_TRANSFORM({
        scale: 1,
        translateX: 0,
        translateY: 0,
        minScale: 0.5,
        maxScale: 5
      });

      this.showMessage('图片已加载，可进行操作', 'success');
    },

    // 后台上传图片
    async uploadImageInBackground(file) {
      try {
        await this.uploadImage(file);
        this.showMessage('图片上传成功', 'success');
      } catch (error) {
        console.error('Background upload error:', error);

        // 网络错误时的友好提示
        if (error.message.includes('Failed to fetch') ||
            error.message.includes('CORS') ||
            error.message.includes('Network')) {
          this.showMessage('网络上传失败，但图片可正常操作', 'warning');
        } else {
          this.showMessage(`上传失败: ${error.message}`, 'warning');
        }
      }
    },

    retryLastRequest() {
      if (this.lastRequest) {
        this.showMessage('正在重试...', 'info');
        this.lastRequest();
      } else {
        this.showMessage('没有可重试的请求', 'warning');
      }
    },

    dismissTimeout() {
      this.SET_TIMEOUT_MODE(false);
    },

    getStatistic() {
      const tiffUrl = sessionStorage.getItem("url");
      if (tiffUrl) {
        this.handleApiRequest(tiffUrl);
      } else if (this.formData) {
        this.handleApiRequest(this.formData);
      } else {
        this.showMessage('请先上传图片', 'warning');
      }
    },

    async handleApiRequest(data) {
      this.SET_LOADING(true);
      this.lastRequest = () => this.handleApiRequest(data);

      try {
        const result = await this.$store.dispatch('imageRecognition/processImageUrl', data);
        this.showMessage('图像处理完成', 'success');
      } catch (error) {
        this.SET_LOADING(false);
        if (error.message.includes('timed out')) {
          this.SET_TIMEOUT_MODE(true);
          this.showMessage('请求超时，已自动中断。图片可正常查看和操作', 'warning');
        } else {
          this.showMessage(error.message || '请求失败，已自动中断', 'error');
        }
      }
    },

    // --- Operation Handlers ---
    handleOperationClick(handler) {
      if (typeof handler === 'function') {
        handler();
      }
    },

    handleSegmentation() {
      this.showMessage('图像分割功能开发中...', 'info');
    },

    handleReduction() {
      this.showMessage('降维处理功能开发中...', 'info');
    },

    handleDisplay() {
      this.showMessage('显示分析功能开发中...', 'info');
    },

    // --- Example Image Logic ---
    loadImagesForAllCategories() {
      const allImages = [];
      this.categories.forEach(category => {
        if (category.id !== 0) {
          try {
            const images = getImagesByCategory(category.folder);
            this.SET_CATEGORY_IMAGES({ categoryId: category.id, images });
            allImages.push(...images);
          } catch (error) {
            console.error(`无法加载分类 ${category.name} 的图片:`, error);
            this.SET_CATEGORY_IMAGES({ categoryId: category.id, images: [] });
          }
        }
      });
      this.SET_ALL_IMAGES(allImages);
    },

    async loadExampleImage(item) {
      try {
        // 静默重置图片，不显示重置消息
        await this.resetImage();
        this.SET_LOADING(true);
        this.showMessage("正在加载示例图片...", "info");

        const imageUrl = this.getUrlFromItem(item);
        const isTiff = item.isTiff || imageUrl.toLowerCase().endsWith('.tif') || imageUrl.toLowerCase().endsWith('.tiff');

        // 先显示图片供用户操作
        if (isTiff) {
          try {
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const tiffDataUrl = await TiffUtils.processTiffArrayBuffer(arrayBuffer);

            this.$store.commit('imageRecognition/SET_IMAGE_SRC', tiffDataUrl);
            this.SET_LOADING(false);
            this.showMessage('示例图片已加载，可进行操作', 'success');

            // 后台尝试处理和上传
            this.processExampleImageInBackground(arrayBuffer, item);
          } catch (error) {
            this.SET_LOADING(false);
            this.showMessage('示例图片加载失败', 'error');
          }
        } else {
          // 对于普通图片，直接设置URL
          this.$store.commit('imageRecognition/SET_IMAGE_SRC', imageUrl);
          this.SET_LOADING(false);
          this.showMessage('示例图片已加载，可进行操作', 'success');

          // 后台尝试上传
          this.processExampleImageInBackground(null, item);
        }
      } catch (error) {
        this.SET_LOADING(false);
        this.showMessage('加载示例图片失败', 'error');
      }
    },

    // 后台处理示例图片
    async processExampleImageInBackground(arrayBuffer, item) {
      try {
        let processedFile;
        if (arrayBuffer) {
          processedFile = new File([arrayBuffer], item.fileName, { type: item.fileType });
        } else {
          const imageUrl = this.getUrlFromItem(item);
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          processedFile = new File([blob], item.fileName, { type: item.fileType });
        }

        // 静默上传，不显示上传消息
        await this.uploadImage(processedFile);
        // 成功时不显示消息，避免干扰用户
      } catch (error) {
        // 上传失败时只在控制台记录，不影响用户操作
        console.warn('Example image background upload failed:', error.message);
      }
    },

    getUrlFromItem(item) {
      if (!item || !item.imgUrl) return '';
      return typeof item.imgUrl === 'object' && item.imgUrl.__esModule ? item.imgUrl.default : item.imgUrl;
    },

    createCanvasFromDataUrl(dataUrl) {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          resolve(canvas);
        };
        img.src = dataUrl;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.image-content {
  width: 95%;
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 8px 15px 8px 60px;
  height: calc(100vh - 90px);
  overflow-y: auto;
  padding-right: 8px;

  /* 深色主题滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.6);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border-radius: 3px;
    transition: background 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
    }
  }
}

.main-container {
  display: flex;
  margin: 5px 0 10px !important;
  padding: 0;
  width: 100%;
  height: calc(100vh - 160px); /* 与图片区域高度匹配，留出顶部和底部空间 */
  flex-shrink: 0;
}

.bottom-spacer {
  height: 60px; /* 底部留白高度 */
  width: 100%;
  flex-shrink: 0;
}
</style>
