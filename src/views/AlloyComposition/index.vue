<template>
  <div class="alloy-composition-main">
    <small-nav></small-nav>
    <back-profile title="合金成分查询性能"></back-profile>

    <div class="ac-show">
      <router-view></router-view>
    </div>

  </div>
</template>

<script>
import SmallNav from "../../components/smallNav/smallNav.vue";
import BackProfile from '../../components/BackProfile/index.vue'

export default {
  components: {  SmallNav,BackProfile },
};
</script>

<style scoped>
.alloy-composition-main {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #edeff9;
}
.ac-show {
  width: 70vw;
  min-height: 70vh;
  position: absolute;
  top: calc(5vh + 115px);
  left: 50%;
  transform: translatex(-50%);
  background-color: #fff;
  padding: 2vw;
  margin-top: 3vh;
}
</style>
