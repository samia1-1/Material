/**
 * 文件上传相关功能
 * 负责文件上传、拖拽上传等交互
 */
export default {
  data() {
    return {
      // 拖拽上传相关
      isDragOver: false,  // 是否有文件拖拽到上传区域

      // 上传处理相关的标志
      uploadInProgress: false, // 标记是否有上传操作正在进行中
      fileUploadVersion: 0,    // 用于区分不同的上传操作
      preventDuplicateUpload: false, // 防止重复触发上传的标志
      lastUploadTime: 0        // 记录上次上传触发时间
    };
  },

  methods: {
    // 触发文件上传 - 使用原生方式
    triggerUpload(event) {
      // 阻止事件冒泡
      if (event) {
        event.stopPropagation();
      }

      // 检查是否在短时间内重复触发
      const now = Date.now();
      if (now - this.lastUploadTime < 500) {
        return;
      }

      this.lastUploadTime = now;

      // 清空文件输入以确保change事件总是触发
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }

      // 触发文件选择
      this.$refs.fileInput.click();
    },

    // 处理原生文件变更
    handleNativeFileChange(event) {
      if (this.preventDuplicateUpload) {
        return;
      }

      // 设置标志以阻止重复触发
      this.preventDuplicateUpload = true;
      setTimeout(() => {
        this.preventDuplicateUpload = false;
      }, 1000);

      const file = event.target.files[0];
      if (!file) {
        return;
      }

      // 文件验证和处理逻辑
      if (!this.validateFileType(file.type)) {
        this.showMessage('请选择JPG、PNG或TIFF格式的图片', 'error');
        this.clearFileInput();
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.showMessage('图片大小不能超过10MB', 'error');
        this.clearFileInput();
        return;
      }

      // 设置加载状态
      this.isLoading = true;

      // 上传文件
      this.uploadFileToServer(file);
    },

    // 清除文件输入框的值
    clearFileInput() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    // 验证文件类型
    validateFileType(type) {
      return ['image/jpeg', 'image/png', 'image/tiff'].includes(type);
    },

    // 拖拽相关事件处理
    handleDragOver(event) {
      this.isDragOver = true;
      event.dataTransfer.dropEffect = 'copy'; // 显示为复制图标
    },

    handleDragLeave() {
      this.isDragOver = false;
    },

    handleDrop(event) {
      this.isDragOver = false;

      // 获取拖拽的文件
      const files = event.dataTransfer.files;
      if (files.length === 0) {
        return;
      }

      // 只处理第一个文件
      const file = files[0];

      // 验证文件类型
      if (!this.validateFileType(file.type)) {
        this.showMessage('请选择JPG、PNG或TIFF格式的图片', 'error');
        return;
      }

      // 验证文件大小
      if (file.size > 10 * 1024 * 1024) {
        this.showMessage('图片大小不能超过10MB', 'error');
        return;
      }

      // 设置加载状态
      this.isLoading = true;

      // 使用与点击上传相同的处理逻辑
      this.uploadFileToServer(file);
    }
  }
}
