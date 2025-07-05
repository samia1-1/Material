<template>
  <el-dialog title="批量材料文件处理" :visible.sync="dialogVisible" width="70%" :close-on-click-modal="false"
    @close="onDialogClose">
    <div class="folder-upload-container">

      <!-- 上传区域 -->
      <div class="upload-area" :class="{ dragover: isDragOver }" @drop.prevent="handleDrop"
        @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave" @click="triggerFileInput">
        <input ref="folderInput" type="file" webkitdirectory directory multiple style="display: none;"
          @change="handleFolderSelect">
        <i class="el-icon-upload"></i>
        <div class="upload-text">
          <p>点击选择或拖拽包含材料文件的文件夹</p>
          <p class="upload-tip">支持: JSON (基础数据) + XLSX (表格/图表数据)</p>
        </div>
      </div>

      <!-- 分析结果 -->
      <div v-if="folderAnalysis" class="file-analysis">
        <h4>📁 检测结果</h4>
        <div class="stats">
          <span>总文件: {{ folderAnalysis.statistics.totalFiles }}</span>
          <span>材料数: {{ folderAnalysis.statistics.materialsCount }}</span>
          <span>可处理: {{ folderAnalysis.statistics.readyMaterials }}</span>
        </div>
        <div class="materials-grid">
          <div v-for="material in folderAnalysis.materials" :key="material.code" class="material-item">
            <span class="material-code">{{ material.code }}</span>
            <div class="file-types">
              <span v-if="material.hasJson" class="file-type json">J</span>
              <span v-if="material.hasTableExcel" class="file-type table">T</span>
              <span v-if="material.hasChartExcel" class="file-type chart">C</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 处理进度 -->
      <div v-if="isProcessing" class="processing">
        <h4>🔄 处理中... ({{ processProgress.progress }}%)</h4>
        <el-progress :percentage="processProgress.progress"></el-progress>
        <p>{{ processProgress.currentMaterial }} ({{ processProgress.current }}/{{ processProgress.total }})</p>
      </div>

      <!-- 处理结果 -->
      <div v-if="batchResults" class="results">
        <h4>✅ 处理完成</h4>
        <div class="result-stats">
          <el-tag type="success">成功: {{ batchResults.summary.processed }}</el-tag>
          <el-tag type="danger" v-if="batchResults.summary.failed > 0">失败: {{ batchResults.summary.failed }}</el-tag>
          <el-tag type="warning" v-if="batchResults.summary.skipped > 0">跳过: {{ batchResults.summary.skipped }}</el-tag>
        </div>

        <div v-if="batchResults.errors && batchResults.errors.length > 0" class="error-details">
          <h5>错误详情:</h5>
          <el-alert v-for="(error, index) in batchResults.errors" :key="index" :title="error.code"
            :description="error.message" type="error" show-icon :closable="false"></el-alert>
        </div>

        <div class="processed-materials">
          <h5>成功处理的材料:</h5>
          <div v-for="(data, materialCode) in batchResults.processedMaterials" :key="materialCode"
            class="processed-item">
            <span>{{ materialCode }}</span>
            <span>{{ countDataItems(data) }} 项数据</span>
          </div>
        </div>
      </div>

    </div>

    <div slot="footer">
      <el-button @click="cancelProcessing" v-if="isProcessing">取消处理</el-button>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button v-if="folderAnalysis && !isProcessing && !batchResults" type="primary" @click="startBatchProcessing"
        :disabled="folderAnalysis.statistics.readyMaterials === 0">
        开始处理
      </el-button>
      <el-button v-if="batchResults" type="success" @click="downloadBatchResults">
        下载结果 (.zip)
      </el-button>
    </div>
  </el-dialog>
</template>

<script>

import DataProcessorWorker from 'worker-loader?esModule=false!@/utils/dataProcessor.worker.js';
import { getJson } from '@/api/database/dataStretch.js';

