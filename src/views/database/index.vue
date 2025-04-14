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
            <!-- 移除批量检查按钮 -->
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
              <el-tabs v-model="activeName" @tab-click="tabClick" type="card">
                <el-tab-pane label="合金介绍" name="0"></el-tab-pane>
                <el-tab-pane label="物理、弹性和化学性能" name="1"></el-tab-pane>
                <el-tab-pane label="力学性能" name="2"></el-tab-pane>
                <el-tab-pane label="工艺性能与要求" name="3"></el-tab-pane>
                <el-tab-pane label="组织结构" name="4"></el-tab-pane>
              </el-tabs>
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
  </div>
</template>

<script>
import smallNav from "../../components/smallNav/smallNav";
import BackProfile from '../../components/BackProfile/index.vue'
import { getJson } from '@/api/database/dataStretch.js'

export default {
  components: { smallNav, BackProfile },
  created() {
    this.getMsg(this.baseURL + '/json/GH1015.json');
    this.getMenu();
  },
  mounted() {
    // 页面挂载后自动执行批量检查
    setTimeout(() => {
      this.autoBatchCheckAllMaterials();
    }, 2000); // 延迟2秒执行，确保菜单数据已加载
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
      missingTableFiles: [], // 添加存储缺失表格的文件列表
      batchChecking: false,  // 是否正在批量检查
      batchResultVisible: false, // 批量检查结果对话框是否可见
      checkProgress: 0, // 批量检查进度
      currentCheckingFile: '', // 当前正在检查的文件
      allMaterials: [], // 所有材料列表
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

    checkTableReferences() {
      const tableRegex = /见表\s*\d+-\d+/g; // 匹配"见表x-x"格式
      this.missingTableFiles = [];

      if (!this.introduce) return;

      // 当前文件名从URL中提取
      const currentFileName = this.name2;
      let hasTableReference = false;
      let hasTableData = false;

      // 检查所有文本内容
      this.introduce.forEach(item => {
        if (item.con && tableRegex.test(item.con)) {
          hasTableReference = true;
        }

        if (item.tableData && item.tableData.length > 0) {
          hasTableData = true;
        }

        // 检查二级内容
        if (item.two) {
          item.two.forEach(second => {
            if (second.con && tableRegex.test(second.con)) {
              hasTableReference = true;
            }

            if (second.tableData && second.tableData.length > 0) {
              hasTableData = true;
            }

            // 检查三级内容
            if (second.third) {
              second.third.forEach(third => {
                if (third.con && tableRegex.test(third.con)) {
                  hasTableReference = true;
                }

                if (third.tableData && third.tableData.length > 0) {
                  hasTableData = true;
                }
              });
            }
          });
        }
      });

      // 如果有表格引用但没有表格数据，记录文件名
      if (hasTableReference && !hasTableData) {
        console.warn(`文件 ${currentFileName} 中引用了表格但没有相应的表格数据`);
        if (!this.missingTableFiles.includes(currentFileName)) {
          this.missingTableFiles.push(currentFileName);
        }
      }

      return this.missingTableFiles;
    },

    getMsg(getJsonUrl){
      this.loading = true;

      getJson(getJsonUrl).then(data => {
        this.jsonData = data;
        this.introduce = data.introduce;
        this.drawFun();
        // 调用检查表格引用的方法
        this.checkTableReferences();
      }).catch(error => {
        console.error('获取数据失败:', error);
        this.$message.error('数据加载失败，请重试');
      }).finally(() => {
        this.loading = false;
      });
    },

    getMissingTableFiles() {
      console.log('缺少表格数据的文件列表:', this.missingTableFiles);
      return this.missingTableFiles;
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

    // 批量检查所有材料
    batchCheckAllMaterials() {
      this.batchChecking = true;
      this.batchResultVisible = true;
      this.missingTableFiles = [];
      this.checkProgress = 0;

      // 收集所有材料
      if (this.allMaterials.length === 0) {
        this.allMaterials = [];
        this.menuData.forEach(category => {
          category.list.forEach(material => {
            this.allMaterials.push({
              name: material.name,
              index: material.index,
              category: category.name
            });
          });
        });
      }

      // 使用Promise队列依次检查每个材料
      this.checkMaterialsSequentially(0);
    },

    // 顺序检查材料列表
    checkMaterialsSequentially(index) {
      if (index >= this.allMaterials.length) {
        // 检查完成
        this.batchChecking = false;
        this.checkProgress = 100;
        return;
      }

      const material = this.allMaterials[index];
      this.currentCheckingFile = material.name;
      this.checkProgress = Math.floor((index / this.allMaterials.length) * 100);

      // 获取当前材料的JSON数据
      const getJsonUrl = this.baseURL + "/json/" + material.name + ".json";

      getJson(getJsonUrl).then(data => {
        // 检查这个材料是否缺少表格
        const tableRegex = /见表\s*\d+-\d+/g;
        let hasTableReference = false;
        let hasTableData = false;

        // 检查各个部分
        ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'].forEach(section => {
          if (!data[section]) return;

          data[section].forEach(item => {
            // 检查一级内容
            if (item.con && tableRegex.test(item.con)) {
              hasTableReference = true;
            }
            if (item.tableData && item.tableData.length > 0) {
              hasTableData = true;
            }

            // 检查二级内容
            if (item.two) {
              item.two.forEach(second => {
                if (second.con && tableRegex.test(second.con)) {
                  hasTableReference = true;
                }
                if (second.tableData && second.tableData.length > 0) {
                  hasTableData = true;
                }

                // 检查三级内容
                if (second.third) {
                  second.third.forEach(third => {
                    if (third.con && tableRegex.test(third.con)) {
                      hasTableReference = true;
                    }
                    if (third.tableData && third.tableData.length > 0) {
                      hasTableData = true;
                    }
                  });
                }
              });
            }
          });
        });

        // 如果有表格引用但没有表格数据，记录文件名和详细信息
        if (hasTableReference && !hasTableData) {
          const materialInfo = {
            name: material.name,
            category: material.category,
            references: []
          };

          this.missingTableFiles.push(materialInfo);
        }
      }).catch(error => {
        console.error(`检查文件 ${material.name} 时出错:`, error);
      }).finally(() => {
        // 继续检查下一个材料
        setTimeout(() => {
          this.checkMaterialsSequentially(index + 1);
        }, 100); // 添加一点延迟，避免请求过快
      });
    },

    // 顺序检查材料列表（自动版本）
    autoCheckMaterialsSequentially(index) {
      if (index >= this.allMaterials.length) {
        // 检查完成
        console.log('===== 检查完成 =====');
        console.log(`共发现${this.missingTableFiles.length}个材料存在表格引用但没有表格数据:`);
        console.table(this.missingTableFiles);
        return;
      }

      const material = this.allMaterials[index];
      const progress = Math.floor((index / this.allMaterials.length) * 100);

      if (index % 10 === 0) {
        console.log(`检查进度: ${progress}%, 当前检查: ${material.name}`);
      }

      // 获取当前材料的JSON数据
      const getJsonUrl = this.baseURL + "/json/" + material.name + ".json";

      getJson(getJsonUrl).then(data => {
        // 检查这个材料是否缺少表格
        const tableRegex = /见表\s*\d+-\d+/g;
        let hasTableReference = false;
        let hasTableData = false;
        let referenceDetails = []; // 存储引用详情

        // 检查各个部分
        ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'].forEach(section => {
          if (!data[section]) return;

          // 定义章节标题映射
          const sectionTitles = {
            'introduce': '合金介绍',
            'physicalChemistry': '物理、弹性和化学性能',
            'mechanical': '力学性能',
            'craft': '工艺性能与要求',
            'microstructures': '组织结构'
          };

          data[section].forEach(item => {
            // 检查一级内容
            if (item.con && tableRegex.test(item.con)) {
              hasTableReference = true;

              // 收集引用信息
              const matches = item.con.match(tableRegex);
              if (matches) {
                matches.forEach(match => {
                  referenceDetails.push({
                    section: sectionTitles[section],
                    title: item.name || '未知标题',
                    level: 1,
                    reference: match,
                    context: item.con.substring(
                      Math.max(0, item.con.indexOf(match) - 20),
                      item.con.indexOf(match) + match.length + 20
                    )
                  });
                });
              }
            }
            if (item.tableData && item.tableData.length > 0) {
              hasTableData = true;
            }

            // 检查二级内容
            if (item.two) {
              item.two.forEach(second => {
                if (second.con && tableRegex.test(second.con)) {
                  hasTableReference = true;

                  // 收集引用信息
                  const matches = second.con.match(tableRegex);
                  if (matches) {
                    matches.forEach(match => {
                      referenceDetails.push({
                        section: sectionTitles[section],
                        title: item.name || '未知标题',
                        subtitle: second.name || '未知小标题',
                        level: 2,
                        reference: match,
                        context: second.con.substring(
                          Math.max(0, second.con.indexOf(match) - 20),
                          second.con.indexOf(match) + match.length + 20
                        )
                      });
                    });
                  }
                }
                if (second.tableData && second.tableData.length > 0) {
                  hasTableData = true;
                }

                // 检查三级内容
                if (second.third) {
                  second.third.forEach(third => {
                    if (third.con && tableRegex.test(third.con)) {
                      hasTableReference = true;

                      // 收集引用信息
                      const matches = third.con.match(tableRegex);
                      if (matches) {
                        matches.forEach(match => {
                          referenceDetails.push({
                            section: sectionTitles[section],
                            title: item.name || '未知标题',
                            subtitle: second.name || '未知小标题',
                            subsubtitle: third.name || '未知小小标题',
                            level: 3,
                            reference: match,
                            context: third.con.substring(
                              Math.max(0, third.con.indexOf(match) - 20),
                              third.con.indexOf(match) + match.length + 20
                            )
                          });
                        });
                      }
                    }
                    if (third.tableData && third.tableData.length > 0) {
                      hasTableData = true;
                    }
                  });
                }
              });
            }
          });
        });

        // 如果有表格引用但没有表格数据，记录文件名和详细信息
        if (hasTableReference && !hasTableData) {
          const materialInfo = {
            name: material.name,
            category: material.category,
            references: referenceDetails
          };

          // 打印单个材料的详细信息到控制台
          console.log(`\n发现材料 [${material.name}] 有表格引用但缺少表格数据:`);
          referenceDetails.forEach((ref, idx) => {
            console.log(`  ${idx+1}. 章节: ${ref.section}`);
            console.log(`     标题: ${ref.title}`);
            if (ref.subtitle) console.log(`     子标题: ${ref.subtitle}`);
            if (ref.subsubtitle) console.log(`     子子标题: ${ref.subsubtitle}`);
            console.log(`     引用: ${ref.reference}`);
            console.log(`     上下文: ${ref.context}`);
            console.log(`---`);
          });

          this.missingTableFiles.push(materialInfo);
        }
      }).catch(error => {
        console.error(`检查文件 ${material.name} 时出错:`, error);
      }).finally(() => {
        // 继续检查下一个材料
        setTimeout(() => {
          this.autoCheckMaterialsSequentially(index + 1);
        }, 50); // 添加一点延迟，避免请求过快
      });
    },

    // 导航到指定材料
    goToFile(material) {
      // 查找对应的菜单项
      this.menuData.some((category) => {
        return category.list.some((item) => {
          if (item.name === material.name) {
            this.defaultActive = item.index;
            this.changeFun(category.name, item);
            this.batchResultVisible = false;
            return true;
          }
          return false;
        });
      });
    },

    // 导出缺失文件列表 - 增强版本，包含更多详情
    exportMissingFiles() {
      // 生成CSV格式，包含更多字段
      let csvContent = "材料牌号,材料类型,章节,标题,子标题,子子标题,引用,上下文\n";

      this.missingTableFiles.forEach(file => {
        if (file.references && file.references.length > 0) {
          file.references.forEach(ref => {
            csvContent += `"${file.name}","${file.category}","${ref.section}","${ref.title}",`;
            csvContent += `"${ref.subtitle || ''}","${ref.subsubtitle || ''}","${ref.reference}","${ref.context.replace(/"/g, '""')}"\n`;
          });
        } else {
          csvContent += `"${file.name}","${file.category}","","","","","",""\n`;
        }
      });

      // 创建下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '表格缺失材料列表_详细.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    // 自动批量检查所有材料
    autoBatchCheckAllMaterials() {
      console.log('开始自动检查所有材料是否有表格缺失...');
      this.missingTableFiles = [];

      // 收集所有材料
      if (this.menuData.length === 0) {
        console.log('菜单数据尚未加载完成，无法执行检查');
        return;
      }

      this.allMaterials = [];
      this.menuData.forEach(category => {
        category.list.forEach(material => {
          this.allMaterials.push({
            name: material.name,
            index: material.index,
            category: category.name
          });
        });
      });

      console.log(`共发现${this.allMaterials.length}个材料需要检查`);

      // 使用Promise队列依次检查每个材料
      this.autoCheckMaterialsSequentially(0);
    },
  },
};
</script>

<style>
.el-form-item__content {
  display: flex;
}
.el-form .el-select .el-input__inner {
  width: 300px;
}
</style>

<style scoped>
.data-serach {
  width: 100%;
  min-height: 100%;
  height: auto;
  position: relative;
  background-color: #edeff9;
}
.con {
  position: absolute;
  top: calc(5vh + 50px);
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  margin: 0 auto;
  width: 90vw;
}
.el-main {
  background-color: #fff;
}
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
.content {
  margin-top: 20px;
  box-sizing: border-box;
}
.content .nr {
  height: 73vh;
  overflow-y: auto;
}
.content .nr .tit1 {
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
}
.content .nr .tit2 {
  font-size: 14px;
  font-weight: bold;
  margin: 6px 0;
}
.content .nr .txt {
  padding-left: 2em;
  font-size: 14px;
  white-space: pre-wrap;
  line-height: 28px;
  color: #333;
}
.echart {
  width: 850px;
  height: 300px;
}
.table1 {
  width: 95%;
  margin: 0 auto 20px;
}
.search_box {
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.sliderBox {
  width: 600px;
}
</style>
