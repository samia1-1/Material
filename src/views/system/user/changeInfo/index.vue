<template>
  <div class="change-info">
    <div class="back-profile">
      <router-link to="/user/profile">
        <i class="el-icon-arrow-left"></i>
        返回我的个人主页
      </router-link>
    </div>

    <div class="change-play">
      <div class="left-sidernav">
        <el-col>
          <el-menu
            :default-active="activeNum"
            class="el-menu-vertical-demo"
          >
            <el-menu-item
              index="1"
              @click="toChangeProfile"
            >
              <i class="el-icon-user-solid"></i>
              <span slot="title">个人资料</span>
            </el-menu-item>

            <el-menu-item
              index="2"
              @click="toChangeAccount"
            >
              <i class="el-icon-document"></i>
              <span slot="title">账号设置</span>
            </el-menu-item>

            <el-menu-item
              index="3"
              @click="toManageUpload"
            >
              <i class="el-icon-setting"></i>
              <span slot="title">上传管理</span>
            </el-menu-item>
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
export default {
  data(){
    return{
      activeNum:"1",
    }
  },
  methods: {
    toChangeProfile() {
      this.$router.push("/user/changeinfo");
    },
    toChangeAccount() {
      this.$router.push("/user/changeinfo/changeac");
    },
    toManageUpload() {
      this.$router.push("/user/changeinfo/manage_upload");
    },
    checkActive() {
      let path = this.$router.history.current.path;
      // console.log(path)
      // console.log(this.$route)
      if (path === "/user/changeinfo") {
        this.activeNum = "1";
      } else if (path === "/user/changeinfo/changeac") {
        this.activeNum = "2";
      } else if (path === "/user/changeinfo/manage_upload") {
        this.activeNum = "3";
      }
    },
  },
  created() {
    this.checkActive();
  },
};
</script>

<style>
.change-info {
  width: 100%;
}
.back-profile {
  width: 1200px;
  margin: 5vh auto;
  font-size: 16px;
  height: 50px;
  line-height: 50px;
  background-color: #fff;
  padding-left: 22px;
  color: rgb(68, 149, 255);
}
.change-play {
  width: 1200px;
  margin: 40px auto 0;
  position: relative;
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
}
</style>
