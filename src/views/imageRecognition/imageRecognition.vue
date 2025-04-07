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
      <h1 class="image-tit"><i class="el-icon-picture-outline"></i> 分割一切微观组织模型</h1>
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
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.image-tit {
  font-size: 24px;
  color: #303133;
  margin: 10px 0 0;
  font-weight: 600;
}

/* 内容容器 */
.content-container {
  width: 98%;
  margin: 0 15px 15px 30px;
  background-color: #fff;
  border-radius: 8px;
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
    padding: 15px;
  }

  .image-tit {
    font-size: 20px;
  }
}
</style>
