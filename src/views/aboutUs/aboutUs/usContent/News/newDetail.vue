<template>
  <div>
    <!-- 显示转换后的HTML内容 -->
    <div v-html="convertedHtml"></div>
  </div>
</template>

<script>
import mammoth from "mammoth";
export default {
  data() {
    return {
      convertedHtml: "", // 用于存储转换后的HTML内容
    };
  },
  methods: {
    convertDocToHtml(docData) {
      mammoth
        .convertToHtml({ arrayBuffer: docData })
        .then((result) => {
          this.convertedHtml = result.value; // 存储转换后的HTML
        })
        .catch((error) => {
          console.error("转换出错:", error);
        });
    },
  },
  mounted() {
    // 发送请求到后端获取.doc文件
    // 使用mammoth.js或其他工具将.doc文件转换为HTML并更新this.convertedHtml
    // 例如，从服务器获取.doc文件并触发转换
    fetch("url_to_your_doc_file.doc")
      .then((response) => response.arrayBuffer())
      .then((docData) => {
        this.convertDocToHtml(docData);
      })
      .catch((error) => {
        console.error("获取.doc文件出错:", error);
      });
  },
};
</script>
