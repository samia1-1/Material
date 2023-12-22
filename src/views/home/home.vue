<template>
  <div class="home-inline">
    <home-header></home-header>

    <div class="home-main">
      <div class="home-button-list"><home-button></home-button></div>

      <div class="main-inline">

          <home-intro></home-intro>
          <data-tool></data-tool>
          <team></team>

      </div>
    </div>

    <div class="home-footer">
      <home-footer></home-footer>
    </div>


  </div>
</template>

<script scoped>
import DataTool from './Home/dataTool.vue';
import homeFooter from "./Home/homeFooter";
import HomeHeader from './Home/homeHeader';
import HomeIntro from './Home/homeIntro';
import team from './Home/team.vue';
import HomeButton from '@/components/HomeButton/index.vue'
export default {
  components: {
    homeFooter,
    HomeHeader,
    team,
    DataTool,
    HomeIntro,
    HomeButton,
  },
};
</script>

<style scoped>
.home-inline{
  position: relative;
  width: 100%;
  height: auto;
}
.home-main{
  width: 100%;
  margin: -160px 0 100px 0 ;
  position: relative;
}
.home-main .main-inline{
  margin: 20px auto;
  width: 67vw;
  box-shadow: 0 0 3px rgba(0,0,0,.25), -20px 20px hsla(0,0%,89.8%,.7);
  border-radius: 3px;
  padding-bottom: 70px;
}

.home-button-list{
  position: fixed;
  top:50% ;
  right: 10px;
}
</style>
