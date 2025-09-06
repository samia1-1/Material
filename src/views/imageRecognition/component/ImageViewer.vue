<template>
  <el-main class="main-content">
    <el-card class="image-card" shadow="hover">
      <div class="center-pic" :class="{ 'has-image': !!imageSrc, 'timeout-mode': isTimeoutMode }"
        @click.stop="handleClick">

        <!-- 超时模式横幅 -->
        <div v-if="isTimeoutMode" class="timeout-banner">
          <i class="el-icon-warning"></i>
          <span>请求超时，但图片已成功上传并可正常操作</span>
          <el-button size="mini" type="primary" @click="$emit('retry-request')">重试</el-button>
          <el-button size="mini" @click="$emit('dismiss-timeout')">×</el-button>
        </div>

        <!-- 图片显示区域 -->
        <div class="image-container" ref="imageContainer">
          <img
            :src="imageSrc"
            v-if="imageSrc"
            class="showed-image"
            :style="imageTransformStyle"
            @load="onImageLoad">

          <!-- 上传占位符 -->
          <div v-if="!isLoading && !imageSrc" class="upload-placeholder">
            <div
              class="upload-area"
              :class="{ 'drag-over': isDragOver }"
              @click.stop="triggerUpload"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop">

              <div class="upload-content">
                <i class="el-icon-upload"></i>
                <div class="upload-text">点击上传图片或拖拽到此处</div>
                <div class="upload-tip">支持PNG、JPG、TIFF格式，最大10MB</div>
              </div>
            </div>

            <input
              type="file"
              ref="fileInput"
              style="display:none"
              accept="image/jpeg,image/png,image/tiff"
              @change="handleFileChange" />
          </div>
        </div>

        <!-- 隐藏的上传区域，用于按钮触发 -->
        <input
          type="file"
          ref="hiddenFileInput"
          style="display:none"
          accept="image/jpeg,image/png,image/tiff"
          @change="handleHiddenFileChange" />

        <!-- 加载状态 -->
        <div v-show="isLoading" class="loading-container">
          <loading></loading>
          <div class="loading-text">正在处理图片，请稍候...</div>
        </div>
      </div>
    </el-card>
  </el-main>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import Loading from "@/components/Loading/index.vue";

// 简化的图像交互管理器
class ImageInteractionManager {
  constructor(element, getTransformState, updateCallback) {
    this.element = element;
    this.getTransformState = getTransformState;
    this.updateCallback = updateCallback;
    this.dragState = { isDragging: false, startX: 0, startY: 0, lastTranslateX: 0, lastTranslateY: 0 };
    this.touchState = { isTouching: false, startDistance: 0, lastScale: 1 };
    this._animFrameId = null;

    // 绑定方法
    this.handleWheel = this.handleWheel.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.handleTouch = this.handleTouch.bind(this);
  }

  initialize() {
    const options = { passive: false };
    this.element.addEventListener('wheel', this.handleWheel, options);
    this.element.addEventListener('mousedown', this.startDrag, options);
    this.element.addEventListener('touchstart', this.handleTouch, options);
    this.element.addEventListener('touchmove', this.handleTouch, options);
    this.element.addEventListener('touchend', () => {
      this.touchState.isTouching = false;
      this.touchState.startDistance = 0;
    });
    document.addEventListener('mousemove', this.onDrag, options);
    document.addEventListener('mouseup', this.endDrag, { ...options, capture: true });
  }

