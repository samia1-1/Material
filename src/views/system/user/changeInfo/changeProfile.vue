<template>
  <div class="change-profile">
    <user-info :user="user"></user-info>
  </div>
</template>

<script>
import userInfo from './userInfo'
export default {
  components: { userInfo },
  data(){
    return{
      user:''
    }
  },
  created(){
    this.user = this.$store.state.user.userInfo
  }

}
</script>

<style>
.change-profile{
  padding: 5vh;
}
</style>
