<template>
  <div class="data-serach">
    <small-nav></small-nav>
    <data-select></data-select>
    <div class="data-select-show">
      <router-view></router-view>
    </div>

  </div>
</template>

<script>
import SmallNav from '../../components/smallNav/smallNav.vue';
import DataSelect from './component/dataSelect';
export default {
  components:{
    DataSelect,
    SmallNav,
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
  background-image: linear-gradient(to bottom,#ffffff,#dedede);
  border: 1px solid #eee;
}
</style>
