<template>
  <div class="image-content">
    <form id="myform">
      <div
        id="title"
        class="title"
      >
        <h1>微观组织相识别</h1>
      </div>

      <div class="intro">
        请上传一个小于10 MB的PNG或JPG图像来使用
      </div>

      <div class="container">
        <div
          class="box"
          id="select-picture-box"
        >
          <canvas
            id="image_canvas"
            height="500"
            width="500"
            @click="imgUpload()"
          ></canvas>
          <div class="button-wrapper">
            <a
              href="javascript:void(0)"
              class="blue-button"
            >选择检测图片</a>
            <input
              type="file"
              value="选择检测图片"
              size="20"
              id="select_files"
              name="input_image"
              @change="showSelectedImage()"
            />
          </div>
        </div>
        <div class="box">
          <img v-show="isImg" :src="img_src" >
          <!-- <canvas
            id="image_canvas_out"
            height="500"
            width="500"
          ></canvas> -->
          <div class="button-wrapper2">
            <a
              href="javascript:void(0)"
              class="blue-button"
            >检测预测</a>
            <input
              type="submit"
              class="button-new"
              value="检测预测"
            />
          </div>
        </div>
      </div>

      <div class="loading">
        <svg
          width="64px"
          height="48px"
        >
          <polyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            id="back"
          ></polyline>
          <polyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            id="front"
          ></polyline>
        </svg>
      </div>

    </form>

    <div class="statistic-show">
      <div class="blank" v-if="!isData">
        请先选择图片进行预测
      </div>
      <div class="statistic" v-else>
        <div class="statistic-tit">统计数据：</div>
        <div class="statistic-item">{{this.statistic}}</div>
      </div>
    </div>

    <div class="show-example">
      <div class="intro-example">可以单击我们测试集中的示例图像：</div>
      <div class="show-img-list">

        <div class="show-img-item"
          v-for="(item,index) in imgList"
          :key="index"
          @click="getImgChange(item)"
        >
          <!-- <div>{{item}}</div> -->
          <img
            class="show-img"
            :src="item.showUrl"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getImageRecognition } from "@/api/imageRecognition/imageRecognition.js";
export default {
  data() {
    return {
      files: undefined,
      isImg:false,
      img_src:'',
      isData:false,
      statistic:[],
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
    };
  },
  methods: {
    showSelectedImage() {
      // console.log(document.getElementById("select_files").target);
      this.files = document.getElementById("select_files").files[0];
      // console.log("this.files", this.files);
      // 清空右侧框内容
      // var canvas_out = document.getElementById("image_canvas_out");
      // var ctx_out = canvas_out.getContext("2d");
      // ctx_out.clearRect(0, 0, canvas_out.width, canvas_out.height);
      // 居中显示“待提交预测”
      // ctx_out.font = "20px Arial";
      // ctx_out.textAlign = "center";
      // ctx_out.fillText(
      //   "待提交预测",
      //   canvas_out.width / 2,
      //   canvas_out.height / 2
      // );

      var selected_files = document.getElementById("select_files").files;
      for (var file of selected_files) {
        // console.log("asdasdasadas" + file.webkitRelativePath);
        /// read file content.
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
          var img = new Image();
          img.src = this.result;
          img.onload = function () {
            var canvas = document.getElementById("image_canvas");
            var cxt = canvas.getContext("2d");
            var scaleFactor = Math.min(500 / this.width, 500 / this.height);
            var scaledWidth = this.width * scaleFactor;
            var scaledHeight = this.height * scaleFactor;
            var x = (500 - scaledWidth) / 2;
            var y = (500 - scaledHeight) / 2;
            cxt.drawImage(img, x, y, scaledWidth, scaledHeight);
          };
        };
      }
    },
    processImage() {
      document
        .getElementById("myform")
        .addEventListener("submit", function (e) {
          e.preventDefault(); // 阻止表单默认的提交行为
          var selected_files = document.getElementById("select_files").files[0];
          // console.log(selected_files);
        });

      // var formData = new FormData();
      // formData.append("input_image", this.files);
      // console.log(this.files);
      // console.log(formData);
      const reader = new FileReader();
      let aa = this;
      reader.onload = function (event) {
        const base64Data = event.target.result;
        // console.log(base64Data);
        let loading = document.getElementsByClassName("loading")[0]
        loading.style = "display:block;";
        // 将base64Data发送给后端
        getImageRecognition({ base64: base64Data })
          // .then((response) => response.json())
          .then((data) => {
            // console.log(typeof data)
            // console.log(data)
            aa.isImg = true;
            aa.img_src = 'data:image/png;base64,' + data.data1;
            aa.img_src = aa.img_src.replace(/[\r\n]/g,"")
            aa.isData = true;
            console.log(data)
            aa.statistic = data.data2
            // this.imgSRC = 1;
            // const img = new Image();
            // console.log(data.data);
            // img.src = "data:image/jepg;base64," + data.data.image_path;
            // img.onload = function () {
            //   var canvas = document.getElementById("image_canvas_out");
            //   var cxt = canvas.getContext("2d");
            //   var scaleFactor = Math.min(500 / this.width, 500 / this.height);
            //   var scaledWidth = this.width * scaleFactor;
            //   var scaledHeight = this.height * scaleFactor;
            //   var x = (500 - scaledWidth) / 2;
            //   var y = (500 - scaledHeight) / 2;
            //   cxt.drawImage(img, x, y, scaledWidth, scaledHeight);
            // };
            loading.style = "display:none;";
          })
          .catch((err) => {
            console.log(err)
            loading.style = "display:none;";
          } );
      };
      reader.readAsDataURL(document.getElementById("select_files").files[0]);
    },
    getImgChange(item) {
      if (item.showUrl === item.imgUrl) {
        item.showUrl = item.img_edUrl;
      } else {
        item.showUrl = item.imgUrl;
      }
    },
    imgUpload() {
      const uploadInput = document.getElementById("select_files");
      uploadInput.click();
    },
    op() {
      const canvas = document.getElementById("image_canvas");
      const ctx = canvas.getContext("2d");
      // 设置字体样式
      // ctx.font = "20px Arial";
      // ctx.textAlign = "center";
      // ctx.textBaseline = "middle";
      // 获取画布宽度和高度
      // const canvasWidth = canvas.width;
      // const canvasHeight = canvas.height;
      // 在画布中心位置绘制文本
      // ctx.fillText("请选择图片", canvasWidth / 2, canvasHeight / 2);

      // const canvasOut = document.getElementById("image_canvas_out");
      // const ctxOut = canvasOut.getContext("2d");
      // ctxOut.font = "20px Arial";
      // ctxOut.textAlign = "center";
      // ctxOut.textBaseline = "middle";
      // const canvasOutWidth = canvasOut.width;
      // const canvasOutHeight = canvasOut.height;
      // ctxOut.fillText("待提交预测", canvasOutWidth / 2, canvasOutHeight / 2);

      let a = this;
      document
        .getElementById("myform")
        .addEventListener("submit", function (e) {
          e.preventDefault(); // 阻止表单默认的提交行为
          var selected_files = document.getElementById("select_files").files[0];
          // processImage(selected_files);
          a.files = selected_files;
          a.processImage();
        });
    },
  },
  mounted() {
    this.op();
  },
  watch:{
    imgSRC:{
      handler(newValue,oldValue){
        console.log(newValue)
      }
    }
  },

};
</script>

