<template>
  <div class="home-button">
    <el-button
      title="上传数据"
      icon="el-icon-upload"
      circle
    ></el-button>
    <el-button
      title="回到顶部"
      icon="el-icon-caret-top"
      circle
      @click="scrollToTop"
    ></el-button>
  </div>
</template>

<script>
export default {
  methods: {
    scrollToTop() {
      // 使用原生的scrollTo方法将页面滚动到顶部
      window.scrollTo({
        top: 0,
        behavior: "smooth", // 平滑滚动
      });
    },
  },
};
</script>

<style scoped>
.home-button {
  width: 50px;
  z-index: 9999;
}
.home-button button {
  width: 40px;
  margin: 5px auto;
}
</style>
