<template>
  <div class="data-serach" ref="databaseComponent">
    <small-nav></small-nav>
    <div class="con">
      <el-container style="height:88vh">
        <el-aside width="240px">
          <div class="search_box">
            <el-input placeholder="请输入合金名称" v-model="searchValue" size="mini">
              <el-button slot="append" @click="searchFun" icon="el-icon-search"></el-button>
              <el-button slot="append" @click="searchMoreFun" icon="el-icon-menu"></el-button>
            </el-input>
          </div>

          <el-menu :default-active="defaultActive" :unique-opened="true">
            <el-submenu :index="item.index" v-for="(item,index) in menuData" :key="index">
              <template slot="title">{{ item.name }}</template>
              <el-menu-item @click="changeFun(item.name,self)" v-for="(self,key) in item.list" :key="key" :index="self.index">{{self.name }}</el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-container>
          <el-main>
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item>{{name1}}</el-breadcrumb-item>
              <el-breadcrumb-item>{{ name2 }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="content">
              <div class="tabs-header">
                <el-tabs v-model="activeName" @tab-click="tabClick" type="card">
                  <el-tab-pane label="合金介绍" name="0"></el-tab-pane>
                  <el-tab-pane label="物理、弹性和化学性能" name="1"></el-tab-pane>
                  <el-tab-pane label="力学性能" name="2"></el-tab-pane>
                  <el-tab-pane label="工艺性能与要求" name="3"></el-tab-pane>
                  <el-tab-pane label="组织结构" name="4"></el-tab-pane>
                </el-tabs>
                <!-- 添加检查并导出按钮 -->
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-download"
                  class="export-btn"
                  @click="checkAndExport">检查表格缺失并导出</el-button>
              </div>
              <div class="nr">
                <div v-if="introduce.length>0" v-for="(item,index) in introduce" :key="index">
                  <div class="tit1">{{item.name}}</div>
                  <div class="txt">{{item.con.replace(/@@/g, "\n")}}</div>
                  <div class="table1" v-if="item.tableData">
                    <el-table size="mini" :data="item.tableData" style="width: 100%">
                      <el-table-column
                        v-for="column in item.tableColumns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label">
                      </el-table-column>
                    </el-table>
                  </div>
                  <div class="echartBox" v-if="item.seriesData && item.echartMsg">
                    <div :id="`echarts${item.echartMsg.echartId}`" class="echart"></div>
                  </div>
                  <!-- 二层 -->
                  <div v-for="(self,key) in item.two" :key="'two-'+key">
                    <div class="tit2">{{self.name}}</div>
                    <div class="txt">{{self.con.replace(/@@/g, "\n")}}</div>
                    <div class="table1" v-if="self.tableData && self.tableColumns">
                      <el-table size="mini" :data="self.tableData" style="width: 100%">
                        <el-table-column
                          v-for="column in self.tableColumns"
                          :key="column.prop"
                          :prop="column.prop"
                          :label="column.label">
                        </el-table-column>
                      </el-table>
                    </div>
                    <div class="echartBox" v-if="self.seriesData && self.echartMsg">
                      <div :id="`echarts${self.echartMsg.echartId}`" class="echart"></div>
                    </div>
                    <!-- 3层 -->
                    <div v-for="(option,num) in self.third" :key="'third-'+num">
                      <div class="tit2">{{option.name}}</div>
                      <div class="txt">{{option.con.replace(/@@/g, "\n")}}</div>
                      <div class="table1" v-if="option.tableData">
                        <el-table size="mini" :data="option.tableData" style="width: 100%">
                          <el-table-column
                            v-for="column in option.tableColumns"
                            :key="column.prop"
                            :prop="column.prop"
                            :label="column.label">
                          </el-table-column>
                        </el-table>
                      </div>
                      <div class="echartBox" v-if="option.seriesData">
                        <div :id="`echarts${option.echartMsg.echartId}`" class="echart"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </div>

    <el-dialog title="筛选" :visible.sync="dialogFormVisible">
      <el-form :model="form" label-width="100px">
        <el-form-item label="合金类型:">
          <el-select v-model="form.type" clearable placeholder="请选择">
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="化学成分:">
          <el-select v-model="form.component" clearable multiple placeholder="请选择">
            <el-option
              v-for="item in componentList"
              :key="item.prop"
              :label="item.label"
              :value="item.prop">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="熔炼工艺:">
          <el-select v-model="form.craft" clearable multiple placeholder="请选择">
            <el-option
              v-for="item in craftList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="合金密度:">
          <div class="block sliderBox">
            <el-slider
              v-model="form.region"
              range
              :step="0.02"
              @change="densityChange"
              :min="7"
              :max="10">
            </el-slider>
          </div>
          <el-input disabled v-model="form.regionVal1" style="width: 60px;margin-left: 5px;"></el-input>~
          <el-input disabled v-model="form.regionVal2" style="width: 60px;margin-left: 5px;margin-right: 5px;"></el-input>g/cm³
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">搜索</el-button>
          <el-button @click="dialogFormVisible = false">关闭</el-button>
        </el-form-item>
      </el-form>
      <div class="resBox">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="name" label="材料牌号" width="180"></el-table-column>
          <el-table-column prop="name" label="材料类型" width="180"></el-table-column>
          <el-table-column prop="address" label="材料概述"></el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button @click.native.prevent="detailRow(scope.row)" type="text" size="small">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 添加批量检查结果对话框 -->
    <el-dialog title="表格缺失检查结果" :visible.sync="batchResultVisible" width="600px">
      <div v-if="batchChecking">
        <div style="text-align: center; padding: 20px;">
          <el-progress type="circle" :percentage="checkProgress"></el-progress>
          <p>正在检查: {{currentCheckingFile}}</p>
        </div>
      </div>
      <div v-else>
        <p>检查完成，以下是引用了表格但没有提供表格数据的文件：</p>
        <el-table :data="missingTableFiles" style="width: 100%">
          <el-table-column prop="name" label="材料牌号" width="180"></el-table-column>
          <el-table-column prop="category" label="材料类型"></el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button @click.native.prevent="goToFile(scope.row)" type="text" size="small">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 20px; text-align: right;">
          <el-button type="primary" @click="exportMissingFiles">导出列表</el-button>
          <el-button @click="batchResultVisible = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加导出进度对话框 -->
    <el-dialog title="导出进度" :visible.sync="exportDialogVisible" width="400px">
      <div style="text-align: center; padding: 20px;">
        <p>正在生成导出文件，请稍候...</p>
        <el-progress :percentage="exportProgress" :show-text="false"></el-progress>
        <p>{{exportStatusText}}</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false" :disabled="exporting">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import smallNav from "../../components/smallNav/smallNav";
import BackProfile from '../../components/BackProfile/index.vue'
import { getJson } from '@/api/database/dataStretch.js'
import TableChecker from '@/utils/tableChecker.js'

export default {
  components: { smallNav, BackProfile },
  created() {
    this.getMsg(this.baseURL + '/json/GH1015.json');
    this.getMenu();
    // 初始化表格检查器
    this.tableChecker = new TableChecker(this.baseURL);
  },
  mounted() {
    // 延迟执行自动检查，确保菜单数据加载完成
    setTimeout(() => this.initAndRunTableChecker(), 3000);
  },
  data() {
    return {
      baseURL: process.env.NODE_ENV === 'production'
        ? "http://www.ai4matter.com"
        : "http://localhost:8100",
      menuData: [],
      tableList: [],
      tableData: [],
      jsonData: [],
      name1: "固溶强化型变形高温合金",
      name2: "GH1015",
      defaultActive: "1-1",
      activeName: "0",
      introduce: [],
      searchValue: "",
      dialogFormVisible: false,
      loading: false,
      form: {
        region: [7.5, 8.0],
        regionVal1: 7.5,
        regionVal2: 8.0,
        component: [],
        craft: [],
        type: 0,
      },
      componentList: [{"label":"C","prop":"C"},{"label":"Cr","prop":"Cr"},{"label":"Ni","prop":"Ni"},{"label":"W","prop":"W"},{"label":"Mo","prop":"Mo"},{"label":"Fe","prop":"Fe"},{"label":"Nb","prop":"Nb"},{"label":"B","prop":"B"},{"label":"Ce","prop":"Ce"},{"label":"Mn","prop":"Mn"},{"label":"Si","prop":"Si"},{"label":"P","prop":"P"},{"label":"S","prop":"S"},{"label":"Cu","prop":"Cu"},{"label":"V","prop":"V"},{"label":"N","prop":"N"},{"label":"Al","prop":"Al"},{"label":"Ti","prop":"Ti"},{"label":"Co","prop":"Co"},{"label":"Sn","prop":"Sn"},{"label":"Pb","prop":"Pb"},{"label":"Zr","prop":"Zr"},{"label":"La","prop":"La"},{"label":"Sb","prop":"Sb"},{"label":"As","prop":"As"},{"label":"Bi","prop":"Bi"},{"label":"Ta","prop":"Ta"},{"label":"Se","prop":"Se"},{"label":"Ag","prop":"Ag"},{"label":"Mg","prop":"Mg"},{"label":"Hf","prop":"Hf"},{"label":"Ga","prop":"Ga"},{"label":"In","prop":"In"},{"label":"Te","prop":"Te"},{"label":"Tl","prop":"Tl"},{"label":"Zn","prop":"Zn"},{"label":"Cd","prop":"Cd"}],
      craftList: [
        {"label":"电弧炉","value":1},
        {"label":"电渣重熔","value":2},
        {"label":"真空电弧重熔","value":3},
        {"label":"非真空感应炉","value":4},
        {"label":"真空感应炉","value":5},
        {"label":"真空双联熔炼","value":6},
        {"label":"电弧炉+真空自耗重熔","value":7},
        {"label":"电弧炉+电渣重熔","value":8},
        {"label":"电弧炉+真空电弧重熔","value":9},
        {"label":"非真空感应炉+真空电弧重熔","value":10},
        {"label":"非真空感应炉+电渣重熔","value":11},
        {"label":"非真空感应炉+真空自耗","value":12},
        {"label":"真空感应炉+电渣重熔","value":13},
        {"label":"真空感应炉+真空自耗","value":14}
      ],
      typeList: [
        {"label":"请选择","value":0},
        {"label":"固溶强化型变形高温合金","value":1},
        {"label":"等轴晶铸造高温合金","value":2},
        {"label":"定向凝固柱晶高温合金","value":3},
      ],
      // 表格检查相关属性 - 从tableChecker获取
      tableChecker: null,
      get missingTableFiles() { return this.tableChecker ? this.tableChecker.missingTableFiles : [] },
      get batchChecking() { return this.tableChecker ? this.tableChecker.batchChecking : false },
      batchResultVisible: false, // 批量检查结果对话框是否可见
      get checkProgress() { return this.tableChecker ? this.tableChecker.checkProgress : 0 },
      get currentCheckingFile() { return this.tableChecker ? this.tableChecker.currentCheckingFile : '' },
      // 添加导出相关状态
      exportDialogVisible: false,
      exportProgress: 0,
      exportStatusText: '准备检查...',
      exporting: false,
    };
  },
  methods: {
    searchFun(){
      if(this.searchValue == "") {
        return;
      }

      this.menuData.some((item) => {
        item.list.some((self) => {
          if(self.name.indexOf(this.searchValue) > -1) {
            this.defaultActive = self.index;
            this.changeFun(item.name, self);
            return true;
          }
        });
      });
    },

    onSubmit(){
      let filterkeys = {
        type: this.form.type,
        component: this.form.component,
        craft: this.form.craft,
        region: this.form.region,
      };

      let arr = this.tableList;
      Object.keys(filterkeys).forEach(key => {
        arr = this.filterFunc(filterkeys[key], key, arr);
      });

      this.tableData = arr;
    },

    filterFunc(val, key, arr) {
      return arr.filter(item => {
        if (key === 'type') {
          if(val == 0) return true;
          let arr = item.index.split("-");
          let typeStr = arr[0];
          return typeStr == val;
        } else if (key === 'component') {
          if(val.length == 0) return true;
          return this.containsArray(item.key_component, val);
        } else if(key === 'craft') {
          if(val.length == 0) return true;
          return this.containsArray(item.key_craft, val);
        } else if(key === 'region') {
          return Number(val[0]) <= item.key_density && Number(val[1]) >= item.key_density;
        } else {
          return true;
        }
      });
    },

    containsArray(arrA, arrB) {
      return arrB.every(element => arrA.includes(element));
    },

    detailRow(data){
      this.defaultActive = data.index;
      this.changeFun(data.name, data);
      this.dialogFormVisible = false;
    },

    searchMoreFun(){
      this.dialogFormVisible = true;
      this.tableData = [];
    },

    densityChange(){
      this.form.regionVal1 = this.form.region[0];
      this.form.regionVal2 = this.form.region[1];
    },

    tabClick(){
      if(this.activeName == 0){
        this.introduce = this.jsonData.introduce;
      } else if(this.activeName == 1){
        this.introduce = this.jsonData.physicalChemistry;
      } else if(this.activeName == 2){
        this.introduce = this.jsonData.mechanical;
      } else if(this.activeName == 3){
        this.introduce = this.jsonData.craft;
      } else if(this.activeName == 4){
        this.introduce = this.jsonData.microstructures;
      }

      this.drawFun();
    },

    changeFun(name, data){
      this.activeName = "0";
      this.name1 = name;
      this.name2 = data.name;
      this.defaultActive = data.index;
      // 设置当前材料和分类
      this.tableChecker.setCurrentMaterial(data.name, name);
      let getJsonUrl = this.baseURL + "/json/" + data.name + ".json";
      this.getMsg(getJsonUrl);
    },

    tubiao(jsonData, lineName){
      let keyList = [];
      jsonData.some((item, index) => {
        for(let key in item) {
          if(index == 1) {
            keyList.push(key);
          }
        }
      });

      let seriesData = [];
      keyList.forEach((item, index) => {
        let nameStr = "";
        if(item.indexOf("_") > 0) {
          nameStr = item.split('_')[0];
        } else {
          nameStr = lineName + index;
        }

        seriesData.push({
          "name": nameStr,
          "type": "line",
          "smooth": "smooth",
          "data": []
        });

        jsonData.forEach((self) => {
          for(let key in self) {
            if(item == key) {
              seriesData[index].data.push([self[key]]);
            }
          }
        });
      });

      let Data = [];
      seriesData.forEach((item, index) => {
        if(index % 2 == 0) {
          item.data.forEach((self, num) => {
            self[0] = parseFloat(self[0]).toFixed(4);
            self.push(parseFloat(seriesData[index+1].data[num][0]).toFixed(4));
          });
          Data.push(item);
        }
      });

      let xArr = [], yArr = [];
      Data.forEach((self) => {
        self.data.forEach((item) => {
          xArr.push(parseFloat(item[0]));
          yArr.push(parseFloat(item[1]));
        });
      });

      let xmin = Math.min(...xArr);
      let ymin = Math.min(...yArr);

      return [xmin, ymin, Data];
    },

    getMenu(){
      let getJsonUrl = this.baseURL + "/json/menu.json";
      getJson(getJsonUrl).then(data => {
        this.menuData = data.menu;
        this.tableList = [];
        this.menuData.forEach((item) => {
          item.list.forEach((self) => {
            this.tableList.push(self);
          });
        });
      });
    },

    drawFun(){
      setTimeout(() => {
        try {
          if (!this.introduce || this.introduce.length === 0) return;

          this.introduce.forEach((item) => {
            if(item.seriesData) {
              const chartElement = document.getElementById("echarts" + item.echartMsg.echartId);
              if (chartElement) {
                let chartObj = this.$echarts.init(chartElement);
                this.initChart1(chartObj, item.xAxisData, item.seriesData, item.echartMsg);
              }
            }

            if(item.two) {
              this.renderNestedCharts(item.two);
            }
          });
        } catch (error) {
          console.error('绘制图表出错:', error);
        }
      }, 100);
    },

    renderNestedCharts(items) {
      items.forEach((self) => {
        if(self.seriesData) {
          const chartElement = document.getElementById("echarts" + self.echartMsg.echartId);
          if (chartElement) {
            let chartObj = this.$echarts.init(chartElement);
            this.initChart1(chartObj, self.xAxisData, self.seriesData, self.echartMsg);
          }
        }

        if(self.third) {
          this.renderNestedCharts(self.third);
        }
      });
    },

    getMsg(getJsonUrl){
      this.loading = true;

      getJson(getJsonUrl).then(data => {
        this.jsonData = data;
        this.introduce = data.introduce;
        this.drawFun();
        // 调用检查表格引用的方法 - 使用tableChecker
        this.tableChecker.checkTableReferences(this.introduce);
      }).catch(error => {
        console.error('获取数据失败:', error);
        this.$message.error('数据加载失败，请重试');
      }).finally(() => {
        this.loading = false;
      });
    },

    initChart1(Chart, xAxisData, seriesData, echartMsg) {
      let option = {
        color: ['#43b1fd','#1bddb5','#fe708d','#e7e734','#1fdaeb','#cf48c9','#ffb129','#1b11fe'],
        tooltip: {
          trigger: "axis",
        },
        grid: {
          top: "14%",
          left: "5%",
          right: "17%",
          bottom: "8%",
          containLabel: true,
        },
        legend: {
          top: "5%",
          orient: "horizontal",
          right: 100,
          left: 100,
          icon: "rect",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            fontSize: 10
          }
        },
        xAxis: [{
          name: echartMsg.xName,
          type: "value",
          boundaryGap: false,
          axisLabel: {
            color: "rgba(0, 0, 0, 1)",
            fontSize: 14,
          },
          axisLine: {
            show: true,
          },
          min: Math.floor(echartMsg.minX),
          axisTick: {
            show: false,
          },
          data: xAxisData,
        }],
        yAxis: [{
          type: "value",
          name: echartMsg.yName,
          nameGap: 10,
          nameTextStyle: {
            fontSize: 14,
            color: "#000",
            padding: [0, 0, 0, 10],
          },
          min: Math.floor(echartMsg.minY),
          axisLabel: {
            color: "rgba(0, 0, 0, 1)",
            fontSize: 14,
          },
          splitLine: {
            show: false,
          },
          axisLine: {
            show: true
          },
        }],
        series: seriesData
      };

      if(Chart) {
        Chart.clear();
      }
      Chart.setOption(option, true);
    },

    beforeDestroy() {
      const chartElements = document.querySelectorAll('.echart');
      chartElements.forEach(element => {
        const chart = this.$echarts.getInstanceByDom(element);
        if (chart) {
          chart.dispose();
        }
      });
    },

    // 初始化并运行表格检查器
    initAndRunTableChecker() {
      try {
        if (!this.tableChecker) {
          this.tableChecker = new TableChecker(this.baseURL);
        }

        if (this.menuData && this.menuData.length && typeof this.tableChecker.autoBatchCheckAllMaterials === 'function') {
          this.tableChecker.autoBatchCheckAllMaterials(this.menuData);
        } else {
          console.warn('菜单数据未加载完成或表格检查器方法不可用');
        }
      } catch (error) {
        console.error('表格检查器初始化或运行失败:', error);
      }
    },

    // 检查表格缺失并导出结果 - 简化版
    checkAndExport() {
      this.exportDialogVisible = true;
      this.exporting = true;
      this.exportProgress = 10;
      this.exportStatusText = '正在检查当前材料...';

      try {
        // 确保设置了当前材料
        if (this.jsonData && this.name2 && this.name1) {
          this.tableChecker.setCurrentMaterial(this.name2, this.name1);
          this.tableChecker.checkTableReferences(this.jsonData);

          // 导出文件
          this.exportProgress = 50;
          this.exportStatusText = '正在生成导出文件...';

          setTimeout(() => {
            try {
              // 生成文件名
              const fileName = `TableReport_${this.name2}_${new Date().toISOString().replace(/[:.]/g, '_')}.csv`;
              this.tableChecker.exportMissingFiles(fileName);

              this.exportProgress = 100;
              this.exportStatusText = '导出完成！';
              this.exporting = false;
              setTimeout(() => this.exportDialogVisible = false, 2000);
            } catch (error) {
              console.error('导出失败:', error);
              this.exportStatusText = '导出失败，请重试!';
              this.exporting = false;
            }
          }, 500);
        }
      } catch (error) {
        console.error('检查失败:', error);
        this.exportStatusText = '检查失败，请重试!';
        this.exporting = false;
      }
    },

    // 添加缺失的exportMissingFiles方法
    exportMissingFiles() {
      if (!this.tableChecker) {
        console.error('表格检查器未初始化');
        return;
      }

      try {
        // 生成带时间戳的文件名
        const fileName = `TableReport_AllMaterials_${new Date().toISOString().slice(0, 10)}.csv`;
        this.tableChecker.exportMissingFiles(fileName);
      } catch (error) {
        console.error('导出文件失败:', error);
        this.$message.error('导出文件失败，请重试');
      }
    },
  },
};
</script>

