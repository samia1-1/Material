<template>
  <div class="data-serach">
    <small-nav></small-nav>
    <!-- <back-profile title="材料数据"></back-profile> -->
    <div class="con">
      <el-container style="height:88vh">
        <el-aside width="240px">
          <div class="search_box">

            <!-- <el-button type="primary" @click="asJson">导入表格数据</el-button> -->

            <el-input placeholder="请输入合金名称" v-model="searchValue" size="mini">
              <el-button slot="append" @click="searchFun" icon="el-icon-search"></el-button>
              <el-button slot="append" @click="searchMoreFun" icon="el-icon-menu">
              </el-button>
            </el-input>
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
                <div v-if="introduce.length > 0" v-for="(item, index) in introduce">
                  <div class="tit1">{{ item.name }}</div>
                  <div class="txt" v-html="processImageReferences(item.con)"></div>
                  <div class="table1" v-if="item.tableData">
                    <el-table size="mini" :data="item.tableData" style="width: 100%">
                      <el-table-column v-for="column in item.tableColumns" :key="column.prop" :prop="column.prop"
                        :label="column.label">
                      </el-table-column>
                    </el-table>
                  </div>
                  <div class="echartBox" v-if="item.seriesData">
                    <div :id="`echarts${item.echartMsg.echartId}`" class="echart"></div>
                  </div>
                  <div v-for="(self, key) in item.two">
                    <div class="tit2">{{ self.name }}</div>
                    <div class="txt" v-html="processImageReferences(self.con)"></div>
                    <div class="table1" v-if="self.tableData">
                      <el-table size="mini" :data="self.tableData" style="width: 100%">
                        <el-table-column v-for="column in self.tableColumns" :key="column.prop" :prop="column.prop"
                          :label="column.label">
                        </el-table-column>
                      </el-table>
                    </div>
                    <div class="echartBox" v-if="self.seriesData">
                      <div :id="`echarts${self.echartMsg.echartId}`" class="echart"></div>
                    </div>
                    <div v-for="(option, num) in self.third">
                      <div class="tit2">{{ option.name }}</div>
                      <div class="txt" v-html="processImageReferences(option.con)"></div>
                      <div class="table1" v-if="option.tableData">
                        <el-table size="mini" :data="option.tableData" style="width: 100%">
                          <el-table-column v-for="column in option.tableColumns" :key="column.prop" :prop="column.prop"
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
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="化学成分:">
          <el-select v-model="form.component" clearable multiple placeholder="请选择">
            <el-option v-for="item in componentList" :key="item.prop" :label="item.label" :value="item.prop">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="熔炼工艺:">
          <el-select v-model="form.craft" clearable multiple placeholder="请选择">
            <el-option v-for="item in craftList" :key="item.prop" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="合金密度:">
          <div class="block sliderBox">
            <el-slider v-model="form.region" range :step="0.02" @change="densityChange" :min="7" :max="10">
            </el-slider>
          </div>
          <el-input disabled v-model="form.regionVal1" @change="regionValChange"
            style="width: 60px;margin-left: 5px;"></el-input>~
          <el-input disabled v-model="form.regionVal2" @change="regionValChange"
            style="width: 60px;margin-left: 5px;margin-right: 5px;"></el-input>g/cm³
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">搜索</el-button>
          <el-button @click="dialogFormVisible = false">关闭</el-button>
        </el-form-item>
      </el-form>
      <div class="resBox">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="name" label="材料牌号" width="180">
          </el-table-column>
          <el-table-column prop="name" label="材料类型" width="180">
          </el-table-column>
          <el-table-column prop="address" label="材料概述">
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button @click.native.prevent="detailRow(scope.row)" type="text" size="small">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import * as echarts from "echarts";
import * as XLSX from 'xlsx';
import smallNav from "../../components/smallNav/smallNav";
import BackProfile from '../../components/BackProfile/index.vue'
import { getJson } from '@/api/database/dataStretch.js'
import axios from 'axios';

// 根据环境设置基础URL
const baseUrl = process.env.NODE_ENV === 'production'
  ? 'http://www.ai4matter.com'
  : 'http://localhost:8100';

