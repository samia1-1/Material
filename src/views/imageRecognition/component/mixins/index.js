/**
 * 汇总所有混入
 */
import imageMixin from './imageMixin';
import apiMixin from './apiMixin';
import interactionMixin from './interactionMixin';
import echartsRendering from './echarts';

// 修改导出顺序，确保更具体的mixin先被应用，避免方法被覆盖
export {
  apiMixin,       // API调用应该最先应用
  imageMixin,     // 图片处理次之
  interactionMixin, // 交互相关最后
  echartsRendering
};
