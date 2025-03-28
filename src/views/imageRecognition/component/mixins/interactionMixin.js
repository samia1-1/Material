/**
 * 用户交互相关功能
 * 负责处理鼠标和触摸交互，如缩放、拖拽等
 */
export default {
  methods: {
    // 放大图片
    handleZoomIn() {
      if (!this.checkBeforeImageOperation()) return;

      const { scale, maxScale } = this.imageTransform;
      this.imageTransform.scale = Math.min(maxScale, scale + 0.2);
    },

    // 缩小图片
    handleZoomOut() {
      if (!this.checkBeforeImageOperation()) return;

      const { scale, minScale } = this.imageTransform;
      this.imageTransform.scale = Math.max(minScale, scale - 0.2);
    },

    // 图像分割
    handleSegmentation() {
      if (!this.checkBeforeImageOperation()) return;
      this.showMessage("正在执行图像分割", "info");
      // 实际分割逻辑
    },

    // 图像降维
    handleReduction() {
      if (!this.checkBeforeImageOperation()) return;
      this.showMessage("正在执行降维处理", "info");
      // 实际降维逻辑
    },

    // 显示处理结果
    handleDisplay() {
      if (!this.checkBeforeImageOperation()) return;
      this.getStatistic();
    },

    // 重置图片变换
    resetImageTransform() {
      this.imageTransform = {
        ...this.imageTransform,
        scale: 1,
        translateX: 0,
        translateY: 0
      };

      this.dragState = {
        ...this.dragState,
        isDragging: false,
        wasDragged: false,
        lastTranslateX: 0,
        lastTranslateY: 0,
        distance: 0
      };
    },

    // 处理鼠标滚轮事件
    handleWheel(event) {
      if (!this.image_src) return;

      // 阻止默认滚动行为
      event.preventDefault();
      event.stopPropagation();

      const { scale, minScale, maxScale } = this.imageTransform;
      const { translateX, translateY } = this.imageTransform;

      // 计算新的缩放比例
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));

      // 计算鼠标在图片上的相对位置
      const rect = this.$refs.imageContainer.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // 计算新的平移位置，保持鼠标指向的图片点不变
      const scaleRatio = newScale / scale;
      const newTranslateX = mouseX - (mouseX - translateX) * scaleRatio;
      const newTranslateY = mouseY - (mouseY - translateY) * scaleRatio;

      // 更新状态
      this.imageTransform = {
        ...this.imageTransform,
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY
      };
    },

    // 开始拖动
    startDrag(event) {
      if (!this.image_src || this.isLoading) return;

      // 添加拖动标识类，用于自定义光标样式
      const centerPic = this.$el.querySelector('.center-pic');
      if (centerPic) {
        centerPic.classList.add('dragging');
        // 添加Element UI动画类
        centerPic.classList.add('el-zoom-in-top');
      }

      this.dragState = {
        ...this.dragState,
        isDragging: true,
        wasDragged: false,
        distance: 0,
        startX: event.clientX,
        startY: event.clientY,
        lastTranslateX: this.imageTransform.translateX,
        lastTranslateY: this.imageTransform.translateY,
        dragStartTime: Date.now()
      };

      // 添加拖拽状态到document，防止拖拽时文本选择
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';

      event.preventDefault();
    },

    // 拖动中
    onDrag(event) {
      if (!this.dragState.isDragging) return;

      const { startX, startY, lastTranslateX, lastTranslateY, threshold } = this.dragState;

      // 计算拖动距离
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 更新拖动状态
      this.dragState.distance = distance;
      this.dragState.wasDragged = distance > threshold;

      // 更新图片位置
      this.imageTransform.translateX = event.clientX - startX + lastTranslateX;
      this.imageTransform.translateY = event.clientY - startY + lastTranslateY;

      event.preventDefault();
    },

    // 结束拖动
    endDrag() {
      if (!this.dragState.isDragging) return;

      // 移除拖动标识类和动画类
      const centerPic = this.$el.querySelector('.center-pic');
      if (centerPic) {
        centerPic.classList.remove('dragging');
        centerPic.classList.remove('el-zoom-in-top');
      }

      // 恢复document状态
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      // 记录拖动结束时间
      this.dragState.dragEndTime = Date.now();

      // 计算拖动持续时间
      const dragDuration = this.dragState.dragEndTime - this.dragState.dragStartTime;

      // 如果拖动时间超过150ms或距离超过阈值，才认为是有效拖动
      this.dragState.wasDragged =
        (this.dragState.distance > this.dragState.threshold) ||
        (dragDuration > 150);

      this.dragState.isDragging = false;

      // 延长重置wasDragged标志的时间，确保不会误触发点击
      setTimeout(() => {
        this.dragState.wasDragged = false;
      }, 300);
    },

    // 开始触摸
    startTouch(event) {
      if (!this.image_src || this.isLoading) return;

      event.preventDefault = () => {}; // 替代preventDefault，因为我们使用passive

      this.touchState.isTouching = true;

      if (event.touches.length === 1) {
        // 单指触摸 - 准备平移
        this.touchState.startX = event.touches[0].clientX;
        this.touchState.startY = event.touches[0].clientY;
        this.touchState.lastScale = this.imageTransform.scale;
        this.dragState.lastTranslateX = this.imageTransform.translateX;
        this.dragState.lastTranslateY = this.imageTransform.translateY;
      } else if (event.touches.length === 2) {
        // 双指触摸 - 准备缩放
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        this.touchState.startDistance = Math.sqrt(dx * dx + dy * dy);
        this.touchState.lastScale = this.imageTransform.scale;
      }
    },

    // 触摸移动
    onTouch(event) {
      if (!this.touchState.isTouching || !this.image_src || this.isLoading) return;

      event.preventDefault = () => {}; // 替代preventDefault，因为我们使用passive

      if (event.touches.length === 1) {
        // 单指触摸 - 处理平移
        const dx = event.touches[0].clientX - this.touchState.startX;
        const dy = event.touches[0].clientY - this.touchState.startY;

        this.imageTransform.translateX = this.dragState.lastTranslateX + dx;
        this.imageTransform.translateY = this.dragState.lastTranslateY + dy;

        // 标记为拖动，防止触发点击
        this.dragState.wasDragged = true;
        this.dragState.dragEndTime = Date.now();
      } else if (event.touches.length === 2) {
        // 双指触摸 - 处理缩放
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 计算新的缩放比例
        const scaleChange = distance / this.touchState.startDistance;
        const newScale = Math.max(
          this.imageTransform.minScale,
          Math.min(this.imageTransform.maxScale, this.touchState.lastScale * scaleChange)
        );

        // 更新缩放
        this.imageTransform.scale = newScale;

        // 标记为拖动，防止触发点击
        this.dragState.wasDragged = true;
        this.dragState.dragEndTime = Date.now();
      }
    },

    // 结束触摸
    endTouch(event) {
      event.preventDefault = () => {}; // 替代preventDefault，因为我们使用passive
      this.touchState.isTouching = false;

      // 为确保不会触发点击事件，保持wasDragged标志一段时间
      setTimeout(() => {
        this.dragState.wasDragged = false;
      }, 300);
    },

    // 显示消息
    showMessage(message, type = 'info') {
      // 使用 Element UI 的消息通知
      if (this.$message) {
        this.$message({
          message: message,
          type: type,
          duration: 2000
        });
      } else {
        // 如果 $message 不可用，使用 console
        console.log(`${type}: ${message}`);
      }
    }
  }
}
