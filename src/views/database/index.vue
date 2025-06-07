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

            <!-- <div style="margin-top: 10px;">
              <el-button type="primary" size="mini" @click="showFolderUpload" icon="el-icon-folder-add">
                批量上传
              </el-button>
            </div> -->

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
                <!-- 修改：完整的递归数据渲染模板 -->
                <div v-if="introduce.length>0" v-for="(item,index) in introduce" :key="index">
                  <div class="tit1">{{item.name}}</div>
                  <div class="txt" v-html="processImageReferences(item.con)"></div>

                  <!-- 一级表格 -->
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

                  <!-- 一级多个独立表格 -->
                  <div v-if="item.multipleTables" class="multiple-tables">
                    <div v-for="(table, tableIndex) in item.multipleTables" :key="tableIndex" class="table-item">
                      <div class="table-title">{{ table.title }}</div>
                      <el-table size="mini" :data="table.tableData" style="width: 100%; margin-bottom: 20px;">
                        <el-table-column
                          v-for="column in table.tableColumns"
                          :key="column.prop"
                          :prop="column.prop"
                          :label="column.label">
                        </el-table-column>
                      </el-table>
                    </div>
                  </div>

                  <!-- 一级图表 -->
                  <div class="echartBox" v-if="item.seriesData">
                    <div :id="`echarts${item.echartMsg.echartId}`" class="echart"></div>
                  </div>

                  <!-- 一级多个独立图表 -->
                  <div v-if="item.multipleCharts" class="multiple-charts">
                    <div v-for="(chart, chartIndex) in item.multipleCharts" :key="chartIndex" class="chart-item">
                      <div class="chart-title">{{ chart.title }}</div>
                      <div :id="`echarts${chart.echartMsg.echartId}`" class="echart"></div>
                    </div>
                  </div>

                  <!-- 递归处理二级数据 -->
                  <template v-if="item.two">
                    <div v-for="(self,key) in item.two" :key="`two-${key}`" class="sub-level">
                      <div class="tit2">{{self.name}}</div>
                      <div class="txt" v-html="processImageReferences(self.con)"></div>

                      <!-- 二级表格 -->
                      <div class="table1" v-if="self.tableData">
                        <el-table size="mini" :data="self.tableData" style="width: 100%">
                          <el-table-column
                            v-for="column in self.tableColumns"
                            :key="column.prop"
                            :prop="column.prop"
                            :label="column.label">
                          </el-table-column>
                        </el-table>
                      </div>

                      <!-- 二级多个独立表格 -->
                      <div v-if="self.multipleTables" class="multiple-tables">
                        <div v-for="(table, tableIndex) in self.multipleTables" :key="tableIndex" class="table-item">
                          <div class="table-title">{{ table.title }}</div>
                          <el-table size="mini" :data="table.tableData" style="width: 100%; margin-bottom: 20px;">
                            <el-table-column
                              v-for="column in table.tableColumns"
                              :key="column.prop"
                              :prop="column.prop"
                              :label="column.label">
                            </el-table-column>
                          </el-table>
                        </div>
                      </div>

                      <!-- 二级图表 -->
                      <div class="echartBox" v-if="self.seriesData">
                        <div :id="`echarts${self.echartMsg.echartId}`" class="echart"></div>
                      </div>

                      <!-- 二级多个独立图表 -->
                      <div v-if="self.multipleCharts" class="multiple-charts">
                        <div v-for="(chart, chartIndex) in self.multipleCharts" :key="chartIndex" class="chart-item">
                          <div class="chart-title">{{ chart.title }}</div>
                          <div :id="`echarts${chart.echartMsg.echartId}`" class="echart"></div>
                        </div>
                      </div>

                      <!-- 递归处理三级数据 -->
                      <template v-if="self.third">
                        <div v-for="(option,num) in self.third" :key="`third-${num}`" class="sub-level">
                          <div class="tit3">{{option.name}}</div>
                          <div class="txt" v-html="processImageReferences(option.con)"></div>

                          <!-- 三级表格 -->
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

                          <!-- 三级多个独立表格 -->
                          <div v-if="option.multipleTables" class="multiple-tables">
                            <div v-for="(table, tableIndex) in option.multipleTables" :key="tableIndex" class="table-item">
                              <div class="table-title">{{ table.title }}</div>
                              <el-table size="mini" :data="table.tableData" style="width: 100%; margin-bottom: 20px;">
                                <el-table-column
                                  v-for="column in table.tableColumns"
                                  :key="column.prop"
                                  :prop="column.prop"
                                  :label="column.label">
                                </el-table-column>
                              </el-table>
                            </div>
                          </div>

                          <!-- 三级图表 -->
                          <div class="echartBox" v-if="option.seriesData">
                            <div :id="`echarts${option.echartMsg.echartId}`" class="echart"></div>
                          </div>

                          <!-- 三级多个独立图表 -->
                          <div v-if="option.multipleCharts" class="multiple-charts">
                            <div v-for="(chart, chartIndex) in option.multipleCharts" :key="chartIndex" class="chart-item">
                              <div class="chart-title">{{ chart.title }}</div>
                              <div :id="`echarts${chart.echartMsg.echartId}`" class="echart"></div>
                            </div>
                          </div>

                          <!-- 递归处理四级数据 -->
                          <template v-if="option.fourth">
                            <div v-for="(fourth,fourthIndex) in option.fourth" :key="`fourth-${fourthIndex}`" class="sub-level">
                              <div class="tit4">{{fourth.name}}</div>
                              <div class="txt" v-html="processImageReferences(fourth.con)"></div>

                              <!-- 四级表格 -->
                              <div class="table1" v-if="fourth.tableData">
                                <el-table size="mini" :data="fourth.tableData" style="width: 100%">
                                  <el-table-column
                                    v-for="column in fourth.tableColumns"
                                    :key="column.prop"
                                    :prop="column.prop"
                                    :label="column.label">
                                  </el-table-column>
                                </el-table>
                              </div>

                              <!-- 四级多个独立表格 -->
                              <div v-if="fourth.multipleTables" class="multiple-tables">
                                <div v-for="(table, tableIndex) in fourth.multipleTables" :key="tableIndex" class="table-item">
                                  <div class="table-title">{{ table.title }}</div>
                                  <el-table size="mini" :data="fourth.tableData" style="width: 100%; margin-bottom: 20px;">
                                    <el-table-column
                                      v-for="column in fourth.tableColumns"
                                      :key="column.prop"
                                      :prop="column.prop"
                                      :label="column.label">
                                    </el-table-column>
                                  </el-table>
                                </div>
                              </div>

                              <!-- 四级图表 -->
                              <div class="echartBox" v-if="fourth.seriesData">
                                <div :id="`echarts${fourth.echartMsg.echartId}`" class="echart"></div>
                              </div>

                              <!-- 四级多个独立图表 -->
                              <div v-if="fourth.multipleCharts" class="multiple-charts">
                                <div v-for="(chart, chartIndex) in fourth.multipleCharts" :key="chartIndex" class="chart-item">
                                  <div class="chart-title">{{ chart.title }}</div>
                                  <div :id="`echarts${chart.echartMsg.echartId}`" class="echart"></div>
                                </div>
                              </div>
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
              :key="item.prop"
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
              <el-button @click.native.prevent="detailRow(scope.row)" type="text" size="small">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 新增：简化的文件夹上传对话框 -->
    <el-dialog title="批量材料文件处理" :visible.sync="folderUploadVisible" width="70%" :close-on-click-modal="false">
      <div class="folder-upload-container">

        <!-- 上传区域 -->
        <div class="upload-area"
             :class="{ dragover: isDragOver }"
             @drop="handleDrop"
             @dragover="handleDragOver"
             @dragleave="handleDragLeave"
             @click="triggerFileInput">
          <input ref="folderInput"
                 type="file"
                 webkitdirectory
                 directory
                 multiple
                 style="display: none;"
                 @change="handleFolderSelect">
          <i class="el-icon-upload"></i>
          <div class="upload-text">
            <p>选择包含材料文件的文件夹</p>
            <p class="upload-tip">支持: JSON(基础数据) + XLSX(表格/图表数据)</p>
          </div>
        </div>

        <!-- 简化的分析结果 -->
        <div v-if="folderAnalysis" class="file-analysis">
          <h4>📁 检测结果</h4>
          <div class="stats">
            <span>总文件: {{folderAnalysis.statistics.totalFiles}}</span>
            <span>材料数: {{folderAnalysis.statistics.materialsCount}}</span>
            <span>可处理: {{folderAnalysis.statistics.readyMaterials}}</span>
          </div>

          <div class="materials-grid">
            <div v-for="material in folderAnalysis.materials" :key="material.code" class="material-item">
              <span class="material-code">{{material.code}}</span>
              <div class="file-types">
                <span v-if="material.hasJson" class="file-type json">J</span>
                <span v-if="material.hasTableExcel" class="file-type table">T</span>
                <span v-if="material.hasChartExcel" class="file-type chart">C</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 处理进度 -->
        <div v-if="isProcessing" class="processing">
          <h4>🔄 处理中...</h4>
          <el-progress :percentage="processProgress.progress"></el-progress>
          <p>{{processProgress.currentMaterial}} ({{processProgress.current}}/{{processProgress.total}})</p>
        </div>

        <!-- 简化的处理结果 -->
        <div v-if="batchResults" class="results">
          <h4>✅ 处理完成</h4>
          <div class="result-stats">
            <el-tag type="success">成功: {{batchResults.summary.processed}}</el-tag>
            <el-tag type="danger" v-if="batchResults.summary.failed > 0">失败: {{batchResults.summary.failed}}</el-tag>
            <el-tag type="warning" v-if="batchResults.summary.skipped > 0">跳过: {{batchResults.summary.skipped}}</el-tag>
          </div>

          <div class="processed-materials">
            <div v-for="(data, materialCode) in batchResults.processedMaterials"
                 :key="materialCode"
                 class="processed-item">
              <span>{{materialCode}}</span>
              <span>{{getDataItemsCount(data)}} 项</span>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer">
        <el-button @click="folderUploadVisible = false">关闭</el-button>
        <el-button v-if="folderAnalysis && !isProcessing && !batchResults"
                   type="primary"
                   @click="startBatchProcessing"
                   :disabled="folderAnalysis.statistics.readyMaterials === 0">
          开始处理
        </el-button>
        <el-button v-if="batchResults" type="success" @click="downloadBatchResults">
          下载结果
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import smallNav from "../../components/smallNav/smallNav";
import { getJson } from '@/api/database/dataStretch.js'
import { DataProcessor, FileUploadProcessor } from '@/utils/dataProcessor.js'

