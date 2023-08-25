var show_selectedImage=function () {
    // 清空右侧框内容
    var canvas_out = document.getElementById("image_canvas_out");
    var ctx_out = canvas_out.getContext("2d");
    ctx_out.clearRect(0, 0, canvas_out.width, canvas_out.height);
    // 居中显示“待提交预测”
    ctx_out.font = "20px Arial";
    ctx_out.textAlign = "center";
    ctx_out.fillText("待提交预测", canvas_out.width / 2, canvas_out.height / 2);

    var selected_files = document.getElementById("select_files").files;
    for (var file of selected_files) {
      console.log("asdasdasadas" + file.webkitRelativePath);
      /// read file content.
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        var img = new Image();
        img.src = this.result;
        img.onload = function () {
          var canvas = document.getElementById("image_canvas");
          var cxt = canvas.getContext("2d");
          var scaleFactor = Math.min(500 / this.width, 500 / this.height);
          var scaledWidth = this.width * scaleFactor;
          var scaledHeight = this.height * scaleFactor;
          var x = (500 - scaledWidth) / 2;
          var y = (500 - scaledHeight) / 2;
          cxt.drawImage(img, x, y, scaledWidth, scaledHeight);
        };
      };
    }
  }

var op = function() {
    const canvas = document.getElementById("image_canvas");
    const ctx = canvas.getContext("2d");
    // 设置字体样式
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // 获取画布宽度和高度
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    // 在画布中心位置绘制文本
    ctx.fillText("请选择图片", canvasWidth / 2, canvasHeight / 2);

    const canvasOut = document.getElementById("image_canvas_out");
    const ctxOut = canvasOut.getContext("2d");
    ctxOut.font = "20px Arial";
    ctxOut.textAlign = "center";
    ctxOut.textBaseline = "middle";
    const canvasOutWidth = canvasOut.width;
    const canvasOutHeight = canvasOut.height;
    ctxOut.fillText("待提交预测", canvasOutWidth / 2, canvasOutHeight / 2);

    // document.getElementById("myform").addEventListener("submit", function (e) {
    //   e.preventDefault(); // 阻止表单默认的提交行为
    //   var selected_files = document.getElementById("select_files").files[0];
    //   processImage(selected_files);
    // });
  }

export {
  show_selectedImage,
  op,
}
