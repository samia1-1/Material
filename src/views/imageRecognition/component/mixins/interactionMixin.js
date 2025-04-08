/**
 * 交互相关功能
 * 处理缩放、拖拽等用户交互
 */

export default {
  mounted() {
    // 使用bind确保this上下文正确
    this.handleGlobalMouseUpBound = this.handleGlobalMouseUp.bind(this);
    this.handleGlobalMouseMoveBound = this.handleGlobalMouseMove.bind(this);

    // 添加全局mouseup和mousemove事件监听
    document.addEventListener('mouseup', this.handleGlobalMouseUpBound, { passive: false, capture: true });
    document.addEventListener('mousemove', this.handleGlobalMouseMoveBound, { passive: false });

    // 记录已添加的监听器
    this.hasGlobalListeners = true;
  },

  beforeDestroy() {
    // 确保移除全局事件监听器
    if (this.hasGlobalListeners) {
      document.removeEventListener('mouseup', this.handleGlobalMouseUpBound, { passive: false, capture: true });
      document.removeEventListener('mousemove', this.handleGlobalMouseMoveBound, { passive: false });
      this.hasGlobalListeners = false;
    }
  },

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

    // 处理拖拽相关方法
    startDrag(event) {
      if (!this.image_src) return;

      // 确保只监听左键拖拽
      if (event.button !== 0) return;

      // 阻止默认行为，避免干扰拖拽
      event.preventDefault();
      event.stopPropagation();

      // 记录拖拽起始状态
      this.dragState.isDragging = true;
      this.dragState.wasDragged = false;
      this.dragState.startX = event.clientX;
      this.dragState.startY = event.clientY;
      this.dragState.lastTranslateX = this.imageTransform.translateX;
      this.dragState.lastTranslateY = this.imageTransform.translateY;
      this.dragState.distance = 0;
      this.dragState.dragStartTime = Date.now();

      // 记录当前鼠标按钮状态
      this.dragState.mouseDown = true;
    },

    // 处理全局鼠标移动事件 - 确保即使鼠标移出容器也能继续拖拽
    handleGlobalMouseMove(event) {
      // 首先检查鼠标按钮状态
      if (event.buttons === 0 && this.dragState.isDragging) {
        // 如果鼠标按钮已释放但拖拽状态仍为true，立即结束拖拽
        this.handleGlobalMouseUp(event);
        return;
      }

      if (this.dragState.isDragging) {
        // 使用requestAnimationFrame确保平滑渲染
        window.requestAnimationFrame(() => {
          this.onDrag(event);
        });
      }
    },

    onDrag(event) {
      if (!this.dragState.isDragging) return;

      // 再次检查鼠标按钮状态
      if (event.buttons === 0) {
        this.handleGlobalMouseUp(event);
        return;
      }

      // 计算拖拽距离
      const deltaX = event.clientX - this.dragState.startX;
      const deltaY = event.clientY - this.dragState.startY;

      // 实时更新图像位置，不使用过渡效果确保图像跟随鼠标移动
      this.imageTransform.translateX = this.dragState.lastTranslateX + deltaX;
      this.imageTransform.translateY = this.dragState.lastTranslateY + deltaY;

      // 计算拖拽距离（用于判断是否为点击事件）
      this.dragState.distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 如果拖拽距离超过阈值，标记为已拖拽
      if (this.dragState.distance > this.dragState.threshold) {
        this.dragState.wasDragged = true;
      }
    },

    // 处理全局鼠标释放事件 - 确保在任何位置松开鼠标都能结束拖拽
    handleGlobalMouseUp(event) {
      if (this.dragState.isDragging) {
        // 阻止其他事件处理程序
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        this.endDrag(event);
      }

      // 重置鼠标按钮状态
      this.dragState.mouseDown = false;
    },

    endDrag(event) {
      // 立即重置所有拖拽状态
      this.dragState.isDragging = false;
      this.dragState.mouseDown = false;
      this.dragState.dragEndTime = Date.now();

      // 强制刷新视图状态，确保UI立即反应
      this.$forceUpdate();
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
