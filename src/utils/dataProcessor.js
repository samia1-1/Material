import * as XLSX from 'xlsx';
import axios from 'axios';
import JSZip from 'jszip';

// 常量配置
const REQUIRED_SECTIONS = ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'];
const SUPPORTED_EXTENSIONS = ['.json', '.xlsx'];
const TYPE_LABELS = { table: '表格数据', chart: '图表数据', text: '文本数据' };

/**
 * 数据处理工具类
 */
export class DataProcessor {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

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
      } else {
        data[section].forEach((item, index) => {
          if (!item?.name) errors.push(`${section}[${index}]缺少name字段`);
          if (item.tableData && !item.tableColumns) errors.push(`${section}[${index}]有表格数据但缺少tableColumns定义`);
          if (item.seriesData && !item.echartMsg) errors.push(`${section}[${index}]有图表数据但缺少echartMsg定义`);
        });
      }
    });
    return { isValid: errors.length === 0, errors };
  }

  checkJsonHasContent(data) {
    const hasItemContent = (item) => item?.name || item?.con || item?.tableData || item?.seriesData;
    const hasNestedContent = (item) => (item?.two && item.two.some(hasItemContent)) || (item?.third && item.third.some(hasItemContent));

    return REQUIRED_SECTIONS.some(section => {
      if (!Array.isArray(data[section])) return false;
      return data[section].some(item => hasItemContent(item) || hasNestedContent(item));
    });
  }

  updateAllTextData(textData, data) {
    this.ensureRequiredSections(data);
    const updateItem = (item, updateData) => {
      if (updateData.name && updateData.name !== item.name) item.name = updateData.name;
      if (updateData.con && updateData.con !== item.con) item.con = updateData.con;
    };

    Object.keys(textData).forEach(key => {
      if (!Array.isArray(textData[key])) return;
      if (!data[key] || data[key].length === 0) {
        data[key] = JSON.parse(JSON.stringify(textData[key]));
      } else {
        this.updateExistingStructure(data[key], textData[key], updateItem);
      }
    });
  }

  updateExistingStructure(dataArray, textArray, updateItem) {
    dataArray.forEach((item, index) => {
      if (textArray[index]) {
        updateItem(item, textArray[index]);
        if (item.two && textArray[index].two) {
          item.two.forEach((subItem, subIndex) => {
            if (textArray[index].two[subIndex]) {
              updateItem(subItem, textArray[index].two[subIndex]);
              if (subItem.third && textArray[index].two[subIndex].third) {
                subItem.third.forEach((thirdItem, thirdIndex) => {
                  if (textArray[index].two[subIndex].third[thirdIndex]) {
                    updateItem(thirdItem, textArray[index].two[subIndex].third[thirdIndex]);
                  }
                });
              }
            }
          });
        }
      }
    });
  }

  processAllSheets(sheetNames, workbook, data) {
    this.processDataWithMethod(data, (item) => this.safelyUpdateTableData(item, sheetNames, workbook));
  }

  processAllCharts(sheetNames, workbook, data) {
    this.processDataWithMethod(data, (item) => this.safelyUpdateChartData(item, sheetNames, workbook));
  }

  processDataWithMethod(data, method) {
    this.ensureRequiredSections(data);
    const processItem = (item) => {
      method(item);
      if (item.two) item.two.forEach(processItem);
      if (item.third) item.third.forEach(processItem);
    };
    Object.values(data).filter(Array.isArray).forEach(arr => arr.forEach(processItem));
  }

  /**
   * 提取工作表信息 - 支持前缀分组，正确处理下划线格式
   */
  extractSheetInfo(item, sheetNames) {
    if (!item?.name) return {};

    const nameIndex = item.name.indexOf('、');
    if (nameIndex <= 0) return {};

    const prefix = item.name.substring(0, nameIndex);
    const suffix = item.name.substring(nameIndex + 1);

    // 查找所有匹配相同前缀的工作表（考虑下划线格式：如 "3.9.1_图3-4"）
    const matchingSheets = sheetNames.filter(name => {
      // 检查是否以前缀开头
      if (!name.startsWith(prefix)) return false;

      // 检查前缀后是否直接是下划线或空格（避免部分匹配）
      const afterPrefix = name.substring(prefix.length);
      return afterPrefix.startsWith('_') || afterPrefix.startsWith(' ') || afterPrefix === '';
    });

    if (matchingSheets.length > 0) {
      return {
        prefix,
        suffix,
        sheetName: matchingSheets[0], // 主工作表
        allMatchingSheets: matchingSheets // 所有匹配的工作表
      };
    }

    return { prefix, suffix };
  }

  /**
   * 提取工作表来源标识 - 正确处理下划线分隔格式
   */
  extractSheetSourceTag(sheetName, prefix) {
    // 提取下划线后的部分作为标识（如：3.9.1_图3-4 -> 图3-4）
    let afterPrefix = sheetName.substring(prefix.length);

    // 移除开头的下划线或空格
    afterPrefix = afterPrefix.replace(/^[_\s]+/, '');

    // 匹配常见的图表标识格式
    const patterns = [
      /^图(\d+-\d+)/,     // 图3-1
      /^表(\d+-\d+)/,     // 表3-1
      /^(\d+-\d+)/,       // 3-1
      /^图(\d+)/,         // 图1
      /^表(\d+)/,         // 表1
      /图(\d+-\d+)/,      // 包含图3-1的文本
      /表(\d+-\d+)/,      // 包含表3-1的文本
      /(\d+-\d+)/         // 包含3-1的文本
    ];

    for (const pattern of patterns) {
      const match = afterPrefix.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    // 如果没有匹配到具体格式，返回清理后的完整后缀
    const cleanedSuffix = afterPrefix.replace(/^\s*图?\s*/, '').replace(/^\s*表?\s*/, '').trim();
    return cleanedSuffix || '数据';
  }

  /**
   * 检测并处理表格数据格式 - 针对表格数据的优化处理
   */
  detectAndProcessTableFormat(rawData, sheetName) {
    if (!rawData || rawData.length === 0) return null;

    console.log(`开始检测表格数据格式: ${sheetName}`);

    // 表格数据格式1: 复合格式（包含图号、条件信息等）
    if (this.isComplexTableFormat(rawData)) {
      return this.processComplexTableFormat(rawData, sheetName);
    }

    // 表格数据格式2: 图名称格式
    if (this.isImageNameFormat(rawData)) {
      return this.processImageNameFormat(rawData, sheetName);
    }

    // 表格数据格式3: 标准表格格式（有明确的表头）
    if (this.isStandardTableFormat(rawData)) {
      return this.processStandardTableFormat(rawData, sheetName);
    }

    // 表格数据格式4: 数值表格格式
    if (this.isNumericTableFormat(rawData)) {
      return this.processNumericTableFormat(rawData, sheetName);
    }

    console.warn(`${sheetName}: 未识别的表格格式，使用默认表格处理`);
    return this.processDefaultTableFormat(rawData, sheetName);
  }

  /**
   * 检测并处理图表数据格式 - 针对图表数据的特殊处理
   */
  detectAndProcessChartFormat(rawData, sheetName) {
    if (!rawData || rawData.length === 0) return null;

    console.log(`开始检测图表数据格式: ${sheetName}`);

    // 图表数据格式1: X-Y坐标对格式（两列数据，一列X值，一列Y值）
    if (this.isXYPairFormat(rawData)) {
      return this.processXYPairChartData(rawData, sheetName);
    }

    // 图表数据格式2: 多系列数据格式（多列数值数据）
    if (this.isMultiSeriesFormat(rawData)) {
      return this.processMultiSeriesChartData(rawData, sheetName);
    }

    // 图表数据格式3: 带图号的图表数据
    if (this.isImageNameFormat(rawData)) {
      return this.processImageNameChartData(rawData, sheetName);
    }

    // 图表数据格式4: 纯数值矩阵格式
    if (this.isNumericMatrixFormat(rawData)) {
      return this.processNumericMatrixChartData(rawData, sheetName);
    }

    console.warn(`${sheetName}: 未识别的图表数据格式，使用通用图表处理`);
    return this.processGenericChartData(rawData, sheetName);
  }

  /**
   * 检测是否为X-Y坐标对格式
   */
  isXYPairFormat(rawData) {
    if (!rawData || rawData.length < 3) return false;

    // 检查是否主要是两列数据，且都是数值
    const validRows = rawData.filter(row =>
      row && row.length >= 2 &&
      row.slice(0, 2).every(cell =>
        cell !== null && cell !== '' && !isNaN(parseFloat(cell))
      )
    );

    return validRows.length >= Math.ceil(rawData.length * 0.6);
  }

  /**
   * 处理X-Y坐标对图表数据 - 完全从Excel提取
   */
  processXYPairChartData(rawData, sheetName) {
    const chartData = [];
    let xColumnName = null;
    let yColumnName = null;

    // 检查第一行是否为表头
    const firstRow = rawData[0];
    let dataStartIndex = 0;

    if (firstRow && firstRow.length >= 2) {
      const firstRowValues = firstRow.slice(0, 2);
      const isHeaderRow = firstRowValues.some(cell =>
        cell && typeof cell === 'string' && isNaN(parseFloat(cell))
      );

      if (isHeaderRow) {
        xColumnName = firstRowValues[0] ? firstRowValues[0].toString().trim() : null;
        yColumnName = firstRowValues[1] ? firstRowValues[1].toString().trim() : null;
        dataStartIndex = 1;
      }
    }

    // 如果没有从Excel获取到列名，尝试从数据中推断
    if (!xColumnName || !yColumnName) {
      // 分析数据特征来推断轴名称
      const sampleData = rawData.slice(dataStartIndex, dataStartIndex + 5);
      if (sampleData.length > 0) {
        xColumnName = this.inferAxisNameFromData(sampleData, 0, sheetName);
        yColumnName = this.inferAxisNameFromData(sampleData, 1, sheetName);
      }
    }

    // 最后的保底命名（基于工作表名称）
    if (!xColumnName) xColumnName = this.generateAxisNameFromSheet(sheetName, 'X');
    if (!yColumnName) yColumnName = this.generateAxisNameFromSheet(sheetName, 'Y');

    // 处理数据行
    for (let i = dataStartIndex; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length < 2) continue;

      const xValue = parseFloat(row[0]);
      const yValue = parseFloat(row[1]);

      if (!isNaN(xValue) && !isNaN(yValue)) {
        chartData.push({
          [xColumnName]: xValue,
          [yColumnName]: yValue
        });
      }
    }

    console.log(`${sheetName}: 处理X-Y坐标对图表数据，X轴: ${xColumnName}, Y轴: ${yColumnName}, ${chartData.length}个数据点`);
    return chartData;
  }

  /**
   * 检测是否为多系列数据格式
   */
  isMultiSeriesFormat(rawData) {
    if (!rawData || rawData.length < 2) return false;

    // 检查是否有多列数值数据（至少3列）
    const sampleRows = rawData.slice(0, Math.min(5, rawData.length));
    return sampleRows.some(row => {
      if (!row || row.length < 3) return false;
      const numericCells = row.filter(cell =>
        cell !== null && cell !== '' && !isNaN(parseFloat(cell))
      );
      return numericCells.length >= 3;
    });
  }

  /**
   * 处理多系列图表数据 - 完全从Excel提取列名
   */
  processMultiSeriesChartData(rawData, sheetName) {
    const chartData = [];
    let columnNames = [];
    let dataStartIndex = 0;

    // 检查第一行是否为表头
    const firstRow = rawData[0];
    if (firstRow) {
      const hasStringHeaders = firstRow.some(cell =>
        cell && typeof cell === 'string' && isNaN(parseFloat(cell))
      );

      if (hasStringHeaders) {
        columnNames = firstRow.map((cell, index) => {
          if (cell && cell.toString().trim()) {
            return cell.toString().trim();
          } else {
            // 如果某列没有表头，基于位置和工作表生成
            return this.generateColumnNameFromSheet(sheetName, index);
          }
        });
        dataStartIndex = 1;
      } else {
        // 第一行是数据，需要从工作表名称和数据特征推断列名
        columnNames = firstRow.map((_, index) =>
          this.generateColumnNameFromSheet(sheetName, index)
        );
      }
    }

    // 处理数据行
    for (let i = dataStartIndex; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row) continue;

      const dataObj = {};
      let hasValidData = false;

      columnNames.forEach((colName, index) => {
        const value = row[index];
        if (value !== null && value !== undefined && value !== '') {
          const numericValue = parseFloat(value);
          if (!isNaN(numericValue)) {
            dataObj[colName] = numericValue;
            hasValidData = true;
          }
        }
      });

      if (hasValidData) {
        chartData.push(dataObj);
      }
    }

    console.log(`${sheetName}: 处理多系列图表数据，列名: [${columnNames.join(', ')}], ${chartData.length}行，${columnNames.length}系列`);
    return chartData;
  }

  /**
   * 检测是否为数值矩阵格式
   */
  isNumericMatrixFormat(rawData) {
    if (!rawData || rawData.length < 2) return false;

    // 检查是否为纯数值矩阵（90%以上的单元格都是数值）
    let totalCells = 0;
    let numericCells = 0;

    rawData.forEach(row => {
      if (row) {
        row.forEach(cell => {
          if (cell !== null && cell !== '') {
            totalCells++;
            if (!isNaN(parseFloat(cell))) {
              numericCells++;
            }
          }
        });
      }
    });

    return totalCells > 0 && (numericCells / totalCells) >= 0.9;
  }

  /**
   * 处理数值矩阵图表数据 - 从工作表名称推断列名
   */
  processNumericMatrixChartData(rawData, sheetName) {
    const chartData = [];

    // 根据工作表名称和数据特征生成列名
    const maxCols = Math.max(...rawData.map(row => row ? row.length : 0));
    const columnNames = Array.from({ length: maxCols }, (_, i) =>
      this.generateColumnNameFromSheet(sheetName, i)
    );

    // 处理所有行为数据行
    rawData.forEach((row, rowIndex) => {
      if (!row) return;

      const dataObj = {};
      let hasValidData = false;

      columnNames.forEach((colName, colIndex) => {
        const value = row[colIndex];
        if (value !== null && value !== undefined && value !== '') {
          const numericValue = parseFloat(value);
          if (!isNaN(numericValue)) {
            dataObj[colName] = numericValue;
            hasValidData = true;
          }
        }
      });

      if (hasValidData) {
        chartData.push(dataObj);
      }
    });

    console.log(`${sheetName}: 处理数值矩阵图表数据，列名: [${columnNames.join(', ')}], ${chartData.length}行，${columnNames.length}列`);
    return chartData;
  }

  /**
   * 检测是否为图名称格式（如：3.8.2 图3-1）
   */
  isImageNameFormat(rawData) {
    if (!rawData || rawData.length < 2) return false;

    // 检查第一行是否包含图号格式
    const firstRow = rawData[0];
    return firstRow && firstRow.some(cell =>
      cell && typeof cell === 'string' &&
      /\d+\.\d+\.\d+\s*图\d+-\d+/.test(cell.toString())
    );
  }

  /**
   * 处理带图名称的图表数据
   */
  processImageNameChartData(rawData, sheetName) {
    const result = this.processImageNameFormat(rawData, sheetName);
    if (!result) return null;

    // 转换为图表所需的格式，过滤非数值数据
    return result.data.map(row => {
      const chartRow = {};
      result.columns.forEach(col => {
        const value = row[col.prop];
        if (typeof value === 'number') {
          chartRow[col.label] = value;
        } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          chartRow[col.label] = parseFloat(value);
        }
      });
      return chartRow;
    }).filter(row => Object.keys(row).length > 0);
  }

  /**
   * 安全更新表格数据 - 支持多工作表合并
   */
  safelyUpdateTableData(item, sheetNames, workbook) {
    const { prefix, allMatchingSheets } = this.extractSheetInfo(item, sheetNames);
    if (!allMatchingSheets || allMatchingSheets.length === 0) return;

    try {
      let combinedData = [];
      let combinedColumns = [];
      let processedSheets = [];

      // 处理所有匹配的工作表
      for (const sheetName of allMatchingSheets) {
        if (!workbook.Sheets[sheetName]) continue;

        const worksheet = workbook.Sheets[sheetName];

        // 检查工作表是否为空
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        if (range.e.r < range.s.r || range.e.c < range.s.c) {
          console.warn(`工作表"${sheetName}"为空`);
          continue;
        }

        // 读取原始数据
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false
        });

        if (!rawData || rawData.length === 0) {
          console.warn(`工作表"${sheetName}"没有数据`);
          continue;
        }

        // 检测数据格式并处理
        const processedResult = this.detectAndProcessTableFormat(rawData, sheetName);

        if (processedResult && processedResult.data.length > 0) {
          // 为数据添加来源标识
          const sourceTag = this.extractSheetSourceTag(sheetName, prefix);
          const taggedData = processedResult.data.map(row => ({
            ...row,
            _source: sourceTag
          }));

          // 合并数据
          if (combinedData.length === 0) {
            // 第一个表格，直接使用其列结构
            combinedData = taggedData;
            combinedColumns = this.addSourceColumnToColumns(processedResult.columns);
          } else {
            // 后续表格，需要统一列结构
            const unifiedData = this.unifyTableStructure(combinedData, taggedData, processedResult.columns);
            combinedData = unifiedData.data;
            combinedColumns = unifiedData.columns;
          }

          processedSheets.push(sheetName);
          console.log(`处理工作表"${sheetName}": ${processedResult.data.length}行数据`);
        }
      }

      if (combinedData.length > 0) {
        item.tableData = combinedData;
        item.tableColumns = combinedColumns;
        console.log(`成功合并表格数据"${prefix}": 共${combinedData.length}行数据，来自${processedSheets.length}个工作表: ${processedSheets.join(', ')}`);
      } else {
        console.warn(`前缀"${prefix}"的所有工作表处理后没有有效数据`);
      }
    } catch (error) {
      console.warn(`处理"${item.name}"的表格数据时出错:`, error);
    }
  }

  /**
   * 安全更新图表数据 - 支持多工作表合并
   */
  safelyUpdateChartData(item, sheetNames, workbook) {
    const { prefix, suffix, allMatchingSheets } = this.extractSheetInfo(item, sheetNames);
    if (!allMatchingSheets || allMatchingSheets.length === 0) return;

    try {
      let combinedSeriesData = [];
      let allChartData = [];
      let processedSheets = [];

      // 处理所有匹配的工作表
      for (const sheetName of allMatchingSheets) {
        if (!workbook.Sheets[sheetName]) continue;

        const worksheet = workbook.Sheets[sheetName];

        // 检查工作表是否为空
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        if (range.e.r < range.s.r || range.e.c < range.s.c) {
          console.warn(`图表工作表"${sheetName}"为空`);
          continue;
        }

        // 读取原始数据
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          blankrows: false
        });

        if (!rawData || rawData.length === 0) {
          console.warn(`图表工作表"${sheetName}"没有数据`);
          continue;
        }

        // 检测并处理图表数据格式
        const chartData = this.detectAndProcessChartFormat(rawData, sheetName);

        if (chartData && chartData.length > 0) {
          const sheetSuffix = this.extractSheetSourceTag(sheetName, prefix);
          const seriesData = this.createChartSeries(chartData, sheetSuffix);

          if (seriesData && seriesData.length > 0) {
            // 为系列数据添加来源标识
            const taggedSeries = seriesData.map(series => ({
              ...series,
              name: `${series.name} (${sheetSuffix})`
            }));

            combinedSeriesData.push(...taggedSeries);
            allChartData.push(...chartData);
            processedSheets.push(sheetName);
            console.log(`处理图表工作表"${sheetName}": ${seriesData.length}个数据系列`);
          }
        }
      }

      if (combinedSeriesData.length > 0) {
        item.seriesData = combinedSeriesData;
        item.echartMsg = {
          echartId: Math.floor(Math.random() * 1000000),
          xName: this.getXAxisName(allChartData[0] || {}),
          yName: this.getYAxisName(allChartData[0] || {}),
          minX: this.getMinValue(combinedSeriesData, 'x'),
          minY: this.getMinValue(combinedSeriesData, 'y')
        };
        console.log(`成功合并图表数据"${prefix}": 共${combinedSeriesData.length}个数据系列，来自${processedSheets.length}个工作表: ${processedSheets.join(', ')}`);
      } else {
        console.warn(`前缀"${prefix}"的所有图表工作表没有有效数据`);
      }
    } catch (error) {
      console.warn(`处理"${item.name}"的图表数据时出错:`, error);
    }
  }

  /**
   * 处理图名称格式的数据 - 通用方法，表格和图表都可使用
   */
  processImageNameFormat(rawData, sheetName) {
    const processedData = [];
    const columns = [];

    // 查找图名称行
    let imageNameRow = null;
    let dataStartRow = -1;

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && row.some(cell =>
        cell && typeof cell === 'string' &&
        /\d+\.\d+\.\d+\s*图\d+-\d+/.test(cell.toString())
      )) {
        imageNameRow = row;
        dataStartRow = i + 1;
        break;
      }
    }

    if (!imageNameRow || dataStartRow === -1) {
      console.warn(`${sheetName}: 未找到图名称行`);
      return null;
    }

    // 提取列名（图名称 + 条件信息）
    const imageNames = imageNameRow.filter(cell =>
      cell && cell.toString().trim() !== ''
    );

    // 查找条件行（第二行通常是条件描述）
    let conditionRow = null;
    let actualDataStart = dataStartRow;

    if (dataStartRow < rawData.length) {
      const potentialConditionRow = rawData[dataStartRow];
      if (potentialConditionRow && potentialConditionRow.some(cell =>
        cell && typeof cell === 'string' &&
        (cell.includes('℃') || cell.includes('R=') || cell.includes('Kt=') ||
         cell.includes('MPa') || cell.includes('试样') || cell.includes('取样'))
      )) {
        conditionRow = potentialConditionRow;
        actualDataStart = dataStartRow + 1;
      }
    }

    // 构建列名
    imageNames.forEach((imageName, index) => {
      let columnName = imageName.toString();
      if (conditionRow && conditionRow[index]) {
        const condition = conditionRow[index].toString().trim();
        if (condition && condition !== '') {
          columnName += ` (${condition})`;
        }
      }
      columns.push({
        label: columnName,
        prop: `col_${index}`
      });
    });

    // 处理数据行
    for (let i = actualDataStart; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.every(cell => !cell && cell !== 0)) continue;

      const dataObj = {};
      let hasValidData = false;

      columns.forEach((col, index) => {
        const value = row[index];
        if (value !== undefined && value !== null && value !== '') {
          dataObj[col.prop] = this.parseNumericValue(value);
          hasValidData = true;
        } else {
          dataObj[col.prop] = '';
        }
      });

      if (hasValidData) {
        processedData.push(dataObj);
      }
    }

    console.log(`${sheetName}: 检测到图名称格式，处理了${imageNames.length}列，${processedData.length}行数据`);
    return { data: processedData, columns };
  }

  /**
   * 检测是否为复合格式表格
   */
  isComplexTableFormat(rawData) {
    if (!rawData || rawData.length < 2) return false;

    // 检查前几行是否包含图号、条件信息等复合结构
    const firstFewRows = rawData.slice(0, Math.min(5, rawData.length));

    let hasFigureInfo = false;
    let hasConditionInfo = false;
    let hasDataRows = false;

    firstFewRows.forEach(row => {
      if (!row) return;

      row.forEach(cell => {
        if (!cell) return;
        const cellStr = cell.toString();

        // 检测图号信息
        if (/\d+\.\d+\.\d+/.test(cellStr) || /图\d+-\d+/.test(cellStr) || /表\d+-\d+/.test(cellStr)) {
          hasFigureInfo = true;
        }

        // 检测条件信息
        if (cellStr.includes('℃') || cellStr.includes('°C') || cellStr.includes('MPa') ||
            cellStr.includes('R=') || cellStr.includes('试样') || cellStr.includes('取样')) {
          hasConditionInfo = true;
        }
      });

      // 检测数据行
      const numericCells = row.filter(cell =>
        cell !== null && cell !== '' && !isNaN(parseFloat(cell))
      );
      if (numericCells.length >= 2) {
        hasDataRows = true;
      }
    });

    return hasFigureInfo && (hasConditionInfo || hasDataRows);
  }

  /**
   * 专门处理复合格式表格数据（包含图号和条件信息）
   */
  processComplexTableFormat(rawData, sheetName) {
    const processedData = [];
    const columns = [];

    // 查找图号行（第一行包含图号信息）
    let figureRow = null;
    let conditionRow = null;
    let dataStartRow = -1;

    // 分析前几行结构
    for (let i = 0; i < Math.min(5, rawData.length); i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      // 检查是否包含图号格式
      const hasFigureNumber = row.some(cell =>
        cell && typeof cell === 'string' &&
        (/\d+\.\d+\.\d+/.test(cell) || /图\d+-\d+/.test(cell) || /表\d+-\d+/.test(cell))
      );

      if (hasFigureNumber && !figureRow) {
        figureRow = row;
        continue;
      }

      // 检查是否包含条件信息（温度、应变率等）
      const hasCondition = row.some(cell =>
        cell && typeof cell === 'string' &&
        (cell.includes('℃') || cell.includes('°C') || cell.includes('R=') ||
         cell.includes('Kt=') || cell.includes('σ') || cell.includes('MPa') ||
         cell.includes('试样') || cell.includes('取样'))
      );

      if (hasCondition && !conditionRow) {
        conditionRow = row;
        continue;
      }

      // 检查是否是数据行（包含数值）
      const hasNumericData = row.some(cell =>
        cell !== null && cell !== '' && !isNaN(parseFloat(cell))
      );

      if (hasNumericData && dataStartRow === -1) {
        dataStartRow = i;
        break;
      }
    }

    // 如果没有找到明确的数据开始行，从第一个非空行开始
    if (dataStartRow === -1) {
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        if (row && row.some(cell => cell !== null && cell !== '')) {
          dataStartRow = i;
          break;
        }
      }
    }

    // 构建列定义
    const maxCols = Math.max(...rawData.slice(0, dataStartRow + 5).map(row => row ? row.length : 0));

    for (let colIndex = 0; colIndex < maxCols; colIndex++) {
      let columnName = `列${colIndex + 1}`;

      // 从图号行获取信息
      if (figureRow && figureRow[colIndex]) {
        const figureInfo = figureRow[colIndex].toString().trim();
        if (figureInfo) {
          columnName = figureInfo;
        }
      }

      // 添加条件信息
      if (conditionRow && conditionRow[colIndex]) {
        const conditionInfo = conditionRow[colIndex].toString().trim();
        if (conditionInfo && !columnName.includes(conditionInfo)) {
          columnName += ` (${conditionInfo})`;
        }
      }

      // 检查该列是否有有效数据
      const hasData = rawData.slice(dataStartRow).some(row =>
        row && row[colIndex] !== null && row[colIndex] !== ''
      );

      if (hasData) {
        columns.push({
          label: columnName,
          prop: `col_${colIndex}`
        });
      }
    }

    // 处理数据行
    for (let i = dataStartRow; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.every(cell => cell === null || cell === '')) continue;

      const dataObj = {};
      let hasValidData = false;

      columns.forEach((col, index) => {
        const colIndex = parseInt(col.prop.split('_')[1]);
        const value = row[colIndex];

        if (value !== undefined && value !== null && value !== '') {
          // 尝试解析为数值
          const numericValue = parseFloat(value);
          dataObj[col.prop] = isNaN(numericValue) ? value : numericValue;
          hasValidData = true;
        } else {
          dataObj[col.prop] = '';
        }
      });

      if (hasValidData) {
        processedData.push(dataObj);
      }
    }

    console.log(`${sheetName}: 处理复合格式表格，列名: [${columns.map(c => c.label).join(', ')}], ${columns.length}列，${processedData.length}行数据`);
    return { data: processedData, columns };
  }

  /**
   * 检测标准表格格式
   */
  isStandardTableFormat(rawData) {
    return rawData && rawData.length >= 2 &&
           !this.isImageNameFormat(rawData) &&
           !this.isComplexTableFormat(rawData) &&
           !this.isNumericMatrixFormat(rawData);
  }

  /**
   * 处理标准表格格式 - 完全从Excel提取列名
   */
  processStandardTableFormat(rawData, sheetName) {
    const processedData = [];
    const columns = [];

    // 查找第一行非空数据作为参考
    let firstDataRow = null;
    let dataStartIndex = 0;

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && row.some(cell => cell !== null && cell !== '')) {
        firstDataRow = row;
        dataStartIndex = i;
        break;
      }
    }

    if (!firstDataRow) return null;

    // 检查第一行是否为表头
    const isHeaderRow = firstDataRow.some(cell =>
      cell && typeof cell === 'string' && isNaN(parseFloat(cell))
    );

    if (isHeaderRow) {
      // 第一行是表头，直接使用
      firstDataRow.forEach((cell, index) => {
        if (cell !== null && cell !== '') {
          columns.push({
            label: cell.toString().trim(),
            prop: `col_${index}`
          });
        }
      });
      dataStartIndex = dataStartIndex + 1;
    } else {
      // 第一行是数据，需要生成列名
      firstDataRow.forEach((cell, index) => {
        if (cell !== null && cell !== '') {
          const columnName = this.generateTableColumnName(sheetName, index, cell);
          columns.push({
            label: columnName,
            prop: `col_${index}`
          });
        }
      });
    }

    // 处理数据行
    for (let i = dataStartIndex; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.every(cell => cell === null || cell === '')) continue;

      const dataObj = {};
      let hasValidData = false;

      columns.forEach((col, index) => {
        const colIndex = parseInt(col.prop.split('_')[1]);
        const value = row[colIndex];

        if (value !== undefined && value !== null && value !== '') {
          dataObj[col.prop] = this.parseNumericValue(value);
          hasValidData = true;
        } else {
          dataObj[col.prop] = '';
        }
      });

      if (hasValidData) {
        processedData.push(dataObj);
      }
    }

    console.log(`${sheetName}: 处理标准表格格式，列名: [${columns.map(c => c.label).join(', ')}], ${columns.length}列，${processedData.length}行数据`);
    return { data: processedData, columns };
  }

  /**
   * 生成表格列名 - 基于工作表名称和数据特征
   */
  generateTableColumnName(sheetName, columnIndex, sampleValue) {
    // 根据数据值的特征推断列名
    if (typeof sampleValue === 'number' || !isNaN(parseFloat(sampleValue))) {
      const numValue = parseFloat(sampleValue);

      // 根据数值范围推断可能的物理量
      if (numValue >= 0 && numValue <= 100 && columnIndex === 0) {
        return '应变 (%)';
      } else if (numValue >= 100 && numValue <= 2000) {
        return '应力 (MPa)';
      } else if (numValue >= 0 && numValue <= 1000 && sheetName.toLowerCase().includes('温度')) {
        return '温度 (℃)';
      } else if (numValue >= 0 && numValue <= 50) {
        return '延伸率 (%)';
      }
    }

    // 从工作表名称推断
    const lowerSheetName = sheetName.toLowerCase();
    if (lowerSheetName.includes('化学成分') || lowerSheetName.includes('成分')) {
      const elements = ['C', 'Cr', 'Ni', 'Fe', 'Al', 'Ti', 'Co', 'W', 'Mo', 'Nb', 'Ta'];
      if (columnIndex < elements.length) {
        return elements[columnIndex];
      } else {
        return `元素${columnIndex + 1}`;
      }
    } else if (lowerSheetName.includes('力学性能') || lowerSheetName.includes('mechanical')) {
      const properties = ['抗拉强度 (MPa)', '屈服强度 (MPa)', '延伸率 (%)', '断面收缩率 (%)', '硬度'];
      if (columnIndex < properties.length) {
        return properties[columnIndex];
      }
    } else if (lowerSheetName.includes('物理性能') || lowerSheetName.includes('physical')) {
      const properties = ['密度 (g/cm³)', '熔点 (℃)', '热膨胀系数', '热导率', '电阻率'];
      if (columnIndex < properties.length) {
        return properties[columnIndex];
      }
    }

    // 提取工作表中的图表标识
    const match = sheetName.match(/图(\d+-\d+)|表(\d+-\d+)/);
    const identifier = match ? match[1] || match[2] : '数据';

    return `${identifier}_${columnIndex + 1}`;
  }

  /**
   * 处理数值表格格式 - 从Excel和工作表名称推断列名
   */
  processNumericTableFormat(rawData, sheetName) {
    const processedData = [];
    const columns = [];

    // 查找第一行非空数据作为参考
    let firstDataRow = null;
    let dataStartIndex = 0;

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && row.some(cell => cell !== null && cell !== '')) {
        firstDataRow = row;
        dataStartIndex = i;
        break;
      }
    }

    if (!firstDataRow) return null;

    // 生成列定义（完全基于数据特征和工作表名称）
    firstDataRow.forEach((cell, index) => {
      if (cell !== null && cell !== '') {
        const columnName = this.generateTableColumnName(sheetName, index, cell);
        columns.push({
          label: columnName,
          prop: `col_${index}`
        });
      }
    });

    // 处理数据行
    for (let i = dataStartIndex; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.every(cell => cell === null || cell === '')) continue;

      const dataObj = {};
      let hasValidData = false;

      columns.forEach((col, index) => {
        const colIndex = parseInt(col.prop.split('_')[1]);
        const value = row[colIndex];

        if (value !== undefined && value !== null && value !== '') {
          const numericValue = parseFloat(value);
          dataObj[col.prop] = isNaN(numericValue) ? value : numericValue;
          hasValidData = true;
        } else {
          dataObj[col.prop] = '';
        }
      });

      if (hasValidData) {
        processedData.push(dataObj);
      }
    }

    console.log(`${sheetName}: 处理数值表格格式，列名: [${columns.map(c => c.label).join(', ')}], ${columns.length}列，${processedData.length}行数据`);
    return { data: processedData, columns };
  }

  /**
   * 创建图表系列数据 - 基于从Excel提取的数据
   */
  createChartSeries(chartData, sourceTag) {
    if (!chartData || chartData.length === 0) return [];

    const columnNames = Object.keys(chartData[0]);
    const seriesData = [];

    // 如果只有两列数据，创建单个系列
    if (columnNames.length === 2) {
      const xColumn = columnNames[0];
      const yColumn = columnNames[1];

      const data = chartData.map(row => [row[xColumn], row[yColumn]]);

      seriesData.push({
        name: sourceTag || yColumn,
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4
      });
    } else if (columnNames.length > 2) {
      // 多列数据，第一列作为X轴，其余列各自成为一个系列
      const xColumn = columnNames[0];

      for (let i = 1; i < columnNames.length; i++) {
        const yColumn = columnNames[i];
        const data = chartData.map(row => [row[xColumn], row[yColumn]]);

        seriesData.push({
          name: `${yColumn}${sourceTag ? ` (${sourceTag})` : ''}`,
          type: 'line',
          data: data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 4
        });
      }
    }

    console.log(`创建图表系列: ${seriesData.length}个系列，系列名: [${seriesData.map(s => s.name).join(', ')}]`);
    return seriesData;
  }

  /**
   * 获取数值的最小值 - 从系列数据中提取
   */
  getMinValue(seriesData, axis) {
    if (!seriesData || seriesData.length === 0) return 0;

    const axisIndex = axis === 'x' ? 0 : 1;
    let minValue = Infinity;

    seriesData.forEach(series => {
      if (series.data && Array.isArray(series.data)) {
        series.data.forEach(point => {
          if (Array.isArray(point) && point.length > axisIndex) {
            const value = parseFloat(point[axisIndex]);
            if (!isNaN(value) && value < minValue) {
              minValue = value;
            }
          }
        });
      }
    });

    return minValue === Infinity ? 0 : minValue;
  }

  /**
   * 为表格列添加来源列
   */
  addSourceColumnToColumns(columns) {
    const result = [...columns];

    // 添加来源列
    result.push({
      label: '数据来源',
      prop: '_source'
    });

    return result;
  }

  /**
   * 统一表格结构 - 处理多个工作表的列差异
   */
  unifyTableStructure(existingData, newData, newColumns) {
    // 合并列定义
    const allColumns = [...existingData.length > 0 ?
      Object.keys(existingData[0]).filter(key => key !== '_source').map((key, index) => ({
        label: `列${index + 1}`,
        prop: key
      })) : [],
      ...newColumns
    ];

    // 去重列定义
    const uniqueColumns = [];
    const seenProps = new Set();

    allColumns.forEach(col => {
      if (!seenProps.has(col.prop)) {
        uniqueColumns.push(col);
        seenProps.add(col.prop);
      }
    });

    // 添加来源列
    uniqueColumns.push({
      label: '数据来源',
      prop: '_source'
    });

    // 统一数据结构
    const unifiedData = [...existingData, ...newData];

    return {
      data: unifiedData,
      columns: uniqueColumns
    };
  }

  ensureRequiredSections(data) {
    REQUIRED_SECTIONS.forEach(section => {
      if (!data[section]) {
        data[section] = [];
      }
    });
  }

  ensureDataIntegrity(data, details) {
    this.ensureRequiredSections(data);

    // 确保所有项目都有必要的字段
    Object.values(data).filter(Array.isArray).forEach(section => {
      section.forEach(item => {
        if (!item.name) item.name = '';
        if (!item.con) item.con = '';

        // 处理嵌套结构
        if (item.two && Array.isArray(item.two)) {
          item.two.forEach(subItem => {
            if (!subItem.name) subItem.name = '';
            if (!subItem.con) subItem.con = '';

            if (subItem.third && Array.isArray(subItem.third)) {
              subItem.third.forEach(thirdItem => {
                if (!thirdItem.name) thirdItem.name = '';
                if (!thirdItem.con) thirdItem.con = '';
              });
            }
          });
        }
      });
    });

    console.log('数据完整性检查完成:', details);
  }

  async processTextDataFromUploadedFiles(data) {
    const textFiles = this.uploadedFiles.filter(file =>
      file.name.includes('文本') && file.name.endsWith('.json')
    );

    if (textFiles.length === 0) {
      throw new Error('未找到文本数据文件');
    }

    for (const file of textFiles) {
      const textData = await this.readJsonFile(file);
      if (textData) {
        this.updateAllTextData(textData, data);
        console.log(`成功处理文本文件: ${file.name}`);
      }
    }
  }

  async processTextDataFromFolder(folderInfo, data) {
    const textFilename = `文本${folderInfo.materialCode}.json`;
    const fileUrl = this.buildFileUrl(folderInfo.folderPath, textFilename);

    try {
      const response = await axios.get(fileUrl, { timeout: 15000 });
      if (response.data) {
        this.updateAllTextData(response.data, data);
        console.log(`成功处理网络文本文件: ${textFilename}`);
      }
    } catch (error) {
      throw new Error(`无法获取文本文件: ${textFilename}`);
    }
  }

  validateMergedDataStructure(data) {
    const errors = [];

    // 检查基本结构
    REQUIRED_SECTIONS.forEach(section => {
      if (!data[section]) {
        errors.push(`缺少必需的部分: ${section}`);
      } else if (!Array.isArray(data[section])) {
        errors.push(`${section}不是数组格式`);
      }
    });

    // 检查数据内容
    let hasContent = false;
    REQUIRED_SECTIONS.forEach(section => {
      if (data[section] && Array.isArray(data[section]) && data[section].length > 0) {
        hasContent = true;
      }
    });

    if (!hasContent) {
      errors.push('数据结构为空，没有实际内容');
    }

    return { isValid: errors.length === 0, errors };
  }

  ensureRenderingCompatibility(data) {
    // 确保数据结构兼容渲染要求
    this.ensureRequiredSections(data);

    Object.keys(data).forEach(section => {
      if (Array.isArray(data[section])) {
        data[section].forEach(item => {
          // 确保基本字段存在
          if (!item.name) item.name = '';
          if (!item.con) item.con = '';

          // 确保表格数据格式正确
          if (item.tableData && !item.tableColumns) {
            if (Array.isArray(item.tableData) && item.tableData.length > 0) {
              const firstRow = item.tableData[0];
              item.tableColumns = Object.keys(firstRow).map(key => ({
                label: key,
                prop: key
              }));
            }
          }

          // 确保图表数据格式正确
          if (item.seriesData && !item.echartMsg) {
            item.echartMsg = {
              echartId: Math.floor(Math.random() * 1000000),
              xName: '数据轴',
              yName: '值',
              minX: 0,
              minY: 0
            };
          }
        });
      }
    });

    return data;
  }

  getMaterialTypeInfo(materialCode) {
    // 根据材料代码确定材料类型
    const codePrefix = materialCode.substring(0, 2).toUpperCase();

    const typeMap = {
      'GH': { typeIndex: '1', typeName: '固溶强化型变形高温合金' },
      'K4': { typeIndex: '2', typeName: '等轴晶铸造高温合金' },
      'K2': { typeIndex: '2', typeName: '等轴晶铸造高温合金' },
      'K6': { typeIndex: '2', typeName: '等轴晶铸造高温合金' },
      'K8': { typeIndex: '2', typeName: '等轴晶铸造高温合金' },
      'DZ': { typeIndex: '4', typeName: '定向凝固柱晶高温合金' },
      'DD': { typeIndex: '5', typeName: '单晶高温合金' },
      'FG': { typeIndex: '6', typeName: '粉末冶金高温合金' }
    };

    // 检查更具体的匹配
    if (materialCode.startsWith('GH2') || materialCode.startsWith('GH4') || materialCode.startsWith('GH6')) {
      return { typeIndex: '3', typeName: '沉淀硬化型变形高温合金' };
    }

    // 默认匹配前两位
    return typeMap[codePrefix] || { typeIndex: '1', typeName: '固溶强化型变形高温合金' };
  }

  extractKeyInformation(data) {
    const components = new Set();
    const crafts = new Set();
    let density = null;

    // 从introduce部分提取成分信息
    if (data.introduce && Array.isArray(data.introduce)) {
      data.introduce.forEach(item => {
        if (item.name && item.name.includes('化学成分')) {
          if (item.tableData && Array.isArray(item.tableData)) {
            item.tableData.forEach(row => {
              Object.keys(row).forEach(key => {
                if (key !== '元素' && key !== 'Element' && key.length <= 3) {
                  components.add(key);
                }
              });
            });
          }
        }

        if (item.name && item.name.includes('密度')) {
          if (item.con) {
            const densityMatch = item.con.match(/(\d+\.?\d*)/);
            if (densityMatch) {
              density = parseFloat(densityMatch[1]);
            }
          }
        }
      });
    }

    // 从craft部分提取工艺信息
    if (data.craft && Array.isArray(data.craft)) {
      data.craft.forEach((item, index) => {
        if (item.name) {
          crafts.add(index + 1); // 工艺编号从1开始
        }
      });
    }

    return {
      components: Array.from(components),
      crafts: Array.from(crafts),
      density: density
    };
  }

  /**
   * 从数据特征推断轴名称
   */
  inferAxisNameFromData(sampleData, columnIndex, sheetName) {
    // 分析数据值范围和特征来推断可能的轴名称
    const values = sampleData.map(row => row && row[columnIndex] ? parseFloat(row[columnIndex]) : null)
                             .filter(v => !isNaN(v));

    if (values.length === 0) {
      return this.generateAxisNameFromSheet(sheetName, columnIndex === 0 ? 'X' : 'Y');
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    // 根据数值范围推断可能的物理量
    if (columnIndex === 0) { // X轴
      if (min >= 0 && max <= 100 && range > 10) {
        return '应变 (%)';
      } else if (min >= 0 && max <= 1000 && range > 50) {
        return '温度 (℃)';
      } else if (min >= 0 && max <= 10 && range > 1) {
        return '时间 (s)';
      } else {
        return this.extractAxisNameFromSheetName(sheetName, 'X');
      }
    } else { // Y轴
      if (min >= 0 && max <= 2000 && range > 100) {
        return '应力 (MPa)';
      } else if (min >= 0 && max <= 100 && range > 5) {
        return '强度 (MPa)';
      } else if (min >= 0 && max <= 20 && range > 1) {
        return '延伸率 (%)';
      } else {
        return this.extractAxisNameFromSheetName(sheetName, 'Y');
      }
    }
  }

  /**
   * 从工作表名称提取轴名称
   */
  extractAxisNameFromSheetName(sheetName, axis) {
    // 从工作表名称中提取有意义的信息
    const lowerSheetName = sheetName.toLowerCase();

    // 常见的材料测试相关词汇映射
    const testTypeMap = {
      '拉伸': axis === 'X' ? '应变 (%)' : '应力 (MPa)',
      '压缩': axis === 'X' ? '应变 (%)' : '应力 (MPa)',
      '疲劳': axis === 'X' ? '循环次数' : '应力 (MPa)',
      '蠕变': axis === 'X' ? '时间 (h)' : '应变 (%)',
      '持久': axis === 'X' ? '时间 (h)' : '应力 (MPa)',
      '硬度': axis === 'X' ? '位置' : '硬度值',
      '冲击': axis === 'X' ? '温度 (℃)' : '冲击功 (J)',
      '温度': axis === 'X' ? '温度 (℃)' : '性能值',
      'stress': axis === 'X' ? 'Strain (%)' : 'Stress (MPa)',
      'strain': axis === 'X' ? 'Strain (%)' : 'Stress (MPa)',
      'temp': axis === 'X' ? 'Temperature (℃)' : 'Property'
    };

    for (const [keyword, axisName] of Object.entries(testTypeMap)) {
      if (lowerSheetName.includes(keyword)) {
        return axisName;
      }
    }

    // 如果没有匹配到，使用工作表名称的一部分
    const cleanSheetName = sheetName.replace(/[_\-\d\.]/g, ' ').trim();
    return `${cleanSheetName}_${axis}轴`;
  }

  /**
   * 基于工作表名称生成轴名称
   */
  generateAxisNameFromSheet(sheetName, axis) {
    // 首先尝试从工作表名称提取有意义的信息
    const extracted = this.extractAxisNameFromSheetName(sheetName, axis);
    if (extracted !== `${sheetName}_${axis}轴`) {
      return extracted;
    }

    // 从工作表名称中提取图表标识
    const match = sheetName.match(/图(\d+-\d+)|表(\d+-\d+)|(\d+\.\d+\.\d+)/);
    if (match) {
      const identifier = match[1] || match[2] || match[3];
      return `${identifier}_${axis}轴`;
    }

    // 最后的保底方案
    return `${sheetName}_${axis}轴`;
  }

  /**
   * 基于工作表名称生成列名
   */
  generateColumnNameFromSheet(sheetName, columnIndex) {
    // 首先尝试从工作表名称提取有意义的信息
    const lowerSheetName = sheetName.toLowerCase();

    // 根据列索引和工作表内容推断列名
    if (columnIndex === 0) {
      if (lowerSheetName.includes('拉伸') || lowerSheetName.includes('压缩')) {
        return '应变 (%)';
      } else if (lowerSheetName.includes('温度') || lowerSheetName.includes('temp')) {
        return '温度 (℃)';
      } else if (lowerSheetName.includes('时间') || lowerSheetName.includes('time')) {
        return '时间';
      } else {
        return '数据1';
      }
    } else if (columnIndex === 1) {
      if (lowerSheetName.includes('拉伸') || lowerSheetName.includes('压缩')) {
        return '应力 (MPa)';
      } else if (lowerSheetName.includes('硬度')) {
        return '硬度值';
      } else if (lowerSheetName.includes('冲击')) {
        return '冲击功 (J)';
      } else {
        return '数据2';
      }
    } else {
      // 对于更多列，尝试从工作表名称推断
      const match = sheetName.match(/图(\d+-\d+)|表(\d+-\d+)/);
      const identifier = match ? match[1] || match[2] : sheetName;
      return `${identifier}_列${columnIndex + 1}`;
    }
  }

  /**
   * 获取X轴名称 - 从图表数据中动态获取
   */
  getXAxisName(chartData) {
    if (!chartData || chartData.length === 0) return '数据点';

    const columnNames = Object.keys(chartData[0]);
    if (columnNames.length === 0) return '数据点';

    // 使用第一个列名作为X轴（已经在数据处理时确定了合适的名称）
    return columnNames[0];
  }

  /**
   * 获取Y轴名称 - 从图表数据中动态获取
   */
  getYAxisName(chartData) {
    if (!chartData || chartData.length === 0) return '数值';

    const columnNames = Object.keys(chartData[0]);
    if (columnNames.length <= 1) return '数值';

    // 如果只有两列，第二列作为Y轴
    if (columnNames.length === 2) {
      return columnNames[1];
    }

    // 多列时，查找最可能的Y轴列（排除第一列）
    const yAxisCandidates = columnNames.slice(1);
    const stressColumns = yAxisCandidates.filter(name =>
      name.toLowerCase().includes('应力') ||
      name.toLowerCase().includes('stress') ||
      name.toLowerCase().includes('mpa')
    );

    if (stressColumns.length > 0) {
      return stressColumns[0];
    }

    // 返回第二列作为默认Y轴
    return yAxisCandidates[0] || '数值';
  }

  /**
   * 检测是否为数值表格格式
   */
  isNumericTableFormat(rawData) {
    if (!rawData || rawData.length < 1) return false;

    // 检查是否主要包含数值数据
    const sampleRows = rawData.slice(0, Math.min(3, rawData.length));
    let numericRowCount = 0;

    sampleRows.forEach(row => {
      if (!row) return;
      const numericCells = row.filter(cell =>
        cell !== null && cell !== '' && !isNaN(parseFloat(cell))
      );
      const totalCells = row.filter(cell => cell !== null && cell !== '').length;

      if (totalCells > 0 && numericCells.length / totalCells >= 0.6) {
        numericRowCount++;
      }
    });

    return numericRowCount >= Math.ceil(sampleRows.length / 2);
  }

  /**
   * 默认表格处理格式
   */
  processDefaultTableFormat(rawData, sheetName) {
    const processedData = [];
    const columns = [];

    // 查找第一行有效数据
    let headerRow = rawData[0];
    let dataStartIndex = 1;

    // 如果第一行为空，查找下一个非空行
    if (!headerRow || headerRow.every(cell => !cell)) {
      for (let i = 1; i < rawData.length; i++) {
        if (rawData[i] && rawData[i].some(cell => cell)) {
          headerRow = rawData[i];
          dataStartIndex = i + 1;
          break;
        }
      }
    }

    if (!headerRow) return null;

    // 生成列定义
    headerRow.forEach((cell, index) => {
      const columnName = cell ? cell.toString().trim() : this.generateTableColumnName(sheetName, index, cell);
      if (columnName) {
        columns.push({
          label: columnName,
          prop: `col_${index}`
        });
      }
    });

    // 处理数据行
    for (let i = dataStartIndex; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.every(cell => !cell)) continue;

      const dataObj = {};
      let hasValidData = false;

      columns.forEach((col, index) => {
        const colIndex = parseInt(col.prop.split('_')[1]);
        const value = row[colIndex];

        if (value !== undefined && value !== null && value !== '') {
          dataObj[col.prop] = this.parseNumericValue(value);
          hasValidData = true;
        } else {
          dataObj[col.prop] = '';
        }
      });

      if (hasValidData) {
        processedData.push(dataObj);
      }
    }

    console.log(`${sheetName}: 使用默认格式处理，${columns.length}列，${processedData.length}行数据`);
    return { data: processedData, columns };
  }

  /**
   * 解析数值
   */
  parseNumericValue(value) {
    if (value === null || value === undefined || value === '') return '';

    const numericValue = parseFloat(value);
    return isNaN(numericValue) ? value : numericValue;
  }

  /**
   * 处理通用图表数据
   */
  processGenericChartData(rawData, sheetName) {
    // 尝试标准的表格处理方式
    const result = this.processStandardTableFormat(rawData, sheetName);
    if (!result) return null;

    // 转换为图表数据格式，只保留数值列
    const chartData = result.data.map(row => {
      const chartRow = {};
      result.columns.forEach(col => {
        const value = row[col.prop];
        if (typeof value === 'number') {
          chartRow[col.label] = value;
        } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          chartRow[col.label] = parseFloat(value);
        }
      });
      return chartRow;
    }).filter(row => Object.keys(row).length > 0);

    console.log(`${sheetName}: 通用图表数据处理，${chartData.length}行数据`);
    return chartData;
  }

  /**
   * 根据文件名智能判断数据类型
   */
  determineDataTypeFromFilename(filename, fallbackType = 'chart') {
    const lowerFilename = filename.toLowerCase();

    // 表格数据的标识词
    const tableKeywords = ['表格', 'table', '数据表', 'data'];
    // 图表数据的标识词
    const chartKeywords = ['图', 'chart', '曲线', 'curve', '图形', 'graph'];

    // 检查是否包含表格相关关键词
    if (tableKeywords.some(keyword => lowerFilename.includes(keyword))) {
      console.log(`文件名包含表格关键词，识别为表格数据: ${filename}`);
      return 'table';
    }

    // 检查是否包含图表相关关键词
    if (chartKeywords.some(keyword => lowerFilename.includes(keyword))) {
      console.log(`文件名包含图表关键词，识别为图表数据: ${filename}`);
      return 'chart';
    }

    // 如果文件名中没有明确的"表格"标识，默认认为是图表数据
    // 因为材料代码文件（如"DZ402.xlsx"）通常是图表数据
    if (!tableKeywords.some(keyword => lowerFilename.includes(keyword))) {
      console.log(`文件名无表格标识，默认识别为图表数据: ${filename}`);
      return 'chart';
    }

    // 使用传入的类型作为备选
    console.log(`使用备选类型: ${fallbackType} for ${filename}`);
    return fallbackType;
  }

  /**
   * 构建文件URL - 确保路径正确性
   */
  buildFileUrl(folderPath, filename) {
    // 清理路径分隔符
    const cleanPath = folderPath.replace(/[\\\/]+/g, '/').replace(/^\/+|\/+$/g, '');
    const cleanFilename = filename.replace(/^\/+/, '');

    // 构建完整URL
    if (cleanPath) {
      return `${this.baseUrl}/json/${cleanPath}/${cleanFilename}`;
    } else {
      return `${this.baseUrl}/json/${cleanFilename}`;
    }
  }

  /**
   * 获取工作簿信息 - 用于调试和验证
   */
  getWorkbookInfo(workbook) {
    const sheetNames = workbook.SheetNames || [];
    const sheets = {};

    sheetNames.forEach(name => {
      const sheet = workbook.Sheets[name];
      if (sheet && sheet['!ref']) {
        const range = XLSX.utils.decode_range(sheet['!ref']);
        sheets[name] = {
          rows: range.e.r - range.s.r + 1,
          cols: range.e.c - range.s.c + 1,
          range: sheet['!ref']
        };
      } else {
        sheets[name] = { rows: 0, cols: 0, range: 'A1:A1' };
      }
    });

    return {
      totalSheets: sheetNames.length,
      sheetNames: sheetNames,
      sheets: sheets
    };
  }

  /**
   * 读取Excel文件 - 统一的文件读取方法
   */
  async readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook);
        } catch (error) {
          reject(new Error(`读取Excel文件失败: ${error.message}`));
        }
      };
      reader.onerror = function() {
        reject(new Error('文件读取失败'));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 读取JSON文件 - 统一的JSON文件读取方法
   */
  async readJsonFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const jsonData = JSON.parse(e.target.result);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`JSON文件解析失败: ${error.message}`));
        }
      };
      reader.onerror = function() {
        reject(new Error('文件读取失败'));
      };
      reader.readAsText(file, 'utf-8');
    });
  }

  /**
   * 保存JSON到文件
   */
  saveJsonToFile(data, filename) {
    const jsonString = JSON.stringify(data, null, 4);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadBlob(blob, filename);
  }

  /**
   * 下载Blob文件
   */
  downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 生成菜单文件 - 确保与现有菜单的兼容性
   */
  generateMenuFile(materialCode, data, existingMenu = null) {
    const materialInfo = this.getMaterialTypeInfo(materialCode);
    const keyInfo = this.extractKeyInformation(data);

    // 创建新的材料条目
    const newMaterialEntry = {
      index: this.generateMaterialIndex(materialCode, materialInfo.typeIndex, existingMenu),
      name: materialCode,
      key_component: keyInfo.components,
      key_craft: keyInfo.crafts,
      key_density: keyInfo.density || 0
    };

    if (existingMenu && existingMenu.menu) {
      // 基于现有menu更新
      const updatedMenu = JSON.parse(JSON.stringify(existingMenu));

      // 查找对应的材料类型分组
      let targetGroup = updatedMenu.menu.find(group =>
        group.index === materialInfo.typeIndex
      );

      if (targetGroup) {
        // 检查是否已存在该材料
        const existingIndex = targetGroup.list.findIndex(item =>
          item.name === materialCode
        );

        if (existingIndex >= 0) {
          // 更新现有材料
          targetGroup.list[existingIndex] = newMaterialEntry;
        } else {
          // 添加新材料
          targetGroup.list.push(newMaterialEntry);
        }
      } else {
        // 创建新的材料类型分组
        updatedMenu.menu.push({
          index: materialInfo.typeIndex,
          name: materialInfo.typeName,
          list: [newMaterialEntry]
        });
      }

      return updatedMenu;
    } else {
      // 创建新的menu文件
      return {
        code: 200,
        menu: [
          {
            index: materialInfo.typeIndex,
            name: materialInfo.typeName,
            list: [newMaterialEntry]
          }
        ]
      };
    }
  }

  /**
   * 生成材料索引
   */
  generateMaterialIndex(materialCode, typeIndex, existingMenu) {
    if (!existingMenu || !existingMenu.menu) {
      return `${typeIndex}-1`;
    }

    const targetGroup = existingMenu.menu.find(group =>
      group.index === typeIndex
    );

    if (!targetGroup || !targetGroup.list) {
      return `${typeIndex}-1`;
    }

    // 查找最大的序号
    let maxIndex = 0;
    targetGroup.list.forEach(item => {
      const indexParts = item.index.split('-');
      if (indexParts.length === 2) {
        const num = parseInt(indexParts[1]);
        if (!isNaN(num) && num > maxIndex) {
          maxIndex = num;
        }
      }
    });

    return `${typeIndex}-${maxIndex + 1}`;
  }
}
