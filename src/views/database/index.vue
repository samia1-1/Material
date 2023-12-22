<template>
  <div class="data-serach">

    <small-nav></small-nav>

    <back-profile title="材料数据"></back-profile>

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
      <div class="right-data-show">
        <router-view></router-view>
      </div>
    </div>

  </div>
</template>

<script>
import smallNav from "../../components/smallNav/smallNav";
import BackProfile from '../../components/BackProfile/index.vue'
export default {
  components: { smallNav,BackProfile },
  created() {
    this.checkActive();
  },
  mounted() {
    this.checkActive();
  },
  data() {
    return {
      defaultNum: "1-1",
    };
  },
  methods: {
    checkActive() {
      let path = this.$router.history.current.path;
      // console.log(path)
      if (path === "/datesearch") {
        this.defaultNum = "1-1";
      } else if (path === "/datasearch/extreme") {
        this.defaultNum = "1-2";
      } else if (path === "/datasearch/propertie") {
        this.defaultNum = "1-3";
      } else if (path === "/datasearch/stretch") {
        this.defaultNum = "1-4";
      } else if (path === "/datasearch/chemical") {
        this.defaultNum = "1-5";
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
    toChemical() {
      this.$router.push("/datasearch/chemical");
    },
  },
};
</script>

<style scoped>
.data-serach {
  width: 100%;
  min-height: 100%;
  height: auto;
  position: relative;
  background-color: #edeff9;
}
.data-select-show {
  position: absolute;
  top: calc(5vh + 150px);
  left: 50%;
  transform: translateX(-50%);
  width: 70vw;
}
.left-sidernav {
  width: 230px;
  height: 70vh;
  position: absolute;
  background-color: #fff;
}
.right-data-show {
  width: calc(100% - 254px);
  height: 70vh;
  overflow: scroll;
  background-color: #fff;
  position: absolute;
  right: 0;
  padding: 3vh;
}
.right-data-show::-webkit-scrollbar {
  display: none;
}
</style>
