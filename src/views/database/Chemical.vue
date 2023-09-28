<template>
  <div class="chemical-element-list">

    <el-select
      v-model="option"
      clearable
      placeholder="请选择牌号"
    >
      <el-option
        v-for="item in options"
        :key="item"
        :label="item"
        :value="item"
      >
      </el-option>
    </el-select>

    <div class="slider-demo-block">
      <!-- <span class="temperature-title">温度/℃:</span> -->
      <el-slider
        v-model="temperature"
        :min="temperature_min"
        :max="temperature_max"
        show-input
        show-input-controls
      >
      </el-slider>
      <el-button
        class="handleQuery"
        type="primary"
        icon="el-icon-search"
        @click="handleQuery(0)"
      >搜索</el-button>
    </div>

    <div class="chemical-card">

      <el-card
        class="box-card"
        v-for="(item,index) in chemicalElementList"
        :key="index"
      >
        <div
          class="text item"
          @mousemove="changeOptionNow(item)"
        >
          <span class="e-name">{{item.chemicalName}}</span>
          <span class="c-name">{{item.chemicalAlias}}</span>
        </div>
      </el-card>

      <!-- <el-button type="primary">查询</el-button>
  <el-button type="info">重置</el-button> -->
    </div>

    <el-card class="chemical-info-show">
      <div class="chemincal-title">
        <span class="e-title-name">{{optionNow.chemicalName}}</span>
        <span class="c-title-name">{{optionNow.chemicalAlias}}</span>
      </div>
      <div class="chemincal-info">
        <div class="chemincal-info-min">
          <span class="chemincal-info-min-title"> min: </span>
          <span class="chemincal-info-min-data">{{optionNow.chemicalMin}}</span>
        </div>
        <div class="chemincal-info-max">
          <span class="chemincal-info-max-title"> max:</span>
          <span class="chemincal-info-max-data">{{optionNow.chemicalMax}}</span>
        </div>
        <div class="chemincal-info-rou">
          <span class="chemincal-info-rou-title"> 密度:</span>
          <span class="chemincal-info-rou-data">{{optionNow.chemicalMidu + ' g/cm3'}} </span>
        </div>
      </div>
    </el-card>

  </div>
</template>

<script lasng="ts">
import {
  getListBrands,
  getMinTemepreture,
  getMaxTemepreture,
  searchPerformanceEntry,
} from "@/api/database/Chemical.js";
export default {
  props: {},
  created() {
    this.getOptions();
    this.getTemperatures();
    this.handleQuery(1);
  },
  data() {
    return {
      temperature: 1350,
      temperature_min: 1200,
      temperature_max: 1500,
      option: "K213",
      options: [],
      chemicalElementList: [
        {
          chemicalName: "C",
          chemicalAlias: "碳",
          id: "c",
        },
        {
          chemicalName: "Cr",
          chemicalAlias: "铬",
          id: "cr",
        },
        {
          chemicalName: "Ni",
          chemicalAlias: "镍",
          id: "ni",
        },
        {
          chemicalName: "W",
          chemicalAlias: "钨",
          id: "w",
        },
        {
          chemicalName: "Al",
          chemicalAlias: "铝",
          id: "al",
        },
        {
          chemicalName: "Ti",
          chemicalAlias: "钛",
          id: "ti",
        },
        {
          chemicalName: "Mo",
          chemicalAlias: "钼",
          id: "mo",
        },
        {
          chemicalName: "Co",
          chemicalAlias: "钴",
          id: "co",
        },
        {
          chemicalName: "Fe",
          chemicalAlias: "铁",
          id: "fe",
        },
        {
          chemicalName: "Nb",
          chemicalAlias: "铌",
          id: "nb",
        },
        {
          chemicalName: "HF",
          chemicalAlias: "氟化氢",
          id: "hf",
        },
        {
          chemicalName: "B",
          chemicalAlias: "硼",
          id: "b",
        },
        {
          chemicalName: "Zr",
          chemicalAlias: "锆",
          id: "zr",
        },
      ],
      chemicalElementInfo: [],
      optionNow: {
        chemicalName: "C",
        chemicalId: "c",
        chemicalAlias: "碳",
        chemicalMax: "0.10",
        chemicalMin: "0.0",
        chemicalMidu: undefined,
      },
    };
  },
  methods: {
    getOptions() {
      getListBrands().then((res) => {
        this.options = res.data;
        // console.log(res.data)
      });
    },
    getTemperatures() {
      getMinTemepreture().then((res) => {
        // console.log(res)
        this.temperature_min = Number(res.msg);
      });
      getMaxTemepreture().then((res) => {
        this.temperature_max = Number(res.msg);
      });
    },
    changeOptionNow(item) {
      this.optionNow.chemicalName = item.chemicalName;
      this.optionNow.chemicalAlias = item.chemicalAlias;
      this.optionNow.chemicalId = item.id;
      //获取当前最小温度
      let min = this.optionNow.chemicalId + "Min";
      // console.log(min)
      this.$set(this.optionNow, "chemicalMin", this.chemicalElementInfo[min]);
      //获取当前最大温度
      let max = this.optionNow.chemicalId + "Max";
      this.$set(this.optionNow, "chemicalMax", this.chemicalElementInfo[max]);
    },
    handleQuery(isF) {
      this.loading = true;
      searchPerformanceEntry({
        trademark: this.option,
        T: this.temperature,
      }).then((res) => {
        if (res.data.length == 0) {
          this.$message({
            message: "查询成功！但数据库并没有匹配的数据，请查询其他数据",
            type: "warning",
          });
          this.loading = false;
          return;
        }
        this.chemicalElementInfo = res.data[0];
        this.$set(this.optionNow, "chemicalMidu", res.data[0].density);
        //获取当前最小温度
        let min = this.optionNow.chemicalId + "Min";
        this.$set(this.optionNow, "chemicalMin", this.chemicalElementInfo[min]);
        //获取当前最大温度
        let max = this.optionNow.chemicalId + "Max";
        this.$set(this.optionNow, "chemicalMax", this.chemicalElementInfo[max]);
        if (isF === 0) {
          this.$message({
            message: "查询成功！",
            type: "success",
          });
        }
      });
    },
  },
};
</script>

