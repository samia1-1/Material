/**
 * 图像识别 Vuex 模块
 * 管理图像识别相关的状态和操作
 */

import { getToken } from "@/utils/auth";
import Tiff from 'tiff.js';

// 常量配置
const API_BASE_URL = "http://146.56.214.208:8100/image_recognition";
const ENDPOINTS = { FILE: "/updateAvatarUrl", URL: "/updateAvatarUrl2" };
const REQUEST_TIMEOUT = 30000;
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/tiff', 'image/tif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ZOOM_FACTOR = 1.2;

// 工具函数
const createApiUrl = (endpoint) => `${API_BASE_URL}${ENDPOINTS[endpoint]}`;

const fetchWithTimeout = async (url, options = {}, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const validateFile = (file) => {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Please select a valid image file (JPG, PNG, TIFF).');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size cannot exceed ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
  }
};

const validateFileContent = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e.target?.result) return resolve(false);
      try {
        const arr = new Uint8Array(e.target.result).subarray(0, 12);
        const signatures = [
          [0xFF, 0xD8, 0xFF], // JPEG
          [0x89, 0x50, 0x4E, 0x47], // PNG
          [0x49, 0x49, 0x2A, 0x00], // TIFF LE
          [0x4D, 0x4D, 0x00, 0x2A]  // TIFF BE
        ];
        resolve(signatures.some(sig => sig.every((byte, i) => arr[i] === byte)));
      } catch {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
};

// 初始状态工厂函数
const createInitialTransform = () => ({ scale: 1, translateX: 0, translateY: 0, minScale: 0.5, maxScale: 5 });

const createDataFields = () => [
  'Current coordinates', 'Area fraction', 'Circularity', 'Minimum ccd',
  'Maximum icd', 'Equal area circle diam', 'Width of the Mbr', 'Height of the Mbr', 'Category'
].map(label => ({ label, value: '', placeholder: '点击查询后显示' }));

const state = {
  imageSrc: '',
  isLoading: false,
  isTimeoutMode: false,
  imageTransform: createInitialTransform(),
  formData: null,
  statisticData: null,
  dataFields: createDataFields(),
  categoryImages: {},
  allImages: [],
  previewCache: new Map()
};

const mutations = {
  SET_IMAGE_SRC: (state, src) => { state.imageSrc = src; },
  SET_LOADING: (state, loading) => { state.isLoading = loading; },
  SET_TIMEOUT_MODE: (state, timeout) => { state.isTimeoutMode = timeout; },
  SET_IMAGE_TRANSFORM: (state, transform) => { Object.assign(state.imageTransform, transform); },
  RESET_IMAGE_TRANSFORM: (state) => { state.imageTransform = createInitialTransform(); },
  SET_FORM_DATA: (state, data) => { state.formData = data; },
  SET_STATISTIC_DATA: (state, data) => { state.statisticData = data; },

  UPDATE_DATA_FIELDS(state, data) {
    const fieldMap = {
      coordinates: 0, are_sum_bfb: 1, circularity: 2, minimumccd: 3,
      maximumicd: 4, equalAreaCircleDiam: 5, mbrWidth: 6, mbrHeight: 7, category: 8
    };

    Object.entries(fieldMap).forEach(([key, index]) => {
      if (data[key] !== undefined) {
        const value = key === 'are_sum_bfb' ? `${(data[key] * 100).toFixed(2)}%` : data[key];
        state.dataFields[index].value = value;
      }
    });
  },

  RESET_DATA_FIELDS: (state) => { state.dataFields.forEach(field => field.value = ''); },
  SET_CATEGORY_IMAGES: (state, { categoryId, images }) => { state.categoryImages[categoryId] = images; },
  SET_ALL_IMAGES: (state, images) => { state.allImages = images; },
  SET_PREVIEW_CACHE: (state, { key, url }) => { state.previewCache.set(key, url); }
};

