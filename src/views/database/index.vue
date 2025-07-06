<template>
  <div class="data-serach">
    <small-nav></small-nav>
    <div class="con">
      <el-container style="height:88vh">
        <el-aside width="240px">
          <div class="search_box">
            <el-input placeholder="请输入合金名称" v-model="searchValue" size="mini">
              <el-button slot="append" @click="searchFun" icon="el-icon-search"></el-button>
              <el-button slot="append" @click="searchMoreFun" icon="el-icon-menu"></el-button>
            </el-input>

            <div style="margin-top: 10px;" v-if="isDev">
              <el-button type="primary" size="mini" @click="showFolderUpload" icon="el-icon-folder-add">
                批量上传
              </el-button>
            </div>

          </div>

          <el-menu :default-active="defaultActive" :unique-opened="true">
            <el-submenu :index="item.index" v-for="(item, index) in menuData" :key="index">
              <template slot="title">{{ item.name }}</template>
              <el-menu-item @click="changeFun(item.name, self)" v-for="(self, key) in item.list" :key="key"
                :index="self.index">{{
                self.name }}</el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>

        <el-container>
          <el-main>
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item>{{ name1 }}</el-breadcrumb-item>
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
                <div v-if="introduce.length > 0" v-for="(item, index) in introduce" :key="index">
                  <div class="tit1" v-html="processImageReferences(item.name, true)"></div>
                  <div class="txt" v-html="processImageReferences(item.con)"></div>
                  <div class="table1" v-if="item.tableData">
                    <el-table size="mini" :data="item.tableData" style="width: 100%">
                      <el-table-column v-for="column in item.tableColumns" :key="column.prop" :prop="column.prop"
                        :label="column.label"></el-table-column>
                    </el-table>
                  </div>
                  <div v-if="item.multipleTables" class="multiple-tables">
                    <div v-for="(table, tableIndex) in item.multipleTables" :key="tableIndex" class="table-item">
                      <div class="table-title">{{ table.title }}</div>
                      <el-table size="mini" :data="table.tableData" style="width: 100%; margin-bottom: 20px;">
                        <el-table-column v-for="column in table.tableColumns" :key="column.prop" :prop="column.prop"
                          :label="column.label"></el-table-column>
                      </el-table>
                    </div>
                  </div>
                  <div class="echartBox" v-if="item.seriesData && isValidChartData(item.seriesData)">
                    <div :id="`echarts${item.echartMsg.echartId}`" class="echart"></div>
                  </div>
                  <div v-if="item.multipleCharts && item.multipleCharts.length > 0" class="multiple-charts">
                    <div v-for="(chart, chartIndex) in item.multipleCharts" :key="chartIndex" class="chart-item"
                      v-if="chart.seriesData && isValidChartData(chart.seriesData)">
                      <div class="chart-title">{{ chart.title }}</div>
                      <div :id="`echarts${chart.echartMsg.echartId}`" class="echart"></div>
                    </div>
                  </div>
                  <template v-if="item.two">
                    <div v-for="(self, key) in item.two" :key="`two-${key}`" class="sub-level">
                      <div class="tit2" v-html="processImageReferences(self.name, true)"></div>
                      <div class="txt" v-html="processImageReferences(self.con)"></div>
                      <div class="table1" v-if="self.tableData">
                        <el-table size="mini" :data="self.tableData" style="width: 100%">
                          <el-table-column v-for="column in self.tableColumns" :key="column.prop" :prop="column.prop"
                            :label="column.label"></el-table-column>
                        </el-table>
                      </div>
                      <div v-if="self.multipleTables" class="multiple-tables">
                        <div v-for="(table, tableIndex) in self.multipleTables" :key="tableIndex" class="table-item">
                          <div class="table-title">{{ table.title }}</div>
                          <el-table size="mini" :data="table.tableData" style="width: 100%; margin-bottom: 20px;">
                            <el-table-column v-for="column in table.tableColumns" :key="column.prop" :prop="column.prop"
                              :label="column.label"></el-table-column>
                          </el-table>
                        </div>
                      </div>
                      <div class="echartBox" v-if="self.seriesData && isValidChartData(self.seriesData)">
                        <div :id="`echarts${self.echartMsg.echartId}`" class="echart"></div>
                      </div>
                      <div v-if="self.multipleCharts && self.multipleCharts.length > 0" class="multiple-charts">
                        <div v-for="(chart, chartIndex) in self.multipleCharts" :key="chartIndex" class="chart-item"
                          v-if="chart.seriesData && isValidChartData(chart.seriesData)">
                          <div class="chart-title">{{ chart.title }}</div>
                          <div :id="`echarts${chart.echartMsg.echartId}`" class="echart"></div>
                        </div>
                      </div>
                      <template v-if="self.third">
                        <div v-for="(option, num) in self.third" :key="`third-${num}`" class="sub-level">
                          <div class="tit3" v-html="processImageReferences(option.name, true)"></div>
                          <div class="txt" v-html="processImageReferences(option.con)"></div>
                          <div class="table1" v-if="option.tableData">
                            <el-table size="mini" :data="option.tableData" style="width: 100%">
                              <el-table-column v-for="column in option.tableColumns" :key="column.prop"
                                :prop="column.prop" :label="column.label"></el-table-column>
                            </el-table>
                          </div>
                          <div v-if="option.multipleTables" class="multiple-tables">
                            <div v-for="(table, tableIndex) in option.multipleTables" :key="tableIndex"
                              class="table-item">
                              <div class="table-title">{{ table.title }}</div>
                              <el-table size="mini" :data="table.tableData" style="width: 100%; margin-bottom: 20px;">
                                <el-table-column v-for="column in table.tableColumns" :key="column.prop"
                                  :prop="column.prop" :label="column.label"></el-table-column>
                              </el-table>
                            </div>
                          </div>
                          <div class="echartBox" v-if="option.seriesData && isValidChartData(option.seriesData)">
                            <div :id="`echarts${option.echartMsg.echartId}`" class="echart"></div>
                          </div>
                          <div v-if="option.multipleCharts && option.multipleCharts.length > 0" class="multiple-charts">
                            <div v-for="(chart, chartIndex) in option.multipleCharts" :key="chartIndex"
                              class="chart-item" v-if="chart.seriesData && isValidChartData(chart.seriesData)">
                              <div class="chart-title">{{ chart.title }}</div>
                              <div :id="`echarts${chart.echartMsg.echartId}`" class="echart"></div>
                            </div>
                          </div>
                          <template v-if="option.fourth">
                            <div v-for="(fourth, fourthIndex) in option.fourth" :key="`fourth-${fourthIndex}`"
                              class="sub-level">
                              <div class="tit4" v-html="processImageReferences(fourth.name, true)"></div>
                              <div class="txt" v-html="processImageReferences(fourth.con)"></div>
                              <div class="table1" v-if="fourth.tableData">
                                <el-table size="mini" :data="fourth.tableData" style="width: 100%">
                                  <el-table-column v-for="column in fourth.tableColumns" :key="column.prop"
                                    :prop="column.prop" :label="column.label"></el-table-column>
                                </el-table>
                              </div>
                              <div v-if="fourth.multipleTables" class="multiple-tables">
                                <div v-for="(table, tableIndex) in fourth.multipleTables" :key="tableIndex"
                                  class="table-item">
                                  <div class="table-title">{{ table.title }}</div>
                                  <el-table size="mini" :data="fourth.tableData"
                                    style="width: 100%; margin-bottom: 20px;">
                                    <el-table-column v-for="column in fourth.tableColumns" :key="column.prop"
                                      :prop="column.prop" :label="column.label"></el-table-column>
                                  </el-table>
                                </div>
                              </div>
                              <div class="echartBox" v-if="fourth.seriesData && isValidChartData(fourth.seriesData)">
                                <div :id="`echarts${fourth.echartMsg.echartId}`" class="echart"></div>
                              </div>
                              <div v-if="fourth.multipleCharts && fourth.multipleCharts.length > 0"
                                class="multiple-charts">
                                <div v-for="(chart, chartIndex) in fourth.multipleCharts" :key="chartIndex"
                                  class="chart-item" v-if="chart.seriesData && isValidChartData(chart.seriesData)">
                                  <div class="chart-title">{{ chart.title }}</div>
                                  <div :id="`echarts${chart.echartMsg.echartId}`" class="echart"></div>
                                </div>
                              </div>
                              <template v-if="fourth.fifth">
                                <div v-for="(fifth, fifthIndex) in fourth.fifth" :key="`fifth-${fifthIndex}`"
                                  class="sub-level">
                                  <div class="tit5" v-html="processImageReferences(fifth.name, true)"></div>
                                  <div class="txt" v-html="processImageReferences(fifth.con)"></div>
                                  <div class="table1" v-if="fifth.tableData">
                                    <el-table size="mini" :data="fifth.tableData" style="width: 100%">
                                      <el-table-column v-for="column in fifth.tableColumns" :key="column.prop"
                                        :prop="column.prop" :label="column.label"></el-table-column>
                                    </el-table>
                                  </div>
                                  <div v-if="fifth.multipleTables" class="multiple-tables">
                                    <div v-for="(table, tableIndex) in fifth.multipleTables" :key="tableIndex"
                                      class="table-item">
                                      <div class="table-title">{{ table.title }}</div>
                                      <el-table size="mini" :data="fifth.tableData"
                                        style="width: 100%; margin-bottom: 20px;">
                                        <el-table-column v-for="column in fifth.tableColumns" :key="column.prop"
                                          :prop="column.prop" :label="column.label"></el-table-column>
                                      </el-table>
                                    </div>
                                  </div>
                                  <div class="echartBox" v-if="fifth.seriesData && isValidChartData(fifth.seriesData)">
                                    <div :id="`echarts${fifth.echartMsg.echartId}`" class="echart"></div>
                                  </div>
                                  <div v-if="fifth.multipleCharts && fifth.multipleCharts.length > 0"
                                    class="multiple-charts">
                                    <div v-for="(chart, chartIndex) in fifth.multipleCharts" :key="chartIndex"
                                      class="chart-item" v-if="chart.seriesData && isValidChartData(chart.seriesData)">
                                      <div class="chart-title">{{ chart.title }}</div>
                                      <div :id="`echarts${chart.echartMsg.echartId}`" class="echart"></div>
                                    </div>
                                  </div>
                                  <!-- sixth 层递归渲染 -->
                                  <template v-if="fifth.sixth">
                                    <div v-for="(sixth, sixthIndex) in fifth.sixth" :key="`sixth-${sixthIndex}`"
                                      class="sub-level">
                                      <div class="tit6" v-html="processImageReferences(sixth.name, true)"></div>
                                      <div class="txt" v-html="processImageReferences(sixth.con)"></div>
                                      <div class="table1" v-if="sixth.tableData">
                                        <el-table size="mini" :data="sixth.tableData" style="width: 100%">
                                          <el-table-column v-for="column in sixth.tableColumns" :key="column.prop"
                                            :prop="column.prop" :label="column.label"></el-table-column>
                                        </el-table>
                                      </div>
                                      <div v-if="sixth.multipleTables" class="multiple-tables">
                                        <div v-for="(table, tableIndex) in sixth.multipleTables" :key="tableIndex"
                                          class="table-item">
                                          <div class="table-title">{{ table.title }}</div>
                                          <el-table size="mini" :data="table.tableData"
                                            style="width: 100%; margin-bottom: 20px;">
                                            <el-table-column v-for="column in table.tableColumns" :key="column.prop"
                                              :prop="column.prop" :label="column.label"></el-table-column>
                                          </el-table>
                                        </div>
                                      </div>
                                      <div class="echartBox"
                                        v-if="sixth.seriesData && isValidChartData(sixth.seriesData)">
                                        <div :id="`echarts${sixth.echartMsg.echartId}`" class="echart"></div>
                                      </div>
                                      <div v-if="sixth.multipleCharts && sixth.multipleCharts.length > 0"
                                        class="multiple-charts">
                                        <div v-for="(chart, chartIndex) in sixth.multipleCharts" :key="chartIndex"
                                          class="chart-item"
                                          v-if="chart.seriesData && isValidChartData(chart.seriesData)">
                                          <div class="chart-title">{{ chart.title }}</div>
                                          <div :id="`echarts${chart.echartMsg.echartId}`" class="echart"></div>
                                        </div>
                                      </div>
                                      <!-- 可继续递归 seventh 层... -->
                                    </div>
                                  </template>
                                </div>
                              </template>
                            </div>
                          </template>
                        </div>
                      </template>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </div>

    <!-- 筛选对话框 -->
    <el-dialog title="筛选" :visible.sync="dialogFormVisible">
      <el-form :model="form" label-width="100px">
        <el-form-item label="合金类型:">
          <el-select v-model="form.type" clearable placeholder="请选择">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="化学成分:">
          <el-select v-model="form.component" clearable multiple placeholder="请选择">
            <el-option v-for="item in componentList" :key="item.prop" :label="item.label"
              :value="item.prop"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="熔炼工艺:">
          <el-select v-model="form.craft" clearable multiple placeholder="请选择">
            <el-option v-for="item in craftList" :key="item.prop" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="合金密度:">
          <div class="block sliderBox">
            <el-slider v-model="form.region" range :step="0.02" @change="densityChange" :min="7" :max="10"></el-slider>
          </div>
          <el-input disabled v-model="form.regionVal1" style="width: 60px;margin-left: 5px;"></el-input>~
          <el-input disabled v-model="form.regionVal2"
            style="width: 60px;margin-left: 5px;margin-right: 5px;"></el-input>g/cm³
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

    <batch-upload-dialog :visible.sync="folderUploadVisible"></batch-upload-dialog>
  </div>
