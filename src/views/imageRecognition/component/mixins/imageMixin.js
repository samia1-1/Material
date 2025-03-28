/**
 * 图片处理相关功能
 * 负责图片上传、处理和重置等基本操作
 */
import Tiff from "tiff.js";

export default {
  methods: {
    // 上传图片
    imgUpload() {
      // 确保文件输入框元素存在并且可用
      const fileInput = document.getElementById("select_files");
      if (fileInput) {
        // 清除之前的选择，确保change事件总是触发
        fileInput.value = '';
        fileInput.click();
      } else {
        this.showMessage("文件上传组件不可用", "error");
      }
    },

    // 新增：重置图片函数
    resetImage() {
      if (!this.image_src) {
        this.showMessage("没有图片需要重置", "info");
        return;
      }

      // 释放之前的Blob URL
      if (this.image_src && this.image_src.startsWith('blob:')) {
        URL.revokeObjectURL(this.image_src);
      }

      // 清除图片和相关状态
      this.image_src = "";
      this.form_data = undefined;
      this.isShowStatistic = false;
      this.statisticData = null;
      this.resetDataFields();
      this.resetImageTransform();

      // 清除会话存储
      sessionStorage.removeItem("url");
      // 清除API返回的URL
      this.apiReturnedUrl = "";
      sessionStorage.removeItem("apiUrl");

      this.showMessage("图片已重置", "success");
    },

    // 切换示例图片 - 直接处理，无需确认
    getImgChange(item) {
      // 切换显示
      item.showUrl = item.showUrl === item.imgUrl ? item.img_edUrl : item.imgUrl;

      // 直接处理图片，不再询问确认
      this.showMessage("正在处理图片...", "info");
      this.processExampleImage(item);
    },

    // 处理中心图片区域点击事件 - 移除确认对话框，直接上传
    handleCenterPicClick(event) {
      // 加载状态下不允许操作
      if (this.isLoading) {
        return;
      }

      // 如果标记为拖动，或距离上次拖动结束时间很短，则不触发上传
      const timeSinceDragEnd = Date.now() - this.dragState.dragEndTime;
      if (this.dragState.wasDragged || timeSinceDragEnd < 300) {
        return;
      }

      // 直接触发文件上传，不管是否有图片
      this.imgUpload();
    },

    // 优化显示选中的图片方法，提供API处理选项
    showSelectedImage() {
      const fileInput = document.getElementById("select_files");
      const file = fileInput.files[0];

      if (!file) {
        this.showMessage("请正确上传数据", "warning");
        return;
      }

      this.isLoading = true; // 立即显示加载状态
      this.originalImageSrc = this.image_src;
      sessionStorage.removeItem("url");
      this.image_src = URL.createObjectURL(file);
      this.form_data = file;
      this.resetDataFields();
      this.resetImageTransform();

      // 自动处理上传的图片，不再询问
      this.processWithFileUploadAPI(file);
    },

    // 从URL获取图片为Blob对象
    fetchImageAsBlob(url) {
      return new Promise((resolve, reject) => {
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error('网络响应异常');
            }
            return response.blob();
          })
          .then(blob => resolve(blob))
          .catch(error => reject(error));
      });
    },

    // 检查图片是否已上传
    checkImageExists() {
      if (this.form_data) return true;
      if (sessionStorage.getItem("url")) return true;

      this.showMessage("请先上传图片", "warning");
      return false;
    },

    // 图像操作按钮的前置检查
    checkBeforeImageOperation() {
      if (!this.image_src) {
        this.showMessage("请先上传图片", "warning");
        return false;
      }
      return true;
    },

    // 准备表单数据
    prepareFormData(file) {
      this.form_data = new FormData();
      this.form_data.append('image', file);
    },

    // 添加处理上传文件的方法，避免重复逻辑
    processUploadedFile(file) {
      // 根据文件类型进行不同处理
      if (file.type === 'image/tiff') {
        // 处理TIFF文件
        const reader = new FileReader();
        reader.onload = (e) => {
          this.getTiffDataUrlHandler(e.target.result);

          // TIFF处理完成后直接进行分析
          setTimeout(() => {
            if (this.image_src) {
              // 准备表单数据用于API调用
              this.prepareFormData(file);
              this.clickStatistic(false);
            }
          }, 500);
        };

        reader.onerror = () => {
          this.handleTiffError('读取文件时发生错误');
        };

        reader.readAsArrayBuffer(file);
      } else {
        // 处理JPG/PNG文件
        const reader = new FileReader();
        reader.onload = (e) => {
          // 保存原始图片URL，以便在API处理成功后可以用新图替换
          this.originalImageSrc = this.image_src;

          // 设置新上传的图片
          this.image_src = e.target.result;

          // 只重置图片变换参数，不重置图片本身
          this.resetImageTransform();

          // 准备表单数据用于API调用
          this.prepareFormData(file);

          this.isLoading = false;

          // 直接对图片进行处理，无需确认对话框
          this.clickStatistic(false);
        };
        reader.readAsDataURL(file);
      }

      // 清空文件输入，以便用户可以上传相同的文件
      document.getElementById('select_files').value = '';
    },

    // 添加或修复 getTiffDataUrlHandler 方法
    getTiffDataUrlHandler(tiffData) {
      try {
        this.isLoading = true;

        // 如果传入的是URL字符串，需要先获取二进制数据
        if (typeof tiffData === 'string' && tiffData.startsWith('http')) {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', tiffData, true);
          xhr.responseType = 'arraybuffer';

          xhr.onload = () => {
            if (xhr.status === 200) {
              this.processTiffArrayBuffer(xhr.response);
            } else {
              this.handleTiffError(`Failed to load TIFF: ${xhr.statusText}`);
            }
          };

          xhr.onerror = () => {
            this.handleTiffError('Network error occurred when trying to load TIFF file');
          };

          xhr.send();
        } else {
          // 如果已经是ArrayBuffer，直接处理
          this.processTiffArrayBuffer(tiffData);
        }
      } catch (error) {
        this.handleTiffError(`Error processing TIFF: ${error.message}`);
      }
    },

    // 处理TIFF ArrayBuffer数据
    processTiffArrayBuffer(arrayBuffer) {
      try {
        // 使用Tiff.js解析TIFF数据
        const tiff = new Tiff({ buffer: arrayBuffer });

        // 获取TIFF图像的宽度和高度
        const width = tiff.width();
        const height = tiff.height();

        // 创建Canvas元素并设置尺寸
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // 将TIFF渲染到Canvas
        tiff.render(canvas);

        // 将Canvas转换为base64数据URL
        const dataUrl = canvas.toDataURL('image/png');

        // 更新图像源
        this.image_src = dataUrl;
        this.originalImageSrc = dataUrl;

        // 重置图像变换
        this.resetImage();

        // 完成加载
        this.isLoading = false;

        // 释放Tiff对象资源
        tiff.close();

        console.log('TIFF successfully converted to PNG');
        return dataUrl;
      } catch (error) {
        this.handleTiffError(`Failed to process TIFF data: ${error.message}`);
        return null;
      }
    },

    // 处理TIFF错误
    handleTiffError(message) {
      console.error(message);
      this.showMessage('TIFF处理失败：' + message, 'error');
      this.isLoading = false;
    }
  }
}
