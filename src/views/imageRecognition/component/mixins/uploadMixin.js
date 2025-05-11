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
      detectedFormat: null,
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

    // 拖放事件处理 - 合并相关逻辑
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

    // 处理上传的文件 - 简化流程
    processUploadedFile(file) {
      // 验证文件基本属性
      if (!this.validateFile(file)) return;

      // 保存原始文件信息
      this.originalFileFormat = file.type;
      this.originalFileName = file.name;

      // 存储会话数据
      const sessionData = {
        "originalFormat": this.originalFileFormat,
        "originalFileName": this.originalFileName
      };

      Object.entries(sessionData).forEach(([key, value]) => {
        sessionStorage.setItem(key, value);
      });

      // 验证文件内容并上传
      this.validateFileContent(file)
        .then(isValid => {
          if (isValid) {
            this.uploadFileToServer?.(file);
          } else {
            this.showMessage('文件内容验证失败，请确保上传有效的图片文件', 'error');
          }
        })
        .catch(error => {
          console.error('文件内容验证错误:', error);
          this.showMessage('无法验证文件内容，请重试', 'error');
        });
    },

    // 合并文件验证 - 精简代码
    validateFile(file) {
      // 验证类型
      if (!this.validImageTypes.includes(file.type)) {
        this.showMessage('请选择有效的图片文件 (JPG, PNG, TIFF)', 'error');
        return false;
      }

      // 验证大小
      if (file.size > this.maxFileSize) {
        this.showMessage(`文件大小不能超过${this.maxFileSize / 1024 / 1024}MB`, 'error');
        return false;
      }

      return true;
    },

    // 深度验证文件内容 - 优化实现
    validateFileContent(file) {
      return new Promise((resolve, reject) => {
        // 创建文件读取器
        const reader = new FileReader();

        reader.onloadend = (e) => {
          if (!e.target?.result) {
            return resolve(false);
          }

          try {
            // 读取文件头部以验证真实格式
            const arr = new Uint8Array(e.target.result).subarray(0, 12);
            const header = Array.from(arr).map(byte =>
              byte.toString(16).padStart(2, '0')).join('');

            // 格式匹配检测
            const formatChecks = {
              'image/png': header.startsWith('89504e47'),
              'image/jpeg': header.startsWith('ffd8ff'),
              'image/tiff': header.startsWith('49492a00') || header.startsWith('4d4d002a')
            };

            // 保存检测到的格式
            for (const [format, isMatch] of Object.entries(formatChecks)) {
              if (isMatch) {
                this.detectedFormat = format;
                break;
              }
            }

            // 安全检查 - 检测HTML内容
            const isHTML = this.checkForHtmlContent(e.target.result);

            // 如果检测到格式或者不是HTML，则认为有效
            const isValid = !!this.detectedFormat || !isHTML;
            resolve(isValid);
          } catch (error) {
            console.error('文件内容验证失败:', error);
            resolve(true); // 出错时允许上传尝试
          }
        };

        reader.onerror = () => reject(new Error('无法读取文件'));
        reader.readAsArrayBuffer(file.slice(0, 50));
      });
    },

    // 检查HTML内容 - 分离为独立函数
    checkForHtmlContent(buffer) {
      if (buffer.byteLength < 20) return false;

      const textDecoder = new TextDecoder();
      const sampleText = textDecoder.decode(
        new Uint8Array(buffer).subarray(0, 20)
      ).toLowerCase();

      return sampleText.includes('<!doctype html') ||
             sampleText.includes('<html');
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
