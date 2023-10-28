<template>
  <div class="change-account">
    <reset-pwd :user="user"></reset-pwd>
  </div>
</template>

<script>
import ResetPwd from './resetPwd'
export default {
  components:{
    ResetPwd,
  },
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
.change-account{
  padding: 5vh;
}
</style>
