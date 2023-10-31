<template>
  <div class="image-content">
    <div class="image-tit">微观组织相识别</div>

    <div class="image-content-1">
      <div class="left-selection">详细的选项</div>
      <div
        class="right-pic"
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
        <div v-show="isShowStatistic" class="show-statistic">识别区域图片总区域比例：{{this.statisticData}} %</div>
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
import Loading from "@/components/Loading/index.vue";
export default {
  components: { Loading },
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
      isShowStatistic:false,
      statisticData:null,
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
    showSelectedImage() {
      let get_image_url = document.getElementById("select_files").files[0];
      //判断输入是否为空
      if(get_image_url === undefined){return ;}
      this.isShowImg = false;
      this.isShowStatistic = false;
      this.isLoading = true;

      const reader = new FileReader();
      let tthis = this;
      reader.onload = function (event) {
        const base64Data = event.target.result;
        // 将base64Data发送给后端
        getImageRecognition({ base64: base64Data })
          // .then((response) => response.json())
          .then((data) => {
            console.log(data);
            tthis.isShowImg = true;
            tthis.isLoading = false;
            tthis.image_src = "data:image/png;base64," + data.data1;
            tthis.image_src = tthis.image_src.replace(/[\r\n]/g, "");
            tthis.isShowStatistic = true;
            tthis.statisticData = data.data2;
          })
          .catch((err) => {
            console.log(err);
            tthis.isLoading = false;
          });
      };
      reader.readAsDataURL(get_image_url);
    },
  },
  mounted() {},
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
  margin: 0 0 20px;
}
.image-content-1 {
  position: relative;
  width: 1200px;
  margin: 0 auto 0;
  height: 700px;
}
.left-selection {
  width: 400px;
  height: 700px;
  border: 4px solid rgb(167, 167, 167);
}
.right-pic {
  position: absolute;
  right: 0;
  top: 0;
  width: 708px;
  height: 708px;
  margin-left: 50px;
  border: 4px dashed rgb(216, 216, 216);
}
.right-pic:hover{
  border: 4px dashed #5f5f5f;
}
.showed-image {
  width: 700px;
  height: 700px;
}
#select_files {
  display: none;
}
.pic-text{
  width: 700px;
  text-align: center;
  height: 300px;
  line-height: 300px;
  font-size: 16px;
  color: #5f5f5f;
}
.pic-text::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  width: 330px;
  border-top: 4px dashed rgb(148, 148, 148);
  z-index: 1;
}

.pic-text::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateY(-50%);
  height: 330px;
  border-left: 4px dashed rgb(148, 148, 148);
  z-index: 1;
}
.right-pic:hover {
  cursor: pointer;
}
.show-statistic{
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
