<template>
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
</template>

<script>
export default {
  name: 'PageHeader'
}
</script>

<style lang="scss" scoped>
// 动画定义
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

// 页眉
.page-header {
  margin-top: 60px;
  background: 32, 56, 97;
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
</style>
