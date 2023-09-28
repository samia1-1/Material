<template>
  <div id="us-header">
    <header-nav></header-nav>

    <div class="header-intro-tit">
      <h1>关于我们</h1>
    </div>


  </div>
</template>

<script>
import HeaderNav from '../../home/Home/headerNav.vue'
export default {
  components: { HeaderNav },

}
</script>

<style scoped>
#us-header{
  height: 370px;
  width: 100%;
  position: relative;

  background-image: linear-gradient(to bottom, #3d3d3d, transparent),url('../../../assets/images/us-bg.png');
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  background-color: rgba(224, 224, 224, 0.4);
  color: #ffffff ;
}

.header-intro-tit h1{
  opacity: 1;
  position: absolute;
  left: 300px;
  font-size: 50px;
  line-height: 50px;
  font-weight: 600;
}
.header-intro-text{
  height: 70px;
  position: absolute;
  left: 250px;
  top: 190px;
}
.text1,.text2{
  height: 35px;
  line-height: 35px;
  font-size: 20px;
}
</style>
