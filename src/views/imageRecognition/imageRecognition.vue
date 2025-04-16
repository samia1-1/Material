<template>
  <div class="image-recognition">
    <!-- 背景动态元素 - 修改为只执行一次 -->
    <div class="dynamic-background">
      <div class="light-beam beam-1 once-animation"></div>
      <div class="light-beam beam-2 once-animation"></div>
      <div class="light-beam beam-3 once-animation"></div>
      <div class="floating-particles">
        <span v-for="i in 20" :key="i" class="particle once-animation" :style="randomParticleStyle()"></span>
      </div>
    </div>

    <!-- 导航栏 -->
    <div class="nav-container">
      <small-nav></small-nav>
    </div>

    <!-- 优化标题区域结构，保留标题流光效果 -->
    <div class="page-header">
      <div class="header-container">
        <!-- 左侧标题图标，保留脉冲效果 -->
        <div class="title-icon">
          <div class="icon-pulse"></div>
          <i class="el-icon-picture-outline"></i>
        </div>

        <!-- 中间标题内容，保留流光效果 -->
        <div class="title-content">
          <h1 class="image-tit glow-text">分割一切微观组织模型</h1>
          <div class="title-divider">
            <div class="flowing-light"></div>
          </div>
          <p class="title-subtitle">Segmentation of All Microscopic Tissue Models</p>
        </div>

        <!-- 右侧装饰元素，保留动态效果 -->
        <div class="title-decoration">
          <div class="decoration-line">
            <div class="line-pulse"></div>
          </div>
          <div class="decoration-dot pulse-dot"></div>
        </div>
      </div>
    </div>

    <!-- 内容容器 -->
    <div class="content-container">
      <image-content></image-content>
    </div>
  </div>
</template>

<script>
import SmallNav from '../../components/smallNav/smallNav.vue'
import ImageContent from './component/imageContent.vue'

export default {
  name: 'ImageRecognition',
  components: { ImageContent, SmallNav },

  data() {
    return {
      // 用于随机生成粒子的数据
      particleCount: 20
    }
  },

  methods: {
    // 生成随机粒子样式
    randomParticleStyle() {
      const size = Math.floor(Math.random() * 6) + 2; // 2-8px
      const left = Math.floor(Math.random() * 100);
      const top = Math.floor(Math.random() * 100);
      const animationDuration = Math.floor(Math.random() * 20) + 30; // 30-50秒
      const delay = Math.floor(Math.random() * 15); // 0-15秒延迟
      const opacity = Math.random() * 0.5 + 0.1; // 0.1-0.6不透明度

      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        animationDuration: `${animationDuration}s`,
        animationDelay: `${delay}s`,
        opacity: opacity
      };
    }
  }
}
</script>

<style scoped>
.image-recognition {
  width: 100%;
  min-height: 100vh;
  background-color: #000000;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
  color: #d0e0f0;
}

/* 动态背景层 */
.dynamic-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}

/* 只执行一次的动画类 */
.once-animation {
  animation-iteration-count: 1 !important;
  animation-fill-mode: forwards !important;
}

/* 光束效果 - 修改为只执行一次 */
.light-beam {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(58, 123, 189, 0.05), transparent);
  width: 150px;
  height: 100%;
  transform: rotate(45deg);
  filter: blur(15px);
  opacity: 0;
  animation: beam-move 12s;
}

.beam-1 {
  left: -100px;
  top: 0;
  animation-delay: 0s;
}

.beam-2 {
  left: 50%;
  top: -100px;
  animation-delay: 3s;
}

.beam-3 {
  right: -100px;
  top: 30%;
  animation-delay: 5s;
}

@keyframes beam-move {
  0% {
    opacity: 0;
    transform: translateX(-100px) rotate(45deg);
  }
  20% {
    opacity: 0.3;
  }
  80% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: translateX(calc(100vw + 200px)) rotate(45deg);
  }
}

/* 浮动粒子效果 - 修改为只执行一次 */
.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background-color: rgba(58, 123, 189, 0.3);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(58, 123, 189, 0.5);
  animation: float-up 60s linear;
  z-index: 1;
}

@keyframes float-up {
  0% {
    transform: translateY(100vh) scale(1);
    opacity: 0.5;
  }
  70% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
}

/* 背景层和导航容器样式优化 */
.image-recognition::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #000000;
  z-index: 9;
  will-change: transform; /* 性能优化 */
}

.nav-container {
  width: 100%;
  background-color: #000000;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
  z-index: 10;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
}

/* 导航菜单覆盖样式优化 */
.nav-container >>> .el-menu {
  background-color: #000000 !important;
  border-bottom: 1px solid #101010 !important;
}

