import * as XLSX from 'xlsx';
import axios from 'axios';

const REQUIRED_SECTIONS = ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'];

/**
 * 通用数据处理工具类
 */
export class DataProcessor {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.usedSheets = new Set();
    this.matchingLog = []; // 新增：匹配日志
    this.strictMode = true; // 新增：严格模式标志
  }

  // 基础数据结构操作
  createBaseJsonStructure() {
    return Object.fromEntries(REQUIRED_SECTIONS.map(section => [section, []]));
  }

  isEmptyJsonStructure(data) {
    return REQUIRED_SECTIONS.every(section =>
      !data[section] || (Array.isArray(data[section]) && data[section].length === 0)
    );
  }

  validateJsonStructure(data) {
    const errors = [];
    REQUIRED_SECTIONS.forEach(section => {
      if (!data[section]) {
        errors.push(`缺少必需的顶级部分: ${section}`);
      } else if (!Array.isArray(data[section])) {
        errors.push(`${section}部分不是数组格式`);
      }
    });
    return { isValid: errors.length === 0, errors };
  }

  // 修复：确保数据结构但绝不添加默认内容
  ensureRequiredSections(data) {
    REQUIRED_SECTIONS.forEach(section => {
      if (!data[section]) {
        data[section] = []; // 只创建空数组结构，绝不添加内容
      }
    });
  }

  // 修复：更新文本数据时采用严格匹配
  updateAllTextData(textData, targetData) {
    if (!textData || !targetData) return;

    console.log('开始严格模式文本数据更新...');

    // 确保目标数据有必需的部分结构，但绝不添加内容
    this.ensureRequiredSections(targetData);

    // 处理每个顶级部分
    REQUIRED_SECTIONS.forEach(section => {
      if (textData[section] && Array.isArray(textData[section]) && textData[section].length > 0) {
        if (!targetData[section] || targetData[section].length === 0) {
          // 深拷贝以避免引用问题
          targetData[section] = this.deepClone(textData[section]);
          console.log(`✓ 新增部分: ${section} (${textData[section].length} 项)`);
        } else {
          // 使用严格匹配合并
          this.mergeTextDataSectionStrict(textData[section], targetData[section], section);
        }
      }
    });

    console.log('严格模式文本数据更新完成');
  }

  // 新增：严格的文本数据部分合并
  mergeTextDataSectionStrict(sourceSection, targetSection, sectionName) {
    console.log(`\n--- 严格合并部分: ${sectionName} ---`);

    let mergedCount = 0;
    let addedCount = 0;
    let skippedCount = 0;

    sourceSection.forEach((sourceItem, index) => {
      if (!this.isValidDataItem(sourceItem)) {
        console.log(`⚠ 跳过无效源项目 ${index}: 缺少必要字段`);
        skippedCount++;
        return;
      }

      const matchResult = this.findStrictMatch(sourceItem, targetSection);

      if (matchResult.exactMatch) {
        // 严格合并匹配项
        this.mergeItemsStrict(sourceItem, matchResult.exactMatch, matchResult.confidence);
        mergedCount++;
      } else if (matchResult.possibleMatch && matchResult.confidence > 0.8) {
        // 高置信度合并
        console.log(`🔍 高置信度匹配 (${matchResult.confidence.toFixed(2)}): "${sourceItem.name}" -> "${matchResult.possibleMatch.name}"`);
        this.mergeItemsStrict(sourceItem, matchResult.possibleMatch, matchResult.confidence);
        mergedCount++;
      } else {
        // 添加新项目
        const clonedItem = this.deepClone(sourceItem);
        targetSection.push(clonedItem);
        console.log(`✓ 新增项目: "${sourceItem.name}"`);
        addedCount++;
      }
    });

    console.log(`合并结果: ${mergedCount} 个合并, ${addedCount} 个新增, ${skippedCount} 个跳过`);
  }

  // 新增：验证数据项有效性
  isValidDataItem(item) {
    if (!item || typeof item !== 'object') return false;

    // 必须有名称
    if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
      return false;
    }

    // 至少要有一种数据类型
    const hasContent = !!(item.con && item.con.trim());
    const hasTable = !!(item.tableData && Array.isArray(item.tableData) && item.tableData.length > 0);
    const hasChart = !!(item.seriesData && Array.isArray(item.seriesData) && item.seriesData.length > 0);
    const hasSubItems = !!(
      (item.two && Array.isArray(item.two) && item.two.length > 0) ||
      (item.third && Array.isArray(item.third) && item.third.length > 0) ||
      (item.fourth && Array.isArray(item.fourth) && item.fourth.length > 0)
    );

    return hasContent || hasTable || hasChart || hasSubItems;
  }

  // 新增：严格匹配查找
  findStrictMatch(sourceItem, targetArray) {
    const sourceName = this.normalizeItemName(sourceItem.name);
    let exactMatch = null;
    let possibleMatch = null;
    let maxConfidence = 0;

    for (const targetItem of targetArray) {
      if (!this.isValidDataItem(targetItem)) continue;

      const targetName = this.normalizeItemName(targetItem.name);
      const confidence = this.calculateMatchConfidence(sourceName, targetName, sourceItem, targetItem);

      if (confidence === 1.0) {
        exactMatch = targetItem;
        break;
      } else if (confidence > maxConfidence) {
        maxConfidence = confidence;
        possibleMatch = targetItem;
      }
    }

    return {
      exactMatch,
      possibleMatch: maxConfidence > 0.6 ? possibleMatch : null,
      confidence: exactMatch ? 1.0 : maxConfidence
    };
  }

  // 新增：标准化项目名称
  normalizeItemName(name) {
    if (!name) return '';

    return name
      .trim()
      .toLowerCase()
      .replace(/^\d+(\.\d+)*[、，,．]\s*/, '') // 移除编号前缀
      .replace(/[，、。！？；：""''（）【】「」\s]/g, '') // 秼除标点和空格
      .replace(/第[一二三四五六七八九十]+[章节部分]/, '') // 移除章节标识
      .trim();
  }

  // 新增：计算匹配置信度
  calculateMatchConfidence(sourceName, targetName, sourceItem, targetItem) {
    if (!sourceName || !targetName) return 0;

    let confidence = 0;

    // 1. 名称完全匹配 (40%)
    if (sourceName === targetName) {
      confidence += 0.4;
    } else {
      // 相似度匹配
      const similarity = this.calculateStringSimilarity(sourceName, targetName);
      confidence += similarity * 0.4;
    }

    // 2. 数据类型匹配 (30%)
    const typeScore = this.calculateDataTypeMatch(sourceItem, targetItem);
    confidence += typeScore * 0.3;

    // 3. 内容相似度 (20%)
    const contentScore = this.calculateContentSimilarity(sourceItem, targetItem);
    confidence += contentScore * 0.2;

    // 4. 结构相似度 (10%)
    const structureScore = this.calculateStructureSimilarity(sourceItem, targetItem);
    confidence += structureScore * 0.1;

    return Math.min(confidence, 1.0);
  }

  // 新增：计算字符串相似度
  calculateStringSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    // 使用编辑距离算法
    const editDistance = this.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // 新增：计算编辑距离
  calculateEditDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator  // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // 新增：计算数据类型匹配度
  calculateDataTypeMatch(sourceItem, targetItem) {
    let score = 0;
    let totalChecks = 0;

    // 检查内容文本
    const sourceHasContent = !!(sourceItem.con && sourceItem.con.trim());
    const targetHasContent = !!(targetItem.con && targetItem.con.trim());
    if (sourceHasContent === targetHasContent) score += 1;
    totalChecks += 1;

    // 检查表格数据
    const sourceHasTable = !!(sourceItem.tableData && sourceItem.tableData.length > 0);
    const targetHasTable = !!(targetItem.tableData && targetItem.tableData.length > 0);
    if (sourceHasTable === targetHasTable) score += 1;
    totalChecks += 1;

    // 检查图表数据
    const sourceHasChart = !!(sourceItem.seriesData && sourceItem.seriesData.length > 0);
    const targetHasChart = !!(targetItem.seriesData && targetItem.seriesData.length > 0);
    if (sourceHasChart === targetHasChart) score += 1;
    totalChecks += 1;

    return totalChecks > 0 ? score / totalChecks : 0;
  }

  // 新增：计算内容相似度
  calculateContentSimilarity(sourceItem, targetItem) {
    const sourceCon = (sourceItem.con || '').trim();
    const targetCon = (targetItem.con || '').trim();

    if (!sourceCon && !targetCon) return 1; // 都没有内容
    if (!sourceCon || !targetCon) return 0; // 只有一个有内容

    // 提取关键词进行比较
    const sourceKeywords = this.extractContentKeywords(sourceCon);
    const targetKeywords = this.extractContentKeywords(targetCon);

    if (sourceKeywords.length === 0 && targetKeywords.length === 0) return 0.5;

    const commonKeywords = sourceKeywords.filter(kw => targetKeywords.includes(kw));
    const totalKeywords = new Set([...sourceKeywords, ...targetKeywords]).size;

    return totalKeywords > 0 ? (commonKeywords.length * 2) / (sourceKeywords.length + targetKeywords.length) : 0;
  }

  // 新增：提取内容关键词
  extractContentKeywords(content) {
    if (!content) return [];

    return content
      .replace(/[，、。！？；：""''（）【】「」]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && word.length < 10)
      .slice(0, 20); // 取前20个关键词
  }

  // 新增：计算结构相似度
  calculateStructureSimilarity(sourceItem, targetItem) {
    let score = 0;
    let totalChecks = 0;

    const structureProps = ['two', 'third', 'fourth'];

    structureProps.forEach(prop => {
      const sourceHasProp = !!(sourceItem[prop] && Array.isArray(sourceItem[prop]) && sourceItem[prop].length > 0);
      const targetHasProp = !!(targetItem[prop] && Array.isArray(targetItem[prop]) && targetItem[prop].length > 0);

      if (sourceHasProp === targetHasProp) score += 1;
      totalChecks += 1;
    });

    return totalChecks > 0 ? score / totalChecks : 0;
  }

  // 新增：严格合并项目
  mergeItemsStrict(sourceItem, targetItem, confidence) {
    console.log(`🔄 严格合并项目 (置信度: ${confidence.toFixed(2)}): "${sourceItem.name}" -> "${targetItem.name}"`);

    // 只合并高质量的数据
    if (confidence >= 0.9) {
      // 高置信度：可以覆盖现有数据
      if (sourceItem.con && sourceItem.con.trim() && sourceItem.con.length > (targetItem.con || '').length) {
        targetItem.con = sourceItem.con;
        console.log(`  ✓ 更新内容文本 (更详细)`);
      }

      if (sourceItem.tableData && sourceItem.tableData.length > 0) {
        if (!targetItem.tableData || targetItem.tableData.length === 0) {
          targetItem.tableData = this.deepClone(sourceItem.tableData);
          targetItem.tableColumns = this.deepClone(sourceItem.tableColumns);
          console.log(`  ✓ 添加表格数据`);
        } else {
          console.log(`  ⚠ 保留现有表格数据 (避免覆盖)`);
        }
      }

      if (sourceItem.seriesData && sourceItem.seriesData.length > 0) {
        if (!targetItem.seriesData || targetItem.seriesData.length === 0) {
          targetItem.seriesData = this.deepClone(sourceItem.seriesData);
          targetItem.xAxisData = this.deepClone(sourceItem.xAxisData);
          targetItem.echartMsg = this.deepClone(sourceItem.echartMsg);
          console.log(`  ✓ 添加图表数据`);
        } else {
          console.log(`  ⚠ 保留现有图表数据 (避免覆盖)`);
        }
      }
    } else {
      // 中等置信度：只添加缺失的数据
      if (sourceItem.con && sourceItem.con.trim() && !targetItem.con) {
        targetItem.con = sourceItem.con;
        console.log(`  ✓ 添加缺失的内容文本`);
      }

      if (sourceItem.tableData && sourceItem.tableData.length > 0 &&
          (!targetItem.tableData || targetItem.tableData.length === 0)) {
        targetItem.tableData = this.deepClone(sourceItem.tableData);
        targetItem.tableColumns = this.deepClone(sourceItem.tableColumns);
        console.log(`  ✓ 添加缺失的表格数据`);
      }

      if (sourceItem.seriesData && sourceItem.seriesData.length > 0 &&
          (!targetItem.seriesData || targetItem.seriesData.length === 0)) {
        targetItem.seriesData = this.deepClone(sourceItem.seriesData);
        targetItem.xAxisData = this.deepClone(sourceItem.xAxisData);
        targetItem.echartMsg = this.deepClone(sourceItem.echartMsg);
        console.log(`  ✓ 添加缺失的图表数据`);
      }
    }

    // 严格合并子级数据
    this.mergeSubItemsStrict(sourceItem, targetItem, confidence);
  }

  // 新增：严格合并子项目
  mergeSubItemsStrict(sourceItem, targetItem, confidence) {
    const subProps = ['two', 'third', 'fourth'];

    subProps.forEach(prop => {
      if (sourceItem[prop] && Array.isArray(sourceItem[prop]) && sourceItem[prop].length > 0) {
        if (!targetItem[prop] || !Array.isArray(targetItem[prop])) {
          targetItem[prop] = [];
        }

        // 递归严格合并子项目
        this.mergeTextDataSectionStrict(sourceItem[prop], targetItem[prop], `${prop}级数据`);
      }
    });
  }

  // 新增：深度克隆对象
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  }

  // 修复：更严格的Sheet匹配 - 提高匹配阈值
  findMatchingSheet(itemName, sheetNames) {
    if (!itemName || !sheetNames || sheetNames.length === 0) {
      console.log(`❌ 输入参数无效: itemName="${itemName}", sheetNames=${sheetNames}`);
      return null;
    }

    console.log(`\n🔍 严格Sheet匹配:`);
    console.log(`   原始项目名: "${itemName}"`);
    console.log(`   可用Sheet列表: [${sheetNames.join(', ')}]`);

    // 1. 优先进行精确数字模式匹配
    const numberPatterns = this.extractNumberPatterns(itemName);
    console.log(`   🔢 提取的数字模式: [${numberPatterns.join(', ')}]`);

    if (numberPatterns.length > 0) {
      // 只进行精确匹配，不进行模糊匹配
      for (const pattern of numberPatterns) {
        const matchingSheet = sheetNames.find(sheetName => {
          if (!sheetName) return false;
          const sheetStr = sheetName.toString().trim();

          // 严格精确匹配
          if (sheetStr === pattern) {
            console.log(`   ✅ 精确数字匹配: "${sheetStr}" === "${pattern}"`);
            return true;
          }

          return false;
        });

        if (matchingSheet) {
          return matchingSheet;
        }
      }
    }

    // 2. 严格的文本匹配
    const cleanItemName = this.normalizeItemName(itemName);
    console.log(`   📝 标准化名称: "${cleanItemName}"`);

    // 只进行高置信度匹配
    for (const sheetName of sheetNames) {
      if (!sheetName) continue;

      const cleanSheetName = this.normalizeItemName(sheetName.toString());
      const similarity = this.calculateStringSimilarity(cleanItemName, cleanSheetName);

      // 提高匹配阈值到0.85
      if (similarity >= 0.85) {
        console.log(`   ✅ 高相似度匹配 (${similarity.toFixed(2)}): "${sheetName}" <-> "${itemName}"`);
        return sheetName;
      }
    }

    console.log(`   ❌ 未找到符合严格匹配条件的Sheet (阈值: 0.85)`);
    return null;
  }

  // 修复：更严格的数据验证
  validateAndProcessSheet(item, sheetName, workbook, dataType) {
    try {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        console.warn(`❌ Sheet ${sheetName} 不存在`);
        return false;
      }

      // 验证Sheet有效性
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const rows = range.e.r - range.s.r + 1;
      const cols = range.e.c - range.s.c + 1;

      if (rows < 2 || cols < 1) {
        console.warn(`❌ Sheet ${sheetName} 数据不足: ${rows}行 ${cols}列`);
        return false;
      }

      console.log(`✓ Sheet验证通过: ${sheetName} (${rows}行 ${cols}列)`);

      // 处理数据
      if (dataType === 'table') {
        return this.processTableSheetStrict(item, worksheet, sheetName);
      } else if (dataType === 'chart') {
        return this.processChartSheetStrict(item, worksheet, sheetName);
      }

      return false;
    } catch (error) {
      console.error(`❌ 验证Sheet ${sheetName} 失败:`, error);
      return false;
    }
  }

  // 新增：严格的图表数据处理
  processChartSheetStrict(item, worksheet, sheetName) {
    try {
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 3) { // 至少需要标题行 + 2行数据
        console.warn(`❌ 图表数据不足: ${sheetName}`);
        return false;
      }

      const chartResult = this.parseChartDataStrict(jsonData, sheetName);

      if (chartResult && this.validateChartData(chartResult)) {
        // 只在验证通过后才添加数据
        item.xAxisData = chartResult.xAxisData;
        item.seriesData = chartResult.seriesData;
        item.echartMsg = {
          echartId: Date.now() + Math.floor(Math.random() * 1000),
          xName: chartResult.xName || 'X轴',
          yName: chartResult.yName || 'Y轴',
          minX: chartResult.minX || 0,
          minY: chartResult.minY || 0
        };

        console.log(`✅ 严格验证通过: "${item.name}" 图表数据 (${chartResult.seriesData.length} 系列)`);
        return true;
      } else {
        console.warn(`❌ 图表数据验证失败: ${sheetName}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ 严格处理图表失败 ${sheetName}:`, error);
      return false;
    }
  }

  // 新增：验证图表数据质量
  validateChartData(chartResult) {
    if (!chartResult || !chartResult.seriesData || chartResult.seriesData.length === 0) {
      return false;
    }

    // 验证每个系列
    for (const series of chartResult.seriesData) {
      if (!series.name || !series.data || series.data.length < 2) {
        console.warn(`❌ 系列数据不足: ${series.name} (${series.data?.length || 0} 点)`);
        return false;
      }

      // 验证数据点质量
      for (const point of series.data) {
        if (!Array.isArray(point) || point.length !== 2 ||
            typeof point[0] !== 'number' || typeof point[1] !== 'number' ||
            isNaN(point[0]) || isNaN(point[1])) {
          console.warn(`❌ 无效数据点: ${JSON.stringify(point)}`);
          return false;
        }
      }
    }

    return true;
  }

  // 新增：严格的图表数据解析
  parseChartDataStrict(jsonData, sheetName) {
    try {
      const headers = jsonData[0].filter(header =>
        header !== null && header !== undefined && header !== ''
      );

      if (headers.length < 2 || headers.length % 2 !== 0) {
        console.warn(`❌ 图表列数不正确: ${headers.length} (应为偶数)`);
        return null;
      }

      return this.parseAlternatingXYFormatStrict(jsonData, headers, sheetName);
    } catch (error) {
      console.error(`❌ 严格解析图表数据失败:`, error);
      return null;
    }
  }

  // 新增：严格的XY轴交替格式解析
  parseAlternatingXYFormatStrict(jsonData, headers, sheetName) {
    const seriesData = [];
    const xAxisData = [];
    let minX = Infinity;
    let minY = Infinity;
    let validPointsTotal = 0;

    console.log(`🔍 严格解析XY轴交替格式: ${sheetName}`);

    // 处理成对的XY列
    for (let i = 0; i < headers.length - 1; i += 2) {
      const xHeader = headers[i];
      const yHeader = headers[i + 1];

      if (!xHeader || !yHeader) {
        console.warn(`⚠ 跳过无效列对: ${i}-${i+1}`);
        continue;
      }

      const seriesPoints = [];
      let validPointsInSeries = 0;

      // 处理数据行
      for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        if (!row || row.length <= i + 1) continue;

        const xValue = row[i];
        const yValue = row[i + 1];

        // 严格验证数据
        if (this.isValidNumericValue(xValue) && this.isValidNumericValue(yValue)) {
          const numericX = Number(xValue);
          const numericY = Number(yValue);

          // 额外范围检查
          if (this.isReasonableValue(numericX) && this.isReasonableValue(numericY)) {
            seriesPoints.push([numericX, numericY]);
            xAxisData.push(numericX);
            minX = Math.min(minX, numericX);
            minY = Math.min(minY, numericY);
            validPointsInSeries++;
          }
        }
      }

      // 严格要求：每个系列至少3个有效点
      if (validPointsInSeries >= 3) {
        const seriesName = this.generateSeriesNameStrict(xHeader, yHeader, i);
        seriesData.push({
          name: seriesName,
          type: 'line',
          smooth: 'smooth',
          data: seriesPoints.sort((a, b) => a[0] - b[0])
        });

        validPointsTotal += validPointsInSeries;
        console.log(`✓ 系列验证通过: ${seriesName} (${validPointsInSeries} 个有效点)`);
      } else {
        console.warn(`❌ 系列数据不足: ${xHeader}-${yHeader} (${validPointsInSeries} 点 < 3)`);
      }
    }

    // 严格要求：总有效点数至少10个
    if (seriesData.length === 0 || validPointsTotal < 10) {
      console.warn(`❌ 整体数据不足: ${seriesData.length} 系列, ${validPointsTotal} 总点数 < 10`);
      return null;
    }

    return {
      xAxisData: [...new Set(xAxisData)].sort((a, b) => a - b),
      seriesData: seriesData,
      xName: '温度(℃)',
      yName: '应力(MPa)',
      minX: minX === Infinity ? 0 : Math.floor(minX),
      minY: minY === Infinity ? 0 : Math.floor(minY)
    };
  }

  // 新增：验证数值有效性
  isValidNumericValue(value) {
    if (value === null || value === undefined || value === '') return false;
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }

  // 新增：验证数值合理性
  isReasonableValue(value) {
    // 排除极端值
    return value > -1e6 && value < 1e6;
  }

  // 新增：严格生成系列名称
  generateSeriesNameStrict(xHeader, yHeader, index) {
    if (String(xHeader).includes('_x') && String(yHeader).includes('_y')) {
      const xBaseName = String(xHeader).replace(/_x$/i, '').trim();
      const yBaseName = String(yHeader).replace(/_y$/i, '').trim();
      return xBaseName === yBaseName ? xBaseName : `${xBaseName}`;
    }

    return yHeader ? String(yHeader).trim() : `系列${Math.floor(index/2) + 1}`;
  }

  // 读取JSON文件
  async readJsonFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error(`JSON解析失败: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }

  // 读取Excel文件
  async readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook);
        } catch (error) {
          reject(new Error(`Excel读取失败: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  // 基于文件名判断数据类型
  getDataTypeByFileName(fileName) {
    const lowerFileName = fileName.toLowerCase();

    if (lowerFileName.startsWith('表格') && (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls'))) {
      return 'table';
    }

    if (!lowerFileName.startsWith('表格') && !lowerFileName.startsWith('文本') &&
        (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls'))) {
      return 'chart';
    }

    if (lowerFileName.startsWith('文本') && lowerFileName.endsWith('.json')) {
      return 'text';
    }

    if (lowerFileName.endsWith('.json') && !lowerFileName.startsWith('文本')) {
      return 'base';
    }

    return 'unknown';
  }

  // 处理所有表格Sheet
  processAllSheets(sheetNames, workbook, data, fileName = null) {
    this.processDataWithMethod(data, (item) => this.updateItemData(item, sheetNames, workbook, 'table', fileName));
  }

  // 处理所有图表Sheet
  processAllCharts(sheetNames, workbook, data, fileName = null) {
    this.processDataWithMethod(data, (item) => this.updateItemData(item, sheetNames, workbook, 'chart', fileName));
  }

  // 修复：处理数据的通用方法 - 确保正确的对象引用传递
  processDataWithMethod(data, updateMethod) {
    console.log('开始处理数据，支持四级标题结构...');

    REQUIRED_SECTIONS.forEach(section => {
      if (data[section] && Array.isArray(data[section])) {
        data[section].forEach((item, itemIndex) => {
          if (item && typeof item === 'object') {
            // 直接传递数组中的对象引用，确保修改能够生效
            const itemRef = data[section][itemIndex];

            // 处理现有的图表数据
            this.processExistingChartData(itemRef);

            // 处理新的Excel数据
            updateMethod(itemRef);

            // 处理二级数据
            if (itemRef.two && Array.isArray(itemRef.two)) {
              itemRef.two.forEach((subItem, subIndex) => {
                if (subItem && typeof subItem === 'object') {
                  const subItemRef = itemRef.two[subIndex];
                  this.processExistingChartData(subItemRef);
                  updateMethod(subItemRef);

                  // 处理三级数据
                  if (subItemRef.third && Array.isArray(subItemRef.third)) {
                    subItemRef.third.forEach((thirdItem, thirdIndex) => {
                      if (thirdItem && typeof thirdItem === 'object') {
                        const thirdItemRef = subItemRef.third[thirdIndex];
                        this.processExistingChartData(thirdItemRef);
                        updateMethod(thirdItemRef);

                        // 处理四级数据（在三级下）
                        if (thirdItemRef.fourth && Array.isArray(thirdItemRef.fourth)) {
                          thirdItemRef.fourth.forEach((fourthItem, fourthIndex) => {
                            if (fourthItem && typeof fourthItem === 'object') {
                              const fourthItemRef = thirdItemRef.fourth[fourthIndex];
                              this.processExistingChartData(fourthItemRef);
                              updateMethod(fourthItemRef);
                            }
                          });
                        }
                      }
                    });
                  }

                  // 处理四级数据（直接在二级下）
                  if (subItemRef.fourth && Array.isArray(subItemRef.fourth)) {
                    subItemRef.fourth.forEach((fourthItem, fourthIndex) => {
                      if (fourthItem && typeof fourthItem === 'object') {
                        const fourthItemRef = subItemRef.fourth[fourthIndex];
                        this.processExistingChartData(fourthItemRef);
                        updateMethod(fourthItemRef);
                      }
                    });
                  }
                }
              });
            }

            // 处理直接在一级下的三级数据
            if (itemRef.third && Array.isArray(itemRef.third)) {
              itemRef.third.forEach((thirdItem, thirdIndex) => {
                if (thirdItem && typeof thirdItem === 'object') {
                  const thirdItemRef = itemRef.third[thirdIndex];
                  this.processExistingChartData(thirdItemRef);
                  updateMethod(thirdItemRef);

                  // 处理四级数据（在直接三级下）
                  if (thirdItemRef.fourth && Array.isArray(thirdItemRef.fourth)) {
                    thirdItemRef.fourth.forEach((fourthItem, fourthIndex) => {
                      if (fourthItem && typeof fourthItem === 'object') {
                        const fourthItemRef = thirdItemRef.fourth[fourthIndex];
                        this.processExistingChartData(fourthItemRef);
                        updateMethod(fourthItemRef);
                      }
                    });
                  }
                }
              });
            }

            // 处理四级数据（直接在一级下）
            if (itemRef.fourth && Array.isArray(itemRef.fourth)) {
              itemRef.fourth.forEach((fourthItem, fourthIndex) => {
                if (fourthItem && typeof fourthItem === 'object') {
                  const fourthItemRef = itemRef.fourth[fourthIndex];
                  this.processExistingChartData(fourthItemRef);
                  updateMethod(fourthItemRef);
                }
              });
            }
          }
        });
      }
    });

    console.log('数据处理完成');
  }

  // 修复：更新项目数据 - 移除重复处理检查
  updateItemData(item, sheetNames, workbook, dataType, fileName) {
    if (!item || !item.name) return;

    const itemName = item.name.trim();
    if (!itemName) return;

    // 查找匹配的Sheet
    const matchingSheet = this.findMatchingSheet(itemName, sheetNames);
    if (!matchingSheet) {
      console.log(`⚠ 未找到匹配的Sheet: "${itemName}"`);
      return;
    }

    // 处理Sheet数据
    this.processSingleSheet(item, matchingSheet, workbook, dataType, fileName);
  }

  // 修复：处理单个Sheet - 移除重复处理限制
  processSingleSheet(item, sheetName, workbook, dataType, fileName) {
    try {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        console.warn(`Sheet ${sheetName} 不存在`);
        return;
      }

      console.log(`正在处理 ${dataType === 'table' ? '表格' : '图表'} Sheet: ${sheetName} -> ${item.name}`);

      if (dataType === 'table') {
        this.processTableSheet(item, worksheet, sheetName);
      } else if (dataType === 'chart') {
        this.processChartSheet(item, worksheet, sheetName);
      }

    } catch (error) {
      console.error(`处理Sheet ${sheetName} 时出错:`, error);
    }
  }

  // 修复：处理图表Sheet - 确保数据正确添加
  processChartSheet(item, worksheet, sheetName) {
    try {
      console.log(`正在为 "${item.name}" 处理图表数据: ${sheetName}`);

      // 将Excel数据转换为JSON格式
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 2) {
        console.warn(`图表 ${sheetName} 数据不足，跳过处理`);
        return;
      }

      // 解析图表数据
      const chartResult = this.parseChartData(jsonData);

      if (chartResult && chartResult.seriesData && chartResult.seriesData.length > 0) {
        // 直接修改传入的item对象
        item.xAxisData = chartResult.xAxisData;
        item.seriesData = chartResult.seriesData;
        item.echartMsg = {
          echartId: Date.now() + Math.floor(Math.random() * 1000),
          xName: chartResult.xName || 'X轴',
          yName: chartResult.yName || 'Y轴',
          minX: chartResult.minX || 0,
          minY: chartResult.minY || 0
        };

        console.log(`✅ 成功为 "${item.name}" 添加图表数据:`);
        console.log(`   - 数据系列: ${chartResult.seriesData.length} 个`);
        console.log(`   - X轴数据点: ${chartResult.xAxisData.length} 个`);
        chartResult.seriesData.forEach((series, index) => {
          console.log(`   - 系列${index + 1}: ${series.name} (${series.data.length} 个点)`);
        });

        // 验证数据是否正确添加
        if (item.seriesData && item.seriesData.length > 0) {
          console.log(`✅ 验证通过: 图表数据已成功添加到 "${item.name}"`);
        } else {
          console.error(`❌ 验证失败: 图表数据未能添加到 "${item.name}"`);
        }

      } else {
        console.warn(`❌ 图表 ${sheetName} 解析失败或无有效数据`);
      }

    } catch (error) {
      console.error(`❌ 处理图表Sheet ${sheetName} 失败:`, error);
    }
  }

  // 修复：处理表格Sheet - 确保数据正确添加
  processTableSheet(item, worksheet, sheetName) {
    try {
      console.log(`正在为 "${item.name}" 处理表格数据: ${sheetName}`);

      // 将Excel数据转换为JSON格式
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 2) {
        console.warn(`表格 ${sheetName} 数据不足，跳过处理`);
        return;
      }

      // 解析表格数据
      const tableResult = this.parseTableData(jsonData, sheetName);

      if (tableResult && tableResult.tableData && tableResult.tableData.length > 0) {
        // 直接修改传入的item对象
        item.tableData = tableResult.tableData;
        item.tableColumns = tableResult.tableColumns;

        console.log(`✅ 成功为 "${item.name}" 添加表格数据:`);
        console.log(`   - 列数: ${tableResult.tableColumns.length}`);
        console.log(`   - 行数: ${tableResult.tableData.length}`);

        // 验证数据是否正确添加
        if (item.tableData && item.tableData.length > 0) {
          console.log(`✅ 验证通过: 表格数据已成功添加到 "${item.name}"`);
        } else {
          console.error(`❌ 验证失败: 表格数据未能添加到 "${item.name}"`);
        }

      } else {
        console.warn(`❌ 表格 ${sheetName} 解析失败或无有效数据`);
      }

    } catch (error) {
      console.error(`❌ 处理表格Sheet ${sheetName} 失败:`, error);
    }
  }

  // 修复：查找匹配Sheet - 优化数字匹配逻辑，优先匹配数字格式
  findMatchingSheet(itemName, sheetNames) {
    if (!itemName || !sheetNames || sheetNames.length === 0) {
      console.log(`❌ 输入参数无效: itemName="${itemName}", sheetNames=${sheetNames}`);
      return null;
    }

    console.log(`\n🔍 严格Sheet匹配:`);
    console.log(`   原始项目名: "${itemName}"`);
    console.log(`   可用Sheet列表: [${sheetNames.join(', ')}]`);

    // 1. 优先进行精确数字模式匹配
    const numberPatterns = this.extractNumberPatterns(itemName);
    console.log(`   🔢 提取的数字模式: [${numberPatterns.join(', ')}]`);

    if (numberPatterns.length > 0) {
      // 只进行精确匹配，不进行模糊匹配
      for (const pattern of numberPatterns) {
        const matchingSheet = sheetNames.find(sheetName => {
          if (!sheetName) return false;
          const sheetStr = sheetName.toString().trim();

          // 严格精确匹配
          if (sheetStr === pattern) {
            console.log(`   ✅ 精确数字匹配: "${sheetStr}" === "${pattern}"`);
            return true;
          }

          return false;
        });

        if (matchingSheet) {
          return matchingSheet;
        }
      }
    }

    // 2. 严格的文本匹配
    const cleanItemName = this.normalizeItemName(itemName);
    console.log(`   📝 标准化名称: "${cleanItemName}"`);

    // 只进行高置信度匹配
    for (const sheetName of sheetNames) {
      if (!sheetName) continue;

      const cleanSheetName = this.normalizeItemName(sheetName.toString());
      const similarity = this.calculateStringSimilarity(cleanItemName, cleanSheetName);

      // 提高匹配阈值到0.85
      if (similarity >= 0.85) {
        console.log(`   ✅ 高相似度匹配 (${similarity.toFixed(2)}): "${sheetName}" <-> "${itemName}"`);
        return sheetName;
      }
    }

    console.log(`   ❌ 未找到符合严格匹配条件的Sheet (阈值: 0.85)`);
    return null;
  }

  // 修复：更严格的数据验证
  validateAndProcessSheet(item, sheetName, workbook, dataType) {
    try {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        console.warn(`❌ Sheet ${sheetName} 不存在`);
        return false;
      }

      // 验证Sheet有效性
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const rows = range.e.r - range.s.r + 1;
      const cols = range.e.c - range.s.c + 1;

      if (rows < 2 || cols < 1) {
        console.warn(`❌ Sheet ${sheetName} 数据不足: ${rows}行 ${cols}列`);
        return false;
      }

      console.log(`✓ Sheet验证通过: ${sheetName} (${rows}行 ${cols}列)`);

      // 处理数据
      if (dataType === 'table') {
        return this.processTableSheetStrict(item, worksheet, sheetName);
      } else if (dataType === 'chart') {
        return this.processChartSheetStrict(item, worksheet, sheetName);
      }

      return false;
    } catch (error) {
      console.error(`❌ 验证Sheet ${sheetName} 失败:`, error);
      return false;
    }
  }

  // 新增：严格的图表数据处理
  processChartSheetStrict(item, worksheet, sheetName) {
    try {
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 3) { // 至少需要标题行 + 2行数据
        console.warn(`❌ 图表数据不足: ${sheetName}`);
        return false;
      }

      const chartResult = this.parseChartDataStrict(jsonData, sheetName);

      if (chartResult && this.validateChartData(chartResult)) {
        // 只在验证通过后才添加数据
        item.xAxisData = chartResult.xAxisData;
        item.seriesData = chartResult.seriesData;
        item.echartMsg = {
          echartId: Date.now() + Math.floor(Math.random() * 1000),
          xName: chartResult.xName || 'X轴',
          yName: chartResult.yName || 'Y轴',
          minX: chartResult.minX || 0,
          minY: chartResult.minY || 0
        };

        console.log(`✅ 严格验证通过: "${item.name}" 图表数据 (${chartResult.seriesData.length} 系列)`);
        return true;
      } else {
        console.warn(`❌ 图表数据验证失败: ${sheetName}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ 严格处理图表失败 ${sheetName}:`, error);
      return false;
    }
  }

  // 新增：验证图表数据质量
  validateChartData(chartResult) {
    if (!chartResult || !chartResult.seriesData || chartResult.seriesData.length === 0) {
      return false;
    }

    // 验证每个系列
    for (const series of chartResult.seriesData) {
      if (!series.name || !series.data || series.data.length < 2) {
        console.warn(`❌ 系列数据不足: ${series.name} (${series.data?.length || 0} 点)`);
        return false;
      }

      // 验证数据点质量
      for (const point of series.data) {
        if (!Array.isArray(point) || point.length !== 2 ||
            typeof point[0] !== 'number' || typeof point[1] !== 'number' ||
            isNaN(point[0]) || isNaN(point[1])) {
          console.warn(`❌ 无效数据点: ${JSON.stringify(point)}`);
          return false;
        }
      }
    }

    return true;
  }

  // 新增：严格的图表数据解析
  parseChartDataStrict(jsonData, sheetName) {
    try {
      const headers = jsonData[0].filter(header =>
        header !== null && header !== undefined && header !== ''
      );

      if (headers.length < 2 || headers.length % 2 !== 0) {
        console.warn(`❌ 图表列数不正确: ${headers.length} (应为偶数)`);
        return null;
      }

      return this.parseAlternatingXYFormatStrict(jsonData, headers, sheetName);
    } catch (error) {
      console.error(`❌ 严格解析图表数据失败:`, error);
      return null;
    }
  }

  // 新增：严格的XY轴交替格式解析
  parseAlternatingXYFormatStrict(jsonData, headers, sheetName) {
    const seriesData = [];
    const xAxisData = [];
    let minX = Infinity;
    let minY = Infinity;
    let validPointsTotal = 0;

    console.log(`🔍 严格解析XY轴交替格式: ${sheetName}`);

    // 处理成对的XY列
    for (let i = 0; i < headers.length - 1; i += 2) {
      const xHeader = headers[i];
      const yHeader = headers[i + 1];

      if (!xHeader || !yHeader) {
        console.warn(`⚠ 跳过无效列对: ${i}-${i+1}`);
        continue;
      }

      const seriesPoints = [];
      let validPointsInSeries = 0;

      // 处理数据行
      for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        if (!row || row.length <= i + 1) continue;

        const xValue = row[i];
        const yValue = row[i + 1];

        // 严格验证数据
        if (this.isValidNumericValue(xValue) && this.isValidNumericValue(yValue)) {
          const numericX = Number(xValue);
          const numericY = Number(yValue);

          // 额外范围检查
          if (this.isReasonableValue(numericX) && this.isReasonableValue(numericY)) {
            seriesPoints.push([numericX, numericY]);
            xAxisData.push(numericX);
            minX = Math.min(minX, numericX);
            minY = Math.min(minY, numericY);
            validPointsInSeries++;
          }
        }
      }

      // 严格要求：每个系列至少3个有效点
      if (validPointsInSeries >= 3) {
        const seriesName = this.generateSeriesNameStrict(xHeader, yHeader, i);
        seriesData.push({
          name: seriesName,
          type: 'line',
          smooth: 'smooth',
          data: seriesPoints.sort((a, b) => a[0] - b[0])
        });

        validPointsTotal += validPointsInSeries;
        console.log(`✓ 系列验证通过: ${seriesName} (${validPointsInSeries} 个有效点)`);
      } else {
        console.warn(`❌ 系列数据不足: ${xHeader}-${yHeader} (${validPointsInSeries} 点 < 3)`);
      }
    }

    // 严格要求：总有效点数至少10个
    if (seriesData.length === 0 || validPointsTotal < 10) {
      console.warn(`❌ 整体数据不足: ${seriesData.length} 系列, ${validPointsTotal} 总点数 < 10`);
      return null;
    }

    return {
      xAxisData: [...new Set(xAxisData)].sort((a, b) => a - b),
      seriesData: seriesData,
      xName: '温度(℃)',
      yName: '应力(MPa)',
      minX: minX === Infinity ? 0 : Math.floor(minX),
      minY: minY === Infinity ? 0 : Math.floor(minY)
    };
  }

  // 新增：验证数值有效性
  isValidNumericValue(value) {
    if (value === null || value === undefined || value === '') return false;
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }

  // 新增：验证数值合理性
  isReasonableValue(value) {
    // 排除极端值
    return value > -1e6 && value < 1e6;
  }

  // 新增：严格生成系列名称
  generateSeriesNameStrict(xHeader, yHeader, index) {
    if (String(xHeader).includes('_x') && String(yHeader).includes('_y')) {
      const xBaseName = String(xHeader).replace(/_x$/i, '').trim();
      const yBaseName = String(yHeader).replace(/_y$/i, '').trim();
      return xBaseName === yBaseName ? xBaseName : `${xBaseName}`;
    }

    return yHeader ? String(yHeader).trim() : `系列${Math.floor(index/2) + 1}`;
  }

  // 读取JSON文件
  async readJsonFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error(`JSON解析失败: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }

  // 读取Excel文件
  async readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook);
        } catch (error) {
          reject(new Error(`Excel读取失败: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  // 基于文件名判断数据类型
  getDataTypeByFileName(fileName) {
    const lowerFileName = fileName.toLowerCase();

    if (lowerFileName.startsWith('表格') && (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls'))) {
      return 'table';
    }

    if (!lowerFileName.startsWith('表格') && !lowerFileName.startsWith('文本') &&
        (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls'))) {
      return 'chart';
    }

    if (lowerFileName.startsWith('文本') && lowerFileName.endsWith('.json')) {
      return 'text';
    }

    if (lowerFileName.endsWith('.json') && !lowerFileName.startsWith('文本')) {
      return 'base';
    }

    return 'unknown';
  }

  // 处理所有表格Sheet
  processAllSheets(sheetNames, workbook, data, fileName = null) {
    this.processDataWithMethod(data, (item) => this.updateItemData(item, sheetNames, workbook, 'table', fileName));
  }

  // 处理所有图表Sheet
  processAllCharts(sheetNames, workbook, data, fileName = null) {
    this.processDataWithMethod(data, (item) => this.updateItemData(item, sheetNames, workbook, 'chart', fileName));
  }

  // 修复：处理数据的通用方法 - 确保正确的对象引用传递
  processDataWithMethod(data, updateMethod) {
    console.log('开始处理数据，支持四级标题结构...');

    REQUIRED_SECTIONS.forEach(section => {
      if (data[section] && Array.isArray(data[section])) {
        data[section].forEach((item, itemIndex) => {
          if (item && typeof item === 'object') {
            // 直接传递数组中的对象引用，确保修改能够生效
            const itemRef = data[section][itemIndex];

            // 处理现有的图表数据
            this.processExistingChartData(itemRef);

            // 处理新的Excel数据
            updateMethod(itemRef);

            // 处理二级数据
            if (itemRef.two && Array.isArray(itemRef.two)) {
              itemRef.two.forEach((subItem, subIndex) => {
                if (subItem && typeof subItem === 'object') {
                  const subItemRef = itemRef.two[subIndex];
                  this.processExistingChartData(subItemRef);
                  updateMethod(subItemRef);

                  // 处理三级数据
                  if (subItemRef.third && Array.isArray(subItemRef.third)) {
                    subItemRef.third.forEach((thirdItem, thirdIndex) => {
                      if (thirdItem && typeof thirdItem === 'object') {
                        const thirdItemRef = subItemRef.third[thirdIndex];
                        this.processExistingChartData(thirdItemRef);
                        updateMethod(thirdItemRef);

                        // 处理四级数据（在三级下）
                        if (thirdItemRef.fourth && Array.isArray(thirdItemRef.fourth)) {
                          thirdItemRef.fourth.forEach((fourthItem, fourthIndex) => {
                            if (fourthItem && typeof fourthItem === 'object') {
                              const fourthItemRef = thirdItemRef.fourth[fourthIndex];
                              this.processExistingChartData(fourthItemRef);
                              updateMethod(fourthItemRef);
                            }
                          });
                        }
                      }
                    });
                  }

                  // 处理四级数据（直接在二级下）
                  if (subItemRef.fourth && Array.isArray(subItemRef.fourth)) {
                    subItemRef.fourth.forEach((fourthItem, fourthIndex) => {
                      if (fourthItem && typeof fourthItem === 'object') {
                        const fourthItemRef = subItemRef.fourth[fourthIndex];
                        this.processExistingChartData(fourthItemRef);
                        updateMethod(fourthItemRef);
                      }
                    });
                  }
                }
              });
            }

            // 处理直接在一级下的三级数据
            if (itemRef.third && Array.isArray(itemRef.third)) {
              itemRef.third.forEach((thirdItem, thirdIndex) => {
                if (thirdItem && typeof thirdItem === 'object') {
                  const thirdItemRef = itemRef.third[thirdIndex];
                  this.processExistingChartData(thirdItemRef);
                  updateMethod(thirdItemRef);

                  // 处理四级数据（在直接三级下）
                  if (thirdItemRef.fourth && Array.isArray(thirdItemRef.fourth)) {
                    thirdItemRef.fourth.forEach((fourthItem, fourthIndex) => {
                      if (fourthItem && typeof fourthItem === 'object') {
                        const fourthItemRef = thirdItemRef.fourth[fourthIndex];
                        this.processExistingChartData(fourthItemRef);
                        updateMethod(fourthItemRef);
                      }
                    });
                  }
                }
              });
            }

            // 处理四级数据（直接在一级下）
            if (itemRef.fourth && Array.isArray(itemRef.fourth)) {
              itemRef.fourth.forEach((fourthItem, fourthIndex) => {
                if (fourthItem && typeof fourthItem === 'object') {
                  const fourthItemRef = itemRef.fourth[fourthIndex];
                  this.processExistingChartData(fourthItemRef);
                  updateMethod(fourthItemRef);
                }
              });
            }
          }
        });
      }
    });

    console.log('数据处理完成');
  }

  // 修复：更新项目数据 - 移除重复处理检查
  updateItemData(item, sheetNames, workbook, dataType, fileName) {
    if (!item || !item.name) return;

    const itemName = item.name.trim();
    if (!itemName) return;

    // 查找匹配的Sheet
    const matchingSheet = this.findMatchingSheet(itemName, sheetNames);
    if (!matchingSheet) {
      console.log(`⚠ 未找到匹配的Sheet: "${itemName}"`);
      return;
    }

    // 处理Sheet数据
    this.processSingleSheet(item, matchingSheet, workbook, dataType, fileName);
  }

  // 修复：处理单个Sheet - 移除重复处理限制
  processSingleSheet(item, sheetName, workbook, dataType, fileName) {
    try {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        console.warn(`Sheet ${sheetName} 不存在`);
        return;
      }

      console.log(`正在处理 ${dataType === 'table' ? '表格' : '图表'} Sheet: ${sheetName} -> ${item.name}`);

      if (dataType === 'table') {
        this.processTableSheet(item, worksheet, sheetName);
      } else if (dataType === 'chart') {
        this.processChartSheet(item, worksheet, sheetName);
      }

    } catch (error) {
      console.error(`处理Sheet ${sheetName} 时出错:`, error);
    }
  }

  // 修复：处理图表Sheet - 确保数据正确添加
  processChartSheet(item, worksheet, sheetName) {
    try {
      console.log(`正在为 "${item.name}" 处理图表数据: ${sheetName}`);

      // 将Excel数据转换为JSON格式
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 2) {
        console.warn(`图表 ${sheetName} 数据不足，跳过处理`);
        return;
      }

      // 解析图表数据
      const chartResult = this.parseChartData(jsonData);

      if (chartResult && chartResult.seriesData && chartResult.seriesData.length > 0) {
        // 直接修改传入的item对象
        item.xAxisData = chartResult.xAxisData;
        item.seriesData = chartResult.seriesData;
        item.echartMsg = {
          echartId: Date.now() + Math.floor(Math.random() * 1000),
          xName: chartResult.xName || 'X轴',
          yName: chartResult.yName || 'Y轴',
          minX: chartResult.minX || 0,
          minY: chartResult.minY || 0
        };

        console.log(`✅ 成功为 "${item.name}" 添加图表数据:`);
        console.log(`   - 数据系列: ${chartResult.seriesData.length} 个`);
        console.log(`   - X轴数据点: ${chartResult.xAxisData.length} 个`);
        chartResult.seriesData.forEach((series, index) => {
          console.log(`   - 系列${index + 1}: ${series.name} (${series.data.length} 个点)`);
        });

        // 验证数据是否正确添加
        if (item.seriesData && item.seriesData.length > 0) {
          console.log(`✅ 验证通过: 图表数据已成功添加到 "${item.name}"`);
        } else {
          console.error(`❌ 验证失败: 图表数据未能添加到 "${item.name}"`);
        }

      } else {
        console.warn(`❌ 图表 ${sheetName} 解析失败或无有效数据`);
      }

    } catch (error) {
      console.error(`❌ 处理图表Sheet ${sheetName} 失败:`, error);
    }
  }

  // 修复：处理表格Sheet - 确保数据正确添加
  processTableSheet(item, worksheet, sheetName) {
    try {
      console.log(`正在为 "${item.name}" 处理表格数据: ${sheetName}`);

      // 将Excel数据转换为JSON格式
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 2) {
        console.warn(`表格 ${sheetName} 数据不足，跳过处理`);
        return;
      }

      // 解析表格数据
      const tableResult = this.parseTableData(jsonData, sheetName);

      if (tableResult && tableResult.tableData && tableResult.tableData.length > 0) {
        // 直接修改传入的item对象
        item.tableData = tableResult.tableData;
        item.tableColumns = tableResult.tableColumns;

        console.log(`✅ 成功为 "${item.name}" 添加表格数据:`);
        console.log(`   - 列数: ${tableResult.tableColumns.length}`);
        console.log(`   - 行数: ${tableResult.tableData.length}`);

        // 验证数据是否正确添加
        if (item.tableData && item.tableData.length > 0) {
          console.log(`✅ 验证通过: 表格数据已成功添加到 "${item.name}"`);
        } else {
          console.error(`❌ 验证失败: 表格数据未能添加到 "${item.name}"`);
        }

      } else {
        console.warn(`❌ 表格 ${sheetName} 解析失败或无有效数据`);
      }

    } catch (error) {
      console.error(`❌ 处理表格Sheet ${sheetName} 失败:`, error);
    }
  }

  // 修复：查找匹配Sheet - 优化数字匹配逻辑，优先匹配数字格式
  findMatchingSheet(itemName, sheetNames) {
    if (!itemName || !sheetNames || sheetNames.length === 0) {
      console.log(`❌ 输入参数无效: itemName="${itemName}", sheetNames=${sheetNames}`);
      return null;
    }

    console.log(`\n🔍 严格Sheet匹配:`);
    console.log(`   原始项目名: "${itemName}"`);
    console.log(`   可用Sheet列表: [${sheetNames.join(', ')}]`);

    // 1. 优先进行精确数字模式匹配
    const numberPatterns = this.extractNumberPatterns(itemName);
    console.log(`   🔢 提取的数字模式: [${numberPatterns.join(', ')}]`);

    if (numberPatterns.length > 0) {
      // 只进行精确匹配，不进行模糊匹配
      for (const pattern of numberPatterns) {
        const matchingSheet = sheetNames.find(sheetName => {
          if (!sheetName) return false;
          const sheetStr = sheetName.toString().trim();

          // 严格精确匹配
          if (sheetStr === pattern) {
            console.log(`   ✅ 精确数字匹配: "${sheetStr}" === "${pattern}"`);
            return true;
          }

          return false;
        });

        if (matchingSheet) {
          return matchingSheet;
        }
      }
    }

    // 2. 严格的文本匹配
    const cleanItemName = this.normalizeItemName(itemName);
    console.log(`   📝 标准化名称: "${cleanItemName}"`);

    // 只进行高置信度匹配
    for (const sheetName of sheetNames) {
      if (!sheetName) continue;

      const cleanSheetName = this.normalizeItemName(sheetName.toString());
      const similarity = this.calculateStringSimilarity(cleanItemName, cleanSheetName);

      // 提高匹配阈值到0.85
      if (similarity >= 0.85) {
        console.log(`   ✅ 高相似度匹配 (${similarity.toFixed(2)}): "${sheetName}" <-> "${itemName}"`);
        return sheetName;
      }
    }

    console.log(`   ❌ 未找到符合严格匹配条件的Sheet (阈值: 0.85)`);
    return null;
  }

  // 修复：更严格的数据验证
  validateAndProcessSheet(item, sheetName, workbook, dataType) {
    try {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        console.warn(`❌ Sheet ${sheetName} 不存在`);
        return false;
      }

      // 验证Sheet有效性
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const rows = range.e.r - range.s.r + 1;
      const cols = range.e.c - range.s.c + 1;

      if (rows < 2 || cols < 1) {
        console.warn(`❌ Sheet ${sheetName} 数据不足: ${rows}行 ${cols}列`);
        return false;
      }

      console.log(`✓ Sheet验证通过: ${sheetName} (${rows}行 ${cols}列)`);

      // 处理数据
      if (dataType === 'table') {
        return this.processTableSheetStrict(item, worksheet, sheetName);
      } else if (dataType === 'chart') {
        return this.processChartSheetStrict(item, worksheet, sheetName);
      }

      return false;
    } catch (error) {
      console.error(`❌ 验证Sheet ${sheetName} 失败:`, error);
      return false;
    }
  }

  // 新增：严格的图表数据处理
  processChartSheetStrict(item, worksheet, sheetName) {
    try {
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 3) { // 至少需要标题行 + 2行数据
        console.warn(`❌ 图表数据不足: ${sheetName}`);
        return false;
      }

      const chartResult = this.parseChartDataStrict(jsonData, sheetName);

      if (chartResult && this.validateChartData(chartResult)) {
        // 只在验证通过后才添加数据
        item.xAxisData = chartResult.xAxisData;
        item.seriesData = chartResult.seriesData;
        item.echartMsg = {
          echartId: Date.now() + Math.floor(Math.random() * 1000),
          xName: chartResult.xName || 'X轴',
          yName: chartResult.yName || 'Y轴',
          minX: chartResult.minX || 0,
          minY: chartResult.minY || 0
        };

        console.log(`✅ 严格验证通过: "${item.name}" 图表数据 (${chartResult.seriesData.length} 系列)`);
        return true;
      } else {
        console.warn(`❌ 图表数据验证失败: ${sheetName}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ 严格处理图表失败 ${sheetName}:`, error);
      return false;
    }
  }

  // 新增：验证图表数据质量
  validateChartData(chartResult) {
    if (!chartResult || !chartResult.seriesData || chartResult.seriesData.length === 0) {
      return false;
    }

    // 验证每个系列
    for (const series of chartResult.seriesData) {
      if (!series.name || !series.data || series.data.length < 2) {
        console.warn(`❌ 系列数据不足: ${series.name} (${series.data?.length || 0} 点)`);
        return false;
      }

      // 验证数据点质量
      for (const point of series.data) {
        if (!Array.isArray(point) || point.length !== 2 ||
            typeof point[0] !== 'number' || typeof point[1] !== 'number' ||
            isNaN(point[0]) || isNaN(point[1])) {
          console.warn(`❌ 无效数据点: ${JSON.stringify(point)}`);
          return false;
        }
      }
    }

    return true;
  }

  // 新增：严格的图表数据解析
  parseChartDataStrict(jsonData, sheetName) {
    try {
      const headers = jsonData[0].filter(header =>
        header !== null && header !== undefined && header !== ''
      );

      if (headers.length < 2 || headers.length % 2 !== 0) {
        console.warn(`❌ 图表列数不正确: ${headers.length} (应为偶数)`);
        return null;
      }

      return this.parseAlternatingXYFormatStrict(jsonData, headers, sheetName);
    } catch (error) {
      console.error(`❌ 严格解析图表数据失败:`, error);
      return null;
    }
  }

  // 新增：严格的XY轴交替格式解析
  parseAlternatingXYFormatStrict(jsonData, headers, sheetName) {
    const seriesData = [];
    const xAxisData = [];
    let minX = Infinity;
    let minY = Infinity;
    let validPointsTotal = 0;

    console.log(`🔍 严格解析XY轴交替格式: ${sheetName}`);

    // 处理成对的XY列
    for (let i = 0; i < headers.length - 1; i += 2) {
      const xHeader = headers[i];
      const yHeader = headers[i + 1];

      if (!xHeader || !yHeader) {
        console.warn(`⚠ 跳过无效列对: ${i}-${i+1}`);
        continue;
      }

      const seriesPoints = [];
      let validPointsInSeries = 0;

      // 处理数据行
      for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        if (!row || row.length <= i + 1) continue;

        const xValue = row[i];
        const yValue = row[i + 1];

        // 严格验证数据
        if (this.isValidNumericValue(xValue) && this.isValidNumericValue(yValue)) {
          const numericX = Number(xValue);
          const numericY = Number(yValue);

          // 额外范围检查
          if (this.isReasonableValue(numericX) && this.isReasonableValue(numericY)) {
            seriesPoints.push([numericX, numericY]);
            xAxisData.push(numericX);
            minX = Math.min(minX, numericX);
            minY = Math.min(minY, numericY);
            validPointsInSeries++;
          }
        }
      }

      // 严格要求：每个系列至少3个有效点
      if (validPointsInSeries >= 3) {
        const seriesName = this.generateSeriesNameStrict(xHeader, yHeader, i);
        seriesData.push({
          name: seriesName,
          type: 'line',
          smooth: 'smooth',
          data: seriesPoints.sort((a, b) => a[0] - b[0])
        });

        validPointsTotal += validPointsInSeries;
        console.log(`✓ 系列验证通过: ${seriesName} (${validPointsInSeries} 个有效点)`);
      } else {
        console.warn(`❌ 系列数据不足: ${xHeader}-${yHeader} (${validPointsInSeries} 点 < 3)`);
      }
    }

    // 严格要求：总有效点数至少10个
    if (seriesData.length === 0 || validPointsTotal < 10) {
      console.warn(`❌ 整体数据不足: ${seriesData.length} 系列, ${validPointsTotal} 总点数 < 10`);
      return null;
    }

    return {
      xAxisData: [...new Set(xAxisData)].sort((a, b) => a - b),
      seriesData: seriesData,
      xName: '温度(℃)',
      yName: '应力(MPa)',
      minX: minX === Infinity ? 0 : Math.floor(minX),
      minY: minY === Infinity ? 0 : Math.floor(minY)
    };
  }

  // 新增：验证数值有效性
  isValidNumericValue(value) {
    if (value === null || value === undefined || value === '') return false;
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }

  // 新增：验证数值合理性
  isReasonableValue(value) {
    // 排除极端值
    return value > -1e6 && value < 1e6;
  }

  // 新增：严格生成系列名称
  generateSeriesNameStrict(xHeader, yHeader, index) {
    if (String(xHeader).includes('_x') && String(yHeader).includes('_y')) {
      const xBaseName = String(xHeader).replace(/_x$/i, '').trim();
      const yBaseName = String(yHeader).replace(/_y$/i, '').trim();
      return xBaseName === yBaseName ? xBaseName : `${xBaseName}`;
    }

    return yHeader ? String(yHeader).trim() : `系列${Math.floor(index/2) + 1}`;
  }

  // 处理现有的图表数据 - 恢复这个重要方法
  processExistingChartData(item) {
    if (!item) return;

    // 如果已经有图表数据，确保格式正确
    if (item.seriesData && Array.isArray(item.seriesData) && item.seriesData.length > 0) {
      // 验证并修复图表数据格式
      item.seriesData = item.seriesData.map(series => ({
        name: series.name || '数据系列',
        type: series.type || 'line',
        smooth: series.smooth || 'smooth',
        data: Array.isArray(series.data) ? series.data : []
      }));

      // 确保有echartMsg
      if (!item.echartMsg || !item.echartMsg.echartId) {
        item.echartMsg = {
          echartId: Date.now() + Math.floor(Math.random() * 1000),
          xName: item.echartMsg?.xName || '温度(℃)',
          yName: item.echartMsg?.yName || '应力(MPa)',
          minX: item.echartMsg?.minX || 0,
          minY: item.echartMsg?.minY || 0
        };
      }

      console.log(`✓ 处理现有图表数据: "${item.name}" (${item.seriesData.length} 个系列)`);
    }
  }

  // 统一的图表数据解析方法 - 专注于XY轴交替格式
  parseChartData(jsonData) {
    if (!jsonData || jsonData.length < 2) return null;

    try {
      // 获取表头
      const headers = jsonData[0].filter(header =>
        header !== null && header !== undefined && header !== ''
      );

      if (headers.length < 2) return null;

      // 直接使用XY交替格式解析
      return this.parseAlternatingXYFormat(jsonData, headers);

    } catch (error) {
      console.error('解析图表数据失败:', error);
      return null;
    }
  }

  // XY轴交替格式解析 - 优化版本
  parseAlternatingXYFormat(jsonData, headers) {
    const seriesData = [];
    const xAxisData = [];
    let minX = Infinity;
    let minY = Infinity;

    console.log('解析XY轴交替格式数据...');

    // 处理成对的XY列
    for (let i = 0; i < headers.length - 1; i += 2) {
      const xHeader = headers[i];
      const yHeader = headers[i + 1];

      // 生成系列名称
      let seriesName;
      if (String(xHeader).includes('_x') && String(yHeader).includes('_y')) {
        // 如果有_x, _y后缀，提取基础名称
        const xBaseName = String(xHeader).replace(/_x$/i, '').trim();
        const yBaseName = String(yHeader).replace(/_y$/i, '').trim();
        seriesName = xBaseName === yBaseName ? xBaseName : `${xBaseName}-${yBaseName}`;
      } else {
        // 否则使用Y列名称或生成默认名称
        seriesName = yHeader || `系列${Math.floor(i/2) + 1}`;
      }

      const seriesPoints = [];

      // 处理数据行
      for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        if (!row || row.length <= i + 1) continue;

        const xValue = row[i];     // X值在偶数列
        const yValue = row[i + 1]; // Y值在奇数列

        // 验证数据有效性
        if (xValue !== null && xValue !== undefined && xValue !== '' &&
            yValue !== null && yValue !== undefined && yValue !== '') {

          const numericX = Number(xValue);
          const numericY = Number(yValue);

          if (!isNaN(numericX) && !isNaN(numericY)) {
            seriesPoints.push([numericX, numericY]);
            xAxisData.push(numericX);
            minX = Math.min(minX, numericX);
            minY = Math.min(minY, numericY);
          }
        }
      }

      // 如果有有效数据点，添加到系列中
      if (seriesPoints.length > 0) {
        seriesData.push({
          name: seriesName,
          type: 'line',
          smooth: 'smooth',
          data: seriesPoints.sort((a, b) => a[0] - b[0]) // 按X轴排序
        });

        console.log(`✓ 解析系列: ${seriesName} (${seriesPoints.length} 个数据点)`);
      }
    }

    if (seriesData.length === 0) {
      console.warn('XY轴交替格式未能解析到有效数据');
      return null;
    }

    console.log(`✓ XY轴交替格式解析完成，共 ${seriesData.length} 个系列`);

    return {
      xAxisData: [...new Set(xAxisData)].sort((a, b) => a - b),
      seriesData: seriesData,
      xName: '温度(℃)', // 根据您的数据特点设置默认X轴名称
      yName: '应力(MPa)', // 根据您的数据特点设置默认Y轴名称
      minX: minX === Infinity ? 0 : Math.floor(minX),
      minY: minY === Infinity ? 0 : Math.floor(minY)
    };
  }

  // 新增：提取数字模式方法
  extractNumberPatterns(text) {
    if (!text) return [];

    const patterns = [];

    // 匹配各种数字格式
    const numberMatches = [
      // 匹配 "3.10.1", "2.3", "1.7" 等格式
      ...text.match(/\d+(\.\d+)+/g) || [],
      // 匹配单独的数字 "3", "10" 等
      ...text.match(/(?<!\d)\d+(?!\d|\.\d)/g) || []
    ];

    // 去重并按长度排序（长的优先）
    const uniquePatterns = [...new Set(numberMatches)];
    uniquePatterns.sort((a, b) => b.length - a.length);

    return uniquePatterns;
  }

  // 修改：优化关键词提取方法
  extractKeywords(text) {
    if (!text) return [];

    console.log(`   📝 关键词提取 - 输入: "${text}"`);

    // 移除标点符号并分割，保留中文、英文和数字
    const keywords = text
      .replace(/[，、。！？；：""''（）【】「」/\-_]/g, ' ') // 替换标点为空格
      .split(/\s+/) // 按空格分割
      .filter(word => {
        // 保留长度大于1的词，或者是单个重要字符
        const isValid = word.length > 1 || /[a-zA-Z0-9]/.test(word);
        console.log(`      词: "${word}" -> ${isValid ? '保留' : '丢弃'}`);
        return isValid;
      })
      .slice(0, 5); // 取前5个关键词

    console.log(`   🎯 最终关键词: [${keywords.join(', ')}]`);
    return keywords;
  }

  // 新增：处理文件的通用方法
  async processFiles(files, data, materialCode) {
    const results = [];

    for (const file of files) {
      try {
        const dataType = this.getDataTypeByFileName(file.name);
        console.log(`处理文件: ${file.name} (类型: ${dataType})`);

        switch (dataType) {
          case 'text':
            const textResult = await this.processTextFile(file, data);
            results.push(textResult);
            break;

          case 'table':
            const tableResult = await this.processTableFile(file, data);
            results.push(tableResult);
            break;

          case 'chart':
            const chartResult = await this.processChartFile(file, data);
            results.push(chartResult);
            break;

          case 'base':
            const baseResult = await this.processBaseFile(file, data);
            results.push(baseResult);
            break;

          default:
            results.push({
              status: 'warning',
              filename: file.name,
              message: '未识别的文件类型'
            });
        }
      } catch (error) {
        results.push({
          status: 'error',
          filename: file.name,
          error: error.message
        });
      }
    }

    return results;
  }

  // 新增：处理文本文件
  async processTextFile(file, data) {
    try {
      const textData = await this.readJsonFile(file);
      this.updateAllTextData(textData, data);

      return {
        status: 'success',
        filename: file.name,
        message: '文本数据处理成功'
      };
    } catch (error) {
      return {
        status: 'error',
        filename: file.name,
        error: `文本文件处理失败: ${error.message}`
      };
    }
  }

  // 新增：处理表格文件
  async processTableFile(file, data) {
    try {
      const workbook = await this.readExcelFile(file);
      const sheetNames = Object.keys(workbook.Sheets);

      // 重置已使用的Sheet集合
      this.usedSheets.clear();

      // 处理表格数据
      this.processAllSheets(sheetNames, workbook, data, file.name);

      return {
        status: 'success',
        filename: file.name,
        message: `表格数据处理成功 (${sheetNames.length} 个Sheet)`
      };
    } catch (error) {
      return {
        status: 'error',
        filename: file.name,
        error: `表格文件处理失败: ${error.message}`
      };
    }
  }

  // 新增：处理图表文件
  async processChartFile(file, data) {
    try {
      const workbook = await this.readExcelFile(file);
      const sheetNames = Object.keys(workbook.Sheets);

      // 重置已使用的Sheet集合
      this.usedSheets.clear();

      // 处理图表数据
      this.processAllCharts(sheetNames, workbook, data, file.name);

      return {
        status: 'success',
        filename: file.name,
        message: `图表数据处理成功 (${sheetNames.length} 个Sheet)`
      };
    } catch (error) {
      return {
        status: 'error',
        filename: file.name,
        error: `图表文件处理失败: ${error.message}`
      };
    }
  }

  // 新增：处理基础文件
  async processBaseFile(file, data) {
    try {
      const baseData = await this.readJsonFile(file);

      // 如果数据为空，使用基础数据
      if (this.isEmptyJsonStructure(data)) {
        Object.assign(data, baseData);
      } else {
        // 否则合并数据
        this.updateAllTextData(baseData, data);
      }

      return {
        status: 'success',
        filename: file.name,
        message: '基础数据处理成功'
      };
    } catch (error) {
      return {
        status: 'error',
        filename: file.name,
        error: `基础文件处理失败: ${error.message}`
      };
    }
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

  // 从文件夹中提取所有材料编号
  processAllMaterialsInFolder(files) {
    const materials = new Set();
    const filesByMaterial = new Map();

    files.forEach(file => {
      const materialCode = this.extractMaterialCodeFromFileName(file.name);
      if (materialCode) {
        materials.add(materialCode);
        if (!filesByMaterial.has(materialCode)) {
          filesByMaterial.set(materialCode, []);
        }
        filesByMaterial.get(materialCode).push(file);
      }
    });

    return {
      success: materials.size > 0,
      materials: Array.from(materials),
      filesByMaterial: filesByMaterial
    };
  }

  // 从文件名提取材料编号
  extractMaterialCodeFromFileName(fileName) {
    // 匹配常见的材料编号格式
    const patterns = [
      /([A-Z]{1,3}\d{3,4}[A-Z]?)/i,  // GH1015, K417G 等
      /([A-Z]{2}\d{3,4})/i,          // DZ405, DD402 等
      /(FGH\d{4})/i                  // FGH4095 等
    ];

    for (const pattern of patterns) {
      const match = fileName.match(pattern);
      if (match) {
        return match[1].toUpperCase();
      }
    }

    return null;
  }

  // 修改：处理上传文件夹中的所有材料 - 生成ZIP下载
  async processAllMaterialsInUploadedFiles(existingMenu = null) {
    if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
      return { success: false, message: '没有文件需要处理' };
    }

    try {
      const folderResult = this.processAllMaterialsInFolder(this.uploadedFiles);

      if (!folderResult.success) {
        // 如果没有检测到材料编号，尝试处理所有文件
        const data = this.createBaseJsonStructure();
        const results = await this.processFiles(this.uploadedFiles, data, 'UNKNOWN');

        const zipData = await this.generateZipPackage({
          'UNKNOWN': data
        }, existingMenu);

        return {
          success: results.some(r => r.status === 'success'),
          message: '处理完成，但未能识别标准材料编号',
          materialsData: { 'UNKNOWN': data },
          zipData: zipData
        };
      }

      const materialsData = {};
      const allResults = [];

      // 处理每个材料
      for (const materialCode of folderResult.materials) {
        const materialFiles = folderResult.filesByMaterial.get(materialCode);
        const data = this.createBaseJsonStructure();

        const results = await this.processFiles(materialFiles, data, materialCode);
        allResults.push(...results);
        materialsData[materialCode] = data;
      }

      // 生成ZIP包
      const zipData = await this.generateZipPackage(materialsData, existingMenu);

      const successCount = allResults.filter(r => r.status === 'success').length;

      return {
        success: successCount > 0,
        message: `成功处理 ${folderResult.materials.length} 个材料的数据`,
        materialsData: materialsData,
        zipData: zipData
      };

    } catch (error) {
      console.error('处理文件夹失败:', error);
      return { success: false, message: `处理失败: ${error.message}` };
    }
  }

  // 新增：生成ZIP包
  async generateZipPackage(materialsData, existingMenu = null) {
    try {
      // 动态导入JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // 添加每个材料的JSON文件
      Object.entries(materialsData).forEach(([materialCode, data]) => {
        const jsonContent = JSON.stringify(data, null, 2);
        zip.file(`${materialCode}.json`, jsonContent);
        console.log(`✓ 添加到ZIP: ${materialCode}.json`);
      });

      // 生成并添加更新后的菜单文件
      const updatedMenu = this.generateUpdatedMenu(materialsData, existingMenu);
      const menuContent = JSON.stringify(updatedMenu, null, 2);
      zip.file('menu.json', menuContent);
      console.log('✓ 添加到ZIP: menu.json');

      // 生成处理报告
      const report = this.generateProcessingReport(materialsData);
      zip.file('processing_report.txt', report);
      console.log('✓ 添加到ZIP: processing_report.txt');

      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      console.log('✓ ZIP包生成完成');

      return zipBlob;

    } catch (error) {
      console.error('生成ZIP包失败:', error);
      throw new Error(`ZIP包生成失败: ${error.message}`);
    }
  }

  // 新增：生成更新后的菜单
  generateUpdatedMenu(materialsData, existingMenu = null) {
    // 从现有菜单开始，如果没有则创建基础结构
    let menu = existingMenu ? JSON.parse(JSON.stringify(existingMenu)) : {
      code: 200,
      menu: [
        {
          "index": "1",
          "name": "固溶强化型变形高温合金",
          "list": []
        },
        {
          "index": "2",
          "name": "等轴晶铸造高温合金",
          "list": []
        },
        {
          "index": "3",
          "name": "沉淀硬化型变形高温合金",
          "list": []
        },
        {
          "index": "4",
          "name": "定向凝固柱晶高温合金",
          "list": []
        },
        {
          "index": "5",
          "name": "单晶高温合金",
          "list": []
        },
        {
          "index": "6",
          "name": "粉末冶金高温合金",
          "list": []
        }
      ]
    };

    // 为新材料生成菜单项
    Object.keys(materialsData).forEach(materialCode => {
      // 确定材料类型和目标菜单组
      const categoryIndex = this.determineMaterialCategory(materialCode);
      const targetCategory = menu.menu.find(cat => cat.index === categoryIndex.toString());

      if (targetCategory) {
        // 检查是否已存在
        const existingItem = targetCategory.list.find(item => item.name === materialCode);

        if (!existingItem) {
          // 生成新的索引
          const newIndex = `${categoryIndex}-${targetCategory.list.length + 1}`;

          // 添加新材料项
          const newItem = {
            "index": newIndex,
            "name": materialCode,
            "key_component": this.extractComponentsFromData(materialsData[materialCode]),
            "key_craft": this.extractCraftFromData(materialsData[materialCode]),
            "key_density": this.extractDensityFromData(materialsData[materialCode])
          };

          targetCategory.list.push(newItem);
          console.log(`✓ 添加到菜单: ${materialCode} (${targetCategory.name})`);
        } else {
          console.log(`⚠ 菜单中已存在: ${materialCode}`);
        }
      }
    });

    return menu;
  }

  // 新增：确定材料类别
  determineMaterialCategory(materialCode) {
    // 基于材料编号前缀判断类别
    if (materialCode.startsWith('GH10') || materialCode.startsWith('GH11') ||
        materialCode.startsWith('GH30') || materialCode.startsWith('GH51') ||
        materialCode.startsWith('GH56')) {
      return 1; // 固溶强化型变形高温合金
    } else if (materialCode.startsWith('K')) {
      return 2; // 等轴晶铸造高温合金
    } else if (materialCode.startsWith('GH2') || materialCode.startsWith('GH4') ||
               materialCode.startsWith('GH6')) {
      return 3; // 沉淀硬化型变形高温合金
    } else if (materialCode.startsWith('DZ')) {
      return 4; // 定向凝固柱晶高温合金
    } else if (materialCode.startsWith('DD')) {
      return 5; // 单晶高温合金
    } else if (materialCode.startsWith('FGH')) {
      return 6; // 粉末冶金高温合金
    }

    // 默认归类到固溶强化型
    return 1;
  }

  // 新增：从数据中提取化学成分
  extractComponentsFromData(data) {
    const components = new Set();

    // 遍历所有部分查找化学成分表格
    Object.values(data).forEach(section => {
      if (Array.isArray(section)) {
        section.forEach(item => {
          this.extractComponentsFromItem(item, components);
        });
      }
    });

    return Array.from(components);
  }

  // 递归提取化学成分
  extractComponentsFromItem(item, components) {
    if (!item) return;

    // 检查表格数据中的化学成分
    if (item.tableData && Array.isArray(item.tableData)) {
      item.tableData.forEach(row => {
        Object.keys(row).forEach(key => {
          // 常见的化学元素符号
          const elementSymbols = ['C', 'Cr', 'Ni', 'Co', 'W', 'Mo', 'Al', 'Ti', 'Fe', 'Nb', 'Ta', 'B', 'Zr', 'V', 'Mn', 'Si', 'P', 'S', 'Cu', 'N', 'Ce', 'La', 'Hf', 'Ga', 'In', 'Se', 'Te', 'Tl', 'Zn', 'Cd', 'Pb', 'Bi', 'As', 'Sn', 'Sb', 'Ag', 'Mg'];
          if (elementSymbols.includes(key)) {
            components.add(key);
          }
        });
      });
    }

    // 递归处理多级数据
    ['two', 'third', 'fourth'].forEach(prop => {
      if (item[prop] && Array.isArray(item[prop])) {
        item[prop].forEach(subItem => {
          this.extractComponentsFromItem(subItem, components);
        });
      }
    });
  }

  // 新增：从数据中提取熔炼工艺
  extractCraftFromData(data) {
    const crafts = new Set();

    // 查找熔炼工艺相关内容
    Object.values(data).forEach(section => {
      if (Array.isArray(section)) {
        section.forEach(item => {
          this.extractCraftFromItem(item, crafts);
        });
      }
    });

    return Array.from(crafts);
  }

  // 递归提取熔炼工艺
  extractCraftFromItem(item, crafts) {
    if (!item) return;

    // 检查内容中的熔炼工艺关键词
    if (item.con && typeof item.con === 'string') {
      const content = item.con.toLowerCase();

      // 根据关键词映射工艺编号
      const craftKeywords = {
        1: ['电弧炉'],
        2: ['电渣重熔'],
        3: ['真空电弧重熔'],
        4: ['非真空感应炉'],
        5: ['真空感应炉'],
        6: ['真空双联'],
        7: ['电弧炉+真空自耗'],
        8: ['电弧炉+电渣重熔'],
        9: ['电弧炉+真空电弧'],
        10: ['非真空感应炉+真空电弧'],
        11: ['非真空感应炉+电渣重熔'],
        12: ['非真空感应炉+真空自耗'],
        13: ['真空感应炉+电渣重熔'],
        14: ['真空感应炉+真空自耗']
      };

      Object.entries(craftKeywords).forEach(([code, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword))) {
          crafts.add(parseInt(code));
        }
      });
    }

    // 递归处理多级数据
    ['two', 'third', 'fourth'].forEach(prop => {
      if (item[prop] && Array.isArray(item[prop])) {
        item[prop].forEach(subItem => {
          this.extractCraftFromItem(subItem, crafts);
        });
      }
    });
  }

  // 新增：从数据中提取密度
  extractDensityFromData(data) {
    // 查找密度信息
    for (const section of Object.values(data)) {
      if (Array.isArray(section)) {
        for (const item of section) {
          const density = this.extractDensityFromItem(item);
          if (density !== null) {
            return density;
          }
        }
      }
    }

    return 0; // 默认值
  }

  // 递归提取密度
  extractDensityFromItem(item) {
    if (!item) return null;

    // 检查内容中的密度信息
    if (item.con && typeof item.con === 'string') {
      // 匹配密度格式如 "p=8.32g/cm³" 或 "密度：8.32 g/cm³"
      const densityMatch = item.con.match(/(?:p=|密度[：:]\s*)(\d+\.?\d*)\s*g\/cm[³3]/i);
      if (densityMatch) {
        return parseFloat(densityMatch[1]);
      }
    }

    // 递归处理多级数据
    for (const prop of ['two', 'third', 'fourth']) {
      if (item[prop] && Array.isArray(item[prop])) {
        for (const subItem of item[prop]) {
          const density = this.extractDensityFromItem(subItem);
          if (density !== null) {
            return density;
          }
        }
      }
    }

    return null;
  }

  // 新增：生成处理报告
  generateProcessingReport(materialsData) {
    const timestamp = new Date().toLocaleString('zh-CN');
    let report = `材料数据处理报告\n`;
    report += `生成时间: ${timestamp}\n`;
    report += `${'='.repeat(50)}\n\n`;

    report += `处理材料总数: ${Object.keys(materialsData).length}\n\n`;

    Object.entries(materialsData).forEach(([materialCode, data]) => {
      report += `材料: ${materialCode}\n`;
      report += `${'─'.repeat(30)}\n`;

      // 统计各部分数据
      Object.entries(data).forEach(([section, items]) => {
        if (Array.isArray(items) && items.length > 0) {
          report += `  ${this.getSectionName(section)}: ${items.length} 项\n`;

          // 统计图表和表格数量
          let chartCount = 0;
          let tableCount = 0;
          this.countDataTypes(items, (type) => {
            if (type === 'chart') chartCount++;
            if (type === 'table') tableCount++;
          });

          if (chartCount > 0) report += `    └─ 图表: ${chartCount} 个\n`;
          if (tableCount > 0) report += `    └─ 表格: ${tableCount} 个\n`;
        }
      });

      report += `\n`;
    });

    report += `处理完成！\n`;
    report += `所有数据已打包到此ZIP文件中。\n`;

    return report;
  }

  // 辅助方法：获取部分名称
  getSectionName(section) {
    const sectionNames = {
      introduce: '合金介绍',
      physicalChemistry: '物理化学性能',
      mechanical: '力学性能',
      craft: '工艺性能',
      microstructures: '组织结构'
    };
    return sectionNames[section] || section;
  }

  // 辅助方法：统计数据类型
  countDataTypes(items, callback) {
    items.forEach(item => {
      if (item.seriesData && item.seriesData.length > 0) {
        callback('chart');
      }
      if (item.tableData && item.tableData.length > 0) {
        callback('table');
      }

      // 递归处理多级数据
      ['two', 'third', 'fourth'].forEach(prop => {
        if (item[prop] && Array.isArray(item[prop])) {
          this.countDataTypes(item[prop], callback);
        }
      });
    });
  }

  // 新增：触发ZIP文件下载
  downloadZipFile(zipBlob, filename = null) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const defaultFilename = `材料数据_${timestamp}.zip`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = filename || defaultFilename;

    // 添加到页面并触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    console.log(`✓ ZIP文件下载已触发: ${link.download}`);
  }
}

