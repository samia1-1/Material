<template>
  <div class="image-recognition">
    <small-nav></small-nav>
    <div class="content">
      <image-content></image-content>
    </div>

  </div>
</template>

<script>
import SmallNav from '../../components/smallNav/smallNav.vue'
import ImageContent from './component/imageContent.vue'
export default {
  components: { ImageContent, SmallNav },

}
</script>
  <!--
  background-color: #edeff9;-->
<style scoped>
.image-recognition{
  width: 100%;
  position: absolute;
  top: 0;
}
</style>