const actions = {
  async uploadImage({ commit, dispatch }, file) {
    validateFile(file);

    if (!(await validateFileContent(file))) {
      throw new Error('文件内容验证失败，请确保上传有效的图片文件');
    }

    const token = getToken();
    if (!token) throw new Error('认证token缺失，请重新登录');

    commit('SET_LOADING', true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetchWithTimeout(createApiUrl('FILE'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      dispatch('handleApiResponse', data);
      return data;
    } catch (error) {
      commit('SET_LOADING', false);
      if (error.name === 'AbortError' || error.message.includes('timed out')) {
        commit('SET_TIMEOUT_MODE', true);
        throw new Error('请求超时，已自动中断。图片可正常查看和操作');
      }
      throw error;
    }
  },

  handleApiResponse({ commit }, data) {
    if (data.image_url) sessionStorage.setItem("apiUrl", data.image_url);

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

  resetImage({ commit, state }) {
    if (!state.imageSrc) return { success: false, message: "没有图片需要重置" };

    if (state.imageSrc.startsWith('blob:')) URL.revokeObjectURL(state.imageSrc);

    commit('SET_IMAGE_SRC', '');
    commit('SET_FORM_DATA', null);
    commit('SET_STATISTIC_DATA', null);
    commit('RESET_IMAGE_TRANSFORM');
    commit('RESET_DATA_FIELDS');

    return { success: true, message: "图片已重置" };
  },

  zoomIn({ commit, state }) {
    const { scale, maxScale } = state.imageTransform;
    if (scale < maxScale) {
      commit('SET_IMAGE_TRANSFORM', { scale: Math.min(scale * ZOOM_FACTOR, maxScale) });
    }
  },

  zoomOut({ commit, state }) {
    const { scale, minScale } = state.imageTransform;
    if (scale > minScale) {
      commit('SET_IMAGE_TRANSFORM', { scale: Math.max(scale / ZOOM_FACTOR, minScale) });
    }
  },

  // 处理本地文件显示（不上传到服务器）
  displayLocalImage({ commit, state }, file) {
    if (state.imageSrc && state.imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(state.imageSrc);
    }
    const localUrl = URL.createObjectURL(file);
    commit('SET_IMAGE_SRC', localUrl);
    commit('RESET_IMAGE_TRANSFORM');
    return { success: true, message: '图片已加载，可进行操作' };
  },

  // 后台上传（静默）
  async uploadImageInBackground({ dispatch }, file) {
    try {
      await dispatch('uploadImage', file);
      return { success: true, message: '图片上传成功' };
    } catch (error) {
      if (error.message.includes('Failed to fetch') ||
          error.message.includes('CORS') ||
          error.message.includes('Network')) {
        return { success: false, message: '网络上传失败，但图片可正常操作', type: 'warning' };
      }
      return { success: false, message: `上传失败: ${error.message}`, type: 'warning' };
    }
  },

  // 处理示例图片加载
  async loadExampleImage({ commit, dispatch }, { item, TiffUtils }) {
    await dispatch('resetImage');
    commit('SET_LOADING', true);

    try {
      const imageUrl = typeof item.imgUrl === 'object' && item.imgUrl.__esModule ? item.imgUrl.default : item.imgUrl;
      const isTiff = item.isTiff || imageUrl.toLowerCase().endsWith('.tif') || imageUrl.toLowerCase().endsWith('.tiff');

      if (isTiff) {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const tiffDataUrl = await TiffUtils.processTiffArrayBuffer(arrayBuffer);
        commit('SET_IMAGE_SRC', tiffDataUrl);

        // 后台处理
        const processedFile = new File([arrayBuffer], item.fileName, { type: item.fileType });
        dispatch('uploadImageInBackground', processedFile);
      } else {
        commit('SET_IMAGE_SRC', imageUrl);

        // 后台处理
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const processedFile = new File([blob], item.fileName, { type: item.fileType });
        dispatch('uploadImageInBackground', processedFile);
      }

      commit('SET_LOADING', false);
      return { success: true, message: '示例图片已加载，可进行操作' };
    } catch (error) {
      commit('SET_LOADING', false);
      return { success: false, message: '示例图片加载失败' };
    }
  },

  // 处理API请求
  async handleApiRequest({ commit, dispatch }, data) {
    commit('SET_LOADING', true);

    try {
      const result = await dispatch('processImageUrl', data);
      return { success: true, message: '图像处理完成' };
    } catch (error) {
      commit('SET_LOADING', false);
      if (error.message.includes('timed out')) {
        commit('SET_TIMEOUT_MODE', true);
        return { success: false, message: '请求超时，已自动中断。图片可正常查看和操作', type: 'warning' };
      }
      return { success: false, message: error.message || '请求失败，已自动中断', type: 'error' };
    }
  },

  // 自动适配图片大小
  autoFitImage({ commit, state }, { img, container }) {
    if (!img || !container) return;
    const scale = Math.min(container.clientWidth / img.naturalWidth, container.clientHeight / img.naturalHeight, 1);
    commit('SET_IMAGE_TRANSFORM', { ...state.imageTransform, scale, translateX: 0, translateY: 0 });
  },

  // 加载所有分类图片
  loadAllCategoryImages({ commit }, { categories, getImagesByCategory }) {
    const allImages = [];
    categories.forEach(category => {
      if (category.id !== 0) {
        try {
          const images = getImagesByCategory(category.folder);
          commit('SET_CATEGORY_IMAGES', { categoryId: category.id, images });
          allImages.push(...images);
        } catch (error) {
          console.error(`无法加载分类 ${category.name} 的图片:`, error);
          commit('SET_CATEGORY_IMAGES', { categoryId: category.id, images: [] });
        }
      }
    });
    commit('SET_ALL_IMAGES', allImages);
  },

  async processImageUrl({ dispatch }, url) {
    try {
      const response = await fetchWithTimeout(createApiUrl('URL'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ url })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      dispatch('handleApiResponse', data);
      return data;
    } catch (error) {
      if (error.name === 'AbortError' || error.message.includes('timed out')) {
        throw new Error('请求超时');
      }
      throw new Error(error.message || '处理失败');
    }
  },

  setPreviewCache({ commit }, payload) {
    commit('SET_PREVIEW_CACHE', payload);
  }
};

const getters = {
  imageTransformStyle: ({ imageTransform: { scale, translateX, translateY } }) => ({
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    transformOrigin: 'center center',
    transition: 'transform 0.1s ease-out'
  }),

  hasImage: ({ imageSrc }) => !!imageSrc,
  canZoomIn: ({ imageTransform: { scale, maxScale } }) => scale < maxScale,
  canZoomOut: ({ imageTransform: { scale, minScale } }) => scale > minScale
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
