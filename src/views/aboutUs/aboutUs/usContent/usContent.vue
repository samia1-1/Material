<template>
  <div class="content-main">
    <us-content-header></us-content-header>
    <div class="us-content-show">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import usContentHeader from './usContentHeader.vue'
export default {
  components: { usContentHeader },
  created(){
  }
}
</script>

<style scoped>

</style>
