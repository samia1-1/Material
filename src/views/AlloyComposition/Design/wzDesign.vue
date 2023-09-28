<template>
  <div class="design">
    <table
      cellspacing="0"
      border="1"
    >
      <tr>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="W"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Mo"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Cr"></alloy-span>
        </td>
      </tr>
      <tr>
        <td
          colspan="5"
          class="row2"
        >
          <alloy-span nameShow="Ni"></alloy-span>
        </td>
      </tr>
      <tr>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Al"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Ti"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Ta"></alloy-span>
        </td>
      </tr>
      <tr>
        <td
          colspan="5"
          class="row4"
        >
          <alloy-span nameShow="Ni"></alloy-span>
        </td>
      </tr>
      <tr>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Ti"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="W"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Al"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Mo"></alloy-span>
        </td>
        <td
          style="width:20%"
        >
          <alloy-span nameShow="Ti"></alloy-span>
        </td>
      </tr>
    </table>
    <div
      class="wshow"
    >
      <span v-for="(item,index) in points" class="pointer" :class="item" :key="index" @click="clickPoint(item)"></span>
    </div>

  </div>
</template>

<script>
import AlloySpan from "./Pointer/alloySpan.vue";
export default {
  components: {
    AlloySpan,
  },
  props: ["wz","Design","deleteDesignItem"],
  data() {
    return {
      stateNow: 0,
      statePoint:{
        statew123: false,
        statew134: false,
        statew125: false,
        statew126: false,
        statew136: false,
        statew142: false,
        statew147: false,
        statew164: false,
        statew167: false,
        statew172: false,
        statew173: false,
      },
      points:['w123','w134','w125','w126','w136','w142','w147','w164','w167','w172','w173']
    };
  },
  watch: {
  },
  methods: {
    clickPoint(value){
      let name = "state" + value
      this.statePoint[name] = !this.statePoint[name]
      if(this.statePoint[name] === true){
        this.deleteDesignItem()
        this.Design.push(name)
        document.getElementsByClassName(value)[0].style = "background-color: hsl(55, 100%, 50%)!important;"
      }else{
        this.Design.pop(name)
        document.getElementsByClassName(value)[0].style = "background-color: rgba(255, 255, 255, 0.1);"
      }
    },

  },
};
</script>

<style>
.design {
  position: relative;
}
.design table {
  width: 500px;
  height: 250px;
}
.design td {
  font-size: 17px;
  text-align: center;
}
.design td:hover {
  background-color: rgb(92, 188, 129);
  cursor: pointer;
}
.row2,
.row4 {
  background-color: rgb(153, 169, 218);
}
.w123 {
  position: absolute;
  top: 45px;
  left: 95px;
}
.w134 {
  position: absolute;
  top: 45px;
  left: 195px;
}
.w125 {
  position: absolute;
  top: 45px;
  left: 395px;
}
.w126 {
  position: absolute;
  top: 95px;
  left: 95px;
}
.w136 {
  position: absolute;
  top: 195px;
  left: 195px;
}
.w142 {
  position: absolute;
  top: 45px;
  left: 295px;
}
.w147 {
  position: absolute;
  top: 195px;
  left: 395px;
}
.w164 {
  position: absolute;
  top: 195px;
  left: 295px;
}
.w167 {
  position: absolute;
  top: 95px;
  left: 195px;
}
.w172 {
  position: absolute;
  top: 95px;
  left: 295px;
}
.w173 {
  position: absolute;
  top: 195px;
  left: 95px;
}
.z123 {
  position: absolute;
  top: 0px;
  left: 97px;
}

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