<style scoped>
/* 基本容器样式 */
.data-serach {
  width: 100%;
  min-height: 100%;
  position: relative;
  background-color: #edeff9;
}

.con {
  position: absolute;
  top: calc(5vh + 50px);
  left: 50%;
  transform: translateX(-50%);
  width: 90vw;
}

/* 区域样式 */
.el-main { background-color: #fff; }
.el-aside {
  padding: 0;
  margin: 0;
  background: #fff;
  border-right: 1px solid #e6e6e6;
  overflow: hidden;
}
.el-menu {
  height: calc(100% - 80px);
  overflow: auto;
}

/* 内容区样式 */
.content {
  margin-top: 20px;
  box-sizing: border-box;
}

/* 内容滚动区 */
.content .nr {
  height: 73vh;
  overflow-y: auto;
}

/* 标题样式 */
.content .nr .tit1, .content .nr .tit2 {
  font-weight: bold;
  margin: 10px 0;
}
.content .nr .tit1 { font-size: 16px; }
.content .nr .tit2 {
  font-size: 14px;
  margin: 6px 0;
}

/* 文本样式 */
.content .nr .txt {
  padding-left: 2em;
  font-size: 14px;
  white-space: pre-wrap;
  line-height: 28px;
  color: #333;
}

/* 图表样式 */
.echart {
  width: 850px;
  height: 300px;
}

/* 表格样式 */
.table1 {
  width: 95%;
  margin: 0 auto 20px;
}

/* 搜索框样式 */
.search_box {
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* 滑块样式 */
.sliderBox {
  width: 600px;
}

/* 添加的样式 */
.tabs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.export-btn {
  margin-right: 20px;
}
</style>