/**
 * 网络数据处理器
 */
export class NetworkDataProcessor extends DataProcessor {
  constructor(baseUrl) {
    super(baseUrl);
  }

  // 从网络获取数据
  async fetchMaterialData(materialCode) {
    try {
      const response = await axios.get(`${this.baseUrl}/json/${materialCode}.json`);
      return response.data;
    } catch (error) {
      console.error(`获取材料数据失败 ${materialCode}:`, error);
      return null;
    }
  }

  // 从网络更新数据
  async updateMaterialData(materialCode, data) {
    try {
      const response = await axios.put(`${this.baseUrl}/api/materials/${materialCode}`, data);
      return response.data;
    } catch (error) {
      console.error(`更新材料数据失败 ${materialCode}:`, error);
      throw error;
    }
  }
}

// 显示处理结果的工具函数
export function showProcessingResults(results, materialCode) {
  if (!results || results.length === 0) {
    console.log('没有处理结果');
    return;
  }

  console.log(`\n=== ${materialCode} 数据处理结果 ===`);

  const summary = {
    success: 0,
    error: 0,
    warning: 0
  };

  results.forEach(result => {
    summary[result.status]++;

    const icon = result.status === 'success' ? '✓' :
                 result.status === 'error' ? '✗' : '⚠';

    console.log(`${icon} ${result.filename || result.type}: ${result.error || result.message || '成功'}`);
  });

  console.log(`\n总计: ${summary.success} 成功, ${summary.error} 失败, ${summary.warning} 警告`);
  console.log('=====================================\n');
}
