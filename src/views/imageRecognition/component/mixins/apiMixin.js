/**
 * API交互相关功能
 */
import { getToken } from "@/utils/auth";

// API配置集中管理
const API = {
  BASE_URL: "http://218.199.69.65:8100/image_recognition",
  ENDPOINTS: {
    FILE: "/updateAvatarUrl",
    URL: "/updateAvatarUrl2"
  },
  // 获取完整URL
  getUrl(endpoint) {
    return `${this.BASE_URL}${this.ENDPOINTS[endpoint]}`;
  }
};

export default {
  methods: {
    // 统一API请求方法 - 精简实现
    makeApiRequest(endpoint, formData) {
      this.isLoading = true;

      const headers = getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {};

      return fetch(API.getUrl(endpoint), {
        method: 'POST',
        body: formData,
        headers
      })
      .then(response => {
        if (!response.ok) throw new Error(`服务器返回错误: ${response.status}`);
        return response.json();
      })
      .then(data => this.processApiResponse(data))
      .catch(error => {
        console.error('API请求失败:', error);
        this.showMessage(error.message || '请求失败，请重试', 'error');
        this.isLoading = false;
        return Promise.reject(error);
      });
    },

    // 处理API响应 - 优化数据提取
    processApiResponse(data) {
      // 错误处理
      if (!data || data.code === 500 || data.base64 === "预测出错：(str(e)") {
        this.showMessage("图像处理失败，请重试", "error");
        this.isLoading = false;
        return false;
      }

      try {
        // 更新常用数据
        if (data.image_url) {
          this.apiReturnedUrl = data.image_url;
          sessionStorage.setItem("apiUrl", this.apiReturnedUrl);
        }

        // 更新图片
        const base64Data = data.base64?.replace(/[\r\n]/g, "");
        if (base64Data) {
          this.image_src = `data:image/png;base64,${base64Data}`;
        }

        // 更新统计信息
        this.isShowStatistic = true;
        if (data.are_sum_bfb !== undefined) {
          this.statisticData = (data.are_sum_bfb * 100).toFixed(2);
        }

        // 更新数据字段
        this.updateDataFields?.(data);

        // 完成加载
        this.isLoading = false;
        this.showMessage("图像处理完成", "success");
        return true;
      } catch (error) {
        console.error("处理响应数据出错:", error);
        this.showMessage("处理响应数据出错", "error");
        this.isLoading = false;
        return false;
      }
    },

    // 添加缺失的文件处理和API上传连接方法
    processWithFileUploadAPI(file) {
      if (!file) {
        this.showMessage('无效的文件', 'error');
        this.isLoading = false;
        return;
      }

      // 提取元数据
      const metadata = {
        format: file.type || 'application/octet-stream',
        filename: file.name,
        isTiff: file.name.match(/\.(tif|tiff)$/i) ? "true" : "false"
      };

      // 如果是示例图片，添加额外标记
      if (sessionStorage.getItem("isExampleImage") === "true") {
        metadata.isExampleImage = "true";
        metadata.exampleCategory = sessionStorage.getItem("exampleCategory") || "0";
      }

      // 调用上传图片API
      this.isLoading = true;
      this.uploadImage(file, { metadata })
        .then(success => {
          if (success) {
            this.showMessage('图像处理完成', 'success');
          }
        })
        .catch(error => {
          console.error('图像处理失败:', error);
          this.showMessage('图像处理失败，请重试', 'error');
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    // 处理图片上传 - 简化参数处理
    uploadImage(file, options = {}) {
      if (!file) {
        this.showMessage('没有选择图片', 'error');
        return Promise.reject(new Error('没有文件'));
      }

      const formData = new FormData();
      formData.append("image", file, file.name);

      // 添加元数据
      if (options.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      return this.makeApiRequest(options.useUrlApi ? 'URL' : 'FILE', formData);
    },

    // 获取统计数据 - 统一路径
    getStatistic() {
      if (!this.checkBeforeImageOperation?.()) return;

      // 获取会话中的URL
      const tiffUrl = sessionStorage.getItem("url");

      if (tiffUrl) {
        // 使用URL API
        const formData = new FormData();
        const formattedUrl = tiffUrl.replace(/\/images\/(\d+)\/(\w+)\/(.+)/, '$1\\$2\\$3');
        formData.append("image", formattedUrl);

        this.makeApiRequest('URL', formData);
      } else if (this.form_data) {
        // 使用文件API
        this.uploadImage(this.form_data);
      } else {
        this.showMessage('请先上传图片', 'warning');
      }
    },

    // 文件上传处理 - 重构为更简洁的实现
    uploadFileToServer(file) {
      // 保存引用
      this.form_data = file;

      // 检测文件类型
      const isTiff = file.name.match(/\.(tif|tiff)$/i) ||
                    ['image/tiff', 'image/tif'].includes(file.type);

      // 创建预览
      this.createImagePreview(file, isTiff)
        .then(previewUrl => {
          this.image_src = previewUrl;

          // 设置元数据并上传
          const metadata = {
            format: file.type || 'application/octet-stream',
            filename: file.name,
            isTiff: isTiff ? "true" : "false"
          };

          return this.uploadImage(file, { metadata });
        })
        .catch(error => {
          console.error('处理图片预览失败:', error);
          this.showMessage('无法创建预览，但将继续上传', 'warning');
          return this.uploadImage(file);
        });
    },

    // 创建图片预览 - 简化逻辑
    createImagePreview(file, isTiff = false) {
      if (isTiff) {
        return this.createTiffPreview(file);
      } else {
        return this.createStandardPreview(file);
      }
    },

    // 分离TIFF和标准预览处理
    createTiffPreview(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => this.processTiffArrayBuffer?.(e.target.result)
                                .then(resolve)
                                .catch(reject);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    },

    createStandardPreview(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    // 更新数据字段 - 使用简化的映射
    updateDataFields(data) {
      const fieldMap = [
        ['coordinates', 0],
        ['are_sum_bfb', 1, v => (v * 100).toFixed(2) + '%'],
        ['circularity', 2],
        ['minimumccd', 3],
        ['maximumicd', 4],
        ['equalAreaCircleDiam', 5],
        ['mbrWidth', 6],
        ['mbrHeight', 7],
        ['category', 8]
      ];

      // 更新值
      fieldMap.forEach(([key, index, formatter]) => {
        if (data[key] !== undefined) {
          this.dataFields[index].value = formatter ? formatter(data[key]) : data[key];
        }
      });
    },

    // 检查图片是否存在
    checkImageExists() {
      return this.checkBeforeImageOperation?.() || false;
    },

    // 重置数据字段
    resetDataFields() {
      if (this.dataFields) {
        this.dataFields.forEach(field => {
          field.value = '';
        });
      }
    }
  }
}
