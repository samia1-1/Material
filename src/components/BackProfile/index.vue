<template>
  <div class="back-profile">
    <router-link to="/">
      <i class="el-icon-arrow-left"></i>
      返回首页
    </router-link>
    <div class="function-tit">{{title}}</div>
  </div>
</template>

<script>
export default {
  props:['title']

}
</script>

<style>
.back-profile {
  position: absolute;
  top: calc(5vh + 60px);
  left: 50%;
  transform: translateX(-50%);
  margin: 0 auto;
  width: 70vw;
  font-size: 16px;
  height: 50px;
  line-height: 50px;
  background-color: #fff;
  padding-left: 22px;
  color: rgb(68, 149, 255);
}
.back-profile .function-tit {
  font-size: 24px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  color: black;
  text-align: center;
}
</style>
