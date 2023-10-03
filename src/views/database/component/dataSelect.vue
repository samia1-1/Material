<template>
  <div class="data-select">
    <h3>选择要查询的数据</h3>

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

  </div>
</template>

<script>
export default {
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

<style>
.data-select {
  min-width: 250px;
  width: 13vw;
  position: absolute;
  left: 10vw;
  top: 10vh;
  border: 2px solid #b9b9b9;
  padding-bottom: 10px;
}
.data-select h3 {
  text-align: center;
  font-size: 18px;
  height: 50px;
  line-height: 50px;
}
</style>
