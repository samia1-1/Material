<template>
  <div class="image-content">
    <div class="image-content-1">
      <div class="left-selection">
        <image-selection></image-selection>
      </div>
      <div class="center-pic" :class="{ 'dragging': isDragging, 'has-image': !!image_src }" @click="handleCenterPicClick">
        <div class="image-container" ref="imageContainer" @wheel="handleWheel" @touchstart.passive="startTouch"
          @touchmove.passive="onTouch" @touchend.passive="endTouch" @mousedown="startDrag" @mousemove="onDrag"
          @mouseup="endDrag" @mouseleave="endDrag">
          <img :src="image_src" v-if="image_src" class="showed-image" :style="imageTransformStyle">
          <div v-if="!isLoading && !image_src" class="pic-text">
            <span>点击上传一个小于10 MB的PNG或JPG图像来使用</span>
          </div>
        </div>
        <loading v-show="isLoading"></loading>
        <input type="file" id="select_files" name="input_image" @change="showSelectedImage()" />
        <div v-show="isShowStatistic" class="show-statistic">识别区域图片总区域比例：{{ statisticData }} %</div>
      </div>

      <div class="right-statistic">
        <div class="data-display-container">
          <div class="operation-buttons">
            <el-button type="default" v-for="(btn, idx) in operationButtons" :key="idx" @click="btn.handler"
              class="op-button">
              {{ btn.label }}
            </el-button>
          </div>

          <div class="data-row" v-for="(item, index) in dataFields" :key="index">
            <div class="data-label">{{ item.label }}:</div>
            <el-input v-model="item.value" :placeholder="item.placeholder || '未获取数据'" :disabled="true"
              class="data-value-input"></el-input>
          </div>

          <div class="chart-action" v-if="!isShowStatistic">
            <el-button type="primary" @click="getStatistic">查询统计数据</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="show-example">
      <div class="intro-example">可以单击我们测试集中的示例图像：</div>
      <div class="show-img-list">
        <div class="show-img-item" v-for="(item, index) in imgList" :key="index" @click="getImgChange(item)">
          <img class="show-img" :src="item.showUrl">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from "@/components/Loading/index.vue";
import ImageSelection from "./imageSelection";
import { imageMixin, apiMixin, interactionMixin } from "./mixins";

export default {
  name: "ImageContent",
  components: { Loading, ImageSelection },
  mixins: [imageMixin, apiMixin, interactionMixin],

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
        { label: 'Reset', handler: this.resetImage },
        { label: 'Zoom In', handler: this.handleZoomIn },
        { label: 'Zoom Out', handler: this.handleZoomOut },
        { label: 'Segmentation', handler: this.handleSegmentation },
        { label: 'Reduction', handler: this.handleReduction },
        { label: 'Display', handler: this.handleDisplay }
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
  },

  methods: {
    // 直接在组件中添加updateLoadingState方法，确保挂载时可用
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

    // ...existing code...
  }
};
</script>

<style scoped>
.image-content {
  width: 100%;
  position: relative;
  height:100%;
}

.image-content-1 {
  display: flex;
  justify-content: space-between;
  height: 75vh;
}

.right-statistic {
  width: 52vw;
  height: 75vh;
}

.chartContainer {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  flex-direction: row;
  padding: 10px;
}

.center-pic {
  width: 30vw;
  height: 30vw;
  border: 4px dashed rgb(216, 216, 216);
  position: relative;
  margin-top: 5vh;
}

.center-pic:hover {
  border: 4px dashed #5f5f5f;
}

.showed-image {
  max-width: 28vw;
  /* 稍微减小默认尺寸，留出操作空间 */
  max-height: 28vw;
  object-fit: contain;
  transform-origin: center;
  will-change: transform;
  /* 优化变换性能 */
  user-select: none;
  /* 防止拖动时选中图片 */
}

#select_files {
  display: none;
}

.pic-text {
  width: 30vw;
  text-align: center;
  height: 20vh;
  line-height: 0vh;
  font-size: 1.8vh;
  color: #5f5f5f;
  position: relative;
  /* 确保相对定位 */
}

/* 添加新的样式类控制文本位置 */
.pic-text span {
  position: relative;
  top: -50px;
  /* 向上移动文本，可以根据需要调整这个值 */
  display: inline-block;
  font-size: 2vh;
}

.pic-text::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  width: 12vw;
  border-top: 4px dashed rgb(148, 148, 148);
  z-index: 1;
}

.pic-text::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateY(-50%);
  height: 12vw;
  border-left: 4px dashed rgb(148, 148, 148);
  z-index: 1;
}

.center-pic:hover {
  cursor: pointer;
}