<style scoped>
.chemical-element-list {
  padding-left: 8%;
  width: 1000px;
  background-image: linear-gradient(to bottom, #f6f8fa, #ffffff);
  position: relative;
}
.el-select{
  position: absolute;
  top: 40px;
  width: 250px;
  display: block;
}
.slider-demo-block {
  position: absolute;
  top: 40px;
  left: 300px;
  display: block;
}
.temperature-title {
  display: block;
  height: 36px;
  line-height: 36px;
}
.el-slider--with-input {
  width: 600px;
  position: absolute;
  top: 0;
  left: 70px;
}
.chemical-card {
  position: absolute;
  top: 120px;
  width: 800px;
}
.box-card {
  display: block;
  border-radius: 5px;
  width: 125px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  background-color: #cef;
  color: 0.05rem;
  float: left;
  margin: 10px;
}
.box-card:hover {
  border: rgb(69, 81, 254) 3px solid;
  background-color: rgb(82, 100, 238);
  color: aliceblue;
  cursor: pointer;
}
.text {
  height: 45px;
  line-height: 45px;
  text-align: center;
}
.e-name {
  font-size: 30px;
  font-weight: 500;
  margin-right: 3px;
}
.c-name {
  margin-top: 7px;
  font-size: 12px;
}
.chemical-element-list button {
  position: absolute;
  top: 250px;
  left: 490px;
}
.chemical-element-list button:last-child {
  left: 570px;
}
.chemical-info-show {
  width: 200px;
  height: 250px;
  position: absolute;
  left: 830px;
  top: 140px;
  border: #cef 1px solid;
}
.chemincal-title {
  text-align: center;
  border-bottom: 1px gray solid;
  width: 158px;
  height: 66px;
  line-height: 66px;
  padding-bottom: 20px;
}
.e-title-name {
  font-size: 50px;
}
.c-title-name {
  margin-left: 10px;
  font-size: 20px;
}
.chemincal-info {
  font-size: 20px;
}
.chemincal-info div {
  text-align: left;
  height: 50px;
  line-height: 50px;
}
.chemincal-info div span:nth-child(2) {
  margin-left: 10px;
}
.handleQuery {
  position: absolute;
  top: 50px !important;
  left: 10px;
}
</style>
