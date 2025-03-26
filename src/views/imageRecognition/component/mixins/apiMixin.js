/**
 * API交互相关功能
 * 负责与后端API通信，处理图像识别和数据处理
 */
import axios from "axios";
import { getToken } from "@/utils/auth";

// 将API URL和其他常量提取到模块范围
const API_CONFIG = {
  BASE_URL: "http://146.56.214.208:8100/image_recognition",
  ENDPOINTS: {
    FILE_UPLOAD: "/updateAvatarUrl",
    URL_UPLOAD: "/updateAvatarUrl2"
  }
};

export default {
  methods: {
    // 新增处理示例图片的方法
    processExampleImage(item) {
      this.isLoading = true;
      this.originalImageSrc = this.image_src;

      // 将图片URL转为File对象或直接使用URL
      this.fetchImageAsBlob(item.showUrl)
        .then(blob => {
          const imageFile = new File([blob], 'example-image.jpg', { type: 'image/jpeg' });

          // 使用文件上传接口处理
          this.processWithFileUploadAPI(imageFile);
        })
        .catch(error => {
          console.error('无法获取图片:', error);

          // 失败时尝试使用URL上传接口
          this.processWithUrlUploadAPI(item.showUrl);
        });
    },

    // 使用文件上传API处理图片 - 捕获返回的URL
    processWithFileUploadAPI(file) {
      this.form_data = file;

      // 如果没有设置image_src，则设置（避免重复设置）
      if (!this.image_src || this.image_src === this.originalImageSrc) {
        this.image_src = URL.createObjectURL(file);
      }

      this.isLoading = true;

      const config = {
        ...this.getRequestConfig(),
        timeout: 30000 // 30秒超时
      };

      const formdata = new FormData();
      formdata.append("image", file);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILE_UPLOAD}`;

      axios.post(url, formdata, config)
        .then(response => {
          if (!response.data) {
            throw new Error('响应数据为空');
          }

          // 保存API返回的URL (如果存在)
          if (response.data.image_url) {
            this.apiReturnedUrl = response.data.image_url;
            // 同时保存到会话存储
            sessionStorage.setItem("apiUrl", this.apiReturnedUrl);
          }

          this.processResponse(response.data);
          this.showMessage('已使用文件上传接口处理图片', 'success');
        })
        .catch(error => this.handleRequestError(error));
    },

    // 使用URL上传API处理图片 - 优先使用API返回的URL
    processWithUrlUploadAPI(imageUrl) {
      // 优先使用API返回的URL，其次使用传入的URL
      const urlToUse = this.apiReturnedUrl || imageUrl;

      // 存储URL到会话存储中以便后续使用
      sessionStorage.setItem("url", urlToUse);

      const tiff_url = urlToUse.replace(/\/images\/(\d+)\/(\w+)\/(.+)/, '\$1\\\$2\\\$3');

      const config = {
        ...this.getRequestConfig(),
        timeout: 30000 // 30秒超时
      };

      const formdata = new FormData();
      formdata.append("image", tiff_url);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.URL_UPLOAD}`;

      this.showMessage('正在使用后端返回的URL处理图片...', 'info');

      axios.post(url, formdata, config)
        .then(response => {
          if (!response.data) {
            throw new Error('响应数据为空');
          }
          this.processResponse(response.data);
          this.showMessage('已使用URL上传接口处理图片', 'success');
        })
        .catch(error => this.handleRequestError(error));
    },

    // 获取统计数据
    getStatistic() {
      if (!this.checkImageExists()) return;

      const useTiffUrl = !this.form_data && sessionStorage.getItem("url") !== null;
      this.clickStatistic(useTiffUrl);
    },

    // 处理统计请求
    clickStatistic(transPic) {
      this.isLoading = true;
      this.originalImageSrc = this.image_src;

      // 获取公共请求配置
      const config = this.getRequestConfig();

      // 准备FormData和URL - 根据情况选择合适的API
      const { formdata, url, error } = this.prepareRequestData(transPic);

      // 检查是否有错误
      if (error) {
        this.showMessage(error, "warning");
        this.isLoading = false;
        return;
      }

      // 设置请求超时
      const requestConfig = {
        ...config,
        timeout: 30000 // 30秒超时
      };

      // 发送请求 - 明确告知用户使用了哪个接口
      axios.post(url, formdata, requestConfig)
        .then(response => {
          if (!response.data || response.status !== 200) {
            throw new Error('请求响应无效');
          }
          this.processResponse(response.data);
          if (!transPic) {
            sessionStorage.removeItem("url");
            this.showMessage("已使用文件上传接口处理图片", "success");
          } else {
            this.showMessage("已使用URL上传接口处理图片", "success");
          }
        })
        .catch(error => this.handleRequestError(error));
    },

    // 将tiff图片转换为png的base64编码
    getTiffDataUrlHandler(url) {
      this.originalImageSrc = this.image_src;

      // 设置请求超时
      const xhr = new XMLHttpRequest();
      xhr.responseType = "arraybuffer";
      xhr.open("GET", url);
      xhr.timeout = 15000; // 15秒超时

      const handleError = (message) => {
        console.error(message);
        this.showMessage("处理图片出错，请重试", "error");
        this.isLoading = false;
      };

      xhr.onload = () => {
        try {
          // 检查响应状态
          if (xhr.status !== 200) {
            handleError(`加载图片失败，状态码: ${xhr.status}`);
            return;
          }

          const tiff = new Tiff({ buffer: xhr.response });
          const canvas = tiff.toCanvas();

          this.$nextTick(() => {
            this.image_src = canvas.toDataURL();
            this.isLoading = false;
          });
        } catch (error) {
          handleError("处理TIFF图片时出错: " + error);
        }
      };

      xhr.onerror = () => handleError("加载图片失败");
      xhr.ontimeout = () => handleError("加载图片超时");
      xhr.onabort = () => handleError("加载图片被中断");

      xhr.send();
    },

    // 准备请求数据
    prepareRequestData(transPic) {
      let formdata = new FormData();
      let url = "";
      let error = null;

      if (transPic) {
        // 优先使用API返回的URL
        let tiff_url = this.apiReturnedUrl || sessionStorage.getItem("apiUrl") || sessionStorage.getItem("url");
        if (!tiff_url) {
          error = "没有找到图片数据，请重新上传";
          return { formdata, url, error };
        }

        let regex = /\/images\/(\d+)\/(\w+)\/(.+)/;
        tiff_url = tiff_url.replace(regex, '\$1\\\$2\\\$3');
        formdata.append("image", tiff_url);
        url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.URL_UPLOAD}`;
      } else {
        // 文件上传逻辑保持不变
        if (!this.form_data) {
          error = "没有找到图片数据，请重新上传";
          return { formdata, url, error };
        }
        formdata.append("image", this.form_data);
        url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILE_UPLOAD}`;
      }

      return { formdata, url, error };
    },

    // 获取请求配置
    getRequestConfig() {
      return {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: "Bearer " + getToken(),
        },
      };
    },

    // 处理请求错误
    handleRequestError(error) {
      console.error("请求出错:", error);

      // 确保停止加载状态
      this.isLoading = false;

      // 根据错误类型提供更具体的消息
      let errorMessage = "网络请求失败，已恢复原始图片";

      if (error.code === 'ECONNABORTED') {
        errorMessage = "请求超时，请检查网络连接";
      } else if (error.response) {
        // 服务器返回了错误状态码
        errorMessage = `服务器返回错误(${error.response.status})，请稍后重试`;
      } else if (error.request) {
        // 请求发送但没有收到响应
        errorMessage = "服务器无响应，请检查网络连接";
      }

      this.showMessage(errorMessage, "error");

      // 恢复原始图片
      if (this.originalImageSrc) {
        this.image_src = this.originalImageSrc;
      }
    },

    // 处理API响应
    processResponse(data) {
      if (!data || data.base64 === "预测出错：(str(e)" || data.code === 500) {
        this.showMessage("处理图片出错，请重试", "error");
        this.isLoading = false; // 确保设置加载状态为false

        // 如果有原始图片，恢复它
        if (this.originalImageSrc) {
          this.image_src = this.originalImageSrc;
        }
        return;
      }

      try {
        // 保存API返回的URL (如果存在)
        if (data.image_url) {
          this.apiReturnedUrl = data.image_url;
          sessionStorage.setItem("apiUrl", this.apiReturnedUrl);
        }

        const base64Data = data.base64.replace(/[\r\n]/g, "");
        const newImageSrc = "data:image/png;base64," + base64Data;

        // 先设置图片，再更新其他状态
        this.image_src = newImageSrc;

        this.$nextTick(() => {
          this.isShowStatistic = true;
          this.statisticData = (data.are_sum_bfb * 100).toFixed(2);
          this.updateDataFields(data);

          // 最后关闭加载状态
          this.isLoading = false;
        });
      } catch (error) {
        console.error("处理响应数据时出错:", error);
        this.showMessage("处理数据时出错，已恢复原始图片", "error");

        // 恢复原始图片
        if (this.originalImageSrc) {
          this.image_src = this.originalImageSrc;
        }

        // 确保关闭加载状态
        this.isLoading = false;
      }
    },

    // 更新数据字段
    updateDataFields(data) {
      const fields = [
        { key: 'coordinates', index: 0, format: v => v },
        { key: 'are_sum_bfb', index: 1, format: v => (v * 100).toFixed(2) + '%' },
        { key: 'circularity', index: 2, format: v => v },
        { key: 'minimumccd', index: 3, format: v => v },
        { key: 'maximumicd', index: 4, format: v => v },
        { key: 'equalAreaCircleDiam', index: 5, format: v => v },
        { key: 'mbrWidth', index: 6, format: v => v },
        { key: 'mbrHeight', index: 7, format: v => v },
        { key: 'category', index: 8, format: v => v },
      ];

      fields.forEach(field => {
        if (data[field.key] !== undefined) {
          this.dataFields[field.index].value = field.format(data[field.key]);
        }
      });
    },

    // 重置数据字段
    resetDataFields() {
      this.dataFields.forEach(field => {
        field.value = '';
      });
      this.isShowStatistic = false;
    }
  }
}
