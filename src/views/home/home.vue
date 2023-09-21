<template>
  <div class="home-inline">
    <home-header></home-header>

    <div class="home-main">
      <div class="main-inline">
        <div class="main-inline-in">

          <chemical></chemical>
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
import Chemical from "../database/Chemical";
import DataTool from './Home/dataTool.vue';
import homeFooter from "./Home/homeFooter";
import HomeHeader from './Home/homeHeader.vue';
import team from './Home/team.vue';
export default {
  components: {
    homeFooter,
    HomeHeader,
    Chemical,
    team,
    DataTool,
  },
};
</script>
<!--  -->
<style scoped>
.home-inline{
  position: relative;
  height: 1970px;
  width: 100%;
}
.home-main{
  width: 100%;
  position: absolute;
  top: 340px;
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

.home-footer{
  position: absolute;
  bottom: 0;
}
</style>
