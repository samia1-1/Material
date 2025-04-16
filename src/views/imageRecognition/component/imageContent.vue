<template>
  <div class="image-content">
    <el-container class="main-container">
      <!-- 左侧边栏：合并操作按钮和数据显示区域 -->
      <el-aside width="440px" class="left-sidebar">
        <!-- 合并后的操作与数据面板 -->
        <el-card class="combined-card">
          <div slot="header" class="card-header">
            <span><i class="el-icon-s-operation"></i> 操作与分析面板</span>
          </div>

          <!-- 操作控制区域 -->
          <div class="panel-section operation-section">
            <div class="section-title">
              <i class="el-icon-s-tools"></i> 操作控制
            </div>
            <div class="operation-buttons">
              <el-button v-for="(btn, idx) in operationButtons.slice(0, 4)" :key="idx" @click="btn.handler"
                :icon="btn.icon" class="op-button">
                {{ btn.label }}
              </el-button>
            </div>
            <div class="operation-buttons">
              <el-button v-for="(btn, idx) in operationButtons.slice(4)" :key="idx + 4" @click="btn.handler"
                :icon="btn.icon" class="op-button special-button">
                {{ btn.label }}
              </el-button>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="panel-divider"></div>

          <!-- 数据分析区域 -->
          <div class="panel-section data-section">
            <div class="section-title">
              <i class="el-icon-data-analysis"></i> 数据分析
            </div>
            <el-form label-position="left" size="small" class="data-form" label-width="160px">
              <el-form-item v-for="(item, index) in dataFields" :key="index" :label="item.label">
                <el-input v-model="item.value" :placeholder="item.placeholder || '点击查询后显示'" :disabled="true">
                </el-input>
              </el-form-item>
            </el-form>
            <div class="chart-action">
              <el-button @click="getStatistic" icon="el-icon-data-analysis" class="analysis-button">
                查询统计数据
              </el-button>
            </div>
          </div>
        </el-card>
      </el-aside>

      <!-- 主内容区：图片显示 -->
      <el-main class="main-content">
        <el-card class="image-card" shadow="hover">
          <div class="center-pic" :class="{ 'dragging': isDragging, 'has-image': !!image_src }"
            @click.stop="handleCenterPicClick">
            <div class="image-container" ref="imageContainer" @wheel="handleWheel" @touchstart.passive="startTouch"
              @touchmove.passive="onTouch" @touchend.passive="endTouch" @mousedown="startDrag">
              <img :src="image_src" v-if="image_src" class="showed-image" :style="imageTransformStyle" @load="onImageLoad">
              <div v-if="!isLoading && !image_src" class="upload-placeholder">
                <!-- 修改上传组件，增加拖拽功能，确保文字居中 -->
                <div class="upload-area" @click.stop="triggerUpload" @dragover.prevent="handleDragOver"
                  @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop" :class="{ 'drag-over': isDragOver }">
                  <div class="upload-content">
                    <i class="el-icon-upload"></i>
                    <div class="upload-text">点击上传图片或拖拽到此处</div>
                    <div class="upload-tip">支持PNG、JPG、TIFF格式，最大10MB</div>
                  </div>
                </div>
              </div>
            </div>
            <loading v-show="isLoading"></loading>
            <div v-show="isShowStatistic" class="show-statistic">
              <el-tag type="success">识别区域图片总区域比例：{{ statisticData }} %</el-tag>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>

    <!-- 示例图片区域 -->
    <div class="footer-examples">
      <el-card class="example-card" shadow="hover">
        <div slot="header" class="card-header">
          <span><i class="el-icon-picture"></i> 示例图片</span>
          <el-tooltip content="点击图片查看处理前后对比效果" placement="top">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>

        <!-- 分类标签页 -->
        <el-tabs v-model="activeCategory" type="card">
          <el-tab-pane v-for="category in categories" :key="category.id" :label="category.name"
            :name="category.id.toString()" class="example-tab">

            <div class="show-img-list">
              <el-row :gutter="20">
                <el-col :xs="8" :sm="6" :md="4" :lg="4" :xl="3" v-for="(item, index) in getCategoryImages(category.id)"
                  :key="index">
                  <el-card
                    :body-style="{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'visible' }"
                    shadow="hover"
                    class="img-item-card"
                    @click.native="loadExampleImage(item)">
                    <!-- 修改示例图片的加载方式，使用预处理的预览图 -->
                    <div class="img-preview-container">
                      <img :src="getImagePreviewUrl(item)" class="show-img" :alt="item.name">
                    </div>
                    <div class="img-item-footer">
                      <span>{{ category.name }} {{ index + 1 }}</span>
                      <i class="el-icon-picture-outline-round"></i>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 隐藏的文件输入 -->
    <input type="file" ref="fileInput" style="display:none" accept="image/jpeg,image/png,image/tiff"
      @change="handleNativeFileChange" />
  </div>
