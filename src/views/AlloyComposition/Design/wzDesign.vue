<template>
  <div class="design">
    <table
      cellspacing="0"
      border="1"
    >
      <tr>
        <td style="width:20%">
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td style="width:20%">
          <alloy-span nameShow="W"></alloy-span>
        </td>
        <td style="width:20%">
          <alloy-span nameShow="Mo"></alloy-span>
        </td>
        <td style="width:20%">
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td style="width:20%">
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
        <td style="width:20%">
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td style="width:20%">
          <alloy-span nameShow="Al"></alloy-span>
        </td>
        <td style="width:20%">
          <alloy-span nameShow="Ti"></alloy-span>
        </td>
        <td style="width:20%">
          <alloy-span nameShow="Co"></alloy-span>
        </td>
        <td style="width:20%">
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
        <td style="width:20%">
          <alloy-span nameShow="Ti"></alloy-span>
        </td>
        <td style="width:20%">
          <alloy-span nameShow="W"></alloy-span>
        </td>
        <td style="width:20%">
          <alloy-span nameShow="Al"></alloy-span>
        </td>
        <td style="width:20%">
          <alloy-span nameShow="Mo"></alloy-span>
        </td>
        <td style="width:20%">
          <alloy-span nameShow="Ti"></alloy-span>
        </td>
      </tr>
    </table>
    <div class="wshow">
      <span
        v-for="(item,index) in points"
        class="pointer"
        :class="item"
        :key="index"
        @click="clickPoint(item)"
      ></span>
    </div>

  </div>
</template>

<script>
import AlloySpan from "./Pointer/alloySpan.vue";
export default {
  components: {
    AlloySpan,
  },
  props: ["wz", "Design", "deleteDesignItem", "addDesignItem"],
  data() {
    return {
      statePoint: {
        state123: false,
        state134: false,
        state125: false,
        state126: false,
        state136: false,
        state142: false,
        state147: false,
        state164: false,
        state167: false,
        state172: false,
        state173: false,
      },
      points: [
        "state123",
        "state134",
        "state125",
        "state126",
        "state136",
        "state142",
        "state147",
        "state164",
        "state167",
        "state172",
        "state173",
      ],
    };
  },
  watch: {},
  methods: {
    clickPoint(value) {
      let name = value,
        flag = false;
      if (this.statePoint[name] === true) {
        flag = true;
      }
      for (let item in this.statePoint) {
        this.statePoint[item] = false;
      }
      if (name !== "" && flag) {
        this.statePoint[name] = false;
      } else {
        this.statePoint[name] = true;
      }
      this.deleteDesignItem();
      for (let item in this.statePoint) {
        if(!this.points.includes(item)) return;
        if (this.statePoint[item] === true && this.points.includes(item)) {
          this.addDesignItem(item);
          document.getElementsByClassName(item)[0].style =
            "background-color: hsl(55, 100%, 50%);";
        } else {
          document.getElementsByClassName(item)[0].style =
            "background-color: rgba(255, 255, 255, 0.1);";
        }
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
  width: 30vw;/*500px*/
  height: 25vh;/*250px*/
}
.design td {
  font-size: 2vh;
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
.state123 {
  position: absolute;
  top: 4.5vh;
  left: 5.5vw;
}
.state134 {
  position: absolute;
  top: 4.5vh;
  left: 11.5vw;
}
.state125 {
  position: absolute;
  top: 4.5vh;
  left: 23.5vw;
}
.state126 {
  position: absolute;
  top: 9.5vh;
  left: 5.5vw;
}
.state136 {
  position: absolute;
  top: 19.5vh;
  left: 11.5vw;
}
.state142 {
  position: absolute;
  top: 4.5vh;
  left: 17.5vw;
}
.state147 {
  position: absolute;
  top: 19.5vh;
  left: 23.5vw;
}
.state164 {
  position: absolute;
  top: 19.5vh;
  left: 17.5vw;
}
.state167 {
  position: absolute;
  top: 9.5vh;
  left: 11.5vw;
}
.state172 {
  position: absolute;
  top: 9.5vh;
  left: 17.5vw;
}
.state173 {
  position: absolute;
  top: 19.5vh;
  left: 5.5vw;
}

.pointer {
  display: block;
  width: 1vw;
  height: 1vh;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
}
span.pointer:hover {
  display: block;
  background-color: hsl(55, 100%, 50%) !important;
}
</style>
