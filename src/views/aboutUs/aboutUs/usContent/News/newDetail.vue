<template>
  <div class="news-detail">
    <small-nav></small-nav>
    <div class="news-main">

      <div class="left-text">
          <html-content></html-content>
      </div>

      <div class="right-fonction"></div>

    </div>

  </div>
</template>

<script>
import smallNav from "../../../../../components/smallNav/smallNav.vue";
import HtmlContent from './htmlContent.vue';
export default {
  components: { smallNav, HtmlContent, },

  created() {
  },
};
</script>

<style scoped>
.news-detail {
  width: 100%;
  min-height: 100%;
  background-color: rgb(245, 247, 253);
}
.news-main {
  width: 1270px;
  min-height: 700px;
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
}
.left-text {
  width: 900px;
  background-color: rgb(255, 255, 255);
}
.new-content-detail {
  width: 100%;
  height: 100%;
}
.right-fonction {
  width: 335px;
  background-color: rgb(255, 255, 255);
}
</style>