</template>

<script>
import Loading from "@/components/Loading/index.vue";
import { imageMixin, apiMixin, interactionMixin, uploadMixin, previewMixin } from "./mixins";
import categoryConfig from './config/categoryConfig';

export default {
  name: "ImageContent",
  components: { Loading },
  mixins: [imageMixin, apiMixin, interactionMixin, uploadMixin, previewMixin],

  data() {
    return {
      // 主要状态
      image_src: "",
      form_data: undefined,
      isLoading: false,
      isShowStatistic: false,
      statisticData: null,
      originalImageSrc: "",
      apiReturnedUrl: "",
      processingFile: false,

      // 数据字段
      dataFields: [
        { label: 'Current coordinates', value: '', placeholder: '点击查询后显示' },
        { label: 'Area fraction', value: '', placeholder: '点击查询后显示' },
        { label: 'Circularity', value: '', placeholder: '点击查询后显示' },
        { label: 'Minimum ccd', value: '', placeholder: '点击查询后显示' },
        { label: 'Maximum icd', value: '', placeholder: '点击查询后显示' },
        { label: 'Equal area circle diam', value: '', placeholder: '点击查询后显示' },
        { label: 'Width of the Mbr', value: '', placeholder: '点击查询后显示' },
        { label: 'Height of the Mbr', value: '', placeholder: '点击查询后显示' },
        { label: 'Category', value: '', placeholder: '点击查询后显示' },
      ],

      // 图片变换状态
      imageTransform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
        minScale: 0.5,
        maxScale: 5
      },

      // 拖拽状态
      dragState: {
        isDragging: false,
        wasDragged: false,
        startX: 0,
        startY: 0,
        lastTranslateX: 0,
        lastTranslateY: 0,
        distance: 0,
        threshold: 10,
        dragStartTime: 0,
        dragEndTime: 0
      },

      // 触摸状态
      touchState: {
        isTouching: false,
        startX: 0,
        startY: 0,
        startDistance: 0,
        lastScale: 1
      },

      // 分类数据
      categories: categoryConfig,
      activeCategory: '0', // 默认选中"所有分类"
    };
  },

  computed: {
    // 计算图片的变换样式
    imageTransformStyle() {
      const { scale, translateX, translateY } = this.imageTransform;
      return {
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        // 拖拽时完全禁用过渡效果，确保立即响应
        transition: this.dragState.isDragging ? 'none' : 'transform 0.1s ease-out',
        // 根据拖拽状态更改鼠标样式
        cursor: this.dragState.isDragging ? 'grabbing' : 'grab',
        // 提高GPU硬件加速
        willChange: this.dragState.isDragging ? 'transform' : 'auto'
      };
    },

    // 拖拽状态
    isDragging() {
      return this.dragState.isDragging;
    },

    // 操作按钮配置
    operationButtons() {
      return [
        { label: '上传图片', handler: this.imgUpload, icon: 'el-icon-upload' },
        { label: '重置图片', handler: this.resetImage, icon: 'el-icon-refresh-left'},
        { label: '放大', handler: this.handleZoomIn, icon: 'el-icon-zoom-in' },
        { label: '缩小', handler: this.handleZoomOut, icon: 'el-icon-zoom-out' },
        { label: '图像分割', handler: this.handleSegmentation, icon: 'el-icon-crop' },
        { label: '降维处理', handler: this.handleReduction, icon: 'el-icon-s-operation' },
        { label: '显示分析', handler: this.handleDisplay, icon: 'el-icon-view' }
      ];
    }
  },

  created() {
    // 在组件创建时从会话存储恢复API返回的URL
    this.apiReturnedUrl = sessionStorage.getItem("apiUrl") || "";

    const tempUrl = sessionStorage.getItem("url");
    if (tempUrl !== null) {
      this.isLoading = true;
      // 获取TIFF图片并转换
      this.getTiffDataUrlHandler(tempUrl);

      // 直接处理保存的图片，无需确认对话框
      this.clickStatistic(true);
    }

    // 加载图片数据
    this.loadImagesForAllCategories();
  },

  watch: {
    // 监听加载状态变化，更新视觉样式
    isLoading(newVal) {
      this.updateLoadingState();
    }
  },

  mounted() {
    // 初始化加载状态
    this.updateLoadingState();
  },

  beforeDestroy() {
    // 清理可能的内存泄漏
    if (this.image_src && this.image_src.startsWith('blob:')) {
      URL.revokeObjectURL(this.image_src);
    }

    // 清理文件输入框的事件监听
    const fileInput = document.getElementById('select_files');
    if (fileInput && this._handleInputChange) {
      fileInput.removeEventListener('change', this._handleInputChange);
    }
  },

  methods: {
    // 改进中心图片区域点击处理，防止重复触发
    handleCenterPicClick(event) {
      // 阻止事件冒泡
      event.stopPropagation();

      // 加载状态下不允许操作
      if (this.isLoading) {
        return;
      }

      // 如果标记为拖动，或距离上次拖动结束时间很短，则不触发上传
      const timeSinceDragEnd = Date.now() - this.dragState.dragEndTime;
      if (this.dragState.wasDragged || timeSinceDragEnd < 300) {
        return;
      }

      // 检查是否在短时间内重复触发
      const now = Date.now();
      if (now - this.lastUploadTime < 500) {
        console.log('忽略重复的上传触发');
        return;
      }

      // 只有在未上传图片时才触发文件选择
      if (!this.image_src) {
        this.triggerUpload();
      }
    },

    // 更新加载状态 - 修复DOM选择错误
    updateLoadingState() {
      // 确保DOM已经挂载并且能正确获取到元素
      if (this.$el && typeof this.$el.querySelector === 'function') {
        const centerPic = this.$el.querySelector('.center-pic');
        if (centerPic) {
          // 根据加载状态设置属性
          if (this.isLoading) {
            centerPic.setAttribute('loading', 'true');
          } else {
            centerPic.removeAttribute('loading');
          }
        }
      }
    },

    // 修改图片加载完成后的处理函数
    onImageLoad(e) {
      // 重置变换状态
      this.imageTransform.scale = 1;
      this.imageTransform.translateX = 0;
      this.imageTransform.translateY = 0;

      // 延迟执行以确保DOM已更新
      this.$nextTick(() => {
        // 自动调整图片大小以填充容器
        this.autoFitImage(e.target);
      });
    },

    // 改进自动调整图片大小的逻辑，确保图片完全填满显示区域
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

      // 采用cover模式的缩放策略，确保图片完全填满容器
      if (imgRatio > containerRatio) {
        // 图片较宽，以容器高度为准，并添加额外的放大系数
        scale = (containerHeight / imgHeight) * 1.1; // 额外放大10%确保填满
      } else {
        // 图片较高，以容器宽度为准，并添加额外的放大系数
        scale = (containerWidth / imgWidth) * 1.1; // 额外放大10%确保填满
      }

      console.log(`容器尺寸: ${containerWidth}x${containerHeight}, 图片尺寸: ${imgWidth}x${imgHeight}, 缩放比: ${scale}`);

      // 检查图片是否显著小于容器，如果是，则额外放大
      const imgArea = imgWidth * imgHeight;
      const containerArea = containerWidth * containerHeight;
      if (imgArea < containerArea * 0.7) {
        // 如果图片面积小于容器面积的70%，额外放大
        scale *= 1.2;
        console.log(`图片较小，额外放大，最终缩放比: ${scale}`);
      }

      // 应用缩放，不设置上限
      this.imageTransform.scale = scale;

      // 确保图片居中显示
      this.$nextTick(() => {
        // 只保留最小缩放限制
        if (scale < 0.5) {
          this.imageTransform.scale = 0.5;
        }
      });
    }
  }
};
</script>