</template>

<script>
import smallNav from "../../components/smallNav/smallNav.vue";
import BatchUploadDialog from './components/BatchUploadDialog.vue';
import { getJson } from '@/api/database/dataStretch.js';

const baseUrl = process.env.NODE_ENV === 'production' ? 'http://www.ai4matter.com' : 'http://localhost:8100';

export default {
  components: { smallNav, BatchUploadDialog },

  created() {
    this.getMsg(`${baseUrl}/json/GH1015.json`);
    this.getMenu();
  },

  data() {
    return {
      menuData: [],
      tableList: [],
      tableData: [],
      jsonData: {},
      name1: "固溶强化型变形高温合金",
      name2: "GH1015",
      defaultActive: "1-1",
      activeName: "0",
      introduce: [],
      searchValue: "",
      dialogFormVisible: false,
      folderUploadVisible: false,
      form: {
        region: [7.5, 8.0],
        regionVal1: 7.5,
        regionVal2: 8.0,
        component: [],
        craft: [],
        type: 0,
      },
      componentList: [
        { "label": "C", "prop": "C" }, { "label": "Cr", "prop": "Cr" }, { "label": "Ni", "prop": "Ni" },
        { "label": "W", "prop": "W" }, { "label": "Mo", "prop": "Mo" }, { "label": "Fe", "prop": "Fe" },
        { "label": "Nb", "prop": "Nb" }, { "label": "B", "prop": "B" }, { "label": "Ce", "prop": "Ce" },
        { "label": "Mn", "prop": "Mn" }, { "label": "Si", "prop": "Si" }, { "label": "P", "prop": "P" },
        { "label": "S", "prop": "S" }, { "label": "Cu", "prop": "Cu" }, { "label": "V", "prop": "V" },
        { "label": "N", "prop": "N" }, { "label": "Al", "prop": "Al" }, { "label": "Ti", "prop": "Ti" },
        { "label": "Co", "prop": "Co" }, { "label": "Sn", "prop": "Sn" }, { "label": "Pb", "prop": "Pb" },
        { "label": "Zr", "prop": "Zr" }, { "label": "La", "prop": "La" }, { "label": "Sb", "prop": "Sb" },
        { "label": "As", "prop": "As" }, { "label": "Bi", "prop": "Bi" }, { "label": "Ta", "prop": "Ta" },
        { "label": "Se", "prop": "Se" }, { "label": "Ag", "prop": "Ag" }, { "label": "Mg", "prop": "Mg" },
        { "label": "Hf", "prop": "Hf" }, { "label": "Ga", "prop": "Ga" }, { "label": "In", "prop": "In" },
        { "label": "Te", "prop": "Te" }, { "label": "Tl", "prop": "Tl" }, { "label": "Zn", "prop": "Zn" },
        { "label": "Cd", "prop": "Cd" }
      ],
      craftList: [
        { "label": "电弧炉", "value": 1 },
        { "label": "电渣重熔", "value": 2 },
        { "label": "真空电弧重熔", "value": 3 },
        { "label": "非真空感应炉", "value": 4 },
        { "label": "真空感应炉", "value": 5 },
        { "label": "真空双联熔炼", "value": 6 },
        { "label": "电弧炉+真空自耗重熔", "value": 7 },
        { "label": "电弧炉+电渣重熔", "value": 8 },
        { "label": "电弧炉+真空电弧重熔", "value": 9 },
        { "label": "非真空感应炉+真空电弧重熔", "value": 10 },
        { "label": "非真空感应炉+电渣重熔", "value": 11 },
        { "label": "非真空感应炉+真空自耗", "value": 12 },
        { "label": "真空感应炉+电渣重熔", "value": 13 },
        { "label": "真空感应炉+真空自耗", "value": 14 }
      ],
      typeList: [
        { "label": "请选择", "value": 0 },
        { "label": "固溶强化型变形高温合金", "value": 1 },
        { "label": "等轴晶铸造高温合金", "value": 2 },
        { "label": "定向凝固柱晶高温合金", "value": 3 },
      ],
    };
  },

  methods: {
    // 搜索功能
    searchFun() {
      if (!this.searchValue || !this.searchValue.trim()) {
        this.$message.warning('请输入搜索内容');
        return;
      }
      const trimmedValue = this.searchValue.trim().toUpperCase();
      for (const menuItem of this.menuData) {
        if (!menuItem.list || !Array.isArray(menuItem.list)) continue;
        for (const material of menuItem.list) {
          if (material.name && material.name.toUpperCase().includes(trimmedValue)) {
            this.defaultActive = material.index;
            this.changeFun(menuItem.name, material);
            return;
          }
        }
      }
      this.$message.info('未找到匹配的材料');
    },

    searchMoreFun() {
      this.dialogFormVisible = true;
      this.tableData = [];
    },

    // 筛选功能
    onSubmit() {
      let arr = this.tableList.filter(item => {
        const typeMatch = this.form.type == 0 || item.index.startsWith(this.form.type);
        const componentMatch = this.form.component.length == 0 || this.containsArray(item.key_component, this.form.component);
        const craftMatch = this.form.craft.length == 0 || this.containsArray(item.key_craft, this.form.craft);
        const densityMatch = Number(this.form.region[0]) <= item.key_density && Number(this.form.region[1]) >= item.key_density;
        return typeMatch && componentMatch && craftMatch && densityMatch;
      });
      this.tableData = arr;
    },

    containsArray(arrA, arrB) {
      if (!Array.isArray(arrA) || !Array.isArray(arrB)) return false;
      return arrB.every(element => arrA.includes(element));
    },

    detailRow(data) {
      this.defaultActive = data.index;
      this.changeFun(data.name, data);
      this.dialogFormVisible = false;
    },

    densityChange() {
      this.form.regionVal1 = this.form.region[0];
      this.form.regionVal2 = this.form.region[1];
    },

    // 标签页切换
    tabClick() {
      const sections = ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'];
      const sectionIndex = parseInt(this.activeName);
      if (sectionIndex >= 0 && sectionIndex < sections.length) {
        this.introduce = this.jsonData[sections[sectionIndex]] || [];
        this.drawFun();
      } else {
        this.introduce = [];
      }
    },

    changeFun(name, data) {
      this.activeName = "0";
      this.name1 = name;
      this.name2 = data.name;
      this.defaultActive = data.index;
      let getJsonUrl = `${baseUrl}/json/${data.name}.json`;
      this.getMsg(getJsonUrl);
    },

    // 数据获取
    getMsg(getJsonUrl) {
      getJson(getJsonUrl).then(data => {
        this.jsonData = data;
        this.introduce = data.introduce || [];
        this.drawFun();
      }).catch(error => {
        console.error('❌ 数据加载失败:', error);
        this.introduce = [];
        this.jsonData = {};
      });
    },

    getMenu() {
      let getJsonUrl = `${baseUrl}/json/menu.json`;
      getJson(getJsonUrl).then(data => {
        this.menuData = data.menu;
        this.tableList = data.menu.flatMap(item => item.list);
      });
    },

    // 图表绘制
    drawFun() {
      setTimeout(() => {
        const drawRecursively = (items) => {
          if (!Array.isArray(items)) return;
          items.forEach(item => {
            this.drawItemCharts(item);
            if (item.two) drawRecursively(item.two);
            if (item.third) drawRecursively(item.third);
            if (item.fourth) drawRecursively(item.fourth);
            if (item.fifth) drawRecursively(item.fifth);
          });
        };
        drawRecursively(this.introduce);
      }, 100);
    },

    drawItemCharts(item) {
      if (!item) return;
      try {
        if (item.seriesData && item.echartMsg && item.echartMsg.echartId) {
          if (this.isValidChartData(item.seriesData)) {
            const chartElement = document.getElementById("echarts" + item.echartMsg.echartId);
            if (chartElement) {
              let chartObj = this.$echarts.getInstanceByDom(chartElement);
              if (!chartObj) {
                chartObj = this.$echarts.init(chartElement);
              }
              this.initChart1(chartObj, item.xAxisData || [], item.seriesData, item.echartMsg);
            }
          } else {
            this.removeEmptyChartContainer("echarts" + item.echartMsg.echartId);
          }
        }
        if (item.multipleCharts && Array.isArray(item.multipleCharts)) {
          item.multipleCharts.forEach(chart => {
            if (chart.echartMsg && chart.echartMsg.echartId && chart.seriesData) {
              if (this.isValidChartData(chart.seriesData)) {
                const chartElement = document.getElementById("echarts" + chart.echartMsg.echartId);
                if (chartElement) {
                  let chartObj = this.$echarts.getInstanceByDom(chartElement);
                  if (!chartObj) {
                    chartObj = this.$echarts.init(chartElement);
                  }
                  this.initChart1(chartObj, chart.xAxisData || [], chart.seriesData, chart.echartMsg);
                }
              } else {
                this.removeEmptyChartContainer("echarts" + chart.echartMsg.echartId);
              }
            }
          });
        }
      } catch (error) {
        console.error('❌ 图表绘制失败:', error);
      }
    },

    initChart1(Chart, xAxisData, seriesData, echartMsg) {
      const sortedSeriesData = this.sortSeriesDataByX(seriesData);
      let option = {
        color: ['#43b1fd', '#1bddb5', '#fe708d', '#e7e734', '#1fdaeb', '#cf48c9', '#ffb129', '#1b11fe'],
        tooltip: { trigger: "axis" },
        grid: { top: "14%", left: "5%", right: "17%", bottom: "8%", containLabel: true },
        legend: { top: "5%", orient: "horizontal", right: 100, left: 100, icon: "rect", itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10 } },
        xAxis: [{ name: echartMsg.xName, type: "value", boundaryGap: false, axisLabel: { color: "rgba(0, 0, 0, 1)", fontSize: 14 }, axisLine: { show: true }, min: Math.floor(echartMsg.minX), axisTick: { show: false }, data: xAxisData }],
        yAxis: [{ type: "value", name: echartMsg.yName, nameGap: 10, nameTextStyle: { fontSize: 14, color: "#000", padding: [0, 0, 0, 10] }, min: Math.floor(echartMsg.minY), axisLabel: { color: "rgba(0, 0, 0, 1)", fontSize: 14 }, splitLine: { show: false }, axisLine: { show: true } }],
        series: sortedSeriesData
      };
      if (Chart) Chart.clear();
      Chart.setOption(option, true);
    },

    sortSeriesDataByX(seriesData) {
      if (!Array.isArray(seriesData)) return seriesData;
      return seriesData.map(series => {
        if (!series || !Array.isArray(series.data)) return series;
        const sortedSeries = { ...series };
        sortedSeries.data = [...series.data].sort((a, b) => {
          if (!Array.isArray(a) || !Array.isArray(b)) return 0;
          const xA = parseFloat(a[0]);
          const xB = parseFloat(b[0]);
          if (isNaN(xA) || isNaN(xB)) return 0;
          return xA - xB;
        });
        return sortedSeries;
      });
    },

    showFolderUpload() {
      this.folderUploadVisible = true;
    },

    processImageReferences(text, isName = false) {
      if (!text) return '';
      let processedText = text.replace(/@@/g, "\n");
      // 精准匹配
      const exactPattern = /图\d+[-－−—]\d+[a-zA-Z]*[\.。、，,]?/g;
      const isMicrostructureTab = this.activeName === '4';
      const matches = [];
      const processedRefs = new Set();
      let match;
      const debugImageRefs = [];

      while ((match = exactPattern.exec(text)) !== null) {
        let rawImageRef = match[0];
        let cleanImageRef = this.normalizeImageReference(rawImageRef);
        if (processedRefs.has(cleanImageRef)) continue;
        processedRefs.add(cleanImageRef);
        if (isMicrostructureTab) {
          // 组织结构部分，name/con都生成变体
          const hasLetterSuffix = /[a-zA-Z]+$/.test(cleanImageRef);
          let imageVariants = hasLetterSuffix ? [cleanImageRef] : this.generateImageVariants(cleanImageRef);
          imageVariants.forEach((variant, index) => {
            matches.push({
              fullMatch: match[0],
              originalRef: rawImageRef,
              cleanRef: variant,
              imgUrl: `/img/${this.name2}/${variant}`,
              uniqueId: `img-${this.name2}-${variant}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              isVariant: index > 0,
              baseRef: cleanImageRef
            });
            debugImageRefs.push(`/img/${this.name2}/${variant}`);
          });
        } else {
          // 其他部分，name/con都精准匹配
          matches.push({
            fullMatch: match[0],
            originalRef: rawImageRef,
            cleanRef: cleanImageRef,
            imgUrl: `/photo/${this.name2}/${cleanImageRef}`,
            uniqueId: `img-${this.name2}-${cleanImageRef}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            isVariant: false,
            baseRef: cleanImageRef
          });

        }
      }

      if (matches.length > 0) {
        let imageHtml = `<div class="material-images-container" style="display: flex; flex-direction: column;">`;
        matches.forEach(item => {
          imageHtml += `
            <div class="material-image-item" style="display: none; margin-bottom: 0px;">
              <div class="image-caption">${item.cleanRef}</div>
              <div class="material-image">
                <img id="${item.uniqueId}" alt="${item.cleanRef}" style="width: 100%; height: auto; max-width: 600px;"
                     onload="this.parentElement.parentElement.style.display='block';"
                     onerror="
                       var formats = ['.jpg', '.png', '.jpeg'];
                       var currentSrc = this.src;
                       var baseSrc = currentSrc.replace(/\.(jpg|png|jpeg)$/i, '');
                       var currentFormat = (currentSrc.match(/\.(jpg|png|jpeg)$/i) || [''])[0];
                       var currentIndex = formats.indexOf(currentFormat.toLowerCase());
                       if (currentIndex < formats.length - 1) {
                         this.src = baseSrc + formats[currentIndex + 1];
                       } else {
                         this.parentElement.parentElement.remove();
                       }
                     " />
              </div>
            </div>`;
        });
        imageHtml += '</div>';
        processedText += imageHtml;

        this.$nextTick(() => {
          matches.forEach((item, index) => {
            setTimeout(() => {
              const imgElement = document.getElementById(item.uniqueId);
              if (imgElement) {
                imgElement.src = isMicrostructureTab
                  ? `${item.imgUrl}.jpg`
                  : `${item.imgUrl}.jpg`;
              }
            }, index * 50);
          });
        });
      }
      return processedText;
    },

    normalizeImageReference(rawRef) {
      if (!rawRef) return '';
      let cleanRef = rawRef.trim().replace(/[－−—]/g, '-');
      cleanRef = cleanRef.replace(/[\.。、，,]$/, ''); // 去除末尾标点
      const letterSuffixMatch = cleanRef.match(/^(图\d+-\d+)([a-zA-Z]+)$/);
      if (letterSuffixMatch) {
        cleanRef = letterSuffixMatch[1] + '_' + letterSuffixMatch[2];
      }
      return cleanRef;
    },

    preloadMicrostructureImages(microstructures) {
      if (!Array.isArray(microstructures)) return;
      const processItem = (item) => {
        if (item?.con) {
          const imageRefPattern = /图\d+[-－−—]\d+[a-zA-Z]*/g;
          let match;
          while ((match = imageRefPattern.exec(item.con)) !== null) {
            const cleanImageRef = this.normalizeImageReference(match[0]);
            const imageVariants = this.generateImageVariants(cleanImageRef);
            imageVariants.forEach(variant => {
              ['jpg', 'png', 'jpeg'].forEach(ext => {
                const img = new Image();
                img.src = `/img/${this.name2}/${variant}.${ext}`;
              });
            });
          }
        }
        if (item?.two) item.two.forEach(processItem);
        if (item?.third) item.third.forEach(processItem);
        if (item?.fourth) item.fourth.forEach(processItem);
      };
      microstructures.forEach(processItem);
    },

    isValidChartData(seriesData) {
      if (!Array.isArray(seriesData) || seriesData.length === 0) return false;
      return seriesData.some(series =>
        series && Array.isArray(series.data) && series.data.length > 0 &&
        series.data.some(point => Array.isArray(point) && point.length >= 2 && !isNaN(parseFloat(point[0])) && !isNaN(parseFloat(point[1])))
      );
    },

    removeEmptyChartContainer(chartId) {
      this.$nextTick(() => {
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
          const chartBox = chartElement.closest('.echartBox, .chart-item');
          if (chartBox) chartBox.remove();
        }
      });
    },


    generateImageVariants(baseRef) {
      const variants = [baseRef];
      const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
      letters.forEach(letter => {
        variants.push(baseRef + '_' + letter);
      });
      return variants;
    },
  },
  computed: {
    isDev() {
      return process.env.NODE_ENV !== 'production';
    }
  },
};
</script>

