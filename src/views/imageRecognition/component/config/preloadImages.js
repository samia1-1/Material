/**
 * 预导入所有示例图片
 */

// 图片集合配置
const imageCollections = {
  beike: {
    type: 'jpg',
    files: {
      'beike_1.jpg': require('@/assets/test/beike/0001.jpg'),
      'beike_2.jpg': require('@/assets/test/beike/0002.jpg'),
    }
  },

  fenmo: {
    type: 'tif',
    files: {
      'fenmo_1.TIF': require('@/assets/test/fenmo/1.TIF'),
      'fenmo_3.TIF': require('@/assets/test/fenmo/3.TIF'),
    }
  },

  huake: {
    type: 'jpg',
    files: {
      'huake_1.jpg': require('@/assets/test/huake/1.jpg'),
      'huake_2.jpg': require('@/assets/test/huake/2.jpg'),
    }
  },

  w800: {
    type: 'tif',
    files: {
      'w800_1.tif': require('@/assets/test/w800/0001.tif'),
      'w800_2.tif': require('@/assets/test/w800/0002.tif'),
    }
  },

  w900: {
    type: 'tif',
    files: {
      'w900_1.tif': require('@/assets/test/w900/0001.tif'),
      'w900_2.tif': require('@/assets/test/w900/0002.tif'),
    }
  },

  w1000: {
    type: 'tif',
    files: {
      'w1000_1.tif': require('@/assets/test/w1000/0001.tif'),
      'w1000_2.tif': require('@/assets/test/w1000/0002.tif'),
    }
  },

  yantai: {
    type: 'tif',
    files: {
      'yantai_1.tif': require('@/assets/test/yantai/0001.tif'),
      'yantai_2.tif': require('@/assets/test/yantai/0002.tif'),
    }
  },

  zhongnan: {
    type: 'jpg',
    files: {
      'zhongnan_1.jpg': require('@/assets/test/zhongnan/0500_0500_164.jpg'),
      'zhongnan_2.jpg': require('@/assets/test/zhongnan/0500_0550_164.jpg'),
    }
  }
};

// 文件夹到分类ID的映射
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

// 缓存已处理的图片数据
const imageCache = new Map();

/**
 * 根据分类获取图片
 */
export function getImagesByCategory(category) {
  // 检查缓存
  if (imageCache.has(category)) return imageCache.get(category);

  // 处理"所有分类"
  if (category === 'all') {
    const allImages = [];
    Object.keys(imageCollections).forEach(folder => {
      const images = processCollectionImages(folder);
      allImages.push(...images);
    });

    imageCache.set(category, allImages);
    return allImages;
  }

  // 处理特定分类
  if (!imageCollections[category]) {
    console.warn(`分类 ${category} 不存在`);
    imageCache.set(category, []);
    return [];
  }

  // 处理并返回指定分类的图片
  const images = processCollectionImages(category);
  imageCache.set(category, images);
  return images;
}

/**
 * 处理集合中的图片
 */
function processCollectionImages(folder) {
  const collection = imageCollections[folder];
  const categoryId = folderToId[folder] || 0;
  const isTiff = collection.type.toLowerCase() === 'tif';

  return Object.entries(collection.files).map(([fileName, imgUrl], index) => {
    const fileType = isTiff ? 'image/tiff' : 'image/jpeg';
    const extension = getOriginalExtension(fileName);
    const itemName = `${folder}_${index + 1}`;

    return {
      imgUrl,
      img_edUrl: imgUrl,
      showUrl: imgUrl,
      name: itemName,
      fileName: `${itemName}${extension}`,
      originalName: fileName,
      categoryId,
      isTiff,
      fileType,
      originalExtension: extension,
      folder
    };
  });
}

/**
 * 获取原始文件扩展名
 */
function getOriginalExtension(fileName) {
  const match = fileName.match(/\.[^.]+$/);
  return match ? match[0] : '.jpg';
}

// 清除缓存
export function clearImageCache() {
  imageCache.clear();
}

export default imageCollections;
