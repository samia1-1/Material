import { getJson } from '@/api/database/dataStretch.js'

export default class TableChecker {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.missingTableFiles = [];
    this.batchChecking = false;
    this.checkProgress = 0;
    this.currentCheckingFile = '';
    this.allMaterials = [];
    // 引用检测正则表达式
    this.referencePatterns = {
      table: /(见表|表)\s*\d+[-－]\d+/g, // 匹配"见表x-x"和"表x-x"格式
      figure: /(见图|图)\s*\d+[-－]\d+/g // 匹配"见图x-x"和"图x-x"格式
    };
    // 引用映射记录
    this.referenceMap = {
      table: new Map(), // 表格引用映射
      figure: new Map() // 图表引用映射
    };
    // 章节标题映射
    this.sectionTitles = {
      'introduce': '合金介绍',
      'physicalChemistry': '物理、弹性和化学性能',
      'mechanical': '力学性能',
      'craft': '工艺性能与要求',
      'microstructures': '组织结构'
    };
  }

  // 检查材料数据中的引用问题
  checkTableReferences(jsonData) {
    if (!jsonData) return [];

    const currentFileName = this.currentMaterial;
    // 清空引用记录
    this.clearReferenceMaps();

    // 检测状态
    const status = {
      tableRef: false, tableData: false,
      figureRef: false, figureData: false
    };

    // 检查各个部分
    Object.keys(this.sectionTitles).forEach(section => {
      if (!jsonData[section]) return;

      const result = this._checkItems(jsonData[section]);
      if (result.tableRef) status.tableRef = true;
      if (result.tableData) status.tableData = true;
      if (result.figureRef) status.figureRef = true;
      if (result.figureData) status.figureData = true;
    });

    // 记录问题文件
    if (((status.tableRef && !status.tableData) ||
         (status.figureRef && !status.figureData)) && currentFileName) {
      this._recordMissingFile(currentFileName);
    }

    return this.missingTableFiles;
  }

  // 清空引用记录映射
  clearReferenceMaps() {
    this.referenceMap.table.clear();
    this.referenceMap.figure.clear();
  }

  // 记录问题文件
  _recordMissingFile(fileName) {
    if (!this.missingTableFiles.some(item => item.name === fileName)) {
      this.missingTableFiles.push({
        name: fileName,
        category: this.currentCategory || '未知分类',
        missingTables: this._hasMissingReferences('table'),
        missingFigures: this._hasMissingReferences('figure')
      });
    }
  }

  // 检查是否有未匹配引用
  _hasMissingReferences(type) {
    let hasMissing = false;
    this.referenceMap[type].forEach(hasData => {
      if (!hasData) hasMissing = true;
    });
    return hasMissing;
  }

  // 统一检查项目的方法（适用于任何层级）
  _checkItems(items) {
    const status = {
      tableRef: false, tableData: false,
      figureRef: false, figureData: false
    };
    const refs = { table: [], figure: [] };

    // 遍历所有项
    items.forEach(item => {
      // 检查标题中的引用
      if (item.name) {
        this._findReferencesInText(item.name, 'table', refs.table);
        this._findReferencesInText(item.name, 'figure', refs.figure);
      }

      // 检查内容中的引用
      if (item.con) {
        this._findReferencesInText(item.con, 'table', refs.table);
        this._findReferencesInText(item.con, 'figure', refs.figure);
      }

      // 检查表格数据
      if (item.tableData && item.tableData.length > 0) {
        status.tableData = true;
        refs.table.forEach(ref => this.referenceMap.table.set(ref, true));
      }

      // 检查图表数据
      if (item.seriesData && item.echartMsg) {
        status.figureData = true;
        refs.figure.forEach(ref => this.referenceMap.figure.set(ref, true));
      }

      // 检查二级内容
      if (item.two) {
        const twoResult = this._checkItems(item.two);
        this._mergeStatus(status, twoResult);
      }

      // 检查三级内容
      if (item.third) {
        const thirdResult = this._checkItems(item.third);
        this._mergeStatus(status, thirdResult);
      }
    });

    // 更新检测状态
    if (refs.table.length > 0) status.tableRef = true;
    if (refs.figure.length > 0) status.figureRef = true;

    return status;
  }

  // 合并状态对象
  _mergeStatus(target, source) {
    if (source.tableRef) target.tableRef = true;
    if (source.tableData) target.tableData = true;
    if (source.figureRef) target.figureRef = true;
    if (source.figureData) target.figureData = true;
  }

  // 在文本中查找引用
  _findReferencesInText(text, type, refsArray) {
    const pattern = this.referencePatterns[type];
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const ref = match[0];
      refsArray.push(ref);
      // 记录引用到全局Map
      if (!this.referenceMap[type].has(ref)) {
        this.referenceMap[type].set(ref, false);
      }
    }
  }

  // 获取上下文辅助方法
  _getContext(text, match) {
    const startPos = Math.max(0, text.indexOf(match) - 30);
    const endPos = Math.min(text.length, text.indexOf(match) + match.length + 30);
    return text.substring(startPos, endPos);
  }

  // 转义CSV中的特殊字符
  _escapeCSV(str) {
    if (!str) return '';
    return str.replace(/"/g, '""');
  }

  // 收集引用详情 - 精简版
  _collectReferences(data, materialName) {
    const referenceDetails = [];

    // 处理每个章节
    Object.keys(this.sectionTitles).forEach(section => {
      if (!data[section]) return;
      this._processItemsForReferences(data[section], referenceDetails, section, 1);
    });

    return referenceDetails;
  }

  // 处理项目的引用收集（递归处理多层级）
  _processItemsForReferences(items, details, section, level, parent = {}) {
    items.forEach(item => {
      // 处理标题中的引用
      if (item.name) {
        this._collectItemReferences(item.name, details, section, level, item, parent, true);
      }

      // 处理内容中的引用
      if (item.con) {
        this._collectItemReferences(item.con, details, section, level, item, parent, false);
      }

      // 处理下一级内容
      if (level === 1 && item.two) {
        this._processItemsForReferences(item.two, details, section, 2, item);
      }
      else if (level === 2 && item.third) {
        this._processItemsForReferences(item.third, details, section, 3, { ...parent, subtitle: item.name });
      }
    });
  }

  // 收集项目中的引用
  _collectItemReferences(text, details, section, level, item, parent, inTitle) {
    // 收集表格引用
    this._collectReferencesByType(text, details, section, level, item, parent, inTitle, 'table');

    // 收集图表引用
    this._collectReferencesByType(text, details, section, level, item, parent, inTitle, 'figure');
  }

  // 按类型收集引用
  _collectReferencesByType(text, details, section, level, item, parent, inTitle, type) {
    const pattern = this.referencePatterns[type];
    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const ref = match[0];
      const hasData = this.referenceMap[type].get(ref) || false;

      // 只记录未匹配的引用
      if (!hasData) {
        const refDetail = this._createReferenceDetail(ref, section, level, item, parent, inTitle, text, type);
        details.push(refDetail);
      }
    }
  }

  // 创建引用详情对象
  _createReferenceDetail(ref, section, level, item, parent, inTitle, text, type) {
    const detail = {
      section: this.sectionTitles[section],
      reference: ref,
      hasTable: this.referenceMap[type].get(ref) || false,
      refType: type,
      level
    };

    // 根据层级添加相应的标题信息
    if (level === 1) {
      detail.title = item.name || '未知标题';
    } else if (level === 2) {
      detail.title = parent.name || '未知标题';
      detail.subtitle = item.name || '未知小标题';
    } else if (level === 3) {
      detail.title = parent.name || '未知标题';
      detail.subtitle = parent.subtitle || '未知小标题';
      detail.subsubtitle = item.name || '未知小小标题';
    }

    // 设置上下文
    if (inTitle) {
      detail.context = `[${level === 1 ? '标题' : level === 2 ? '子标题' : '子子标题'}中引用] ${text}`;
      detail.inTitle = true;
    } else {
      detail.context = this._getContext(text, ref);
    }

    return detail;
  }

  // 设置当前材料名称和分类
  setCurrentMaterial(name, category) {
    this.currentMaterial = name;
    this.currentCategory = category;
  }

  // 批量检查所有材料
  batchCheckAllMaterials(menuData, callback) {
    this.batchChecking = true;
    this.missingTableFiles = [];
    this.checkProgress = 0;

    // 收集所有材料
    this._collectAllMaterials(menuData);

    // 开始顺序检查
    this.checkMaterialsSequentially(0, callback);
    return this.missingTableFiles;
  }

  // 收集所有材料
  _collectAllMaterials(menuData) {
    if (!menuData || menuData.length === 0) return;

    this.allMaterials = [];
    menuData.forEach(category => {
      if (!category.list) return;

      category.list.forEach(material => {
        if (material && material.name) {
          this.allMaterials.push({
            name: material.name,
            index: material.index,
            category: category.name
          });
        }
      });
    });

    console.log(`共发现${this.allMaterials.length}个材料需要检查`);
  }

  // 顺序检查材料列表
  checkMaterialsSequentially(index, callback) {
    if (index >= this.allMaterials.length) {
      // 检查完成
      this.batchChecking = false;
      this.checkProgress = 100;
      if (callback) callback();
      return;
    }

    const material = this.allMaterials[index];
    this.currentCheckingFile = material.name;
    this.checkProgress = Math.floor((index / this.allMaterials.length) * 100);

    // 获取当前材料的JSON数据
    const getJsonUrl = this.baseURL + "/json/" + material.name + ".json";

    getJson(getJsonUrl).then(data => {
      this._processMaterialData(material, data, index, callback);
    }).catch(error => {
      console.error(`检查文件 ${material.name} 时出错:`, error);
      this._checkNextMaterial(index, callback);
    });
  }

  // 处理材料数据
  _processMaterialData(material, data, index, callback) {
    // 设置当前材料和分类
    this.setCurrentMaterial(material.name, material.category);

    // 清空引用记录
    this.clearReferenceMaps();

    // 检查状态
    const status = {
      tableRef: false, tableData: false,
      figureRef: false, figureData: false
    };

    // 检查各个部分
    Object.keys(this.sectionTitles).forEach(section => {
      if (!data[section]) return;

      const result = this._checkItems(data[section]);
      if (result.tableRef) status.tableRef = true;
      if (result.tableData) status.tableData = true;
      if (result.figureRef) status.figureRef = true;
      if (result.figureData) status.figureData = true;
    });

    // 判断是否存在问题
    const hasMissingTableRefs = this._hasMissingReferences('table');
    const hasMissingFigureRefs = this._hasMissingReferences('figure');

    if ((status.tableRef && !status.tableData) ||
        (status.figureRef && !status.figureData) ||
        hasMissingTableRefs || hasMissingFigureRefs) {

      // 收集详细信息
      const references = this._collectReferences(data, material.name);

      // 添加到问题列表
      this.missingTableFiles.push({
        name: material.name,
        category: material.category,
        references
      });
    }

    // 检查下一个材料
    this._checkNextMaterial(index, callback);
  }

  // 检查下一个材料
  _checkNextMaterial(index, callback) {
    setTimeout(() => {
      this.checkMaterialsSequentially(index + 1, callback);
    }, 100);
  }

  // 获取缺少表格数据的文件列表
  getMissingTableFiles() {
    return this.missingTableFiles;
  }

  // 自动批量检查（使用现有的检查逻辑）
  autoBatchCheckAllMaterials(menuData) {
    console.log('开始自动检查所有材料是否有表格或图表缺失...');
    this.missingTableFiles = [];

    this._collectAllMaterials(menuData);
    this.checkMaterialsSequentially(0);
  }

  // 导出缺失文件列表
  exportMissingFiles(customFileName) {
    let csvContent = '\ufeff'; // 添加BOM
    csvContent += "材料牌号,材料类型,章节,标题,子标题,子子标题,引用类型,引用,上下文,是否有相应数据,引用位置\n";

    this.missingTableFiles.forEach(file => {
      if (file.references && file.references.length > 0) {
        file.references.forEach(ref => {
          // 添加CSV行
          csvContent += this._formatCsvRow(file, ref);
        });
      } else {
        csvContent += `"${file.name}","${file.category}","","","","","未知","","","否",""\n`;
      }
    });

    // 创建并下载CSV文件
    this._downloadCsv(csvContent, customFileName);
  }

  // 格式化CSV行
  _formatCsvRow(file, ref) {
    const safeTitle = this._escapeCSV(ref.title || '');
    const safeSubtitle = this._escapeCSV(ref.subtitle || '');
    const safeSubsubtitle = this._escapeCSV(ref.subsubtitle || '');
    const safeContext = this._escapeCSV(ref.context || '');
    const safeReference = this._escapeCSV(ref.reference || '');
    const safeSection = this._escapeCSV(ref.section || '');
    const refType = ref.refType === 'table' ? '表格' : '图表';
    const hasData = ref.hasTable ? "是" : "否";
    const refLocation = ref.inTitle ? "标题中" : "内容中";

    return `"${file.name}","${file.category}","${safeSection}","${safeTitle}","${safeSubtitle}","${safeSubsubtitle}","${refType}","${safeReference}","${safeContext}","${hasData}","${refLocation}"\n`;
  }

  // 下载CSV文件
  _downloadCsv(csvContent, customFileName) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // 设置文件名
    const fileName = customFileName || `表格图表缺失列表_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
