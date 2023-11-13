<template>
  <div class="image-content">
    <div class="image-tit">微观组织相识别</div>

    <div class="image-content-1">
      <div class="left-selection">
        <image-selection></image-selection>
      </div>
      <div
        class="center-pic"
        @click="imgUpload()"
      >
        <img
          :src="image_src"
          v-show="isShowImg"
          class="showed-image"
        >
        <div
          v-show="!isLoading&&!isShowImg"
          class="pic-text"
        >
          点击上传一个小于10 MB的PNG或JPG图像来使用
        </div>
        <loading v-show="isLoading"></loading>
        <input
          type="file"
          value="选择检测图片"
          id="select_files"
          name="input_image"
          @change="showSelectedImage()"
        />
        <div
          v-show="isShowStatistic"
          class="show-statistic"
        >识别区域图片总区域比例：{{this.statisticData}} %</div>
      </div>

      <div class="right-statistic">
        <div
          class="statictic-blank"
          v-show="!isShowStatistic"
        >
          <el-empty
            description="暂无统计数据"
            :image-size="300"
          >
            <el-button
              type="primary"
              @click="getStatistic"
            >查询统计数据</el-button>
          </el-empty>
        </div>
        <div
          class="chartContainer"
          v-show="isShowStatistic"
        >
          <div
            id="area"
            ref="areaChart"
            style="width: 16vw; height: 30vh;"
            v-show="hasArea"
          ></div>

          <div
            id="boxivity"
            ref="boxivityChart"
            style="width: 16vw; height: 30vh;"
            v-show="hasBoxivity"
          ></div>

          <div
            id="Circular_Equiv_Diameter"
            ref="Circular_Equiv_DiameterChart"
            style="width: 16vw; height: 30vh;"
            v-show="hasCircular_Equiv_Diameter"
          ></div>

          <div
            id="Elongationr"
            ref="ElongationChart"
            style="width: 16vw; height: 30vh;"
            v-show="hasElongation"
          ></div>

          <div
            id="Perimeter"
            ref="PerimeterChart"
            style="width: 16vw; height: 30vh;"
            v-show="hasPerimeter"
          ></div>
        </div>
      </div>
    </div>

    <div class="show-example">
      <div class="intro-example">可以单击我们测试集中的示例图像：</div>
      <div class="show-img-list">

        <div
          class="show-img-item"
          v-for="(item,index) in imgList"
          :key="index"
          @click="getImgChange(item)"
        >
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
import Loading from "@/components/Loading/index.vue";
import ImageSelection from "./imageSelection";
import * as echarts from "echarts";
import Tiff from "tiff.js";
import { echartsRendering } from "./echarts.js";
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
      isShowImg: false,
      image_src: "",
      isShowData: false,
      showData: null,
      isLoading: false,
      isShowStatistic: false,
      statisticData: null,
      hasArea: false,
      Area: [],
      hasBoxivity: false,
      Boxivity: [],
      hasCircular_Equiv_Diameter: false,
      Circular_Equiv_Diameter: [],
      hasElongation: false,
      Elongation: [],
      hasPerimeter: false,
      Perimeter: [],
      base64Data:"",
    };
  },
  methods: {
    imgUpload() {
      const uploadInput = document.getElementById("select_files");
      uploadInput.click();
    },
    getImgChange(item) {
      if (item.showUrl === item.imgUrl) {
        item.showUrl = item.img_edUrl;
      } else {
        item.showUrl = item.imgUrl;
      }
    },
    //上传照片
    showSelectedImage() {
      let get_image_url = document.getElementById("select_files").files[0];
      //判断输入是否为空
      if (!get_image_url) {
        this.$message({
          message: "请正确上传数据",
          type: "warning",
        });
        return;
      }
      this.isShowImg = true;
      const localUrl = URL.createObjectURL(get_image_url);
      this.image_src = localUrl;
      this.isShowStatistic = false;
    },
    //图像识别并且查询统计数据
    getStatistic() {
      let get_image_url = document.getElementById("select_files").files[0];
      //判断输入是否为空
      if (!get_image_url) {
        this.$message({
          message: "请正确上传数据",
          type: "warning",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = function (event) {
        this.base64Data = event.target.result;
      }
      reader.readAsDataURL(get_image_url);
      this.clickStatistic(this.base64Data)
      // this.clickStatistic();
      // reader.onload = function (event) {
      //   const base64Data = event.target.result;
      //   // 将base64Data发送给后端
      //   getImageRecognition({ base64: base64Data })
      //     // .then((response) => response.json())
      //     .then((data) => {
      //       console.log(data);
      //       tthis.isShowImg = true;
      //       tthis.isLoading = false;
      //       tthis.image_src = "data:image/png;base64," + data.base64;
      //       tthis.image_src = tthis.image_src.replace(/[\r\n]/g, "");
      //       tthis.isShowStatistic = true;
      //       tthis.statisticData = (data.are_sum_bfb * 100).toFixed(2);

      //       let colorNum = 0;
      //       if (data.Area) {
      //         tthis.hasArea = true;
      //         tthis.Area = JSON.parse(data.Area);
      //         echartsRendering(
      //           tthis.$refs.areaChart,
      //           tthis.Area,
      //           100,
      //           "Area",
      //           colorNum++
      //         );
      //       }

      //       if (data.Boxivity) {
      //         tthis.hasBoxivity = true;
      //         tthis.Boxivity = JSON.parse(data.Boxivity);
      //         echartsRendering(
      //           tthis.$refs.boxivityChart,
      //           tthis.Boxivity,
      //           1000,
      //           "Boxivity",
      //           colorNum++
      //         );
      //       }

      //       if (data.Circular_Equiv_Diameter) {
      //         tthis.hasCircular_Equiv_Diameter = true;
      //         tthis.Circular_Equiv_Diameter = JSON.parse(
      //           data.Circular_Equiv_Diameter
      //         );
      //         echartsRendering(
      //           tthis.$refs.Circular_Equiv_DiameterChart,
      //           tthis.Boxivity,
      //           1000,
      //           "Circular Equiv Diameter",
      //           colorNum++
      //         );
      //       }
      //       if (data.Elongation) {
      //         tthis.hasElongation = true;
      //         tthis.Elongation = JSON.parse(data.Elongation);
      //         echartsRendering(
      //           tthis.$refs.ElongationChart,
      //           tthis.Elongation,
      //           0.1,
      //           "Elongation",
      //           colorNum++
      //         );
      //       }
      //       if (data.Perimeter) {
      //         tthis.hasPerimeter = true;
      //         tthis.Perimeter = JSON.parse(data.Perimeter);
      //         echartsRendering(
      //           tthis.$refs.PerimeterChart,
      //           tthis.Perimeter,
      //           100,
      //           "Perimeter",
      //           colorNum++
      //         );
      //       }
      //     })
      //     .catch((err) => {
      //       console.log(err);
      //       tthis.isLoading = false;
      //     });
      // };
      // reader.readAsDataURL(get_image_url);
    },
    //查询统计数据
    clickStatistic(base64Data) {
      this.isShowStatistic = false;
      this.isLoading = true;

      this.hasArea = false;
      this.hasBoxivity = false;
      this.hasCircular_Equiv_Diameter = false;
      this.hasElongation = false;
      this.hasPerimeter = false;

      // const reader = new FileReader();
      const tthis = this;
      // reader.onload = function (event) {
        // const base64Data = event.target.result;
        // 将base64Data发送给后端
        getImageRecognition({ base64: base64Data })
          .then((data) => {
            console.log(data);
            tthis.isShowImg = true;
            tthis.isLoading = false;
            tthis.image_src = "data:image/png;base64," + data.base64;
            tthis.image_src = tthis.image_src.replace(/[\r\n]/g, "");
            tthis.isShowStatistic = true;
            tthis.statisticData = (data.are_sum_bfb * 100).toFixed(2);

            let colorNum = 0;
            if (data.Area) {
              tthis.hasArea = true;
              tthis.Area = JSON.parse(data.Area);
              echartsRendering(
                tthis.$refs.areaChart,
                tthis.Area,
                100,
                "Area",
                colorNum++
              );
            }

            if (data.Boxivity) {
              tthis.hasBoxivity = true;
              tthis.Boxivity = JSON.parse(data.Boxivity);
              echartsRendering(
                tthis.$refs.boxivityChart,
                tthis.Boxivity,
                1000,
                "Boxivity",
                colorNum++
              );
            }

            if (data.Circular_Equiv_Diameter) {
              tthis.hasCircular_Equiv_Diameter = true;
              tthis.Circular_Equiv_Diameter = JSON.parse(
                data.Circular_Equiv_Diameter
              );
              echartsRendering(
                tthis.$refs.Circular_Equiv_DiameterChart,
                tthis.Boxivity,
                1000,
                "Circular Equiv Diameter",
                colorNum++
              );
            }
            if (data.Elongation) {
              tthis.hasElongation = true;
              tthis.Elongation = JSON.parse(data.Elongation);
              echartsRendering(
                tthis.$refs.ElongationChart,
                tthis.Elongation,
                0.1,
                "Elongation",
                colorNum++
              );
            }
            if (data.Perimeter) {
              tthis.hasPerimeter = true;
              tthis.Perimeter = JSON.parse(data.Perimeter);
              echartsRendering(
                tthis.$refs.PerimeterChart,
                tthis.Perimeter,
                100,
                "Perimeter",
                colorNum++
              );
            }
          })
          .catch((err) => {
            console.log(err);
            tthis.isLoading = false;
          });
      // };
      // reader.readAsDataURL(get_image_url);
    },
    //将tiff图片转换为png的base64编码
    async getTiffDataUrlHandler(url) {
      const xhr = new XMLHttpRequest();
      xhr.responseType = "arraybuffer";
      xhr.open("GET", "images/123/HD/0950_0950.tif");
      xhr.onload = () => {
        const tiff = new Tiff({ buffer: xhr.response });
        const canvas = tiff.toCanvas();
        this.image_src = canvas.toDataURL();
        this.isShowImg = true;
      };
      xhr.send();
    },
  },
  mounted() {
    if (sessionStorage.getItem("url") !== null) {
      this.base64Data = this.getTiffDataUrlHandler(sessionStorage.getItem("url"));
    }
  },
  watch: {
    imgSRC: {
      handler(newValue, oldValue) {
        console.log(newValue);
      },
    },
  },
};
</script>

<style scoped>
.image-content {
  width: 100%;
  position: relative;
}
.image-tit {
  height: 60px;
  line-height: 60px;
  font-size: 40px;
  text-align: center;
  margin: 80px 0 20px;
}
.image-content-1 {
  display: flex;
  justify-content: space-between;
  height: 60vh;
}

.right-statistic {
  width: 53vw;
  height: 60vh;
}
.chartContainer {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  flex-direction: row;
}

.center-pic {
  width: calc(30vw + 8px);
  height: calc(30vw + 8px);
  border: 4px dashed rgb(216, 216, 216);
  position: relative;
}
.center-pic:hover {
  border: 4px dashed #5f5f5f;
}
.showed-image {
  width: 30vw;
  height: 30vw;
}
#select_files {
  display: none;
}
.pic-text {
  width: 30vw;
  text-align: center;
  height: 20vh;
  line-height: 20vh;
  font-size: 2vh;
  color: #5f5f5f;
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
</style>
