<template>
  <div class="data-predict">
    <small-nav></small-nav>
    <div class="predict-main">
      <h2>拉伸性能数据预测</h2>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import SmallNav from '../../components/smallNav/smallNav.vue'
import DataStretch from '../database/dataShow/dataStretch.vue'
export default {
  components: {  DataStretch, SmallNav },

}
</script>

<style scoped>
.data-predict{
  position: relative;
  width: 100%;
  height: 100%;
}
.data-predict .predict-main{
  position: absolute;
  top: 80px;
  width: 80%;
  background-image: linear-gradient(to bottom,#ffffff,#f6f8fa);
  min-height: 750px;
  left: 10%;
}
.data-predict .predict-main h2{
  text-align: center;
}
</style>
