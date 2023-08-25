<template>
  <span class="pointer" ref="point" @click="changeState"></span>
</template>

<script>
export default {
  props:['state'],
data(){
  return{
  }
},
watch:{
  // state:function(newValue,oldValue){
  //   if(newValue === true){
  //     this.$refs.point.style = "background-color: hsl(55, 100%, 50%);"
  //   }else{
  //     this.$refs.point.style = "background-color: rgba(255, 255, 255, 0.1);"
  //   }
  // }
},
methods:{
  changeState(){
    this.state = !this.state;
  }
}
}
</script>

<style>
.pointer{
  display: block;
  width: 10px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
}
span.pointer:hover{
  display: block;
  background-color: hsl(55, 100%, 50%)!important;
}
</style>
