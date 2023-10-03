<template>
  <div class="user">
    <small-nav></small-nav>
    <div class="user-main">
        <router-view></router-view>
    </div>
  </div>
</template>

<script>
import SmallNav from '../../../components/smallNav/smallNav'
export default {
  components: {SmallNav  },

}
</script>

<style scoped>
.user{
  position: relative;
  width: 100%;
  height: 100%;
}
.user-main{
  height: calc(100% - 60px);
  width: 100%;
  position: absolute;
  top: 60px;
  background-color:#edeff9;
}
</style>