<style>
.material-image-item {
  margin-bottom: 0px;
}

.image-caption {
  margin-bottom: 0px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  padding: 0px;
  border-radius: 4px;
  display: inline-block;
}

.material-image {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 3px;
  max-width: 600px;
}
</style>

<style scoped>
.el-form-item__content {
  display: flex;
}

.el-form .el-select .el-input__inner {
  width: 300px;
}

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
  height: calc(100% - 120px);
  /* Adjusted for the new button */
  overflow: auto;
}

.content {
  margin-top: 20px;
  box-sizing: border-box;
}

.content .nr {
  height: 73vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.content .nr .tit1 {
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0
}

.content .nr .tit2 {
  font-size: 14px;
  font-weight: bold;
  margin: 6px 0
}

.content .nr .tit3 {
  font-size: 13px;
  font-weight: bold;
  margin: 5px 0;
  color: #666;
}

.content .nr .tit4 {
  font-size: 12px;
  font-weight: bold;
  margin: 4px 0;
  color: #888;
}

.content .nr .txt {
  padding-left: 2em;
  font-size: 14px;
  white-space: pre-wrap;
  line-height: 28px;
  color: #333;
  margin-bottom: 0;
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
}

.density-control {
  display: flex;
  align-items: center;
  gap: 5px;
}

.sliderBox {
  width: 600px;
}

.multiple-tables .table-item,
.multiple-charts .chart-item {
  margin-bottom: 20px;
}

.table-title,
.chart-title {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 14px;
}
</style>
