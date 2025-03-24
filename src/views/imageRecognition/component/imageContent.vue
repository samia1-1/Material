<template>
  <div class="image-content">
    <div class="image-content-1">
      <div class="left-selection">
        <image-selection></image-selection>
      </div>
      <div class="center-pic" :class="{ 'dragging': isDragging }" @click="handleCenterPicClick">
        <div class="image-container" ref="imageContainer" @wheel="handleWheel" @mousedown="startDrag"
          @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag">
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
import { getImageRecognition } from "@/api/imageRecognition/imageRecognition.js";
import Loading from "@/components/Loading/index.vue";
import ImageSelection from "./imageSelection";
import Tiff from "tiff.js";
import axios from "axios";
import { getToken } from "@/utils/auth";

export default {
  components: { Loading, ImageSelection },
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
        threshold: 5
      },
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
        { label: 'Upload', handler: this.imgUpload },
        { label: 'Zoom In', handler: this.handleZoomIn },
        { label: 'Zoom Out', handler: this.handleZoomOut },
        { label: 'Segmentation', handler: this.handleSegmentation },
        { label: 'Reduction', handler: this.handleReduction },
        { label: 'Display', handler: this.handleDisplay }
      ];
    }
  },
  methods: {
    // 处理中心图片区域点击事件
    handleCenterPicClick(event) {
      if (this.dragState.wasDragged) return;
      this.imgUpload();
    },

    // 上传图片
    imgUpload() {
      document.getElementById("select_files").click();
    },

    // 切换示例图片
    getImgChange(item) {
      item.showUrl = item.showUrl === item.imgUrl ? item.img_edUrl : item.imgUrl;
    },

    // 显示选中的图片
    showSelectedImage() {
      const fileInput = document.getElementById("select_files");
      const file = fileInput.files[0];

      if (!file) {
        this.showMessage("请正确上传数据", "warning");
        return;
      }

      this.originalImageSrc = this.image_src;
      sessionStorage.removeItem("url");
      this.image_src = URL.createObjectURL(file);
      this.form_data = file;
      this.resetDataFields();
      this.resetImageTransform();
    },

    // 获取统计数据
    getStatistic() {
      if (!this.form_data) {
        if (sessionStorage.getItem("url") !== null) {
          this.clickStatistic(true);
          return;
        }
        this.showMessage("请先上传图片", "warning");
        return;
      }
      this.clickStatistic(false);
    },

    // 处理统计请求
    clickStatistic(transPic) {
      this.isLoading = true;
      this.originalImageSrc = this.image_src;

      // 配置请求头
      const config = {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: "Bearer " + getToken(),
        },
      };

      // 处理错误
      const handleError = (error) => {
        console.error("请求出错:", error);
        this.showMessage("网络请求失败，已恢复原始图片", "error");
        this.image_src = this.originalImageSrc;
        this.isLoading = false;
      };

      if (transPic) {
        let tiff_url = sessionStorage.getItem("url");
        if (!tiff_url) {
          this.showMessage("没有找到图片数据，请重新上传", "warning");
          this.isLoading = false;
          return;
        }

        let regex = /\/images\/(\d+)\/(\w+)\/(.+)/;
        tiff_url = tiff_url.replace(regex, '\$1\\\$2\\\$3');

        let formdata = new FormData();
        formdata.append("image", tiff_url);

        axios.post("http://146.56.214.208:8100/image_recognition/updateAvatarUrl2", formdata, config)
          .then(response => this.processResponse(response.data))
          .catch(handleError);
      } else {
        if (!this.form_data) {
          this.showMessage("没有找到图片数据，请重新上传", "warning");
          this.isLoading = false;
          return;
        }

        let formdata = new FormData();
        formdata.append("image", this.form_data);

        axios.post("http://146.56.214.208:8100/image_recognition/updateAvatarUrl", formdata, config)
          .then(response => {
            this.processResponse(response.data);
            sessionStorage.removeItem("url");
          })
          .catch(handleError);
      }
    },

    // 将tiff图片转换为png的base64编码
    getTiffDataUrlHandler(url) {
      this.originalImageSrc = this.image_src;

      const xhr = new XMLHttpRequest();
      xhr.responseType = "arraybuffer";
      xhr.open("GET", url);

      xhr.onload = () => {
        try {
          const tiff = new Tiff({ buffer: xhr.response });
          const canvas = tiff.toCanvas();

          this.$nextTick(() => {
            this.image_src = canvas.toDataURL();
            this.isLoading = false;
          });
        } catch (error) {
          console.error("处理TIFF图片时出错:", error);
          this.showMessage("处理图片出错，请重试", "error");
          this.isLoading = false;
        }
      };

      xhr.onerror = () => {
        this.showMessage("加载图片失败，请重试", "error");
        this.isLoading = false;
      };

      xhr.send();
    },

    // 处理API响应
    processResponse(data) {
      if (!data || data.base64 === "预测出错：(str(e)" || data.code === 500) {
        this.showMessage("处理图片出错，请重试", "error");
        this.isLoading = false;
        return;
      }

      try {
        const base64Data = data.base64.replace(/[\r\n]/g, "");
        const newImageSrc = "data:image/png;base64," + base64Data;

        this.$nextTick(() => {
          this.image_src = newImageSrc;
          this.isShowStatistic = true;
          this.statisticData = (data.are_sum_bfb * 100).toFixed(2);
          this.updateDataFields(data);
          this.isLoading = false;
        });
      } catch (error) {
        console.error("处理响应数据时出错:", error);
        this.showMessage("处理数据时出错，已恢复原始图片", "error");
        this.image_src = this.originalImageSrc;
        this.isLoading = false;
      }
    },

    // 更新数据字段
    updateDataFields(data) {
      const fields = [
        { key: 'coordinates', index: 0, format: v => v },
        { key: 'are_sum_bfb', index: 1, format: v => (v * 100).toFixed(2) + '%' },
        { key: 'circularity', index: 2, format: v => v },
        { key: 'minimumccd', index: 3, format: v => v },
        { key: 'maximumicd', index: 4, format: v => v },
        { key: 'equalAreaCircleDiam', index: 5, format: v => v },
        { key: 'mbrWidth', index: 6, format: v => v },
        { key: 'mbrHeight', index: 7, format: v => v },
        { key: 'category', index: 8, format: v => v },
      ];

      fields.forEach(field => {
        if (data[field.key] !== undefined) {
          this.dataFields[field.index].value = field.format(data[field.key]);
        }
      });
    },

    // 重置数据字段
    resetDataFields() {
      this.dataFields.forEach(field => {
        field.value = '';
      });
      this.isShowStatistic = false;
    },

    // 重置图片变换
    resetImageTransform() {
      this.imageTransform = {
        ...this.imageTransform,
        scale: 1,
        translateX: 0,
        translateY: 0
      };

      this.dragState = {
        ...this.dragState,
        isDragging: false,
        wasDragged: false,
        lastTranslateX: 0,
        lastTranslateY: 0,
        distance: 0
      };
    },

    // 放大图片
    handleZoomIn() {
      if (!this.image_src) {
        this.showMessage("请先上传图片", "warning");
        return;
      }

      const { scale, maxScale } = this.imageTransform;
      this.imageTransform.scale = Math.min(maxScale, scale + 0.2);
    },

    // 缩小图片
    handleZoomOut() {
      if (!this.image_src) {
        this.showMessage("请先上传图片", "warning");
        return;
      }

      const { scale, minScale } = this.imageTransform;
      this.imageTransform.scale = Math.max(minScale, scale - 0.2);
    },

    // 图像分割
    handleSegmentation() {
      if (!this.image_src) {
        this.showMessage("请先上传图片", "warning");
        return;
      }
      this.showMessage("正在执行图像分割", "info");
    },

    // 图像降维
    handleReduction() {
      if (!this.image_src) {
        this.showMessage("请先上传图片", "warning");
        return;
      }
      this.showMessage("正在执行降维处理", "info");
    },

    // 显示处理结果
    handleDisplay() {
      if (!this.image_src) {
        this.showMessage("请先上传图片", "warning");
        return;
      }
      this.getStatistic();
    },

    // 显示消息
    showMessage(message, type = "info") {
      this.$message({
        message,
        type
      });
    },

    // 处理鼠标滚轮事件
    handleWheel(event) {
      if (!this.image_src) return;
      event.preventDefault();

      const { scale, minScale, maxScale } = this.imageTransform;
      const { translateX, translateY } = this.imageTransform;

      // 计算新的缩放比例
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));

      // 计算鼠标在图片上的相对位置
      const rect = this.$refs.imageContainer.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // 计算新的平移位置，保持鼠标指向的图片点不变
      const scaleRatio = newScale / scale;
      const newTranslateX = mouseX - (mouseX - translateX) * scaleRatio;
      const newTranslateY = mouseY - (mouseY - translateY) * scaleRatio;

      // 更新状态
      this.imageTransform = {
        ...this.imageTransform,
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY
      };
    },

    // 开始拖动
    startDrag(event) {
      if (!this.image_src) return;

      this.dragState = {
        ...this.dragState,
        isDragging: true,
        wasDragged: false,
        distance: 0,
        startX: event.clientX,
        startY: event.clientY,
        lastTranslateX: this.imageTransform.translateX,
        lastTranslateY: this.imageTransform.translateY
      };

      event.preventDefault();
    },

    // 拖动中
    onDrag(event) {
      if (!this.dragState.isDragging) return;

      const { startX, startY, lastTranslateX, lastTranslateY, threshold } = this.dragState;

      // 计算拖动距离
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 更新拖动状态
      this.dragState.distance = distance;
      this.dragState.wasDragged = distance > threshold;

      // 更新图片位置
      this.imageTransform.translateX = event.clientX - startX + lastTranslateX;
      this.imageTransform.translateY = event.clientY - startY + lastTranslateY;

      event.preventDefault();
    },

    // 结束拖动
    endDrag() {
      this.dragState.isDragging = false;

      // 添加延时，确保点击事件能正确判断
      setTimeout(() => {
        this.dragState.wasDragged = false;
      }, 50);
    }
  },
  created() {
    const tempUrl = sessionStorage.getItem("url");
    if (tempUrl !== null) {
      this.isLoading = true;
      this.getTiffDataUrlHandler(tempUrl);
    }
  }
};
</script>

<style scoped>
.image-content {
  width: 100%;
  position: relative;
}

/* .image-tit {
  height: 60px;
  line-height: 60px;
  font-size: 40px;
  text-align: center;
  margin: 80px 0 20px;
} */

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
  /* 防止触摸设备上的默认行为干扰自定义手势 */
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
</style>
