<template>
  <div class="footer-examples">
    <el-card class="example-card" shadow="hover">
      <div slot="header" class="card-header">
        <span><i class="el-icon-picture"></i> 示例图片</span>
        <el-tooltip content="点击图片查看处理前后对比效果" placement="top">
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
      <el-tabs v-model="activeCategory" type="card">
        <el-tab-pane
          v-for="category in categories"
          :key="category.id"
          :label="category.name"
          :name="category.id.toString()"
          class="example-tab">
          <div class="show-img-list">
            <div class="img-grid">
              <div
                v-for="(item, index) in getCategoryImages(category.id)"
                :key="index"
                class="img-col">
                <div class="img-item-card" @click="$emit('load-example', item)">
                  <div class="img-preview-container">
                    <img
                      :src="getImagePreviewUrl(item)"
                      class="show-img"
                      :alt="item.name"
                      @error="handleImageError">
                    <div v-if="item.isTiff && isGeneratingPreview(item)" class="loading-overlay">
                      <i class="el-icon-loading"></i>
                      <span>生成预览中...</span>
                    </div>
                  </div>
                  <div class="img-item-footer">
                    <span>{{ category.name }} {{ index + 1 }}</span>
                    <i class="el-icon-picture-outline-round"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { categoryConfig } from '../imageConfig';

// 使用共享的TIFF工具 - TiffUtils已在imageContent.vue中定义

export default {
  name: 'ExampleGallery',

  data() {
    return {
      activeCategory: '0',
      processingPreviews: new Set()
    };
  },

  emits: ['load-example'],

  computed: {
    ...mapState('imageRecognition', [
      'categoryImages',
      'allImages',
      'previewCache'
    ]),

    categories() {
      return categoryConfig;
    }
  },

  methods: {
    ...mapActions('imageRecognition', ['setPreviewCache']),

    getCategoryImages(categoryId) {
      return categoryId === 0 ? this.allImages : (this.categoryImages[categoryId] || []);
    },

    getImagePreviewUrl(item) {
      if (!item) return '';

      const cacheKey = `${item.categoryId}_${item.name}`;
      if (this.previewCache.has(cacheKey)) {
        return this.previewCache.get(cacheKey);
      }

      const originalUrl = this.getUrlFromItem(item);

      // 异步生成 TIFF 预览
      if (item.isTiff && !this.processingPreviews.has(cacheKey)) {
        this.generateTiffPreview(item, cacheKey, originalUrl);
      }

      return originalUrl;
    },

    async generateTiffPreview(item, cacheKey, imageUrl) {
      this.processingPreviews.add(cacheKey);

      try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        const tiffDataUrl = await window.TiffUtils.processTiffArrayBuffer(arrayBuffer);

        // 转换为缩略图
        const tiffCanvas = await this.createCanvasFromDataUrl(tiffDataUrl);
        const thumbnailUrl = window.TiffUtils.createThumbnailFromCanvas(tiffCanvas);

        // 使用 Vuex 设置缓存
        this.setPreviewCache({ key: cacheKey, url: thumbnailUrl });

        // 强制更新组件
        this.$forceUpdate();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`TIFF预览生成失败: ${item.name}`, error.message);
        }

        // 创建失败占位图
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 200;
        fallbackCanvas.height = 150;
        const ctx = fallbackCanvas.getContext('2d');
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, 200, 150);
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.font = '12px Arial';
        ctx.fillText('TIFF 预览失败', 100, 70);
        ctx.fillText(item.name, 100, 90);

        const fallbackUrl = fallbackCanvas.toDataURL('image/png');
        this.setPreviewCache({ key: cacheKey, url: fallbackUrl });
      } finally {
        this.processingPreviews.delete(cacheKey);
        this.$forceUpdate();
      }
    },

    getUrlFromItem(item) {
      if (!item || !item.imgUrl) return '';
      return typeof item.imgUrl === 'object' && item.imgUrl.__esModule ? item.imgUrl.default : item.imgUrl;
    },

    handleImageError(event) {
      const src = event.target.src;
      // 如果是TIFF文件无法显示，这是正常的，不需要记录错误
      if (src.toLowerCase().includes('.tif')) {
        return; // TIFF文件预期会失败，等待预览服务处理
      }
      console.error('Image failed to load:', src);
    },

    isGeneratingPreview(item) {
      if (!item.isTiff) return false;

      const cacheKey = `${item.categoryId}_${item.name}`;

      // 如果已经有缓存的预览，就不显示加载状态
      if (this.previewCache.has(cacheKey)) {
        return false;
      }

      // 如果正在处理，显示加载状态
      return this.processingPreviews.has(cacheKey);
    },

    createCanvasFromDataUrl(dataUrl) {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          resolve(canvas);
        };
        img.src = dataUrl;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.footer-examples {
  margin: 10px 0 20px;
  position: relative;
  z-index: 5;
  width: 100%;

  .example-card {
    margin-bottom: 0;
    min-height: 240px;
    border-radius: 6px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border: 1px solid #334155;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    overflow: hidden;

    ::v-deep .el-card__header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-bottom: 1px solid #475569;
      padding: 12px 20px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #475569 0%, #64748b 100%);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #ffffff;
      font-weight: 600;

      span {
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;

        i {
          color: #64748b;
          font-size: 18px;
        }
      }

      .el-tooltip {
        color: #cbd5e0;
        font-size: 16px;
        cursor: help;
        transition: all 0.2s ease;

        &:hover {
          color: #64748b;
          transform: scale(1.1);
        }
      }
    }

    ::v-deep .el-card__body {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 12px 16px 16px;
      min-height: 160px;
    }

    ::v-deep .el-tabs__header {
      margin-bottom: 12px;
    }

    ::v-deep .el-tabs__nav-wrap {
      padding: 0 4px;
    }

    ::v-deep .el-tabs__item {
      height: 36px;
      line-height: 36px;
      font-size: 13px;
      font-weight: 500;
      color: #94a3b8 !important;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border: 1px solid #475569;
      border-bottom: none;
      border-radius: 6px 6px 0 0;
      transition: all 0.3s ease;
      padding: 0 18px;
      margin-right: 4px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(71, 85, 105, 0.2) 0%, rgba(100, 116, 139, 0.2) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        color: #e2e8f0 !important;
        background: linear-gradient(135deg, #334155 0%, #475569 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(71, 85, 105, 0.4);

        &::before {
          opacity: 1;
        }
      }

      &.is-active {
        color: #ffffff !important;
        background: linear-gradient(135deg, #475569 0%, #64748b 100%);
        border-color: #475569;
        font-weight: 600;
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(71, 85, 105, 0.6);

        &::before {
          opacity: 0;
        }
      }
    }

    ::v-deep .el-tabs__content {
      padding: 0;
    }
  }
}

