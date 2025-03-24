<template>
  <div class="image-recognition">
    <!-- 背景图片层 - 固定不动 -->
    <div class="background-image"></div>

    <!-- 导航栏 - 普通相对定位，随页面滚动 -->
    <div class="nav-container">
      <small-nav></small-nav>
    </div>

    <!-- 内容外层容器 - 包含所有可滚动内容 -->
    <div class="scrollable-content">
      <!-- 标题区域 -->
      <div class="image-tit">微观组织相识别</div>

      <!-- 顶部透明区域 - 确保初始视图下背景可见 -->
      <div class="transparent-area"></div>

      <!-- 大型白色区域 - 随滚动移动覆盖背景图 -->
      <div class="white-background">
        <!-- 页面堆叠效果 - 底层容器 -->
        <div class="content-wrapper-bottom">
          <!-- 页面堆叠效果 - 顶层容器 -->
          <div class="content-wrapper">
            <div class="content">
              <image-content></image-content>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SmallNav from '../../components/smallNav/smallNav.vue'
import ImageContent from './component/imageContent.vue'
export default {
  components: { ImageContent, SmallNav }
}
</script>

<style scoped>
.image-recognition {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('../../assets/images/index_bg.png');
  background-size: cover;
  z-index: -1;
}

/* 导航容器样式 - 随页面滚动 */
.nav-container {
  position: relative; /* 改为相对定位，随页面滚动 */
  width: 100%;
  z-index: 100; /* 确保导航在最上层 */
}

/* 透明导航菜单样式 - 使用深度选择器覆盖组件内部样式 */
.nav-container /deep/ .datasearch-nav {
  background-color: transparent !important;
  box-shadow: none !important;
}

.nav-container /deep/ .el-menu {
  background-color: transparent !important;
  border-bottom: none !important;
}

.nav-container /deep/ .el-menu-item {
  background-color: transparent !important;
  color: white !important;
}

.nav-container /deep/ .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.nav-container /deep/ .el-menu-item.is-active {
  color: #409EFF !important;
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

/* 可滚动内容容器 - 不需要为导航腾出空间 */
.scrollable-content {
  position: relative;
  width: 100%;
  z-index: 1;
  padding-top: 0; /* 移除顶部内边距，因为导航不再固定 */
}

/* 标题样式 */
.image-tit {
  height: 60px;
  line-height: 60px;
  font-size: 40px;
  text-align: center;
  margin: 60px 0 20px; /* 增加顶部边距，将标题向下移动 */
  position: relative;
  z-index: 2;
  color: #fff;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.7);
  padding: 10px 0;
  border-radius: 3px;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}

/* 顶部透明区域 - 调整高度 */
.transparent-area {
  height: 5vh;
  width: 100%;
  z-index: 1;
}

/* 白色背景区域 - 随滚动移动覆盖背景图 */
.white-background {
  position: relative;
  width: 100%;
  background-color: #ffffff;
  padding-top: 0;
  padding-bottom: 10vh;
  min-height: 120vh;
  z-index: 1;
  margin-top:15vh;
  box-shadow: 0 -10px 15px -5px rgba(0, 0, 0, 0.2);
}

/* 底层容器 */
.content-wrapper-bottom {
  position: relative;
  height: 150vh;
  z-index: 1;
  background-color: rgba(240, 240, 240, 0.95);
  border-radius: 3px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  width: 80%;
  margin: 0 auto;
  padding: 5px;
  top: -10vh;
}

/* 顶层容器 */
.content-wrapper {
  position: relative;
  z-index: 2;
  background-color: #fff;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
  padding: 30px;
  padding-top: 50px;
  width: 100%;
  margin: 0 auto;
  height: 150vh;
  transform: translate(10px, -20px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.content-wrapper:hover {
  transform: translate(12px, -25px);
  box-shadow: 8px 8px 20px rgba(0, 0, 0, 0.4);
}

.content {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
