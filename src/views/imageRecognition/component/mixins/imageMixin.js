/**
 * 图片处理相关功能
 * 负责图片上传、处理和重置等基本操作
 */
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
    }
  }
}