.show-statistic {
  width: auto;
  height: 50px;
  padding: 0 10px;
  line-height: 50px;
  font-size: 18px;
  color: aliceblue;
  position: absolute;
  right: 0;
  bottom: 0;
}

.show-example {
  width: 1200px;
  margin: 100px auto 0;
  border-top: 3px solid rgb(10, 47, 255);
}

.show-img-list {
  width: 1200px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.show-img-item {
  float: left;
  margin: 20px;
  display: block;
  width: 256px;
  height: 256px;
  border: 3px dashed #e2e2e2;
  box-sizing: border-box;
}

.show-img-item:hover {
  cursor: pointer;
  border: 3px dashed #5f5f5f;
}

.show-img-item img {
  width: 250px;
  height: 250px;
}

.el-empty__image {
  width: 50vh;
}

/* 新增图片容器样式，确保图片始终正确显示 */
.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  touch-action: none;
  /* 防止鼠标滚轮事件引起页面滚动 */
  overscroll-behavior: none;
  isolation: isolate;
}

/* 光标样式 */
.image-container:hover .showed-image {
  cursor: grab;
}

.image-container:active .showed-image {
  cursor: grabbing;
}

/* 优化拖拽状态下的光标样式 */
.image-container .showed-image {
  cursor: grab;
}

.image-container:active .showed-image {
  cursor: grabbing !important;
}

/* 当正在拖动时，整个容器应该表明不可点击上传 */
.center-pic.dragging {
  cursor: grabbing;
}

.center-pic {
  cursor: pointer;
}

/* 为数据输出框添加样式 */
.data-display-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  overflow-y: auto;
}

.data-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.data-label {
  width: 180px;
  text-align: right;
  padding-right: 12px;
  font-weight: bold;
  color: #606266;
}

.data-value-input {
  flex: 1;
}

.chart-action {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 为操作按钮添加样式 */
.operation-buttons {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f0f2f5;
  border-radius: 4px;
}

.op-button {
  margin: 5px;
  flex: 1;
  min-width: calc(33.33% - 10px);
  /* 每行3个按钮 */
}

/* 确保操作按钮在移动设备上也能良好显示 */
@media screen and (max-width: 768px) {
  .op-button {
    min-width: calc(50% - 10px);
    /* 在小屏幕上每行2个按钮 */
  }
}

/* 调整数据容器的样式以更好地适应新的按钮 */
.data-display-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  overflow-y: auto;
}

/* 添加有图片状态的样式 */
.center-pic.has-image {
  border-color: #1989fa;
}

/* 修改dragging状态的鼠标样式，使其更明显 */
.center-pic.dragging {
  cursor: grabbing !important;
  border-style: solid;
  border-color: #409EFF;
}

/* 修改加载样式，确保它覆盖整个区域并阻止点击 */
.center-pic .loading-component {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 10;
  pointer-events: none; /* 允许点击穿透到下面的元素 */
}

@media (hover: none) and (pointer: coarse) {
  /* 增加触摸设备特定样式 */
  .image-container {
    cursor: move;
    -webkit-user-select: none;
    user-select: none;
    touch-action: none;
  }
}

/* 优化光标样式，使用更现代的图标 */
.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  touch-action: none;
  /* 防止鼠标滚轮事件引起页面滚动 */
  overscroll-behavior: none;
  isolation: isolate;
}

/* 修改鼠标图标样式，提供更好的视觉反馈 */
.center-pic.has-image {
  border-color: #1989fa;
  cursor: default; /* 有图片时默认光标 */
}

.center-pic.has-image .image-container {
  cursor: grab; /* 有图片时容器显示grab */
}

.center-pic.has-image.dragging .image-container {
  cursor: grabbing !important; /* 拖动时显示grabbing */
}

.image-container .showed-image {
  cursor: inherit; /* 继承容器的光标样式 */
  pointer-events: none; /* 防止图片本身捕获鼠标事件 */
}

/* 当图片正在加载时阻止交互 */
.center-pic.has-image.loading .image-container {
  cursor: wait; /* 加载时显示等待光标 */
}

/* 针对Firefox的特殊处理 */
@-moz-document url-prefix() {
  .center-pic.has-image .image-container {
    cursor: -moz-grab;
  }
  .center-pic.has-image.dragging .image-container {
    cursor: -moz-grabbing !important;
  }
}

/* 修改拖动状态边框样式，使其更明显 */
.center-pic.dragging {
  cursor: grabbing !important;
  border-style: solid;
  border-color: #409EFF;
  border-width: 4px;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.5); /* 添加阴影效果 */
}/* 修改拖拽时的光标和视觉效果，与Element UI风格保持一致 */
</style>
