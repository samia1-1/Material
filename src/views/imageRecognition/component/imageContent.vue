<template>
  <div class="image-content">
    <el-container class="main-container">
      <!-- 左侧边栏：操作按钮和数据显示区域 -->
      <el-aside width="320px" class="left-sidebar">
        <!-- 操作按钮区域 -->
        <el-card class="operation-card">
          <div slot="header" class="card-header">
            <span><i class="el-icon-s-tools"></i> 操作面板</span>
          </div>
          <div class="operation-buttons">
            <el-button
              v-for="(btn, idx) in operationButtons"
              :key="idx"
              @click="btn.handler"
              :type="btn.type || 'default'"
              :icon="btn.icon"
              class="op-button">
              {{ btn.label }}
            </el-button>
          </div>
        </el-card>

        <!-- 数据显示区域 -->
        <el-card class="data-card">
          <div slot="header" class="card-header">
            <span><i class="el-icon-data-analysis"></i> 数据分析</span>
            <el-button v-if="!isShowStatistic" type="text" @click="getStatistic" icon="el-icon-refresh">
              刷新
            </el-button>
          </div>
          <el-form label-position="top" size="small" class="data-form">
            <el-form-item v-for="(item, index) in dataFields" :key="index" :label="item.label">
              <el-input v-model="item.value" :placeholder="item.placeholder || '未获取数据'" :disabled="true">
              </el-input>
            </el-form-item>
          </el-form>
          <div class="chart-action" v-if="!isShowStatistic">
            <el-button type="primary" @click="getStatistic" icon="el-icon-data-analysis" style="width: 100%">
              查询统计数据
            </el-button>
          </div>
        </el-card>
      </el-aside>

      <!-- 主内容区：图片显示 -->
      <el-main class="main-content">
        <el-card class="image-card" shadow="hover">
          <div class="center-pic" :class="{ 'dragging': isDragging, 'has-image': !!image_src }" @click.stop="handleCenterPicClick">
            <div class="image-container" ref="imageContainer" @wheel="handleWheel" @touchstart.passive="startTouch"
              @touchmove.passive="onTouch" @touchend.passive="endTouch" @mousedown="startDrag" @mousemove="onDrag"
              @mouseup="endDrag" @mouseleave="endDrag">
              <img :src="image_src" v-if="image_src" class="showed-image" :style="imageTransformStyle">
              <div v-if="!isLoading && !image_src" class="upload-placeholder">
                <!-- 修改上传组件，增加拖拽功能 -->
                <div class="upload-area"
                  @click.stop="triggerUpload"
                  @dragover.prevent="handleDragOver"
                  @dragleave.prevent="handleDragLeave"
                  @drop.prevent="handleDrop"
                  :class="{'drag-over': isDragOver}">
                  <i class="el-icon-upload"></i>
                  <div class="upload-text">点击上传图片或拖拽到此处</div>
                  <div class="upload-tip">支持PNG、JPG、TIFF格式，最大10MB</div>
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

    <!-- 将示例图片区域移到页脚部分 -->
    <div class="footer-examples">
      <el-card class="example-card" shadow="hover">
        <div slot="header" class="card-header">
          <span><i class="el-icon-picture"></i> 示例图片</span>
          <el-tooltip content="点击图片查看处理前后对比效果" placement="top">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
        <div class="show-img-list">
          <el-row :gutter="20">
            <el-col :xs="8" :sm="6" :md="4" :lg="4" :xl="3"
              v-for="(item, index) in imgList" :key="index">
              <el-card
                :body-style="{ padding: '0px' }"
                shadow="hover"
                class="img-item-card"
                @click.native="loadExampleImage(item)">
                <img :src="item.imgUrl" class="show-img">
                <div class="img-item-footer">
                  <span>示例 {{index + 1}}</span>
                  <i class="el-icon-picture-outline-round"></i>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      type="file"
      ref="fileInput"
      style="display:none"
      accept="image/jpeg,image/png,image/tiff"
      @change="handleNativeFileChange"
    />
  </div>
</template>

<script>
import Loading from "@/components/Loading/index.vue";
import { imageMixin, apiMixin, interactionMixin, uploadMixin } from "./mixins";

