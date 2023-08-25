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
        <!-- <el-menu-item-group>
          <template slot="title">分组一</template>
          <el-menu-item index="1-1">选项1</el-menu-item>
          <el-menu-item index="1-2">选项2</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group title="分组2">
          <el-menu-item index="1-3">选项3</el-menu-item>
        </el-menu-item-group>
        <el-submenu index="1-4">
          <template slot="title">选项4</template>
          <el-menu-item index="1-4-1">选项1</el-menu-item>
        </el-submenu> -->
      </el-submenu>
      <el-menu-item
        index="2"
        @click="toAlloyComposition"
      >
        <i class="el-icon-menu"></i>
        <span slot="title">合金成分查询性能</span>
      </el-menu-item>
      <!-- <el-menu-item index="4">
        <i class="el-icon-setting"></i>
        <span slot="title">导航四</span>
      </el-menu-item> -->
    </el-menu>

  </div>
</template>

<script>
export default {
  created() {
    this.checkActive();
    // console.log("created")
  },
  mounted() {
    this.checkActive();
    // console.log("mounted")
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
      }else if(path === '/datasearch/alloycomposition'){
        this.defaultNum = "2"
      }
      console.log(this.defaultNum)
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
    toAlloyComposition() {
      this.$router.push("/datasearch/alloycomposition");
    },
  },
};
</script>

<style>
.data-select {
  width: 250px;
  position: absolute;
  left: 130px;
  top: 100px;
  border: 1px solid #8b8b8b;
  border-radius: 10px;
  padding-bottom: 10px;
}
.data-select h3 {
  text-align: center;
}
</style>