  destroy() {
    this.element.removeEventListener('wheel', this.handleWheel);
    this.element.removeEventListener('mousedown', this.startDrag);
    this.element.removeEventListener('touchstart', this.handleTouch);
    this.element.removeEventListener('touchmove', this.handleTouch);
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.endDrag, { capture: true });
    if (this._animFrameId) cancelAnimationFrame(this._animFrameId);
  }

  handleWheel(event) {
    event.preventDefault();
    const { scale, minScale, maxScale } = this.getTransformState();
    const newScale = scale * (1 + (event.deltaY > 0 ? -0.1 : 0.1));
    this.updateCallback({ ...this.getTransformState(), scale: Math.max(minScale, Math.min(newScale, maxScale)) });
  }

  startDrag(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    const { translateX, translateY } = this.getTransformState();
    Object.assign(this.dragState, {
      isDragging: true, startX: event.clientX, startY: event.clientY,
      lastTranslateX: translateX, lastTranslateY: translateY
    });
  }

  onDrag(event) {
    if (!this.dragState.isDragging || event.buttons === 0) return this.endDrag();
    if (!this._animFrameId) {
      this._animFrameId = requestAnimationFrame(() => {
        const { startX, startY, lastTranslateX, lastTranslateY } = this.dragState;
        this.updateCallback({
          ...this.getTransformState(),
          translateX: lastTranslateX + event.clientX - startX,
          translateY: lastTranslateY + event.clientY - startY
        });
        this._animFrameId = null;
      });
    }
  }

  endDrag() {
    this.dragState.isDragging = false;
    if (this._animFrameId) {
      cancelAnimationFrame(this._animFrameId);
      this._animFrameId = null;
    }
  }

  handleTouch(event) {
    const { touches } = event;
    if (touches.length === 1) {
      // 单指拖拽
      if (!this.touchState.isTouching) {
        const { translateX, translateY } = this.getTransformState();
        this.touchState = {
          isTouching: true,
          startX: touches[0].clientX,
          startY: touches[0].clientY,
          lastTranslateX: translateX,
          lastTranslateY: translateY
        };
      } else {
        const deltaX = touches[0].clientX - this.touchState.startX;
        const deltaY = touches[0].clientY - this.touchState.startY;
        this.updateCallback({
          ...this.getTransformState(),
          translateX: this.touchState.lastTranslateX + deltaX,
          translateY: this.touchState.lastTranslateY + deltaY
        });
      }
    } else if (touches.length === 2) {
      // 双指缩放
      const distance = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
      if (!this.touchState.startDistance) {
        this.touchState.startDistance = distance;
        this.touchState.lastScale = this.getTransformState().scale;
      } else {
        const { minScale, maxScale } = this.getTransformState();
        const newScale = this.touchState.lastScale * (distance / this.touchState.startDistance);
        this.updateCallback({ ...this.getTransformState(), scale: Math.max(minScale, Math.min(newScale, maxScale)) });
      }
    }
  }
}

export default {
  name: 'ImageViewer',
  components: { Loading },
  props: { isTimeoutMode: { type: Boolean, default: false } },

  data: () => ({
    imageInteractionManager: null,
    isDragOver: false,
    lastUploadTime: 0
  }),

  computed: {
    ...mapState('imageRecognition', ['imageSrc', 'isLoading', 'imageTransform']),
    imageTransformStyle() {
      if (!this.imageTransform) return {};
      return {
        transform: `scale(${this.imageTransform.scale}) translate(${this.imageTransform.translateX}px, ${this.imageTransform.translateY}px)`,
        transformOrigin: 'center center'
      };
    }
  },

  mounted() {
    this.$nextTick(() => {
      if (this.$refs.imageContainer) {
        this.imageInteractionManager = new ImageInteractionManager(
          this.$refs.imageContainer,
          () => this.imageTransform,
          this.updateImageTransform
        );
        this.imageInteractionManager.initialize();
      }
    });
  },

  beforeDestroy() {
    this.imageInteractionManager?.destroy();
  },

  methods: {
    ...mapMutations('imageRecognition', ['SET_IMAGE_TRANSFORM']),

    handleClick() { this.$emit('image-click'); },
    onImageLoad(e) { this.$emit('image-load', e); },
    updateImageTransform(transform) { this.SET_IMAGE_TRANSFORM(transform); },

    triggerUpload() {
      if (Date.now() - this.lastUploadTime < 500) return;
      this.lastUploadTime = Date.now();
      this.$refs.fileInput?.click();
    },

    triggerHiddenUpload() {
      if (Date.now() - this.lastUploadTime < 500) return;
      this.lastUploadTime = Date.now();
      this.$refs.hiddenFileInput?.click();
    },

    handleFileChange(event) {
      const file = event.target.files?.[0];
      if (file) this.$emit('upload-file', file);
      event.target.value = '';
    },

    handleHiddenFileChange(event) {
      const file = event.target.files?.[0];
      if (file) this.$emit('upload-file', file);
      event.target.value = '';
    },

    handleDragOver(e) {
      e.preventDefault();
      this.isDragOver = true;
    },

    handleDragLeave(e) {
      e.preventDefault();
      this.isDragOver = false;
    },

    handleDrop(e) {
      e.preventDefault();
      this.isDragOver = false;
      const files = e.dataTransfer.files;
      if (files.length > 0) this.$emit('upload-file', files[0]);
    }
  }
}
</script>

