<template>
  <div class="user">
    <user-nav></user-nav>
    <div class="user-main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import userNav from './profile/userNav.vue'
export default {
  components: { userNav },

}
</script>

<style scoped>
.user{
  position: relative;
}
.user-main{
  position: absolute;
  top: 80px;
  width: 1200px;
  background-image: linear-gradient(to bottom,#f6f8fa,#ffffff);
  height: 700px;
  left: 120px;
}
</style>