export default {
  name: "ImageContent",
  components: { Loading },
  mixins: [imageMixin, apiMixin, interactionMixin, uploadMixin],

  data() {
    return {
      imgList: [
        {
          imgUrl: require("@/assets/images/img/0500_0500_164.jpg"),
          img_edUrl: require("@/assets/images/img/img_ed/0500_0500_164.jpg"),
          showUrl: require("@/assets/images/img/0500_0500_164.jpg"),
        },
        {
          imgUrl: require("@/assets/images/img/0500_0900_164.jpg"),
          showUrl: require("@/assets/images/img/0500_0900_164.jpg"),
          img_edUrl: require("@/assets/images/img/img_ed/0500_0900_164.jpg"),
        },
        {
          imgUrl: require("@/assets/images/img/0500_1000_164.jpg"),
          showUrl: require("@/assets/images/img/0500_1000_164.jpg"),
          img_edUrl: require("@/assets/images/img/img_ed/0500_1000_164.jpg"),
        },
        {
          imgUrl: require("@/assets/images/img/0550_0700_164.jpg"),
          showUrl: require("@/assets/images/img/0550_0700_164.jpg"),
          img_edUrl: require("@/assets/images/img/img_ed/0550_0700_164.jpg"),
        },
        {
          imgUrl: require("@/assets/images/img/0550_0800_164.jpg"),
          showUrl: require("@/assets/images/img/0550_0800_164.jpg"),
          img_edUrl: require("@/assets/images/img/img_ed/0550_0800_164.jpg"),
        },
        {
          imgUrl: require("@/assets/images/img/0550_0950_164.jpg"),
          showUrl: require("@/assets/images/img/0550_0950_164.jpg"),
          img_edUrl: require("@/assets/images/img/img_ed/0550_0950_164.jpg"),
        },
        {
          imgUrl: require("@/assets/images/img/0550_1000_164.jpg"),
          showUrl: require("../../../assets/images/img/0550_1000_164.jpg"),
          img_edUrl: require("@/assets/images/img/img_ed/0550_1000_164.jpg"),
        },
      ],
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
        { label: 'Minimumccd', value: '', placeholder: '点击查询后显示' },
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
      }
    };
  },

  computed: {
    // 计算图片的变换样式
    imageTransformStyle() {
      const { scale, translateX, translateY } = this.imageTransform;
      return {
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        transition: this.dragState.isDragging ? 'none' : 'transform 0.1s ease-out',
        cursor: this.dragState.isDragging ? 'grabbing' : 'grab'
      };
    },

    // 拖拽状态
    isDragging() {
      return this.dragState.isDragging;
    },

    // 操作按钮配置
    operationButtons() {
      return [
        { label: '上传图片', handler: this.imgUpload, icon: 'el-icon-upload', type: 'primary' },
        { label: '重置图片', handler: this.resetImage, icon: 'el-icon-refresh-left', type: 'danger' },
        { label: '放大', handler: this.handleZoomIn, icon: 'el-icon-zoom-in', type: 'info' },
        { label: '缩小', handler: this.handleZoomOut, icon: 'el-icon-zoom-out', type: 'info' },
        { label: '图像分割', handler: this.handleSegmentation, icon: 'el-icon-crop', type: 'success' },
        { label: '降维处理', handler: this.handleReduction, icon: 'el-icon-s-operation', type: 'info' },
        { label: '显示分析', handler: this.handleDisplay, icon: 'el-icon-view', type: 'primary' }
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

    // 更新加载状态
    updateLoadingState() {
      const centerPic = this.$el && this.$el.querySelector('.center-pic');
      if (centerPic) {
        // 根据加载状态设置属性
        if (this.isLoading) {
          centerPic.setAttribute('loading', 'true');
        } else {
          centerPic.removeAttribute('loading');
        }
      }
    },

    // 添加新方法：加载示例图片到主图片区域
    loadExampleImage(item) {
      // 只有当已有图片时才执行重置
      if (this.image_src) {
        this.resetImage();
      }

      // 显示加载状态
      this.isLoading = true;

      // 直接加载示例图片
      this.fetchImageAsBlob(item.imgUrl)
        .then(blob => {
          // 创建URL并设置图片
          const url = URL.createObjectURL(blob);
          this.image_src = url;

          // 创建文件对象
          const imageFile = new File([blob], `example-${Date.now()}.jpg`, { type: 'image/jpeg' });
          this.form_data = imageFile;

          // 处理图片
          this.processWithFileUploadAPI(imageFile);
        })
        .catch(error => {
          console.error('加载示例图片失败:', error);
          this.showMessage('无法加载示例图片', 'error');
          this.isLoading = false;
        });
    }
  }
};
</script>

<style scoped>
.image-content {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  margin:10px 30px;
}

/* 整体布局 */
.main-container {
  display: flex;
  margin: 20px 0 0 0;
  margin-left: 0 ! important;/* 移除左边距 */
  padding: 0; /* 确保没有内边距 */
}

/* 左侧边栏 */
.left-sidebar {
  background-color: #f5f7fa;
  border-right: 1px solid #e6e6e6;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  height: calc(100% - 50px); /* 减去内边距 */
}

/* 卡片通用样式 */
.operation-card, .data-card, .image-card, .example-card {
  margin-bottom: 15px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: bold;
  font-size: 16px;
}

/* 操作按钮区域 */
.operation-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 修改为两列布局 */
  gap: 10px;
}

