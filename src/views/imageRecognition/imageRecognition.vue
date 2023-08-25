<template>
  <div class="image-recognition">
    <image-nav></image-nav>
    <div class="content">
      <image-content></image-content>
    </div>

  </div>
</template>

<script>
import ImageContent from './component/imageContent.vue'
import imageNav from './component/imageNav'
export default {
  components: { imageNav, ImageContent },

}
</script>

<style scoped>
body{
  display: block;
}
.content{
  width: 1200px;
  background-image: linear-gradient(to bottom,#f6f8fa,#ffffff);
  height: 700px;
  margin: 80px auto;
}
</style>
