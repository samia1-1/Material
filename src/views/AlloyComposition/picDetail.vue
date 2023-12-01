<template>
  <div class="picDetail" >
    <div class="change-input">
      <el-select
        v-model="picOption"
        placeholder="请选择图片类型"
      >
        <el-option
          v-for="item in picOptions"
          :key="item"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
    </div>
    <div
      class="img-containter"
      @click="toImageRecognition"
      v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.2)"
    >
      <img
        v-show="img_src"
        class="img-detail"
        :src="img_src"
        alt="查询结果"
        ref="tiff_img"
      >
    </div>
  </div>
</template>

<script>
import Tiff from "tiff.js";
import debounce from "../../utils/debounce/debounce";
import { getImage_url } from "@/api/database/AlloyComposition.js";
export default {
  data() {
    return {
      img_src: "",
      loading: true,
      picOptions: ["SE", "HD"],
      picOption: "SE",
      paramsBody: {},
    };
  },
  created() {
    if (sessionStorage.getItem("url") !== null) {
      this.getTiffDataUrlHandler(sessionStorage.getItem("url"));
      this.paramsBody = JSON.parse(sessionStorage.getItem("paramBody"));
    }else {
      debounce(
        () => {
          this.$message({
            message: "传入图片为空，请稍后重试",
            type: "error",
          });
          this.$router.push("/");
          console.log("nullya");
        },
        500,
        true
      );
    }
  },
  methods: {
    toImageRecognition() {
      this.$router.push("/imagerecognition");
    },
    async getTiffDataUrlHandler(url) {
      const xhr = new XMLHttpRequest();
      xhr.responseType = "arraybuffer";
      xhr.open("GET", url);
      xhr.onload = () => {
        const tiff = new Tiff({ buffer: xhr.response });
        const canvas = tiff.toCanvas();
        this.img_src = canvas.toDataURL();
      };
      await xhr.send();
      this.loading = false;
    },
  },
  watch: {
    picOption: {
      handler(newValue) {
        this.loading = true;
        getImage_url({ ...this.paramsBody }, { HD_SE: newValue })
          .then((res) => {
            sessionStorage.setItem("url", res.data.url);
            this.getTiffDataUrlHandler(res.data.url);
          })
          .catch((err) => console.log(err));

      },
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
.change-input input {
  width: 11vw;
  height: 3vh;
}
</style>