/* 修复按钮样式问题 */
.op-button {
  width: 100% !important;
  height: 42px; /* 增加高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px; /* 稍微增加内边距 */
  margin: 3px 0; /* 调整垂直边距 */
  font-size: 14px; /* 增加字体大小 */
  border-radius: 20px; /* 使按钮更圆润 */
  font-weight: 500; /* 使文字更加醒目 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加轻微阴影增强视觉效果 */
  transition: all 0.3s; /* 平滑过渡效果 */
}

.op-button:hover {
  transform: translateY(-2px); /* 悬停时轻微上浮效果 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.op-button i {
  margin-right: 6px; /* 增加图标和文字的间距 */
  font-size: 18px; /* 增加图标大小 */
}

/* 确保最后一个按钮也有相同的样式 */
.operation-buttons .op-button:last-child {
  grid-column: span 2; /* 最后一个按钮占据两列 */
  height: 42px; /* 保持一致的高度 */
  border-radius: 20px; /* 保持一致的圆角 */
}

/* 数据表单 */
.data-form {
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 5px;
}

.data-form .el-form-item {
  margin-bottom: 10px;
}

/* 主内容区 */
.main-content {
  padding: 15px;
  background-color: #fff;
  display: flex;
  align-items: stretch;
}

/* 图片卡片区域 - 使其填充整个主内容区 */
.image-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
  height: 100%;
  padding: 30px;
}

/* 图片区域 - 使其填充卡片 */
.center-pic {
  width: 100%;
  height: 100%;
  min-height: 500px; /* 最小高度确保在内容少时也有合理显示 */
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.center-pic:hover {
  border-color: #409EFF;
}

.center-pic.has-image {
  border-style: solid;
  border-color: #67C23A;
}

.center-pic.dragging {
  cursor: grabbing !important;
  border-color: #E6A23C;
  box-shadow: 0 0 15px rgba(230, 162, 60, 0.3);
}

/* 图片样式 */
.image-container {
  width: 100%;
  height: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px;
  overflow: hidden;
}

.showed-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform-origin: center;
  will-change: transform;
  user-select: none;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.1));
}

/* 上传占位符样式 */
.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 上传区域拖拽样式 */
.upload-area.drag-over {
  border-color: #409EFF;
  background-color: rgba(64, 158, 255, 0.06);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
  transform: scale(1.02);
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  width: 80%;
  max-width: 500px;
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.upload-area:hover {
  border-color: #409EFF;
  background-color: rgba(64, 158, 255, 0.02);
}

.upload-area i {
  font-size: 64px;
  color: #409EFF;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.upload-area:hover i,
.upload-area.drag-over i {
  transform: translateY(-5px);
}

.upload-text {
  font-size: 18px;
  color: #303133;
  margin-bottom: 12px;
  font-weight: 500;
}

.upload-tip {
  font-size: 14px;
  color: #909399;
  text-align: center;
}

/* 统计数据显示 */
.show-statistic {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 5px;
  z-index: 2;
}

/* 页脚示例图片区域 */
.footer-examples {
  width: 100%;
  margin-top: 20px;
}

/* 示例图片区域 */
.show-img-list {
  padding: 10px 0;
}

.img-item-card {
  margin-bottom: 15px;
  transition: transform 0.3s;
  cursor: pointer;
}

.img-item-card:hover {
  transform: translateY(-5px);
}

.show-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-item-footer {
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media screen and (max-width: 992px) {
  .main-container {
    flex-direction: column;
  }

  .left-sidebar {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid #e6e6e6;
  }

  .operation-buttons {
    grid-template-columns: repeat(3, 1fr); /* 在中等屏幕上改为三列 */
  }

  .operation-buttons .op-button:last-child {
    grid-column: span 3; /* 在中等屏幕上最后一个按钮占据三列 */
  }

  .center-pic {
    min-height: 400px;
  }
}

@media screen and (max-width: 768px) {
  .operation-buttons {
    grid-template-columns: repeat(2, 1fr); /* 在小屏幕上保持两列 */
  }

  .operation-buttons .op-button:last-child {
    grid-column: span 2; /* 在小屏幕上最后一个按钮占据两列 */
  }

  .center-pic {
    min-height: 300px;
  }
}
</style>
