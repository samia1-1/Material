import { getJson } from '@/api/database/dataStretch.js'

export default class TableChecker {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.missingTableFiles = [];
    this.batchChecking = false;
    this.checkProgress = 0;
    this.currentCheckingFile = '';
    this.allMaterials = [];
    this.tableRegex = /见表\s*\d+-\d+/g; // 匹配"见表x-x"格式
  }

  // 检查当前加载的材料是否存在表格引用但没有表格数据
  checkTableReferences(jsonData) {
    if (!jsonData) return [];

    // 当前文件名从URL中提取
    const currentFileName = this.currentMaterial;
    let hasTableReference = false;
    let hasTableData = false;

    // 检查各个部分
    ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'].forEach(section => {
      if (!jsonData[section]) return;

      const result = this._checkSection(jsonData[section]);
      if (result.hasReference) hasTableReference = true;
      if (result.hasTable) hasTableData = true;
    });

    // 如果有表格引用但没有表格数据，记录文件名
    if (hasTableReference && !hasTableData && currentFileName) {
      console.warn(`文件 ${currentFileName} 中引用了表格但没有相应的表格数据`);
      if (!this.missingTableFiles.some(item => item.name === currentFileName)) {
        this.missingTableFiles.push({
          name: currentFileName,
          category: this.currentCategory || '未知分类'
        });
      }
    }

    return this.missingTableFiles;
  }

  // 检查单个部分是否包含表格引用和表格数据
  _checkSection(section) {
    let hasReference = false;
    let hasTable = false;

    section.forEach(item => {
      // 检查一级内容
      if (item.con && this.tableRegex.test(item.con)) {
        hasReference = true;
      }
      if (item.tableData && item.tableData.length > 0) {
        hasTable = true;
      }

      // 检查二级内容
      if (item.two) {
        const twoResult = this._checkNestedItems(item.two);
        if (twoResult.hasReference) hasReference = true;
        if (twoResult.hasTable) hasTable = true;
      }
    });

    return { hasReference, hasTable };
  }

  // 检查嵌套内容
  _checkNestedItems(items) {
    let hasReference = false;
    let hasTable = false;

    items.forEach(item => {
      if (item.con && this.tableRegex.test(item.con)) {
        hasReference = true;
      }
      if (item.tableData && item.tableData.length > 0) {
        hasTable = true;
      }

      // 检查更深层嵌套
      if (item.third) {
        const thirdResult = this._checkNestedItems(item.third);
        if (thirdResult.hasReference) hasReference = true;
        if (thirdResult.hasTable) hasTable = true;
      }
    });

    return { hasReference, hasTable };
  }

  // 获取缺少表格数据的文件列表
  getMissingTableFiles() {
    console.log('缺少表格数据的文件列表:', this.missingTableFiles);
    return this.missingTableFiles;
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
    if (this.allMaterials.length === 0) {
      this.allMaterials = [];
      menuData.forEach(category => {
        category.list.forEach(material => {
          this.allMaterials.push({
            name: material.name,
            index: material.index,
            category: category.name
          });
        });
      });
    }

    // 使用Promise队列依次检查每个材料
    this.checkMaterialsSequentially(0, callback);
    return this.missingTableFiles;
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
      // 设置当前材料和分类
      this.setCurrentMaterial(material.name, material.category);

      // 检查这个材料是否缺少表格
      let hasTableReference = false;
      let hasTableData = false;

      // 检查各个部分
      ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'].forEach(section => {
        if (!data[section]) return;

        const result = this._checkSection(data[section]);
        if (result.hasReference) hasTableReference = true;
        if (result.hasTable) hasTableData = true;
      });

      // 如果有表格引用但没有表格数据，记录文件名和详细信息
      if (hasTableReference && !hasTableData) {
        const materialInfo = {
          name: material.name,
          category: material.category,
          references: this._collectReferences(data, material.name)
        };

        this.missingTableFiles.push(materialInfo);
      }
    }).catch(error => {
      console.error(`检查文件 ${material.name} 时出错:`, error);
    }).finally(() => {
      // 继续检查下一个材料
      setTimeout(() => {
        this.checkMaterialsSequentially(index + 1, callback);
      }, 100); // 添加一点延迟，避免请求过快
    });
  }

  // 收集引用详情
  _collectReferences(data, materialName) {
    const referenceDetails = [];
    const sectionTitles = {
      'introduce': '合金介绍',
      'physicalChemistry': '物理、弹性和化学性能',
      'mechanical': '力学性能',
      'craft': '工艺性能与要求',
      'microstructures': '组织结构'
    };

    Object.keys(sectionTitles).forEach(section => {
      if (!data[section]) return;

      data[section].forEach(item => {
        // 处理一级内容的引用
        if (item.con && this.tableRegex.test(item.con)) {
          const matches = item.con.match(this.tableRegex);
          if (matches) {
            matches.forEach(match => {
              referenceDetails.push({
                section: sectionTitles[section],
                title: item.name || '未知标题',
                level: 1,
                reference: match,
                context: this._getContext(item.con, match)
              });
            });
          }
        }

        // 处理二级内容
        if (item.two) {
          item.two.forEach(second => {
            if (second.con && this.tableRegex.test(second.con)) {
              const matches = second.con.match(this.tableRegex);
              if (matches) {
                matches.forEach(match => {
                  referenceDetails.push({
                    section: sectionTitles[section],
                    title: item.name || '未知标题',
                    subtitle: second.name || '未知小标题',
                    level: 2,
                    reference: match,
                    context: this._getContext(second.con, match)
                  });
                });
              }
            }

            // 处理三级内容
            if (second.third) {
              second.third.forEach(third => {
                if (third.con && this.tableRegex.test(third.con)) {
                  const matches = third.con.match(this.tableRegex);
                  if (matches) {
                    matches.forEach(match => {
                      referenceDetails.push({
                        section: sectionTitles[section],
                        title: item.name || '未知标题',
                        subtitle: second.name || '未知小标题',
                        subsubtitle: third.name || '未知小小标题',
                        level: 3,
                        reference: match,
                        context: this._getContext(third.con, match)
                      });
                    });
                  }
                }
              });
            }
          });
        }
      });
    });

    return referenceDetails;
  }

  // 自动批量检查所有材料
  autoBatchCheckAllMaterials(menuData) {
    console.log('开始自动检查所有材料是否有表格缺失...');
    this.missingTableFiles = [];

    // 收集所有材料
    if (!menuData || menuData.length === 0) {
      console.log('菜单数据尚未加载完成，无法执行检查');
      return;
    }

    this.allMaterials = [];
    menuData.forEach(category => {
      category.list.forEach(material => {
        this.allMaterials.push({
          name: material.name,
          index: material.index,
          category: category.name
        });
      });
    });

    console.log(`共发现${this.allMaterials.length}个材料需要检查`);

    // 使用Promise队列依次检查每个材料
    this.autoCheckMaterialsSequentially(0);
  }

  // 顺序检查材料列表（自动版本）
  autoCheckMaterialsSequentially(index) {
    if (index >= this.allMaterials.length) {
      // 检查完成
      console.log('===== 检查完成 =====');
      console.log(`共发现${this.missingTableFiles.length}个材料存在表格引用但没有表格数据:`);
      console.table(this.missingTableFiles);
      return;
    }

    const material = this.allMaterials[index];
    const progress = Math.floor((index / this.allMaterials.length) * 100);

    if (index % 10 === 0) {
      console.log(`检查进度: ${progress}%, 当前检查: ${material.name}`);
    }

    // 获取当前材料的JSON数据
    const getJsonUrl = this.baseURL + "/json/" + material.name + ".json";

    getJson(getJsonUrl).then(data => {
      // 设置当前材料和分类
      this.setCurrentMaterial(material.name, material.category);

      // 检查这个材料是否缺少表格
      let hasTableReference = false;
      let hasTableData = false;

      // 检查各个部分
      ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'].forEach(section => {
        if (!data[section]) return;

        const result = this._checkSection(data[section]);
        if (result.hasReference) hasTableReference = true;
        if (result.hasTable) hasTableData = true;
      });

      // 如果有表格引用但没有表格数据，收集引用详情
      if (hasTableReference && !hasTableData) {
        const referenceDetails = this._collectReferences(data, material.name);

        const materialInfo = {
          name: material.name,
          category: material.category,
          references: referenceDetails
        };

        // 打印单个材料的详细信息到控制台
        console.log(`\n发现材料 [${material.name}] 有表格引用但缺少表格数据:`);
        referenceDetails.forEach((ref, idx) => {
          console.log(`  ${idx+1}. 章节: ${ref.section}`);
          console.log(`     标题: ${ref.title}`);
          if (ref.subtitle) console.log(`     子标题: ${ref.subtitle}`);
          if (ref.subsubtitle) console.log(`     子子标题: ${ref.subsubtitle}`);
          console.log(`     引用: ${ref.reference}`);
          console.log(`     上下文: ${ref.context}`);
          console.log(`---`);
        });

        this.missingTableFiles.push(materialInfo);
      }
    }).catch(error => {
      console.error(`检查文件 ${material.name} 时出错:`, error);
    }).finally(() => {
      // 继续检查下一个材料
      setTimeout(() => {
        this.autoCheckMaterialsSequentially(index + 1);
      }, 50); // 添加一点延迟，避免请求过快
    });
  }

  // 获取上下文辅助方法
  _getContext(text, match) {
    return text.substring(
      Math.max(0, text.indexOf(match) - 20),
      text.indexOf(match) + match.length + 20
    );
  }

  // 导出缺失文件列表 - 增强版本，包含更多详情
  exportMissingFiles(customFileName) {
    // 生成CSV格式，包含更多字段
    // 添加BOM标记以确保Excel正确识别UTF-8编码的中文
    let csvContent = '\ufeff';
    csvContent += "材料牌号,材料类型,章节,标题,子标题,子子标题,引用,上下文\n";

    this.missingTableFiles.forEach(file => {
      if (file.references && file.references.length > 0) {
        file.references.forEach(ref => {
          // 处理CSV特殊字符
          const safeTitle = this._escapeCSV(ref.title || '');
          const safeSubtitle = this._escapeCSV(ref.subtitle || '');
          const safeSubsubtitle = this._escapeCSV(ref.subsubtitle || '');
          const safeContext = this._escapeCSV(ref.context || '');
          const safeReference = this._escapeCSV(ref.reference || '');
          const safeSection = this._escapeCSV(ref.section || '');

          csvContent += `"${file.name}","${file.category}","${safeSection}","${safeTitle}",`;
          csvContent += `"${safeSubtitle}","${safeSubsubtitle}","${safeReference}","${safeContext}"\n`;
        });
      } else {
        csvContent += `"${file.name}","${file.category}","","","","","",""\n`;
      }
    });

    // 创建下载链接 - 明确指定UTF-8编码
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // 使用自定义文件名或默认文件名
    link.setAttribute('download', customFileName || '表格缺失材料列表_详细.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 转义CSV中的特殊字符
  _escapeCSV(str) {
    if (!str) return '';
    // 替换双引号为两个双引号(CSV标准转义)
    return str.replace(/"/g, '""');
  }
}
