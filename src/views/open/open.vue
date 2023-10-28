<template>
  <div class="open-area">
    <div class="header">
      <open-nav></open-nav>
    </div>

    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import OpenNav from '@/components/OpenNav/index.vue'
export default {
  components:{OpenNav,}
}
</script>

<style>
.open-area{
  background-color: rgb(242, 243, 245);
  min-height: 100vh;
}
.main{
  min-height:calc(100% - 60px)
}
</style>
