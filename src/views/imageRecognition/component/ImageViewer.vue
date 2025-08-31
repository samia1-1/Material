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

// 图像交互管理器 - 合并自 imageInteractionService.js
class ImageInteractionManager {
  constructor(element, getTransformState, updateCallback) {
    this.element = element;
    this.getTransformState = getTransformState; // 改为获取状态的函数
    this.updateCallback = updateCallback; // 用于更新 Vuex 状态

    this.dragState = {
      isDragging: false,
      wasDragged: false,
      startX: 0,
      startY: 0,
      lastTranslateX: 0,
      lastTranslateY: 0,
    };

    this.touchState = {
      isTouching: false,
      startX: 0,
      startY: 0,
      startDistance: 0,
      lastScale: 1,
    };

    this._dragAnimFrameId = null;

    // Bind methods to ensure 'this' context
    this.handleWheel = this.handleWheel.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.startTouch = this.startTouch.bind(this);
    this.onTouch = this.onTouch.bind(this);
    this.endTouch = this.endTouch.bind(this);
    this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
    this.handleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
  }

  // Public methods to add/remove listeners
  initialize() {
    this.element.addEventListener('wheel', this.handleWheel, { passive: false });
    this.element.addEventListener('mousedown', this.startDrag, { passive: false });
    this.element.addEventListener('touchstart', this.startTouch, { passive: false });
    this.element.addEventListener('touchmove', this.onTouch, { passive: false });
    this.element.addEventListener('touchend', this.endTouch, { passive: false });
    document.addEventListener('mousemove', this.handleGlobalMouseMove, { passive: false });
    document.addEventListener('mouseup', this.handleGlobalMouseUp, { passive: false, capture: true });
  }

  destroy() {
    this.element.removeEventListener('wheel', this.handleWheel);
    this.element.removeEventListener('mousedown', this.startDrag);
    this.element.removeEventListener('touchstart', this.startTouch);
    this.element.removeEventListener('touchmove', this.onTouch);
    this.element.removeEventListener('touchend', this.endTouch);
    document.removeEventListener('mousemove', this.handleGlobalMouseMove);
    document.removeEventListener('mouseup', this.handleGlobalMouseUp, { capture: true });
  }

  // Event handlers
  handleWheel(event) {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    const transformState = this.getTransformState();
    const { scale, minScale, maxScale } = transformState;
    const newScale = scale * (1 + direction * 0.1);
    const updatedScale = Math.max(minScale, Math.min(newScale, maxScale));

    // 更新 Vuex 状态
    this.updateCallback({
      ...transformState,
      scale: updatedScale
    });
  }

  startDrag(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const transformState = this.getTransformState();
    this.dragState.isDragging = true;
    this.dragState.wasDragged = false;
    this.dragState.startX = event.clientX;
    this.dragState.startY = event.clientY;
    this.dragState.lastTranslateX = transformState.translateX;
    this.dragState.lastTranslateY = transformState.translateY;
  }

  onDrag(event) {
    if (!this.dragState.isDragging) return;
    if (event.buttons === 0) {
      this.handleGlobalMouseUp(event);
      return;
    }

    const transformState = this.getTransformState();
    const deltaX = event.clientX - this.dragState.startX;
    const deltaY = event.clientY - this.dragState.startY;
    const newTranslateX = this.dragState.lastTranslateX + deltaX;
    const newTranslateY = this.dragState.lastTranslateY + deltaY;

    // 更新 Vuex 状态
    this.updateCallback({
      ...transformState,
      translateX: newTranslateX,
      translateY: newTranslateY
    });

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > 10) { // Drag threshold
      this.dragState.wasDragged = true;
    }
  }

  handleGlobalMouseMove(event) {
    if (!this.dragState.isDragging) return;
    if (event.buttons === 0) {
      this.handleGlobalMouseUp(event);
      return;
    }
    if (!this._dragAnimFrameId) {
      this._dragAnimFrameId = requestAnimationFrame(() => {
        this.onDrag(event);
        this._dragAnimFrameId = null;
      });
    }
  }

  handleGlobalMouseUp(event) {
    if (this.dragState.isDragging) {
      event.preventDefault();
      event.stopPropagation();
      this.dragState.isDragging = false;
      if (this._dragAnimFrameId) {
        cancelAnimationFrame(this._dragAnimFrameId);
        this._dragAnimFrameId = null;
      }
    }
  }

  startTouch(event) {
    const transformState = this.getTransformState();
    if (event.touches.length === 1) {
      this.touchState.isTouching = true;
      this.touchState.startX = event.touches[0].clientX;
      this.touchState.startY = event.touches[0].clientY;
      this.dragState.lastTranslateX = transformState.translateX;
      this.dragState.lastTranslateY = transformState.translateY;
    } else if (event.touches.length === 2) {
      this.touchState.startDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      this.touchState.lastScale = transformState.scale;
    }
  }

  onTouch(event) {
    if (!this.touchState.isTouching) return;
    const transformState = this.getTransformState();
    if (event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - this.touchState.startX;
      const deltaY = event.touches[0].clientY - this.touchState.startY;
      const newTranslateX = this.dragState.lastTranslateX + deltaX;
      const newTranslateY = this.dragState.lastTranslateY + deltaY;

      // 更新 Vuex 状态
      this.updateCallback({
        ...transformState,
        translateX: newTranslateX,
        translateY: newTranslateY
      });
    } else if (event.touches.length === 2) {
      const currentDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      const ratio = currentDistance / this.touchState.startDistance;
      const newScale = this.touchState.lastScale * ratio;
      const { minScale, maxScale } = transformState;
      const updatedScale = Math.max(minScale, Math.min(newScale, maxScale));

      // 更新 Vuex 状态
      this.updateCallback({
        ...transformState,
        scale: updatedScale
      });
    }
  }

  endTouch() {
    this.touchState.isTouching = false;
  }

  // Method to check if a drag occurred, to prevent clicks
  wasDragged() {
    return this.dragState.wasDragged;
  }
}

