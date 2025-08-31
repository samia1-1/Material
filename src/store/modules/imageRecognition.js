/**
 * 图像识别 Vuex 模块
 * 管理图像识别相关的状态和操作
 */

import { getToken } from "@/utils/auth";

// API 配置
const API_CONFIG = {
  BASE_URL: "http://146.56.214.208:8100/image_recognition",
  ENDPOINTS: {
    FILE: "/updateAvatarUrl",
    URL: "/updateAvatarUrl2"
  },
  getUrl(endpoint) {
    return `${this.BASE_URL}${this.ENDPOINTS[endpoint]}`;
  }
};

const REQUEST_TIMEOUT = 30000; // 30 seconds

// 工具函数
const fetchWithTimeout = (url, options = {}, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal
  }).then(response => {
    clearTimeout(timeoutId);
    return response;
  }).catch(error => {
    clearTimeout(timeoutId);
    throw error;
  });
};

// 文件验证工具函数
const validateFile = (file) => {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return { isValid: false, message: 'Please select a valid image file (JPG, PNG, TIFF).' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, message: `File size cannot exceed ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }
  return { isValid: true, message: '' };
};

// 文件内容验证工具函数
const validateFileContent = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e.target?.result) return resolve(false);
      try {
        const arr = new Uint8Array(e.target.result).subarray(0, 12);
        const isJPEG = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;
        const isPNG = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;
        const isTIFF = (arr[0] === 0x49 && arr[1] === 0x49 && arr[2] === 0x2A && arr[3] === 0x00) ||
                      (arr[0] === 0x4D && arr[1] === 0x4D && arr[2] === 0x00 && arr[3] === 0x2A);
        resolve(isJPEG || isPNG || isTIFF);
      } catch {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
};

// 文件验证配置
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/tiff', 'image/tif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const state = {
  // 图像相关状态
  imageSrc: '',
  isLoading: false,
  isTimeoutMode: false,

  // 图像变换状态
  imageTransform: {
    scale: 1,
    translateX: 0,
    translateY: 0,
    minScale: 0.5,
    maxScale: 5
  },

  // 数据分析结果
  formData: null,
  statisticData: null,
  dataFields: [
    { label: 'Current coordinates', value: '', placeholder: '点击查询后显示' },
    { label: 'Area fraction', value: '', placeholder: '点击查询后显示' },
    { label: 'Circularity', value: '', placeholder: '点击查询后显示' },
    { label: 'Minimum ccd', value: '', placeholder: '点击查询后显示' },
    { label: 'Maximum icd', value: '', placeholder: '点击查询后显示' },
    { label: 'Equal area circle diam', value: '', placeholder: '点击查询后显示' },
    { label: 'Width of the Mbr', value: '', placeholder: '点击查询后显示' },
    { label: 'Height of the Mbr', value: '', placeholder: '点击查询后显示' },
    { label: 'Category', value: '', placeholder: '点击查询后显示' },
  ],

  // 示例图片相关
  categoryImages: {},
  allImages: [],
  previewCache: new Map(),

  // 上传状态
  lastUploadTime: 0,
  lastRequest: null
};

const mutations = {
  SET_IMAGE_SRC(state, src) {
    state.imageSrc = src;
  },

  SET_LOADING(state, loading) {
    state.isLoading = loading;
  },

  SET_TIMEOUT_MODE(state, timeout) {
    state.isTimeoutMode = timeout;
  },

  SET_IMAGE_TRANSFORM(state, transform) {
    state.imageTransform = { ...state.imageTransform, ...transform };
  },

  RESET_IMAGE_TRANSFORM(state) {
    state.imageTransform = {
      scale: 1,
      translateX: 0,
      translateY: 0,
      minScale: 0.5,
      maxScale: 5
    };
  },

  SET_FORM_DATA(state, data) {
    state.formData = data;
  },

  SET_STATISTIC_DATA(state, data) {
    state.statisticData = data;
  },

  UPDATE_DATA_FIELDS(state, data) {
    const fieldMap = {
      coordinates: 0, are_sum_bfb: 1, circularity: 2, minimumccd: 3,
      maximumicd: 4, equalAreaCircleDiam: 5, mbrWidth: 6, mbrHeight: 7, category: 8
    };
    Object.keys(fieldMap).forEach(key => {
      if (data[key] !== undefined) {
        let value = data[key];
        if (key === 'are_sum_bfb') value = (value * 100).toFixed(2) + '%';
        state.dataFields[fieldMap[key]].value = value;
      }
    });
  },

  SET_CATEGORY_IMAGES(state, { categoryId, images }) {
    state.categoryImages = { ...state.categoryImages, [categoryId]: images };
  },

  SET_ALL_IMAGES(state, images) {
    state.allImages = images;
  },

  SET_PREVIEW_CACHE(state, { key, url }) {
    state.previewCache.set(key, url);
  },

  SET_LAST_UPLOAD_TIME(state, time) {
    state.lastUploadTime = time;
  },

  SET_LAST_REQUEST(state, request) {
    state.lastRequest = request;
  }
};

const actions = {
  // 文件上传相关
  async uploadImage({ commit, dispatch }, file) {
    // 使用工具函数进行文件验证
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    const isContentValid = await validateFileContent(file);
    if (!isContentValid) {
      throw new Error('文件内容验证失败，请确保上传有效的图片文件');
    }

    const token = getToken();
    if (!token) {
      throw new Error('认证token缺失，请重新登录');
    }

    commit('SET_LOADING', true);
    const formData = new FormData();
    formData.append('file', file);

    const url = API_CONFIG.getUrl('FILE');

    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      await dispatch('handleApiResponse', data);
      return data;
    } catch (error) {
      console.error('Upload error in catch block:', error);
      commit('SET_LOADING', false);
      if (error.name === 'AbortError' || error.message.includes('timed out')) {
        commit('SET_TIMEOUT_MODE', true);
        throw new Error('请求超时，已自动中断。图片可正常查看和操作');
      }
      throw new Error(error.message || '上传失败');
    }
  },

  // 处理 API 响应
  async handleApiResponse({ commit }, data) {
    if (data.image_url) {
      sessionStorage.setItem("apiUrl", data.image_url);
    }

    if (data.base64) {
      const imageSrc = `data:image/png;base64,${data.base64.replace(/[\r\n]/g, "")}`;
      commit('SET_IMAGE_SRC', imageSrc);
    }

    if (data.are_sum_bfb !== undefined) {
      commit('SET_STATISTIC_DATA', (data.are_sum_bfb * 100).toFixed(2));
    }

    commit('UPDATE_DATA_FIELDS', data);
    commit('SET_LOADING', false);
  },

  // 重置图像
  resetImage({ commit, state }) {
    if (!state.imageSrc) {
      return { success: false, message: "没有图片需要重置" };
    }

    if (state.imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(state.imageSrc);
    }

    commit('SET_IMAGE_SRC', '');
    commit('SET_FORM_DATA', null);
    commit('SET_STATISTIC_DATA', null);
    commit('RESET_IMAGE_TRANSFORM');

    // 重置数据字段
    state.dataFields.forEach(field => field.value = '');

    return { success: true, message: "图片已重置" };
  },

  // 图像变换操作
  zoomIn({ commit, state }) {
    const { scale, maxScale } = state.imageTransform;
    if (scale < maxScale) {
      commit('SET_IMAGE_TRANSFORM', { scale: Math.min(scale * 1.2, maxScale) });
    }
  },

  zoomOut({ commit, state }) {
    const { scale, minScale } = state.imageTransform;
    if (scale > minScale) {
      commit('SET_IMAGE_TRANSFORM', { scale: Math.max(scale / 1.2, minScale) });
    }
  },

  // 处理 URL 请求
  async processImageUrl({ commit, dispatch }, url) {
    try {
      const response = await fetchWithTimeout(API_CONFIG.getUrl('URL'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      await dispatch('handleApiResponse', data);
      return data;
    } catch (error) {
      if (error.name === 'AbortError' || error.message.includes('timed out')) {
        throw new Error('请求超时');
      }
      throw new Error(error.message || '处理失败');
    }
  },

  // 设置预览缓存
  setPreviewCache({ commit }, { key, url }) {
    commit('SET_PREVIEW_CACHE', { key, url });
  }
};

const getters = {
  imageTransformStyle: (state) => {
    const { scale, translateX, translateY } = state.imageTransform;
    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transformOrigin: 'center center',
      transition: 'transform 0.1s ease-out'
    };
  },

  hasImage: (state) => !!state.imageSrc,

  canZoomIn: (state) => state.imageTransform.scale < state.imageTransform.maxScale,

  canZoomOut: (state) => state.imageTransform.scale > state.imageTransform.minScale
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