<style scoped>
/* 页面整体布局优化 */
.image-content {
  width: 95%;
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 8px 15px 8px 60px;
  min-height: calc(100vh - 90px);
  overflow: visible;
}

/* 整体布局优化 */
.main-container {
  display: flex;
  margin: 10px 0 0 0;
  margin-left: 0 !important;
  padding: 0;
  width: 100%;
}

/* 左侧边栏优化 */
.left-sidebar {
  background-color: #000000;
  border-right: 1px solid #0f0f0f;
  padding: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.5);
  width: 540px !important;
  flex: 0 0 440px;
  height: auto;
}

/* 卡片通用样式优化 */
.combined-card,
.image-card,
.example-card {
  margin-bottom: 12px;
  border-radius: 2px;
  background-color: #050505;
  border: 1px solid #101010;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  height: auto;
  display: flex;
  flex-direction: column;
}

/* 卡片头部样式优化 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #101010;
  padding: 10px 12px;
  background-color: #030303;
}

.card-header span {
  font-weight: bold;
  font-size: 14px;
  color: #d0e0f0;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

/* 面板区域样式优化 */
.panel-section {
  padding: 8px 5px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #d0e0f0;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #151515;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title i {
  margin-right: 5px;
  color: #3a7cbd;
}

/* 面板分隔线优化 */
.panel-divider {
  height: 2px;
  margin: 12px 0;
  background: linear-gradient(90deg, transparent, #3a7cbd, transparent);
  opacity: 0.6;
}

/* 操作按钮区域优化 */
.operation-section {
  width: 100%;
  margin-bottom: 15px;
}

.operation-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
  padding: 0 2px;
}

