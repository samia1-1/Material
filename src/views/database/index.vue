<template>
  <div class="data-serach">

    <small-nav></small-nav>

    <div class="back-profile">
      <router-link to="/">
        <i class="el-icon-arrow-left"></i>
        返回首页
      </router-link>
      <div class="function-tit">材料数据</div>
    </div>

    <div class="data-select-show">
      <div class="left-sidernav">
        <el-col>
          <el-menu
            :default-active="this.defaultNum"
            class="el-menu-vertical-demo"
          >
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>性能查询</span>
              </template>
              <el-menu-item
                index="1-1"
                @click="toDataCreep"
              >蠕变</el-menu-item>
              <el-menu-item
                index="1-2"
                @click="toDataExtremes"
              >持久极限</el-menu-item>
              <el-menu-item
                index="1-3"
                @click="toDataPropertie"
              >持久性能</el-menu-item>
              <el-menu-item
                index="1-4"
                @click="toDataStretch"
              >拉伸性能.精铸试棒</el-menu-item>
              <el-menu-item
                index="1-5"
                @click="toChemical"
              >热成分处理</el-menu-item>
            </el-submenu>
          </el-menu>
        </el-col>
      </div>
      <div class="right-info-show">
        <router-view></router-view>
      </div>
    </div>

  </div>
</template>

<script>
import smallNav from "../../components/smallNav/smallNav";
export default {
  components: { smallNav },
  created() {
    this.checkActive();
  },
  mounted() {
    this.checkActive();
  },
  data(){
    return{
      defaultNum:"1-1",
    }
  },
  methods: {
    checkActive() {
      let path = this.$router.history.current.path;
      console.log(path)
      if(path === '/datesearch'){
        this.defaultNum = "1-1"
      }else if(path === '/datasearch/extreme'){
        this.defaultNum = "1-2"
      }else if(path === '/datasearch/propertie'){
        this.defaultNum = "1-3"
      }else if(path === '/datasearch/stretch'){
        this.defaultNum = "1-4"
      }else if(path === '/datasearch/chemical'){
        this.defaultNum = "1-5"
      }
    },
    toDataCreep() {
      this.$router.push("/datasearch");
    },
    toDataExtremes() {
      this.$router.push("/datasearch/extreme");
    },
    toDataPropertie() {
      this.$router.push("/datasearch/propertie");
    },
    toDataStretch() {
      this.$router.push("/datasearch/stretch");
    },
    toChemical(){
      this.$router.push("/datasearch/chemical");
    }
  },
};
</script>

<style scoped>
.data-serach {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #edeff9;
}
.back-profile {
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
.function-tit {
  font-size: 3vh;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  color: black;
  text-align: center;
}
.data-select-show {
  position: absolute;
  top: calc(5vh + 150px);
  left: 50%;
  transform: translateX(-50%);
  width: 1200px;
}
.left-sidernav {
  width: 230px;
  height: 626px;
  position: absolute;
  background-color: #fff;
}
.right-info-show {
  width: calc(100% - 254px);
  height: 626px;
  background-color: #fff;
  position: absolute;
  right: 0;
  padding: 5vh;
}
</style>