export default {
  name: 'ImageViewer',
  components: {
    Loading
  },
  props: {
    isTimeoutMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imageInteractionManager: null,
      isDragOver: false,
      lastUploadTime: 0
    };
  },
  computed: {
    ...mapState('imageRecognition', [
      'imageSrc',
      'isLoading',
      'imageTransform'
    ]),

    imageTransformStyle() {
      if (!this.imageTransform) return {};
      return {
        transform: `scale(${this.imageTransform.scale}) translate(${this.imageTransform.translateX}px, ${this.imageTransform.translateY}px)`,
        transformOrigin: 'center center'
      };
    }
  },
  mounted() {
    // 确保DOM已渲染，然后初始化图像交互管理器
    this.$nextTick(() => {
      if (this.$refs.imageContainer) {
        this.imageInteractionManager = new ImageInteractionManager(
          this.$refs.imageContainer,
          () => this.imageTransform, // 传递获取状态的函数
          this.updateImageTransform
        );
        this.imageInteractionManager.initialize();
      } else {
        console.error('imageContainer ref not found');
      }
    });
  },
  beforeDestroy() {
    if (this.imageInteractionManager) {
      this.imageInteractionManager.destroy();
    }
  },
  methods: {
    ...mapMutations('imageRecognition', ['SET_IMAGE_TRANSFORM']),

    handleClick() {
      this.$emit('image-click');
    },

    onImageLoad(e) {
      this.$emit('image-load', e);
    },

    updateImageTransform(transform) {
      this.SET_IMAGE_TRANSFORM(transform);
    },

    // 上传相关方法
    triggerUpload() {
      const now = Date.now();
      if (now - this.lastUploadTime < 500) return;
      this.lastUploadTime = now;
      this.$refs.fileInput?.click();
    },

    triggerHiddenUpload() {
      const now = Date.now();
      if (now - this.lastUploadTime < 500) return;
      this.lastUploadTime = now;
      this.$refs.hiddenFileInput?.click();
    },

    handleFileChange(event) {
      const file = event.target.files?.[0];
      if (file) {
        this.$emit('upload-file', file);
      }
      event.target.value = '';
    },

    handleHiddenFileChange(event) {
      const file = event.target.files?.[0];
      if (file) {
        this.$emit('upload-file', file);
      }
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
      if (files.length > 0) {
        this.$emit('upload-file', files[0]);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main-content {
  padding: 0;
  background-color: #050505;
  flex: 1;
  display: flex;
  width: calc(100% - 540px);
  min-width: 380px;
  height: 100%; /* 使用父容器的100%高度 */
  overflow: hidden;
}

.image-card {
  flex: 1;
  margin: 0;
  padding: 0;
  width: 150%;
  height: 100%;
  border-radius: 0;
  border: none;

  ::v-deep .el-card__body {
    padding: 0 !important;
    height: 100%;
    width: 100%;
  }
}

.center-pic {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background-color: #030303;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background-color: #030303;
  margin: 30px 0;
}

.showed-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  will-change: transform;
  object-position: center;
}

.center-pic.timeout-mode {
  border: 2px dashed #e6a23c;

  .timeout-banner {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    background: linear-gradient(135deg, rgba(230, 162, 60, 0.95), rgba(230, 162, 60, 0.85));
    color: #ffffff;
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

    i {
      font-size: 18px;
      color: #fff;
      flex-shrink: 0;
    }

    span {
      flex: 1;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .el-button {
      height: 28px;
      padding: 0 12px;
      font-size: 12px;
      border-radius: 4px;

      &--primary {
        background-color: rgba(64, 158, 255, 0.9);
        border-color: transparent;

        &:hover {
          background-color: rgba(64, 158, 255, 1);
          transform: translateY(-1px);
        }
      }

      &:last-child {
        width: 28px;
        padding: 0;
        background-color: rgba(0, 0, 0, 0.3);
        border-color: transparent;

        &:hover {
          background-color: rgba(0, 0, 0, 0.5);
        }
      }
    }
  }
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 20;
  backdrop-filter: blur(5px);

  .loading-text {
    margin-top: 20px;
    color: #ffffff;
    font-size: 16px;
    text-shadow: 0 0 8px rgba(58, 123, 189, 0.8);
    font-weight: 500;
  }
}

// 上传区域样式
.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #030303;

  .upload-area {
    border: 3px dashed #7e92a5;
    border-radius: 8px;
    background-color: rgba(10, 32, 64, 0.3);
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
      background-color: rgba(10, 32, 64, 0.5);
      box-shadow: 0 0 20px rgba(58, 139, 210, 0.6) inset, 0 0 10px rgba(86, 169, 255, 0.5);

      i {
        transform: scale(1.3);
        color: #6b7c8d;
      }
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
        color: #3a7cbd;
        margin-bottom: 20px;
        filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
      }

      .upload-text, .upload-tip {
        color: #ffffff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        margin-bottom: 15px;
      }

      .upload-text {
        font-size: 20px;
        font-weight: 500;
      }

      .upload-tip {
        font-size: 16px;
        color: #a0c0e0;
        margin-bottom: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .timeout-banner {
    flex-direction: column;
    gap: 8px;
    text-align: center;

    .el-button {
      width: 100%;
      margin: 2px 0;

      &:last-child {
        width: 100%;
      }
    }
  }
}
</style>