/* 统一按钮样式优化 */
.op-button {
  width: 100% !important;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  margin: 0;
  font-size: 13px;
  border-radius: 2px;
  font-weight: 500;
  background-color: #080808;
  color: #b8c7d9;
  border: 1px solid #151515;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
}

.op-button:hover {
  background-color: #101010;
  border-color: #1e1e1e;
  color: #ffffff;
}

.op-button i {
  margin-right: 6px;
  font-size: 16px;
  color: #3a7cbd;
}

/* 特殊按钮样式优化 */
.special-button {
  background-color: #071525;
  border-color: #0e2740;
  color: #c0d0e0;
}

.special-button:hover {
  background-color: #0a2235;
  border-color: #15304d;
  color: #ffffff;
}

/* 分析按钮优化 */
.analysis-button {
  width: 100%;
  height: 38px;
  background-color: #071525;
  color: #c0d0e0;
  border-color: #0e2740;
  border-radius: 2px;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

/* 数据分析区域样式优化 */
.data-section {
  width: 100%;
  background-color: #030303;
  border-radius: 2px;
  border: 1px solid #101010;
  padding: 12px;
  margin: 0 3px;
}

/* 表单样式优化 */
.data-form {
  margin-bottom: 12px;
}

.data-form>>>.el-form-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  flex-direction: row;
}

