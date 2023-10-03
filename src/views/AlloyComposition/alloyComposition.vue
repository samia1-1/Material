<template>
  <div class="alloy-composition-main">
    <small-nav></small-nav>

    <!-- <div class="ac-div">
  <ac-select></ac-select>
</div> -->
    <div class="ac-show">
      <router-view></router-view>
    </div>

  </div>
</template>

<script>
import SmallNav from "../../components/smallNav/smallNav.vue";
import AcSelect from "./components/acSelect";

export default {
  components: { AcSelect, SmallNav },
};
</script>

<style scoped>
.alloy-composition-main {
  position: relative;
  width: 100%;
  height: 100%;
}
.ac-show {
  width: 1200px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
