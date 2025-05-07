/**
 * 文件上传相关功能
 */

export default {
  data() {
    return {
      isDragOver: false,
      lastUploadTime: 0,
      validImageTypes: ['image/jpeg', 'image/png', 'image/tiff', 'image/tif'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      originalFileFormat: null,
      originalFileName: null,
    };
  },

  methods: {
    // 触发文件选择对话框 - 防抖处理
    triggerUpload() {
      const now = Date.now();
      if (now - this.lastUploadTime < 500) return;

      this.lastUploadTime = now;
      this.$refs.fileInput?.click();
    },

    // 处理文件输入变化
    handleNativeFileChange(event) {
      const files = event.target.files;
      if (files?.length > 0) this.processUploadedFile(files[0]);
      event.target.value = ''; // 重置，允许上传相同文件
    },

    // 处理拖放事件
    handleDrop(event) {
      this.isDragOver = false;
      event.preventDefault();

      const files = event.dataTransfer.files;
      if (files?.length > 0) this.processUploadedFile(files[0]);
    },

    handleDragOver(event) {
      event.preventDefault();
      this.isDragOver = true;
    },

    handleDragLeave(event) {
      event.preventDefault();
      this.isDragOver = false;
    },

    // 处理上传的文件
    processUploadedFile(file) {
      // 合并文件验证
      if (!this.validateFile(file)) return;

      // 保存原始文件信息
      this.originalFileFormat = file.type;
      this.originalFileName = file.name;

      // 存储到会话
      sessionStorage.setItem("originalFormat", this.originalFileFormat);
      sessionStorage.setItem("originalFileName", this.originalFileName);

      // 验证文件内容
      this.validateFileContent(file)
        .then(isValid => {
          isValid ? this.uploadFileToServer(file) :
            this.showMessage('文件内容验证失败，请确保上传有效的图片文件', 'error');
        })
        .catch(error => {
          console.error('文件内容验证错误:', error);
          this.showMessage('无法验证文件内容，请重试', 'error');
        });
    },

    // 合并文件验证
    validateFile(file) {
      if (!this.validImageTypes.includes(file.type)) {
        this.showMessage('请选择有效的图片文件 (JPG, PNG, TIFF)', 'error');
        return false;
      }

      if (file.size > this.maxFileSize) {
        this.showMessage(`文件大小不能超过${this.maxFileSize / 1024 / 1024}MB`, 'error');
        return false;
      }

      return true;
    },

    // 深度验证文件内容
    validateFileContent(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = (e) => {
          try {
            // 文件头部验证
            const arr = new Uint8Array(e.target.result).subarray(0, 12);
            const header = Array.from(arr).map(byte => byte.toString(16).padStart(2, '0')).join('');

            // 检查图片格式
            const isPNG = header.startsWith('89504e47');
            const isJPEG = header.startsWith('ffd8ff');
            const isTIFF1 = header.startsWith('49492a00');
            const isTIFF2 = header.startsWith('4d4d002a');

            // 保存格式信息
            if (isPNG) this.detectedFormat = 'image/png';
            else if (isJPEG) this.detectedFormat = 'image/jpeg';
            else if (isTIFF1 || isTIFF2) this.detectedFormat = 'image/tiff';
            else this.detectedFormat = null;

            // 检查是否为HTML内容（安全检查）
            const isHTML = e.target.result.byteLength > 20 &&
                          new TextDecoder().decode(new Uint8Array(e.target.result).subarray(0, 20))
                          .toLowerCase().includes('<!doctype html') ||
                          new TextDecoder().decode(new Uint8Array(e.target.result).subarray(0, 20))
                          .toLowerCase().includes('<html');

            resolve(isPNG || isJPEG || isTIFF1 || isTIFF2 || !isHTML);
          } catch (error) {
            console.error('文件内容验证失败:', error);
            resolve(true); // 出错时允许上传尝试
          }
        };

        reader.onerror = () => reject(new Error('无法读取文件'));
        reader.readAsArrayBuffer(file.slice(0, 50));
      });
    },

    // 显示消息工具方法
    showMessage(message, type) {
      if (this.$message) {
        this.$message({
          message,
          type,
          duration: 3000
        });
      } else {
        console.log(`[${type}] ${message}`);
        alert(message);
      }
    }
  }
};
