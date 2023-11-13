<template>
  <div class="picDetail">
    <div
      class="img-containter"
      @click="toImageRecognition"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <img
        v-show="img_src"
        class="img-detail"
        :src="img_src"
        alt=""
        ref="tiff_img"
      >
    </div>
  </div>
</template>

<script>
import Tiff from "tiff.js";
export default {
  data() {
    return {
      img_src: "",
      loading:true,
    };
  },
  mounted() {
    if(sessionStorage.getItem("url") !== null){
      this.getTiffDataUrlHandler(sessionStorage.getItem("url"))
    }
    // 在新窗口中监听message事件;
    window.addEventListener("message", (event) => {
      //检验是否信任消息来源
      if (event.origin !== "http://localhost:8100") {
        this.$message({
          message: "警告！该消息源不可信任！",
          type: "error",
        });
        this.$router.push('/')
        return;
      }
      // event.data包含接收到的数据
      const receivedData = event.data;
      console.log(receivedData.img_src)
      // 处理接收到的数据
      if (receivedData.img_src) {
        this.getTiffDataUrlHandler(receivedData.img_src);
        sessionStorage.setItem("url", receivedData.img_src);
      }
    });
  },
  methods: {
    toImageRecognition() {
      this.$router.push("/imagerecognition");
    },
    async getTiffDataUrlHandler(url) {
      const xhr = new XMLHttpRequest();
      xhr.responseType = "arraybuffer";
      xhr.open("GET", "images/123/HD/0950_0950.tif");
      xhr.onload = () => {
        const tiff = new Tiff({ buffer: xhr.response });
        const canvas = tiff.toCanvas();
        this.img_src = canvas.toDataURL();
      };
      xhr.send();
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.img-containter {
  width: 60vh;
  height: 60vh;
  margin: 20px auto;
}
.img-detail {
  width: 60vh;
  height: 60vh;
}
.img-detail:hover {
  cursor: pointer;
}
</style>

