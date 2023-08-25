
var process_image  = function(files) {
  document.getElementById("myform").addEventListener("submit", function (e) {
      e.preventDefault(); // 阻止表单默认的提交行为
      var selected_files = document.getElementById("select_files").files[0];
      console.log(selected_files)
      });

 var formData = new FormData();
  formData.append('input_image', files);
  console.log(files)
  console.log(formData);
  fetch('http://124.221.104.7:5000/predict', {
      method: 'POST',
      body: files
  })
      .then(response => response.json())
      .then(data => {
        const img = new Image();
        img.src = "data:image/jepg;base64," + data.image_path;
        img.onload = function(){
              var canvas = document.getElementById("image_canvas_out");
              var cxt = canvas.getContext('2d');
              var scaleFactor = Math.min(500 / this.width, 500 / this.height);
              var scaledWidth = this.width * scaleFactor;
              var scaledHeight = this.height * scaleFactor;
              var x = (500 - scaledWidth) / 2;
              var y = (500 - scaledHeight) / 2;
              cxt.drawImage(img, x, y, scaledWidth, scaledHeight);
          }
    });


}
export default process_image;