const baseUrl = process.env.NODE_ENV === 'production' ? 'http://www.ai4matter.com' : 'http://localhost:8100';

export default {
  components: { smallNav },

  created() {
    this.initProcessors();
    this.getMsg(`${baseUrl}/json/GH1015.json`);
    this.getMenu();
  },

  data() {
    return {
      // 基础数据
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

      // 表单数据
      form: {
        region: [7.5, 8.0],
        regionVal1: 75,
        regionVal2: 80,
        component: [],
        craft: [],
        type: 0,
      },

      // 配置数据
      componentList: [
        {"label":"C","prop":"C"},{"label":"Cr","prop":"Cr"},{"label":"Ni","prop":"Ni"},
        {"label":"W","prop":"W"},{"label":"Mo","prop":"Mo"},{"label":"Fe","prop":"Fe"},
        {"label":"Nb","prop":"Nb"},{"label":"B","prop":"B"},{"label":"Ce","prop":"Ce"},
        {"label":"Mn","prop":"Mn"},{"label":"Si","prop":"Si"},{"label":"P","prop":"P"},
        {"label":"S","prop":"S"},{"label":"Cu","prop":"Cu"},{"label":"V","prop":"V"},
        {"label":"N","prop":"N"},{"label":"Al","prop":"Al"},{"label":"Ti","prop":"Ti"},
        {"label":"Co","prop":"Co"},{"label":"Sn","prop":"Sn"},{"label":"Pb","prop":"Pb"},
        {"label":"Zr","prop":"Zr"},{"label":"La","prop":"La"},{"label":"Sb","prop":"Sb"},
        {"label":"As","prop":"As"},{"label":"Bi","prop":"Bi"},{"label":"Ta","prop":"Ta"},
        {"label":"Se","prop":"Se"},{"label":"Ag","prop":"Ag"},{"label":"Mg","prop":"Mg"},
        {"label":"Hf","prop":"Hf"},{"label":"Ga","prop":"Ga"},{"label":"In","prop":"In"},
        {"label":"Te","prop":"Te"},{"label":"Tl","prop":"Tl"},{"label":"Zn","prop":"Zn"},
        {"label":"Cd","prop":"Cd"}
      ],

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

      // 新增：文件夹上传相关
      folderUploadVisible: false,
      isDragOver: false,
      uploadedFiles: [],
      folderAnalysis: null,
      isProcessing: false,
      processProgress: {
        current: 0,
        total: 0,
        progress: 0,
        currentMaterial: ''
      },
      batchResults: null,
    };
  },

  methods: {
    // 修复：初始化方法增加错误处理
    initProcessors() {
      try {
        this.dataProcessor = new DataProcessor(baseUrl);
        this.fileUploadProcessor = new FileUploadProcessor(baseUrl);

        if (this.validateProcessors()) {
          console.log('✅ 数据处理器初始化成功');
          // 新增：验证方法使用情况
          this.dataProcessor.validateMethodUsage();
        }
      } catch (error) {
        console.error('❌ 数据处理器初始化失败:', error);
        this.$message.error('系统初始化失败: ' + error.message);
      }
    },

    // 搜索功能
    searchFun() {
      if (!this.searchValue || !this.searchValue.trim()) {
        this.$message.warning('请输入搜索内容');
        return;
      }

      const trimmedValue = this.searchValue.trim();

      for (const menuItem of this.menuData) {
        if (!menuItem.list || !Array.isArray(menuItem.list)) continue;

        for (const material of menuItem.list) {
          if (material.name && material.name.indexOf(trimmedValue) > -1) {
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
          let arr = item.index.split("-");
          let typeStr = arr[0];
          if (val == 0) {
            return item;
          } else if (typeStr == val) {
            return item;
          }
        } else if (key === 'component') {
          if (val.length == 0) {
            return item;
          } else if (this.containsArray(item.key_component, val)) {
            return item;
          }
        } else if (key === 'craft') {
          if (val.length == 0) {
            return item;
          } else if (this.containsArray(item.key_craft, val)) {
            return item;
          }
        } else if (key === 'region') {
          if (Number(val[0]) <= item.key_density && Number(val[1]) >= item.key_density) {
            return item;
          }
        } else {
          return item;
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

    densityChange() {
      this.form.regionVal1 = this.form.region[0];
      this.form.regionVal2 = this.form.region[1];
    },

    // 标签页切换
    tabClick(data) {
      const sections = ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'];
      const sectionIndex = parseInt(this.activeName);

      console.log('🏷️ 标签页切换:', {
        索引: sectionIndex,
        章节名: sections[sectionIndex],
        材料: this.name2
      });

      if (sectionIndex >= 0 && sectionIndex < sections.length) {
        this.introduce = this.jsonData[sections[sectionIndex]] || [];

        // 特别关注组织结构章节
        if (sections[sectionIndex] === 'microstructures') {
          console.log('🔬 切换到组织结构章节:', this.introduce);
          this.preloadMicrostructureImages(this.introduce);

          // 调试当前章节的文本内容
          this.introduce.forEach((item, index) => {
            if (item.con) {
              console.log(`📝 章节 ${index + 1} 内容:`, item.con);
            }
          });
        }

        this.drawFun();
      } else {
        console.warn('⚠️ 无效的标签页索引:', this.activeName);
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
      console.log('📡 获取数据:', getJsonUrl);

      getJson(getJsonUrl).then(data => {
        this.jsonData = data;
        this.introduce = data.introduce;

        console.log('📊 JSON数据加载完成:', {
          材料名称: this.name2,
          数据sections: Object.keys(data),
          introduce条目数: data.introduce?.length || 0
        });

        // 预加载组织结构图片
        if (data.microstructures) {
          this.preloadMicrostructureImages(data.microstructures);
        }

        // 调试图片路径
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => this.debugImagePaths(), 1000);
        }

        this.drawFun();
      }).catch(error => {
        console.error('❌ 数据加载失败:', error);
      });
    },

    getMenu() {
      let getJsonUrl = `${baseUrl}/json/menu.json`;
      getJson(getJsonUrl).then(data => {
        this.menuData = data.menu;
        this.menuData.forEach((item) => {
          item.list.forEach((self) => {
            this.tableList.push(self);
          });
        });
      });
    },

    // 图表绘制
    drawFun() {
      setTimeout(() => {
        this.introduce.forEach((item) => {
          this.drawItemCharts(item);

          if (item.two) {
            item.two.forEach((self) => {
              this.drawItemCharts(self);

              if (self.third) {
                self.third.forEach((option) => {
                  this.drawItemCharts(option);

                  // 新增：处理四级数据
                  if (option.fourth) {
                    option.fourth.forEach((fourth) => {
                      this.drawItemCharts(fourth);
                    });
                  }
                });
              }
            });
          }
        });
      }, 100);
    },

    // 新增：统一的图表绘制方法 - 修复chartObj变量问题
    drawItemCharts(item) {
      if (!item) return;

      try {
        // 绘制主图表
        if (item.seriesData && item.echartMsg && item.echartMsg.echartId) {
          const chartElement = document.getElementById("echarts" + item.echartMsg.echartId);
          if (chartElement) {
            const chartObj = this.$echarts.init(chartElement);
            this.initChart1(chartObj, item.xAxisData || [], item.seriesData, item.echartMsg);
          } else {
            console.warn('⚠️ 图表元素未找到:', "echarts" + item.echartMsg.echartId);
          }
        }

        // 绘制多个独立图表
        if (item.multipleCharts && Array.isArray(item.multipleCharts)) {
          item.multipleCharts.forEach((chart, index) => {
            if (chart.echartMsg && chart.echartMsg.echartId) {
              const chartElement = document.getElementById("echarts" + chart.echartMsg.echartId);
              if (chartElement) {
                const chartObj = this.$echarts.init(chartElement);
                this.initChart1(chartObj, chart.xAxisData || [], chart.seriesData, chart.echartMsg);
              } else {
                console.warn('⚠️ 多图表元素未找到:', "echarts" + chart.echartMsg.echartId);
              }
            }
          });
        }
      } catch (error) {
        console.error('❌ 图表绘制失败:', error);
      }
    },

    // 图表配置
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

      if (Chart) {
        Chart.clear();
      }
      Chart.setOption(option, true);
    },

    // 新增：显示文件夹上传对话框
    showFolderUpload() {
      this.folderUploadVisible = true;
      this.resetUploadState();
    },

    // 新增：重置上传状态
    resetUploadState() {
      this.uploadedFiles = [];
      this.folderAnalysis = null;
      this.isProcessing = false;
      this.batchResults = null;
      this.processProgress = {
        current: 0,
        total: 0,
        progress: 0,
        currentMaterial: ''
      };
    },

    // 新增：触发文件选择
    triggerFileInput() {
      this.$refs.folderInput.click();
    },

    // 新增：处理文件夹选择
    handleFolderSelect(event) {
      const files = Array.from(event.target.files);
      this.processUploadedFiles(files);
    },

    // 新增：处理拖拽
    handleDragOver(event) {
      event.preventDefault();
      this.isDragOver = true;
    },

    handleDragLeave(event) {
      event.preventDefault();
      this.isDragOver = false;
    },

    handleDrop(event) {
      event.preventDefault();
      this.isDragOver = false;

      const files = Array.from(event.dataTransfer.files);
      this.processUploadedFiles(files);
    },

    // 新增：处理上传的文件
    processUploadedFiles(files) {
      if (files.length === 0) {
        this.$message.warning('没有选择文件');
        return;
      }

      this.uploadedFiles = files;
      this.folderAnalysis = this.fileUploadProcessor.analyzeFolderContents(files);

      if (this.folderAnalysis.statistics.materialsCount === 0) {
        this.$message.warning('未检测到有效的材料文件');
      } else {
        this.$message.success(`检测到 ${this.folderAnalysis.statistics.materialsCount} 种材料`);
      }
    },

    // 简化的批量处理
    async startBatchProcessing() {
      if (!this.folderAnalysis || this.folderAnalysis.statistics.readyMaterials === 0) {
        this.$message.warning('没有可处理的材料');
        return;
      }

      // 验证处理器状态
      if (!this.validateProcessors()) {
        this.$message.error('数据处理器未正确初始化');
        return;
      }

      this.isProcessing = true;
      this.batchResults = null;

      try {
        const results = await this.fileUploadProcessor.processBatchMaterials(
          this.uploadedFiles,
          (progress) => {
            this.processProgress = progress;
            // 新增：进度验证
            if (progress.progress > 100) {
              console.warn('⚠️ 进度超过100%:', progress);
            }
          }
        );

        this.batchResults = results;
        this.isProcessing = false;

        if (results && results.success) {
          this.$message.success(`处理完成! 成功处理 ${results.summary.processed} 种材料`);
        } else {
          this.$message.error(results?.message || '处理失败');
        }

      } catch (error) {
        console.error('❌ 批量处理失败:', error);
        this.$message.error('批量处理失败: ' + error.message);
        this.isProcessing = false;
      }
    },

    // 修改：简化的下载结果 - 支持菜单合并
    async downloadBatchResults() {
      try {
        // 传递现有菜单URL进行合并
        const existingMenuUrl = `${baseUrl}/json/menu.json`;
        const zipBlob = await this.fileUploadProcessor.exportBatchResults(
          this.batchResults,
          true,
          existingMenuUrl
        );

        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `materials_batch_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.$message.success('结果已下载（包含合并后的菜单文件）');
      } catch (error) {
        console.error('❌ 下载失败:', error);
        this.$message.error('下载失败: ' + error.message);
      }
    },

    // 新增：重新加载菜单数据
    async refreshMenuData() {
      try {
        await this.getMenu();
        this.$message.success('菜单数据已刷新');
      } catch (error) {
        console.error('❌ 菜单刷新失败:', error);
        this.$message.error('菜单刷新失败: ' + error.message);
      }
    },

    // 修改：验证数据处理器状态
    validateProcessors() {
      const issues = [];

      if (!this.dataProcessor) {
        issues.push('DataProcessor 未初始化');
      } else if (typeof this.dataProcessor.processThreeTypesDataIntegration !== 'function') {
        issues.push('DataProcessor 方法不完整');
      }

      if (!this.fileUploadProcessor) {
        issues.push('FileUploadProcessor 未初始化');
      } else {
        // 检查关键方法是否存在
        const requiredMethods = [
          'processBatchMaterials',
          'exportBatchResults',
          'analyzeFolderContents',
          'processSingleMaterialWithThreeTypes',
          'determineMaterialCategory'
        ];

        const missingMethods = requiredMethods.filter(method =>
          typeof this.fileUploadProcessor[method] !== 'function'
        );

        if (missingMethods.length > 0) {
          issues.push(`FileUploadProcessor 缺少方法: ${missingMethods.join(', ')}`);
        }
      }

      if (issues.length > 0) {
        console.warn('⚠️ 处理器验证失败:', issues);
        return false;
      }

      console.log('✅ 处理器验证通过');
      return true;
    },

    // 新增：获取数据项数量（添加缺失的方法）
    getDataItemsCount(materialData) {
      if (this.fileUploadProcessor && typeof this.fileUploadProcessor.countDataItems === 'function') {
        return this.fileUploadProcessor.countDataItems(materialData);
      }

      // 备用计算方法
      let count = 0;
      const sections = ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'];
      sections.forEach(section => {
        if (materialData[section] && Array.isArray(materialData[section])) {
          count += materialData[section].length;
        }
      });
      return count;
    },

    // 修改：修正图片引用处理的正则表达式
    processImageReferences(text) {
      if (!text) return '';

      console.log('🔍 处理文本:', text.substring(0, 200) + '...');

      let processedText = text.replace(/@@/g, "\n");

      // 修改：更新正则表达式，匹配图片引用
      const imageRefPattern = /图\d+[-－−—]\d+[a-zA-Z]*/g;

      const matches = [];
      const processedRefs = new Set();
      let match;

      // 重置正则表达式状态
      imageRefPattern.lastIndex = 0;

      while ((match = imageRefPattern.exec(text)) !== null) {
        let rawImageRef = match[0];
        let cleanImageRef = this.normalizeImageReference(rawImageRef);

        // 避免重复处理相同的图片引用
        if (processedRefs.has(cleanImageRef)) {
          continue;
        }
        processedRefs.add(cleanImageRef);

        // 生成图片变体
        const imageVariants = this.generateImageVariants(cleanImageRef);

        imageVariants.forEach((variant, index) => {
          const imgInfo = {
            fullMatch: match[0],
            originalRef: rawImageRef,
            cleanRef: variant,
            imgUrl: `${baseUrl}/img/${this.name2}/${variant}`,
            uniqueId: `img-${this.name2}-${variant}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            isVariant: index > 0,
            baseRef: cleanImageRef
          };
          matches.push(imgInfo);
        });

        console.log('📸 找到图片引用:', {
          原文: match[0],
          原始引用: rawImageRef,
          规范化引用: cleanImageRef,
          生成变体数量: imageVariants.length,
          变体列表: imageVariants
        });
      }

      console.log('📋 所有匹配到的图片（含变体）:', matches.length, '个');

      if (matches.length > 0) {
        const containerId = `image-container-${Date.now()}`;
        let imageHtml = `<div id="${containerId}" class="material-images-container">`;

        matches.forEach((item, index) => {
          // 修改：使用flex布局显示，压缩上下间距
          imageHtml += `
            <div class="material-image-item" style="display: none;" data-base-ref="${item.baseRef}">
              <div class="image-caption">${item.cleanRef}</div>
              <div class="material-image">
                <img id="${item.uniqueId}"
                     alt="${item.cleanRef}"
                     onload="console.log('✅ 图片加载成功:', this.src);
                             this.parentElement.parentElement.style.display='flex';
                             this.parentElement.parentElement.style.flexDirection='column';
                             this.parentElement.parentElement.style.alignItems='flex-start';"
                     onerror="console.log('❌ 图片加载失败:', this.src);
                             var formats = ['.jpg', '.png', '.jpeg'];
                             var currentSrc = this.src;
                             var baseSrc = currentSrc.replace(/\.(jpg|png|jpeg)$/i, '');
                             var currentFormat = currentSrc.match(/\.(jpg|png|jpeg)$/i);
                             var currentIndex = currentFormat ? formats.indexOf('.' + currentFormat[1].toLowerCase()) : -1;

                             if (currentIndex < formats.length - 1) {
                               var nextFormat = formats[currentIndex + 1];
                               console.log('🔄 尝试下一个格式:', nextFormat);
                               this.src = baseSrc + nextFormat;
                             } else {
                               console.log('💀 所有格式都失败，移除元素');
                               this.parentElement.parentElement.remove();
                             }" />
              </div>
            </div>`;
        });

        imageHtml += '</div>';
        processedText += imageHtml;

        // 修改：延迟加载图片，避免立即触发所有请求
        setTimeout(() => {
          matches.forEach((item, index) => {
            setTimeout(() => {
              const imgElement = document.getElementById(item.uniqueId);
              if (imgElement) {
                // 按顺序尝试不同格式
                imgElement.src = `${item.imgUrl}.jpg`;
                console.log('🚀 开始加载图片:', imgElement.src);
              }
            }, index * 100); // 每个图片延迟100ms加载
          });
        }, 500);

        console.log('🎯 生成的HTML片段包含图片数:', matches.length);
      } else {
        console.log('⚠️ 未找到任何图片引用');
      }

      return processedText;
    },

    // 新增：生成图片变体方法
    generateImageVariants(cleanRef) {
      const variants = [cleanRef]; // 首先包含原始引用

      // 检查是否为基础格式（如"图5-1"，没有字母后缀）
      const basicPattern = /^图\d+-\d+$/;
      if (basicPattern.test(cleanRef)) {
        // 为基础格式生成常见的字母后缀变体
        const commonSuffixes = ['a', 'b', 'c', 'd', 'e'];
        commonSuffixes.forEach(suffix => {
          variants.push(`${cleanRef}_${suffix}`);
        });

        console.log('🔄 为基础格式生成变体:', {
          基础引用: cleanRef,
          生成变体: variants.slice(1) // 排除原始引用
        });
      }

      return variants;
    },

    // 修改：更新规范化图片引用格式，去除括号处理
    normalizeImageReference(rawRef) {
      if (!rawRef) return '';

      // 移除可能的空格（不处理括号，因为新的正则已经排除了括号）
      let cleanRef = rawRef.trim();

      // 标准化连字符（将各种连字符统一为标准的连字符）
      cleanRef = cleanRef.replace(/[－−—]/g, '-');

      // 检查是否有字母后缀但没有下划线，需要添加下划线
      const letterSuffixMatch = cleanRef.match(/^(图\d+-\d+)([a-zA-Z]+)$/);
      if (letterSuffixMatch) {
        // 将字母后缀前添加下划线：图5-3a -> 图5-3_a
        cleanRef = letterSuffixMatch[1] + '_' + letterSuffixMatch[2];
      }

      console.log('🔧 图片引用规范化:', {
        原始: rawRef,
        规范化: cleanRef,
        有字母后缀: !!letterSuffixMatch
      });

      return cleanRef;
    },

    // 修改：更新预加载方法
    preloadMicrostructureImages(microstructures) {
      if (!Array.isArray(microstructures)) return;

      console.log('🔄 开始预加载组织结构图片:', microstructures.length, '个项目');

      const processItem = (item) => {
        if (item?.con) {
          const imageRefPattern = /图\d+[-－−—]\d+[a-zA-Z]*/g;
          const processedRefs = new Set();
          let match;

          while ((match = imageRefPattern.exec(item.con)) !== null) {
            const rawImageRef = match[0];
            const cleanImageRef = this.normalizeImageReference(rawImageRef);

            if (processedRefs.has(cleanImageRef)) continue;
            processedRefs.add(cleanImageRef);

            // 生成变体并预加载
            const imageVariants = this.generateImageVariants(cleanImageRef);

            imageVariants.forEach(variant => {
              ['jpg', 'png', 'jpeg'].forEach(ext => {
                const img = new Image();
                const imgUrl = `${baseUrl}/img/${this.name2}/${variant}.${ext}`;

                img.onload = () => {
                  console.log(`✅ 预加载成功: ${imgUrl}`);
                };
                img.onerror = () => {
                  img.src = '';
                };

                img.src = imgUrl;
              });
            });
          }
        }

        // 递归处理子级数据
        if (item?.two) item.two.forEach(processItem);
        if (item?.third) item.third.forEach(processItem);
        if (item?.fourth) item.fourth.forEach(processItem);
      };

      microstructures.forEach(processItem);
    },

    // 修改：更新调试方法
    debugImagePaths() {
      if (!this.name2) {
        console.log('❌ 当前材料名称为空');
        return;
      }

      console.log('🧪 调试图片路径:');
      console.log('- 当前材料:', this.name2);
      console.log('- Base URL:', baseUrl);

      // 测试基础格式的变体生成
      const testBasicRefs = ['图5-1', '图5-2', '图5-3'];
      console.log('🧬 测试变体生成:');
      testBasicRefs.forEach(ref => {
        const variants = this.generateImageVariants(ref);
        console.log(`  ${ref} -> 变体:`, variants);
      });

      // 测试所有可能的图片路径
      const allTestReferences = [
        '图5-1', '图5-1_a', '图5-1_b', '图5-1_c',
        '图5-2', '图5-2_a', '图5-2_b', '图5-2_c',
        '图5-3', '图5-3_a', '图5-3_b', '图5-3_c'
      ];
      const testFormats = ['jpg', 'png', 'jpeg'];

      console.log('🔍 测试所有图片路径:');
      allTestReferences.forEach(imgRef => {
        testFormats.forEach(format => {
          const testUrl = `${baseUrl}/img/${this.name2}/${imgRef}.${format}`;
          console.log(`   ${testUrl}`);

          // 创建图片对象测试是否可访问
          const img = new Image();
          img.onload = () => console.log(`   ✅ 可访问: ${testUrl}`);
          img.onerror = () => console.log(`   ❌ 不可访问: ${testUrl}`);
          img.src = testUrl;
        });
      });
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
  margin-bottom: 0; /* 确保文本底部没有多余边距 */
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

.material-images-container {
  margin-top: -5px;
  margin-bottom: -5px;
  border-top: 0px dashed #edeff9;
  padding-top: 0px;
  padding-bottom: 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0px;
  width: 100%;
  max-width: 100%;
  line-height: 1;
}

.material-image-item {
  margin: 0;
  margin-top: -20px;
  margin-bottom: -20px;
  width: auto;
  max-width: 300px;
  box-sizing: border-box;
  padding: 0;
  border: none;
  display: none;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1;
  vertical-align: top;
}

.image-caption {
  text-align: left;
  font-size: 12px;
  color: #666;
  margin-top: -10px;
  margin-bottom: -10px;
  padding: 1px 3px;
  background: #f0f0f0;
  border-radius: 2px;
  font-weight: 500;
  width: fit-content;
  line-height: 1;
  height: auto;
}

.material-image {
  margin-top: -10px;
  margin-bottom: -10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 50px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #f9f9f9;
  overflow: hidden;
  padding: 1px;
  line-height: 1;
}

.material-image img {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 2px;
  margin: 0;
  margin-top: -1px; /* 图片向上负边距 */
  padding: 0;
  max-height: 120px;
  display: block;
  line-height: 1;
  transform: translateY(-1px); /* 图片向上偏移1px */
}

/* 修改：处理相邻图片项的负边距 */
.material-image-item + .material-image-item {
  margin-top: -4px; /* 相邻图片项更大的负边距 */
  border-top: none;
  transform: translateY(-2px); /* 相邻项额外向上偏移2px */
}

/* 修改：强制压缩容器内元素间距 */
.material-images-container > .material-image-item {
  padding: 0;
  margin: 0;
  margin-top: -3px; /* 容器内图片项负边距 */
  margin-bottom: -1px;
}

/* 修改：标题与图片之间使用负边距 */
.material-image-item > .image-caption {
  padding: 1px 3px;
  margin-bottom: -2px; /* 标题与图片间负边距 */
  transform: translateY(-1px);
}

.material-image-item > .material-image {
  padding: 1px;
  margin-top: -2px; /* 图片容器负边距 */
  margin-bottom: 0;
  transform: translateY(-1px);
}

/* 修改：文本与图片容器使用负边距连接 */
.content .nr .txt + .material-images-container {
  margin-top: -8px; /* 完全移除间距：从1px改为0px */
  transform: translateY(-3px); /* 额外向上偏移 */
}

/* 新增：第一个图片项特殊处理 */
.material-image-item:first-child {
  margin-top: -5px; /* 第一个图片项更大负边距 */
  transform: translateY(-3px); /* 第一个图片项更大偏移 */
}

/* 新增：最后一个图片项特殊处理 */
.material-image-item:last-child {
  margin-bottom: -3px; /* 最后一个图片项负边距 */
  transform: translateY(-2px);
}

/* 修改：响应式布局使用更大负边距 */
@media (max-width: 768px) {
  .material-images-container {
    gap: 0px;
    margin-top: -8px; /* 小屏幕更大负边距 */
    margin-bottom: -5px;
    padding-top: 0px;
    padding-bottom: 0px;
    transform: translateY(-5px); /* 小屏幕更大偏移 */
  }

  .material-image-item {
    max-width: 250px;
    margin-top: -3px; /* 小屏幕负边距 */
    margin-bottom: -2px;
    transform: translateY(-2px);
  }

  .material-image-item + .material-image-item {
    margin-top: -5px; /* 小屏幕相邻项更大负边距 */
    transform: translateY(-3px);
  }

  .material-image {
    min-height: 40px;
    padding: 0px;
    margin-top: -2px;
    margin-bottom: -1px;
    transform: translateY(-1px);
  }

  .material-image img {
    max-height: 80px;
    margin-top: -1px;
    transform: translateY(-1px);
  }

  .image-caption {
    font-size: 11px;
    margin-top: -2px;
    margin-bottom: -2px;
    padding: 0px 2px;
    transform: translateY(-1px);
  }

  .content .nr .txt + .material-images-container {
    margin-top: -10px; /* 小屏幕文本与图片间更大负边距 */
    transform: translateY(-5px);
  }
}

/* 新增：强制覆盖任何可能的默认间距 */
.material-images-container * {
  box-sizing: border-box;
}

/* 新增：使用绝对定位进一步压缩（可选） */
.material-image-item[style*="display: flex"] {
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: auto;
  align-self: flex-start;
  position: relative; /* 启用相对定位以便使用transform */
}

/* 新增：容器内强制紧凑布局 */
.material-images-container {
  font-size: 0;
  position: relative; /* 启用相对定位 */
}

.material-images-container > .material-image-item {
  font-size: initial;
  position: relative; /* 每个图片项启用相对定位 */
}
</style>
