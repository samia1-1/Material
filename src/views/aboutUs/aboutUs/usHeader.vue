<template>
  <div id="us-header">
    <us-nav></us-nav>

    <div class="header-intro-tit">
      <h1>关于我们</h1>
    </div>


  </div>
</template>

<script>
import usNav from './usNav'
export default {
  components: { usNav },

}
</script>

<style scoped>
#us-header{
  height: 370px;
  width: 100%;
  position: relative;

  background-image: url('../../../assets/images/aboutus.webp');
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  background-color: rgba(224, 224, 224, 0.4);
  opacity: 0.7;

}

.header-intro-tit h1{
  color: #000000 ;
  opacity: 1;
  position: absolute;
  left: 300px;
  font-size: 50px;
  line-height: 50px;
  font-weight: 800;
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