const baseUrl = process.env.NODE_ENV === 'production' ? 'http://www.ai4matter.com' : 'http://localhost:8100';

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: this.visible,
      isDragOver: false,
      uploadedFiles: [],
      folderAnalysis: null,
      isProcessing: false,
      processProgress: { current: 0, total: 0, progress: 0, currentMaterial: '' },
      batchResults: null,
      worker: null,
    };
  },
  mounted() {
    this.setupWorker();
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal;
      if (newVal) {
        this.resetUploadState();
      }
    },
  },
  methods: {
    onDialogClose() {
      this.$emit('update:visible', false);
      this.cancelProcessing(); // Ensure worker is terminated if dialog is closed
    },
    resetUploadState() {
      this.uploadedFiles = [];
      this.folderAnalysis = null;
      this.isProcessing = false;
      this.batchResults = null;
      this.processProgress = { current: 0, total: 0, progress: 0, currentMaterial: '' };
      if (this.$refs.folderInput) {
        this.$refs.folderInput.value = null;
      }
    },
    triggerFileInput() {
      this.$refs.folderInput.click();
    },
    handleFolderSelect(event) {
      const files = Array.from(event.target.files);
      this.processUploadedFiles(files);
    },
    handleDragOver(event) {
      this.isDragOver = true;
    },
    handleDragLeave(event) {
      this.isDragOver = false;
    },
    handleDrop(event) {
      this.isDragOver = false;
      const files = Array.from(event.dataTransfer.items)
        .filter(item => item.kind === 'file')
        .map(item => item.getAsFile());
      this.processUploadedFiles(files);
    },
    processUploadedFiles(files) {
      if (files.length === 0) {
        this.$message.warning('没有选择文件');
        return;
      }
      this.uploadedFiles = files;
      if (this.worker) {
        this.worker.postMessage({ type: 'analyze', payload: files });
      }
    },
    setupWorker() {
      this.worker = new DataProcessorWorker();
      this.worker.onmessage = (event) => {
        const { type, payload } = event.data;
        switch (type) {
          case 'analysis_result':
            this.folderAnalysis = payload;
            if (payload.statistics.materialsCount === 0) {
              this.$message.warning('未检测到有效的材料文件');
            } else {
              this.$message.success(`检测到 ${payload.statistics.materialsCount} 种材料`);
            }
            break;
          case 'progress':
            this.processProgress = payload;
            break;
          case 'result':
            this.batchResults = payload;
            this.isProcessing = false;
            this.$message.success(`处理完成! 成功 ${payload.summary.processed}, 失败 ${payload.summary.failed}`);
            break;
          case 'download_blob':
            this.handleDownloadBlob(payload);
            break;
          case 'error':
            this.$message.error(`处理出错: ${payload}`);
            this.isProcessing = false;
            break;
        }
      };
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.$message.error(`Worker发生错误: ${error.message}`);
        this.isProcessing = false;
      };
    },
    startBatchProcessing() {
      if (!this.folderAnalysis || this.folderAnalysis.statistics.readyMaterials === 0) {
        this.$message.warning('没有可处理的材料');
        return;
      }

      this.isProcessing = true;
      this.batchResults = null;
      if (this.worker) {
        this.worker.postMessage({ type: 'process', payload: this.uploadedFiles });
      }
    },
    async downloadBatchResults() {
      if (!this.batchResults) return;

      this.$message.info('正在准备下载文件...');

      let existingMenuData = null;
      try {
        const menuUrl = `${baseUrl}/json/menu.json`;
        existingMenuData = await getJson(menuUrl);
      } catch (error) {
        console.warn('无法加载现有菜单，将创建新菜单:', error);
      }

      if (this.worker) {
        this.worker.postMessage({
          type: 'download',
          payload: {
            results: this.batchResults,
            existingMenuData
          }
        });
      }
    },
    handleDownloadBlob(blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `materials_batch_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.$message.success('结果已开始下载！');
    },
    cancelProcessing() {
      if (this.worker) {
        this.terminateWorker();
        this.isProcessing = false;
        this.$message.warning('处理已取消');
      }
    },
    terminateWorker() {
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
    },
    countDataItems(materialData) {
      let count = 0;
      const requiredSections = ['introduce', 'physicalChemistry', 'mechanical', 'craft', 'microstructures'];
      requiredSections.forEach(section => {
        if (materialData[section] && Array.isArray(materialData[section])) {
          const countItemsRecursively = (items) => {
            if (!Array.isArray(items)) return 0;
            let innerCount = items.length;
            items.forEach(item => {
              if (item) {
                ['two', 'third', 'fourth'].forEach(prop => {
                  if (item[prop] && Array.isArray(item[prop])) {
                    innerCount += countItemsRecursively(item[prop]);
                  }
                });
              }
            });
            return innerCount;
          };
          count += countItemsRecursively(materialData[section]);
        }
      });
      return count;
    }
  },
  beforeDestroy() {
    this.terminateWorker();
  }
};
</script>

<style scoped>
.folder-upload-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: #409eff;
}

.upload-area .el-icon-upload {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text p {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.file-analysis h4,
.processing h4,
.results h4 {
  margin-bottom: 10px;
}

.stats,
.result-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.material-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fff;
}

.material-code {
  font-weight: bold;
  font-size: 14px;
}

.file-types {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.file-type {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  color: #fff;
  font-weight: bold;
  font-size: 12px;
}

.file-type.json {
  background-color: #f5a623;
}

.file-type.table {
  background-color: #4a90e2;
}

.file-type.chart {
  background-color: #50e3c2;
}

.results .processed-materials,
.results .error-details {
  margin-top: 15px;
}

.results .processed-materials h5,
.results .error-details h5 {
  margin-bottom: 10px;
}

.processed-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: #f7f7f7;
  margin-bottom: 5px;
}

.el-alert {
  margin-bottom: 5px;
}
</style>
