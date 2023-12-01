<template>
  <div class="header-nav">

    <!-- <div class="header-nav-item">
      <router-link to="/">
        <img src="" alt="logo" class="logo">
      </router-link>
    </div> -->

    <div class="header-nav-item">
      <router-link to="/">首页</router-link>
    </div>

    <div class="header-nav-item">
      <router-link to="/datasearch">材料数据</router-link>
    </div>

    <div class="header-nav-item">
      <router-link to="/alloycomposition">合金成分查询性能</router-link>
    </div>

    <div class="header-nav-item">
      <router-link to="/datapredict">性能预测</router-link>
    </div>

    <div class="header-nav-item">
      <!-- <a href="http://124.221.104.7:5000" target="_blank">图像识别</a> -->
      <router-link to="/imagerecognition" target="_blank">图像识别</router-link>
    </div>

    <div class="header-nav-item">
      <router-link to="/aboutus">关于我们</router-link>
    </div>

    <!-- <div class="header-nav-item">
      <router-link to="/open">开放空间</router-link>
    </div> -->

    <div class="right-menu" v-if="avatarState">
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" @click="toUser">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" >
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- <div class="please-login" v-else>
      <router-link to="/user/profile">使用功能，请先登录</router-link>
    </div> -->


  </div>

</template>

<script>
import {getListBrands} from "@/api/database/Chemical.js";
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters([
      'avatar',
    ]),
    avatarState:{
      get() {
        getListBrands().then((res) => {});
        return this.$store.state.user.avatarState;
      }
    }
    // setting: {
    //   get() {
    //     return this.$store.state.settings.showSettings
    //   },
    //   set(val) {
    //     this.$store.dispatch('settings/changeSetting', {
    //       key: 'showSettings',
    //       value: val
    //     })
    //   }
    // },
  },
  methods: {
    async logout() {
      this.$confirm('确定退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/';
        })
      }).catch(() => {});
    },
    toUser(){
      this.$router.push('/user/profile')
    },
  },
}
</script>

<style lang="scss" scoped>
.header-nav{
  height: 60px;
  display:flex;
  justify-content : center;
  color: aliceblue;
}
.header-nav-item{
  width: 160px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
}
.header-nav-item{
  width: 160px;
  height: 60px;
  line-height: 60px;
  text-align: center;
}
.dropdown-1{
  position: absolute;
  height: 50px;
  background-color: aliceblue;
  width: 160px;
}
.header-nav-item a:hover{
  text-decoration: none;
  color: aqua;
}

.header-nav {
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
    color: #1f2021;
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
.el-dropdown-menu--medium{
position: absolute;
top: 60px !important;
left: 93% !important;
transform-origin: center top;
z-index: 2001;
}
.please-login a{
  display: block;
  height: 60px;
  line-height: 60px;
  padding-right: 20px;
  position: absolute;
  right: 0;
  top: 0;
  color: white;
  font-size:16px;
}
.please-login a:hover{
  color: rgb(255, 255, 72);
}
</style>
