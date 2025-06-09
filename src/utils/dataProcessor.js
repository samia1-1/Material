import * as XLSX from 'xlsx';

const REQUIRED_SECTIONS = ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'];

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
          reject(new Error('JSON文件格式错误'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
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
        console.log('✅ JSON基础数据处理完成');
      } catch (error) {
        console.error('❌ JSON文件处理失败:', error);
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
      }
    }

    // 修复：确保验证方法被调用
    if (this.hasAnyData(materialData)) {
      const validationStats = this.validateMergeResults(materialData);
      console.log('📊 最终验证结果:', validationStats);
    }

    return materialData;
  }

  // 新增：检查是否有任何数据的辅助方法
  hasAnyData(materialData) {
    return REQUIRED_SECTIONS.some(section =>
      materialData[section] && Array.isArray(materialData[section]) && materialData[section].length > 0
    );
  }

  // 简化的表格数据处理
  processTableDataFromExcel(workbook, sheetNames, materialData) {
    let processedCount = 0;

    // 为每个数据项收集所有匹配的工作表
    const matchingResults = new Map();

    sheetNames.forEach((sheetName) => {
      REQUIRED_SECTIONS.forEach(section => {
        if (materialData[section] && Array.isArray(materialData[section])) {
          materialData[section].forEach((item, itemIndex) => {
            const matches = this.collectTableMatches(item, sheetName, workbook);
            matches.forEach(match => {
              const key = `${section}_${itemIndex}_${match.path}`;
              if (!matchingResults.has(key)) {
                matchingResults.set(key, {
                  item: match.item,
                  sheetData: []
                });
              }
              matchingResults.get(key).sheetData.push({
                sheetName,
                data: match.data
              });
            });
          });
        }
      });
    });

    // 合并多个工作表的数据到对应项目
    matchingResults.forEach(({ item, sheetData }) => {
      if (this.assignCombinedTableData(item, sheetData)) {
        processedCount++;
      }
    });

    console.log(`📊 表格数据处理: ${processedCount} 个项目更新`);
  }

  // 简化的图表数据处理
  processChartDataFromExcel(workbook, sheetNames, materialData) {
    let processedCount = 0;

    // 为每个数据项收集所有匹配的工作表
    const matchingResults = new Map();

    sheetNames.forEach((sheetName) => {
      REQUIRED_SECTIONS.forEach(section => {
        if (materialData[section] && Array.isArray(materialData[section])) {
          materialData[section].forEach((item, itemIndex) => {
            const matches = this.collectChartMatches(item, sheetName, workbook);
            matches.forEach(match => {
              const key = `${section}_${itemIndex}_${match.path}`;
              if (!matchingResults.has(key)) {
                matchingResults.set(key, {
                  item: match.item,
                  sheetData: []
                });
              }
              matchingResults.get(key).sheetData.push({
                sheetName,
                data: match.data,
                chartName: match.chartName,
                echartId: match.echartId
              });
            });
          });
        }
      });
    });

    // 合并多个工作表的数据到对应项目
    matchingResults.forEach(({ item, sheetData }) => {
      if (this.assignCombinedChartData(item, sheetData)) {
        processedCount++;
      }
    });

    console.log(`📈 图表数据处理: ${processedCount} 个项目更新`);
  }

  // 新增：收集表格匹配项
  collectTableMatches(item, sheetName, workbook, path = '') {
    const matches = [];

    if (item && item.name) {
      const itemIdentifier = this.extractIdentifierFromName(item.name);

      if (!itemIdentifier) {
        return matches;
      }

      // 修改：提取工作表的实际标识符，与图表逻辑完全一致
      const sheetIdentifier = this.extractIdentifierFromSheetName(sheetName);

      if (this.isIdentifierMatch(itemIdentifier, sheetIdentifier)) {
        try {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData && jsonData.length > 0) {
            const tableColumns = [];
            Object.keys(jsonData[0]).forEach(key => {
              tableColumns.push({ "label": key, "prop": key });
            });

            matches.push({
              item,
              path,
              data: {
                tableData: jsonData,
                tableColumns: tableColumns,
                sourceSheet: sheetName
              }
            });

            console.log(`✅ 表格匹配成功: ${itemIdentifier} -> ${sheetName}`);
          }
        } catch (error) {
          console.error(`❌ 表格数据处理失败 ${sheetName}:`, error);
        }
      }
    }

    // 递归处理子级数据，支持四级结构
    ['two', 'third', 'fourth'].forEach(prop => {
      if (item[prop] && Array.isArray(item[prop])) {
        item[prop].forEach((subItem, index) => {
          const subPath = path ? `${path}.${prop}[${index}]` : `${prop}[${index}]`;
          matches.push(...this.collectTableMatches(subItem, sheetName, workbook, subPath));
        });
      }
    });

    return matches;
  }

  // 新增：收集图表匹配项
  collectChartMatches(item, sheetName, workbook, path = '') {
    const matches = [];

    if (item && item.name) {
      // 使用与原始代码相同的提取逻辑
      const itemIdentifier = this.extractIdentifierFromName(item.name);

      // 如果没有找到标识符，跳过匹配
      if (!itemIdentifier) {
        return matches;
      }

      // 修改：提取工作表的实际标识符，支持新的命名模式
      const sheetIdentifier = this.extractIdentifierFromSheetName(sheetName);

      // 修改：使用更精确的匹配逻辑
      if (this.isIdentifierMatch(itemIdentifier, sheetIdentifier)) {
        try {
          // 生成图表名称和ID
          const separatorIndex = item.name.indexOf('、');
          const endStr = item.name.indexOf('见') > 0 ? item.name.indexOf('见') : item.name.length;
          const chartName = separatorIndex > 0 ? item.name.substring(separatorIndex + 1, endStr) : '图表';

          // 修改：为每个工作表生成唯一的图表ID，支持新命名模式
          const baseEchartId = itemIdentifier.split('.').join('');
          let uniqueEchartId = baseEchartId;

          // 从工作表名称中提取后缀（如图3-1, 图3-2等）
          if (sheetName.includes('_')) {
            const suffix = sheetName.split('_')[1];
            // 提取数字部分作为唯一标识
            const numericSuffix = suffix.replace(/[^0-9-]/g, '').replace(/-/g, '');
            if (numericSuffix) {
              uniqueEchartId = `${baseEchartId}_${numericSuffix}`;
            } else {
              // 如果没有数字，使用完整后缀的哈希
              uniqueEchartId = `${baseEchartId}_${this.generateHashFromString(suffix)}`;
            }
          }

          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData && jsonData.length > 0) {
            const chartResult = this.tubiao(jsonData, chartName);

            if (chartResult && chartResult[2] && chartResult[2].length > 0) {
              matches.push({
                item,
                path,
                data: chartResult,
                chartName: `${chartName} (${sheetName})`,
                echartId: uniqueEchartId,
                sourceSheet: sheetName
              });

              console.log(`✅ 图表匹配成功: ${itemIdentifier} -> ${sheetName} (ID: ${uniqueEchartId})`);
            }
          }
        } catch (error) {
          console.error(`❌ 图表数据处理失败 ${sheetName}:`, error);
        }
      }
    }

    // 递归处理子级数据，支持四级结构
    ['two', 'third', 'fourth'].forEach(prop => {
      if (item[prop] && Array.isArray(item[prop])) {
        item[prop].forEach((subItem, index) => {
          const subPath = path ? `${path}.${prop}[${index}]` : `${prop}[${index}]`;
          matches.push(...this.collectChartMatches(subItem, sheetName, workbook, subPath));
        });
      }
    });

    return matches;
  }

  // 新增：合并多个表格数据
  assignCombinedTableData(item, sheetDataArray) {
    if (!sheetDataArray || sheetDataArray.length === 0) return false;

    try {
      if (sheetDataArray.length === 1) {
        return this.assignSingleTableData(item, sheetDataArray[0]);
      } else {
        // 多个表格：总是使用 multipleTables 结构
        return this.assignMultipleTableData(item, sheetDataArray);
      }
    } catch (error) {
      console.error('❌ 表格数据处理失败:', error);
      return false;
    }
  }

  // 新增：处理单个表格数据
  assignSingleTableData(item, sheetData) {
    // 如果主表格字段为空，填充主表格
    if (!item.tableData || item.tableData.length === 0) {
      item.tableData = sheetData.data.tableData;
      item.tableColumns = sheetData.data.tableColumns;
      console.log(`✅ 主表格数据更新: ${item.name} -> ${sheetData.sheetName} (${sheetData.data.tableData.length} 行)`);
      return true;
    } else {
      // 主表格已存在，添加到 multipleTables
      if (!item.multipleTables) {
        item.multipleTables = [];
      }

      const tableTitle = this.generateTableTitle(sheetData.sheetName, item.multipleTables.length + 1);

      item.multipleTables.push({
        title: tableTitle,
        tableData: sheetData.data.tableData,
        tableColumns: sheetData.data.tableColumns,
        sourceSheet: sheetData.sheetName
      });

      console.log(`✅ 附加表格数据更新: ${item.name} -> ${sheetData.sheetName} (${sheetData.data.tableData.length} 行，总表格数: ${item.multipleTables.length + 1})`);
      return true;
    }
  }

  // 新增：处理多个表格数据
  assignMultipleTableData(item, sheetDataArray) {
    if (!item.multipleTables) {
      item.multipleTables = [];
    }

    let hasMainTable = item.tableData && item.tableData.length > 0;
    let addedCount = 0;
    let totalRows = 0;

    sheetDataArray.forEach((sheetData, index) => {
      const rowCount = sheetData.data.tableData.length;
      totalRows += rowCount;

      // 如果没有主表格，第一个作为主表格
      if (!hasMainTable && index === 0) {
        item.tableData = sheetData.data.tableData;
        item.tableColumns = sheetData.data.tableColumns;
        hasMainTable = true;
        console.log(`✅ 主表格数据设置: ${item.name} -> ${sheetData.sheetName} (${rowCount} 行)`);
      } else {
        // 其他的添加到 multipleTables
        const tableTitle = this.generateTableTitle(sheetData.sheetName, item.multipleTables.length + 1);

        item.multipleTables.push({
          title: tableTitle,
          tableData: sheetData.data.tableData,
          tableColumns: sheetData.data.tableColumns,
          sourceSheet: sheetData.sheetName
        });
        addedCount++;
        console.log(`✅ 附加表格 ${addedCount} 设置: ${sheetData.sheetName} (${rowCount} 行)`);
      }
    });

    console.log(`✅ 多表格处理完成: ${item.name} - 主表格: ${hasMainTable ? '是' : '否'}, 附加表格: ${addedCount} 个, 总数据行: ${totalRows}`);
    return true;
  }

  // 修复：处理多个图表数据 - 智能分配策略
  assignCombinedChartData(item, sheetDataArray) {
    if (!sheetDataArray || sheetDataArray.length === 0) return false;

    try {
      if (sheetDataArray.length === 1) {
        return this.assignSingleChartData(item, sheetDataArray[0]);
      } else {
        // 多个图表：总是使用 multipleCharts 结构
        return this.assignMultipleChartData(item, sheetDataArray);
      }
    } catch (error) {
      console.error('❌ 图表数据处理失败:', error);
      return false;
    }
  }

  // 修复：处理单个图表数据 - 优先使用主图表字段
  assignSingleChartData(item, sheetData) {
    // 如果主图表字段为空，填充主图表
    if (!item.seriesData || item.seriesData.length === 0) {
      this.setSingleChartData(item, sheetData);
      console.log(`✅ 主图表数据更新: ${item.name} -> ${sheetData.sheetName}`);
      return true;
    } else {
      // 主图表已存在，添加到 multipleCharts
      if (!item.multipleCharts) {
        item.multipleCharts = [];
      }

      const chartTitle = this.generateChartTitle(sheetData.sheetName, item.multipleCharts.length + 1);

      item.multipleCharts.push({
        title: chartTitle,
        seriesData: sheetData.data[2],
        xAxisData: [],
        echartMsg: {
          echartId: `${sheetData.echartId}_extra_${item.multipleCharts.length}`,
          xName: "",
          yName: "",
          minX: sheetData.data[0],
          minY: sheetData.data[1]
        },
        sourceSheet: sheetData.sheetName
      });

      console.log(`✅ 附加图表数据更新: ${item.name} -> ${sheetData.sheetName}`);
      return true;
    }
  }

  // 修复：处理多个图表数据 - 智能分配策略
  assignMultipleChartData(item, sheetDataArray) {
    if (!item.multipleCharts) {
      item.multipleCharts = [];
    }

    let hasMainChart = item.seriesData && item.seriesData.length > 0;
    let addedCount = 0;

    sheetDataArray.forEach((sheetData, index) => {
      // 如果没有主图表，第一个作为主图表
      if (!hasMainChart && index === 0) {
        this.setSingleChartData(item, sheetData);
        hasMainChart = true;
        console.log(`✅ 主图表数据设置: ${item.name} -> ${sheetData.sheetName}`);
      } else {
        // 其他的添加到 multipleCharts
        const chartTitle = this.generateChartTitle(sheetData.sheetName, item.multipleCharts.length + 1);

        item.multipleCharts.push({
          title: chartTitle,
          seriesData: sheetData.data[2],
          xAxisData: [],
          echartMsg: {
            echartId: `${sheetData.echartId}_multi_${item.multipleCharts.length}`,
            xName: "",
            yName: "",
            minX: sheetData.data[0],
            minY: sheetData.data[1]
          },
          sourceSheet: sheetData.sheetName
        });
        addedCount++;
      }
    });

    console.log(`✅ 多图表处理完成: ${item.name} - 主图表: ${hasMainChart ? '是' : '否'}, 附加图表: ${addedCount} 个`);
    return true;
  }

  // 新增：生成表格标题
  generateTableTitle(sheetName, index) {
    if (sheetName.includes('_')) {
      const parts = sheetName.split('_');
      if (parts.length > 1) {
        const suffix = parts[1];
        // 优化标题显示
        if (suffix.startsWith('表')) {
          return `${suffix}`;
        } else if (suffix.includes('表')) {
          return `${suffix}`;
        } else {
          return `${suffix} (${parts[0]})`;
        }
      }
    }
    return `表格 ${index}`;
  }

  // 新增：生成图表标题
  generateChartTitle(sheetName, index) {
    if (sheetName.includes('_')) {
      const parts = sheetName.split('_');
      if (parts.length > 1) {
        const suffix = parts[1];
        // 优化标题显示
        if (suffix.startsWith('图')) {
          return `${suffix}`;
        } else {
          return `${suffix} (${parts[0]})`;
        }
      }
    }
    return `图表 ${index}`;
  }

  // 新增：更新测试用例以验证一对多匹配
  testMatchingLogic(testCases = []) {
    const defaultTestCases = [
      // 新的命名模式测试用例
      { item: "3.8.2", sheet: "3.8.2_图3-1", expected: true },
      { item: "3.8.2", sheet: "3.8.2_图3-2", expected: true },
      { item: "3.9.2", sheet: "3.9.2_图3-3", expected: true },
      { item: "3.9.2", sheet: "3.9.2_图3-4", expected: true },

      // 表格命名模式
      { item: "3.8.2", sheet: "3.8.2_表格1", expected: true },
      { item: "3.8.2", sheet: "3.8.2_表格2", expected: true },
      { item: "3.9.2", sheet: "3.9.2_数据表", expected: true },

      // 原有测试用例
      { item: "2.5", sheet: "2.5_数据表", expected: true },
      { item: "2.5", sheet: "2.5_附加表", expected: true },
      { item: "4.5", sheet: "4.5.1_数据", expected: false }, // 不完全匹配
      { item: "1.1", sheet: "5.6_图表", expected: false },

      // 边界情况
      { item: "3.8.2", sheet: "3.8.2", expected: true }, // 无下划线
      { item: "3.8", sheet: "3.8_图1", expected: true }, // 两级编号
    ];

    const cases = testCases.length > 0 ? testCases : defaultTestCases;
    const results = [];

    console.log('🧪 开始一对多匹配逻辑测试（支持新命名模式）...');

    // 按item分组，测试一对多关系
    const itemGroups = {};
    cases.forEach(testCase => {
      if (!itemGroups[testCase.item]) {
        itemGroups[testCase.item] = [];
      }
      itemGroups[testCase.item].push(testCase);
    });

    Object.entries(itemGroups).forEach(([itemId, group]) => {
      console.log(`\n📋 测试标题号 "${itemId}" 的匹配:`);

      group.forEach((testCase, index) => {
        const { item, sheet, expected } = testCase;
        const sheetIdentifier = this.extractIdentifierFromSheetName(sheet);
        const actual = this.isIdentifierMatch(item, sheetIdentifier);
        const passed = actual === expected;

        results.push({
          index: results.length + 1,
          item,
          sheet,
          sheetIdentifier,
          expected,
          actual,
          passed
        });

        console.log(`  ${index + 1}. ${passed ? '✅ 通过' : '❌ 失败'} - "${sheet}" (提取: "${sheetIdentifier}")`);
      });
    });

    const passedCount = results.filter(r => r.passed).length;
    console.log(`\n🎯 测试完成: ${passedCount}/${cases.length} 通过`);

    return results;
  }

  // 新增：批量验证材料文件
  async validateMaterialsBatch(files) {
    console.log(`📁 开始批量验证材料文件，共 ${files.length} 个文件`);

    const results = {
      success: true,
      invalidFiles: [],
      summary: {
        total: files.length,
        valid: 0,
        invalid: 0
      }
    };

    for (const file of files) {
      // 修复：使用 this.determineFileType 确保方法调用正确
      const fileType = this.determineFileType(file);

      if (fileType === 'json') {
        try {
          const data = await this.readJsonFile(file);
          // 简单验证：检查必需的章节是否存在
          const hasRequiredSections = REQUIRED_SECTIONS.every(section => data[section] && data[section].length > 0);

          if (hasRequiredSections) {
            results.summary.valid++;
          } else {
            results.invalidFiles.push({ file, reason: '缺少必需的章节或数据' });
            results.summary.invalid++;
          }
        } catch (error) {
          results.invalidFiles.push({ file, reason: error.message });
          results.summary.invalid++;
        }
      } else if (fileType === 'excel') {
        // Excel 文件的验证逻辑（如检查表格结构）
        results.summary.valid++; // 暂时认为所有 Excel 文件都是有效的
      } else {
        results.invalidFiles.push({ file, reason: '未知文件类型' });
        results.summary.invalid++;
      }
    }

    console.log(`📊 验证完成: ${results.summary.valid} 个有效文件, ${results.summary.invalid} 个无效文件`);
    return results;
  }

  // 文件分类 - 修正版本，确保 determineFileType 可用
  classifyMaterialFiles(files) {
    const jsonFiles = [];
    const tableFiles = [];
    const chartFiles = [];
    const otherFiles = [];

    files.forEach(file => {
      const fileName = file.name.toLowerCase();
      // 修复：使用 this.determineFileType 确保方法调用正确
      const fileType = this.determineFileType(file);

      if (fileType === 'json') {
        // JSON文件：只有以"文本"开头的才是基础文本数据
        if (fileName.startsWith('文本')) {
          jsonFiles.push(file);
        } else {
          otherFiles.push(file);
        }
      } else if (fileType === 'excel') {
        // Excel文件分类规则：
        // 1. 以"表格"开头的是表格数据
        // 2. 其他Excel文件（如"GH1015.xlsx"）都是图表数据
        if (fileName.startsWith('表格')) {
          tableFiles.push(file);
        } else {
          // 默认Excel文件为图表数据（包括"GH1015.xlsx"等）
          chartFiles.push(file);
        }
      } else {
        otherFiles.push(file);
      }
    });

    return {
      jsonFiles,
      tableFiles,
      chartFiles,
      otherFiles,
      total: files.length
    };
  }

  // 修复：tubiao 方法的健壮性
  tubiao(jsonData, lineName) {
    if (!jsonData || jsonData.length < 2) {
      console.warn('⚠️ tubiao: 数据不足，需要至少2行数据');
      return [0, 0, []];
    }

    let keyList = [];

    // 与原始代码完全一致的逻辑
    jsonData.forEach((item, index) => {
      if (index === 1) { // 原始代码使用 index==1
        for (let key in item) {
          keyList.push(key);
        }
      }
    });

    if (keyList.length === 0) {
      console.warn('⚠️ tubiao: 未找到有效的列');
      return [0, 0, []];
    }

    let seriesData = [];
    keyList.forEach((item, index) => {
      let nameStr = "";

      // 与原始代码完全一致的命名逻辑
      if (item.indexOf("_") > 0) {
        nameStr = item.split('_')[0];
        seriesData.push({"name": nameStr, "type": "line", "smooth": "smooth", "data": []});
      } else {
        seriesData.push({"name": lineName + index, "type": "line", "smooth": "smooth", "data": []});
      }

      // 与原始代码完全一致的数据填充逻辑
      jsonData.forEach((self, num) => {
        for (let key in self) {
          if (item === key) {
            seriesData[index].data.push([self[key]]);
          }
        }
      });
    });

    let Data = [];
    seriesData.forEach((item, index) => {
      if (index % 2 === 0) {
        item.data.forEach((self, num) => {
          self[0] = parseFloat(self[0]).toFixed(4);
          if (seriesData[index + 1] && seriesData[index + 1].data[num]) {
            self.push(parseFloat(seriesData[index + 1].data[num][0]).toFixed(4));
          }
        });
        Data.push(item);
      }
    });

    let xArr = [], yArr = [];
    Data.forEach((self, key) => {
      Data[key].data.forEach((item) => {
        xArr.push(parseFloat(item[0]));
        yArr.push(parseFloat(item[1]));
      });
    });

    let xmin = xArr.length > 0 ? Math.min(...xArr) : 0;
    let ymin = yArr.length > 0 ? Math.min(...yArr) : 0;

    return [xmin, ymin, Data];
  }

  // 添加缺失的方法：验证方法使用情况
  validateMethodUsage() {
    const report = {
      coreMethodsCalled: true,
      unusedMethods: [],
      recommendations: [],
      timestamp: new Date().toISOString()
    };

    // 检查关键方法的存在性
    const keyMethods = [
      'validateMergeResults',
      'assignCombinedTableData',
      'assignCombinedChartData',
      'tubiao',
      'processThreeTypesDataIntegration',
      'collectTableMatches',
      'collectChartMatches'
    ];

    keyMethods.forEach(methodName => {
      if (typeof this[methodName] !== 'function') {
        report.unusedMethods.push(methodName);
        report.coreMethodsCalled = false;
      }
    });

    // 添加建议
    if (report.coreMethodsCalled) {
      report.recommendations.push('所有核心方法已正确加载');
    } else {
      report.recommendations.push('存在缺失的核心方法，请检查代码完整性');
    }

    console.log('📋 DataProcessor 方法验证完成:', {
      '核心方法状态': report.coreMethodsCalled ? '正常' : '异常',
      '缺失方法数': report.unusedMethods.length,
      '验证时间': report.timestamp
    });

    return report;
  }

  // 添加缺失的方法：智能数据结构合并
  mergeDataStructuresIntelligently(sourceData, targetData) {
    if (!sourceData || typeof sourceData !== 'object') {
      console.warn('⚠️ 源数据无效');
      return;
    }

    REQUIRED_SECTIONS.forEach(section => {
      if (sourceData[section] && Array.isArray(sourceData[section])) {
        targetData[section] = sourceData[section];
      }
    });

    console.log('✅ 数据结构合并完成');
  }

  // 添加缺失的方法：设置单个图表数据
  setSingleChartData(item, sheetData) {
    if (!item || !sheetData) return;

    item.seriesData = sheetData.data[2] || [];
    item.xAxisData = [];
    item.echartMsg = {
      echartId: sheetData.echartId,
      xName: "",
      yName: "",
      minX: sheetData.data[0] || 0,
      minY: sheetData.data[1] || 0
    };
  }

  // 添加缺失的方法：验证合并结果
  validateMergeResults(materialData) {
    const stats = {
      totalItems: 0,
      sectionsWithData: 0,
      itemsWithTables: 0,
      itemsWithCharts: 0
    };

    REQUIRED_SECTIONS.forEach(section => {
      if (materialData[section] && Array.isArray(materialData[section]) && materialData[section].length > 0) {
        stats.sectionsWithData++;
        stats.totalItems += materialData[section].length;

        materialData[section].forEach(item => {
          if (item.tableData && item.tableData.length > 0) {
            stats.itemsWithTables++;
          }
          if (item.seriesData && item.seriesData.length > 0) {
            stats.itemsWithCharts++;
          }
        });
      }
    });

    return stats;
  }

  // 添加缺失的方法：从名称中提取标识符
  extractIdentifierFromName(name) {
    if (!name) return null;

    // 匹配模式：数字.数字.数字 或 数字.数字
    const patterns = [
      /(\d+\.\d+\.\d+)/,  // 例如：3.8.2
      /(\d+\.\d+)/        // 例如：2.5
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  // 修复：从工作表名称中提取标识符 - 更严格的验证
  extractIdentifierFromSheetName(sheetName) {
    if (!sheetName) return null;

    // 处理新的命名模式：3.8.2_图3-1, 3.9.2_图3-4 等
    if (sheetName.includes('_')) {
      const beforeUnderscore = sheetName.split('_')[0];

      // 修复：更严格的验证前缀是否为有效的数字标识符
      if (this.isValidNumberIdentifier(beforeUnderscore)) {
        return beforeUnderscore;
      }
    }

    // 直接匹配数字模式（原有逻辑）- 更严格的模式匹配
    const patterns = [
      /^(\d+\.\d+\.\d+)$/,  // 严格匹配：3.8.2（完整匹配）
      /^(\d+\.\d+)$/        // 严格匹配：2.5（完整匹配）
    ];

    for (const pattern of patterns) {
      const match = sheetName.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // 修复：如果没有找到严格匹配，尝试从字符串中提取
    const extractPatterns = [
      /(\d+\.\d+\.\d+)/,  // 提取：3.8.2
      /(\d+\.\d+)/        // 提取：2.5
    ];

    for (const pattern of extractPatterns) {
      const match = sheetName.match(pattern);
      if (match) {
        // 验证提取的标识符是否完整且有效
        const extracted = match[1];
        if (this.isValidNumberIdentifier(extracted)) {
          return extracted;
        }
      }
    }

    return null; // 修复：如果没有找到有效标识符，返回 null 而不是原字符串
  }

  // 修复：更严格的数字标识符验证
  isValidNumberIdentifier(str) {
    if (!str) return false;

    // 匹配模式：数字.数字.数字 或 数字.数字（完整且严格）
    const patterns = [
      /^\d+\.\d+\.\d+$/,  // 例如：3.8.2（必须完整匹配）
      /^\d+\.\d+$/        // 例如：2.5（必须完整匹配）
    ];

    return patterns.some(pattern => pattern.test(str));
  }

  // 修复：更精确的标识符匹配逻辑
  isIdentifierMatch(itemIdentifier, sheetIdentifier) {
    if (!itemIdentifier || !sheetIdentifier) return false;

    // 修复：确保两个标识符都是有效的数字格式
    if (!this.isValidNumberIdentifier(itemIdentifier) || !this.isValidNumberIdentifier(sheetIdentifier)) {
      return false;
    }

    // 完全匹配（最优先）
    if (itemIdentifier === sheetIdentifier) {
      return true;
    }

    // 修复：移除前缀匹配，防止 "3.1" 匹配到 "3.8.2"
    // 只有在层级关系明确的情况下才允许前缀匹配
    return false;
  }

  // 新增：导出批量处理结果方法（移动到基类）
  async exportBatchResults(results, includeMenu = true, existingMenuUrl = null) {
    try {
      // 修复：改进 JSZip 导入方式
      let JSZip;
      try {
        // 尝试直接导入 JSZip
        const jsZipModule = await import('jszip');
        JSZip = jsZipModule.default || jsZipModule;
      } catch (importError) {
        // 如果动态导入失败，尝试全局 JSZip
        if (typeof window !== 'undefined' && window.JSZip) {
          JSZip = window.JSZip;
        } else {
          throw new Error('JSZip 库未正确加载');
        }
      }

      // 验证 JSZip 构造函数
      if (typeof JSZip !== 'function') {
        throw new Error('JSZip 不是一个有效的构造函数');
      }

      const zip = new JSZip();

      // 添加处理的材料数据文件
      Object.entries(results.processedMaterials).forEach(([materialCode, data]) => {
        const filename = `${materialCode}.json`;
        const content = JSON.stringify(data, null, 2);
        zip.file(filename, content);
      });

      // 生成并添加菜单文件（与现有菜单合并）
      if (includeMenu) {
        const menuResult = await this.generateMenuFromResults(results, existingMenuUrl);
        const menuContent = JSON.stringify(menuResult.menu, null, 2);
        zip.file('menu.json', menuContent);

        // 添加菜单更新报告
        const menuReport = this.generateMenuUpdateReport(menuResult.stats);
        zip.file('menu_update_report.txt', menuReport);
      }

      // 添加处理报告
      const report = this.generateBatchReport(results);
      zip.file('batch_processing_report.txt', report);

      // 添加材料清单
      const materialsList = this.generateMaterialsList(results);
      zip.file('materials_list.json', JSON.stringify(materialsList, null, 2));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      return zipBlob;

    } catch (error) {
      console.error('❌ 导出批量结果失败:', error);
      throw new Error(`导出失败: ${error.message}`);
    }
  }

  // 新增：生成批量处理报告方法（移动到基类）
  generateBatchReport(results) {
    const timestamp = new Date().toLocaleString('zh-CN');
    let report = `材料数据批量处理报告\n`;
    report += `生成时间: ${timestamp}\n`;
    report += `${'='.repeat(60)}\n\n`;

    // 统计信息
    report += `📊 处理统计:\n`;
    report += `   总材料数: ${results.summary.total}\n`;
    report += `   成功处理: ${results.summary.processed}\n`;
    report += `   处理失败: ${results.summary.failed}\n`;
    report += `   跳过处理: ${results.summary.skipped}\n`;
    report += `   成功率: ${((results.summary.processed / results.summary.total) * 100).toFixed(1)}%\n\n`;

    // 成功处理的材料
    if (results.summary.processed > 0) {
      report += `✅ 成功处理的材料 (${results.summary.processed}个):\n`;
      report += `${'─'.repeat(60)}\n`;

      Object.keys(results.processedMaterials).forEach(materialCode => {
        const dataItems = this.countDataItems ? this.countDataItems(results.processedMaterials[materialCode]) : 0;
        report += `   ${materialCode}: ${dataItems} 个数据项\n`;
      });
      report += `\n`;
    }

    report += `处理完成！\n`;
    return report;
  }

  // 新增：生成材料清单方法（移动到基类）
  generateMaterialsList(results) {
    return {
      timestamp: new Date().toISOString(),
      summary: results.summary,
      materials: Object.keys(results.processedMaterials).map(code => ({
        code,
        category: this.determineMaterialCategory ? this.determineMaterialCategory(code) : 1,
        dataItems: this.countDataItems ? this.countDataItems(results.processedMaterials[code]) : 0,
        status: 'processed'
      })),
      errors: results.errors || []
    };
  }

  // 新增：统计数据项数量方法（移动到基类）
  countDataItems(materialData) {
    let count = 0;
    REQUIRED_SECTIONS.forEach(section => {
      if (materialData[section] && Array.isArray(materialData[section])) {
        count += this.countItemsRecursively(materialData[section]);
      }
    });
    return count;
  }

  // 新增：递归统计项目数量方法（移动到基类）
  countItemsRecursively(items) {
    if (!Array.isArray(items)) return 0;

    let count = items.length;
    items.forEach(item => {
      if (item) {
        ['two', 'third'].forEach(prop => {
          if (item[prop] && Array.isArray(item[prop])) {
            count += this.countItemsRecursively(item[prop]);
          }
        });
      }
    });
    return count;
  }

  // 新增：确定材料类别方法（添加到基类）
  determineMaterialCategory(materialCode) {
    if (materialCode.startsWith('GH10') || materialCode.startsWith('GH11') ||
        materialCode.startsWith('GH30') || materialCode.startsWith('GH51') ||
        materialCode.startsWith('GH56')) {
      return 1; // 固溶强化型变形高温合金
    } else if (materialCode.startsWith('K')) {
      return 2; // 等轴晶铸造高温合金
    } else if (materialCode.startsWith('GH4')) {
      return 3; // 沉淀硬化型变形高温合金
    } else if (materialCode.startsWith('DZ')) {
      return 4; // 定向凝固柱晶高温合金
    } else if (materialCode.startsWith('DD')) {
      return 5; // 单晶高温合金
    } else if (materialCode.startsWith('FGH')) {
      return 6; // 粉末冶金高温合金
    }
    return 1; // 默认分类
  }

  // 新增：从结果生成菜单 - 支持与现有菜单合并
  async generateMenuFromResults(results, existingMenuUrl = null) {
    // 尝试获取现有菜单数据
    let existingMenu = null;
    if (existingMenuUrl) {
      try {
        const response = await fetch(existingMenuUrl);
        if (response.ok) {
          existingMenu = await response.json();
          console.log('✅ 成功加载现有菜单数据');
        }
      } catch (error) {
        console.warn('⚠️ 无法加载现有菜单数据，将创建新菜单:', error.message);
      }
    }

    // 使用现有菜单或创建默认菜单结构
    const menu = existingMenu || {
      code: 200,
      menu: [
        { "index": "1", "name": "固溶强化型变形高温合金", "list": [] },
        { "index": "2", "name": "等轴晶铸造高温合金", "list": [] },
        { "index": "3", "name": "沉淀硬化型变形高温合金", "list": [] },
        { "index": "4", "name": "定向凝固柱晶高温合金", "list": [] },
        { "index": "5", "name": "单晶高温合金", "list": [] },
        { "index": "6", "name": "粉末冶金高温合金", "list": [] }
      ]
    };

    let addedCount = 0;
    let updatedCount = 0;

    // 遍历新处理的材料并合并到菜单中
    Object.keys(results.processedMaterials).forEach((materialCode) => {
      const categoryIndex = this.determineMaterialCategory(materialCode);
      const targetCategory = menu.menu.find(cat => cat.index === categoryIndex.toString());

      if (targetCategory) {
        // 检查材料是否已存在
        const existingItem = targetCategory.list.find(item => item.name === materialCode);

        if (existingItem) {
          // 材料已存在，更新其信息
          const materialData = results.processedMaterials[materialCode];
          existingItem.key_component = this.extractKeyComponents(materialData);
          existingItem.key_craft = this.extractKeyCraft(materialData);
          existingItem.key_density = this.extractDensity(materialData);
          console.log(`🔄 更新现有材料: ${materialCode}`);
          updatedCount++;
        } else {
          // 材料不存在，添加新材料
          const newIndex = `${categoryIndex}-${targetCategory.list.length + 1}`;
          const materialData = results.processedMaterials[materialCode];
          const newMaterial = {
            index: newIndex,
            name: materialCode,
            key_component: this.extractKeyComponents(materialData),
            key_craft: this.extractKeyCraft(materialData),
            key_density: this.extractDensity(materialData)
          };

          targetCategory.list.push(newMaterial);
          console.log(`✅ 添加新材料: ${materialCode} -> ${targetCategory.name}`);
          addedCount++;
        }
      } else {
        console.warn(`⚠️ 未找到材料类别 ${categoryIndex} 对应的菜单项`);
      }
    });

    console.log(`📊 菜单更新完成: 新增 ${addedCount} 个材料, 更新 ${updatedCount} 个材料`);

    return {
      menu,
      stats: {
        added: addedCount,
        updated: updatedCount,
        total: addedCount + updatedCount
      }
    };
  }

  // 新增：从材料数据中提取关键成分
  extractKeyComponents(materialData) {
    const components = [];

    // 遍历材料的所有章节，寻找化学成分信息
    ['introduce', 'physicalChemistry'].forEach(section => {
      if (materialData[section] && Array.isArray(materialData[section])) {
        materialData[section].forEach(item => {
          if (item.name && item.name.includes('化学成分')) {
            // 从表格数据中提取成分信息
            if (item.tableData && Array.isArray(item.tableData)) {
              item.tableData.forEach(row => {
                Object.keys(row).forEach(key => {
                  // 检查是否为常见的化学元素符号
                  if (this.isChemicalElement(key) && !components.includes(key)) {
                    components.push(key);
                  }
                });
              });
            }
          }
        });
      }
    });

    return components.slice(0, 10); // 限制返回前10个主要成分
  }

  // 新增：从材料数据中提取关键工艺
  extractKeyCraft(materialData) {
    const crafts = [];

    // 遍历所有章节寻找工艺信息，特别是介绍章节
    ['introduce', 'craft'].forEach(section => {
      if (materialData[section] && Array.isArray(materialData[section])) {
        materialData[section].forEach(item => {
          if (item.name && (item.name.includes('熔炼') || item.name.includes('工艺') || item.name.includes('制备'))) {
            // 从文本内容中提取工艺类型
            if (item.con) {
              const craftTypes = this.inferCraftTypes(item.con);
              crafts.push(...craftTypes);
            }
          }
        });
      }
    });

    return [...new Set(crafts)]; // 去重
  }

  // 修复：从文本中推断工艺类型 - 改进的解析逻辑
  inferCraftTypes(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const detectedCrafts = [];

    // 工艺映射表（与您的旧代码保持一致）
    const craftMap = {
      '电弧炉': 1,
      '电渣重熔': 2,
      '真空电弧重熔': 3,
      '非真空感应炉': 4,
      '真空感应炉': 5,
      '真空双联熔炼': 6,
      '真空自耗重熔': [7, 12, 14],
      '电弧炉+真空自耗重熔': 7,
      '电弧炉+电渣重熔': 8,
      '电弧炉+真空电弧重熔': 9,
      '非真空感应炉+真空电弧重熔': 10,
      '非真空感应炉+电渣重熔': 11,
      '非真空感应炉+真空自耗': 12,
      '真空感应炉+电渣重熔': 13,
      '真空感应炉+真空自耗': 14
    };

    // 修复：参考旧代码的解析逻辑
    // 先处理文本，移除开头的"采用"和结尾的"熔炼工艺。"
    let processedText = text;
    if (processedText.startsWith('采用')) {
      processedText = processedText.substring(2);
    }
    if (processedText.endsWith('熔炼工艺。')) {
      processedText = processedText.substring(0, processedText.length - 5);
    }
    if (processedText.endsWith('工艺。')) {
      processedText = processedText.substring(0, processedText.length - 3);
    }

    // 按照"、或"分割，这是旧代码中的逻辑
    const craftDescriptions = processedText.split(/、或|或者|或/);

    // 遍历每个工艺描述
    craftDescriptions.forEach(description => {
      const trimmedDesc = description.trim();

      // 直接匹配完整的工艺名称
      Object.keys(craftMap).forEach(craftName => {
        if (trimmedDesc.includes(craftName)) {
          const craftValue = craftMap[craftName];
          if (Array.isArray(craftValue)) {
            detectedCrafts.push(...craftValue);
          } else {
            detectedCrafts.push(craftValue);
          }
        }
      });
    });

    // 如果没有检测到具体工艺，尝试单独匹配基础工艺
    if (detectedCrafts.length === 0) {
      const basicCrafts = ['电弧炉', '电渣重熔', '真空电弧重熔', '非真空感应炉', '真空感应炉', '真空双联熔炼', '真空自耗重熔'];

      basicCrafts.forEach(craftName => {
        if (text.includes(craftName)) {
          const craftValue = craftMap[craftName];
          if (Array.isArray(craftValue)) {
            detectedCrafts.push(...craftValue);
          } else {
            detectedCrafts.push(craftValue);
          }
        }
      });
    }

    return [...new Set(detectedCrafts)]; // 去重
  }

  // 新增：专门用于测试工艺提取的方法
  testCraftExtraction() {
    const testCases = [
      {
        text: "采用非真空感应炉+电渣重熔、或电弧炉+电渣重熔熔炼工艺。",
        expected: [11, 8]
      },
      {
        text: "采用真空感应炉+真空自耗重熔工艺。",
        expected: [14]
      },
      {
        text: "电弧炉熔炼",
        expected: [1]
      },
      {
        text: "真空感应炉熔炼",
        expected: [5]
      },
      {
        text: "采用真空双联熔炼工艺。",
        expected: [6]
      }
    ];

    console.log('🧪 开始工艺提取测试...');

    testCases.forEach((testCase, index) => {
      const result = this.inferCraftTypes(testCase.text);
      const passed = JSON.stringify(result.sort()) === JSON.stringify(testCase.expected.sort());

      console.log(`${index + 1}. ${passed ? '✅ 通过' : '❌ 失败'}`);
      console.log(`   文本: "${testCase.text}"`);
      console.log(`   期望: [${testCase.expected.join(', ')}]`);
      console.log(`   结果: [${result.join(', ')}]`);
      console.log('');
    });
  }

  // 新增：从材料数据中提取密度
  extractDensity(materialData) {
    // 遍历物理化学性能章节，寻找密度信息
    if (materialData.physicalChemistry && Array.isArray(materialData.physicalChemistry)) {
      for (const item of materialData.physicalChemistry) {
        if (item.name && item.name.includes('密度')) {
          // 从表格数据中查找密度值
          if (item.tableData && Array.isArray(item.tableData)) {
            for (const row of item.tableData) {
              for (const [key, value] of Object.entries(row)) {
                if (key.includes('密度') || key.includes('ρ')) {
                  const density = parseFloat(value);
                  if (!isNaN(density) && density > 0) {
                    return density;
                  }
                }
              }
            }
          }

          // 从文本描述中提取密度
          if (item.con) {
            const densityMatch = item.con.match(/(\d+\.?\d*)\s*g\/cm³/);
            if (densityMatch) {
              return parseFloat(densityMatch[1]);
            }
          }
        }
      }
    }

    return 0; // 默认值
  }

  // 新增：判断是否为化学元素符号
  isChemicalElement(symbol) {
    const commonElements = [
      'C', 'Cr', 'Ni', 'W', 'Mo', 'Fe', 'Nb', 'B', 'Ce', 'Mn', 'Si', 'P', 'S',
      'Cu', 'V', 'N', 'Al', 'Ti', 'Co', 'Sn', 'Pb', 'Zr', 'La', 'Sb', 'As',
      'Bi', 'Ta', 'Se', 'Ag', 'Mg', 'Hf', 'Ga', 'In', 'Te', 'Tl', 'Zn', 'Cd'
    ];
    return commonElements.includes(symbol);
  }

  // 新增：生成菜单更新报告
  generateMenuUpdateReport(stats) {
    const timestamp = new Date().toLocaleString('zh-CN');
    let report = `菜单更新报告\n`;
    report += `生成时间: ${timestamp}\n`;
    report += `${'='.repeat(40)}\n\n`;

    report += `📊 更新统计:\n`;
    report += `   新增材料: ${stats.added}\n`;
    report += `   更新材料: ${stats.updated}\n`;
    report += `   总计处理: ${stats.total}\n\n`;

    if (stats.added > 0) {
      report += `✅ 新增材料已添加到对应类别菜单中\n`;
    }

    if (stats.updated > 0) {
      report += `🔄 现有材料信息已更新\n`;
    }

    report += `\n建议: 请将生成的 menu.json 文件替换到服务器上的菜单文件\n`;

    return report;
  }

  // 新增：生成字符串哈希
  generateHashFromString(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString();
  }

  // 新增：添加文件类型判断方法到基类
  determineFileType(file) {
    if (!file || !file.name) return 'unknown';

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.json')) {
      return 'json';
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return 'excel';
    }
    return 'unknown';
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

  setUploadedFiles(files) {
    this.uploadedFiles = files || [];
  }

  clearUploadedFiles() {
    this.uploadedFiles = [];
  }

  // 提取材料编号 - 增强版本
  extractMaterialCodeFromFileName(fileName) {
    const patterns = [
      /([A-Z]{1,3}\d{3,4}[A-Z]?)/i,
      /([A-Z]{2}\d{3,4})/i,
      /(FGH\d{4})/i,
      /(GH\d{4}[A-Z]?)/i,
      /(DD\d{3,4})/i,
      /(DZ\d{3,4}[A-Z]?)/i,
      /(K\d{3,4}[A-Z]?)/i,
      /(\d+_[A-Z]{1,3}\d{3,4}[A-Z]?)/i  // 支持 "19_K423" 格式
    ];

    for (const pattern of patterns) {
      const match = fileName.match(pattern);
      if (match) {
        let code = match[1].toUpperCase();
        // 处理带前缀数字的格式，提取实际材料编号
        if (code.includes('_')) {
          code = code.split('_')[1];
        }
        return code;
      }
    }

    return null;
  }

  // 修复：重写 determineFileType 方法确保可用性
  determineFileType(file) {
    if (!file || !file.name) return 'unknown';

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.json')) {
      return 'json';
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return 'excel';
    }
    return 'unknown';
  }

  // 新增：批量分析文件夹内容
  analyzeFolderContents(files) {
    console.log(`📁 开始分析文件夹内容，共 ${files.length} 个文件`);

    const materialsMap = new Map();
    const unrecognizedFiles = [];
    const statistics = {
      totalFiles: files.length,
      recognizedFiles: 0,
      materials: new Set(),
      fileTypes: {
        json: 0,
        excel: 0,
        unknown: 0
      }
    };

    files.forEach(file => {
      const materialCode = this.extractMaterialCodeFromFileName(file.name);
      // 修复：使用 this.determineFileType 确保方法调用正确
      const fileType = this.determineFileType(file);

      statistics.fileTypes[fileType]++;

      if (materialCode) {
        statistics.recognizedFiles++;
        statistics.materials.add(materialCode);

        if (!materialsMap.has(materialCode)) {
          materialsMap.set(materialCode, {
            code: materialCode,
            files: [],
            hasJson: false,
            hasTableExcel: false,
            hasChartExcel: false,
            ready: false
          });
        }

        const material = materialsMap.get(materialCode);
        material.files.push(file);

        // 分类文件类型
        if (fileType === 'json') {
          material.hasJson = true;
        } else if (fileType === 'excel') {
          const fileName = file.name.toLowerCase();
          if (fileName.includes('图形') || fileName.includes('图表') || fileName.includes('chart')) {
            material.hasChartExcel = true;
          } else if (fileName.includes('表格') || fileName.includes('table') || fileName.includes('数据')) {
            material.hasTableExcel = true;
          } else {
            // 默认当作表格文件
            material.hasTableExcel = true;
          }
        }

        // 检查是否准备就绪（至少有JSON基础文件）
        material.ready = material.hasJson;
      } else {
        unrecognizedFiles.push(file);
      }
    });

    const result = {
      materials: Array.from(materialsMap.values()),
      materialsMap,
      unrecognizedFiles,
      statistics: {
        ...statistics,
        materials: Array.from(statistics.materials),
        materialsCount: statistics.materials.size,
        readyMaterials: Array.from(materialsMap.values()).filter(m => m.ready).length
      }
    };

    console.log(`📊 分析完成: ${result.statistics.materialsCount} 种材料, ${result.statistics.readyMaterials} 种可处理`);
    return result;
  }

  // 修复：重写 validateMaterialsBatch 方法确保 determineFileType 可用
  async validateMaterialsBatch(files) {
    console.log(`📁 开始批量验证材料文件，共 ${files.length} 个文件`);

    const results = {
      success: true,
      invalidFiles: [],
      summary: {
        total: files.length,
        valid: 0,
        invalid: 0
      }
    };

    for (const file of files) {
      // 修复：使用 this.determineFileType 确保方法调用正确
      const fileType = this.determineFileType(file);

      if (fileType === 'json') {
        try {
          const data = await this.readJsonFile(file);
          // 简单验证：检查必需的章节是否存在
          const hasRequiredSections = REQUIRED_SECTIONS.every(section => data[section] && data[section].length > 0);

          if (hasRequiredSections) {
            results.summary.valid++;
          } else {
            results.invalidFiles.push({ file, reason: '缺少必需的章节或数据' });
            results.summary.invalid++;
          }
        } catch (error) {
          results.invalidFiles.push({ file, reason: error.message });
          results.summary.invalid++;
        }
      } else if (fileType === 'excel') {
        // Excel 文件的验证逻辑（如检查表格结构）
        results.summary.valid++; // 暂时认为所有 Excel 文件都是有效的
      } else {
        results.invalidFiles.push({ file, reason: '未知文件类型' });
        results.summary.invalid++;
      }
    }

    console.log(`📊 验证完成: ${results.summary.valid} 个有效文件, ${results.summary.invalid} 个无效文件`);
    return results;
  }

  // 文件分类 - 修正版本，确保 determineFileType 可用
  classifyMaterialFiles(files) {
    const jsonFiles = [];
    const tableFiles = [];
    const chartFiles = [];
    const otherFiles = [];

    files.forEach(file => {
      const fileName = file.name.toLowerCase();
      // 修复：使用 this.determineFileType 确保方法调用正确
      const fileType = this.determineFileType(file);

      if (fileType === 'json') {
        // JSON文件：只有以"文本"开头的才是基础文本数据
        if (fileName.startsWith('文本')) {
          jsonFiles.push(file);
        } else {
          otherFiles.push(file);
        }
      } else if (fileType === 'excel') {
        // Excel文件分类规则：
        // 1. 以"表格"开头的是表格数据
        // 2. 其他Excel文件（如"GH1015.xlsx"）都是图表数据
        if (fileName.startsWith('表格')) {
          tableFiles.push(file);
        } else {
          // 默认Excel文件为图表数据（包括"GH1015.xlsx"等）
          chartFiles.push(file);
        }
      } else {
        otherFiles.push(file);
      }
    });

    return {
      jsonFiles,
      tableFiles,
      chartFiles,
      otherFiles,
      total: files.length
    };
  }

  // 检查是否有有效数据
  hasValidData(data) {
    return REQUIRED_SECTIONS.some(section =>
      data[section] && Array.isArray(data[section]) && data[section].length > 0
    );
  }

  // 新增：统计数据项数量
  countDataItems(materialData) {
    let count = 0;
    REQUIRED_SECTIONS.forEach(section => {
      if (materialData[section] && Array.isArray(materialData[section])) {
        count += this.countItemsRecursively(materialData[section]);
      }
    });
    return count;
  }

  // 新增：递归统计项目数量
  countItemsRecursively(items) {
    if (!Array.isArray(items)) return 0;

    let count = items.length;
    items.forEach(item => {
      if (item) {
        ['two', 'third'].forEach(prop => {
          if (item[prop] && Array.isArray(item[prop])) {
            count += this.countItemsRecursively(item[prop]);
          }
        });
      }
    });
    return count;
  }

  // 新增：生成材料清单
  generateMaterialsList(results) {
    return {
      timestamp: new Date().toISOString(),
      summary: results.summary,
      materials: Object.keys(results.processedMaterials).map(code => ({
        code,
        category: this.determineMaterialCategory(code),
        dataItems: this.countDataItems(results.processedMaterials[code]),
        status: 'processed'
      })),
      errors: results.errors || []
    };
  }

  // 新增：生成处理报告
  generateBatchReport(results) {
    const timestamp = new Date().toLocaleString('zh-CN');
    let report = `材料数据批量处理报告\n`;
    report += `生成时间: ${timestamp}\n`;
    report += `${'='.repeat(60)}\n\n`;

    // 统计信息
    report += `📊 处理统计:\n`;
    report += `   总材料数: ${results.summary.total}\n`;
    report += `   成功处理: ${results.summary.processed}\n`;
    report += `   处理失败: ${results.summary.failed}\n`;
    report += `   跳过处理: ${results.summary.skipped}\n`;
    report += `   成功率: ${((results.summary.processed / results.summary.total) * 100).toFixed(1)}%\n\n`;

    // 成功处理的材料
    if (results.summary.processed > 0) {
      report += `✅ 成功处理的材料 (${results.summary.processed}个):\n`;
      report += `${'─'.repeat(60)}\n`;

      Object.keys(results.processedMaterials).forEach(materialCode => {
        const dataItems = this.countDataItems ? this.countDataItems(results.processedMaterials[materialCode]) : 0;
        report += `   ${materialCode}: ${dataItems} 个数据项\n`;
      });
      report += `\n`;
    }

    report += `处理完成！\n`;
    return report;
  }

  // 新增：批量处理所有材料
  async processBatchMaterials(files, progressCallback = null) {
    console.log(`🚀 开始批量处理材料数据...`);

    const analysis = this.analyzeFolderContents(files);
    const { materials } = analysis;

    if (materials.length === 0) {
      return {
        success: false,
        message: '未检测到有效的材料文件',
        summary: { total: 0, processed: 0, failed: 0, skipped: 0 },
        processedMaterials: {}
      };
    }

    const results = {
      success: true,
      processedMaterials: {},
      summary: {
        total: materials.length,
        processed: 0,
        failed: 0,
        skipped: 0
      }
    };

    // 处理每个材料
    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];

      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: materials.length,
          progress: Math.round(((i + 1) / materials.length) * 100),
          currentMaterial: material.code
        });
      }

      try {
        console.log(`\n🔄 处理材料 ${i + 1}/${materials.length}: ${material.code}`);

        // 如果没有JSON文件就跳过
        if (!material.hasJson) {
          console.warn(`⚠️ 材料 ${material.code} 缺少JSON文件，跳过处理`);
          results.summary.skipped++;
          continue;
        }

        const materialData = await this.processSingleMaterialWithThreeTypes(material.code, material.files);

        if (this.hasValidData(materialData)) {
          results.processedMaterials[material.code] = materialData;
          results.summary.processed++;
          console.log(`✅ 材料 ${material.code} 处理成功`);
        } else {
          results.summary.failed++;
          console.warn(`⚠️ 材料 ${material.code} 处理后没有有效数据`);
        }

      } catch (error) {
        console.error(`❌ 材料 ${material.code} 处理失败:`, error);
        results.summary.failed++;
      }
    }

    console.log(`\n📊 批量处理完成: 成功 ${results.summary.processed}, 失败 ${results.summary.failed}, 跳过 ${results.summary.skipped}`);
    return results;
  }

  // 新增：处理单个材料的三类数据
  async processSingleMaterialWithThreeTypes(materialCode, files) {
    console.log(`📁 处理材料 ${materialCode}，文件数量: ${files.length}`);

    // 分类文件
    const fileClassification = this.classifyMaterialFiles(files);

    console.log(`📂 文件分类: JSON(${fileClassification.jsonFiles.length}) 表格(${fileClassification.tableFiles.length}) 图表(${fileClassification.chartFiles.length})`);

    // 使用继承的三类数据整合方法
    const materialData = await this.processThreeTypesDataIntegration(
      fileClassification.jsonFiles[0] || null,
      fileClassification.tableFiles[0] || null,
      fileClassification.chartFiles[0] || null
    );

    return materialData;
  }
}
