import * as XLSX from 'xlsx';
import JSZip from 'jszip';

const REQUIRED_SECTIONS = ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'];

// All classes (DataProcessor, FileUploadProcessor) are defined here.
// The content is the same as the original dataProcessor.js, with modifications for worker environment.

/**
 * 通用数据处理工具类
 */
export class DataProcessor {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // 基础数据结构操作
  createBaseJsonStructure() {
    return Object.fromEntries(REQUIRED_SECTIONS.map(section => [section, []]));
  }

  // 确保必需的数据结构存在
  ensureRequiredSections(data) {
    REQUIRED_SECTIONS.forEach(section => {
      if (!data[section]) {
        data[section] = [];
      }
    });
  }

  // 验证数据项有效性
  isValidDataItem(item) {
    return item && typeof item === 'object' && (item.name || item.con);
  }

  // 读取文件方法
  async readJsonFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error(`JSON文件格式错误: ${file.name}`));
        }
      };
      reader.onerror = () => reject(new Error(`文件读取失败: ${file.name}`));
      reader.readAsText(file);
    });
  }

  async readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook);
        } catch (error) {
          reject(new Error('Excel文件格式错误'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  // 核心处理方法：简化的三类数据合并逻辑
  async processThreeTypesDataIntegration(jsonFileData, excelFile, chartExcelFile) {
    console.log('🔄 开始三类数据整合处理...');

    const materialData = this.createBaseJsonStructure();

    // 第一步：处理JSON基础数据
    if (jsonFileData) {
      try {
        const jsonData = await this.readJsonFile(jsonFileData);
        this.mergeDataStructuresIntelligently(jsonData, materialData);
        console.log(`✅ JSON基础数据处理完成: ${jsonFileData.name}`);
      } catch (error) {
        console.error(`❌ JSON文件处理失败: ${error.message}`);
        // 当JSON文件无效时，直接抛出错误，由上层捕获并跳过该材料
        throw error;
      }
    }

    // 第二步：处理表格Excel文件
    if (excelFile) {
      try {
        const workbook = await this.readExcelFile(excelFile);
        const sheetNames = Object.keys(workbook.Sheets);
        console.log('📋 处理表格数据...');
        this.processTableDataFromExcel(workbook, sheetNames, materialData);
        console.log('✅ 表格数据处理完成');
      } catch (error) {
        console.error('❌ 表格Excel文件处理失败:', error);
        throw error; // Propagate error
      }
    }

    // 第三步：处理图表Excel文件
    if (chartExcelFile) {
      try {
        const workbook = await this.readExcelFile(chartExcelFile);
        const sheetNames = Object.keys(workbook.Sheets);
        console.log('📈 处理图表数据...');
        this.processChartDataFromExcel(workbook, sheetNames, materialData);
        console.log('✅ 图表数据处理完成');
      } catch (error) {
        console.error('❌ 图表Excel文件处理失败:', error);
        throw error; // Propagate error
      }
    }

    if (this.hasAnyData(materialData)) {
      // 合并后自动补全所有 tableColumns
      REQUIRED_SECTIONS.forEach(section => {
        if (materialData[section] && Array.isArray(materialData[section])) {
          materialData[section].forEach(item => this.autoFillTableColumns(item));
        }
      });
      const validationStats = this.validateMergeResults(materialData);
      console.log('📊 最终验证结果:', validationStats);
    }

    return materialData;
  }

  hasAnyData(materialData) {
    return REQUIRED_SECTIONS.some(section =>
      materialData[section] && Array.isArray(materialData[section]) && materialData[section].length > 0
    );
  }

  processTableDataFromExcel(workbook, sheetNames, materialData) {
    let processedCount = 0;
    const matchingResults = new Map();
    sheetNames.forEach((sheetName) => {
      REQUIRED_SECTIONS.forEach(section => {
        if (materialData[section] && Array.isArray(materialData[section])) {
          materialData[section].forEach((item, itemIndex) => {
            const matches = this.collectTableMatches(item, sheetName, workbook);
            matches.forEach(match => {
              const key = `${section}_${itemIndex}_${match.path}`;
              if (!matchingResults.has(key)) {
                matchingResults.set(key, { item: match.item, sheetData: [] });
              }
              matchingResults.get(key).sheetData.push({ sheetName, data: match.data });
            });
          });
        }
      });
    });
    matchingResults.forEach(({ item, sheetData }) => {
      if (this.assignCombinedTableData(item, sheetData)) {
        processedCount++;
      }
    });
    console.log(`📊 表格数据处理: ${processedCount} 个项目更新`);
  }

  processChartDataFromExcel(workbook, sheetNames, materialData) {
    let processedCount = 0;
    const matchingResults = new Map();
    sheetNames.forEach((sheetName) => {
      REQUIRED_SECTIONS.forEach(section => {
        if (materialData[section] && Array.isArray(materialData[section])) {
          materialData[section].forEach((item, itemIndex) => {
            const matches = this.collectChartMatches(item, sheetName, workbook);
            matches.forEach(match => {
              const key = `${section}_${itemIndex}_${match.path}`;
              if (!matchingResults.has(key)) {
                matchingResults.set(key, { item: match.item, sheetData: [] });
              }
              matchingResults.get(key).sheetData.push({ sheetName, data: match.data, chartName: match.chartName, echartId: match.echartId });
            });
          });
        }
      });
    });
    matchingResults.forEach(({ item, sheetData }) => {
      if (this.assignCombinedChartData(item, sheetData)) {
        processedCount++;
      }
    });
    console.log(`📈 图表数据处理: ${processedCount} 个项目更新`);
  }

  collectTableMatches(item, sheetName, workbook, path = '') {
    const matches = [];
    if (item && item.name) {
      const itemIdentifier = this.extractIdentifierFromName(item.name);
      if (!itemIdentifier) return matches;
      const sheetIdentifier = this.extractIdentifierFromSheetName(sheetName);
      if (this.isIdentifierMatch(itemIdentifier, sheetIdentifier)) {
        try {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          if (jsonData && jsonData.length > 0) {
            const tableColumns = Object.keys(jsonData[0]).map(key => ({ "label": key, "prop": key }));
            matches.push({ item, path, data: { tableData: jsonData, tableColumns: tableColumns, sourceSheet: sheetName } });
            console.log(`✅ 表格匹配成功: ${itemIdentifier} -> ${sheetName}`);
          }
        } catch (error) {
          console.error(`❌ 表格数据处理失败 ${sheetName}:`, error);
        }
      }
    }
    ['two', 'third', 'fourth', 'fifth'].forEach(prop => {
      if (item[prop] && Array.isArray(item[prop])) {
        item[prop].forEach((subItem, index) => {
          const subPath = path ? `${path}.${prop}[${index}]` : `${prop}[${index}]`;
          matches.push(...this.collectTableMatches(subItem, sheetName, workbook, subPath));
        });
      }
    });
    return matches;
  }

  collectChartMatches(item, sheetName, workbook, path = '') {
    const matches = [];
    if (item && item.name) {
      const itemIdentifier = this.extractIdentifierFromName(item.name);
      if (!itemIdentifier) return matches;
      const sheetIdentifier = this.extractIdentifierFromSheetName(sheetName);
      if (this.isIdentifierMatch(itemIdentifier, sheetIdentifier)) {
        try {
          const separatorIndex = item.name.indexOf('、');
          const endStr = item.name.indexOf('见') > 0 ? item.name.indexOf('见') : item.name.length;
          const chartName = separatorIndex > 0 ? item.name.substring(separatorIndex + 1, endStr) : '图表';
          const baseEchartId = itemIdentifier.split('.').join('');
          let uniqueEchartId = baseEchartId;
          if (sheetName.includes('_')) {
            const suffix = sheetName.split('_')[1];
            const numericSuffix = suffix.replace(/[^0-9-]/g, '').replace(/-/g, '');
            if (numericSuffix) {
              uniqueEchartId = `${baseEchartId}_${numericSuffix}`;
            } else {
              uniqueEchartId = `${baseEchartId}_${this.generateHashFromString(suffix)}`;
            }
          }
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          if (jsonData && jsonData.length > 0) {
            const chartResult = this.tubiao(jsonData, chartName);
            if (chartResult && chartResult[2] && chartResult[2].length > 0) {
              matches.push({ item, path, data: chartResult, chartName: `${chartName} (${sheetName})`, echartId: uniqueEchartId, sourceSheet: sheetName });
              console.log(`✅ 图表匹配成功: ${itemIdentifier} -> ${sheetName} (ID: ${uniqueEchartId})`);
            }
          }
        } catch (error) {
          console.error(`❌ 图表数据处理失败 ${sheetName}:`, error);
        }
      }
    }
    ['two', 'third', 'fourth', 'fifth'].forEach(prop => {
      if (item[prop] && Array.isArray(item[prop])) {
        item[prop].forEach((subItem, index) => {
          const subPath = path ? `${path}.${prop}[${index}]` : `${prop}[${index}]`;
          matches.push(...this.collectChartMatches(subItem, sheetName, workbook, subPath));
        });
      }
    });
    return matches;
  }

  assignCombinedTableData(item, sheetDataArray) {
    if (!sheetDataArray || sheetDataArray.length === 0) return false;
    try {
      if (sheetDataArray.length === 1) {
        return this.assignSingleTableData(item, sheetDataArray[0]);
      } else {
        return this.assignMultipleTableData(item, sheetDataArray);
      }
    } catch (error) {
      console.error('❌ 表格数据处理失败:', error);
      return false;
    }
  }

  assignSingleTableData(item, sheetData) {
    if (!item.tableData || item.tableData.length === 0) {
      item.tableData = sheetData.data.tableData;
      item.tableColumns = sheetData.data.tableColumns;
      console.log(`✅ 主表格数据更新: ${item.name} -> ${sheetData.sheetName}`);
      return true;
    } else {
      if (!item.multipleTables) item.multipleTables = [];
      const title = this.extractIdentifierFromSheetName(sheetData.sheetName);
      const identifier = this.extractIdentifierText(sheetData.sheetName);
      item.multipleTables.push({ title: title, identifier: identifier, tableData: sheetData.data.tableData, tableColumns: sheetData.data.tableColumns, sourceSheet: sheetData.sheetName });
      console.log(`✅ 附加表格数据更新: ${item.name} -> ${sheetData.sheetName}`);
      return true;
    }
  }

  assignMultipleTableData(item, sheetDataArray) {
    if (!item.multipleTables) item.multipleTables = [];
    let hasMainTable = item.tableData && item.tableData.length > 0;
    sheetDataArray.forEach((sheetData, index) => {
      if (!hasMainTable && index === 0) {
        item.tableData = sheetData.data.tableData;
        item.tableColumns = sheetData.data.tableColumns;
        hasMainTable = true;
      } else {
        const title = this.extractIdentifierFromSheetName(sheetData.sheetName);
        const identifier = this.extractIdentifierText(sheetData.sheetName);
        item.multipleTables.push({ title: title, identifier: identifier, tableData: sheetData.data.tableData, tableColumns: sheetData.data.tableColumns, sourceSheet: sheetData.sheetName });
      }
    });
    return true;
  }

  assignCombinedChartData(item, sheetDataArray) {
    if (!sheetDataArray || sheetDataArray.length === 0) return false;
    try {
      if (sheetDataArray.length === 1) {
        return this.assignSingleChartData(item, sheetDataArray[0]);
      } else {
        return this.assignMultipleChartData(item, sheetDataArray);
      }
    } catch (error) {
      console.error('❌ 图表数据处理失败:', error);
      return false;
    }
  }

  assignSingleChartData(item, sheetData) {
    if (!item.seriesData || item.seriesData.length === 0) {
      this.setSingleChartData(item, sheetData);
      console.log(`✅ 主图表数据更新: ${item.name} -> ${sheetData.sheetName}`);
      return true;
    } else {
      if (!item.multipleCharts) item.multipleCharts = [];
      const title = this.extractIdentifierFromSheetName(sheetData.sheetName);
      const identifier = this.extractIdentifierText(sheetData.sheetName);
      item.multipleCharts.push({ title: title, identifier: identifier, seriesData: sheetData.data[2], xAxisData: [], echartMsg: { echartId: `${sheetData.echartId}_extra_${item.multipleCharts.length}`, xName: "", yName: "", minX: sheetData.data[0], minY: sheetData.data[1] }, sourceSheet: sheetData.sheetName });
      console.log(`✅ 附加图表数据更新: ${item.name} -> ${sheetData.sheetName}`);
      return true;
    }
  }

  assignMultipleChartData(item, sheetDataArray) {
    if (!item.multipleCharts) item.multipleCharts = [];
    let hasMainChart = item.seriesData && item.seriesData.length > 0;
    sheetDataArray.forEach((sheetData, index) => {
      if (!hasMainChart && index === 0) {
        this.setSingleChartData(item, sheetData);
        hasMainChart = true;
      } else {
        const title = this.extractIdentifierFromSheetName(sheetData.sheetName);
        const identifier = this.extractIdentifierText(sheetData.sheetName);
        item.multipleCharts.push({ title: title, identifier: identifier, seriesData: sheetData.data[2], xAxisData: [], echartMsg: { echartId: `${sheetData.echartId}_multi_${item.multipleCharts.length}`, xName: "", yName: "", minX: sheetData.data[0], minY: sheetData.data[1] }, sourceSheet: sheetData.sheetName });
      }
    });
    return true;
  }

  extractIdentifierText(sheetName) {
    if (sheetName.includes('_')) {
      return sheetName.split('_')[1];
    }
    return null;
  }

  // 修正后的 tubiao 方法：智能配对 x/y 列并生成 [x, y] 点对
  tubiao(jsonData, lineName) {
    if (!jsonData || jsonData.length < 1 || !jsonData[0]) return [0, 0, []];

    const columns = Object.keys(jsonData[0]);
    const seriesData = [];

    // 策略1：处理标准 _x/_y 后缀的列
    const xCols = columns.filter(col => /_x$/i.test(col));
    if (xCols.length > 0) {
      xCols.forEach(xCol => {
        const yCol = xCol.replace(/_x$/i, '_y');
        if (columns.includes(yCol)) {
          const baseName = xCol.replace(/_x$/i, '');
          const data = jsonData.map(row => {
            const x = parseFloat(row[xCol]);
            const y = parseFloat(row[yCol]);
            return (!isNaN(x) && !isNaN(y)) ? [x, y] : null;
          }).filter(point => point !== null);

          if (data.length > 0) {
            seriesData.push({
              name: baseName || lineName,
              type: 'line',
              smooth: 'smooth',
              data
            });
          }
        }
      });
    }

    // 策略2：如果策略1未找到数据，则按顺序将列两两配对
    if (seriesData.length === 0 && columns.length >= 2) {
      for (let i = 0; i < columns.length; i += 2) {
        if (i + 1 < columns.length) {
          const xCol = columns[i];
          const yCol = columns[i + 1];

          const baseName = yCol; // 使用Y轴列名作为系列名

          const data = jsonData.map(row => {
            const x = parseFloat(row[xCol]);
            const y = parseFloat(row[yCol]);
            return (!isNaN(x) && !isNaN(y)) ? [x, y] : null;
          }).filter(point => point !== null);

          if (data.length > 0) {
            seriesData.push({
              name: baseName || `${xCol}-${yCol}`,
              type: 'line',
              smooth: 'smooth',
              data
            });
          }
        }
      }
    }

    // 如果没有找到任何有效的 x/y 配对，返回空数据
    if (seriesData.length === 0) {
      console.warn(`❌ 无法为图表 "${lineName}" 找到有效的 x/y 配对数据，跳过图表生成`);
      return [0, 0, []];
    }

    // 计算所有系列中的 minX/minY
    let xArr = [], yArr = [];
    seriesData.forEach(series => {
      series.data.forEach(point => {
        if (Array.isArray(point) && point.length === 2) {
          xArr.push(point[0]);
          yArr.push(point[1]);
        }
      });
    });

    return [
      xArr.length > 0 ? Math.min(...xArr) : 0,
      yArr.length > 0 ? Math.min(...yArr) : 0,
      seriesData
    ];
  }

  mergeDataStructuresIntelligently(sourceData, targetData) {
    if (!sourceData || typeof sourceData !== 'object') return;
    REQUIRED_SECTIONS.forEach(section => {
      if (sourceData[section] && Array.isArray(sourceData[section])) {
        targetData[section] = sourceData[section];
      }
    });
  }

  setSingleChartData(item, sheetData) {
    if (!item || !sheetData) return;
    item.seriesData = sheetData.data[2] || [];
    item.xAxisData = [];
    item.echartMsg = { echartId: sheetData.echartId, xName: "", yName: "", minX: sheetData.data[0] || 0, minY: sheetData.data[1] || 0 };
  }

  validateMergeResults(materialData) {
    const stats = { totalItems: 0, sectionsWithData: 0, itemsWithTables: 0, itemsWithCharts: 0 };
    REQUIRED_SECTIONS.forEach(section => {
      if (materialData[section] && Array.isArray(materialData[section]) && materialData[section].length > 0) {
        stats.sectionsWithData++;
        stats.totalItems += materialData[section].length;
        materialData[section].forEach(item => {
          if (item.tableData && item.tableData.length > 0) stats.itemsWithTables++;
          if (item.seriesData && item.seriesData.length > 0) stats.itemsWithCharts++;
        });
      }
    });
    return stats;
  }

  extractIdentifierFromName(name) {
    if (!name) return null;
    // This regex now supports up to 5 levels of dot-separated numbers
    const match = name.match(/\b(\d+(\.\d+){1,4})\b/);
    if (match) return match[1];
    return null;
  }

  extractIdentifierFromSheetName(sheetName) {
    if (!sheetName) return null;
    // This regex matches a numeric, dot-separated identifier at the start of the string.
    // e.g., "3.9.2.3" from "3.9.2.3_图3-30" or "3.9.2.4" from "3.9.2.4"
    const match = sheetName.match(/^(\d+(\.\d+)+)/);
    // We also validate it against the allowed formats (e.g., X.X, X.X.X, etc.)
    if (match && match[1] && this.isValidNumberIdentifier(match[1])) {
      return match[1];
    }
    return null;
  }

  isValidNumberIdentifier(str) {
    if (!str) return false;
    // This regex now supports up to 5 levels of dot-separated numbers
    return /^\d+(\.\d+){1,4}$/.test(str);
  }

  isIdentifierMatch(itemIdentifier, sheetIdentifier) {
    if (!itemIdentifier || !sheetIdentifier) return false;
    if (!this.isValidNumberIdentifier(itemIdentifier) || !this.isValidNumberIdentifier(sheetIdentifier)) return false;

    // 通过比较“.”的数量来确保层级深度一致，防止父级匹配子级
    const itemDots = (itemIdentifier.match(/\./g) || []).length;
    const sheetDots = (sheetIdentifier.match(/\./g) || []).length;

    if (itemDots !== sheetDots) {
        return false;
    }

    return itemIdentifier === sheetIdentifier;
  }

  async exportBatchResults(results, includeMenu = true, existingMenuData = null) {
    try {
      const zip = new JSZip();
      Object.entries(results.processedMaterials).forEach(([materialCode, data]) => {
        zip.file(`${materialCode}.json`, JSON.stringify(data, null, 2));
      });
      if (includeMenu) {
        const menuResult = await this.generateMenuFromResults(results, existingMenuData);
        zip.file('menu.json', JSON.stringify(menuResult.menu, null, 2));
        zip.file('menu_update_report.txt', this.generateMenuUpdateReport(menuResult.stats));
      }
      zip.file('batch_processing_report.txt', this.generateBatchReport(results));
      zip.file('materials_list.json', JSON.stringify(this.generateMaterialsList(results), null, 2));
      return await zip.generateAsync({ type: 'blob' });
    } catch (error) {
      console.error('❌ 导出批量结果失败:', error);
      throw new Error(`导出失败: ${error.message}`);
    }
  }

  generateBatchReport(results) {
    let report = `材料数据批量处理报告\n生成时间: ${new Date().toLocaleString('zh-CN')}\n============================================================\n\n`;
    report += `📊 处理统计:\n   总材料数: ${results.summary.total}\n   成功处理: ${results.summary.processed}\n   处理失败: ${results.summary.failed}\n   跳过处理: ${results.summary.skipped}\n   成功率: ${((results.summary.processed / results.summary.total) * 100).toFixed(1)}%\n\n`;
    if (results.summary.processed > 0) {
      report += `✅ 成功处理的材料 (${results.summary.processed}个):\n────────────────────────────────────────────────────────────\n`;
      Object.keys(results.processedMaterials).forEach(code => {
        report += `   ${code}: ${this.countDataItems(results.processedMaterials[code])} 个数据项\n`;
      });
      report += `\n`;
    }
    if (results.errors && results.errors.length > 0) {
        report += `❌ 处理失败的材料 (${results.errors.length}个):\n────────────────────────────────────────────────────────────\n`;
        results.errors.forEach(err => {
            report += `   ${err.code}: ${err.message}\n`;
        });
        report += `\n`;
    }
    report += `处理完成！\n`;
    return report;
  }

  generateMaterialsList(results) {
    return {
      timestamp: new Date().toISOString(),
      summary: results.summary,
      materials: Object.keys(results.processedMaterials).map(code => ({ code, category: this.determineMaterialCategory(code), dataItems: this.countDataItems(results.processedMaterials[code]), status: 'processed' })),
      errors: results.errors || []
    };
  }

  countDataItems(materialData) {
    let count = 0;
    REQUIRED_SECTIONS.forEach(section => {
      if (materialData[section] && Array.isArray(materialData[section])) {
        count += this.countItemsRecursively(materialData[section]);
      }
    });
    return count;
  }

  countItemsRecursively(items) {
    if (!Array.isArray(items)) return 0;
    let count = items.length;
    items.forEach(item => {
      if (item) {
        ['two', 'third', 'fourth', 'fifth'].forEach(prop => {
          if (item[prop] && Array.isArray(item[prop])) {
            count += this.countItemsRecursively(item[prop]);
          }
        });
      }
    });
    return count;
  }

  determineMaterialCategory(materialCode) {
    if (materialCode.startsWith('GH1') || materialCode.startsWith('GH3') || materialCode.startsWith('GH5')) return 1;
    if (materialCode.startsWith('K')) return 2;
    if (materialCode.startsWith('GH4')) return 3;
    if (materialCode.startsWith('DZ')) return 4;
    if (materialCode.startsWith('DD')) return 5;
    if (materialCode.startsWith('FGH')) return 6;
    return 1;
  }

  async generateMenuFromResults(results, existingMenuData = null) {
    const menu = existingMenuData || { code: 200, menu: [ { "index": "1", "name": "固溶强化型变形高温合金", "list": [] }, { "index": "2", "name": "等轴晶铸造高温合金", "list": [] }, { "index": "3", "name": "沉淀硬化型变形高温合金", "list": [] }, { "index": "4", "name": "定向凝固柱晶高温合金", "list": [] }, { "index": "5", "name": "单晶高温合金", "list": [] }, { "index": "6", "name": "粉末冶金高温合金", "list": [] } ] };
    let addedCount = 0, updatedCount = 0;
    Object.keys(results.processedMaterials).forEach((materialCode) => {
      const categoryIndex = this.determineMaterialCategory(materialCode);
      const targetCategory = menu.menu.find(cat => cat.index === categoryIndex.toString());
      if (targetCategory) {
        const existingItem = targetCategory.list.find(item => item.name === materialCode);
        const materialData = results.processedMaterials[materialCode];
        const materialInfo = {
          name: materialCode,
          key_component: this.extractKeyComponents(materialData),
          key_craft: this.extractKeyCraft(materialData),
          key_density: this.extractDensity(materialData)
        };
        if (existingItem) {
          Object.assign(existingItem, materialInfo);
          updatedCount++;
        } else {
          materialInfo.index = `${categoryIndex}-${targetCategory.list.length + 1}`;
          targetCategory.list.push(materialInfo);
          addedCount++;
        }
      }
    });
    return { menu, stats: { added: addedCount, updated: updatedCount, total: addedCount + updatedCount } };
  }

  extractKeyComponents(materialData) {
    const components = new Set();
    ['introduce', 'physicalChemistry'].forEach(section => {
      if (materialData[section]) {
        materialData[section].forEach(item => {
          if (item.name && item.name.includes('化学成分') && item.tableData) {
            item.tableData.forEach(row => {
              Object.keys(row).forEach(key => {
                if (this.isChemicalElement(key)) components.add(key);
              });
            });
          }
        });
      }
    });
    return Array.from(components).slice(0, 10);
  }

  extractKeyCraft(materialData) {
    const crafts = new Set();
    ['introduce', 'craft'].forEach(section => {
      if (materialData[section]) {
        materialData[section].forEach(item => {
          if (item.name && (item.name.includes('熔炼') || item.name.includes('工艺')) && item.con) {
            this.inferCraftTypes(item.con).forEach(craft => crafts.add(craft));
          }
        });
      }
    });
    return Array.from(crafts);
  }

  inferCraftTypes(text) {
    if (!text || typeof text !== 'string') return [];
    const detectedCrafts = new Set();
    const craftMap = { '电弧炉': 1, '电渣重熔': 2, '真空电弧重熔': 3, '非真空感应炉': 4, '真空感应炉': 5, '真空双联熔炼': 6, '电弧炉+真空自耗重熔': 7, '电弧炉+电渣重熔': 8, '电弧炉+真空电弧重熔': 9, '非真空感应炉+真空电弧重熔': 10, '非真空感应炉+电渣重熔': 11, '非真空感应炉+真空自耗': 12, '真空感应炉+电渣重熔': 13, '真空感应炉+真空自耗': 14 };
    let processedText = text.replace(/^采用/, '').replace(/熔炼工艺。?$/, '').replace(/工艺。?$/, '');
    const craftDescriptions = processedText.split(/、|或/);
    craftDescriptions.forEach(desc => {
      const trimmedDesc = desc.trim();
      Object.keys(craftMap).forEach(craftName => {
        if (trimmedDesc.includes(craftName)) detectedCrafts.add(craftMap[craftName]);
      });
    });
    return Array.from(detectedCrafts);
  }

  extractDensity(materialData) {
    if (materialData.physicalChemistry) {
      for (const item of materialData.physicalChemistry) {
        if (item.name && item.name.includes('密度')) {
          if (item.tableData) {
            for (const row of item.tableData) {
              for (const [key, value] of Object.entries(row)) {
                if (key.includes('密度') || key.includes('ρ')) {
                  const density = parseFloat(value);
                  if (!isNaN(density)) return density;
                }
              }
            }
          }
          if (item.con) {
            const match = item.con.match(/(\d+\.?\d*)\s*g\/cm³/);
            if (match) return parseFloat(match[1]);
          }
        }
      }
    }
    return 0;
  }

  isChemicalElement(symbol) {
    const elements = ['C', 'Cr', 'Ni', 'W', 'Mo', 'Fe', 'Nb', 'B', 'Ce', 'Mn', 'Si', 'P', 'S', 'Cu', 'V', 'N', 'Al', 'Ti', 'Co', 'Sn', 'Pb', 'Zr', 'La', 'Sb', 'As', 'Bi', 'Ta', 'Se', 'Ag', 'Mg', 'Hf', 'Ga', 'In', 'Te', 'Tl', 'Zn', 'Cd'];
    return elements.includes(symbol);
  }

  generateMenuUpdateReport(stats) {
    return `菜单更新报告\n生成时间: ${new Date().toLocaleString('zh-CN')}\n========================================\n\n📊 更新统计:\n   新增材料: ${stats.added}\n   更新材料: ${stats.updated}\n   总计处理: ${stats.total}\n\n建议: 请将生成的 menu.json 文件替换到服务器上的菜单文件\n`;
  }

  generateHashFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }

  determineFileType(file) {
    if (!file || !file.name) return 'unknown';
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return 'excel';
    return 'unknown';
  }

  // 递归收集所有 seriesData 和 multipleCharts
  collectAllCharts(node, result = []) {
    if (node.seriesData && node.seriesData.length > 0) {
      result.push({ seriesData: node.seriesData, echartMsg: node.echartMsg });
    }
    if (node.multipleCharts && node.multipleCharts.length > 0) {
      node.multipleCharts.forEach(chart => {
        result.push({ seriesData: chart.seriesData, echartMsg: chart.echartMsg });
      });
    }
    ['two', 'third', 'fourth', 'fifth'].forEach(key => {
      if (Array.isArray(node[key])) {
        node[key].forEach(child => this.collectAllCharts(child, result));
      }
    });
    return result;
  }

  // 合并数据结构后自动补全所有 tableColumns
  autoFillTableColumns(item) {
    if (item.tableData && (!item.tableColumns || item.tableColumns.length === 0)) {
      const firstRow = item.tableData.find(row => typeof row === 'object' && row !== null);
      if (firstRow) {
        item.tableColumns = Object.keys(firstRow).map(key => ({ label: key, prop: key }));
      }
    }
    ['two', 'third', 'fourth', 'fifth', 'sixth'].forEach(childKey => {
      if (Array.isArray(item[childKey])) {
        item[childKey].forEach(sub => this.autoFillTableColumns(sub));
      }
    });
  }
}

/**
 * 文件上传处理器
 */
export class FileUploadProcessor extends DataProcessor {
  constructor(baseUrl) {
    super(baseUrl);
    this.uploadedFiles = [];
  }

  extractMaterialCodeFromFileName(fileName) {
    if (!fileName) return null;
    // Remove file extension
    const baseName = fileName.split('.').slice(0, -1).join('.');
    if (!baseName) return null;
    // The material code is the part before the first underscore, or the whole name if no underscore
    const code = baseName.split('_')[0];
    return code;
  }

  analyzeFolderContents(files) {
    const materialsMap = new Map();
    files.forEach(file => {
      const materialCode = this.extractMaterialCodeFromFileName(file.name);
      if (materialCode) {
        if (!materialsMap.has(materialCode)) {
          materialsMap.set(materialCode, { code: materialCode, files: [], hasJson: false, hasTableExcel: false, hasChartExcel: false, ready: false });
        }
        const material = materialsMap.get(materialCode);
        material.files.push(file);
        const fileType = this.determineFileType(file);
        if (fileType === 'json') material.hasJson = true;
        else if (fileType === 'excel') {
            const fn = file.name.toLowerCase();
            if(fn.includes('表格') || fn.includes('table')) material.hasTableExcel = true;
            else material.hasChartExcel = true; // Default to chart
        }
        material.ready = material.hasJson;
      }
    });
    const materials = Array.from(materialsMap.values());
    return {
      materials,
      statistics: {
        totalFiles: files.length,
        materialsCount: materials.length,
        readyMaterials: materials.filter(m => m.ready).length
      }
    };
  }

  classifyMaterialFiles(files) {
    const jsonFiles = [], tableFiles = [], chartFiles = [];
    files.forEach(file => {
      const fileType = this.determineFileType(file);
      if (fileType === 'json') jsonFiles.push(file);
      else if (fileType === 'excel') {
        if (file.name.toLowerCase().includes('表格')) tableFiles.push(file);
        else chartFiles.push(file);
      }
    });
    return { jsonFiles, tableFiles, chartFiles };
  }

  hasValidData(data) {
    return REQUIRED_SECTIONS.some(section => data[section] && Array.isArray(data[section]) && data[section].length > 0);
  }

  async processSingleMaterialWithThreeTypes(materialCode, files) {
    const fileClassification = this.classifyMaterialFiles(files);
    return await this.processThreeTypesDataIntegration(
      fileClassification.jsonFiles[0] || null,
      fileClassification.tableFiles.length > 0 ? fileClassification.tableFiles[0] : null, // Use first table file if multiple
      fileClassification.chartFiles.length > 0 ? fileClassification.chartFiles[0] : null // Use first chart file if multiple
    );
  }

  async processBatchMaterials(files, progressCallback) {
    const analysis = this.analyzeFolderContents(files);
    const { materials } = analysis;
    const results = {
      success: true,
      processedMaterials: {},
      errors: [],
      summary: { total: materials.length, processed: 0, failed: 0, skipped: 0 }
    };

    if (materials.length === 0) return results;

    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];
      if (progressCallback) {
        progressCallback({ current: i + 1, total: materials.length, progress: Math.round(((i + 1) / materials.length) * 100), currentMaterial: material.code });
      }
      if (!material.hasJson) {
        results.summary.skipped++;
        results.errors.push({ code: material.code, message: '缺少JSON基础文件，已跳过' });
        continue;
      }
      try {
        const materialData = await this.processSingleMaterialWithThreeTypes(material.code, material.files);
        if (this.hasValidData(materialData)) {
          results.processedMaterials[material.code] = materialData;
          results.summary.processed++;
        } else {
          results.summary.failed++;
          results.errors.push({ code: material.code, message: '处理后未生成有效数据' });
        }
      } catch (error) {
        results.summary.failed++;
        results.errors.push({ code: material.code, message: error.message });
      }
    }
    return results;
  }
}


// --- Worker message handler ---

self.onmessage = async (event) => {
    const { type, payload } = event.data;
    const processor = new FileUploadProcessor('');

    try {
        switch (type) {
            case 'analyze':
                const analysisResult = processor.analyzeFolderContents(payload);
                self.postMessage({ type: 'analysis_result', payload: analysisResult });
                break;

            case 'process':
                const progressCallback = (progress) => {
                    self.postMessage({ type: 'progress', payload: progress });
                };
                const results = await processor.processBatchMaterials(payload, progressCallback);
                self.postMessage({ type: 'result', payload: results });
                break;

            case 'download':
                const { results: downloadResults, existingMenuData } = payload;
                const zipBlob = await processor.exportBatchResults(downloadResults, true, existingMenuData);
                self.postMessage({ type: 'download_blob', payload: zipBlob });
                break;
        }
    } catch (error) {
        self.postMessage({ type: 'error', payload: error.message });
    }
};
