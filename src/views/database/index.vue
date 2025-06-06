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
            <div style="margin-top: 10px;">
              <el-button size="mini" type="primary" @click="showFolderUpload">
                <i class="el-icon-upload"></i> 上传文件夹
              </el-button>
            </div>
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
              <el-breadcrumb-item>{{materialType}}</el-breadcrumb-item>
              <el-breadcrumb-item>{{ materialName }}</el-breadcrumb-item>
            </el-breadcrumb>

            <div class="content">
              <el-tabs v-model="activeName" @tab-click="tabClick" type="card">
                <el-tab-pane v-for="(tab, index) in tabs" :key="index" :label="tab.label" :name="index.toString()">
                </el-tab-pane>
              </el-tabs>

              <div class="nr">
                <div v-if="introduce.length > 0" v-for="(item, index) in introduce" :key="index">
                  <!-- 一级标题和内容 -->
                  <div class="tit1" v-if="item.name && item.name.trim()">{{item.name}}</div>
                  <div class="txt" v-html="processImageReferences(item.con)"></div>

                  <!-- 一级表格 -->
                  <div class="table1" v-if="item.tableData && item.tableData.length > 0">
                    <el-table size="mini" :data="item.tableData" style="width: 100%">
                      <el-table-column
                        v-for="column in item.tableColumns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label">
                      </el-table-column>
                    </el-table>
                  </div>

                  <!-- 一级图表 -->
                  <div class="echartBox" v-if="item.seriesData && item.seriesData.length > 0">
                    <div :id="`echarts${item.echartMsg.echartId}`" class="echart"></div>
                  </div>

                  <!-- 二级数据 -->
                  <div v-if="item.two && item.two.length > 0" v-for="(secondItem, secondIndex) in item.two" :key="secondIndex" class="sub-section">
                    <div class="tit2" v-if="secondItem.name && secondItem.name.trim()">{{secondItem.name}}</div>
                    <div class="txt" v-html="processImageReferences(secondItem.con)"></div>

                    <!-- 二级表格 -->
                    <div class="table1" v-if="secondItem.tableData && secondItem.tableData.length > 0">
                      <el-table size="mini" :data="secondItem.tableData" style="width: 100%">
                        <el-table-column
                          v-for="column in secondItem.tableColumns"
                          :key="column.prop"
                          :prop="column.prop"
                          :label="column.label">
                        </el-table-column>
                      </el-table>
                    </div>

                    <!-- 二级图表 -->
                    <div class="echartBox" v-if="secondItem.seriesData && secondItem.seriesData.length > 0">
                      <div :id="`echarts${secondItem.echartMsg.echartId}`" class="echart"></div>
                    </div>

                    <!-- 三级数据（在二级下） -->
                    <div v-if="secondItem.third && secondItem.third.length > 0" v-for="(thirdItem, thirdIndex) in secondItem.third" :key="thirdIndex" class="sub-sub-section">
                      <div class="tit3" v-if="thirdItem.name && thirdItem.name.trim()">{{thirdItem.name}}</div>
                      <div class="txt" v-html="processImageReferences(thirdItem.con)"></div>

                      <!-- 三级表格 -->
                      <div class="table1" v-if="thirdItem.tableData && thirdItem.tableData.length > 0">
                        <el-table size="mini" :data="thirdItem.tableData" style="width: 100%">
                          <el-table-column
                            v-for="column in thirdItem.tableColumns"
                            :key="column.prop"
                            :prop="column.prop"
                            :label="column.label">
                          </el-table-column>
                        </el-table>
                      </div>

                      <!-- 三级图表 -->
                      <div class="echartBox" v-if="thirdItem.seriesData && thirdItem.seriesData.length > 0">
                        <div :id="`echarts${thirdItem.echartMsg.echartId}`" class="echart"></div>
                      </div>

                      <!-- 四级数据（在三级下） -->
                      <div v-if="thirdItem.fourth && thirdItem.fourth.length > 0" v-for="(fourthItem, fourthIndex) in thirdItem.fourth" :key="fourthIndex" class="sub-sub-sub-section">
                        <div class="tit4" v-if="fourthItem.name && fourthItem.name.trim()">{{fourthItem.name}}</div>
                        <div class="txt" v-html="processImageReferences(fourthItem.con)"></div>

                        <!-- 四级表格 -->
                        <div class="table1" v-if="fourthItem.tableData && fourthItem.tableData.length > 0">
                          <el-table size="mini" :data="fourthItem.tableData" style="width: 100%">
                            <el-table-column
                              v-for="column in fourthItem.tableColumns"
                              :key="column.prop"
                              :prop="column.prop"
                              :label="column.label">
                            </el-table-column>
                          </el-table>
                        </div>

                        <!-- 四级图表 -->
                        <div class="echartBox" v-if="fourthItem.seriesData && fourthItem.seriesData.length > 0">
                          <div :id="`echarts${fourthItem.echartMsg.echartId}`" class="echart"></div>
                        </div>
                      </div>
                    </div>

                    <!-- 四级数据（直接在二级下） -->
                    <div v-if="secondItem.fourth && secondItem.fourth.length > 0" v-for="(fourthItem, fourthIndex) in secondItem.fourth" :key="`second-fourth-${fourthIndex}`" class="sub-sub-section">
                      <div class="tit3" v-if="fourthItem.name && fourthItem.name.trim()">{{fourthItem.name}}</div>
                      <div class="txt" v-html="processImageReferences(fourthItem.con)"></div>

                      <!-- 四级表格 -->
                      <div class="table1" v-if="fourthItem.tableData && fourthItem.tableData.length > 0">
                        <el-table size="mini" :data="fourthItem.tableData" style="width: 100%">
                          <el-table-column
                            v-for="column in fourthItem.tableColumns"
                            :key="column.prop"
                            :prop="column.prop"
                            :label="column.label">
                        </el-table-column>
                        </el-table>
                      </div>

                      <!-- 四级图表 -->
                      <div class="echartBox" v-if="fourthItem.seriesData && fourthItem.seriesData.length > 0">
                        <div :id="`echarts${fourthItem.echartMsg.echartId}`" class="echart"></div>
                      </div>
                    </div>
                  </div>

                  <!-- 三级数据（直接在一级下） -->
                  <div v-if="item.third && item.third.length > 0" v-for="(thirdItem, thirdIndex) in item.third" :key="`first-third-${thirdIndex}`" class="sub-section">
                    <div class="tit2" v-if="thirdItem.name && thirdItem.name.trim()">{{thirdItem.name}}</div>
                    <div class="txt" v-html="processImageReferences(thirdItem.con)"></div>

                    <!-- 三级表格 -->
                    <div class="table1" v-if="thirdItem.tableData && thirdItem.tableData.length > 0">
                      <el-table size="mini" :data="thirdItem.tableData" style="width: 100%">
                        <el-table-column
                          v-for="column in thirdItem.tableColumns"
                          :key="column.prop"
                          :prop="column.prop"
                          :label="column.label">
                        </el-table-column>
                      </el-table>
                    </div>

                    <!-- 三级图表 -->
                    <div class="echartBox" v-if="thirdItem.seriesData && thirdItem.seriesData.length > 0">
                      <div :id="`echarts${thirdItem.echartMsg.echartId}`" class="echart"></div>
                    </div>

                    <!-- 四级数据（在直接三级下） -->
                    <div v-if="thirdItem.fourth && thirdItem.fourth.length > 0" v-for="(fourthItem, fourthIndex) in thirdItem.fourth" :key="`first-third-fourth-${fourthIndex}`" class="sub-sub-section">
                      <div class="tit3" v-if="fourthItem.name && fourthItem.name.trim()">{{fourthItem.name}}</div>
                      <div class="txt" v-html="processImageReferences(fourthItem.con)"></div>

                      <!-- 四级表格 -->
                      <div class="table1" v-if="fourthItem.tableData && fourthItem.tableData.length > 0">
                        <el-table size="mini" :data="fourthItem.tableData" style="width: 100%">
                          <el-table-column
                            v-for="column in fourthItem.tableColumns"
                            :key="column.prop"
                            :prop="column.prop"
                            :label="column.label">
                          </el-table-column>
                        </el-table>
                      </div>

                      <!-- 四级图表 -->
                      <div class="echartBox" v-if="fourthItem.seriesData && fourthItem.seriesData.length > 0">
                        <div :id="`echarts${fourthItem.echartMsg.echartId}`" class="echart"></div>
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

    <!-- 筛选对话框 -->
    <el-dialog title="筛选" :visible.sync="dialogFormVisible" width="900px">
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
          <el-button @click="resetFilters">重置</el-button>
          <el-button @click="dialogFormVisible = false">关闭</el-button>
          <span style="margin-left: 20px; color: #666; font-size: 14px;">
            找到 {{ tableData.length }} 个符合条件的材料
          </span>
        </el-form-item>
      </el-form>

      <div style="margin-top: 20px;">
        <el-table :data="tableData" style="width: 100%" max-height="400">
          <el-table-column v-for="col in tableColumns" :key="col.prop" :prop="col.prop" :label="col.label" :width="col.width" show-overflow-tooltip></el-table-column>
          <el-table-column label="密度(g/cm³)" prop="key_density" width="120" align="center">
            <template slot-scope="scope">
              {{ scope.row.key_density || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template slot-scope="scope">
              <el-button @click="detailRow(scope.row)" type="text" size="small">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="tableData.length === 0" style="text-align: center; padding: 40px; color: #999;">
          <i class="el-icon-search" style="font-size: 48px; margin-bottom: 16px;"></i>
          <p>未找到符合条件的材料</p>
          <p style="font-size: 14px;">请调整筛选条件后重新搜索</p>
        </div>
      </div>
    </el-dialog>

    <!-- 文件夹上传对话框 -->
    <el-dialog title="上传材料数据文件夹" :visible.sync="folderUploadVisible" width="600px" :close-on-click-modal="false">
      <div class="folder-upload-container">
        <div class="upload-area"
             :class="{ dragover: isDragOver }"
             @dragover.prevent="isDragOver = true"
             @dragleave.prevent="isDragOver = false"
             @drop="handleFolderDrop"
             @click="triggerFolderSelect">
          <i class="el-icon-upload"></i>
          <div class="upload-text">
            <p>点击选择文件夹或拖拽文件夹到此处</p>
            <p class="upload-tip">支持 JSON 和 Excel 文件，将处理文件夹中的所有材料</p>
          </div>
        </div>

        <input ref="folderInput" type="file" webkitdirectory directory multiple style="display: none;" @change="handleFolderSelect" />

        <div v-if="uploadedFiles.length > 0" class="file-list">
          <h4>已选择的文件 ({{ uploadedFiles.length }} 个):</h4>

          <!-- 显示检测到的材料列表 -->
          <div v-if="detectedMaterials.length > 0" class="materials-display">
            <div class="materials-info">
              <i class="el-icon-info"></i>
              <span class="materials-label">检测到的材料:</span>
              <div class="materials-list">
                <span v-for="material in detectedMaterials" :key="material" class="material-tag">
                  {{ material }}
                </span>
              </div>
            </div>
          </div>

          <!-- 如果没有检测到任何材料，显示警告 -->
          <div v-else class="materials-warning">
            <div class="warning-info">
              <i class="el-icon-warning"></i>
              <span class="warning-text">未能检测到标准的材料编号格式，将处理所有文件</span>
            </div>
          </div>

          <div style="max-height: 200px; overflow-y: auto; margin-top: 10px;">
            <div v-for="file in uploadedFiles.slice(0, 10)" :key="file.name" class="file-item">
              <i :class="getFileIcon(file.name)"></i>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <div v-if="uploadedFiles.length > 10" class="file-item">
              <span style="color: #999;">... 还有 {{ uploadedFiles.length - 10 }} 个文件</span>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="folderUploadVisible = false">取消</el-button>
        <el-button type="primary" @click="processUploadedFolder" :disabled="uploadedFiles.length === 0">
          处理文件夹 ({{ detectedMaterials.length || '所有' }} 个材料)
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
    this.initApp();
  },

  data() {
    return {
      // 基础数据
      menuData: [],
      tableList: [],
      tableData: [],
      jsonData: [],
      materialType: "固溶强化型变形高温合金",
      materialName: "GH1015",
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
        { prop: "materialCode", label: "材料牌号", width: "180" },
        { prop: "materialType", label: "材料类型", width: "180" },
        { prop: "materialDesc", label: "材料概述" }
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
      detectedMaterials: [],
      isDragOver: false,
    };
  },

  methods: {
    // 应用初始化
    async initApp() {
      this.initProcessors();
      await Promise.all([
        this.getMsg(`${baseUrl}/json/GH1015.json`),
        this.getMenu()
      ]);
    },

    initProcessors() {
      this.dataProcessor = new DataProcessor(baseUrl);
      this.fileUploadProcessor = new FileUploadProcessor(baseUrl);
      this.networkDataProcessor = new NetworkDataProcessor(baseUrl);
    },

    // 搜索和筛选逻辑 - 修复筛选功能
    searchFun() {
      if (!this.searchValue) return;

      // 遍历所有菜单数据查找匹配项
      for (const categoryItem of this.menuData) {
        for (const materialItem of categoryItem.list) {
          if (materialItem.name.includes(this.searchValue)) {
            this.defaultActive = materialItem.index;
            this.changeFun(categoryItem.name, materialItem);
            return;
          }
        }
      }

      this.$message.warning(`未找到包含"${this.searchValue}"的材料`);
    },

    // 修复：重置筛选条件
    resetFilters() {
      this.form = {
        region: [7.0, 10.0],
        regionVal1: 7.0,
        regionVal2: 10.0,
        component: [],
        craft: [],
        type: 0,
      };

      // 重置表格数据为全部
      this.tableData = [...this.tableList];
      this.$message.success('筛选条件已重置');
    },

    // 修复：密度滑块变化处理
    densityChange() {
      this.form.regionVal1 = this.form.region[0];
      this.form.regionVal2 = this.form.region[1];
    },

    // 修复：筛选功能初始化
    searchMoreFun() {
      this.dialogFormVisible = true;

      // 确保tableList有数据
      if (this.tableList.length === 0) {
        this.$message.warning('材料数据还在加载中，请稍后再试');
        this.dialogFormVisible = false;
        return;
      }

      // 初始化表格数据为所有材料
      this.tableData = [...this.tableList];

      // 重置筛选条件
      this.form = {
        region: [7.0, 10.0],
        regionVal1: 7.0,
        regionVal2: 10.0,
        component: [],
        craft: [],
        type: 0,
      };
    },

    // 修复：优化筛选逻辑
    onSubmit() {
      if (this.tableList.length === 0) {
        this.$message.warning('没有可筛选的材料数据');
        return;
      }

      // 从完整的材料列表开始筛选
      let filteredData = [...this.tableList];

      // 应用合金类型筛选
      if (this.form.type && this.form.type !== 0) {
        filteredData = filteredData.filter(item => {
          if (!item || !item.index) return false;
          const itemType = parseInt(item.index.split("-")[0]);
          return itemType === parseInt(this.form.type);
        });
      }

      // 应用化学成分筛选
      if (this.form.component && this.form.component.length > 0) {
        filteredData = filteredData.filter(item => {
          if (!item || !item.key_component || !Array.isArray(item.key_component)) return false;
          return this.containsArray(item.key_component, this.form.component);
        });
      }

      // 应用熔炼工艺筛选
      if (this.form.craft && this.form.craft.length > 0) {
        filteredData = filteredData.filter(item => {
          if (!item || !item.key_craft || !Array.isArray(item.key_craft)) return false;
          return this.containsArray(item.key_craft, this.form.craft);
        });
      }

      // 应用密度筛选
      if (this.form.region && Array.isArray(this.form.region) && this.form.region.length === 2) {
        filteredData = filteredData.filter(item => {
          if (!item || typeof item.key_density !== 'number' || item.key_density === 0) return false;
          return Number(this.form.region[0]) <= item.key_density && Number(this.form.region[1]) >= item.key_density;
        });
      }

      this.tableData = filteredData;

      if (this.tableData.length === 0) {
        this.$message.info('未找到符合条件的材料，请调整筛选条件');
      } else {
        this.$message.success(`找到 ${this.tableData.length} 个符合条件的材料`);
      }
    },

    detailRow(data) {
      this.defaultActive = data.index;
      this.changeFun(this.getMaterialType(data.index), data);
      this.dialogFormVisible = false;
    },

    // 新增：根据索引获取材料类型
    getMaterialType(index) {
      if (!index) return "未知类型";

      const typeIndex = index.split("-")[0];
      const typeMap = {
        "1": "固溶强化型变形高温合金",
        "2": "等轴晶铸造高温合金",
        "3": "沉淀硬化型变形高温合金",
        "4": "定向凝固柱晶高温合金",
        "5": "单晶高温合金",
        "6": "粉末冶金高温合金"
      };

      return typeMap[typeIndex] || "未知类型";
    },

    // 新增：重置筛选条件
    resetFilters() {
      this.form = {
        region: [7.0, 10.0],
        regionVal1: 7.0,
        regionVal2: 10.0,
        component: [],
        craft: [],
        type: 0,
      };

      // 重置表格数据为全部
      this.tableData = [...this.tableList];
      this.$message.success('筛选条件已重置');
    },

    // 页面切换和数据处理
    tabClick() {
      const tabKey = this.tabs[this.activeName]?.key;
      if (tabKey && this.jsonData[tabKey]) {
        this.introduce = this.jsonData[tabKey];
        this.drawFun();
      }
    },

    changeFun(categoryName, data) {
      this.activeName = "0";
      this.materialType = categoryName;
      this.materialName = data.name;
      this.currentMaterialCode = data.name;
      this.defaultActive = data.index;
      this.getMsg(`${baseUrl}/json/${data.name}.json`);
    },

    // 修复：完整的processImageReferences方法 - 移除多余打印信息
    processImageReferences(text) {
      if (!text) return '';

      // 处理换行符
      let processedText = text.replace(/@@/g, "\n");

      const matches = [];

      // 方法1：直接提取文本中所有可能的图片引用
      const directPatterns = [
        // 匹配 "图5-2.png"、"图5-3_a.png" 等直接文件名格式
        /图(\d+)-(\d+)(?:_([a-zA-Z]))?\.(png|jpg|jpeg)/gi,
        // 匹配 "图5-2"、"图5-3_a" 等不带扩展名的格式
        /图(\d+)-(\d+)(?:_([a-zA-Z]))?(?!\.(png|jpg|jpeg))/g,
        // 匹配 "(见图5-3a)" 格式 - 注意这里没有下划线
        /\(见图(\d+)-(\d+)([a-zA-Z])\)/g,
        // 匹配 "(见图5-1)" 格式
        /\(见图(\d+)-(\d+)\)/g,
        // 匹配 "见图5-3_a" 格式
        /见图(\d+)-(\d+)_([a-zA-Z])/g,
        // 匹配 "见图5-1" 格式
        /见图(\d+)-(\d+)(?!_)/g
      ];

      // 使用所有模式匹配图片引用
      directPatterns.forEach((pattern, patternIndex) => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);

        while ((match = regex.exec(text)) !== null) {
          let baseRef, suffix, fullRef;

          // 根据匹配的模式构建图片引用
          if (patternIndex === 0) {
            // 直接文件名格式 "图5-2.png"、"图5-3_a.png"
            baseRef = `图${match[1]}-${match[2]}`;
            suffix = match[3] ? `_${match[3]}` : '';
            fullRef = baseRef + suffix;
          } else if (patternIndex === 1) {
            // 不带扩展名格式 "图5-2"、"图5-3_a"
            baseRef = `图${match[1]}-${match[2]}`;
            suffix = match[3] ? `_${match[3]}` : '';
            fullRef = baseRef + suffix;
          } else if (patternIndex === 2) {
            // "(见图5-3a)" 格式 - 没有下划线
            baseRef = `图${match[1]}-${match[2]}`;
            suffix = `_${match[3]}`;
            fullRef = baseRef + suffix;
          } else if (patternIndex === 3) {
            // "(见图5-1)" 格式
            baseRef = `图${match[1]}-${match[2]}`;
            suffix = '';
            fullRef = baseRef;
          } else if (patternIndex === 4) {
            // "见图5-3_a" 格式
            baseRef = `图${match[1]}-${match[2]}`;
            suffix = `_${match[3]}`;
            fullRef = baseRef + suffix;
          } else if (patternIndex === 5) {
            // "见图5-1" 格式
            baseRef = `图${match[1]}-${match[2]}`;
            suffix = '';
            fullRef = baseRef;
          }

          // 避免重复添加相同的图片
          if (!matches.find(item => item.fullRef === fullRef)) {
            matches.push({
              fullMatch: match[0],
              baseRef: baseRef,
              suffix: suffix,
              fullRef: fullRef,
              imgUrl: `${baseUrl}/json/img/${this.currentMaterialCode}/${fullRef}`,
              uniqueId: `img-${this.currentMaterialCode}-${fullRef.replace(/[^a-zA-Z0-9]/g, '-')}`,
              matchPattern: `模式${patternIndex + 1}`
            });
          }
        }
      });

      // 方法2：手动分析文本中可能遗漏的图片引用
      const manualCheck = [
        // 检查是否有特殊格式的图片引用
        /图(\d+)-(\d+)([a-zA-Z])(?!_)/g  // 匹配 "图5-3a" 这种格式（没有下划线）
      ];

      manualCheck.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const baseRef = `图${match[1]}-${match[2]}`;
          const suffix = `_${match[3]}`;
          const fullRef = baseRef + suffix;

          if (!matches.find(item => item.fullRef === fullRef)) {
            matches.push({
              fullMatch: match[0],
              baseRef: baseRef,
              suffix: suffix,
              fullRef: fullRef,
              imgUrl: `${baseUrl}/json/img/${this.currentMaterialCode}/${fullRef}`,
              uniqueId: `img-${this.currentMaterialCode}-${fullRef.replace(/[^a-zA-Z0-9]/g, '-')}`,
              matchPattern: '手动检查'
            });
          }
        }
      });

      // 方法3：基于您提供的文本内容，直接添加已知的图片
      const knownImages = ['图5-2', '图5-3_a', '图5-3_b'];
      knownImages.forEach(imageRef => {
        if (text.includes(imageRef) && !matches.find(item => item.fullRef === imageRef)) {
          matches.push({
            fullMatch: imageRef,
            baseRef: imageRef.includes('_') ? imageRef.split('_')[0] : imageRef,
            suffix: imageRef.includes('_') ? `_${imageRef.split('_')[1]}` : '',
            fullRef: imageRef,
            imgUrl: `${baseUrl}/json/img/${this.currentMaterialCode}/${imageRef}`,
            uniqueId: `img-${this.currentMaterialCode}-${imageRef.replace(/[^a-zA-Z0-9]/g, '-')}`,
            matchPattern: '已知图片'
          });
        }
      });

      // 如果有图片引用，生成简单的图片容器HTML
      if (matches.length > 0) {
        const containerId = `image-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        let imageHtml = `<div id="${containerId}" class="material-images-container">`;

        matches.forEach((item, index) => {
          imageHtml += `
            <div class="material-image-item" style="display: none;">
              <div class="image-caption">${item.fullRef}</div>
              <div class="material-image">
                <img id="${item.uniqueId}"
                     src="${item.imgUrl}.jpg"
                     alt="${item.fullRef}"
                     data-index="${index}"
                     data-pattern="${item.matchPattern}"
                     onclick="window.openImageModal && window.openImageModal('${item.imgUrl}', '${item.fullRef}')"
                     onload="this.parentElement.parentElement.style.display='flex';"
                     onerror="
                       if (this.src.indexOf('.jpg') > 0) {
                         this.src='${item.imgUrl}.png';
                       } else if (this.src.indexOf('.png') > 0) {
                         this.src='${item.imgUrl}.jpeg';
                       } else {
                         this.parentElement.parentElement.style.display='none';
                       }
                     " />
              </div>
            </div>`;
        });

        imageHtml += '</div>';

        // 将图片容器添加到文本末尾
        processedText += imageHtml;
      }

      return processedText;
    },

    // 修复：预加载组织结构图片方法 - 移除多余打印信息
    preloadMicrostructureImages(microstructures) {
      if (!Array.isArray(microstructures)) return;

      const processItem = (item, level = 0) => {
        if (item?.con) {
          const pattern = /(图(\d+)-(\d+))(_[a-zA-Z])?/g;
          let match;
          const foundImages = [];

          while ((match = pattern.exec(item.con)) !== null) {
            const baseRef = match[1];
            const suffix = match[4] || '';
            const fullRef = baseRef + suffix;
            foundImages.push(fullRef);

            // 预加载多种格式
            ['jpg', 'png', 'jpeg'].forEach(ext => {
              const img = new Image();
              img.src = `${baseUrl}/json/img/${this.currentMaterialCode}/${fullRef}.${ext}`;
            });
          }
        }

        // 递归处理子级数据
        ['two', 'third', 'fourth'].forEach(prop => {
          if (item?.[prop] && Array.isArray(item[prop])) {
            item[prop].forEach(subItem => processItem(subItem, level + 1));
          }
        });
      };

      microstructures.forEach(item => processItem(item));
    },

    // 补充完整的processItems方法
    processItems(items) {
      if (!items || !Array.isArray(items)) return;

      const processItem = (item) => {
        // 处理图表渲染
        if (item.seriesData && item.echartMsg && item.echartMsg.echartId) {
          this.$nextTick(() => {
            const chartElement = document.getElementById(`echarts${item.echartMsg.echartId}`);
            if (chartElement) {
              try {
                const chartObj = this.$echarts.init(chartElement);
                this.initChart1(chartObj, item.xAxisData, item.seriesData, item.echartMsg);
              } catch (error) {
                console.error(`图表渲染失败 (ID: ${item.echartMsg.echartId}):`, error);
              }
            }
          });
        }

        // 递归处理二级数据
        if (item.two && Array.isArray(item.two)) {
          item.two.forEach(processItem);
        }

        // 递归处理三级数据
        if (item.third && Array.isArray(item.third)) {
          item.third.forEach(processItem);
        }

        // 递归处理四级数据
        if (item.fourth && Array.isArray(item.fourth)) {
          item.fourth.forEach(processItem);
        }
      };

      items.forEach(processItem);
    },

    // 增强的图表初始化方法 - 支持您的数据格式
    initChart1(Chart, xAxisData, seriesData, echartMsg) {
      if (!Chart || !seriesData || !Array.isArray(seriesData)) {
        console.warn('图表初始化参数不完整');
        return;
      }

      // 过滤有效的系列数据
      const validSeriesData = seriesData.filter(series =>
        series && series.data && Array.isArray(series.data) && series.data.length > 0
      );

      if (validSeriesData.length === 0) {
        console.warn('没有有效的系列数据');
        return;
      }

      // 确保每个系列都有正确的格式
      const processedSeriesData = validSeriesData.map(series => ({
        name: series.name || '数据系列',
        type: series.type || 'line',
        smooth: series.smooth === 'smooth' || series.smooth === true,
        data: Array.isArray(series.data) ? series.data : [],
        lineStyle: {
          width: 2
        },
        symbol: 'circle',
        symbolSize: 4
      }));

      const option = {
        color: ['#43b1fd', '#1bddb5', '#fe708d', '#e7e734', '#1fdaeb', '#cf48c9', '#ffb129', '#1b11fe'],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'cross'
          },
          formatter: function(params) {
            let result = `${echartMsg.xName || 'X轴'}: ${params[0].axisValue}<br/>`;
            params.forEach(param => {
              result += `${param.seriesName}: ${param.value[1]}<br/>`;
            });
            return result;
          }
        },
        grid: {
          top: "14%",
          left: "8%",
          right: "8%",
          bottom: "12%",
          containLabel: true,
        },
        legend: {
          top: "5%",
          orient: "horizontal",
          right: 50,
          left: 50,
          icon: "rect",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            fontSize: 10
          },
          data: processedSeriesData.map(series => series.name)
        },
        xAxis: [{
          name: echartMsg.xName || 'X轴',
          type: "value",
          boundaryGap: false,
          axisLabel: {
            color: "rgba(0, 0, 0, 1)",
            fontSize: 12,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#333'
            }
          },
          min: echartMsg.minX !== undefined ? echartMsg.minX : 'dataMin',
          axisTick: {
            show: true,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#f0f0f0',
              type: 'dashed'
            }
          }
        }],
        yAxis: [{
          type: "value",
          name: echartMsg.yName || 'Y轴',
          nameGap: 15,
          nameTextStyle: {
            fontSize: 12,
            color: "#333",
            padding: [0, 0, 0, 5],
          },
          min: echartMsg.minY !== undefined ? echartMsg.minY : 'dataMin',
          axisLabel: {
            color: "rgba(0, 0, 0, 1)",
            fontSize: 12,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#f0f0f0',
              type: 'dashed'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#333'
            }
          },
        }],
        series: processedSeriesData
      };

      try {
        Chart.clear();
        Chart.setOption(option, true);
        Chart.resize();

        console.log(`✓ 图表渲染成功 (ID: ${echartMsg.echartId})`);
      } catch (error) {
        console.error('图表渲染错误:', error);
      }
    },

    // 增强的绘图方法
    drawFun() {
      this.$nextTick(() => {
        this.processItems(this.introduce);
      });
    },

    // 改进的数据获取方法
    async getMsg(getJsonUrl) {
      try {
        const data = await getJson(getJsonUrl);
        this.jsonData = data;

        // 根据当前tab显示对应数据
        const tabKey = this.tabs[this.activeName]?.key;
        if (tabKey && data[tabKey] && Array.isArray(data[tabKey]) && data[tabKey].length > 0) {
          this.introduce = data[tabKey];
        } else {
          this.introduce = [];
        }

        // 预加载组织结构图片
        if (data.microstructures) {
          this.preloadMicrostructureImages(data.microstructures);
        }

        this.drawFun();
      } catch (error) {
        console.error('获取数据失败:', error);
        this.$message.error('获取材料数据失败');
        this.introduce = [];
      }
    },

    // 补充缺失的 getMenu 方法 - 移除调试信息
    async getMenu() {
      try {
        const data = await getJson(`${baseUrl}/json/menu.json`);
        this.menuData = data.menu || [];

        // 正确构建表格数据列表
        this.tableList = [];
        if (this.menuData && Array.isArray(this.menuData)) {
          this.menuData.forEach(category => {
            if (category.list && Array.isArray(category.list)) {
              category.list.forEach(material => {
                // 添加完整的材料信息
                this.tableList.push({
                  ...material,
                  materialCode: material.name,
                  materialType: category.name,
                  materialDesc: `${category.name} - ${material.name}`
                });
              });
            }
          });
        }

      } catch (error) {
        console.error('获取菜单失败:', error);
        this.menuData = [];
        this.tableList = [];
        this.$message.error('加载材料列表失败');
      }
    },

    // 修改：处理上传的文件夹 - 生成ZIP下载
    async processUploadedFolder() {
      if (this.uploadedFiles.length === 0) {
        this.$message.warning('请先选择文件夹');
        return;
      }

      try {
        const materialCount = this.detectedMaterials.length || 1;
        this.$message.info(`开始处理文件夹中的 ${materialCount} 个材料数据...`);

        // 创建文件上传处理器
        const fileProcessor = new FileUploadProcessor(baseUrl);
        fileProcessor.uploadedFiles = this.uploadedFiles;

        // 加载现有菜单数据
        let existingMenu = null;
        try {
          const menuData = await getJson(`${baseUrl}/json/menu.json`);
          existingMenu = menuData;
        } catch (error) {
          console.warn('无法加载现有菜单数据，将创建新的菜单');
        }

        // 处理所有材料
        const allResults = await fileProcessor.processAllMaterialsInUploadedFiles(existingMenu);

        // 显示处理结果并下载ZIP
        if (allResults.success) {
          this.$message.success(allResults.message);

          // 触发ZIP文件下载
          if (allResults.zipData) {
            fileProcessor.downloadZipFile(allResults.zipData);
            this.$message.success('数据处理完成，ZIP文件下载已开始！');
          }

          // 如果当前显示的材料在处理列表中，刷新显示
          if (this.detectedMaterials.includes(this.currentMaterialCode)) {
            const updatedData = allResults.materialsData[this.currentMaterialCode];
            if (updatedData) {
              this.jsonData = updatedData;
              const tabKey = this.tabs[this.activeName]?.key;
              if (tabKey && updatedData[tabKey] && updatedData[tabKey].length > 0) {
                this.introduce = updatedData[tabKey];
                this.drawFun();
              } else {
                this.introduce = [];
              }
            }
          }

        } else {
          this.$message.error(allResults.message);
        }

        // 关闭对话框
        this.folderUploadVisible = false;
        this.uploadedFiles = [];
        this.detectedMaterials = [];

      } catch (error) {
        console.error('处理文件夹失败:', error);
        this.$message.error(`处理失败: ${error.message}`);
      }
    },

    // 补充完整的containsArray方法
    containsArray(arrA, arrB) {
      if (!Array.isArray(arrA) || !Array.isArray(arrB)) return false;
      return arrB.every(element => arrA.includes(element));
    },

    // 新增：获取文件图标
    getFileIcon(fileName) {
      if (fileName.endsWith('.json')) {
        return 'el-icon-document';
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        return 'el-icon-s-grid';
      }
      return 'el-icon-document';
    },

    // 新增：格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 修改：从文件中提取所有材料编号 - 移除调试信息
    extractAllMaterialsFromFiles() {
      if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
        this.detectedMaterials = [];
        return;
      }

      // 使用FileUploadProcessor提取所有材料编号
      const processor = new FileUploadProcessor(baseUrl);
      const result = processor.processAllMaterialsInFolder(this.uploadedFiles);

      if (result.success && result.materials.length > 0) {
        this.detectedMaterials = result.materials;
        this.$message.success(`检测到 ${this.detectedMaterials.length} 个材料: ${this.detectedMaterials.join(', ')}`);
      } else {
        this.detectedMaterials = [];
        this.$message.info('未能检测到标准材料编号，将处理文件夹中的所有文件');
      }
    },

    // 新增：显示文件夹上传对话框
    showFolderUpload() {
      this.folderUploadVisible = true;
      this.uploadedFiles = [];
      this.detectedMaterials = [];
      this.isDragOver = false;
    },

    // 新增：触发文件夹选择
    triggerFolderSelect() {
      this.$refs.folderInput.click();
    },

    // 新增：处理文件夹拖拽
    handleFolderDrop(event) {
      event.preventDefault();
      this.isDragOver = false;

      const items = event.dataTransfer.items;
      const files = [];

      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
              files.push(file);
            }
          }
        }
      }

      if (files.length > 0) {
        this.uploadedFiles = files;
        this.extractAllMaterialsFromFiles();
      }
    },

    // 新增：处理文件夹选择
    handleFolderSelect(event) {
      const files = Array.from(event.target.files);
      this.uploadedFiles = files;
      this.extractAllMaterialsFromFiles();
    },
  }
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
  margin: 5px 0;
  padding: 3px 0;
  border-top: 1px solid #e6e6e6;
}

.material-images-container::before {
  content: "相关图片：";
  display: block;
  font-size: 14px;
  font-weight: normal;
  color: #666;
  margin-bottom: 3px;
  text-align: left;
}

.material-image-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
  text-align: left;
}

.material-image-item:last-child {
  margin-bottom: 0;
}

.image-caption {
  font-size: 13px;
  color: #666;
  text-align: left;
  margin: 0 0 2px 0;
  padding: 0;
  font-weight: normal;
  order: 1;
}

.material-image {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin: 0;
  order: 2;
}

.material-image img {
  max-width: 400px;
  height: auto;
  border: 1px solid #ddd;
  cursor: pointer;
  display: block;
  margin: 0;
  flex-shrink: 0;
}

.material-image img:hover {
  opacity: 0.9;
}

/* 如果有多张图片，使用水平flex布局 */
.material-images-container:has(.material-image-item:nth-child(3)) {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.material-images-container:has(.material-image-item:nth-child(3)) .material-image-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.material-images-container:has(.material-image-item:nth-child(3)) .image-caption {
  min-width: 60px;
  margin: 0;
  order: 1;
  flex-shrink: 0;
}

.material-images-container:has(.material-image-item:nth-child(3)) .material-image {
  order: 2;
  margin: 0;
}

.material-images-container:has(.material-image-item:nth-child(3)) .material-image img {
  max-width: 300px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .material-image img {
    max-width: 100%;
  }

  .material-images-container {
    margin: 3px 0;
    padding: 2px 0;
  }

  .material-image-item {
    margin-bottom: 3px;
  }

  /* 在移动端强制垂直布局 */
  .material-images-container:has(.material-image-item:nth-child(3)) .material-image-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .material-images-container:has(.material-image-item:nth-child(3)) .image-caption {
    min-width: auto;
  }

  .material-images-container:has(.material-image-item:nth-child(3)) .material-image img {
    max-width: 100%;
  }
}

/* 简化显示状态 */
.material-image-item[style*="display: none"] {
  display: none !important;
}

.material-image-item[style*="display: block"] {
  display: block !important;
}

/* 简化的图片模态框样式 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
}

.image-modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.image-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.image-modal-header {
  padding: 15px;
  border-bottom: 1px solid #e6e6e6;
}

.image-modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.image-modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

.image-modal-body {
  padding: 15px;
  text-align: center;
}

.image-modal-body img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}
</style>
