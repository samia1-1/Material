/**
 * 文件上传相关功能
 * 负责处理图片上传、验证和错误处理
 */

export default {
  data() {
    return {
      // 上传相关状态
      isDragOver: false,
      lastUploadTime: 0,
      validImageTypes: ['image/jpeg', 'image/png', 'image/tiff', 'image/tif'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      // 新增：文件格式跟踪
      originalFileFormat: null,
      originalFileName: null,
    };
  },

  methods: {
    // 触发文件选择对话框
    triggerUpload() {
      // 防止短时间内重复触发
      const now = Date.now();
      if (now - this.lastUploadTime < 500) {
        console.log('忽略重复的上传操作');
        return;
      }

      // 记录上传时间
      this.lastUploadTime = now;

      // 触发文件选择
      if (this.$refs.fileInput) {
        this.$refs.fileInput.click();
      }
    },

    // 处理原生文件输入变化
    handleNativeFileChange(event) {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        this.processUploadedFile(file);
      }
      // 重置文件输入以允许上传相同文件
      event.target.value = '';
    },

    // 处理拖拽文件释放
    handleDrop(event) {
      this.isDragOver = false;
      event.preventDefault();

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        this.processUploadedFile(file);
      }
    },

    // 处理拖拽悬停
    handleDragOver(event) {
      event.preventDefault();
      this.isDragOver = true;
    },

    // 处理拖拽离开
    handleDragLeave(event) {
      event.preventDefault();
      this.isDragOver = false;
    },

    // 验证并处理上传的文件
    processUploadedFile(file) {
      // 验证文件类型
      if (!this.validateFileType(file)) {
        this.showMessage('请选择有效的图片文件 (JPG, PNG, TIFF)', 'error');
        return;
      }

      // 验证文件大小
      if (!this.validateFileSize(file)) {
        this.showMessage(`文件大小不能超过${this.maxFileSize / 1024 / 1024}MB`, 'error');
        return;
      }

      // 保存原始文件信息
      this.originalFileFormat = file.type;
      this.originalFileName = file.name;

      // 记录文件格式到会话存储
      sessionStorage.setItem("originalFormat", this.originalFileFormat);
      sessionStorage.setItem("originalFileName", this.originalFileName);

      // 深度验证文件内容
      this.validateFileContent(file)
        .then(isValid => {
          if (isValid) {
            // 文件验证通过，处理上传 - 保留原始文件对象
            this.uploadFileToServer(file);
          } else {
            this.showMessage('文件内容验证失败，请确保上传有效的图片文件', 'error');
          }
        })
        .catch(error => {
          console.error('文件内容验证错误:', error);
          this.showMessage('无法验证文件内容，请重试', 'error');
        });
    },

    // 验证文件类型
    validateFileType(file) {
      return this.validImageTypes.includes(file.type);
    },

    // 验证文件大小
    validateFileSize(file) {
      return file.size <= this.maxFileSize;
    },

    // 深度验证文件内容（检查文件头）
    validateFileContent(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = (e) => {
          try {
            // 文件头部验证
            const arr = new Uint8Array(e.target.result).subarray(0, 12);
            const header = Array.from(arr).map(byte => byte.toString(16).padStart(2, '0')).join('');

            // 检查常见图片格式的文件头
            const isPNG = header.startsWith('89504e47'); // PNG
            const isJPEG = header.startsWith('ffd8ff'); // JPEG
            const isTIFF1 = header.startsWith('49492a00'); // TIFF (little endian)
            const isTIFF2 = header.startsWith('4d4d002a'); // TIFF (big endian)

            // 保存实际文件格式信息到属性中
            if (isPNG) this.detectedFormat = 'image/png';
            else if (isJPEG) this.detectedFormat = 'image/jpeg';
            else if (isTIFF1 || isTIFF2) this.detectedFormat = 'image/tiff';
            else this.detectedFormat = null;

            // 验证是否为HTML内容
            const isHTML = e.target.result.byteLength > 20 &&
                          (new TextDecoder().decode(new Uint8Array(e.target.result).subarray(0, 20)).toLowerCase().includes('<!doctype html') ||
                          new TextDecoder().decode(new Uint8Array(e.target.result).subarray(0, 20)).toLowerCase().includes('<html'));

            if (isPNG || isJPEG || isTIFF1 || isTIFF2) {
              resolve(true);
            } else if (isHTML) {
              console.error('检测到HTML内容而非图片');
              this.showMessage('上传的文件是HTML而非图片，请选择有效的图片文件', 'error');
              resolve(false);
            } else {
              console.warn('未知的文件格式');
              // 仍然允许上传，依赖服务器进行最终验证
              resolve(true);
            }
          } catch (error) {
            console.error('文件内容验证失败:', error);
            // 出错时依然允许上传尝试
            resolve(true);
          }
        };

        reader.onerror = () => {
          reject(new Error('无法读取文件'));
        };

        // 只读取文件头部的几个字节来验证格式
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
