<template>
  <div class="alloy-composition-main">
    <small-nav></small-nav>

    <div class="back-profile">
      <router-link to="/">
        <i class="el-icon-arrow-left"></i>
        返回首页
      </router-link>
      <div class="function-tit">合金成分查询性能</div>
    </div>

    <div class="ac-show">
      <router-view></router-view>
    </div>

  </div>
</template>

<script>
import SmallNav from "../../components/smallNav/smallNav.vue";

export default {
  components: {  SmallNav },
};
</script>

<style scoped>
.alloy-composition-main {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #edeff9;
}
.alloy-composition-main .back-profile {
  position: absolute;
  top: calc(5vh + 60px);
  left: 50%;
  transform: translateX(-50%);
  margin: 0 auto;
  width: 1300px;
  font-size: 16px;
  height: 50px;
  line-height: 50px;
  background-color: #fff;
  padding-left: 22px;
  color: rgb(68, 149, 255);
}
.alloy-composition-main .back-profile .function-tit {
  font-size: 24px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  color: black;
  text-align: center;
}
.ac-show {
  width: 1300px;
  position: absolute;
  top: calc(5vh + 115px);
  left: 50%;
  transform: translatex(-50%);
  background-color: #fff;
  padding: 3vh;
  margin-top: 3vh;
}
</style>
