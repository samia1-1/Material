<template>
  <div class="image-recognition">
    <!-- 背景动态元素 -->
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
          <div class="decoration-dot"></div>
        </div>
      </div>
    </div>

    <!-- 内容容器 -->
    <div class="content-container">
      <ImageContent />
    </div>
  </div>
</template>

<script>
import SmallNav from '../../components/smallNav/smallNav.vue'
import ImageContent from './component/imageContent.vue'

export default {
  name: 'ImageRecognition',
  components: { ImageContent, SmallNav },
  data: () => ({ particleCount: 20 }),
  methods: {
    randomParticleStyle() {
      const size = Math.random() * 6 + 2;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = Math.random() * 20 + 30;
      const delay = Math.random() * 15;
      const opacity = Math.random() * 0.5 + 0.1;

      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity
      };
    }
  }
}
</script>

<style lang="scss" scoped>
// 动画定义
@keyframes beam-move {
  0% { opacity: 0; transform: translateX(-100px) rotate(45deg); }
  20%, 80% { opacity: 0.3; }
  100% { opacity: 0; transform: translateX(calc(100vw + 200px)) rotate(45deg); }
}

@keyframes float-up {
  0% { transform: translateY(100vh) scale(1); opacity: 0.5; }
  70% { opacity: 0.3; }
  100% { transform: translateY(-100px) scale(0); opacity: 0; }
}

@keyframes icon-pulse {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

@keyframes text-glow {
  0%, 100% { text-shadow: 0 0 5px rgba(58, 123, 189, 0.3), 0 0 10px rgba(14, 58, 109, 0.2); }
  50% { text-shadow: 0 0 15px rgba(58, 123, 189, 0.5), 0 0 25px rgba(14, 58, 109, 0.4); }
}

@keyframes light-flow {
  from { left: -100%; }
  to { left: 100%; }
}

@keyframes line-pulse {
  0%, 100% { opacity: 0.3; height: 50%; top: 25%; }
  50% { opacity: 1; height: 100%; top: 0; }
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 5px #56a9ff; }
  50% { transform: scale(1.5); box-shadow: 0 0 15px #56a9ff, 0 0 25px rgba(58, 123, 189, 0.5); }
}

@keyframes subtitle-fade {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}

@keyframes text-flow {
  0%, 100% { opacity: 0; filter: blur(4px); }
  50% { opacity: 1; filter: blur(1px); }
}

// 基础样式
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

  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #000000;
    z-index: 9;
    will-change: transform;
  }
}

// 背景效果
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

.once-animation {
  animation-iteration-count: 1 !important;
  animation-fill-mode: forwards !important;
}

.light-beam {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(58, 123, 189, 0.05), transparent);
  width: 150px;
  height: 100%;
  transform: rotate(45deg);
  filter: blur(15px);
  opacity: 0;
  animation: beam-move 12s;

  &.beam-1 { left: -100px; top: 0; animation-delay: 0s; }
  &.beam-2 { left: 50%; top: -100px; animation-delay: 3s; }
  &.beam-3 { right: -100px; top: 30%; animation-delay: 5s; }
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .particle {
    position: absolute;
    background-color: rgba(58, 123, 189, 0.3);
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(58, 123, 189, 0.5);
    animation: float-up 60s linear;
    z-index: 1;
  }
}

// 导航
.nav-container {
  width: 100%;
  background-color: #000000;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
  z-index: 10;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;

  ::v-deep .el-menu {
    background-color: #000000 !important;
    border-bottom: 1px solid #101010 !important;
  }

  ::v-deep .el-menu-item {
    color: #d0e0f0 !important;
    background-color: #000000 !important;
    height: 50px;
    line-height: 50px;

    &:hover, &:focus {
      background-color: #080808 !important;
      color: #ffffff !important;
    }

    &.is-active {
      color: #3a7cbd !important;
      border-bottom-color: #3a7cbd !important;
      font-weight: 500;
    }
  }

  ::v-deep .datasearch-nav {
    width: 100% !important;
    background-color: #000000 !important;
    color: #d0e0f0 !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.7) !important;
  }
}

// 页眉
.page-header {
  margin-top: 60px;
  background: #000000;
  margin-bottom: 15px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
  position: relative;
  overflow: hidden;
  z-index: 5;
}

.header-container {
  display: flex;
  align-items: center;
  padding: 18px 25px;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

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

  .icon-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(58, 123, 189, 0.8) 0%, rgba(14, 58, 109, 0) 70%);
    opacity: 0;
    animation: icon-pulse 3s infinite;
  }

  i {
    font-size: 30px;
    color: #ffffff;
    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
    position: relative;
    z-index: 2;
  }
}

.title-content {
  flex: 1;
  padding-left: 5px;
  position: relative;

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

    &.glow-text {
      animation: text-glow 3s infinite alternate;
      position: relative;

      &::after {
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
    }
  }

  .title-divider {
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #56a9ff, #3a7cbd);
    margin: 8px 0;
    position: relative;
    overflow: hidden;

    .flowing-light {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%);
      animation: light-flow 3s infinite;
    }
  }

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
}

.title-decoration {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
  height: 60px;

  .decoration-line {
    width: 2px;
    height: 40px;
    background: linear-gradient(to bottom, transparent, #3a7cbd, transparent);
    margin-bottom: 5px;
    position: relative;

    .line-pulse {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, transparent, rgba(86, 169, 255, 0.8), transparent);
      animation: line-pulse 2s infinite;
    }
  }

  .decoration-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #56a9ff;
    box-shadow: 0 0 5px #56a9ff;
    animation: dot-pulse 2s infinite;
  }
}

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

::v-deep body, ::v-deep html {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: #000000;
}
</style>
