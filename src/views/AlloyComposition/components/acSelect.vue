<template>
  <div class="ac-select">
    <h3>选择要查询的性能</h3>

    <el-menu
      :default-active="this.defaultNum"
      class="el-menu-vertical-demo"
    >
        <el-menu-item
          index="1"
          @click="to_ele"
        >ele</el-menu-item>
        <el-menu-item
          index="2"
          @click="to_static_ele"
        >static_ele</el-menu-item>

    </el-menu>

  </div>
</template>

<script>
export default {
  created() {
    this.checkActive();
  },
  mounted() {
  },
  data(){
    return{
      defaultNum:"1",
    }
  },
  methods: {
    checkActive() {
      let path = this.$router.history.current.path;
      console.log(path)
      if(path === '/alloyComposition'){
        this.defaultNum = "1"
      }else if(path === '/alloyComposition/static_ele'){
        this.defaultNum = "2"
      }
    },
    to_ele() {
      this.$router.push("/alloyComposition");
    },
    to_static_ele() {
      this.$router.push("/alloyComposition/static_ele");
    },
  },
};
</script>

<style>
.ac-select {
  width: 250px;
  border: 3px solid #8b8b8b;
  border-left: 0;
  padding-bottom: 10px;
  text-align: center;
}
.ac-select h3 {
  text-align: center;
}
</style>
