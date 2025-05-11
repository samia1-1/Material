/**
 * 交互相关功能
 */

export default {
  data() {
    return {
      // 上次上传时间戳 - 防止重复触发
      lastUploadTime: 0,
      // 全局事件注册标记
      hasGlobalListeners: false
    };
  },

  mounted() {
    // 绑定全局事件处理函数
    this.handleGlobalMouseUpBound = this.handleGlobalMouseUp.bind(this);
    this.handleGlobalMouseMoveBound = this.handleGlobalMouseMove.bind(this);

    // 添加全局事件监听
    document.addEventListener('mouseup', this.handleGlobalMouseUpBound, { passive: false, capture: true });
    document.addEventListener('mousemove', this.handleGlobalMouseMoveBound, { passive: false });
    this.hasGlobalListeners = true;
  },

  beforeDestroy() {
    // 移除全局事件监听
    if (this.hasGlobalListeners) {
      document.removeEventListener('mouseup', this.handleGlobalMouseUpBound, { capture: true });
      document.removeEventListener('mousemove', this.handleGlobalMouseMoveBound);
      this.hasGlobalListeners = false;
    }
  },

  methods: {
    // 操作按钮处理 - 统一检查与函数调用
    handleDisplay() {
      if (!this.checkBeforeImageOperation()) return;

      this.isShowStatistic = !this.isShowStatistic;
      this.showMessage(this.isShowStatistic ? "显示分析数据" : "隐藏分析数据", "info");

      // 首次显示时自动获取数据
      if (this.isShowStatistic && !this.statisticData) {
        this.getStatistic();
      }
    },

    handleSegmentation() {
      if (!this.checkBeforeImageOperation()) return;

      this.isLoading = true;
      this.showMessage("开始图像分割处理...", "info");

      const useTiffUrl = !this.form_data && sessionStorage.getItem("url") !== null;
      this.clickStatistic?.(useTiffUrl);
    },

    handleReduction() {
      if (!this.checkBeforeImageOperation()) return;
      this.showMessage("降维处理功能正在开发中", "info");
    },

    // 缩放控制 - 简化实现
    handleZoomIn() {
      if (!this.image_src) return;
      const { scale, maxScale } = this.imageTransform;
      this.imageTransform.scale = Math.min(scale * 1.2, maxScale);
    },

    handleZoomOut() {
      if (!this.image_src) return;
      const { scale, minScale } = this.imageTransform;
      this.imageTransform.scale = Math.max(scale / 1.2, minScale);
    },

    // 鼠标滚轮缩放 - 优化实现
    handleWheel(event) {
      if (!this.image_src) return;
      event.preventDefault();

      const direction = event.deltaY > 0 ? -1 : 1;
      const { scale, minScale, maxScale } = this.imageTransform;
      const zoomFactor = 0.1;
      const newScale = scale * (1 + direction * zoomFactor);

      if (newScale >= minScale && newScale <= maxScale) {
        this.imageTransform.scale = newScale;
      }
    },

    // 拖拽处理
    startDrag(event) {
      if (!this.image_src || event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();

      // 设置状态
      Object.assign(this.dragState, {
        isDragging: true,
        wasDragged: false,
        startX: event.clientX,
        startY: event.clientY,
        lastTranslateX: this.imageTransform.translateX,
        lastTranslateY: this.imageTransform.translateY,
        distance: 0,
        dragStartTime: Date.now(),
        mouseDown: true
      });
    },

    // 拖拽移动 - 完整实现
    onDrag(event) {
      if (!this.dragState.isDragging) return;

      // 再次检查鼠标按钮状态
      if (event.buttons === 0) {
        this.handleGlobalMouseUp(event);
        return;
      }

      // 计算移动距离
      const deltaX = event.clientX - this.dragState.startX;
      const deltaY = event.clientY - this.dragState.startY;

      // 更新图像位置
      this.imageTransform.translateX = this.dragState.lastTranslateX + deltaX;
      this.imageTransform.translateY = this.dragState.lastTranslateY + deltaY;

      // 计算拖拽距离
      this.dragState.distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 标记为已拖拽（如果超过阈值）
      if (this.dragState.distance > this.dragState.threshold) {
        this.dragState.wasDragged = true;
      }
    },

    // 全局事件处理 - 优化性能
    handleGlobalMouseMove(event) {
      if (!this.dragState.isDragging) return;

      if (event.buttons === 0) {
        this.handleGlobalMouseUp(event);
        return;
      }

      // 使用requestAnimationFrame提高性能
      if (!this._dragAnimFrameId) {
        this._dragAnimFrameId = requestAnimationFrame(() => {
          this.onDrag(event);
          this._dragAnimFrameId = null;
        });
      }
    },

    handleGlobalMouseUp(event) {
      if (this.dragState.isDragging) {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        this.endDrag();
      }
      this.dragState.mouseDown = false;
    },

    endDrag() {
      this.dragState.isDragging = false;
      this.dragState.mouseDown = false;
      this.dragState.dragEndTime = Date.now();
      this.$forceUpdate();

      // 取消可能的动画帧请求
      if (this._dragAnimFrameId) {
        cancelAnimationFrame(this._dragAnimFrameId);
        this._dragAnimFrameId = null;
      }
    },

    // 触摸事件处理 - 简化代码
    startTouch(event) {
      if (!this.image_src) return;

      if (event.touches.length === 1) {
        // 单指触摸 - 拖拽
        this.touchState.isTouching = true;
        this.touchState.startX = event.touches[0].clientX;
        this.touchState.startY = event.touches[0].clientY;
        this.dragState.lastTranslateX = this.imageTransform.translateX;
        this.dragState.lastTranslateY = this.imageTransform.translateY;
      } else if (event.touches.length === 2) {
        // 双指触摸 - 缩放
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
        // 单指移动 - 拖拽
        const deltaX = event.touches[0].clientX - this.touchState.startX;
        const deltaY = event.touches[0].clientY - this.touchState.startY;

        this.imageTransform.translateX = this.dragState.lastTranslateX + deltaX;
        this.imageTransform.translateY = this.dragState.lastTranslateY + deltaY;
      } else if (event.touches.length === 2) {
        // 双指移动 - 缩放
        const currentDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        );

        // 计算并应用缩放
        const ratio = currentDistance / this.touchState.startDistance;
        const newScale = this.touchState.lastScale * ratio;
        const { minScale, maxScale } = this.imageTransform;

        if (newScale >= minScale && newScale <= maxScale) {
          this.imageTransform.scale = newScale;
        }
      }
    },

    endTouch() {
      this.touchState.isTouching = false;
    },

    // 中心图片区域点击处理 - 简化实现
    handleCenterPicClick(event) {
      // 阻止事件冒泡
      event.stopPropagation();

      // 快速排除条件
      if (this.isLoading ||
          this.dragState.wasDragged ||
          (Date.now() - this.dragState.dragEndTime < 300) ||
          (Date.now() - this.lastUploadTime < 500) ||
          this.image_src) {
        return;
      }

      // 更新时间戳并触发上传
      this.lastUploadTime = Date.now();
      this.triggerUpload?.();
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