export default {
  components: { smallNav, BackProfile },
  created() {
    this.getMsg(`${baseUrl}/json/GH1015.json`);
    this.getMenu()
  },
  mounted() { },
  data() {
    return {
      menuData: [],
      tableList: [],
      tableData: [],
      jsonData: [],
      name1: "固溶强化型变形高温合金",
      name2: "GH1015",
      defaultActive: "1-1",
      select: 0,
      activeName: "0",
      introduce: [], //合金介绍
      physicalChemistry: {}, //物理弹性和化学
      mechanical: {}, //力学
      craft: {}, //工艺
      myChart1: null,
      searchValue: "",
      dialogFormVisible: false,
      currentMaterialCode: "GH1015", // 当前材料代码，初始化为默认值
      form: {
        region: [7.5, 8.0],
        regionVal1: 75,
        regionVal2: 80,
        component: [],
        craft: [],
        type: 0,
      },
      componentList: [{ "label": "C", "prop": "C" }, { "label": "Cr", "prop": "Cr" }, { "label": "Ni", "prop": "Ni" }, { "label": "W", "prop": "W" }, { "label": "Mo", "prop": "Mo" }, { "label": "Fe", "prop": "Fe" }, { "label": "Nb", "prop": "Nb" }, { "label": "B", "prop": "B" }, { "label": "Ce", "prop": "Ce" }, { "label": "Mn", "prop": "Mn" }, { "label": "Si", "prop": "Si" }, { "label": "P", "prop": "P" }, { "label": "S", "prop": "S" }, { "label": "Cu", "prop": "Cu" }, { "label": "V", "prop": "V" }, { "label": "N", "prop": "N" }, { "label": "Al", "prop": "Al" }, { "label": "Ti", "prop": "Ti" }, { "label": "Co", "prop": "Co" }, { "label": "Sn", "prop": "Sn" }, { "label": "Pb", "prop": "Pb" }, { "label": "Zr", "prop": "Zr" }, { "label": "La", "prop": "La" }, { "label": "Sb", "prop": "Sb" }, { "label": "As", "prop": "As" }, { "label": "Bi", "prop": "Bi" }, { "label": "Ta", "prop": "Ta" }, { "label": "Se", "prop": "Se" }, { "label": "Ag", "prop": "Ag" }, { "label": "Mg", "prop": "Mg" }, { "label": "Hf", "prop": "Hf" }, { "label": "Ga", "prop": "Ga" }, { "label": "In", "prop": "In" }, { "label": "Te", "prop": "Te" }, { "label": "Tl", "prop": "Tl" }, { "label": "Zn", "prop": "Zn" }, { "label": "Cd", "prop": "Cd" }],
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
        { "label": "定向凝固柱晶高温合金", "value": 3 }
      ],
    };
  },
  methods: {
    searchFun() {
      if (this.searchValue === "") return;

      this.menuData.some((item) => {
        item.list.some((self) => {
          this.tableList.push(self);
          if (self.name.indexOf(this.searchValue) > -1) {
            this.defaultActive = self.index;
            this.changeFun(item.name, self);
          }
        });
      });
    },

    onSubmit() {
      let filterkeys = {
        type: this.form.type,
        component: this.form.component,
        craft: this.form.craft,
        region: this.form.region,
      };
      let arr = this.tableList;

      // 通过遍历key值来循环处理
      Object.keys(filterkeys).forEach(key => {
        arr = this.filterFunc(filterkeys[key], key, arr);
      });

      // 为表格赋值
      this.tableData = arr;
    },

    // 条件筛选函数
    filterFunc(val, key, arr) {
      return arr.filter(item => {
        if (key === 'type') {
          let typeStr = item.index.split("-")[0];
          return val == 0 || typeStr == val;
        } else if (key === 'component') {
          return val.length == 0 || this.containsArray(item.key_component, val);
        } else if (key === 'craft') {
          return val.length == 0 || this.containsArray(item.key_craft, val);
        } else if (key === 'region') {
          return Number(val[0]) <= item.key_density && Number(val[1]) >= item.key_density;
        } else {
          return true;
        }
      });
    },

    containsArray(arrA, arrB) {
      return arrB.every(element => arrA.includes(element));
    },

    detailRow(data) {
      this.defaultActive = data.index;
      this.changeFun(data.name, data);
      this.dialogFormVisible = false;
    },

    searchMoreFun() {
      this.dialogFormVisible = true;
      this.tableData = [];
    },

    densityChange() {
      this.form.regionVal1 = this.form.region[0];
      this.form.regionVal2 = this.form.region[1];
    },

    regionValChange() {
      this.form.region[0] = Number(this.form.regionVal1);
      this.form.region[1] = Number(this.form.regionVal2);
    },

    tabClick() {
      if (this.activeName == 0) {
        this.introduce = this.jsonData.introduce;
      } else if (this.activeName == 1) {
        this.introduce = this.jsonData.physicalChemistry;
      } else if (this.activeName == 2) {
        this.introduce = this.jsonData.mechanical;
      } else if (this.activeName == 3) {
        this.introduce = this.jsonData.craft;
      } else if (this.activeName == 4) {
        this.introduce = this.jsonData.microstructures;
      }

      this.drawFun();
    },

    changeFun(name, data) {
      this.activeName = "0";
      this.name1 = name;
      this.name2 = data.name;
      this.currentMaterialCode = data.name; // 更新当前材料代码
      this.defaultActive = data.index;
      let getJsonUrl = `${baseUrl}/json/${data.name}.json`;
      this.getMsg(getJsonUrl);
    },

    processImageReferences(text) {
      if (!text) return '';

      let processedText = text.replace(/@@/g, "\n");
      let imageHtml = '';

      // 更新正则表达式以匹配更多图片引用格式
      const pattern = /(图(\d+)-(\d+))(_[a-z])?/g;
      let match;
      let matches = [];

      // 收集所有匹配的图片引用
      while ((match = pattern.exec(text)) !== null) {
        const baseRef = match[1];
        const suffix = match[4] || '';
        const fullRef = baseRef + suffix;
        const imgUrl = `${baseUrl}/json/img/${this.currentMaterialCode}/${fullRef}`;
        const uniqueId = `img-${this.currentMaterialCode}-${fullRef.replace(/\-/g, '-')}`;

        matches.push({
          fullMatch: match[0],
          imgUrl: imgUrl,
          uniqueId: uniqueId
        });
      }

      // 如果有匹配的图片，在文本末尾添加图片展示区
      if (matches.length > 0) {
        const containerId = `image-container-${Date.now()}`;
        // 修改HTML结构和样式
        imageHtml += `<div id="${containerId}" class="material-images-container">`;

        matches.forEach(item => {
          imageHtml += `
              <div class="material-image-item">
                <div class="material-image">
                  <img id="${item.uniqueId}"
                     src="${item.imgUrl}.jpg"
                     alt="${item.fullMatch}"
                     onload="this.parentElement.parentElement.style.display='flex';
                            var containerDiv = document.getElementById('${containerId}');
                            if(containerDiv) containerDiv.style.display='flex';"
                     onerror="if (this.src.indexOf('.jpg') > 0) {
                       this.src='${item.imgUrl}.png';
                     } else if (this.src.indexOf('.png') > 0) {
                       this.src='${item.imgUrl}.jpeg';
                     } else {
                       this.parentElement.parentElement.remove();
                       // 检查父容器是否为空，如果是则移除
                       var containerDiv = document.getElementById('${containerId}');
                       if(containerDiv && containerDiv.children.length <= 1) {
                         containerDiv.remove();
                       }
                     }" />
                </div>
              </div>
          `;
        });

        imageHtml += '</div>';
      }

      return processedText + imageHtml;
    },

    preloadMicrostructureImages(microstructures) {
      microstructures.forEach(item => {
        if (item.con) {
          // 更新正则表达式以匹配更多图片引用格式
          const pattern = /(图(\d+)-(\d+))(_[a-z])?/g;
          let match;

          while ((match = pattern.exec(item.con)) !== null) {
            const baseRef = match[1];
            const suffix = match[4] || '';
            const fullRef = baseRef + suffix;

            // 预加载多种可能的格式
            const extensions = ['jpg', 'png', 'jpeg'];
            extensions.forEach(ext => {
              const img = new Image();
              img.src = `${baseUrl}/json/img/${this.currentMaterialCode}/${fullRef}.${ext}`;
            });
          }
        }

        // 递归处理二级结构
        if (item.two && Array.isArray(item.two)) {
          this.preloadMicrostructureImages(item.two);
        }
      });
    },

    getMsg(getJsonUrl) {
      getJson(getJsonUrl).then(data => {
        this.jsonData = data;
        this.introduce = data.introduce;

        // 在这里我们可以提前解析所有可能的图片引用
        if (data.microstructures && Array.isArray(data.microstructures)) {
          // 预加载组织结构中可能会用到的图片
          this.preloadMicrostructureImages(data.microstructures);
        }

        this.drawFun();
      });
    },

    drawFun() {
      setTimeout(() => {
        this.introduce.some((item) => {
          if (item.seriesData) {
            let chartObj = this.$echarts.init(document.getElementById("echarts" + item.echartMsg.echartId));
            this.initChart1(chartObj, item.xAxisData, item.seriesData, item.echartMsg);
          }
          if (item.two) {
            item.two.some((self) => {
              if (self.seriesData) {
                let chartObj = this.$echarts.init(document.getElementById("echarts" + self.echartMsg.echartId));
                this.initChart1(chartObj, self.xAxisData, self.seriesData, self.echartMsg);
              }
              if (self.third) {
                self.third.some((option) => {
                  if (option.seriesData) {
                    let chartObj = this.$echarts.init(document.getElementById("echarts" + option.echartMsg.echartId));
                    this.initChart1(chartObj, option.xAxisData, option.seriesData, option.echartMsg);
                  }
                });
              }
            });
          }
        });
      }, 100);
    },

    getMenu() {
      let getJsonUrl = `${baseUrl}/json/menu.json`;
      getJson(getJsonUrl).then(data => {
        this.menuData = data.menu;
        this.menuData.some((item) => {
          item.list.some((self) => {
            this.tableList.push(self);
          });
        });
      });
    },

    initChart1(Chart, xAxisData, seriesData, echartMsg) {
      let option = {
        color: ['#43b1fd', '#1bddb5', '#fe708d', '#e7e734', '#1fdaeb', '#cf48c9', '#ffb129', '#1b11fe'],
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
        xAxis: [
          {
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
          },
        ],
        yAxis: [
          {
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
          },
        ],
        series: seriesData
      };

      if (Chart) {
        Chart.clear();
      }
      Chart.setOption(option, true);
    },

    async asJson() {
      try {
        const materialCode = prompt("请输入材料编号(例如:GH1139):", "GH1139");
        if (!materialCode) return;

        // 显示加载提示
        const loading = this.$loading({
          lock: true,
          text: '正在处理材料数据...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        // 读取JSON文件
        let url = `${baseUrl}/json/source/${materialCode}.json`;
        try {
          const data = await getJson(url);
          let processedDataSources = 0;
          const totalDataSources = 3; // 表格、图表、文本

          // 处理表格数据Excel
          try {
            loading.text = '正在处理表格数据...';
            const response = await axios.get(`${baseUrl}/json/source/表格${materialCode}.xlsx`, { responseType: 'arraybuffer' });
            const excelData = new Uint8Array(response.data);
            const workbook = XLSX.read(excelData, { type: 'array' });
            const sheetNames = workbook.SheetNames;

            this.processAllSheets(sheetNames, workbook, data);
            processedDataSources++;
            this.$message.success('表格数据处理完成');
          } catch (error) {
            console.warn("未找到表格数据Excel或处理出错:", error);
            this.$message.info('未找到表格数据或处理出错，跳过此步骤');
          }

          // 处理图表数据Excel
          try {
            loading.text = '正在处理图表数据...';
            const response2 = await axios.get(`${baseUrl}/json/source/${materialCode}.xlsx`, { responseType: 'arraybuffer' });
            const chartData = new Uint8Array(response2.data);
            const workbook2 = XLSX.read(chartData, { type: 'array' });
            const sheetNames2 = workbook2.SheetNames;

            this.processAllCharts(sheetNames2, workbook2, data);
            processedDataSources++;
            this.$message.success('图表数据处理完成');
          } catch (error) {
            console.warn("未找到图表数据Excel或处理出错:", error);
            this.$message.info('未找到图表数据或处理出错，跳过此步骤');
          }

          // 处理文本JSON数据
          try {
            loading.text = '正在处理文本数据...';
            await this.processTextData(materialCode, data);
            processedDataSources++;
          } catch (error) {
            console.warn("未找到文本数据JSON或处理出错:", error);
            this.$message.info('未找到文本数据或处理出错，跳过此步骤');
          }

          loading.close();

          // 处理进度反馈
          if (processedDataSources === 0) {
            this.$message.warning('未能处理任何数据源，请检查文件是否存在');
          } else if (processedDataSources < totalDataSources) {
            this.$message.warning(`部分数据源处理成功（${processedDataSources}/${totalDataSources}）`);
          } else {
            this.$message.success('所有数据源处理完成');
          }

          // 验证JSON结构
          console.log("处理完成！更新后的JSON数据:", data);
          const isValidStructure = this.validateJsonStructure(data);
          if (!isValidStructure) {
            if (!confirm("JSON结构验证发现问题，是否仍要继续保存？")) {
              loading.close();
              return;
            }
          }

          // 保存选项
          if (confirm("是否保存更新后的数据到文件？")) {
            this.saveJsonToFile(data, `${materialCode}_updated.json`);
          }
        } catch (error) {
          loading.close();
          console.error("读取JSON文件失败:", error);
          this.$message.error('读取JSON文件失败，请检查路径和文件名是否正确');
        }
      } catch (error) {
        console.error("处理过程中出错:", error);
        this.$message.error("处理失败");
      }
    },

    saveJsonToFile(data, filename) {
      try {
        const jsonStr = JSON.stringify(data, null, 4);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);

        this.$message({
          message: `文件已保存为 ${filename}`,
          type: 'success',
          duration: 3000,
          showClose: true,
          onClose: () => {
            if (confirm('是否需要查看保存的文件？')) {
              const viewLink = document.createElement('a');
              viewLink.href = URL.createObjectURL(blob);
              viewLink.target = '_blank';
              document.body.appendChild(viewLink);
              viewLink.click();
              document.body.removeChild(viewLink);
            }
          }
        });
      } catch (error) {
        console.error('保存文件时发生错误:', error);
        this.$message.error('保存文件失败');
      }
    },

    processAllSheets(sheetNames, workbook, data) {
      sheetNames.forEach(sheetName => {
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key])) {
            data[key].forEach(item => {
              this.safelyUpdateTableData(item, sheetName, workbook);

              if (item.two) {
                item.two.forEach(subItem => {
                  this.safelyUpdateTableData(subItem, sheetName, workbook);

                  if (subItem.third) {
                    subItem.third.forEach(thirdItem => {
                      this.safelyUpdateTableData(thirdItem, sheetName, workbook);
                    });
                  }
                });
              }
            });
          }
        });
      });
    },

    processAllCharts(sheetNames, workbook, data) {
      sheetNames.forEach(sheetName => {
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key])) {
            data[key].forEach(item => {
              this.safelyUpdateChartData(item, sheetName, workbook);

              if (item.two) {
                item.two.forEach(subItem => {
                  this.safelyUpdateChartData(subItem, sheetName, workbook);

                  if (subItem.third) {
                    subItem.third.forEach(thirdItem => {
                      this.safelyUpdateChartData(thirdItem, sheetName, workbook);
                    });
                  }
                });
              }
            });
          }
        });
      });
    },

    safelyUpdateTableData(item, sheetName, workbook) {
      if (!item || !item.name) return;

      const nameIndex = item.name.indexOf('、');
      if (nameIndex <= 0) return;

      const prefix = item.name.substring(0, nameIndex);
      if (prefix !== sheetName) return;

      try {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData && jsonData.length > 0) {
          const tableColumns = Object.keys(jsonData[0]).map(key => ({
            label: key,
            prop: key
          }));
          item.tableData = jsonData;
          item.tableColumns = tableColumns;
          console.log(`已更新"${item.name}"的表格数据`);
        }
      } catch (error) {
        console.warn(`处理"${item.name}"的表格数据时出错:`, error);
      }
    },

    safelyUpdateChartData(item, sheetName, workbook) {
      if (!item || !item.name) return;

      const nameIndex = item.name.indexOf('、');
      if (nameIndex <= 0) return;

      const prefix = item.name.substring(0, nameIndex);
      if (prefix !== sheetName) return;

      try {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData && jsonData.length > 0) {
          const name = item.name.substring(nameIndex + 1);
          try {
            const seriesData = this.tubiao(jsonData, name);
            if (seriesData && seriesData[2] && seriesData[2].length > 0) {
              item.seriesData = seriesData[2];
              item.echartMsg = {
                echartId: Math.floor(Math.random() * 1000),
                xName: (seriesData[2][0] && seriesData[2][0].name) ? seriesData[2][0].name + '轴' : '数值',
                yName: '值',
                minX: seriesData[0],
                minY: seriesData[1]
              };
              console.log(`已更新"${item.name}"的图表数据`);
            }
          } catch (chartError) {
            console.warn(`处理"${item.name}"的图表数据时出错:`, chartError);
          }
        }
      } catch (error) {
        console.warn(`处理"${item.name}"的表格数据时出错:`, error);
      }
    },

    tubiao(jsonData, lineName) {
      try {
        let keyList = []
        jsonData.some((item, index) => {
          for (let key in item) {
            if (index == 1) {
              keyList.push(key)
            }
          }
        })

        let seriesData = []

        keyList.some((item, index) => {
          let nameStr = ""
          if (item.indexOf("_") > 0) {
            nameStr = item.split('_')[0]
            seriesData.push({ "name": nameStr, "type": "line", "smooth": "smooth", "data": [] })
          } else {
            seriesData.push({ "name": lineName + index, "type": "line", "smooth": "smooth", "data": [] })
          }

          jsonData.some((self, num) => {
            for (let key in self) {
              if (item == key) {
                seriesData[index].data.push([self[key]])
              }
            }
          })
        })

        let Data = []
        seriesData.some((item, index) => {
          if (index % 2 == 0 && index + 1 < seriesData.length) {
            try {
              item.data.some((self, num) => {
                try {
                  if (typeof self[0] === 'number') {
                    self[0] = self[0].toFixed(4);
                  } else {
                    const num1 = Number(self[0]);
                    if (!isNaN(num1)) {
                      self[0] = num1.toFixed(4);
                    } else {
                      console.warn(`无法将X值转换为数字: "${self[0]}"`);
                    }
                  }

                  if (seriesData[index + 1] && seriesData[index + 1].data &&
                    seriesData[index + 1].data[num] && seriesData[index + 1].data[num][0] !== undefined) {

                    const yValue = seriesData[index + 1].data[num][0];
                    if (typeof yValue === 'number') {
                      self.push(yValue.toFixed(4));
                    } else {
                      const num2 = Number(yValue);
                      if (!isNaN(num2)) {
                        self.push(num2.toFixed(4));
                      } else {
                        self.push(yValue);
                        console.warn(`无法将Y值转换为数字: "${yValue}"`);
                      }
                    }
                  }
                } catch (err) {
                  console.warn(`处理图表数据点时出错:`, err);
                  if (self.length < 2) {
                    self.push(self[0]);
                  }
                }
              })
              Data.push(item);
            } catch (err) {
              console.warn(`处理图表系列数据时出错:`, err);
            }
          }
        })

        let xArr = [], yArr = []
        Data.forEach((self) => {
          if (self.data && Array.isArray(self.data)) {
            self.data.forEach((item) => {
              if (Array.isArray(item) && item.length >= 2) {
                const x = parseFloat(item[0]);
                const y = parseFloat(item[1]);
                if (!isNaN(x)) xArr.push(x);
                if (!isNaN(y)) yArr.push(y);
              }
            });
          }
        });

        let xmin = xArr.length > 0 ? Math.min(...xArr) : 0;
        let ymin = yArr.length > 0 ? Math.min(...yArr) : 0;

        return [xmin, ymin, Data];
      } catch (error) {
        console.error("图表数据处理出错:", error);
        return [0, 0, []];
      }
    },

    updateAllTextData(textData, data) {
      Object.keys(data).forEach(key => {
        if (textData[key] && Array.isArray(data[key])) {
          data[key].forEach((item, index) => {
            this.safelyUpdateTextData(item, textData[key], index);

            // 处理二级项目
            if (item.two) {
              item.two.forEach((subItem, subIndex) => {
                if (textData[key][index] && textData[key][index].two) {
                  this.safelyUpdateTextData(subItem, textData[key][index].two, subIndex);
                }

                // 处理三级项目
                if (subItem.third) {
                  subItem.third.forEach((thirdItem, thirdIndex) => {
                    if (textData[key][index] && textData[key][index].two &&
                      textData[key][index].two[subIndex] && textData[key][index].two[subIndex].third) {
                      this.safelyUpdateTextData(thirdItem, textData[key][index].two[subIndex].third, thirdIndex);
                    }
                  });
                }
              });
            }
          });
        }
      });
    },

    safelyUpdateTextData(item, textDataArray, index) {
      if (!textDataArray || index >= textDataArray.length) return;

      const updateData = textDataArray[index];
      if (updateData.name && updateData.name !== item.name) {
        console.log(`更新"${item.name}"的名称为"${updateData.name}"`);
        item.name = updateData.name;
      }
      if (updateData.con && updateData.con !== item.con) {
        console.log(`更新"${item.name}"的文本内容`);
        item.con = updateData.con;
      }
    },

    async processTextData(materialCode, data) {
      try {
        const response = await axios.get(`${baseUrl}/json/source/文本${materialCode}.json`);
        const textData = response.data;

        if (!textData) {
          console.log("文本数据为空");
          return false;
        }

        this.updateAllTextData(textData, data);
        console.log("文本数据处理完成");
        this.$message.success('文本数据处理完成');
        return true;
      } catch (error) {
        console.warn("未找到文本数据JSON或处理出错:", error);
        return false;
      }
    },

    validateJsonStructure(data) {
      const requiredSections = ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'];
      const missingTopLevel = requiredSections.filter(section => !data[section]);

      if (missingTopLevel.length > 0) {
        console.warn(`警告: JSON缺少必需的顶级部分: ${missingTopLevel.join(', ')}`);
        return false;
      }

      let valid = true;
      requiredSections.forEach(section => {
        if (!Array.isArray(data[section])) {
          console.warn(`警告: ${section}部分不是数组格式`);
          valid = false;
          return;
        }

        data[section].forEach((item, index) => {
          if (!item.name) {
            console.warn(`警告: ${section}[${index}]缺少name字段`);
            valid = false;
          }

          if (item.tableData && !item.tableColumns) {
            console.warn(`警告: ${section}[${index}]有表格数据但缺少tableColumns定义`);
            valid = false;
          }

          if (item.seriesData && !item.echartMsg) {
            console.warn(`警告: ${section}[${index}]有图表数据但缺少echartMsg定义`);
            valid = false;
          }

          if (item.two) {
            if (!Array.isArray(item.two)) {
              console.warn(`警告: ${section}[${index}].two不是数组格式`);
              valid = false;
            } else {
              item.two.forEach((subItem, subIndex) => {
                if (!subItem.name) {
                  console.warn(`警告: ${section}[${index}].two[${subIndex}]缺少name字段`);
                  valid = false;
                }

                if (subItem.third && !Array.isArray(subItem.third)) {
                  console.warn(`警告: ${section}[${index}].two[${subIndex}].third不是数组格式`);
                  valid = false;
                }
              });
            }
          }
        });
      });

      return valid;
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

.content .nr .txt {
  padding-left: 2em;
  font-size: 14px;
  white-space: pre-wrap;
  line-height: 28px;
  color: #333
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

.sliderBox {
  width: 600px;
}

.material-images-container {
  margin-top: 30px;
  border-top: 1px dashed #eee;
  padding-top: 5px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  gap: 5px;
  width: 80%;
  max-width: 100%;
  overflow-x: auto;
}

.material-image-item {
  margin: 0;
  min-width: 150px;
  flex: 0 0 auto;
  box-sizing: border-box;
  padding: 5px;
  border: none;
  display: flex;
  flex-direction: column;
  height: auto;
  margin-bottom: 10px;
}

.material-image {
  margin-top: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90%;
  min-height: 120px;
}

.material-image img {
  width: 100%;
  object-fit: contain;
  border-radius: 2px;
  margin: 0;
}
</style>