<style scoped>
.box {
  width: 500px;
  height: 500px;
  /* border: 1px solid black; */
  display: flex;
  /* 将 display 属性设置为 flex */
  align-items: center;
  /* 垂直居中 */
  justify-content: center;
  /* 水平居中 */
  margin-right: 20px;
  /* 设置右边距为 20px */
  margin-left: 20px;
  position: relative;
}
.box img{
  width: 500px;
  height: 500px;
  display: block;
}

.container {
  display: flex;
}

.button-wrapper {
  position: absolute;
  /* 添加绝对定位 */
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
}

.button-wrapper2 {
  position: absolute;
  /* 添加绝对定位 */
  height: 40px;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
}

body {
  display: flex;
  justify-content: center;
  align-items: flex-center;
  height: 100vh;
  margin: 0;
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
}

.title h1 {
  font-size: 24px;
}

/* new */

#myform {
  width: 1200px;
}

#title h1 {
  height: 60px;
  line-height: 60px;
  font-size: 40px;
}

.container {
  justify-content: space-between;
}

.button-wrapper {
  bottom: -82px;
}

.button-wrapper2 {
  bottom: -80px;
}

.blue-button {
  position: absolute;
  display: block;
  width: 100px;
  height: 40px;
  background-color: #9b9b9b;
  color: #fff;
  text-decoration: none;
  text-align: center;
  font: normal normal normal 16px/40px "Microsoft YaHei";
  cursor: pointer;
  border-radius: 4px;
}

#select_files {
  font-size: 100px;
  width: 100px;
  height: 40px;
  opacity: 0;
}

.button-new {
  font-size: 100px;
  width: 100px;
  height: 40px;
  opacity: 0;
}

.box {
  background-image: linear-gradient(to bottom, #9e9e9e, #141414);
  border: 5px dashed rgb(216, 216, 216);
  border-radius: 10px;
}

#select-picture-box::before {
  content: "";
  position: absolute;
  left: 35%;
  top: 50%;
  width: 160px;
  border-top: 4px dashed rgb(148, 148, 148);
  z-index: 1;
}

#select-picture-box::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 35%;
  height: 160px;
  border-left: 4px dashed rgb(148, 148, 148);
  z-index: 1;
}

#select-picture-box:hover {
  cursor: pointer;
}

/* Loading */
.loading svg polyline {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.loading svg polyline#back {
  fill: none;
  stroke: #ff4d5033;
}

.loading svg polyline#front {
  fill: none;
  stroke: #ff4d4f;
  stroke-dasharray: 48, 144;
  stroke-dashoffset: 192;
  animation: dash_682 1.4s linear infinite;
}

@keyframes dash_682 {
  72.5% {
    opacity: 0;
  }

  to {
    stroke-dashoffset: 0;
  }
}

.loading {
  position: absolute;
  top: 330px;
  left: 48%;
  display: none;
}
.show-example {
  position: absolute;
  margin-top: 100px;
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
.intro {
  width: 400px;
  margin: 20px auto;
  text-align: center;
}
.intro-example {
  margin: 20px auto;
}
.statistic-show{
  width: 100%;
  margin-top: 100px;
  font-size: 16px;
  height: 150px;
  border: 3px grey dashed;
}
.blank{
  width: 100%;
  height: 144px;
  line-height: 144px;
  text-align: center;
  color: #9e9e9e;
  font-size: 30px;
}
.statistic{
  height: 94px;
  width: 100%;
}
.statistic-tit{
  height: 50px;
  line-height: 50px;
  margin-left: 20px;
}
.statistic-item{
  width: 200px;
  text-align: center;
}
</style>