<style lang="scss" scoped>
// 基础变量
$bg-dark: #030303;
$bg-darker: #050505;
$border-blue: #7e92a5;
$blue-light: #3a7cbd;
$blue-bright: #56a9ff;
$text-light: #a0c0e0;
$warning-color: #e6a23c;

// 主容器
.main-content {
  padding: 0;
  background: $bg-darker;
  flex: 1;
  display: flex;
  width: calc(100% - 540px);
  min-width: 380px;
  height: 100%;
  overflow: hidden;
}

.image-card {
  flex: 1;
  margin: 0;
  padding: 0;
  width: 150%;
  height: 100%;
  border: none;
  border-radius: 0;

  ::v-deep .el-card__body {
    padding: 0 !important;
    height: 100%;
    width: 100%;
  }
}

// 图片容器
.center-pic, .image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: $bg-dark;
}

.image-container { margin: 30px 0; }

.showed-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  will-change: transform;
  object-position: center;
}

// 超时模式
.center-pic.timeout-mode {
  border: 2px dashed $warning-color;

  .timeout-banner {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    background: linear-gradient(135deg, rgba($warning-color, 0.95), rgba($warning-color, 0.85));
    color: #fff;
    padding: 10px 15px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 15;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.2);

    i { font-size: 18px; flex-shrink: 0; }
    span { flex: 1; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); }

    .el-button {
      height: 28px;
      padding: 0 12px;
      font-size: 12px;
      border-radius: 4px;

      &--primary {
        background: rgba(64, 158, 255, 0.9);
        border: transparent;
        &:hover { background: rgba(64, 158, 255, 1); transform: translateY(-1px); }
      }

      &:last-child {
        width: 28px;
        padding: 0;
        background: rgba(0, 0, 0, 0.3);
        border: transparent;
        &:hover { background: rgba(0, 0, 0, 0.5); }
      }
    }
  }
}

// 加载状态
.loading-container {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  z-index: 20;
  backdrop-filter: blur(5px);

  .loading-text {
    margin-top: 20px;
    color: #fff;
    font-size: 16px;
    text-shadow: 0 0 8px rgba(58, 123, 189, 0.8);
    font-weight: 500;
  }
}

// 上传区域
.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-dark;

  .upload-area {
    border: 3px dashed $border-blue;
    border-radius: 8px;
    background: rgba(10, 32, 64, 0.3);
    width: 90%;
    max-width: 550px;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 15px rgba(10, 32, 64, 0.4) inset, 0 0 5px rgba(58, 123, 189, 0.3);

    &.drag-over {
      border-color: #7a8998;
      background: rgba(10, 32, 64, 0.5);
      box-shadow: 0 0 20px rgba(58, 139, 210, 0.6) inset, 0 0 10px rgba(86, 169, 255, 0.5);
      i { transform: scale(1.3); color: #6b7c8d; }
    }

    .upload-content {
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 20px;
      z-index: 2;
      position: relative;

      i {
        font-size: 60px;
        color: $blue-light;
        margin-bottom: 20px;
        filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
      }

      .upload-text, .upload-tip {
        color: #fff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        margin-bottom: 15px;
      }

      .upload-text { font-size: 20px; font-weight: 500; }
      .upload-tip { font-size: 16px; color: $text-light; margin-bottom: 0; }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .timeout-banner {
    flex-direction: column;
    gap: 8px;
    text-align: center;

    .el-button { width: 100%; margin: 2px 0; }
  }
}
</style>
