<template>
  <div class="data-serach">
    <small-nav></small-nav>
    <div class="con">
      <el-container style="height:88vh">
        <el-aside width="240px">
          <div class="search_box">
            <el-button type="primary" @click="asJson">导入表格数据</el-button>
            <el-button type="success" @click="showFolderUpload" icon="el-icon-folder-opened">上传文件夹</el-button>
            <el-input placeholder="请输入合金名称" v-model="searchValue" size="mini">
              <el-button slot="append" @click="searchFun" icon="el-icon-search"></el-button>
              <el-button slot="append" @click="searchMoreFun" icon="el-icon-menu"></el-button>
            </el-input>
          </div>
          <el-menu :default-active="defaultActive" :unique-opened="true">
            <el-submenu :index="item.index" v-for="(item, index) in menuData" :key="index">
              <template slot="title">{{ item.name }}</template>
              <el-menu-item @click="changeFun(item.name, self)" v-for="(self, key) in item.list" :key="key" :index="self.index">
                {{ self.name }}
              </el-menu-item>
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
                <el-tab-pane v-for="(tab, index) in tabs" :key="index" :label="tab.label" :name="index.toString()"></el-tab-pane>
              </el-tabs>
              <div class="nr">
                <template v-if="introduce.length > 0">
                  <div v-for="(item, index) in introduce" :key="index">
                    <div class="tit1">{{ item.name }}</div>
                    <div class="txt" v-html="processImageReferences(item.con)"></div>
                    <el-table v-if="item.tableData" size="mini" :data="item.tableData" style="width: 100%" class="table1">
                      <el-table-column v-for="column in item.tableColumns" :key="column.prop" :prop="column.prop" :label="column.label"></el-table-column>
                    </el-table>
                    <div v-if="item.seriesData" class="echartBox">
                      <div :id="`echarts${item.echartMsg.echartId}`" class="echart"></div>
                    </div>
                    <!-- 处理二级数据 -->
                    <template v-if="item.two && item.two.length > 0">
                      <div v-for="(subItem, key) in item.two" :key="key">
                        <div class="tit2">{{ subItem.name }}</div>
                        <div class="txt" v-html="processImageReferences(subItem.con)"></div>
                        <el-table v-if="subItem.tableData" size="mini" :data="subItem.tableData" style="width: 100%" class="table1">
                          <el-table-column v-for="column in subItem.tableColumns" :key="column.prop" :prop="column.prop" :label="column.label"></el-table-column>
                        </el-table>
                        <div v-if="subItem.seriesData" class="echartBox">
                          <div :id="`echarts${subItem.echartMsg.echartId}`" class="echart"></div>
                        </div>
                        <!-- 处理三级数据 -->
                        <template v-if="subItem.third && subItem.third.length > 0">
                          <div v-for="(thirdItem, num) in subItem.third" :key="num">
                            <div class="tit2">{{ thirdItem.name }}</div>
                            <div class="txt" v-html="processImageReferences(thirdItem.con)"></div>
                            <el-table v-if="thirdItem.tableData" size="mini" :data="thirdItem.tableData" style="width: 100%" class="table1">
                              <el-table-column v-for="column in thirdItem.tableColumns" :key="column.prop" :prop="column.prop" :label="column.label"></el-table-column>
                            </el-table>
                            <div v-if="thirdItem.seriesData" class="echartBox">
                              <div :id="`echarts${thirdItem.echartMsg.echartId}`" class="echart"></div>
                            </div>
                          </div>
                        </template>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </div>

    <!-- 筛选对话框 -->
    <el-dialog title="筛选" :visible.sync="dialogFormVisible">
      <el-form :model="form" label-width="100px">
        <el-form-item v-for="field in filterFields" :key="field.key" :label="field.label">
          <el-select v-if="field.type === 'select'" v-model="form[field.key]" :clearable="field.clearable" :multiple="field.multiple" :placeholder="field.placeholder">
            <el-option v-for="option in field.options" :key="option.value || option.prop" :label="option.label" :value="option.value || option.prop"></el-option>
          </el-select>
          <div v-else-if="field.type === 'slider'" class="density-control">
            <div class="block sliderBox">
              <el-slider v-model="form.region" range :step="0.02" @change="densityChange" :min="7" :max="10"></el-slider>
            </div>
            <el-input disabled v-model="form.regionVal1" style="width: 60px;margin-left: 5px;"></el-input>~
            <el-input disabled v-model="form.regionVal2" style="width: 60px;margin-left: 5px;margin-right: 5px;"></el-input>g/cm³
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">搜索</el-button>
          <el-button @click="dialogFormVisible = false">关闭</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column v-for="col in tableColumns" :key="col.prop" :prop="col.prop" :label="col.label" :width="col.width"></el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button @click.native.prevent="detailRow(scope.row)" type="text" size="small">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 文件夹上传对话框 -->
    <el-dialog title="上传材料数据文件夹" :visible.sync="folderUploadVisible" width="600px" :close-on-click-modal="false">
      <div class="folder-upload-container">
        <div class="upload-area"
             @dragover.prevent
             @drop="handleFolderDrop"
             @click="triggerFolderSelect"
             :class="{ 'dragover': isDragOver }"
             @dragenter="isDragOver = true"
             @dragleave="isDragOver = false">
          <i class="el-icon-folder-add" style="font-size: 48px; color: #409EFF;"></i>
          <p>点击选择文件夹或拖拽文件夹到此处</p>
          <p class="upload-tip">支持包含 JSON、Excel 文件的材料数据文件夹</p>
        </div>

        <input ref="folderInput" type="file" webkitdirectory directory multiple style="display: none;" @change="handleFolderSelect" />

        <div v-if="uploadedFiles.length > 0" class="file-list">
          <h4>已选择的文件:</h4>
          <div class="file-item" v-for="file in uploadedFiles" :key="file.name">
            <i :class="getFileIcon(file.name)"></i>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">({{ formatFileSize(file.size) }})</span>
          </div>

          <div class="material-code-input" style="margin-top: 20px;">
            <label>材料编号:</label>
            <el-input v-model="materialCodeFromFolder" placeholder="例如: GH1139" style="width: 200px; margin-left: 10px;"></el-input>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="folderUploadVisible = false">取消</el-button>
        <el-button type="primary" @click="processUploadedFolder" :disabled="uploadedFiles.length === 0 || !materialCodeFromFolder">
          开始处理
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import smallNav from "../../components/smallNav/smallNav";
import { getJson } from '@/api/database/dataStretch.js'
import { DataProcessor, FileUploadProcessor, NetworkDataProcessor, showProcessingResults } from '@/utils/dataProcessor.js'

