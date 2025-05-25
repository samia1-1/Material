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
  data() {
    return {
      requestAbortController: null,
      requestTimeout: 30000, // 30秒超时
      lastRequestData: null,
    };
  },

  methods: {
    // 创建带超时的fetch请求
    fetchWithTimeout(url, options = {}, timeout = this.requestTimeout) {
      // 创建新的AbortController
      this.requestAbortController = new AbortController();

      // 设置超时
      const timeoutId = setTimeout(() => {
        this.requestAbortController.abort();
      }, timeout);

      // 合并选项
      const fetchOptions = {
        ...options,
        signal: this.requestAbortController.signal
      };

      return fetch(url, fetchOptions)
        .then(response => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch(error => {
          clearTimeout(timeoutId);

          if (error.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接或稍后重试');
          }
          throw error;
        });
    },

    // 统一API请求方法 - 精简实现
    makeApiRequest(endpoint, formData) {
      this.isLoading = true;
      const headers = getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {};

      return this.fetchWithTimeout(API.getUrl(endpoint), {
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

        // 自动处理超时和其他错误
        this.handleRequestFailure(error);

        return Promise.reject(error);
      });
    },

    // 处理请求失败（包括超时）
    handleRequestFailure(error) {
      this.isLoading = false;

      // 启用图片交互功能
      this.enableImageInteraction();

      if (error.message.includes('请求超时')) {
        // 设置超时模式但不弹出确认框
        if (this.setTimeoutMode) {
          this.setTimeoutMode(true);
        } else {
          this.isTimeoutMode = true;
        }
        this.showMessage('请求超时，已自动中断。图片可正常查看和操作', 'warning');
      } else {
        this.showMessage(error.message || '请求失败，已自动中断', 'error');
      }
    },

    // 简化启用图片交互功能
    enableImageInteraction() {
      // 确保图片变换状态存在
      if (!this.imageTransform) {
        this.imageTransform = {
          scale: 1,
          translateX: 0,
          translateY: 0,
          minScale: 0.5,
          maxScale: 5
        };
      }

      // 重置拖拽状态
      if (!this.dragState) {
        this.dragState = {
          isDragging: false,
          wasDragged: false,
          startX: 0,
          startY: 0,
          lastTranslateX: 0,
          lastTranslateY: 0,
          distance: 0,
          threshold: 10,
          dragStartTime: 0,
          dragEndTime: 0
        };
      }

      // 强制更新视图
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },

    // 重试请求（用于手动重试按钮）
    retryLastRequest() {
      if (this.setTimeoutMode) {
        this.setTimeoutMode(false);
      } else {
        this.isTimeoutMode = false;
      }

      if (this.lastRequestData) {
        const { endpoint, formData } = this.lastRequestData;
        this.makeApiRequest(endpoint, formData);
      } else if (this.form_data) {
        this.uploadImage(this.form_data);
      } else {
        this.showMessage('无法重试，请重新上传图片', 'warning');
      }
    },

    // 保存请求数据以便重试
    saveRequestForRetry(endpoint, formData) {
      this.lastRequestData = { endpoint, formData };
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

      const endpoint = options.useUrlApi ? 'URL' : 'FILE';
      // 保存请求数据以便重试
      this.saveRequestForRetry(endpoint, formData);

      return this.makeApiRequest(endpoint, formData);
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

        this.saveRequestForRetry('URL', formData);
        this.makeApiRequest('URL', formData);
      } else if (this.form_data) {
        // 使用文件API
        this.uploadImage(this.form_data);
      } else {
        this.showMessage('请先上传图片', 'warning');
      }
    },

    // 简化数据字段更新
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
      this.dataFields?.forEach(field => field.value = '');
    }
  },

  beforeDestroy() {
    // 清理请求控制器
    if (this.requestAbortController) {
      this.requestAbortController.abort();
      this.requestAbortController = null;
    }
  }
}
