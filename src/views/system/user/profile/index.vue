<template>
  <div class="user-info">
    <div class="user-info-list">
      <div class="text-left">
        <userAvatar :user="user" />
      </div>

      <ul class="list-group list-group-striped">
        <li class="list-group-item">
          <svg-icon icon-class="user" /> 用户名称
          <div class="pull-right">{{ user.userName }}</div>
        </li>
        <li class="list-group-item">
          <svg-icon icon-class="phone" /> 手机号码
          <div class="pull-right">{{ user.phonenumber }}</div>
        </li>
        <li class="list-group-item">
          <svg-icon icon-class="email" /> 用户邮箱
          <div class="pull-right">{{ user.email }}</div>
        </li>
      </ul>

      <div class="change-info">
        <router-link to="/user/changeinfo">修改资料</router-link>
      </div>
    </div>

    <div class="user-show">
      <div class="detail-list">
        <el-tabs
          id="header"
          v-model="activeName"
          class="demo-tabs"
        >
          <el-tab-pane
            label="上传数据集"
            name="first"
          >
            <div v-if="listdata === 0">
              <el-empty description="无上传的数据集" />
            </div>

            <div v-else></div>
          </el-tab-pane>

          <el-tab-pane
            label="收藏"
            name="third"
          >
            <div v-if="listdata === 0">
              <el-empty description="暂无收藏" />
            </div>
            <div v-else>收藏</div>
          </el-tab-pane>

        </el-tabs>

      </div>
    </div>

    <!-- <div
      slot="header"
      class="clearfix"
    >
      <span>基本资料</span>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane
        label="基本资料"
        name="userinfo"
      >
        <userInfo :user="user" />
      </el-tab-pane>
      <el-tab-pane
        label="修改密码"
        name="resetPwd"
      >
        <resetPwd />
      </el-tab-pane>
    </el-tabs> -->

    <!-- max-width: 200px;
max-height: 70px;
min-width: 100px;
min-height: 35px; -->

  </div>
</template>

<script>
import userAvatar from "./userAvatar";
import { getUserProfile } from "@/api/system/user";

export default {
  name: "Profile",
  components: { userAvatar, },
  data() {
    return {
      user: {},
      roleGroup: {},
      postGroup: {},
      activeTab: "userinfo",
      activeName: "first",
      listdata: 0,
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    getUser() {
      getUserProfile().then((response) => {
        this.$store.state.user.userInfo = response.data;
        this.user = response.data;
        this.roleGroup = response.roleGroup;
        this.postGroup = response.postGroup;
      });
    },
  },
};
</script>

<style scoped>
.user-info-list {
  height: 25vh;
  width: 70vw;
  margin: 5vh auto;
  background-color: #fff;
  border-radius: 7px;
  padding: 5vh;
  position: relative;
}
.text-left {
  position: absolute;
  border-radius: 50%;
  height: 11vh;
  width: 11vh;
  min-width: 120px;
  max-width: 120px;
}
.list-group-striped {
  position: absolute;
  left: 25vh;
  min-width: 350px;
}
.list-group-item {
  width: 17vw;
  height: 7vh;
  font-size: 2vh;
  border: none;
  min-width: 70px;
}

.change-info a {
  position: absolute;
  display: block;
  right: 4vw;
  padding: 0;
  width: 10vh;
  height: 3.5vh;
  line-height: 3.5vh;
  font-size: 2vh;
  text-align-last: center;
  background-color: #bcbec7;
  color: #fff;
  border: #fff;
  border-radius: 5px;
}
.change-info a:hover{
  cursor: pointer;
  background-color: #a5a6ae;
}

.user-show {
  margin-top: 5vh;
  min-height: 40vh;
  width: 70vw;
  margin: 0 auto;
  background-color: #fff;
  position: relative;
}
.detail-list {
  margin-top: 2vw;
}
.demo-tabs {
  height: 10vh;
}
.el-tabs__header {
  height: 10vh;
}
.el-tabs__nav {
  font-size: 2vh;
}
.el-tabs__item {
  font-size: 2vh !important;
}
#tab-first{
  margin-left: 20px;
}
</style>
