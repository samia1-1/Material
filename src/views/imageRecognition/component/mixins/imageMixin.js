/**
 * 图片处理相关功能
 * 负责图片上传、处理和重置等基本操作
 */
import Tiff from "tiff.js";

export default {
  created() {
    // 确保全局Tiff变量可用
    window.Tiff = Tiff;
    // 设置更大的内存限制
    window.Tiff.initialize({TOTAL_MEMORY: 100000000}); // 100MB
  },

  methods: {
    // 上传图片 - 重写为调用组件中的triggerUpload方法
    imgUpload(event) {
      // 防止事件冒泡（如果是事件触发的）
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }

      // 调用组件中的方法
      if (typeof this.triggerUpload === 'function') {
        this.triggerUpload();
      } else {
        console.warn('triggerUpload method not found in component');
      }
    },

    // 新增：重置图片函数
    resetImage() {
      if (!this.image_src) {
        this.showMessage("没有图片需要重置", "info");
        return;
      }

      // 释放之前的Blob URL
      if (this.image_src && this.image_src.startsWith('blob:')) {
        URL.revokeObjectURL(this.image_src);
      }

      // 清除图片和相关状态
      this.image_src = "";
      this.form_data = undefined;
      this.isShowStatistic = false;
      this.statisticData = null;
      this.resetDataFields();
      this.resetImageTransform();

      // 清除会话存储
      sessionStorage.removeItem("url");
      // 清除API返回的URL
      this.apiReturnedUrl = "";
      sessionStorage.removeItem("apiUrl");

      this.showMessage("图片已重置", "success");
    },

    // 切换示例图片 - 修改为在主区域显示图片
    getImgChange(item) {
      // 显示加载状态
      this.isLoading = true;

      // 保存原始状态，以便可以恢复（仅当有图片时）
      if (this.image_src) {
        this.originalImageSrc = this.image_src;
      }

      // 检查是否为TIFF图片
      if (this.isTiffImage(item.imgUrl)) {
        this.processTiffImage(item.imgUrl)
          .then(blob => {
            const url = URL.createObjectURL(blob);

            // 设置主图片区域的图片
            this.image_src = url;

            // 创建文件对象以便上传处理
            const imageFile = new File([blob], 'example-image.jpg', { type: 'image/jpeg' });
            this.form_data = imageFile;

            // 准备处理图片
            this.showMessage("正在处理图片...", "info");

            // 调用API处理图片
            this.processWithFileUploadAPI(imageFile);
          })
          .catch(error => {
            console.error('无法处理TIFF图片:', error);
            this.showMessage('加载示例图片失败', 'error');
            this.isLoading = false;
          });
      } else {
        // 直接加载示例图片到主区域
        this.fetchImageAsBlob(item.imgUrl)
          .then(blob => {
            // 为blob创建URL
            const url = URL.createObjectURL(blob);

            // 设置主图片区域的图片
            this.image_src = url;

            // 创建文件对象以便上传处理
            const imageFile = new File([blob], 'example-image.jpg', { type: 'image/jpeg' });
            this.form_data = imageFile;

            // 准备处理图片
            this.showMessage("正在处理图片...", "info");

            // 调用API处理图片
            this.processWithFileUploadAPI(imageFile);
          })
          .catch(error => {
            console.error('无法获取示例图片:', error);
            this.showMessage('加载示例图片失败', 'error');
            this.isLoading = false;
          });
      }
    },

    // 处理中心图片区域点击事件 - 移除确认对话框，直接上传
    handleCenterPicClick(event) {
      // 加载状态下不允许操作
      if (this.isLoading) {
        return;
      }

      // 如果标记为拖动，或距离上次拖动结束时间很短，则不触发上传
      const timeSinceDragEnd = Date.now() - this.dragState.dragEndTime;
      if (this.dragState.wasDragged || timeSinceDragEnd < 300) {
        return;
      }

      // 直接触发文件上传，不管是否有图片
      this.imgUpload();
    },

    // 从URL获取图片为Blob对象
    fetchImageAsBlob(url) {
      return new Promise((resolve, reject) => {
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error('网络响应异常');
            }
            return response.blob();
          })
          .then(blob => resolve(blob))
          .catch(error => reject(error));
      });
    },

    // 改进：处理TIFF图片并转换为可显示格式，但保留原始数据
    processTiffImage(url) {
      return new Promise((resolve, reject) => {
        // 显示加载状态
        this.isLoading = true;

        // 获取TIFF文件数据
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error('无法加载TIFF图片');
            }
            return response.arrayBuffer();
          })
          .then(arrayBuffer => {
            try {
              // 保存原始二进制数据，这对保留TIFF元数据很重要
              const originalData = arrayBuffer.slice(0);

              // 使用Tiff.js解析TIFF数据
              Tiff.initialize({TOTAL_MEMORY: 50000000}); // 为大图片分配更多内存
              const tiff = new Tiff({buffer: arrayBuffer});

              // 获取TIFF图像的宽度和高度
              const width = tiff.width();
              const height = tiff.height();

              // 创建Canvas元素并设置尺寸
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;

              // 将TIFF渲染到Canvas
              tiff.render(canvas);

              // 将Canvas转换为PNG格式的DataURL (仅用于显示)
              const dataUrl = canvas.toDataURL('image/png');

              // 将DataURL转换为Blob对象
              fetch(dataUrl)
                .then(res => res.blob())
                .then(previewBlob => {
                  // 创建原始TIFF数据的Blob对象
                  const originalBlob = new Blob([originalData], { type: 'image/tiff' });

                  // 关闭TIFF对象释放内存
                  tiff.close();
                  // 关闭加载状态
                  this.isLoading = false;

                  // 返回处理结果，包含预览和原始数据
                  resolve({
                    preview: previewBlob,
                    original: originalBlob,
                    width: width,
                    height: height,
                    dataUrl: dataUrl
                  });
                });
            } catch (error) {
              console.error('处理TIFF文件失败:', error);
              reject(error);
            }
          })
          .catch(error => {
            console.error('获取TIFF文件失败:', error);
            this.isLoading = false;
            reject(error);
          });
      });
    },

    // 修复：加载示例图片 - 重新组织TIFF处理逻辑
    loadExampleImage(item) {
      // 只有当已有图片时才执行重置
      if (this.image_src) {
        this.resetImage();
      }

      // 显示加载状态
      this.isLoading = true;
      this.showMessage("正在加载图片...", "info");

      // 获取原始文件信息，保留扩展名大小写
      const isTiff = this.isTiffImage(item.fileName || '');
      const fileType = item.fileType || (isTiff ? 'image/tiff' : 'image/jpeg');
      const fileName = item.fileName || `example-${Date.now()}${
        item.originalExtension || this.getExtensionFromMimeType(fileType)
      }`;

      // 记录文件格式到会话存储
      sessionStorage.setItem("originalFormat", fileType);
      sessionStorage.setItem("originalFileName", fileName);

      // 标记为示例图片
      sessionStorage.setItem("isExampleImage", "true");
      sessionStorage.setItem("exampleCategory", item.categoryId || "0");

      // 检查是否为TIFF格式
      if (isTiff) {
        this.processTiffExampleImage(item, fileName);
      } else {
        this.processRegularExampleImage(item, fileName);
      }
    },

    // 新增：处理TIFF格式示例图片
    processTiffExampleImage(item, fileName) {
      // 获取图片URL
      const imageUrl = typeof item.imgUrl === 'object' && item.imgUrl.__esModule ?
                      item.imgUrl.default : item.imgUrl;

      // 先获取ArrayBuffer
      fetch(imageUrl)
        .then(response => {
          if (!response.ok) throw new Error('无法获取TIFF文件');
          return response.arrayBuffer();
        })
        .then(arrayBuffer => {
          // 保存原始二进制数据
          const originalData = arrayBuffer.slice(0);

          // 创建原始TIFF文件对象 - 用于上传处理
          const originalFile = new File(
            [originalData],
            fileName,
            { type: 'image/tiff' }
          );

          // 保存引用
          this.form_data = originalFile;

          // 创建预览 - 使用Promise处理方式
          return this.processTiffArrayBuffer(arrayBuffer)
            .then(dataUrl => {
              // 设置预览图
              this.image_src = dataUrl;

              // 执行API处理
              this.processWithFileUploadAPI(originalFile);

              return dataUrl;
            });
        })
        .catch(error => {
          console.error('处理TIFF图片失败:', error);
          this.showMessage('无法处理TIFF图片', 'error');
          this.isLoading = false;
        });
    },

    // 新增：处理非TIFF格式示例图片
    processRegularExampleImage(item, fileName) {
      // 获取图片URL
      const imageUrl = typeof item.imgUrl === 'object' && item.imgUrl.__esModule ?
                      item.imgUrl.default : item.imgUrl;

      // 获取图片数据
      this.fetchImageAsBlob(imageUrl)
        .then(blob => {
          // 检测并保存文件格式
          const fileType = blob.type || 'image/jpeg';
          sessionStorage.setItem("originalFormat", fileType);
          sessionStorage.setItem("originalFileName", fileName);

          // 创建URL并设置图片
          const url = URL.createObjectURL(blob);
          this.image_src = url;

          // 创建保留原始格式的文件对象
          const imageFile = new File(
            [blob],
            fileName,
            { type: fileType }
          );
          this.form_data = imageFile;

          // 处理图片 - 使用原始格式
          this.processWithFileUploadAPI(imageFile);
        })
        .catch(error => {
          console.error('加载示例图片失败:', error);
          this.showMessage('无法加载示例图片', 'error');
          this.isLoading = false;
        });
    },

    // 新增：根据MIME类型获取文件扩展名
    getExtensionFromMimeType(mimeType) {
      const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/tiff': '.tif', // 统一使用.tif作为TIFF扩展名
        'image/tif': '.tif',
        'image/gif': '.gif',
        'image/bmp': '.bmp',
        'image/webp': '.webp'
      };
      return mimeToExt[mimeType] || '.jpg';
    },

    // 修复：获取文件的原始扩展名（保留大小写）
    getOriginalExtension(fileName) {
      if (!fileName) return '';
      const match = fileName.match(/\.[^.]+$/);
      return match ? match[0] : '';
    },

    // 改进检查文件是否为TIFF格式的方法，支持更多情况
    isTiffImage(url) {
      if (!url) return false;

      // 处理webpack模块化对象
      if (typeof url === 'object' && url.__esModule && url.default) {
        url = url.default;
      }

      // 正则检查文件扩展名
      if (typeof url === 'string') {
        return /\.(tif|tiff|TIF|TIFF)$/i.test(url);
      }

      return false;
    },

    // 改进：通过文件头检测是否是TIFF文件 - 修复检测逻辑
    isTiffBuffer(buffer) {
      try {
        if (!(buffer instanceof ArrayBuffer)) return false;

        // 检查文件大小 - 需要至少8字节才能是有效的TIFF
        if (buffer.byteLength < 8) {
          console.log('文件太小，不可能是TIFF');
          return false;
        }

        const header = new Uint8Array(buffer.slice(0, 4));

        // 输出调试信息
        console.log('TIFF头部检测:', Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' '));

        // 检查TIFF的两种字节序标记
        const isTiffLE = header[0] === 73 && header[1] === 73 && header[2] === 42 && header[3] === 0; // II*\0
        const isTiffBE = header[0] === 77 && header[1] === 77 && header[2] === 0 && header[3] === 42; // MM\0*

        // 如果前4字节匹配TIFF标记，则增加检测第二级IFD偏移量
        if (isTiffLE || isTiffBE) {
          try {
            const view = new DataView(buffer);
            const offset = isTiffLE ?
                           view.getUint32(4, true) :  // 小端
                           view.getUint32(4, false);  // 大端

            // 检查IFD偏移量是否合理
            if (offset < 8 || offset >= buffer.byteLength) {
              console.log('IFD偏移量无效:', offset);
              return false;
            }

            return true;
          } catch (e) {
            console.warn('检查IFD偏移量出错:', e);
            // 即使检查IFD失败，如果标头匹配，还是尝试作为TIFF处理
            return true;
          }
        }

        return false;
      } catch (e) {
        console.error('检测TIFF缓冲区出错:', e);
        return false;
      }
    },

    // 修复：处理TIFF ArrayBuffer数据 - 确保返回Promise
    processTiffArrayBuffer(arrayBuffer) {
      return new Promise((resolve, reject) => {
        try {
          console.log('开始处理TIFF ArrayBuffer，大小:', arrayBuffer.byteLength);

          // 验证是否是TIFF格式
          if (!this.isTiffBuffer(arrayBuffer)) {
            console.warn('不是有效的TIFF格式，尝试作为普通图像处理');
            // 创建Blob并生成URL
            const blob = new Blob([arrayBuffer]);
            const url = URL.createObjectURL(blob);
            this.image_src = url;
            this.isLoading = false;
            resolve(url);
            return;
          }

          // 确保Tiff.js已加载
          if (!window.Tiff) {
            console.log('全局Tiff未定义，使用导入的Tiff');
            window.Tiff = Tiff;
          }

          // 增加内存配额
          window.Tiff.initialize({TOTAL_MEMORY: 100000000});

          // 使用Tiff.js解析TIFF数据
          const tiff = new window.Tiff({ buffer: arrayBuffer });

          // 获取TIFF图像的宽度和高度
          const width = tiff.width();
          const height = tiff.height();
          console.log('TIFF图像尺寸:', width, 'x', height);

          // 创建Canvas元素并设置尺寸
          let canvas;

          // 修正：尝试不同的方法获取Canvas
          if (typeof tiff.toCanvas === 'function') {
            // 如果支持toCanvas方法
            canvas = tiff.toCanvas();
          } else if (typeof tiff.getCanvas === 'function') {
            // 如果支持getCanvas方法
            canvas = tiff.getCanvas();
          } else {
            // 自行创建Canvas并填充数据
            canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');

            // 检查能否读取RGBA数据
            if (typeof tiff.readRGBAImage === 'function') {
              try {
                const rgba = tiff.readRGBAImage();
                const imgData = ctx.createImageData(width, height);
                imgData.data.set(rgba);
                ctx.putImageData(imgData, 0, 0);
              } catch (e) {
                console.error('读取RGBA数据失败，使用替代方法:', e);
                // 降级：直接在Canvas绘制一个占位符
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = '#888';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '20px Arial';
                ctx.fillText('TIFF预览不可用', width/2, height/2);
              }
            } else {
              console.warn('无法找到TIFF渲染方法，使用简单占位符');
              // 若无法读取RGBA，绘制占位符
              ctx.fillStyle = '#f0f0f0';
              ctx.fillRect(0, 0, width, height);
              ctx.fillStyle = '#888';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.font = '20px Arial';
              ctx.fillText('TIFF预览不可用', width/2, height/2);
            }
          }

          // 将Canvas转换为base64数据URL
          const dataUrl = canvas.toDataURL('image/png');
          console.log('TIFF转换为PNG成功');

          // 更新图像源
          this.image_src = dataUrl;
          this.originalImageSrc = dataUrl;

          // 完成加载
          this.isLoading = false;

          // 释放Tiff对象资源
          tiff.close();

          // 返回处理结果 - 确保Promise正确解析结果
          resolve(dataUrl);
        } catch (error) {
          console.error('TIFF数据处理失败:', error);

          try {
            // 提供降级显示
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 400, 300);
            ctx.fillStyle = '#ff0000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '16px Arial';
            ctx.fillText('TIFF处理失败: ' + error.message, 200, 150);

            const fallbackUrl = canvas.toDataURL('image/png');
            this.image_src = fallbackUrl;
            this.isLoading = false;
            resolve(fallbackUrl);
          } catch (fallbackError) {
            this.handleTiffError(`处理TIFF数据失败: ${error.message}`);
            reject(error); // 确保Promise在失败时正确拒绝
          }
        }
      });
    },

    // 检查图片是否已上传
    checkImageExists() {
      if (this.form_data) return true;
      if (sessionStorage.getItem("url")) return true;

      this.showMessage("请先上传图片", "warning");
      return false;
    },

    // 图像操作按钮的前置检查
    checkBeforeImageOperation() {
      if (!this.image_src) {
        this.showMessage("请先上传图片", "warning");
        return false;
      }
      return true;
    },

    // 准备表单数据
    prepareFormData(file) {
      this.form_data = new FormData();
      this.form_data.append('image', file);
    },

    // 添加或修复 getTiffDataUrlHandler 方法
    getTiffDataUrlHandler(tiffData) {
      try {
        this.isLoading = true;

        // 如果传入的是URL字符串，需要先获取二进制数据
        if (typeof tiffData === 'string' && tiffData.startsWith('http')) {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', tiffData, true);
          xhr.responseType = 'arraybuffer';

          xhr.onload = () => {
            if (xhr.status === 200) {
              this.processTiffArrayBuffer(xhr.response);
            } else {
              this.handleTiffError(`Failed to load TIFF: ${xhr.statusText}`);
            }
          };

          xhr.onerror = () => {
            this.handleTiffError('Network error occurred when trying to load TIFF file');
          };

          xhr.send();
        } else {
          // 如果已经是ArrayBuffer，直接处理
          this.processTiffArrayBuffer(tiffData);
        }
      } catch (error) {
        this.handleTiffError(`Error processing TIFF: ${error.message}`);
      }
    },

    // 处理TIFF错误
    handleTiffError(message) {
      console.error(message);
      this.showMessage('TIFF处理失败：' + message, 'error');
      this.isLoading = false;
    },

    // 新增：显示消息
    showMessage(message, type) {
      if (this.$message) {
        this.$message({
          message,
          type,
          duration: 3000
        });
      } else {
        console.log(`[${type}] ${message}`);
      }
    },

    // 仅通过文件头检查TIFF格式
    isTiffCheckHeader(header) {
      if (header.length < 4) return false;

      // 标准TIFF头部检查 (II*\0 或 MM\0*)
      const isTiffLE = header[0] === 73 && header[1] === 73 && header[2] === 42 && header[3] === 0;
      const isTiffBE = header[0] === 77 && header[1] === 77 && header[2] === 0 && header[3] === 42;

      return isTiffLE || isTiffBE;
    },

    // 从Canvas创建缩略图
    createThumbnailFromCanvas(canvas, fileName, maxDim = 200) {
      return new Promise((resolve, reject) => {
        try {
          // 创建缩略图尺寸
          let thumbWidth = canvas.width;
          let thumbHeight = canvas.height;

          // 等比例缩放
          if (canvas.width > canvas.height && canvas.width > maxDim) {
            thumbWidth = maxDim;
            thumbHeight = (canvas.height / canvas.width) * maxDim;
          } else if (canvas.height > maxDim) {
            thumbHeight = maxDim;
            thumbWidth = (canvas.width / canvas.height) * maxDim;
          }

          // 创建缩略图Canvas
          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.width = thumbWidth;
          thumbCanvas.height = thumbHeight;

          // 绘制缩略图
          const ctx = thumbCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);

          // 为TIFF文件添加标识
          if (fileName && /\.(tif|tiff)/i.test(fileName)) {
            this.addTiffMarker(ctx, thumbWidth, thumbHeight);
          }

          // 返回数据URL
          resolve(thumbCanvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      });
    },

    // 从图像URL创建缩略图
    createImageThumbnail(imageUrl, fileName, maxDim = 200) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // 允许跨域

        img.onload = () => {
          try {
            // 创建缩略图尺寸
            let thumbWidth = img.width;
            let thumbHeight = img.height;

            // 等比例缩放
            if (img.width > img.height && img.width > maxDim) {
              thumbWidth = maxDim;
              thumbHeight = (img.height / img.width) * maxDim;
            } else if (img.height > maxDim) {
              thumbHeight = maxDim;
              thumbWidth = (img.width / img.height) * maxDim;
            }

            // 创建Canvas并绘制
            const canvas = document.createElement('canvas');
            canvas.width = thumbWidth;
            canvas.height = thumbHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

            // 为TIFF文件添加标识
            if (fileName && /\.(tif|tiff)/i.test(fileName)) {
              this.addTiffMarker(ctx, thumbWidth, thumbHeight);
            }

            // 返回数据URL
            resolve(canvas.toDataURL('image/png'));
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = (error) => {
          console.error(`图片加载失败: ${fileName}`);
          reject(error);
        };

        // 设置图片源
        img.src = imageUrl;
      });
    },

    // 在Canvas上添加TIFF标记
    addTiffMarker(ctx, width, height) {
      // 右上角添加TIFF标记
      ctx.fillStyle = 'rgba(0, 120, 215, 0.8)';
      ctx.fillRect(width - 40, 0, 40, 16);
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TIFF', width - 20, 11);
    }
  }
}
