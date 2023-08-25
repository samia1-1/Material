<template>
  <div class="datasearch-nav">
    <div class="list">
      <div class="list-item">
        <a href="#" @click="toIndex">首页</a>
      </div>

      <div class="list-item">
        <a href="#" @click="toDatabase">材料数据</a>
      </div>

      <div class="list-item">
        <a href="#" @click="toPredict">性能预测</a>
      </div>

      <div class="list-item">
        <a href="#" @click="toAboutUs">关于我们</a>
      </div>

    </div>

    <div class="right-menu">
    <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
      <div class="avatar-wrapper">
        <img :src="avatar" class="user-avatar" @click="toUser">
        <i class="el-icon-caret-bottom" />
      </div>
      <el-dropdown-menu slot="dropdown">
        <router-link to="/user/profile">
          <el-dropdown-item>个人中心</el-dropdown-item>
        </router-link>
        <el-dropdown-item divided @click.native="logout">
          <span>退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      }
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/index';
        })
      }).catch(() => {});
    },
    toUser(){
      this.$router.push('/user/profile')
    },
    toIndex(){
      this.$router.push('/index')
    },
    toPredict(){
      this.$router.push('/datapredict')
    },
    toDatabase(){
      this.$router.push('/datasearch')
    },
    toAboutUs(){
      this.$router.push('/aboutus')
    }
  }
}
</script>

<style lang="scss" scoped>
.datasearch-nav{
  width: 100%;
  position: absolute;
  top: 0;
  height: 60px;
  background-image: linear-gradient(to bottom,#f6f8fa,#ffffff);
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}
.datasearch-nav a:hover{
  color: #152280;
}
.list{
  height: 60px;
  line-height: 60px;
  text-align: center;
  display: flex;
  position: absolute;
  left: 300px;
}
.list .list-item a{
  display: block;
  width: 100px;
}
.list .list-item a:hover{
  background-color: #dde5f52d;
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
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
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
</style>
