<template>
  <div class="home-inline">
    <home-header></home-header>

    <div class="home-main">
      <div class="home-button-list"><home-button></home-button></div>

      <div class="main-inline">
        <div class="main-inline-in">

          <home-intro></home-intro>
          <!-- <open-function></open-function> -->
          <data-tool></data-tool>
          <team></team>

        </div>
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
import HomeHeader from './Home/homeHeader.vue';
import HomeIntro from './Home/homeIntro.vue';
import OpenFunction from './Home/OpenFunction/openFunction.vue';
import team from './Home/team.vue';
import HomeButton from '@/components/HomeButton/index.vue'
export default {
  components: {
    homeFooter,
    HomeHeader,
    team,
    DataTool,
    HomeIntro,
    OpenFunction,
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
  margin: -160px 0 80px 0 ;
  position: relative;
}
.home-main .main-inline{
  margin: 20px auto;
}
.home-main .main-inline-in{
  position: relative;
    width: 1200px;
    left: 50%;
    -webkit-transform: translate(-50%);
    transform: translate(-50%);
    padding-bottom: 70px;
    background-color: #fff;
    -webkit-box-shadow: 0 0 3px rgba(0,0,0,.25), -20px 20px hsla(0,0%,89.8%,.7);
    box-shadow: 0 0 3px rgba(0,0,0,.25), -20px 20px hsla(0,0%,89.8%,.7);
    border-radius: 3px;
    overflow: hidden;
}
.home-button-list{
  position: fixed;
  top:50% ;
  right: 10px;
}
</style>
