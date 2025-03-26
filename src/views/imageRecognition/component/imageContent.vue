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
import Tiff from "tiff.js";
import axios from "axios";
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

  methods: {
    // 覆盖handleCenterPicClick方法，确保只触发一次文件选择
    handleCenterPicClick(event) {
      // 如果正在加载或者拖拽了图片，不触发上传
      if (this.isLoading || this.dragState.wasDragged) {
        this.dragState.wasDragged = false;
        return;
      }

      // 检查是否已经有图片，如果有，可能需要确认是否替换
      if (this.image_src) {
        this.$confirm('您确定要上传新图片替换当前图片吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 用户确认后，点击隐藏的文件输入框
          document.getElementById('select_files').click();
        }).catch(() => {
          // 用户取消操作，不执行任何动作
        });
      } else {
        // 没有图片时直接点击文件输入框
        document.getElementById('select_files').click();
      }
    },

    // 修改showSelectedImage方法，确保它不会重复触发api调用或弹窗
    showSelectedImage() {
      const fileInput = document.getElementById('select_files');
      if (fileInput.files && fileInput.files[0]) {
        this.isLoading = true;

        const file = fileInput.files[0];
        // 检查文件类型和大小
        if (!['image/jpeg', 'image/png', 'image/tiff'].includes(file.type)) {
          this.$message.error('请上传JPG、PNG或TIFF格式的图片');
          this.isLoading = false;
          fileInput.value = ''; // 清空文件输入框
          return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
          this.$message.error('图片大小不能超过10MB');
          this.isLoading = false;
          fileInput.value = ''; // 清空文件输入框
          return;
        }

        // 处理文件上传逻辑
        this.processUploadedFile(file);
      }
    },

    // 添加处理上传文件的方法，避免重复逻辑
    processUploadedFile(file) {
      // 根据文件类型进行不同处理
      if (file.type === 'image/tiff') {
        // 处理TIFF文件
        const reader = new FileReader();
        reader.onload = (e) => {
          this.getTiffDataUrlHandler(e.target.result);

          // TIFF处理完成后直接进行分析
          setTimeout(() => {
            if (this.image_src) {
              // 准备表单数据用于API调用
              this.prepareFormData(file);
              this.clickStatistic(false);
            }
          }, 500);
        };

        reader.onerror = () => {
          this.handleTiffError('读取文件时发生错误');
        };

        reader.readAsArrayBuffer(file);
      } else {
        // 处理JPG/PNG文件
        const reader = new FileReader();
        reader.onload = (e) => {
          this.image_src = e.target.result;
          this.originalImageSrc = e.target.result;

          // 重置图片变换
          this.resetImage();

          // 准备表单数据用于API调用
          this.prepareFormData(file);

          this.isLoading = false;

          // 直接对图片进行处理，无需确认对话框
          this.clickStatistic(false);
        };
        reader.readAsDataURL(file);
      }

      // 清空文件输入，以便用户可以上传相同的文件
      document.getElementById('select_files').value = '';
    },

    // 准备表单数据
    prepareFormData(file) {
      this.form_data = new FormData();
      this.form_data.append('image', file);
    },

    // 添加或修复 getTiffDataUrlHandler 方法
    getTiffDataUrlHandler(tiffData) {
      try {
        this.isLoading = true;

        // 如果传入的是URL字符串，需要先获取二进制数据
        if (typeof tiffData === 'string' && tiffData.startsWith('http')) {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', tiffData, true);
          xhr.responseType = 'arraybuffer';

          xhr.onload = () => {
            if (xhr.status === 200) {
              this.processTiffArrayBuffer(xhr.response);
            } else {
              this.handleTiffError(`Failed to load TIFF: ${xhr.statusText}`);
            }
          };

          xhr.onerror = () => {
            this.handleTiffError('Network error occurred when trying to load TIFF file');
          };

          xhr.send();
        } else {
          // 如果已经是ArrayBuffer，直接处理
          this.processTiffArrayBuffer(tiffData);
        }
      } catch (error) {
        this.handleTiffError(`Error processing TIFF: ${error.message}`);
      }
    },

    // 处理TIFF ArrayBuffer数据
    processTiffArrayBuffer(arrayBuffer) {
      try {
        // 使用Tiff.js解析TIFF数据
        const tiff = new Tiff({ buffer: arrayBuffer });

        // 获取TIFF图像的宽度和高度
        const width = tiff.width();
        const height = tiff.height();

        // 创建Canvas元素并设置尺寸
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // 将TIFF渲染到Canvas
        tiff.render(canvas);

        // 将Canvas转换为base64数据URL
        const dataUrl = canvas.toDataURL('image/png');

        // 更新图像源
        this.image_src = dataUrl;
        this.originalImageSrc = dataUrl;

        // 重置图像变换
        this.resetImage();

        // 完成加载
        this.isLoading = false;

        // 释放Tiff对象资源
        tiff.close();

        console.log('TIFF successfully converted to PNG');
        return dataUrl;
      } catch (error) {
        this.handleTiffError(`Failed to process TIFF data: ${error.message}`);
        return null;
      }
    },

    // 处理TIFF错误
    handleTiffError(message) {
      console.error(message);
      this.$message.error('TIFF处理失败：' + message);
      this.isLoading = false;
    },

    // 修改clickStatistic方法，实现与原代码相似的逻辑
    clickStatistic(transPic) {
      this.isShowStatistic = false;
      this.isLoading = true;

      if (transPic === true) {
        // 处理会话存储中的URL
        let formdata = new FormData();
        let tiff_url = sessionStorage.getItem("url");
        if (tiff_url) {
          // 处理URL格式，与原代码保持一致
          let regex = /\/images\/(\d+)\/(\w+)\/(.+)/;
          if (regex.test(tiff_url)) {
            tiff_url = tiff_url.replace(regex, '$1\\$2\\$3');
          }
          formdata.append("image", tiff_url);

          // 调用URL上传接口
          this.uploadImageByUrl(formdata);
        } else {
          this.isLoading = false;
          this.$message.error('会话存储中没有有效的图片URL');
        }
      } else {
        // 处理直接上传的文件
        if (!this.form_data) {
          this.isLoading = false;
          this.$message.error('没有选择图片');
          return;
        }

        // 调用文件上传接口
        this.uploadImageByFile(this.form_data);
      }
    },

    // 添加URL上传处理方法
    uploadImageByUrl(formdata) {
      // 获取认证信息和请求配置
      const config = this.getRequestConfig();

      // 使用URL上传接口
      axios.post("http://146.56.214.208:8100/image_recognition/updateAvatarUrl2", formdata, config)
        .then(async(response) => {
          const data = await response.data;
          this.handleApiResponse(data);
        })
        .catch(error => {
          this.handleApiError(error);
        });
    },

    // 添加文件上传处理方法
    uploadImageByFile(formData) {
      // 获取认证信息和请求配置
      const config = this.getRequestConfig();

      // 使用文件上传接口
      axios.post("http://146.56.214.208:8100/image_recognition/updateAvatarUrl", formData, config)
        .then(response => {
          this.handleApiResponse(response.data);
          // 清除会话存储中的URL
          sessionStorage.removeItem("url");
        })
        .catch(error => {
          this.handleApiError(error);
        });
    },

    // 添加请求配置获取方法
    getRequestConfig() {
      return {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: "Bearer " + this.getToken()
        }
      };
    },

    // 添加API响应处理方法
    handleApiResponse(data) {
      if (!data || data.code !== 200 || data.base64 === "预测出错：(str(e)") {
        this.$message.error('预测出错，请上传重试');
        this.isLoading = false;
        this.image_src = "";
        return;
      }

      // 更新图像和统计数据
      this.isLoading = false;
      this.image_src = "data:image/png;base64," + data.base64;
      // 移除可能的换行符
      this.image_src = this.image_src.replace(/[\r\n]/g, "");
      this.isShowStatistic = true;

      // 计算并显示统计数据
      if (data.are_sum_bfb !== undefined) {
        this.statisticData = (data.are_sum_bfb * 100).toFixed(2);
      }

      // 处理图表数据（如果实现了相关函数）
      if (typeof this.processChartData === 'function') {
        this.processChartData(data);
      }
    },

    // 添加API错误处理方法
    handleApiError(error) {
      console.error('API请求失败:', error);
      this.$message.error('出现未知错误，请刷新后重试');
      this.isLoading = false;
    },

    // 获取认证Token的方法（如果mixins中没有提供）
    getToken() {
      // 如果mixins中已提供getToken，可以移除此方法
      return sessionStorage.getItem('token') || localStorage.getItem('token') || '';
    },

    // 更新示例图片切换方法
    getImgChange(item) {
      // 检查当前图片是否为原始图片
      if (item.showUrl === item.imgUrl) {
        // 切换到处理后的图片
        item.showUrl = item.img_edUrl;
      } else {
        // 切换回原始图片
        item.showUrl = item.imgUrl;
      }
    }
  },

  beforeDestroy() {
    // 清理可能的内存泄漏
    if (this.image_src && this.image_src.startsWith('blob:')) {
      URL.revokeObjectURL(this.image_src);
    }
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
</style>