.data-form>>>.el-form-item__label {
  color: #d0e0f0 !important;
  font-size: 13px;
  line-height: 32px;
  font-weight: 500;
  text-align: left;
  float: none;
  width: 160px !important;
  padding: 0 8px 0 0;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-form>>>.el-form-item__content {
  line-height: 32px;
  margin-left: 0 !important;
  flex: 1;
}

.data-form>>>.el-input__inner {
  background-color: #050505 !important;
  border-color: #151515 !important;
  color: #c0d0e0 !important;
  height: 32px;
  font-size: 13px;
  border-radius: 2px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  padding: 0 10px;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
}

/* 图表操作区域 */
.chart-action {
  margin-top: 12px;
  text-align: center;
  padding: 0 5px;
}

/* 统计信息显示区域优化 */
.show-statistic {
  position: absolute;
  bottom: 15px;
  right: 15px;
  padding: 6px 10px;
  z-index: 10;
  background-color: rgba(3, 3, 3, 0.8);
  backdrop-filter: blur(3px);
  border-radius: 3px;
  border: 1px solid #151515;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.show-statistic>>>.el-tag {
  background-color: #071525 !important;
  color: #d0e0f0 !important;
  border-color: #0e2740 !important;
  padding: 4px 8px;
  height: auto;
  line-height: 1.4;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 主内容区优化 */
.main-content {
  padding: 0px;
  background-color: #050505;
  flex: 1 1 auto;
  display: flex;
  width: calc(100% - 540px);
  min-width: 380px;
  height: calc(100vh - 50px);
  overflow: hidden;
}

/* 图片卡片优化 */
.image-card {
  flex: 1;
  margin: 0;
  padding: 0;
  width: 150%;
  height: 100%;
  justify-content: center;
  align-items: center;
  border-radius: 0;
  border: none;
}

/* 图片卡片内容区域优化 */
.image-card >>> .el-card__body {
  padding: 0 !important;
  height: 100%;
  width: 100%;
}

/* 中央图片区域优化 */
.center-pic {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  position: relative;
  overflow: hidden;
  background-color: #030303;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 图片容器优化 */
.image-container {
  width: 100%;
  height: 100%; /* 修改为100%适应父容器 */
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background-color: #030303;
}

/* 显示图片样式优化 - 修改为完全填充模式 */
.showed-image {
  width: 100%; /* 设置为100%宽度以填充容器 */
  height: 100%; /* 设置为100%高度以填充容器 */
  object-fit: cover; /* 改为cover模式以完全填充 */
  will-change: transform; /* 优化渲染性能 */
  object-position: center; /* 确保居中裁剪 */
}

/* 上传区域样式优化 */
.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #030303;
  padding: 0;
}

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
}

.upload-content {
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.upload-area i {
  font-size: 60px;
  color: #3a7cbd;  /* 修改为与主题一致的颜色 */
  margin-bottom: 20px;
  transition: all 0.3s;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
}

.upload-text {
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 15px;
  text-align: center;
  width: 100%;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.upload-tip {
  font-size: 16px;
  color: #a0c0e0;
  text-align: center;
  width: 100%;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* 拖拽悬停状态优化 */
.drag-over {
  border-color: #7a8998;
  background-color: rgba(10, 32, 64, 0.5);
  box-shadow: 0 0 20px rgba(58, 139, 210, 0.6) inset, 0 0 10px rgba(86, 169, 255, 0.5);
}

.drag-over i {
  transform: scale(1.3);
  color: #6b7c8d;  /* 修改为主题色的稍亮版本，保持一致性 */
}

/* 示例图片区域容器优化 */
.footer-examples {
  margin-top: 10px;
  margin-bottom: 15px;
  overflow: visible;
  position: relative;
  z-index: 5;
}

/* 示例卡片样式优化 */
.example-card {
  margin-bottom: 0;
  min-height: 220px;
  display: block;
}

.example-card >>> .el-card__body {
  padding: 10px;
  overflow-y: visible;
  min-height: 160px;
}

/* 标签页内容优化 */
.example-card >>> .el-tabs__content {
  overflow-y: visible;
  min-height: 140px;
  display: block;
}

/* 标签页样式优化 */
.example-card >>> .el-tabs__item {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  font-weight: 600;
  color: #d0e0f0 !important;
  background-color: #050505;
  border: 1px solid #151515;
  border-bottom: none;
  transition: all 0.3s;
  padding: 0 15px;
}

.example-card >>> .el-tabs__item:hover {
  color: #ffffff !important;
  background-color: #0a1625;
}

.example-card >>> .el-tabs__item.is-active {
  color: #ffffff !important;
  background-color: #0a2040;
  border-bottom-color: #3a7cbd;
  font-weight: 700;
}

/* 预览图容器优化 */
.img-preview-container {
  width: 100%;
  flex: 1;
  overflow: hidden;
  background-color: #050505;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  height: calc(100% - 30px);
  min-height: 95px;
}

/* 示例图片列表优化 */
.show-img-list {
  padding: 5px 0;
}

/* 示例图片卡片优化 */
.img-item-card {
  margin-bottom: 8px;
  background-color: #030303;
  border: 1px solid #101010;
  border-radius: 2px;
  transform: translateY(0);
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  height: 160px;
  overflow: visible;
  cursor: pointer;
}

.img-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  border-color: #3a7cbd;
}

/* 图片底部信息栏优化 */
.img-item-footer {
  padding: 5px 8px;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  border-top: 1px solid #1e1e1e;
  background-color: #0a1b30;
  height: 30px;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 5px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.3px;
}

.img-item-footer span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.img-item-footer i {
  color: #56a9ff;
  font-size: 14px;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
}

/* 示例图片内部卡片样式优化 */
.img-item-card >>> .el-card__body {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: visible;
}

/* 显示图片样式优化 */
.show-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 卡片内容全局优化 */
.el-card__body {
  height: 100%;
  padding: 10px !important;
}

/* 清除多余的滚动设置 */
.operation-section,
.data-section {
  overflow: visible;
}
</style>