.show-img-list {
  padding: 4px 0;

  .img-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    justify-content: center;
    align-items: start;
    padding: 0 10px;
  }

  .img-col {
    display: flex;
    justify-content: center;
  }

  .img-item-card {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    border: 1px solid #475569;
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    width: 100%;
    max-width: 180px;
    margin: 0 auto;
    cursor: pointer;
    transform: translateY(0) scale(1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(71, 85, 105, 0.15) 0%, rgba(100, 116, 139, 0.15) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1;
      pointer-events: none;
    }

    &:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 12px 32px rgba(71, 85, 105, 0.4);
      border-color: #64748b;

      &::before {
        opacity: 1;
      }

      .img-item-footer {
        background: linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(100, 116, 139, 0.9) 100%);

        span {
          color: #ffffff;
          font-weight: 600;
        }

        i {
          color: #ffffff;
          animation: bounce 0.6s ease;
        }
      }
    }    .img-preview-container {
      width: 100%;
      height: 110px;
      overflow: hidden;
      background: linear-gradient(135deg, #0f172a 0%, #1a2332 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      .show-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
      }

      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.85);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #1e3a8a;
        font-size: 12px;
        backdrop-filter: blur(4px);

        i {
          font-size: 18px;
          margin-bottom: 6px;
          animation: rotate 2s linear infinite;
        }

        span {
          font-weight: 500;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      }
    }

    .img-item-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      height: 36px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%);
      border-top: 1px solid #475569;
      transition: all 0.3s ease;
      position: relative;
      z-index: 2;

      span {
        color: #94a3b8;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      i {
        color: #1e3a8a;
        font-size: 16px;
        opacity: 0.8;
        transition: all 0.3s ease;
      }
    }
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-4px);
  }
  70% {
    transform: translateY(-2px);
  }
}
</style>
