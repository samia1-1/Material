<template>
  <div class="home-header">
    <header-nav></header-nav>

    <div class="header-intro-tit">
      <h1>高温合金性能查询预测</h1>
    </div>
    <div class="header-intro-text">
      <div class="text1">节省时间和实验成本的消耗 , 加快高温合金从实验室研究到市场应用的转化进程</div>
      <div class="text2">推动国内高温合金材料领域的发展</div>
    </div>

  </div>
</template>

<script>
import headerNav from './headerNav'
export default {
  components: { headerNav },

}
</script>
  <!-- background-image: linear-gradient(to bottom,#121d6f,#ffffff); -->
<style scoped>
.home-header{
  height: 500px;
  width: 100%;
  position: relative;
  color: #ffffff;

  background-image: linear-gradient(to bottom, #303030, transparent),url('../../../assets/images/index_bg.png') ;
  background-position: center center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: 0 0 50px #000000;
}
.header-intro-tit{
  position: absolute;
  top: 18%;
  left: 30%;
  font-size: 35px;
  line-height: 35px;
  font-weight: 800;
}
.header-intro-text{
  height: 70px;
  position: absolute;
  left: 30%;
  top: 190px;
}
.text1,.text2{
  height: 35px;
  line-height: 35px;
  font-size: 20px;
}
</style>
