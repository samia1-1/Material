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
      <small-nav />
    </div>

    <page-header />

    <!-- 内容容器 -->
    <div class="content-container">
      <ImageContent />
    </div>
  </div>
</template>

<script>
import SmallNav from '../../components/smallNav/smallNav.vue'
import ImageContent from './component/imageContent.vue'
import PageHeader from './component/PageHeader.vue'

export default {
  name: 'ImageRecognition',
  components: {
    ImageContent,
    SmallNav,
    PageHeader
  },
  data: () => ({
    particleCount: 20
  }),
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
        opacity: opacity
      };
    }
  }
}
</script>

<style lang="scss" scoped>
.image-recognition {
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #0c1445 0%, #1a2754 25%, #2a4978 50%, #0f1b3c 75%, #050a1a 100%);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 20%, rgba(58, 123, 189, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(58, 123, 189, 0.05) 0%, transparent 40%);
    pointer-events: none;
    z-index: 1;
  }
}

.dynamic-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.light-beam {
  position: absolute;
  background: linear-gradient(45deg, transparent, rgba(58, 123, 189, 0.15), transparent);
  filter: blur(1px);

  &.beam-1 {
    width: 2px;
    height: 100vh;
    left: 15%;
    animation: beam-move-1 25s ease-in-out infinite;
  }

  &.beam-2 {
    width: 1px;
    height: 120vh;
    left: 65%;
    animation: beam-move-2 30s ease-in-out infinite;
  }

  &.beam-3 {
    width: 1.5px;
    height: 110vh;
    right: 20%;
    animation: beam-move-3 35s ease-in-out infinite;
  }
}

@keyframes beam-move-1 {
  0%, 100% {
    transform: translateY(-100%) rotate(15deg);
    opacity: 0;
  }
  50% {
    transform: translateY(0) rotate(15deg);
    opacity: 0.4;
  }
}

@keyframes beam-move-2 {
  0%, 100% {
    transform: translateY(-120%) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: translateY(0) rotate(-10deg);
    opacity: 0.3;
  }
}

@keyframes beam-move-3 {
  0%, 100% {
    transform: translateY(-110%) rotate(8deg);
    opacity: 0;
  }
  50% {
    transform: translateY(0) rotate(8deg);
    opacity: 0.35;
  }
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .particle {
    position: absolute;
    background: rgba(58, 123, 189, 0.6);
    border-radius: 50%;
    animation: float 40s linear infinite;
    filter: blur(0.5px);
  }
}

@keyframes float {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: scale(1);
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
}

.nav-container {
  position: relative;
  z-index: 100;

  /* 只在此页面修改菜单项主题色 */
  ::v-deep .datasearch-nav {
    background: linear-gradient(135deg, #1a2754 0%, #0f1b3c 50%, #2a4978 100%) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    border-radius: 0;
    min-height: 60px;
  }

  ::v-deep .el-menu-demo {
    background-color: transparent !important;
    border-bottom: none !important;
    border-right: none !important;
  }

  ::v-deep .el-menu-item {
    color: #ffffff !important;
    background-color: transparent !important;
    border-bottom: none !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
  }

  ::v-deep .el-menu-item:hover {
    color: #64b5f6 !important;
    background-color: rgba(100, 181, 246, 0.1) !important;
    transform: translateY(-2px);
  }

  ::v-deep .el-menu-item.is-active {
    color: #64b5f6 !important;
    background-color: rgba(58, 123, 189, 0.2) !important;
    border-bottom: 3px solid #64b5f6 !important;
    font-weight: 600 !important;
  }

  ::v-deep .el-menu--horizontal > .el-menu-item {
    border-bottom: none !important;
    height: 60px !important;
    line-height: 60px !important;
  }

  ::v-deep .el-menu--horizontal > .el-menu-item:not(.is-disabled):hover {
    background-color: rgba(100, 181, 246, 0.15) !important;
    color: #64b5f6 !important;
  }

  ::v-deep .right-menu {
    background: rgba(26, 39, 84, 0.9);
    border-radius: 30px;
    padding: 5px 15px;
    margin: 10px;
  }

  ::v-deep .avatar-container {
    background: transparent;
  }

  ::v-deep .user-avatar {
    border: 2px solid #64b5f6 !important;
    box-shadow: 0 0 10px rgba(100, 181, 246, 0.4) !important;
    transition: all 0.3s ease;
  }

  ::v-deep .user-avatar:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(100, 181, 246, 0.6) !important;
  }

  ::v-deep .please-login a,
  ::v-deep .login-link {
    color: #64b5f6 !important;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  ::v-deep .please-login a:hover,
  ::v-deep .login-link:hover {
    color: #ffffff !important;
    text-shadow: 0 0 8px rgba(100, 181, 246, 0.6);
  }

  /* 下拉菜单样式 */
  ::v-deep .el-dropdown-menu {
    background: rgba(15, 27, 60, 0.95) !important;
    border: 1px solid rgba(100, 181, 246, 0.3) !important;
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }

  ::v-deep .el-dropdown-item {
    color: #ffffff !important;
    transition: all 0.3s ease;
  }

  ::v-deep .el-dropdown-item:hover {
    background-color: rgba(100, 181, 246, 0.2) !important;
    color: #64b5f6 !important;
  }
}

.content-container {
  position: relative;
  z-index: 10;
  height: calc(100vh - 50px);
}

/* 全局响应式设计 */
@media (max-width: 1200px) {
  .content-container {
    padding: 0 10px;
  }
}

@media (max-width: 768px) {
  .image-recognition {
    min-height: 100vh;
  }

  .light-beam {
    display: none; /* 移动端隐藏光束以提高性能 */
  }

  .floating-particles .particle {
    display: none; /* 移动端隐藏粒子以提高性能 */
  }
}

/* 减少动画频率以提高性能 */
.once-animation {
  animation-iteration-count: 1;
}

@media (prefers-reduced-motion: reduce) {
  .light-beam,
  .particle {
    animation: none;
  }
}
</style>
