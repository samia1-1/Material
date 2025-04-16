<template>
  <div class="image-recognition">
    <!-- 导航栏 -->
    <div class="nav-container">
      <small-nav></small-nav>
    </div>

    <!-- 优化标题区域结构 -->
    <div class="page-header">
      <div class="header-container">
        <!-- 左侧标题图标 -->
        <div class="title-icon">
          <i class="el-icon-picture-outline"></i>
        </div>

        <!-- 中间标题内容 -->
        <div class="title-content">
          <h1 class="image-tit">分割一切微观组织模型</h1>
          <div class="title-divider"></div>
          <p class="title-subtitle">Segmentation of All Microscopic Tissue Models</p>
        </div>

        <!-- 右侧装饰元素 -->
        <div class="title-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-dot"></div>
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
  components: { ImageContent, SmallNav }
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
}

/* 标题容器样式优化 */
.header-container {
  display: flex;
  align-items: center;
  padding: 18px 25px;
  max-width: 1600px;
  margin: 0 auto;
}

/* 标题图标区域优化 */
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
}

.title-icon i {
  font-size: 30px;
  color: #ffffff;
  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
}

/* 标题内容区域优化 */
.title-content {
  flex: 1;
  padding-left: 5px;
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
}

/* 优化的分隔线 */
.title-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #5a9bd5, #3a7cbd);
  margin: 8px 0;
}

/* 副标题优化 */
.title-subtitle {
  font-size: 16px;
  color: #a0c0e0;
  margin: 6px 0 0 0;
  font-weight: normal;
  letter-spacing: 0.5px;
  font-family: 'Times New Roman', serif;
  font-style: italic;
}

/* 右侧装饰元素优化 */
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
}

.decoration-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #5a9bd5;
  box-shadow: 0 0 5px #5a9bd5;
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
