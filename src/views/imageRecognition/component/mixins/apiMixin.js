/**
 * API交互相关功能
 * 负责与后端API通信，处理图像识别和数据处理
 */
import { getToken } from "@/utils/auth";

// API配置
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
          this.processWithFileUploadAPI(imageFile);
        })
        .catch(error => {
          console.error('无法获取图片:', error);
          this.processWithUrlUploadAPI(item.showUrl);
        });
    },

    // 使用文件上传API处理图片 - 使用fetch
    processWithFileUploadAPI(file) {
      // 保存文件引用
      this.form_data = file;

      // 创建FormData
      const formData = new FormData();
      formData.append("image", file, file.name);

      // 设置加载状态
      this.isLoading = true;

      // 使用fetch发送请求
      fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILE_UPLOAD}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': getToken() ? `Bearer ${getToken()}` : ''
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        // 保存API返回的URL
        if (data && data.image_url) {
          this.apiReturnedUrl = data.image_url;
          sessionStorage.setItem("apiUrl", this.apiReturnedUrl);
        }
        this.handleUploadSuccess(data);
      })
      .catch(error => {
        console.error('请求失败:', error);
        this.showMessage('图片上传失败: ' + (error.message || '未知错误'), 'error');
        this.isLoading = false;
      });
    },

    // 使用URL上传API处理图片 - 使用fetch
    processWithUrlUploadAPI(imageUrl) {
      // 优先使用API返回的URL，其次使用传入的URL
      const urlToUse = this.apiReturnedUrl || imageUrl;

      // 存储URL到会话存储中以便后续使用
      sessionStorage.setItem("url", urlToUse);

      const tiff_url = urlToUse.replace(/\/images\/(\d+)\/(\w+)\/(.+)/, '\$1\\\$2\\\$3');

      const formData = new FormData();
      formData.append("image", tiff_url);

      this.showMessage('正在使用后端返回的URL处理图片...', 'info');

      // 使用fetch发送请求
      fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.URL_UPLOAD}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': getToken() ? `Bearer ${getToken()}` : ''
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        this.processResponse(data);
        this.showMessage('已使用URL上传接口处理图片', 'success');
      })
      .catch(error => {
        this.handleRequestError(error);
      });
    },

    // 获取统计数据
    getStatistic() {
      if (!this.checkImageExists()) return;

      const useTiffUrl = !this.form_data && sessionStorage.getItem("url") !== null;
      this.clickStatistic(useTiffUrl);
    },

    // 处理统计请求
    clickStatistic(transPic) {
      this.isShowStatistic = false;
      this.isLoading = true;

      if (transPic === true) {
        // 处理会话存储中的URL
        let formData = new FormData();
        let tiff_url = sessionStorage.getItem("url");
        if (tiff_url) {
          // 处理URL格式
          let regex = /\/images\/(\d+)\/(\w+)\/(.+)/;
          if (regex.test(tiff_url)) {
            tiff_url = tiff_url.replace(regex, '$1\\$2\\$3');
          }
          formData.append("image", tiff_url);

          // 调用URL上传接口
          this.uploadImageByUrl(formData);
        } else {
          this.isLoading = false;
          this.$message.error('会话存储中没有有效的图片URL');
        }
      } else {
        // 处理直接上传的文件
        if (!this.form_data) {
          this.isLoading = false;
          this.$message.error('没有选择图片');
          return;
        }

        // 调用文件上传接口
        this.uploadImageByFile(this.form_data);
      }
    },

    // 添加URL上传处理方法 - 使用fetch
    uploadImageByUrl(formData) {
      fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.URL_UPLOAD}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': getToken() ? `Bearer ${getToken()}` : ''
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        this.handleApiResponse(data);
      })
      .catch(error => {
        this.handleApiError(error);
      });
    },

    // 添加文件上传处理方法 - 使用fetch
    uploadImageByFile(file) {
      const formData = new FormData();
      formData.append("image", file, file.name);

      fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILE_UPLOAD}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': getToken() ? `Bearer ${getToken()}` : ''
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        this.handleApiResponse(data);
        // 清除会话存储中的URL
        sessionStorage.removeItem("url");
      })
      .catch(error => {
        this.handleApiError(error);
      });
    },

    // 添加API响应处理方法
    handleApiResponse(data) {
      if (!data || data.code !== 200 || data.base64 === "预测出错：(str(e)") {
        this.$message.error('预测出错，请上传重试');
        this.isLoading = false;
        return;
      }

      // 更新图像和统计数据
      this.isLoading = false;
      this.image_src = "data:image/png;base64," + data.base64;
      // 移除可能的换行符
      this.image_src = this.image_src.replace(/[\r\n]/g, "");
      this.isShowStatistic = true;

      // 计算并显示统计数据
      if (data.are_sum_bfb !== undefined) {
        this.statisticData = (data.are_sum_bfb * 100).toFixed(2);
      }

      // 处理图表数据（如果实现了相关函数）
      if (typeof this.processChartData === 'function') {
        this.processChartData(data);
      }
    },

    // 添加API错误处理方法
    handleApiError(error) {
      console.error('API请求失败:', error);
      this.$message.error('出现未知错误，请刷新后重试');
      this.isLoading = false;
    },

    // 上传文件到服务器 - 统一使用fetch
    uploadFileToServer(file) {
      // 验证文件对象
      if (!(file instanceof File)) {
        this.showMessage('上传的不是有效的文件对象', 'error');
        this.isLoading = false;
        return;
      }

      // 保存文件引用
      this.form_data = file;

      // 显示文件预览
      const reader = new FileReader();
      reader.onload = (e) => {
        // 设置预览图片
        this.image_src = e.target.result;

        // 创建FormData
        const formData = new FormData();
        formData.append("image", file, file.name);

        // 设置加载状态
        this.isLoading = true;

        // 使用fetch发送请求
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILE_UPLOAD}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': getToken() ? `Bearer ${getToken()}` : ''
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          if (data && data.image_url) {
            this.apiReturnedUrl = data.image_url;
            sessionStorage.setItem("apiUrl", this.apiReturnedUrl);
          }
          this.handleUploadSuccess(data);
        })
        .catch(error => {
          console.error('上传失败:', error);
          this.showMessage('上传失败: ' + (error.message || '未知错误'), 'error');
          this.isLoading = false;
        });
      };

      reader.onerror = () => {
        this.showMessage('读取文件失败', 'error');
        this.isLoading = false;
      };

      // 开始读取文件
      reader.readAsDataURL(file);
    },

    // 处理上传成功
    handleUploadSuccess(data) {
      if (!data || data.code === 500 || data.base64 === "预测出错：(str(e)") {
        this.showMessage("图像处理失败，请重试", "error");
        this.isLoading = false;
        return;
      }

      try {
        // 更新图片显示
        const base64Data = data.base64.replace(/[\r\n]/g, "");
        this.image_src = "data:image/png;base64," + base64Data;

        // 显示统计数据
        this.isShowStatistic = true;

        if (data.are_sum_bfb !== undefined) {
          this.statisticData = (data.are_sum_bfb * 100).toFixed(2);
        }

        // 更新数据字段
        this.updateDataFields(data);

        // 关闭加载状态
        this.isLoading = false;

        // 显示成功消息
        this.showMessage("图像处理完成", "success");
      } catch (error) {
        console.error('处理响应出错:', error);
        this.showMessage("处理响应数据出错", "error");
        this.isLoading = false;
      }
    },

    // 处理请求错误
    handleRequestError(error) {
      console.error("请求出错:", error);
      this.isLoading = false;

      // 根据错误类型提供更具体的消息
      let errorMessage = "网络请求失败，图片已保留";
      this.showMessage(errorMessage, "error");
    },

    // 处理API响应
    processResponse(data) {
      if (!data || data.base64 === "预测出错：(str(e)" || data.code === 500) {
        this.showMessage("处理图片出错，请重试", "error");
        this.isLoading = false; // 确保设置加载状态为false
        return;
      }

      try {
        // 保存API返回的URL (如果存在)
        if (data.image_url) {
          this.apiReturnedUrl = data.image_url;
          sessionStorage.setItem("apiUrl", this.apiReturnedUrl);
        }

        // 获取base64编码的图像数据
        const base64Data = data.base64.replace(/[\r\n]/g, "");
        const newImageSrc = "data:image/png;base64," + base64Data;

        // 更新图片
        this.image_src = newImageSrc;

        this.$nextTick(() => {
          // 显示统计数据
          this.isShowStatistic = true;

          if (data.are_sum_bfb !== undefined) {
            this.statisticData = (data.are_sum_bfb * 100).toFixed(2);
          }

          // 更新数据字段
          this.updateDataFields(data);

          // 关闭加载状态
          this.isLoading = false;

          // 提示用户处理完成
          this.showMessage("图片处理完成", "success");
        });
      } catch (error) {
        console.error("处理响应数据时出错:", error);
        this.showMessage("处理数据时出错，图片已保留", "error");
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
