/**
 * 交互相关功能
 */

export const interactionMixin = {
  data() {
    return {
      // 拖拽状态
      dragState: {
        isDragging: false,
        wasDragged: false,
        startX: 0,
        startY: 0,
        lastTranslateX: 0,
        lastTranslateY: 0,
        distance: 0,
        threshold: 10,
        dragStartTime: 0,
        dragEndTime: 0
      },

      // 触摸状态
      touchState: {
        isTouching: false,
        startX: 0,
        startY: 0,
        startDistance: 0,
        lastScale: 1
      },

      // 上次上传时间记录，防止重复触发
      lastUploadTime: 0,
    };
  },

  computed: {
    // 拖拽状态
    isDragging() {
      return this.dragState.isDragging;
    },
  },

  methods: {
    // 改进中心图片区域点击处理，防止重复触发
    handleCenterPicClick(event) {
      // 阻止事件冒泡
      event.stopPropagation();

      // 加载状态下不允许操作
      if (this.isLoading) {
        return;
      }

      // 如果标记为拖动，或距离上次拖动结束时间很短，则不触发上传
      const timeSinceDragEnd = Date.now() - this.dragState.dragEndTime;
      if (this.dragState.wasDragged || timeSinceDragEnd < 300) {
        return;
      }

      // 检查是否在短时间内重复触发
      const now = Date.now();
      if (now - this.lastUploadTime < 500) {
        console.log('忽略重复的上传触发');
        return;
      }

      // 只有在未上传图片时才触发文件选择
      if (!this.image_src) {
        this.triggerUpload();
      }
    },

    // 开始拖拽
    startDrag(e) {
      if (!this.image_src || this.isLoading) return;

      // 记录开始拖拽的状态
      this.dragState.isDragging = true;
      this.dragState.wasDragged = false;
      this.dragState.startX = e.clientX;
      this.dragState.startY = e.clientY;
      this.dragState.lastTranslateX = this.imageTransform.translateX;
      this.dragState.lastTranslateY = this.imageTransform.translateY;
      this.dragState.distance = 0;
      this.dragState.dragStartTime = Date.now();

      // 添加全局事件监听
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.endDrag);
    },

    // 拖拽中
    onDrag(e) {
      if (!this.dragState.isDragging) return;

      const deltaX = e.clientX - this.dragState.startX;
      const deltaY = e.clientY - this.dragState.startY;
      this.dragState.distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 如果移动距离超过阈值，标记为拖拽
      if (this.dragState.distance > this.dragState.threshold) {
        this.dragState.wasDragged = true;
      }

      // 更新图片位置
      this.imageTransform.translateX = this.dragState.lastTranslateX + deltaX;
      this.imageTransform.translateY = this.dragState.lastTranslateY + deltaY;
    },

    // 结束拖拽
    endDrag() {
      this.dragState.isDragging = false;
      this.dragState.dragEndTime = Date.now();

      // 移除全局事件监听
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.endDrag);
    },

    // 鼠标滚轮缩放
    handleWheel(e) {
      if (!this.image_src || this.isLoading) return;

      e.preventDefault();

      // 确定缩放方向和比例
      const delta = e.deltaY || e.detail || e.wheelDelta;
      const scaleFactor = delta > 0 ? 0.9 : 1.1;

      // 计算新的缩放比例
      let newScale = this.imageTransform.scale * scaleFactor;
      newScale = Math.min(Math.max(newScale, this.imageTransform.minScale), this.imageTransform.maxScale);

      // 应用缩放
      this.imageTransform.scale = newScale;
    },

    // 触摸事件处理
    startTouch(e) {
      if (!this.image_src || this.isLoading) return;

      // 单指触摸，处理拖拽
      if (e.touches.length === 1) {
        this.touchState.isTouching = true;
        this.touchState.startX = e.touches[0].clientX;
        this.touchState.startY = e.touches[0].clientY;
        this.touchState.lastTranslateX = this.imageTransform.translateX;
        this.touchState.lastTranslateY = this.imageTransform.translateY;
      }
      // 双指触摸，处理缩放
      else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.touchState.startDistance = Math.sqrt(dx * dx + dy * dy);
        this.touchState.lastScale = this.imageTransform.scale;
      }
    },

    // 触摸移动
    onTouch(e) {
      if (!this.touchState.isTouching) return;

      // 单指移动，处理拖拽
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.touchState.startX;
        const deltaY = e.touches[0].clientY - this.touchState.startY;

        this.imageTransform.translateX = this.touchState.lastTranslateX + deltaX;
        this.imageTransform.translateY = this.touchState.lastTranslateY + deltaY;
      }
      // 双指移动，处理缩放
      else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 计算缩放比例
        const scaleFactor = distance / this.touchState.startDistance;
        let newScale = this.touchState.lastScale * scaleFactor;

        // 限制缩放范围
        newScale = Math.min(Math.max(newScale, this.imageTransform.minScale), this.imageTransform.maxScale);
        this.imageTransform.scale = newScale;
      }
    },

    // 触摸结束
    endTouch() {
      this.touchState.isTouching = false;
    }
  },

  mounted() {
    // 可以添加全局事件监听等初始化逻辑
  },

  beforeDestroy() {
    // 清理全局事件监听
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.endDrag);
  }
};
