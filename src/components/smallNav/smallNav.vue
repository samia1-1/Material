<template>
  <div class="datasearch-nav">

    <div class="list">

      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
      >
        <el-menu-item index="1" @click="toIndex">首页</el-menu-item>
        <el-menu-item index="2" @click="toDatabase">材料数据</el-menu-item>
        <el-menu-item index="3" @click="toAlloyComposition">合金成分查询性能</el-menu-item>
        <el-menu-item index="4" @click="toPredict">性能预测</el-menu-item>
        <el-menu-item index="5" @click="toImageRecognition">图像识别</el-menu-item>
      </el-menu>



    </div>

    <div
      class="right-menu"
      v-if="avatarState"
    >
      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <img
            :src="avatar"
            class="user-avatar"
            @click="toUser"
          >
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item
            divided
            @click.native="logout"
          >
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <div
      class="please-login"
      v-else
    >
      <router-link to="/user/profile">使用功能，请先登录哦~</router-link>
    </div>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      activeIndex: "",
    };
  },
  computed: {
    ...mapGetters(["avatar"]),
    avatarState: {
      get() {
        return this.$store.state.user.avatarState;
      },
    },
  },
  created() {
    let path = this.$router.history.current.path;
    // console.log(path)
    if (path.includes("/alloycomposition")) {
      this.activeIndex = "3";
    }else if(path.includes("/datasearch")){
      this.activeIndex = "2"
    }else if(path.includes("/datapredict")){
      this.activeIndex = "4"
    }else if(path.includes("/imagerecognition")){
      this.activeIndex = "5"
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },

    async logout() {
      this.$confirm("确定注销并退出系统吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$store.dispatch("LogOut").then(() => {
            location.href = "/index";
          });
        })
        .catch(() => {});
    },
    toUser() {
      this.$router.push("/user/profile");
    },
    toIndex() {
      this.$router.push("/");
    },
    toDatabase() {
      this.$router.push("/datasearch");
    },
    toPredict() {
      this.$router.push("/datapredict");
    },
    toImageRecognition() {
      this.$router.push("/imagerecognition");
    },
    toAboutUs() {
      this.$router.push("/aboutus");
    },
    toAlloyComposition() {
      this.$router.push("/alloycomposition");
    },
  },
};
</script>

<style lang="scss" scoped>
.datasearch-nav {
  width: 100%;
  position: absolute;
  top: 0;
  height: 60px;
  background-color: rgb(255, 255, 255);
  color: rgb(50, 50, 50);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
.datasearch-nav a:hover {
  color: #5a5a5a;
}
.list {
  height: 60px;
  line-height: 60px;
  text-align: center;
  display: flex;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.el-menu-item{
  font-size: 18px;
}
.datasearch-nav {
  .right-menu {
    float: right;
    height: 100%;
    line-height: 60px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #c5d0e6;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.el-dropdown-menu--medium {
  position: absolute;
  top: 60px !important;
  left: 93vw !important;
  transform-origin: center top;
  z-index: 2001;
}
.please-login a {
  display: block;
  height: 60px;
  line-height: 60px;
  padding-right: 20px;
  position: absolute;
  right: 0;
  top: 0;
  color: white;
  font-size: 16px;
}
.please-login a:hover {
  color: #4385ffe2;
}
.image-recognition{
  width: 100%;
  height: 100%;
}
</style>
