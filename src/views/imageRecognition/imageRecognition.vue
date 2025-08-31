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
