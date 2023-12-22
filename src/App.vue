<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: "App",
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
  font-size: 14px;
}
#app{
  height: 100% !important;
}
</style>
