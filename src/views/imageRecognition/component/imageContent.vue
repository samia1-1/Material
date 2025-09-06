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
import { mapState, mapActions, mapGetters } from 'vuex';
import OperationPanel from './OperationPanel.vue';
import ImageViewer from './ImageViewer.vue';
import ExampleGallery from './ExampleGallery.vue';
import { categoryConfig, getImagesByCategory } from '../imageConfig';
import Tiff from 'tiff.js';

// 简化的TIFF处理工具
const TiffUtils = {
  initialized: false,
  initialize() {
    if (!this.initialized) {
      window.Tiff = Tiff;
      window.Tiff.initialize({ TOTAL_MEMORY: 100000000 });
      this.initialized = true;
    }
  },
  async processTiffArrayBuffer(arrayBuffer) {
    this.initialize();
    try {
      if (!(arrayBuffer instanceof ArrayBuffer) || arrayBuffer.byteLength < 4) {
        throw new Error('Invalid TIFF buffer');
      }
      const tiff = new window.Tiff({ buffer: arrayBuffer });
      const canvas = tiff.toCanvas?.() || tiff.getCanvas?.() || this.createFallbackCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      tiff.close?.();
      return dataUrl;
    } catch (error) {
      console.warn('TIFF processing failed:', error.message);
      return this.createFallbackCanvas().toDataURL('image/png');
    }
  },
  createFallbackCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 200, 150);
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillText('TIFF处理错误', 100, 75);
    return canvas;
  },
  createThumbnailFromCanvas(canvas) {
    const maxDim = 200;
    const scale = Math.min(maxDim / canvas.width, maxDim / canvas.height, 1);
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = Math.round(canvas.width * scale);
    thumbCanvas.height = Math.round(canvas.height * scale);
    thumbCanvas.getContext('2d').drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    return thumbCanvas.toDataURL('image/png');
  }
};

window.TiffUtils = TiffUtils;

export default {
  name: "ImageContent",
  components: { OperationPanel, ImageViewer, ExampleGallery },

  data: () => ({ lastRequest: null }),

  computed: {
    ...mapState('imageRecognition', ['imageSrc', 'isLoading', 'isTimeoutMode', 'imageTransform', 'dataFields', 'lastUploadTime']),
    ...mapGetters('imageRecognition', ['hasImage']),

    operationButtons() {
      return [
        { label: '上传图片', handler: this.triggerUpload, icon: 'el-icon-upload' },
        { label: '重置图片', handler: this.handleResetImage, icon: 'el-icon-refresh-left'},
        { label: '放大', handler: () => this.zoomIn(), icon: 'el-icon-zoom-in' },
        { label: '缩小', handler: () => this.zoomOut(), icon: 'el-icon-zoom-out' },
        { label: '图像分割', handler: () => this.showMessage('图像分割功能开发中...', 'info'), icon: 'el-icon-crop' },
        { label: '降维处理', handler: () => this.showMessage('降维处理功能开发中...', 'info'), icon: 'el-icon-s-operation' },
        { label: '显示分析', handler: () => this.showMessage('显示分析功能开发中...', 'info'), icon: 'el-icon-view' }
      ];
    }
  },

  created() {
    this.loadAllCategoryImages({ categories: categoryConfig, getImagesByCategory });
    const tempUrl = sessionStorage.getItem("url");
    if (tempUrl) {
      this.$store.commit('imageRecognition/SET_LOADING', true);
      this.getStatistic();
    }
  },

  beforeDestroy() {
    if (this.imageSrc?.startsWith('blob:')) URL.revokeObjectURL(this.imageSrc);
  },

  methods: {
    ...mapActions('imageRecognition', [
      'displayLocalImage', 'uploadImageInBackground', 'loadExampleImage',
      'handleApiRequest', 'autoFitImage', 'loadAllCategoryImages',
      'resetImage', 'zoomIn', 'zoomOut'
    ]),

    showMessage(message, type = 'info') {
      this.$message({ message, type, duration: 3000 });
    },

    async handleExampleClick(item) {
      const result = await this.loadExampleImage({ item, TiffUtils });
      this.showMessage(result.message, result.success ? 'success' : 'error');
    },

    triggerUpload() {
      const now = Date.now();
      if (now - this.lastUploadTime < 500) return;
      this.$store.commit('imageRecognition/SET_LAST_UPLOAD_TIME', now);

      const imageViewer = this.$refs.imageViewer;
      if (!imageViewer?.triggerHiddenUpload) {
        this.showMessage('上传组件未就绪', 'warning');
        return;
      }
      imageViewer.triggerHiddenUpload();
    },

    async handleResetImage() {
      const result = await this.resetImage();
      this.showMessage(result.message, result.success ? 'success' : 'info');
    },

    handleCenterPicClick() {
      if (!this.isLoading && !this.imageSrc) this.triggerUpload();
    },

    onImageLoad(e) {
      const container = this.$refs.imageViewer?.$refs.imageContainer;
      if (container) this.autoFitImage({ img: e.target, container });
    },

    async processUploadedFile(file) {
      try {
        if (!file?.type.startsWith('image/')) throw new Error('请选择图片文件');

        const displayResult = this.displayLocalImage(file);
        this.showMessage(displayResult.message, 'success');

        const uploadResult = await this.uploadImageInBackground(file);
        if (uploadResult.success) {
          this.showMessage(uploadResult.message, 'success');
        } else {
          this.showMessage(uploadResult.message, uploadResult.type || 'warning');
        }
      } catch (error) {
        this.showMessage(error.message || '文件处理失败', 'error');
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
      this.$store.commit('imageRecognition/SET_TIMEOUT_MODE', false);
    },

    async getStatistic() {
      const tiffUrl = sessionStorage.getItem("url");
      const data = tiffUrl || this.formData;

      if (!data) {
        this.showMessage('请先上传图片', 'warning');
        return;
      }

      this.lastRequest = () => this.getStatistic();
      const result = await this.handleApiRequest(data);
      this.showMessage(result.message, result.success ? 'success' : result.type || 'error');
    },

    handleOperationClick(handler) {
      if (typeof handler === 'function') handler();
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

  // 深色主题滚动条
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.6); border-radius: 3px; }
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #1e3a8a, #1e40af);
    border-radius: 3px;
    transition: background 0.3s ease;
    &:hover { background: linear-gradient(135deg, #2563eb, #3b82f6); }
  }
}

.main-container {
  display: flex;
  margin: 5px 0 10px !important;
  padding: 0;
  width: 100%;
  height: calc(100vh - 160px);
  flex-shrink: 0;
}

.bottom-spacer {
  height: 60px;
  width: 100%;
  flex-shrink: 0;
}
</style>
