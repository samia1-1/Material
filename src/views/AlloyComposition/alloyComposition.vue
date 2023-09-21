<template>
  <div class="app-container">
    <small-nav></small-nav>

<div class="ac-div">
  <ac-select></ac-select>
</div>
<div class="ac-show">
  <router-view></router-view>
</div>

  </div>
</template>

<script>
import SmallNav from '../../components/smallNav/smallNav.vue';
import AcSelect from './components/acSelect';

export default {
  components: { AcSelect, SmallNav },

};
</script>

<style scoped>
.app-container{
  position: relative;
}

.ac-div{
  position: absolute;
  left: 0;
  top: 60px;
}
.ac-show{
  width: 80%-250px;
  position: absolute;
  left: 250px;
  top: 60px;
  padding: 5%;
}
</style>
