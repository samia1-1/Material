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
    <!-- <table
      cellspacing="0"
      border="1"
    >
      <tr>
        <td
          @click="click1W2"
          :class="{highlight:this.stateSpan.showState1W2}"
          style="width:20%"
        >
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td
          @click="click1W3"
          :class="{highlight:this.stateSpan.showState1W3}"
          style="width:20%"
        >
          <alloy-span nameShow="W"></alloy-span>
        </td>
        <td
          @click="click1W4"
          :class="{highlight:this.stateSpan.showState1W4}"
          style="width:20%"
        >
          <alloy-span nameShow="Mo"></alloy-span>
        </td>
        <td
          @click="click1W22"
          :class="{highlight:this.stateSpan.showState1W22}"
          style="width:20%"
        >
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td
          @click="click1W5"
          :class="{highlight:this.stateSpan.showState1W5}"
          style="width:20%"
        >
          <alloy-span nameShow="Cr"></alloy-span>
        </td>
      </tr>
      <tr>
        <td
          @click="click2W1"
          colspan="5"
          class="row2"
          :class="{highlight:this.stateSpan.showState2W1}"
        >
          <alloy-span nameShow="Ni"></alloy-span>
        </td>
      </tr>
      <tr>
        <td
          @click="click3W2"
          :class="{highlight:this.stateSpan.showState3W2}"
          style="width:20%"
        >
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td
          @click="click3W6"
          :class="{highlight:this.stateSpan.showState3W6}"
          style="width:20%"
        >
          <alloy-span nameShow="Al"></alloy-span>
        </td>
        <td
          @click="click3W7"
          :class="{highlight:this.stateSpan.showState3W7}"
          style="width:20%"
        >
          <alloy-span nameShow="Ti"></alloy-span>
        </td>
        <td
          @click="click3W22"
          :class="{highlight:this.stateSpan.showState3W22}"
          style="width:20%"
        >
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td
          @click="click3W8"
          :class="{highlight:this.stateSpan.showState3W8}"
          style="width:20%"
        >
          <alloy-span nameShow="Ta"></alloy-span>
        </td>
      </tr>
      <tr>
        <td
          @click="click4W1"
          colspan="5"
          class="row4"
          :class="{highlight:this.stateSpan.showState4W1}"
        >
          <alloy-span nameShow="Ni"></alloy-span>
        </td>
      </tr>
      <tr>
        <td
          @click="click5W7"
          :class="{highlight:this.stateSpan.showState5W7}"
          style="width:20%"
        >
          <alloy-span nameShow="Ti"></alloy-span>
        </td>
        <td
          @click="click5W3"
          :class="{highlight:this.stateSpan.showState5W3}"
          style="width:20%"
        >
          <alloy-span nameShow="W"></alloy-span>
        </td>
        <td
          @click="click5W6"
          :class="{highlight:this.stateSpan.showState5W6}"
          style="width:20%"
        >
          <alloy-span nameShow="Al"></alloy-span>
        </td>
        <td
          @click="click5W4"
          :class="{highlight:this.stateSpan.showState5W4}"
          style="width:20%"
        >
          <alloy-span nameShow="Mo"></alloy-span>
        </td>
        <td
          @click="click5W77"
          :class="{highlight:this.stateSpan.showState5W77}"
          style="width:20%"
        >
          <alloy-span nameShow="Ti"></alloy-span>
        </td>
      </tr>
    </table> -->
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
  props: ["wz"],
  data() {
    return {
      // stateSpan: {
      //   showState1W2: false,
      //   showState1W3: false,
      //   showState1W4: false,
      //   showState1W22: false,
      //   showState1W5: false,
      //   showState2W1: false,
      //   showState3W2: false,
      //   showState3W6: false,
      //   showState3W7: false,
      //   showState3W22: false,
      //   showState3W8: false,
      //   showState4W1: false,
      //   showState5W7: false,
      //   showState5W3: false,
      //   showState5W6: false,
      //   showState5W4: false,
      //   showState5W77: false,
      // },
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
      Design: [],
      points:['w123','w134','w125','w126','w136','w142','w147','w164','w167','w172','w173']
    };
  },
  watch: {
    // stateSpan: {
    //   handler(newValue, oldValue) {
    //     this.clickState();
    //   },
    //   deep: true,
    // },
    // statePoint: {
    //   handler(newValue, oldValue) {
    //     this.checkPoint();
    //   },
    //   deep: true,
    // },
  },
  methods: {
    // test(value){
    //   let name = "state" + value;
    //   if(this.statePoint[name] === true){
    //     document.getElementsByClassName(value)[0].style = "background-color: hsl(55, 100%, 50%)!important;"
    //   }else{
    //     document.getElementsByClassName(value)[0].style = "background-color: rgba(255, 255, 255, 0.1);"
    //   }
    // },
    // click1W2() {
    //   this.stateSpan.showState1W2 = !this.stateSpan.showState1W2;
    // },
    // click1W3() {
    //   this.stateSpan.showState1W3 = !this.stateSpan.showState1W3;
    // },
    // click1W4() {
    //   this.stateSpan.showState1W4 = !this.stateSpan.showState1W4;
    // },
    // click1W22() {
    //   this.stateSpan.showState1W22 = !this.stateSpan.showState1W22;
    // },
    // click1W5() {
    //   this.stateSpan.showState1W5 = !this.stateSpan.showState1W5;
    // },
    // click2W1() {
    //   this.stateSpan.showState2W1 = !this.stateSpan.showState2W1;
    // },
    // click3W2() {
    //   this.stateSpan.showState3W2 = !this.stateSpan.showState3W2;
    // },
    // click3W6() {
    //   this.stateSpan.showState3W6 = !this.stateSpan.showState3W6;
    // },
    // click3W7() {
    //   this.stateSpan.showState3W7 = !this.stateSpan.showState3W7;
    // },
    // click3W22() {
    //   this.stateSpan.showState3W22 = !this.stateSpan.showState3W22;
    // },
    // click3W8() {
    //   this.stateSpan.showState3W8 = !this.stateSpan.showState3W8;
    // },
    // click4W1() {
    //   this.stateSpan.showState4W1 = !this.stateSpan.showState4W1;
    // },
    // click5W7() {
    //   this.stateSpan.showState5W7 = !this.stateSpan.showState5W7;
    // },
    // click5W3() {
    //   this.stateSpan.showState5W3 = !this.stateSpan.showState5W3;
    // },
    // click5W6() {
    //   this.stateSpan.showState5W6 = !this.stateSpan.showState5W6;
    // },
    // click5W4() {
    //   this.stateSpan.showState5W4 = !this.stateSpan.showState5W4;
    // },
    // click5W77() {
    //   this.stateSpan.showState5W77 = !this.stateSpan.showState5W77;
    // },
    // clickState() {
    //   if(this.stateSpan.showState1W2 === true &&
    //     this.stateSpan.showState1W3 === true &&
    //     this.stateSpan.showState2W1 === true &&
    //     this.statePoint.statew123 === false
    //   ) {
    //     this.statePoint.statew123 = true;
    //     this.$message({
    //       message: "选择123成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w123");
    //   } else {
    //     this.statePoint.statew123 = false;
    //     this.Design.pop("w123");
    //   }

    //   if (
    //     this.stateSpan.showState1W3 === true &&
    //     this.stateSpan.showState2W1 === true &&
    //     this.stateSpan.showState1W4 === true &&
    //     this.statePoint.statew134 === false
    //   ) {
    //     this.statePoint.statew134 = true;
    //     this.$message({
    //       message: "选择134成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w134");
    //   } else {
    //     this.statePoint.statew134 = false;
    //     this.Design.pop("w134");
    //   }

    //   if (
    //     this.stateSpan.showState1W22 === true &&
    //     this.stateSpan.showState2W1 === true &&
    //     this.stateSpan.showState1W5 === true &&
    //     this.statePoint.statew125 === false
    //   ) {
    //     this.statePoint.statew125 = true;
    //     this.$message({
    //       message: "选择125成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w125");
    //   } else {
    //     this.statePoint.statew125 = false;
    //     this.Design.pop("w125");
    //   }

    //   if (
    //     this.stateSpan.showState3W2 === true &&
    //     this.stateSpan.showState2W1 === true &&
    //     this.stateSpan.showState3W6 === true &&
    //     this.statePoint.statew126 === false
    //   ) {
    //     this.statePoint.statew126 = true;
    //     this.$message({
    //       message: "选择126成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w126");
    //   } else {
    //     this.statePoint.statew126 = false;
    //     this.Design.pop("w126");
    //   }

    //   if (
    //     this.stateSpan.showState5W3 === true &&
    //     this.stateSpan.showState4W1 === true &&
    //     this.stateSpan.showState5W6 === true &&
    //     this.statePoint.statew136 === false
    //   ) {
    //     this.statePoint.statew136 = true;
    //     this.$message({
    //       message: "选择136成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w136");
    //   } else {
    //     this.statePoint.statew136 = false;
    //     this.Design.pop("w136");
    //   }

    //   if (
    //     this.stateSpan.showState1W4 === true &&
    //     this.stateSpan.showState2W1 === true &&
    //     this.stateSpan.showState1W22 === true &&
    //     this.statePoint.statew142 === false
    //   ) {
    //     this.statePoint.statew142 = true;
    //     this.$message({
    //       message: "选择142成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w142");
    //   } else {
    //     this.statePoint.statew142 = false;
    //     this.Design.pop("w142");
    //   }

    //   if (
    //     this.stateSpan.showState5W4 === true &&
    //     this.stateSpan.showState4W1 === true &&
    //     this.stateSpan.showState5W77 === true &&
    //     this.statePoint.statew134 === false
    //   ) {
    //     this.statePoint.statew147 = true;
    //     this.$message({
    //       message: "选择147成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w147");
    //   } else {
    //     this.statePoint.statew147 = false;
    //     this.Design.push("w147");
    //   }

    //   if (
    //     this.stateSpan.showState5W6 === true &&
    //     this.stateSpan.showState4W1 === true &&
    //     this.stateSpan.showState5W4 === true &&
    //     this.statePoint.statew164 === false
    //   ) {
    //     this.statePoint.statew164 = true;
    //     this.$message({
    //       message: "选择164成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w164");
    //   } else {
    //     this.statePoint.statew164 = false;
    //     this.Design.pop("w164");
    //   }

    //   if (
    //     this.stateSpan.showState3W6 === true &&
    //     this.stateSpan.showState2W1 === true &&
    //     this.stateSpan.showState3W7 === true &&
    //     this.statePoint.statew167 === false
    //   ) {
    //     this.statePoint.statew167 = true;
    //     this.$message({
    //       message: "选择167成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w167");
    //   } else {
    //     this.statePoint.statew167 = false;
    //     this.Design.pop("w167");
    //   }

    //   if (
    //     this.stateSpan.showState3W22 === true &&
    //     this.stateSpan.showState2W1 === true &&
    //     this.stateSpan.showState3W7 === true &&
    //     this.statePoint.statew172 === false
    //   ) {
    //     this.statePoint.statew172 = true;
    //     this.$message({
    //       message: "选择172成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w172");
    //   } else {
    //     this.statePoint.statew172 = false;
    //     this.Design.pop("w172");
    //   }

    //   if (
    //     this.stateSpan.showState5W3 === true &&
    //     this.stateSpan.showState4W1 === true &&
    //     this.stateSpan.showState5W7 === true &&
    //     this.statePoint.statew173 === false
    //   ) {
    //     this.statePoint.statew173 = true;
    //     this.$message({
    //       message: "选择173成功！",
    //       type: "success",
    //     });
    //     this.Design.push("w173");
    //   } else {
    //     this.statePoint.statew173 = false;
    //     this.Design.pop("w173");
    //   }
    // },
    // checkPoint(){
    //   this.test("w123")
    //   this.test("w134")
    //   this.test("w125")
    //   this.test("w126")
    //   this.test("w136")
    //   this.test("w142")
    //   this.test("w147")
    //   this.test("w164")
    //   this.test("w167")
    //   this.test("w172")
    //   this.test("w173")
    // },
    clickPoint(value){
      // console.log(value)
      let name = "state" + value
      this.statePoint[name] = !this.statePoint[name]
      if(this.statePoint[name] === true){
        this.Design.push(name)
        document.getElementsByClassName(value)[0].style = "background-color: hsl(55, 100%, 50%)!important;"
      }else{
        this.Design.pop(name)
        document.getElementsByClassName(value)[0].style = "background-color: rgba(255, 255, 255, 0.1);"
      }
    }
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
