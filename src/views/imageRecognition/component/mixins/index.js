/**
 * 汇总所有混入
 */
import imageMixin from './imageMixin';
import apiMixin from './apiMixin';
import interactionMixin from './interactionMixin';

// 确保apiMixin优先应用，防止方法被覆盖
export {
  apiMixin,        // API调用最先应用
  imageMixin,      // 图片处理次之
  interactionMixin // 交互相关最后
};
