<template>
  <div class="data-predict">

    <small-nav></small-nav>

    <div class="back-profile">
      <router-link to="/">
        <i class="el-icon-arrow-left"></i>
        返回首页
      </router-link>
      <div class="function-tit">性能预测</div>
    </div>

    <div class="predict-show">

      <div class="left-sidernav">
        <el-col>
          <el-menu
            default-active="1"
            class="el-menu-vertical-demo"
          >
            <el-menu-item
              index="1"
            >
              <i class="el-icon-magic-stick"></i>
              <span slot="title">拉伸性能.精铸试棒 预测</span>
            </el-menu-item>

          </el-menu>
        </el-col>
      </div>

      <div class="right-data-show">
        <router-view></router-view>
      </div>

    </div>
  </div>
</template>

<script>
import SmallNav from "../../components/smallNav/smallNav.vue";
import DataStretch from "../database/dataShow/dataStretch.vue";
export default {
  components: { DataStretch, SmallNav },
};
</script>

<style scoped>
.data-predict {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #edeff9;
}
.data-predict .back-profile {
  position: absolute;
  top: calc(5vh + 60px);
  left: 50%;
  transform: translateX(-50%);
  margin: 0 auto;
  width: 1200px;
  font-size: 16px;
  height: 50px;
  line-height: 50px;
  background-color: #fff;
  padding-left: 22px;
  color: rgb(68, 149, 255);
}
.data-predict .back-profile .function-tit {
  font-size: 24px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  color: black;
  text-align: center;
}
.data-predict .predict-show {
  position: absolute;
  top: calc(5vh + 150px);
  left: 50%;
  transform: translateX(-50%);
  width: 1200px;
}
.data-predict .predict-show .left-sidernav {
  width: 230px;
  height: 626px;
  position: absolute;
  background-color: #fff;
}
.data-predict .predict-show .right-data-show {
  width: calc(100% - 254px);
  height: 626px;
  background-color: #fff;
  position: absolute;
  right: 0;
  padding: 3vh;
}
</style>
