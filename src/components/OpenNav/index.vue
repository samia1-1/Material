<template>
  <div class="open-nav">

    <div class="function-menu">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item index="1" @click="toOpenIndex">首页</el-menu-item>
        <el-menu-item index="2" @click="toOpenDatabase">开放数据区</el-menu-item>
        <el-menu-item index="3" @click="toOpenDiscussion">公开讨论区</el-menu-item>
        <el-menu-item index="4" @click="toUploadData">上传数据</el-menu-item>
        <!-- <el-menu-item index="3">首页</el-menu-item>
        <el-menu-item index="4">首页</el-menu-item>
        <el-menu-item index="5">首页</el-menu-item> -->

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
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      activeIndex: "1",
    };
  },
  mounted(){
    this.checkActive()

  },
  computed: {
    ...mapGetters(["avatar"]),
    avatarState: {
      get() {
        return this.$store.state.user.avatarState;
      },
    },
  },
  methods: {
    checkActive() {
      let path = this.$router.history.current.path;
      // console.log(path)
      if (path === "/open") {
        this.activeIndex = "1";
      } else if (path === "/open/database") {
        this.activeIndex = "2";
      }else if(path === "/open/discussion"){
        this.activeIndex = "3"
      }else if(path === "/open/upload_data"){
        this.activeIndex = "4"
      }
    },
    handleSelect(key, keyPath) {
    },
    async logout() {
      this.$confirm("确定注销并退出系统吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$store.dispatch("LogOut").then(() => {
            location.href = "/";
          });
        })
        .catch(() => {});
    },
    toUser() {
      this.$router.push("/user/profile");
    },
    toOpenDatabase(){
      this.$router.push('/open/database')
    },
    toOpenIndex(){
      this.$router.push('/open')
    },
    toOpenDiscussion(){
      this.$router.push('/open/discussion')
    },
    toUploadData(){
      this.$router.push('/open/upload_data')
    },
  },
};
</script>

<style lang="scss" scoped>
.open-nav {
  height: 60px;
  width: 100%;
  z-index: 999;
  background-color: #fff;
  position: relative;
}
.function-menu{
  position: absolute;
  left: 200px;
}

.open-nav {
  .right-menu {
    position: absolute;
    right: 0;
    top: 0;
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
.image-recognition {
  width: 100%;
  height: 100%;
}
</style>
