<template>
  <div class="image-recognition">
    <!-- 导航栏 -->
    <div class="nav-container">
      <small-nav></small-nav>
    </div>
    <br>
    <br>
    <br>
    <!-- 标题区域 -->
    <div class="page-header">
      <h1 class="image-tit">
        <span class="title-icon"><i class="el-icon-picture-outline"></i></span>
        <span class="title-text">分割一切微观组织模型</span>
      </h1>
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
  components: { ImageContent, SmallNav }
}
</script>

<style scoped>
.image-recognition {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 导航容器样式 */
.nav-container {
  width: 100%;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* 页眉样式 */
.page-header {
  padding: 20px;
  background-color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #67C23A, #E6A23C);
}

.image-tit {
  font-size: 42px;
  margin: 0;
  padding: 25px 30px;
  font-weight: 800;
  display: flex;
  align-items: center;
  letter-spacing: 1px;
  position: relative;
}

.title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  border-radius: 70%;
  margin-right: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.title-icon i {
  font-size: 32px;
  color: #fff;
}

.title-text {
  background: linear-gradient(to right, #409EFF, #67C23A);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: inline-block;
  position: relative;
}

.title-text::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #409EFF, #67C23A);
  transform: scaleX(0.97);
  opacity: 0.7;
}

/* 内容容器 */
.content-container {
  width: 98%;
  margin: 0 15px 15px 30px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .content-container {
    width: 98%;
  }

  .page-header {
    padding: 12px;
  }

  .image-tit {
    font-size: 24px;
    padding: 15px;
    flex-wrap: wrap;
  }

  .title-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }

  .title-icon i {
    font-size: 22px;
  }
}
</style>
