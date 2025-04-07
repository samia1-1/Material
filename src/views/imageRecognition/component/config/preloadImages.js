/**
 * 预导入所有示例图片
 * 按分类目录组织，避免使用require.context动态导入
 */

// 北科分类图片
const beikeImages = {
  // 这里放实际图片路径，文件名后缀与实际格式一致
  'beike_1.jpg': require('@/assets/test/beike/0001.jpg'),
  'beike_2.jpg': require('@/assets/test/beike/0002.jpg'),
  // ... 其他图片
};

// 粉末分类图片 - 使用正确的大写TIF后缀与源文件一致
const fenmoImages = {
  'fenmo_1.TIF': require('@/assets/test/fenmo/1.TIF'),
  'fenmo_3.TIF': require('@/assets/test/fenmo/3.TIF'),
  // ... 其他图片
};

// 华科分类图片
const huakeImages = {
  'huake_1.jpg': require('@/assets/test/huake/1.jpg'),
  'huake_2.jpg': require('@/assets/test/huake/2.jpg'),
  // ... 其他图片
};

// w800分类图片 - 修正为正确的TIF格式
const w800Images = {
  'w800_1.tif': require('@/assets/test/w800/0001.tif'),
  'w800_2.tif': require('@/assets/test/w800/0002.tif'),
  // ... 其他图片
};

// w900分类图片 - 修正为正确的TIF格式
const w900Images = {
  'w900_1.tif': require('@/assets/test/w900/0001.tif'),
  'w900_2.tif': require('@/assets/test/w900/0002.tif'),
  // ... 其他图片
};

// w1000分类图片 - 修正为正确的TIF格式
const w1000Images = {
  'w1000_1.tif': require('@/assets/test/w1000/0001.tif'),
  'w1000_2.tif': require('@/assets/test/w1000/0002.tif'),
  // ... 其他图片
};

// 烟台分类图片 - 修正为正确的TIF格式
const yantaiImages = {
  'yantai_1.tif': require('@/assets/test/yantai/0001.tif'),
  'yantai_2.tif': require('@/assets/test/yantai/0002.tif'),
  // ... 其他图片
};

// 中南分类图片
const zhongnanImages = {
  'zhongnan_1.jpg': require('@/assets/test/zhongnan/0500_0500_164.jpg'),
  'zhongnan_2.jpg': require('@/assets/test/zhongnan/0500_0550_164.jpg'),
  // ... 其他图片
};

// 按文件夹组织所有图片
const allImages = {
  beike: beikeImages,
  fenmo: fenmoImages,
  huake: huakeImages,
  w800: w800Images,
  w900: w900Images,
  w1000: w1000Images,
  yantai: yantaiImages,
  zhongnan: zhongnanImages
};

// 缓存已处理的图片数据，提高性能
const imageCache = new Map();

/**
 * 根据分类获取对应的图片
 * @param {string} category - 分类名称对应的文件夹名
 * @returns {Array} - 图片对象数组
 */
export function getImagesByCategory(category) {
  // 检查缓存
  if (imageCache.has(category)) {
    return imageCache.get(category);
  }

  // 如果是"所有分类"，返回所有图片
  if (category === 'all') {
    const allCategoryImages = [];
    Object.keys(allImages).forEach(folder => {
      const images = Object.entries(allImages[folder]).map(([fileName, imgUrl], index) => {
        // 确保正确判断TIFF格式 - 使用正则匹配文件名
        const isTiff = /\.(tif|tiff|TIF|TIFF)$/i.test(fileName);
        const fileType = isTiff ? 'image/tiff' : getFileTypeFromName(fileName);

        // 获取原始文件名和扩展名
        const extension = getOriginalExtension(fileName);
        const originalFileName = `${folder}_${index + 1}${extension}`;

        // 处理webpack模块化后的URL
        const normalizedUrl = getNormalizedUrl(imgUrl);

        return {
          imgUrl, // 保留原始引用
          img_edUrl: imgUrl,
          showUrl: imgUrl,
          name: `${folder}_${index + 1}`,
          fileName: originalFileName,
          originalName: fileName,
          categoryId: getCategoryIdByFolder(folder),
          isTiff, // 明确标记是否为TIFF
          fileType, // 文件MIME类型
          originalExtension: extension,
          originalUrl: normalizedUrl, // 标准化后的URL
          folder // 添加所属文件夹信息
        };
      });

      allCategoryImages.push(...images);
    });

    // 缓存结果
    imageCache.set(category, allCategoryImages);
    return allCategoryImages;
  }

  // 如果分类不存在，返回空数组
  if (!allImages[category]) {
    console.warn(`分类 ${category} 不存在`);
    imageCache.set(category, []);
    return [];
  }

  // 返回指定分类的图片
  const categoryImages = Object.entries(allImages[category]).map(([fileName, imgUrl], index) => {
    // 检测并添加格式信息
    const fileNameLower = fileName.toLowerCase();
    const isTiff = /\.(tif|tiff)$/i.test(fileNameLower);
    const fileType = getFileTypeFromName(fileNameLower);
    const originalFileName = `${category}_${index + 1}${getOriginalExtension(fileName)}`;

    return {
      imgUrl,
      img_edUrl: imgUrl, // 暂时使用相同的URL，可根据实际情况修改
      showUrl: imgUrl,
      name: `${category}_${index + 1}`,
      fileName: originalFileName,
      categoryId: getCategoryIdByFolder(category),
      isTiff, // TIFF格式标识
      fileType, // 文件类型
      originalExtension: getOriginalExtension(fileName), // 保存原始扩展名
      originalSize: null // 实际大小值不可知，需后续处理
    };
  });

  // 缓存结果
  imageCache.set(category, categoryImages);
  return categoryImages;
}

/**
 * 根据文件夹名获取分类ID
 * @param {string} folder - 文件夹名
 * @returns {number} - 分类ID
 */
function getCategoryIdByFolder(folder) {
  const folderToId = {
    'beike': 1,
    'fenmo': 2,
    'huake': 3,
    'w800': 4,
    'w900': 5,
    'w1000': 6,
    'yantai': 7,
    'zhongnan': 8
  };
  return folderToId[folder] || 0;
}

/**
 * 获取原始文件扩展名，保留大小写
 * @param {string} fileName - 文件名
 * @returns {string} - 原始扩展名
 */
function getOriginalExtension(fileName) {
  const match = fileName.match(/\.[^.]+$/);
  return match ? match[0] : '.jpg';
}

/**
 * 根据文件名获取文件类型
 * @param {string} fileName - 文件名
 * @returns {string} - 文件MIME类型
 */
function getFileTypeFromName(fileName) {
  if (/\.jpe?g$/i.test(fileName)) return 'image/jpeg';
  if (/\.png$/i.test(fileName)) return 'image/png';
  if (/\.tiff?$/i.test(fileName)) return 'image/tiff';
  if (/\.gif$/i.test(fileName)) return 'image/gif';
  if (/\.bmp$/i.test(fileName)) return 'image/bmp';
  if (/\.webp$/i.test(fileName)) return 'image/webp';
  return 'image/jpeg'; // 默认类型
}

/**
 * 获取标准化的URL（处理webpack模块对象）
 * @param {*} url - 原始URL或webpack模块对象
 * @returns {string} - 标准化的URL字符串
 */
function getNormalizedUrl(url) {
  if (typeof url === 'object' && url.__esModule) {
    return url.default || '';
  }
  return url || '';
}

// 清除缓存的方法，在应用状态变化时可能需要
export function clearImageCache() {
  imageCache.clear();
}

export default allImages;
