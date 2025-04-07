/**
 * 交互相关功能
 * 处理缩放、拖拽等用户交互
 */

export default {
  methods: {
    // 处理显示分析按钮
    handleDisplay() {
      if (!this.checkBeforeImageOperation()) return;

      if (this.isShowStatistic) {
        this.isShowStatistic = false;
        this.showMessage("已隐藏分析数据", "info");
      } else {
        this.getStatistic();
      }
    },

    // 处理图像分割
    handleSegmentation() {
      if (!this.checkBeforeImageOperation()) return;

      // 显示加载状态
      this.isLoading = true;
      this.showMessage("开始图像分割处理...", "info");

      // 使用已上传的文件或者会话存储中的URL进行处理
      const useTiffUrl = !this.form_data && sessionStorage.getItem("url") !== null;
      this.clickStatistic(useTiffUrl);
    },

    // 处理降维处理
    handleReduction() {
      if (!this.checkBeforeImageOperation()) return;

      this.showMessage("降维处理功能正在开发中", "info");
      // 这里可以实现降维处理逻辑
    },

    // 缩放相关方法
    handleZoomIn() {
      if (!this.image_src) return;

      const { scale, maxScale } = this.imageTransform;
      if (scale < maxScale) {
        this.imageTransform.scale = Math.min(scale * 1.2, maxScale);
      }
    },

    handleZoomOut() {
      if (!this.image_src) return;

      const { scale, minScale } = this.imageTransform;
      if (scale > minScale) {
        this.imageTransform.scale = Math.max(scale / 1.2, minScale);
      }
    },

    // 处理鼠标滚轮缩放
    handleWheel(event) {
      if (!this.image_src) return;

      // 阻止事件默认行为（页面滚动）
      event.preventDefault();

      // 确定缩放方向
      const direction = event.deltaY > 0 ? -1 : 1;

      // 当前缩放值
      const { scale, minScale, maxScale } = this.imageTransform;

      // 计算新的缩放值
      const zoomFactor = 0.1;
      const newScale = scale * (1 + direction * zoomFactor);

      // 应用缩放限制
      if (newScale >= minScale && newScale <= maxScale) {
        this.imageTransform.scale = newScale;
      }
    },

    // 拖拽相关方法
    startDrag(event) {
      if (!this.image_src) return;

      // 记录拖拽起始状态
      this.dragState.isDragging = true;
      this.dragState.wasDragged = false;
      this.dragState.startX = event.clientX;
      this.dragState.startY = event.clientY;
      this.dragState.lastTranslateX = this.imageTransform.translateX;
      this.dragState.lastTranslateY = this.imageTransform.translateY;
      this.dragState.distance = 0;
      this.dragState.dragStartTime = Date.now();
    },

    onDrag(event) {
      if (!this.dragState.isDragging) return;

      // 计算拖拽距离
      const deltaX = event.clientX - this.dragState.startX;
      const deltaY = event.clientY - this.dragState.startY;

      // 更新图像位置
      this.imageTransform.translateX = this.dragState.lastTranslateX + deltaX;
      this.imageTransform.translateY = this.dragState.lastTranslateY + deltaY;

      // 计算拖拽距离（用于判断是否为点击事件）
      this.dragState.distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 如果拖拽距离超过阈值，标记为已拖拽
      if (this.dragState.distance > this.dragState.threshold) {
        this.dragState.wasDragged = true;
      }
    },

    endDrag() {
      // 结束拖拽状态
      this.dragState.isDragging = false;
      this.dragState.dragEndTime = Date.now();
    },

    // 触摸相关方法
    startTouch(event) {
      if (!this.image_src) return;

      if (event.touches.length === 1) {
        // 单指触摸 - 等同于开始拖拽
        this.touchState.isTouching = true;
        this.touchState.startX = event.touches[0].clientX;
        this.touchState.startY = event.touches[0].clientY;

        // 保存当前位置
        this.dragState.lastTranslateX = this.imageTransform.translateX;
        this.dragState.lastTranslateY = this.imageTransform.translateY;
      } else if (event.touches.length === 2) {
        // 双指触摸 - 准备缩放
        this.touchState.startDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        );
        this.touchState.lastScale = this.imageTransform.scale;
      }
    },

    onTouch(event) {
      if (!this.touchState.isTouching) return;

      if (event.touches.length === 1) {
        // 单指移动 - 拖拽图像
        const deltaX = event.touches[0].clientX - this.touchState.startX;
        const deltaY = event.touches[0].clientY - this.touchState.startY;

        this.imageTransform.translateX = this.dragState.lastTranslateX + deltaX;
        this.imageTransform.translateY = this.dragState.lastTranslateY + deltaY;
      } else if (event.touches.length === 2) {
        // 双指移动 - 缩放图像
        const currentDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        );

        // 计算缩放比例
        const ratio = currentDistance / this.touchState.startDistance;
        const newScale = this.touchState.lastScale * ratio;

        // 应用缩放限制
        const { minScale, maxScale } = this.imageTransform;
        if (newScale >= minScale && newScale <= maxScale) {
          this.imageTransform.scale = newScale;
        }
      }
    },

    endTouch() {
      this.touchState.isTouching = false;
    },

    // 重置图像变换
    resetImageTransform() {
      this.imageTransform = {
        scale: 1,
        translateX: 0,
        translateY: 0,
        minScale: 0.5,
        maxScale: 5
      };
    }
  }
};
