<template>
  <div class="data-predict">
    <predict-nav></predict-nav>
    <div class="predict-main">
      <h2>拉伸性能数据预测</h2>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import DataStretch from '../database/dataShow/dataStretch.vue'
import predictNav from './component/predictNav'
export default {
  components: { predictNav, DataStretch },

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
