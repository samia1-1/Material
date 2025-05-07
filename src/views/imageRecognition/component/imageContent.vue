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
              <span class="glow-line"></span>
            </div>
            <div class="operation-buttons">
              <el-button v-for="(btn, idx) in operationButtons.slice(0, 4)" :key="idx" @click="btn.handler"
                :icon="btn.icon" class="op-button" :class="{'glow-button': idx === 0}">
                {{ btn.label }}
              </el-button>
            </div>
            <div class="operation-buttons">
              <el-button v-for="(btn, idx) in operationButtons.slice(4)" :key="idx + 4" @click="btn.handler"
                :icon="btn.icon" class="op-button special-button" :class="{'glow-button': idx === 0}">
                {{ btn.label }}
              </el-button>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="panel-divider">
            <div class="flowing-light"></div>
          </div>

          <!-- 数据分析区域 -->
          <div class="panel-section data-section">
            <div class="section-title">
              <i class="el-icon-data-analysis"></i> 数据分析
              <span class="glow-line"></span>
            </div>
            <el-form label-position="left" size="small" class="data-form" label-width="160px">
              <el-form-item v-for="(item, index) in dataFields" :key="index" :label="item.label">
                <el-input v-model="item.value" :placeholder="item.placeholder || '点击查询后显示'" :disabled="true">
                </el-input>
              </el-form-item>
            </el-form>
            <div class="chart-action">
              <el-button @click="getStatistic" icon="el-icon-data-analysis" class="analysis-button glow-button">
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
                <!-- 修改上传组件，增加流光动态效果 -->
                <div class="upload-area" @click.stop="triggerUpload" @dragover.prevent="handleDragOver"
                  @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop" :class="{ 'drag-over': isDragOver }">
                  <!-- 背景动态元素 -->
                  <div class="dynamic-border"></div>
                  <div class="corner-lights">
                    <div class="corner top-left"></div>
                    <div class="corner top-right"></div>
                    <div class="corner bottom-left"></div>
                    <div class="corner bottom-right"></div>
                  </div>
                  <div class="upload-content">
                    <i class="el-icon-upload pulse-icon"></i>
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
                    <div class="img-preview-container">
                      <img :src="getImagePreviewUrl(item)" class="show-img" :alt="item.name">
                      <div class="hover-shine"></div>
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
      form_data: undefined,
      isShowStatistic: false,
      statisticData: null,
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

      // 分类数据
      categories: categoryConfig,
      activeCategory: '0', // 默认选中"所有分类"
    };
  },

  computed: {
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

  mounted() {
    // 初始化加载状态
    this.updateLoadingState();
  }
};
</script>

<style scoped>
/* 基础布局 */
.image-content {
  width: 95%;
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 8px 15px 8px 60px;
  min-height: calc(100vh - 90px);
}

.main-container {
  display: flex;
  margin: 10px 0 0 !important;
  padding: 0;
  width: 100%;
}

/* 左侧边栏和主内容区域 */
.left-sidebar {
  background-color: #000;
  border-right: 1px solid #0f0f0f;
  padding: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.5);
  width: 440px !important;
  flex: 0 0 440px;
}

.main-content {
  padding: 0;
  background-color: #050505;
  flex: 1;
  display: flex;
  width: calc(100% - 540px);
  min-width: 380px;
  height: calc(100vh - 50px);
  overflow: hidden;
}

/* 卡片通用样式 */
.combined-card, .image-card, .example-card {
  margin-bottom: 12px;
  border-radius: 2px;
  background-color: #050505;
  border: 1px solid #101010;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
}

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
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  text-shadow: 0 0 5px rgba(58, 123, 189, 0.5);
}

/* 内容面板通用样式 */
.panel-section {
  padding: 8px 5px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #151515;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  text-shadow: 0 0 8px rgba(58, 123, 189, 0.6);
}

.section-title i {
  margin-right: 5px;
  color: #56a9ff;
}

/* 动画关键帧定义 */
@keyframes line-glow {
  0% { width: 30px; opacity: 0.5; }
  100% { width: 80px; opacity: 0.8; }
}

@keyframes divider-flow {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes button-shine {
  0% { left: -100%; }
  10%, 100% { left: 200%; }
}

@keyframes rotate-border {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes corner-pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.8); opacity: 0.8; }
}

