import { getJson } from '@/api/database/dataStretch.js'

export default class TableChecker {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.missingTableFiles = [];
    this.batchChecking = false;
    this.checkProgress = 0;
    this.currentCheckingFile = '';
    this.allMaterials = [];
    // 大幅扩展正则表达式，支持更多格式
    this.referencePatterns = {
      // 表格引用匹配模式 - 支持更多格式和数字范围引用
      table: /(?:见表|表|如表|表格|表\s*?|见表格|如表格|参见表|(?:如)?表\s*(?:中|内)|附表)\s*?(\d+[-－~～至]\d+|\d+\.\d+|\d+)/g,
      // 图表引用匹配模式 - 支持更多格式和数字范围引用
      figure: /(?:见图|图|如图|曲线图|如图所示|曲线见图|性能曲线见图|弹性(?:曲线|变化)(?:见)?图|参见图|附图)\s*?(\d+[-－~～至]\d+|\d+\.\d+|\d+)/g
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
      // 提取完整匹配和引用号
      const fullMatch = match[0];
      const refNum = match[1] ? match[1] : fullMatch.match(/\d+[-－~～至]\d+|\d+\.\d+|\d+/)[0];
      const ref = (type === 'table' ? '表' : '图') + refNum;

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

    try {
      while ((match = pattern.exec(text)) !== null) {
        // 提取引用号，统一格式
        const fullMatch = match[0];
        let refNum;

        try {
          refNum = match[1] ? match[1] : fullMatch.match(/\d+[-－~～至]\d+|\d+\.\d+|\d+/)[0];
        } catch (e) {
          console.warn('无法提取引用编号:', fullMatch);
          refNum = fullMatch.replace(/[^0-9\-－]/g, '');
        }

        const ref = (type === 'table' ? '表' : '图') + refNum;
        const hasData = this.referenceMap[type].get(ref) || false;

        // 记录所有缺失的引用
        if (!hasData) {
          const refDetail = this._createReferenceDetail(ref, section, level, item, parent, inTitle, text, type);
          details.push(refDetail);
        }
      }
    } catch (error) {
      console.error('处理引用时出错:', error, text);
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

  // 处理材料数据 - 改进收集逻辑
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

      // 收集详细信息 - 不管有没有引用也进行收集
      const references = [];

      // 强制收集所有引用，包括有数据和没数据的
      Object.keys(this.referenceMap.table).forEach(ref => {
        if (!this.referenceMap.table.get(ref)) {
          // 查找具体位置，创建引用记录
          this._findAndAddReferenceDetails(data, references, ref, 'table');
        }
      });

      Object.keys(this.referenceMap.figure).forEach(ref => {
        if (!this.referenceMap.figure.get(ref)) {
          this._findAndAddReferenceDetails(data, references, ref, 'figure');
        }
      });

      // 如果使用Map没有keys方法，需要用迭代器手动收集
      if (!Object.keys(this.referenceMap.table).length) {
        this.referenceMap.table.forEach((value, key) => {
          if (!value) {
            this._findAndAddReferenceDetails(data, references, key, 'table');
          }
        });

        this.referenceMap.figure.forEach((value, key) => {
          if (!value) {
            this._findAndAddReferenceDetails(data, references, key, 'figure');
          }
        });
      }

      // 如果还是没有收集到引用，使用老方法收集
      if (references.length === 0) {
        const oldReferences = this._collectReferences(data, material.name);
        references.push(...oldReferences);
      }

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

  // 查找并添加引用详情的新方法
  _findAndAddReferenceDetails(data, references, refKey, type) {
    let found = false;

    // 遍历所有章节寻找引用
    Object.keys(this.sectionTitles).forEach(section => {
      if (!data[section] || found) return;

      // 查找此引用出现在哪个位置
      const refDetails = this._searchReferenceInItems(
        data[section], section, refKey, type, 1
      );

      if (refDetails) {
        references.push(refDetails);
        found = true;
      }
    });

    // 如果没找到，创建一个通用的引用记录
    if (!found) {
      references.push({
        section: '未知章节',
        reference: refKey,
        hasTable: false,
        refType: type,
        level: 0,
        title: '未知位置',
        context: `未找到具体位置的引用: ${refKey}`
      });
    }
  }

  // 递归搜索引用在内容中的位置
  _searchReferenceInItems(items, section, refKey, type, level, parent = {}) {
    // 遍历所有项目
    for (let item of items) {
      // 检查标题中的引用
      if (item.name && item.name.includes(refKey)) {
        return this._createReferenceDetail(refKey, section, level, item, parent, true, item.name, type);
      }

      // 检查内容中的引用
      if (item.con && item.con.includes(refKey)) {
        return this._createReferenceDetail(refKey, section, level, item, parent, false, item.con, type);
      }

      // 检查下一级内容
      if (level === 1 && item.two) {
        const result = this._searchReferenceInItems(item.two, section, refKey, type, 2, item);
        if (result) return result;
      }
      else if (level === 2 && item.third) {
        const result = this._searchReferenceInItems(
          item.third, section, refKey, type, 3,
          { ...parent, subtitle: item.name }
        );
        if (result) return result;
      }
    }

    return null;
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

  // 添加一个全新的强制扫描方法
  forceFullScan(jsonData, materialName, categoryName) {
    console.log(`强制完整扫描: ${materialName}`);

    // 清空当前引用记录
    this.clearReferenceMaps();

    const allReferences = {
      table: [],
      figure: []
    };

    // 提取所有文本内容
    const allContent = this._extractAllContent(jsonData);

    // 扫描所有可能的引用
    this._scanAllReferences(allContent, 'table', allReferences.table);
    this._scanAllReferences(allContent, 'figure', allReferences.figure);

    // 收集所有引用的详情
    const referenceDetails = [];

    // 为表格和图表处理引用
    ['table', 'figure'].forEach(type => {
      allReferences[type].forEach(ref => {
        // 寻找引用位置的上下文
        const context = this._findReferenceContext(jsonData, ref);

        const refDetail = {
          section: context.section || '全文扫描',
          reference: ref,
          hasTable: false, // 默认假设没有对应数据
          refType: type,
          level: context.level || 0,
          title: context.title || '自动提取',
          subtitle: context.subtitle || '',
          subsubtitle: context.subsubtitle || '',
          context: context.text || `找到的引用: ${ref}`,
          inTitle: context.inTitle || false
        };

        referenceDetails.push(refDetail);
      });
    });

    // 添加到问题列表
    if (referenceDetails.length > 0) {
      // 查看是否已有此材料的记录
      const existingIndex = this.missingTableFiles.findIndex(f => f.name === materialName);

      if (existingIndex >= 0) {
        // 更新已有记录
        this.missingTableFiles[existingIndex].references = referenceDetails;
      } else {
        // 添加新记录
        this.missingTableFiles.push({
          name: materialName,
          category: categoryName,
          references: referenceDetails
        });
      }
    }

    return referenceDetails;
  }

  // 提取所有文本内容的辅助方法
  _extractAllContent(jsonData) {
    let allText = '';

    // 处理所有章节
    Object.keys(this.sectionTitles).forEach(section => {
      if (!jsonData[section]) return;

      // 提取当前章节的所有文本
      allText += ' ' + this._extractSectionText(jsonData[section]) + ' ';
    });

    return allText;
  }

  // 提取章节文本
  _extractSectionText(items) {
    let text = '';

    items.forEach(item => {
      // 提取标题
      if (item.name) {
        text += ' ' + item.name + ' ';
      }

      // 提取内容
      if (item.con) {
        text += ' ' + item.con + ' ';
      }

      // 递归处理二级内容
      if (item.two) {
        text += ' ' + this._extractSectionText(item.two) + ' ';
      }

      // 递归处理三级内容
      if (item.third) {
        text += ' ' + this._extractSectionText(item.third) + ' ';
      }
    });

    return text;
  }

  // 扫描所有可能的引用 - 改进提取引用逻辑
  _scanAllReferences(text, type, refsArray) {
    const pattern = this.referencePatterns[type];
    pattern.lastIndex = 0;

    // 使用Set去重
    const uniqueRefs = new Set();
    let match;

    // 收集所有匹配项
    const allMatches = [];
    while ((match = pattern.exec(text)) !== null) {
      allMatches.push(match);
    }

    // 为调试输出所有匹配项
    console.log(`${type}引用原始匹配数: ${allMatches.length}`);
    if (allMatches.length > 0) {
      console.log(`首个匹配: ${allMatches[0][0]}`);
    }

    // 处理每个匹配
    allMatches.forEach(match => {
      try {
        // 提取完整匹配和引用号
        const fullMatch = match[0];
        let refNum = null;

        // 尝试从捕获组提取
        if (match[1]) {
          refNum = match[1];
        }
        // 尝试从完整匹配中提取数字和连字符
        else {
          const numMatch = fullMatch.match(/\d+[-－~～至]\d+|\d+\.\d+|\d+/);
          if (numMatch) {
            refNum = numMatch[0];
          }
        }

        // 如果找到引用号
        if (refNum) {
          // 处理范围引用 (如 3-5)
          if (refNum.match(/\d+[-－~～至]\d+/)) {
            const rangeParts = refNum.split(/[-－~～至]/);
            if (rangeParts.length === 2) {
              const start = parseInt(rangeParts[0]);
              const end = parseInt(rangeParts[1]);

              // 为范围内每个数字创建独立引用
              for (let i = start; i <= end; i++) {
                const ref = (type === 'table' ? '表' : '图') + i;
                uniqueRefs.add(ref);
              }
            }
          }
          // 处理单个引用
          else {
            const ref = (type === 'table' ? '表' : '图') + refNum;
            uniqueRefs.add(ref);
          }
        }
      } catch (error) {
        console.error('解析引用出错:', error, match[0]);
      }
    });

    // 将去重后的引用添加到结果数组
    uniqueRefs.forEach(ref => refsArray.push(ref));

    console.log(`${type}引用处理后数量: ${refsArray.length}`);
  }

  // 查找引用的具体位置和上下文
  _findReferenceContext(jsonData, refKey) {
    const context = {
      section: '',
      level: 0,
      title: '',
      subtitle: '',
      subsubtitle: '',
      text: '',
      inTitle: false
    };

    // 遍历所有章节寻找引用
    Object.keys(this.sectionTitles).forEach(section => {
      if (context.text) return; // 如果已找到上下文，则跳过

      // 在此章节中查找
      if (jsonData[section]) {
        const sectionName = this.sectionTitles[section];
        const result = this._searchRefInSection(jsonData[section], refKey, sectionName, 1);

        if (result.found) {
          Object.assign(context, result);
        }
      }
    });

    return context;
  }

  // 在章节中搜索引用
  _searchRefInSection(items, refKey, sectionName, level, parent = {}) {
    const context = {
      found: false,
      section: sectionName,
      level: level,
      inTitle: false
    };

    // 遍历所有项目
    for (let item of items) {
      // 检查标题中的引用
      if (item.name && item.name.includes(refKey)) {
        context.found = true;
        context.inTitle = true;
        context.text = item.name;

        if (level === 1) {
          context.title = item.name;
        } else if (level === 2) {
          context.title = parent.name || '';
          context.subtitle = item.name;
        } else if (level === 3) {
          context.title = parent.title || '';
          context.subtitle = parent.subtitle || '';
          context.subsubtitle = item.name;
        }

        return context;
      }

      // 检查内容中的引用
      if (item.con && item.con.includes(refKey)) {
        context.found = true;
        context.text = this._getContext(item.con, refKey);

        if (level === 1) {
          context.title = item.name || '';
        } else if (level === 2) {
          context.title = parent.name || '';
          context.subtitle = item.name || '';
        } else if (level === 3) {
          context.title = parent.title || '';
          context.subtitle = parent.subtitle || '';
          context.subsubtitle = item.name || '';
        }

        return context;
      }

      // 检查下级内容
      if (level === 1 && item.two) {
        const result = this._searchRefInSection(
          item.two,
          refKey,
          sectionName,
          2,
          { name: item.name }
        );

        if (result.found) return result;
      }
      else if (level === 2 && item.third) {
        const result = this._searchRefInSection(
          item.third,
          refKey,
          sectionName,
          3,
          {
            title: parent.name,
            subtitle: item.name
          }
        );

        if (result.found) return result;
      }
    }

    return context;
  }

  // 直接检查并导出方法
  directExport(jsonData, materialName, categoryName, customFileName) {
    console.log(`开始强制扫描材料: ${materialName}`);

    // 简单文本检查 - 用于调试
    const allText = this._extractAllContent(jsonData);
    console.log('文本样本(前200字符):', allText.substring(0, 200));

    // 查找所有可能包含表格和图表引用的文本
    const tableMatches = allText.match(/表\s*\d+[-－~～至]?\d*/g) || [];
    const figureMatches = allText.match(/图\s*\d+[-－~～至]?\d*/g) || [];

    console.log(`简单文本匹配发现: ${tableMatches.length}个表格引用, ${figureMatches.length}个图表引用`);
    if (tableMatches.length > 0) console.log('表格引用样例:', tableMatches.slice(0, 5));
    if (figureMatches.length > 0) console.log('图表引用样例:', figureMatches.slice(0, 5));

    // 强制完整扫描
    const refs = this.forceFullScan(jsonData, materialName, categoryName);

    console.log(`扫描到 ${refs.length} 个引用需要导出`);

    // 确保结果有效
    if (!refs || refs.length === 0) {
      // 使用备用方法
      console.log('使用备用方法扫描引用');
      this._directTextScan(jsonData, materialName, categoryName);
    }

    // 直接导出结果
    if (this.missingTableFiles.length > 0) {
      this.exportMissingFiles(customFileName);
      return true;
    } else {
      console.log('未找到需要导出的引用');
      return false;
    }
  }

  // 添加一个备用的直接文本扫描方法
  _directTextScan(jsonData, materialName, categoryName) {
    const allText = this._extractAllContent(jsonData);
    const tableRefs = [];
    const figureRefs = [];

    // 简单直接的表格引用匹配
    const tableRegex = /表\s*(\d+[-－~～至]?\d*)/g;
    let match;
    while ((match = tableRegex.exec(allText)) !== null) {
      if (match[1]) tableRefs.push('表' + match[1]);
    }

    // 简单直接的图表引用匹配
    const figureRegex = /图\s*(\d+[-－~～至]?\d*)/g;
    while ((match = figureRegex.exec(allText)) !== null) {
      if (match[1]) figureRefs.push('图' + match[1]);
    }

    // 创建引用详情列表
    const referenceDetails = [];

    // 添加表格引用
    [...new Set(tableRefs)].forEach(ref => {
      referenceDetails.push({
        section: '直接文本扫描',
        reference: ref,
        hasTable: false,
        refType: 'table',
        level: 0,
        title: '备用方法提取',
        subtitle: '',
        context: `在文本中找到引用: ${ref}`
      });
    });

    // 添加图表引用
    [...new Set(figureRefs)].forEach(ref => {
      referenceDetails.push({
        section: '直接文本扫描',
        reference: ref,
        hasTable: false,
        refType: 'figure',
        level: 0,
        title: '备用方法提取',
        subtitle: '',
        context: `在文本中找到引用: ${ref}`
      });
    });

    // 如果有引用，添加到结果列表
    if (referenceDetails.length > 0) {
      // 查看是否已有此材料的记录
      const existingIndex = this.missingTableFiles.findIndex(f => f.name === materialName);

      if (existingIndex >= 0) {
        // 更新已有记录
        const existingRefs = this.missingTableFiles[existingIndex].references || [];
        this.missingTableFiles[existingIndex].references = [...existingRefs, ...referenceDetails];
      } else {
        // 添加新记录
        this.missingTableFiles.push({
          name: materialName,
          category: categoryName,
          references: referenceDetails
        });
      }

      console.log(`备用方法找到 ${referenceDetails.length} 个引用`);
    }

    return referenceDetails;
  }

  // 修改导出函数，确保所有引用都被处理
  exportMissingFiles(customFileName) {
    let csvContent = '\ufeff'; // 添加BOM
    csvContent += "材料牌号,材料类型,章节,标题,子标题,子子标题,引用类型,引用,上下文,是否有相应数据,引用位置\n";

    // 调试输出
    console.log(`准备导出 ${this.missingTableFiles.length} 个文件的引用信息`);

    // 确保有数据可导出
    if (this.missingTableFiles.length === 0) {
      console.warn('没有找到需要导出的引用数据');
      return false;
    }

    // 记录每个文件的引用数量
    const refCounts = [];
    let totalRefs = 0;

    this.missingTableFiles.forEach(file => {
      const refs = file.references ? file.references.length : 0;
      refCounts.push(`${file.name}: ${refs}条`);
      totalRefs += refs;
    });

    console.log(`各文件引用数: ${refCounts.join(', ')}`);
    console.log(`总计: ${totalRefs} 条引用`);

    this.missingTableFiles.forEach((file, index) => {
      const hasReferences = file.references && file.references.length > 0;

      if (hasReferences) {
        console.log(`处理文件[${index+1}/${this.missingTableFiles.length}]: ${file.name}, 引用数: ${file.references.length}`);

        file.references.forEach((ref, i) => {
          // 日志输出前几个引用的详情
          if (i < 3) console.log(`  引用${i+1}: ${ref.reference} (${ref.refType})`);

          // 添加CSV行
          csvContent += this._formatCsvRow(file, ref);
        });
      } else {
        csvContent += `"${file.name}","${file.category}","","","","","未知","","","否",""\n`;
      }
    });

    // 创建并下载CSV文件
    this._downloadCsv(csvContent, customFileName);
    return true;
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
