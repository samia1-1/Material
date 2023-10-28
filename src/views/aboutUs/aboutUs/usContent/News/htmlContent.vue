<template>
  <div
    class="html-content"
    v-html="content"
  ></div>
</template>

<script>
import axios from "axios";
import * as mammoth from "mammoth";
export default {
  data() {
    return {
      content: "",
      fileUrl: "",
    };
  },
  mounted() {
    // 在新窗口中监听message事件
    window.addEventListener("message", (event) => {
      //检验是否信任消息来源
      if (event.origin !== "http://localhost:8100") {
        this.$message({
          message: "警告！该消息源不可信任！",
          type: "error",
        });
      }
      // event.data包含接收到的数据
      const receivedData = event.data;
      // 处理接收到的数据
      if (receivedData.fileUrl) {
        // console.log("使用新的数据");
        this.fileUrl = receivedData.fileUrl;
        window.sessionStorage.fileUrl = JSON.stringify(this.fileUrl);
      }
      console.log(this.fileUrl);
      axios.get(this.fileUrl, { responseType: "arraybuffer" }).then((res) => {
        const fileContent = res.data;
        mammoth.extractRawText({ arrayBuffer: fileContent }).then((result) => {
          const htmlContent = result.value; // 获取HTML格式的文档内容
          // 在这里展示HTML内容，保留其格式
          this.content = htmlContent;
        });

      });
    });
  },
  created() {
    if (window.sessionStorage.fileUrl) {
      this.fileUrl = JSON.parse(window.sessionStorage.fileUrl);
    }
  },
};
</script>

<style>
.html-content {
  width: 100%;
  height: 100%;
}
</style>
