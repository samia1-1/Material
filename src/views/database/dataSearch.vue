<template>
  <div class="data-serach">
    <data-nav></data-nav>
    <data-select></data-select>
    <div class="data-select-show">
      <router-view></router-view>
    </div>

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
    }
}
</script>

<style scoped>
.data-serach{
  width: 100%;
  position: relative;
}
.data-select-show{
  min-height: 600px;
  position: absolute;
  right: 5%;
  top: 100px;
  width: 65%;
  background-image: linear-gradient(to bottom,#ffffff,#eeeeee);
  border: 1px solid #eee;
}
</style>
