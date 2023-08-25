<template>
  <div id="app">
    <router-view />
    <!-- <theme-picker /> -->
  </div>
</template>

<script>
import ThemePicker from "@/components/ThemePicker";

export default {
  name: "App",
  components: { ThemePicker },
  created(){
    this.$store.dispatch('app/toggleSideBarHide', true)
  },
    metaInfo() {
        return {
            title: this.$store.state.settings.dynamicTitle && this.$store.state.settings.title,
            titleTemplate: title => {
                return title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE
            }
        }
    }

};
</script>
<style scoped>
body{
  padding: 0;
  margin: 0;
}
#app .theme-picker {
  display: none;
}
</style>