const baseUrl = process.env.NODE_ENV === 'production' ? 'http://www.ai4matter.com' : 'http://localhost:8100';

export default {
  components: { smallNav },

  created() {
    this.getMsg(`${baseUrl}/json/GH1015.json`);
    this.getMenu();
    this.initProcessors();
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
      currentMaterialCode: "GH1015",

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
      tabs: [
        { label: "合金介绍", key: "introduce" },
        { label: "物理、弹性和化学性能", key: "physicalChemistry" },
        { label: "力学性能", key: "mechanical" },
        { label: "工艺性能与要求", key: "craft" },
        { label: "组织结构", key: "microstructures" }
      ],

      tableColumns: [
        { prop: "name", label: "材料牌号", width: "180" },
        { prop: "name", label: "材料类型", width: "180" },
        { prop: "address", label: "材料概述" }
      ],

      filterFields: [
        {
          key: 'type', label: '合金类型:', type: 'select', clearable: true, placeholder: '请选择',
          options: [
            { label: "请选择", value: 0 }, { label: "固溶强化型变形高温合金", value: 1 },
            { label: "等轴晶铸造高温合金", value: 2 }, { label: "定向凝固柱晶高温合金", value: 3 }
          ]
        },
        {
          key: 'component', label: '化学成分:', type: 'select', clearable: true, multiple: true, placeholder: '请选择',
          options: [
            { label: "C", prop: "C" }, { label: "Cr", prop: "Cr" }, { label: "Ni", prop: "Ni" },
            { label: "W", prop: "W" }, { label: "Mo", prop: "Mo" }, { label: "Fe", prop: "Fe" },
            { label: "Nb", prop: "Nb" }, { label: "B", prop: "B" }, { label: "Ce", prop: "Ce" },
            { label: "Mn", prop: "Mn" }, { label: "Si", prop: "Si" }, { label: "P", prop: "P" },
            { label: "S", prop: "S" }, { label: "Cu", prop: "Cu" }, { label: "V", prop: "V" },
            { label: "N", prop: "N" }, { label: "Al", prop: "Al" }, { label: "Ti", prop: "Ti" },
            { label: "Co", prop: "Co" }, { label: "Sn", prop: "Sn" }, { label: "Pb", prop: "Pb" },
            { label: "Zr", prop: "Zr" }, { label: "La", prop: "La" }, { label: "Sb", prop: "Sb" },
            { label: "As", prop: "As" }, { label: "Bi", prop: "Bi" }, { label: "Ta", prop: "Ta" },
            { label: "Se", prop: "Se" }, { label: "Ag", prop: "Ag" }, { label: "Mg", prop: "Mg" },
            { label: "Hf", prop: "Hf" }, { label: "Ga", prop: "Ga" }, { label: "In", prop: "In" },
            { label: "Te", prop: "Te" }, { label: "Tl", prop: "Tl" }, { label: "Zn", prop: "Zn" }, { label: "Cd", prop: "Cd" }
          ]
        },
        {
          key: 'craft', label: '熔炼工艺:', type: 'select', clearable: true, multiple: true, placeholder: '请选择',
          options: [
            { label: "电弧炉", value: 1 }, { label: "电渣重熔", value: 2 }, { label: "真空电弧重熔", value: 3 },
            { label: "非真空感应炉", value: 4 }, { label: "真空感应炉", value: 5 }, { label: "真空双联熔炼", value: 6 },
            { label: "电弧炉+真空自耗重熔", value: 7 }, { label: "电弧炉+电渣重熔", value: 8 },
            { label: "电弧炉+真空电弧重熔", value: 9 }, { label: "非真空感应炉+真空电弧重熔", value: 10 },
            { label: "非真空感应炉+电渣重熔", value: 11 }, { label: "非真空感应炉+真空自耗", value: 12 },
            { label: "真空感应炉+电渣重熔", value: 13 }, { label: "真空感应炉+真空自耗", value: 14 }
          ]
        },
        { key: 'region', label: '合金密度:', type: 'slider' }
      ],

      // 文件夹上传相关
      folderUploadVisible: false,
      uploadedFiles: [],
      materialCodeFromFolder: '',
      isDragOver: false,
    };
  },

  methods: {
    // 搜索相关
    searchFun() {
      if (!this.searchValue) return;
      this.menuData.some(item => item.list.some(self => {
        this.tableList.push(self);
        if (self.name.includes(this.searchValue)) {
          this.defaultActive = self.index;
          this.changeFun(item.name, self);
          return true;
        }
      }));
    },

    searchMoreFun() {
      this.dialogFormVisible = true;
      this.tableData = [];
    },

    onSubmit() {
      const filters = { type: this.form.type, component: this.form.component, craft: this.form.craft, region: this.form.region };
      this.tableData = Object.keys(filters).reduce((arr, key) => this.filterFunc(filters[key], key, arr), this.tableList);
    },

    filterFunc(val, key, arr) {
      const filterMap = {
        type: item => val == 0 || item.index.split("-")[0] == val,
        component: item => val.length == 0 || this.containsArray(item.key_component, val),
        craft: item => val.length == 0 || this.containsArray(item.key_craft, val),
        region: item => Number(val[0]) <= item.key_density && Number(val[1]) >= item.key_density
      };
      return arr.filter(filterMap[key] || (() => true));
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
      [this.form.regionVal1, this.form.regionVal2] = this.form.region;
    },

    // 页面切换
    tabClick() {
      const tabKey = this.tabs[this.activeName]?.key;
      if (tabKey && this.jsonData[tabKey]) {
        this.introduce = this.jsonData[tabKey];
        this.drawFun();
      }
    },

    changeFun(name, data) {
      this.activeName = "0";
      [this.name1, this.name2] = [name, data.name];
      this.currentMaterialCode = data.name;
      this.defaultActive = data.index;
      this.getMsg(`${baseUrl}/json/${data.name}.json`);
    },

    processImageReferences(text) {
      if (!text) return '';
      let processedText = text.replace(/@@/g, "\n");
      const pattern = /(图(\d+)-(\d+))(_[a-z])?/g;
      const matches = [];
      let match;

      while ((match = pattern.exec(text)) !== null) {
        const fullRef = match[1] + (match[4] || '');
        matches.push({
          fullMatch: match[0],
          imgUrl: `${baseUrl}/json/img/${this.currentMaterialCode}/${fullRef}`,
          uniqueId: `img-${this.currentMaterialCode}-${fullRef}`
        });
      }

      if (matches.length > 0) {
        const containerId = `image-container-${Date.now()}`;
        let imageHtml = `<div id="${containerId}" class="material-images-container">`;
        matches.forEach(item => {
          imageHtml += `
            <div class="material-image-item">
              <div class="material-image">
                <img id="${item.uniqueId}" src="${item.imgUrl}.jpg" alt="${item.fullMatch}"
                     onload="this.parentElement.parentElement.style.display='flex';"
                     onerror="if (this.src.indexOf('.jpg') > 0) { this.src='${item.imgUrl}.png'; }
                             else if (this.src.indexOf('.png') > 0) { this.src='${item.imgUrl}.jpeg'; }
                             else { this.parentElement.parentElement.remove(); }" />
              </div>
            </div>`;
        });
        imageHtml += '</div>';
        processedText += imageHtml;
      }
      return processedText;
    },

    preloadMicrostructureImages(microstructures) {
      if (!Array.isArray(microstructures)) return;
      const processItem = (item) => {
        if (item?.con) {
          const pattern = /(图(\d+)-(\d+))(_[a-z])?/g;
          let match;
          while ((match = pattern.exec(item.con)) !== null) {
            const fullRef = match[1] + (match[4] || '');
            ['jpg', 'png', 'jpeg'].forEach(ext => {
              const img = new Image();
              img.onerror = () => img.src = '';
              img.src = `${baseUrl}/json/img/${this.currentMaterialCode}/${fullRef}.${ext}`;
            });
          }
        }
        if (item?.two) item.two.forEach(processItem);
        if (item?.third) item.third.forEach(processItem);
      };
      microstructures.forEach(processItem);
    },

    getMsg(getJsonUrl) {
      getJson(getJsonUrl).then(data => {
        this.jsonData = data;
        this.introduce = data.introduce || [];

        // 预加载图片
        if (data.microstructures) {
          this.preloadMicrostructureImages(data.microstructures);
        }

        // 确保数据结构完整
        this.jsonData = this.dataProcessor?.ensureRenderingCompatibility(this.jsonData) || this.jsonData;

        this.drawFun();
      }).catch(error => {
        console.error('获取数据失败:', error);
        this.$message.error('获取材料数据失败');
      });
    },

    getMenu() {
      getJson(`${baseUrl}/json/menu.json`).then(data => {
        this.menuData = data.menu;
        this.tableList = data.menu.flatMap(item => item.list);
      });
    },

    drawFun() {
      this.$nextTick(() => {
        const processItems = (items) => {
          if (!items || !Array.isArray(items)) return;

          items.forEach(item => {
            // 处理当前级别的图表
            if (item.seriesData && item.echartMsg && item.echartMsg.echartId) {
              const chartElement = document.getElementById("echarts" + item.echartMsg.echartId);
              if (chartElement) {
                // 确保容器已经在DOM中
                setTimeout(() => {
                  const chartObj = this.$echarts.init(chartElement);
                  this.initChart1(chartObj, item.xAxisData, item.seriesData, item.echartMsg);
                }, 100);
              }
            }

            // 处理二级数据
            if (item.two && Array.isArray(item.two)) {
              processItems(item.two);
            }

            // 处理三级数据
            if (item.third && Array.isArray(item.third)) {
              processItems(item.third);
            }
          });
        };

        processItems(this.introduce);
      });
    },

    initChart1(Chart, xAxisData, seriesData, echartMsg) {
      if (!Chart || !seriesData || !Array.isArray(seriesData)) {
        console.warn('图表初始化失败：缺少必要数据');
        return;
      }

      // 验证系列数据的完整性
      const validSeriesData = seriesData.filter(series =>
        series && series.data && Array.isArray(series.data) && series.data.length > 0
      );

      if (validSeriesData.length === 0) {
        console.warn('图表数据为空或格式不正确');
        return;
      }

      const option = {
        color: ['#43b1fd', '#1bddb5', '#fe708d', '#e7e734', '#1fdaeb', '#cf48c9', '#ffb129', '#1b11fe'],
        tooltip: {
          trigger: "axis",
          formatter: function(params) {
            let result = '';
            params.forEach(param => {
              // 确保数据格式正确
              const value = Array.isArray(param.value) ? param.value[1] : param.value;
              const xValue = Array.isArray(param.value) ? param.value[0] : param.axisValue;
              result += `${param.seriesName}: ${value}<br/>`;
              if (params.length === 1) {
                result = `${echartMsg.xName || 'X'}: ${xValue}<br/>${result}`;
              }
            });
            return result;
          }
        },
        grid: { top: "14%", left: "5%", right: "17%", bottom: "8%", containLabel: true },
        legend: {
          top: "5%",
          orient: "horizontal",
          right: 100,
          left: 100,
          icon: "rect",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: { fontSize: 10 },
          data: validSeriesData.map(series => series.name)
        },
        xAxis: [{
          name: echartMsg.xName || '数据点',
          type: "value",
          boundaryGap: false,
          axisLabel: { color: "rgba(0, 0, 0, 1)", fontSize: 14 },
          axisLine: { show: true },
          min: echartMsg.minX !== undefined ? Math.floor(echartMsg.minX) : 'dataMin',
          axisTick: { show: false }
        }],
        yAxis: [{
          type: "value",
          name: echartMsg.yName || '数值',
          nameGap: 10,
          nameTextStyle: { fontSize: 14, color: "#000", padding: [0, 0, 0, 10] },
          min: echartMsg.minY !== undefined ? Math.floor(echartMsg.minY) : 'dataMin',
          axisLabel: { color: "rgba(0, 0, 0, 1)", fontSize: 14 },
          splitLine: { show: false },
          axisLine: { show: true }
        }],
        series: validSeriesData
      };

      try {
        if (Chart) Chart.clear();
        Chart.setOption(option, true);

        // 确保图表正确渲染
        Chart.resize();

        console.log(`图表渲染成功: ${validSeriesData.length}个系列, X轴: ${echartMsg.xName}, Y轴: ${echartMsg.yName}`);
      } catch (error) {
        console.error('图表渲染错误:', error);
      }
    },

    // 数据导入
    async asJson() {
      let loading = null;
      try {
        const folderInfo = await this.selectDataFolder();
        if (!folderInfo) return;

        loading = this.$loading({
          lock: true,
          text: `正在处理文件夹 ${folderInfo.folderName} 中的材料数据...`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        const data = await this.loadSourceDataFromFolder(folderInfo);
        if (!data) return;

        const results = await this.processAllDataSourcesFromFolder(folderInfo, data, loading);
        if (loading) loading.close();

        showProcessingResults(results, this.$message);
        await this.validateAndSave(data, folderInfo.materialCode);
      } catch (error) {
        if (loading) loading.close();
        this.$message.error(`处理失败: ${error.message || '未知错误'}`);
      }
    },

    async selectDataFolder() {
      return new Promise((resolve) => {
        this.$msgbox({
          title: '选择数据文件夹',
          message: `
            <div style="padding: 20px;">
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">文件夹路径:</label>
                <input id="folderPathInput" type="text" placeholder="例如: source/GH1139"
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="source/" />
                <small style="color: #666; margin-top: 4px; display: block;">相对于 ${baseUrl}/json/ 的路径，或完整的URL路径</small>
              </div>
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">材料编号:</label>
                <input id="materialCodeInput" type="text" placeholder="例如: GH1139"
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="GH1139" />
              </div>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0;">期望的文件结构:</h4>
                <div style="font-family: monospace; font-size: 12px; color: #666;">
                  📁 选择的文件夹/<br/>├── 材料编号.json (可选，原始数据)<br/>├── 文本材料编号.json (文本内容)<br/>
                  ├── 表格材料编号.xlsx (表格数据)<br/>└── 材料编号.xlsx (图表数据)
                </div>
              </div>
            </div>
          `,
          dangerouslyUseHTMLString: true,
          showCancelButton: true,
          confirmButtonText: '开始处理',
          cancelButtonText: '取消',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              const folderPath = document.getElementById('folderPathInput')?.value?.trim();
              const materialCode = document.getElementById('materialCodeInput')?.value?.trim();

              if (!folderPath || !materialCode) {
                this.$message.warning('请输入文件夹路径和材料编号');
                return;
              }

              resolve({
                folderPath: folderPath,
                materialCode: materialCode,
                folderName: folderPath.split(/[/\\]/).pop() || folderPath
              });
            } else {
              resolve(null);
            }
            done();
          }
        });
      });
    },

    initProcessors() {
      this.dataProcessor = new DataProcessor(baseUrl);
      this.fileUploadProcessor = new FileUploadProcessor(baseUrl);
      this.networkDataProcessor = new NetworkDataProcessor(baseUrl);
    },

    // 文件夹上传相关方法
    showFolderUpload() {
      this.folderUploadVisible = true;
      this.uploadedFiles = [];
      this.materialCodeFromFolder = '';
      this.isDragOver = false;
    },

    triggerFolderSelect() {
      this.$refs.folderInput.click();
    },

    handleFolderSelect(event) {
      this.processSelectedFiles(Array.from(event.target.files));
    },

    handleFolderDrop(event) {
      event.preventDefault();
      this.isDragOver = false;
      const files = Array.from(event.dataTransfer.items)
        .filter(item => item.kind === 'file')
        .map(item => item.getAsFile())
        .filter(Boolean);
      this.processSelectedFiles(files);
    },

    processSelectedFiles(files) {
      const result = this.fileUploadProcessor.processSelectedFiles(files);
      if (!result.success) {
        this.$message.warning(result.message);
        return;
      }
      this.uploadedFiles = result.files;
      this.materialCodeFromFolder = result.materialCode || '';
      this.$message.success(result.message);
    },

    getFileIcon(filename) {
      const iconMap = { 'json': 'el-icon-document', 'xlsx': 'el-icon-s-grid', 'xls': 'el-icon-s-grid' };
      const ext = filename.toLowerCase().split('.').pop();
      return iconMap[ext] || 'el-icon-document';
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    },

    async validateAndSave(data, materialCode, isFromUpload = false) {
      // 确保数据结构完整性
      data = this.dataProcessor.ensureRenderingCompatibility(data);

      const validationResult = this.dataProcessor.validateJsonStructure(data);
      if (!validationResult.isValid) {
        this.$message.warning(`JSON结构验证发现 ${validationResult.errors.length} 个问题，已自动修复`);
        console.warn('验证错误:', validationResult.errors);
      }

      const renderingValidation = this.dataProcessor.validateMergedDataStructure(data);
      if (!renderingValidation.isValid) {
        this.$message.error('数据结构不兼容页面渲染，正在尝试修复...');
        data = this.dataProcessor.ensureRenderingCompatibility(data);
        this.$message.success('数据结构已修复，现在兼容页面渲染');
      }

      const hasContent = this.dataProcessor.checkJsonHasContent(data);
      if (!hasContent) {
        this.$message.warning('生成的JSON文件中内容较少，可能是因为部分源数据文件缺失。');
      } else {
        this.$message.success('数据合并完成，包含完整的内容');
      }

      // 获取现有menu数据并传递给保存方法
      const existingMenu = isFromUpload ?
        this.fileUploadProcessor.existingMenu :
        this.networkDataProcessor.existingMenu;

      if (isFromUpload) {
        await this.handleUploadedDataSave(data, materialCode, existingMenu);
      } else {
        await this.handleNetworkDataSave(data, materialCode, existingMenu);
      }
    },

    async loadSourceDataFromFolder(folderInfo) {
      try {
        const originalJsonUrl = this.buildFileUrl(folderInfo.folderPath, `${folderInfo.materialCode}.json`);
        const data = await getJson(originalJsonUrl);

        if (!data) throw new Error('原始JSON数据为空');

        const isValidStructure = this.dataProcessor.validateJsonStructure(data);
        if (isValidStructure.isValid) {
          this.$message.success('找到原始JSON文件，将在其基础上更新数据 (四类数据模式)');
          return data;
        } else {
          throw new Error('原始JSON结构不完整');
        }
      } catch (error) {
        this.$message.info('未找到原始JSON文件，将从其他数据文件创建新的完整文件 (三类数据模式)');
        return this.dataProcessor.createBaseJsonStructure();
      }
    },

    // 添加缺失的buildFileUrl方法
    buildFileUrl(folderPath, filename) {
      return this.dataProcessor.buildFileUrl(folderPath, filename);
    },

    async processUploadedFolder() {
      if (!this.materialCodeFromFolder) {
        this.$message.warning('请输入材料编号');
        return;
      }

      this.folderUploadVisible = false;
      this.fileUploadProcessor.materialCode = this.materialCodeFromFolder;

      const loading = this.$loading({
        lock: true,
        text: '正在分析上传的材料数据文件...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      try {
        const hasOriginalJson = this.uploadedFiles.some(file => file.name === `${this.materialCodeFromFolder}.json`);
        loading.text = hasOriginalJson ? '检测到原始JSON文件，正在处理四类数据...' : '正在处理三类数据文件...';

        const sourceResult = await this.fileUploadProcessor.loadSourceDataFromUploadedFiles();
        this.$message.info(sourceResult.message);

        const results = await this.fileUploadProcessor.processAllUploadedFiles(sourceResult.data, this.materialCodeFromFolder);
        showProcessingResults(results, this.$message);

        await this.validateAndSave(sourceResult.data, this.materialCodeFromFolder, true);
      } catch (error) {
        this.$message.error(`处理失败: ${error.message || '未知错误'}`);
      } finally {
        loading.close();
      }
    },

    async processAllDataSourcesFromFolder(folderInfo, data, loading) {
      const isEmptyStructure = this.dataProcessor.isEmptyJsonStructure(data);
      const dataMode = isEmptyStructure ? '三类数据' : '四类数据';
      loading.text = `正在合并处理${dataMode}文件...`;
      return await this.networkDataProcessor.processAllNetworkFiles(folderInfo, data);
    },

    async handleUploadedDataSave(data, materialCode, existingMenu = null) {
      return new Promise((resolve) => {
        const menuStatus = existingMenu ? '基于现有menu文件更新' : '创建新的menu文件';
        this.$msgbox({
          title: '保存数据',
          message: `请选择保存方式：<br/>1. 下载JSON文件<br/>2. 下载完整数据包（包含menu配置 - ${menuStatus}）`,
          dangerouslyUseHTMLString: true,
          showCancelButton: true,
          confirmButtonText: '下载数据包',
          cancelButtonText: '仅下载JSON',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              // 传递现有menu给创建方法
              this.createAndDownloadFolderWithMenu(data, materialCode, existingMenu);
            } else if (action === 'cancel') {
              this.dataProcessor.saveJsonToFile(data, `${materialCode}.json`);
            }
            done();
            resolve();
          }
        });
      });
    },

    async createAndDownloadFolderWithMenu(data, materialCode, existingMenu) {
      try {
        // 确保数据结构完整性
        data = this.dataProcessor.ensureRenderingCompatibility(data);

        const validationResult = this.dataProcessor.validateMergedDataStructure(data);
        if (!validationResult.isValid) {
          console.warn('数据结构验证失败:', validationResult.errors);
          data = this.dataProcessor.ensureRenderingCompatibility(data);
        }

        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        const folderName = `${materialCode}_merged`;
        const folder = zip.folder(folderName);

        // 添加合并后的完整JSON文件
        folder.file(`${materialCode}.json`, JSON.stringify(data, null, 4));

        // 生成并添加menu.json文件（基于现有menu或创建新的）
        const menuData = this.dataProcessor.generateMenuFile(materialCode, data, existingMenu);
        folder.file('menu.json', JSON.stringify(menuData, null, 4));

        // 添加README说明文件
        const readme = this.generateReadmeContent(materialCode, data, existingMenu);
        folder.file('README.md', readme);

        const zipContent = await zip.generateAsync({ type: 'blob' });
        this.dataProcessor.downloadBlob(zipContent, `${folderName}.zip`);

        const menuStatus = existingMenu ? '已更新现有menu文件' : '已创建新menu文件';
        this.$message.success(`数据包下载完成！${menuStatus}`);
        return true;
      } catch (error) {
        console.error('创建文件夹压缩包失败:', error);
        this.$message.error('创建数据包失败');
        return false;
      }
    },

    generateReadmeContent(materialCode, data, existingMenu) {
      const stats = this.generateDataStatistics(data);
      const menuStatus = existingMenu ? '基于现有menu文件更新' : '新创建menu文件';

      return `# ${materialCode} 材料数据包

## 文件说明
- \`${materialCode}.json\` - 完整的材料数据文件
- \`menu.json\` - 系统菜单配置文件（${menuStatus}）
- \`README.md\` - 本说明文件

## 数据统计
- 数据部分: ${stats.sections}/5
- 总条目数: ${stats.totalItems}
- 文本条目: ${stats.textItems}
- 表格条目: ${stats.tableItems}
- 图表条目: ${stats.chartItems}

## 使用说明
1. 将 \`${materialCode}.json\` 放置到系统的 \`json\` 目录下
2. 将 \`menu.json\` 与现有菜单文件合并或替换
3. 重启系统以加载新的材料数据

生成时间: ${new Date().toLocaleString()}
`;
    },

    generateDataStatistics(data) {
      const stats = { sections: 0, totalItems: 0, textItems: 0, tableItems: 0, chartItems: 0 };
      const requiredSections = ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'];

      const countInItems = (items) => {
        if (!Array.isArray(items)) return;

        items.forEach(item => {
          stats.totalItems++;
          if (item.con) stats.textItems++;
          if (item.tableData && item.tableColumns) stats.tableItems++;
          if (item.seriesData && item.echartMsg) stats.chartItems++;

          // 处理嵌套结构
          if (item.two) countInItems(item.two);
          if (item.third) countInItems(item.third);
        });
      };

      requiredSections.forEach(section => {
        if (data[section] && Array.isArray(data[section]) && data[section].length > 0) {
          stats.sections++;
          countInItems(data[section]);
        }
      });

      return stats;
    },

    async handleNetworkDataSave(data, materialCode, existingMenu = null) {
      return this.handleUploadedDataSave(data, materialCode, existingMenu);
    }
  }
};
</script>

<style>
.el-form-item__content { display: flex; }
.el-form .el-select .el-input__inner { width: 300px; }
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

.density-control {
  display: flex;
  align-items: center;
  gap: 5px;
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

.folder-upload-container {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  text-align: center;
  padding: 40px 20px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.upload-tip {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}

.file-list {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.file-item i {
  margin-right: 8px;
  color: #409EFF;
}

.file-name {
  flex: 1;
  color: #333;
}

.file-size {
  color: #999;
  font-size: 12px;
}

.material-code-input {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.material-code-input label {
  font-weight: bold;
  color: #333;
}
</style>
