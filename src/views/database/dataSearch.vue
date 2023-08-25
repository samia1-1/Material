<template>
  <div class="data-serach">
    <data-nav></data-nav>
    <data-select></data-select>
    <div class="data-select-show">
      <router-view></router-view>
    </div>

    <!-- <div class="alloy-show">
      <alloy-composition></alloy-composition>
    </div> -->
  </div>
</template>

<script>
import DataNav from './component/dataNav';
import DataSelect from './component/dataSelect';
import AlloyComposition from '../database/AlloyComposition/alloyComposition.vue';
export default {
  components:{
    DataSelect,
    DataNav,
    AlloyComposition,
  },
  data() {
      return {
        activeIndex: '1',
      };
    },
    methods: {
      // getStretchData(){
      //   this.router.replase('/datesearch')
      // },
      // getExtremesData(){
      //   this.$router.push('/datesearch/extreme')
      // },
      // getPropertieData(){
      //   this.$router.push('/datesearch/extreme')
      // },
      // getCreepData(){
      //   this.$router.push('/datesearch/extreme')
      // }
    }
}
</script>

<style>
.data-serach{
  width: 100%;
  position: relative;
}
.data-select-show{
  min-height: 600px;
  position: absolute;
  right: 80px;
  top: 100px;
  width: 1100px;
  background-image: linear-gradient(to bottom,#ffffff,#eeeeee);
  border: 1px solid #eee;
  margin-bottom: 130px;
}
</style>