@keyframes icon-glow {
  0% { text-shadow: 0 0 5px rgba(58, 123, 189, 0.5); color: #3a7cbd; }
  100% { text-shadow: 0 0 15px rgba(58, 123, 189, 0.8); color: #56a9ff; }
}

/* 发光线和分隔线 */
.glow-line {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #3a7cbd, transparent);
  width: 30px;
  z-index: 1;
  animation: line-glow 3s infinite alternate;
}

.panel-divider {
  height: 2px;
  margin: 12px 0;
  background: linear-gradient(90deg, transparent, #3a7cbd, transparent);
  opacity: 0.6;
  position: relative;
  overflow: hidden;
}

.flowing-light {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
  animation: divider-flow 4s infinite;
}

/* 操作按钮区域 */
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

/* 按钮样式 */
.op-button, .analysis-button {
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
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  color: #fff;
}

.op-button {
  background-color: #080808;
  border: 1px solid #151515;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.op-button:hover {
  background-color: #101010;
  border-color: #1e1e1e;
}

.op-button i {
  margin-right: 6px;
  font-size: 16px;
  color: #56a9ff;
}

.special-button, .analysis-button {
  background-color: #071525;
  border-color: #0e2740;
}

.special-button:hover {
  background-color: #0a2235;
  border-color: #15304d;
}

/* 发光按钮效果 */
.glow-button {
  position: relative;
  overflow: hidden;
}

.glow-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -100%;
  width: 60%;
  height: 200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(45deg);
  animation: button-shine 6s infinite;
  z-index: 1;
}

/* 数据区域 */
.data-section {
  width: 100%;
  background-color: #030303;
  border-radius: 2px;
  border: 1px solid #101010;
  padding: 12px;
  margin: 0 3px;
}

.data-form {
  margin-bottom: 12px;
}

/* 表单元素样式 */
.data-form>>>.el-form-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  flex-direction: row;
}

.data-form>>>.el-form-item__label {
  color: #fff !important;
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.data-form>>>.el-form-item__content {
  line-height: 32px;
  margin-left: 0 !important;
  flex: 1;
}

.data-form>>>.el-input__inner {
  background-color: #071525 !important;
  border-color: #0e2740 !important;
  color: #fff !important;
  height: 32px;
  font-size: 13px;
  border-radius: 2px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 5px rgba(58, 123, 189, 0.2);
  padding: 0 10px;
  width: 100%;
  letter-spacing: 0.5px;
  font-weight: 500;
  text-align: left;
}

.data-form>>>.el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
}

.chart-action {
  margin-top: 12px;
  text-align: center;
  padding: 0 5px;
}

/* 统计信息显示 */
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

.show-statistic>>>.el-tag {
  background-color: #0a2040 !important;
  color: #fff !important;
  border-color: #0e2740 !important;
  padding: 4px 8px;
  height: auto;
  line-height: 1.4;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-size: 13px;
}

/* 图片显示区域 */
.image-card {
  flex: 1;
  margin: 0;
  padding: 0;
  width: 150%;
  height: 100%;
  border-radius: 0;
  border: none;
}

.image-card >>> .el-card__body {
  padding: 0 !important;
  height: 100%;
  width: 100%;
}

.center-pic, .image-container {
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
  margin: 30px 0;
}

.showed-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  will-change: transform;
  object-position: center;
}

/* 上传区域 */
.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #030303;
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
  z-index: 2;
  position: relative;
}

.upload-area i {
  font-size: 60px;
  color: #3a7cbd;
  margin-bottom: 20px;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
}

/* 上传文本元素共享样式 */
.upload-text, .upload-tip {
  color: #fff;
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

/* 动态边框效果 - 简化 */
.dynamic-border {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    transparent,
    rgba(58, 123, 189, 0.3) 25%,
    rgba(58, 123, 189, 0.5) 50%,
    rgba(58, 123, 189, 0.3) 75%,
    transparent
  );
  animation: rotate-border 8s linear infinite;
  opacity: 0.3;
}

/* 角落灯光效果 */
.corner-lights {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #3a7cbd;
  border-radius: 50%;
  opacity: 0.7;
  filter: blur(3px);
  animation: corner-pulse 4s infinite alternate;
}

.top-left { top: -2px; left: -2px; animation-delay: 0s; }
.top-right { top: -2px; right: -2px; animation-delay: 1s; }
.bottom-left { bottom: -2px; left: -2px; animation-delay: 2s; }
.bottom-right { bottom: -2px; right: -2px; animation-delay: 3s; }

/* 上传图标效果 */
.pulse-icon {
  animation: icon-glow 2s infinite alternate;
}

/* 拖拽悬停效果 */
.drag-over {
  border-color: #7a8998;
  background-color: rgba(10, 32, 64, 0.5);
  box-shadow: 0 0 20px rgba(58, 139, 210, 0.6) inset, 0 0 10px rgba(86, 169, 255, 0.5);
}

.drag-over i {
  transform: scale(1.3);
  color: #6b7c8d;
}

/* 示例图片区域 */
.footer-examples {
  margin: 10px 0 15px;
  position: relative;
  z-index: 5;
}

.example-card {
  margin-bottom: 0;
  min-height: 220px;
}

.example-card >>> .el-card__body {
  padding: 10px;
  min-height: 160px;
}

.example-card >>> .el-tabs__content {
  min-height: 140px;
  display: block;
}

/* 标签页样式 */
.example-card >>> .el-tabs__item {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  font-weight: 600;
  color: #fff !important;
  background-color: #050505;
  border: 1px solid #151515;
  border-bottom: none;
  transition: all 0.3s;
  padding: 0 15px;
}

.example-card >>> .el-tabs__item:hover {
  background-color: #0a2040;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.example-card >>> .el-tabs__item.is-active {
  background-color: #0a2040;
  border-bottom-color: #56a9ff;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(86, 169, 255, 0.6);
}

/* 示例图片列表 */
.show-img-list {
  padding: 5px 0;
}

.img-item-card {
  margin-bottom: 8px;
  background-color: #030303;
  border: 1px solid #101010;
  border-radius: 2px;
  transition: all 0.25s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  height: 160px;
  cursor: pointer;
  transform: translateY(0);
}

.img-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  border-color: #3a7cbd;
}

/* 图片预览容器 */
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
  position: relative;
}

/* 悬停光效 */
.hover-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(30deg) translateY(-100%) translateX(-100%);
  transition: all 0.5s ease-in-out;
  pointer-events: none;
}

.img-item-card:hover .hover-shine {
  transform: rotate(30deg) translateY(-50%) translateX(-50%);
}

/* 图片底部信息 */
.img-item-footer {
  padding: 5px 8px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  border-top: 1px solid #1e1e1e;
  background-color: #0a2040;
  height: 30px;
  position: relative;
  z-index: 2;
  text-shadow: 0 0 8px rgba(58, 123, 189, 0.7);
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
  filter: drop-shadow(0 0 3px rgba(86, 169, 255, 0.8));
}

/* 内部元素样式 */
.img-item-card >>> .el-card__body,
.show-img {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.show-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.el-card__body {
  height: 100%;
  padding: 10px !important;
}
</style>