.nav-container >>> .el-menu-item {
  color: #d0e0f0 !important;
  background-color: #000000 !important;
  height: 50px;
  line-height: 50px;
}

.nav-container >>> .el-menu-item:hover,
.nav-container >>> .el-menu-item:focus {
  background-color: #080808 !important;
  color: #ffffff !important;
}

.nav-container >>> .el-menu-item.is-active {
  color: #3a7cbd !important;
  border-bottom-color: #3a7cbd !important;
  font-weight: 500;
}

/* smallNav组件覆盖样式 */
.nav-container >>> .datasearch-nav {
  width: 100% !important;
  background-color: #000000 !important;
  color: #d0e0f0 !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.7) !important;
}

/* 页眉样式优化 */
.page-header {
  margin-top: 60px;
  background: #000000;
  margin-bottom: 15px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
  position: relative;
  overflow: hidden;
  z-index: 5;
}

/* 标题容器样式优化 */
.header-container {
  display: flex;
  align-items: center;
  padding: 18px 25px;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* 标题图标区域优化，保留脉冲效果 */
.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;
  background: linear-gradient(135deg, #1e5792, #0e3a6d);
  border-radius: 4px;
  margin-right: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
  overflow: hidden;
}

.title-icon .icon-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(58, 123, 189, 0.8) 0%, rgba(14, 58, 109, 0) 70%);
  opacity: 0;
  animation: icon-pulse 3s infinite;
}

@keyframes icon-pulse {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.title-icon i {
  font-size: 30px;
  color: #ffffff;
  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 2;
}

/* 标题内容区域优化，添加发光效果 */
.title-content {
  flex: 1;
  padding-left: 5px;
  position: relative;
}

.image-tit {
  font-size: 28px;
  margin: 0;
  padding: 0;
  font-weight: 600;
  color: #f0f8ff;
  letter-spacing: 1px;
  font-family: 'Microsoft YaHei', 'SimHei', serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
}

/* 标题发光动画效果 - 保留 */
.glow-text {
  animation: text-glow 3s infinite alternate;
  position: relative;
}

.glow-text::after {
  content: "分割一切微观组织模型";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #f0f8ff;
  text-shadow: 0 0 10px rgba(58, 123, 189, 0.8), 0 0 20px rgba(58, 123, 189, 0.4);
  opacity: 0;
  animation: text-flow 8s infinite;
}

@keyframes text-glow {
  0%, 100% { text-shadow: 0 0 5px rgba(58, 123, 189, 0.3), 0 0 10px rgba(14, 58, 109, 0.2); }
  50% { text-shadow: 0 0 15px rgba(58, 123, 189, 0.5), 0 0 25px rgba(14, 58, 109, 0.4); }
}

@keyframes text-flow {
  0%, 100% { opacity: 0; filter: blur(4px); }
  50% { opacity: 1; filter: blur(1px); }
}

/* 优化的分隔线，保留流动光效 */
.title-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #5a9bd5, #3a7cbd);
  margin: 8px 0;
  position: relative;
  overflow: hidden;
}

.title-divider .flowing-light {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.8) 50%,
    rgba(255,255,255,0) 100%);
  animation: light-flow 3s infinite;
}

@keyframes light-flow {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 副标题优化 - 保留动画 */
.title-subtitle {
  font-size: 16px;
  color: #a0c0e0;
  margin: 6px 0 0 0;
  font-weight: normal;
  letter-spacing: 0.5px;
  font-family: 'Times New Roman', serif;
  font-style: italic;
  animation: subtitle-fade 5s infinite alternate;
}

@keyframes subtitle-fade {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* 右侧装饰元素优化，保留脉冲动画 */
.title-decoration {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
  height: 60px;
}

.decoration-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #3a7cbd, transparent);
  margin-bottom: 5px;
  position: relative;
}

.line-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(90, 155, 213, 0.8), transparent);
  animation: line-pulse 2s infinite;
}

@keyframes line-pulse {
  0%, 100% { opacity: 0.3; height: 50%; top: 25%; }
  50% { opacity: 1; height: 100%; top: 0; }
}

.decoration-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #5a9bd5;
  box-shadow: 0 0 5px #5a9bd5;
}

.pulse-dot {
  animation: dot-pulse 2s infinite;
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 5px #5a9bd5; }
  50% { transform: scale(1.5); box-shadow: 0 0 15px #5a9bd5, 0 0 25px rgba(58, 123, 189, 0.5); }
}

/* 内容容器优化 */
.content-container {
  width: 98%;
  margin: 0 15px 15px 20px;
  background-color: #050505;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  z-index: 5;
}

/* 全局样式优化 */
:deep(body),
:deep(html) {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: #000000;
}
</style>
