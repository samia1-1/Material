/**
 * API交互相关功能
 */
import { getToken } from "@/utils/auth";

// API配置集中管理
const API = {
  BASE_URL: "http://146.56.214.208:8100/image_recognition",
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
    // 统一API请求方法
    makeApiRequest(endpoint, formData) {
      this.isLoading = true;

      return fetch(API.getUrl(endpoint), {
        method: 'POST',
        body: formData,
        headers: getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status}`);
        }
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

    // 统一处理API响应
    processApiResponse(data) {
      // 处理错误响应
      if (!data || data.code === 500 || data.base64 === "预测出错：(str(e)") {
        this.showMessage("图像处理失败，请重试", "error");
        this.isLoading = false;
        return false;
      }

      try {
        // 保存API返回的URL
        if (data.image_url) {
          this.apiReturnedUrl = data.image_url;
          sessionStorage.setItem("apiUrl", this.apiReturnedUrl);
        }

        // 更新图片
        const base64Data = data.base64?.replace(/[\r\n]/g, "") || '';
        if (base64Data) {
          this.image_src = "data:image/png;base64," + base64Data;
        }

        // 显示统计数据
        this.isShowStatistic = true;

        // 处理面积比例
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

    // 处理图片上传 - 统一入口
    uploadImage(file, options = {}) {
      if (!file) {
        this.showMessage('没有选择图片', 'error');
        return Promise.reject(new Error('没有文件'));
      }

      const formData = new FormData();

      // 添加文件数据
      formData.append("image", file, file.name);

      // 添加额外参数
      if (options.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      // 选择API端点
      const endpoint = options.useUrlApi ? 'URL' : 'FILE';

      // 发送请求
      return this.makeApiRequest(endpoint, formData);
    },

    // 获取统计数据 - 简化入口
    getStatistic() {
      if (!this.checkImageExists()) return;

      // 获取会话中的URL或使用上传的文件
      const tiff_url = sessionStorage.getItem("url");

      if (tiff_url) {
        // 使用URL API
        const formData = new FormData();
        formData.append("image", tiff_url.replace(/\/images\/(\d+)\/(\w+)\/(.+)/, '$1\\$2\\$3'));
        this.makeApiRequest('URL', formData);
      } else if (this.form_data) {
        // 使用文件API
        this.uploadImage(this.form_data);
      } else {
        this.showMessage('请先上传图片', 'warning');
      }
    },

    // 简化的文件上传处理
    uploadFileToServer(file) {
      // 保存文件引用
      this.form_data = file;

      // 判断文件格式和处理方式
      const isTiff = file.name.match(/\.(tif|tiff)$/i) || ['image/tiff', 'image/tif'].includes(file.type);

      // TIFF和普通图片处理流程统一，减少代码分支
      this.createImagePreview(file, isTiff)
        .then(previewUrl => {
          this.image_src = previewUrl;

          // 构建元数据
          const metadata = {
            format: file.type || 'application/octet-stream',
            filename: file.name,
            isTiff: isTiff ? "true" : "false"
          };

          // 上传文件
          return this.uploadImage(file, { metadata });
        })
        .catch(error => {
          console.error('处理图片预览失败:', error);
          this.showMessage('无法创建预览，但将继续上传', 'warning');
          return this.uploadImage(file);
        });
    },

    // 创建图片预览 - 统一TIFF和普通图片处理
    createImagePreview(file, isTiff = false) {
      return new Promise((resolve, reject) => {
        if (isTiff) {
          // 处理TIFF预览 - 使用二进制方式读取
          const reader = new FileReader();
          reader.onload = e => {
            try {
              this.processTiffArrayBuffer(e.target.result)
                .then(resolve)
                .catch(reject);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        } else {
          // 处理普通图片预览 - 使用Data URL方式读取
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }
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
  }
}
