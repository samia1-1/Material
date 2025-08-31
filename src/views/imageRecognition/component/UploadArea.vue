<template>
  <div class="upload-placeholder">
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
      @click.stop="triggerUpload"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop">

      <div class="upload-content">
        <i class="el-icon-upload"></i>
        <div class="upload-text">点击上传图片或拖拽到此处</div>
        <div class="upload-tip">支持PNG、JPG、TIFF格式，最大10MB</div>
      </div>
    </div>

    <input
      type="file"
      ref="fileInput"
      style="display:none"
      accept="image/jpeg,image/png,image/tiff"
      @change="handleFileChange" />
  </div>
</template>

<script>
export default {
  name: 'UploadArea',
  data() {
    return {
      isDragOver: false,
      lastUploadTime: 0
    }
  },
  emits: ['upload-file'],
  methods: {
    triggerUpload() {
      const now = Date.now();
      if (now - this.lastUploadTime < 500) return;
      this.lastUploadTime = now;
      this.$refs.fileInput?.click();
    },
    handleFileChange(event) {
      const file = event.target.files?.[0];
      if (file) {
        this.$emit('upload-file', file);
      }
      event.target.value = '';
    },
    handleDragOver(e) {
      e.preventDefault();
      this.isDragOver = true;
    },
    handleDragLeave(e) {
      e.preventDefault();
      this.isDragOver = false;
    },
    handleDrop(e) {
      e.preventDefault();
      this.isDragOver = false;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.$emit('upload-file', files[0]);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #030303;

  .upload-area {
    border: 3px dashed #7e92a5;
    border-radius: 8px;
    background-color: rgba(10, 32, 64, 0.3);
    width: 90%;
    max-width: 550px;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 15px rgba(10, 32, 64, 0.4) inset, 0 0 5px rgba(58, 123, 189, 0.3);

    &.drag-over {
      border-color: #7a8998;
      background-color: rgba(10, 32, 64, 0.5);
      box-shadow: 0 0 20px rgba(58, 139, 210, 0.6) inset, 0 0 10px rgba(86, 169, 255, 0.5);

      i {
        transform: scale(1.3);
        color: #6b7c8d;
      }
    }

    .upload-content {
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 20px;
      z-index: 2;
      position: relative;

      i {
        font-size: 60px;
        color: #3a7cbd;
        margin-bottom: 20px;
        filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
      }

      .upload-text, .upload-tip {
        color: #ffffff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        margin-bottom: 15px;
      }

      .upload-text {
        font-size: 20px;
        font-weight: 500;
      }

      .upload-tip {
        font-size: 16px;
        color: #a0c0e0;
        margin-bottom: 0;
      }
    }
  }
}
</style>
