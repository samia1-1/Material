<template>
  <div class="image-content">
    <form id="myform" action="#">
      <div
        id="title"
        class="title"
      >
        <h1>金属损伤检测</h1>
      </div>
      <div class="container">
        <div class="box">
          <canvas
            id="image_canvas"
            height="500"
            width="500"
          ></canvas>
          <div class="button-wrapper">
            <div class="select_files-text">上传照片</div>
            <input
              type="file"
              value="选择检测图片"
              size="20"
              id="select_files"
              name="input_image"
              @change="show_selectedImage($event)"
            />
          </div>
        </div>
        <div class="box">
          <canvas
            id="image_canvas_out"
            height="500"
            width="500"
          ></canvas>
          <div class="button-wrapper2">
            <button
              class="button-new"
              @click="processImage()"
            >检测预测</button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import {show_selectedImage,op } from "./imageContent.js";
import process_image from './processImage.js'
export default {
  methods:{
    show_selectedImage(e){
      this.files = e.target.files[0]
      show_selectedImage()
    },
    processImage(){
      // process_image(this.files)
    }
  },
  mounted() {
    op();
  },
  data(){
    return{
      files:undefined
    }
  }
};
</script>

<style scoped>
.box {
  width: 500px;
  height: 500px;
  border: 1px solid black;
  display: flex; /* 将 display 属性设置为 flex */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  margin-right: 20px; /* 设置右边距为 20px */
  margin-left: 20px;
  position: relative;
}
.container {
  width: 1200px;
  display: flex;
  justify-content: center;
}
.button-wrapper {
  position: absolute; /* 添加绝对定位 */
  bottom: -50px;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
}
.select_files-text{
  background-color: #758cf3;
  border-radius: 12px;
  border: none;
  color: white;
  text-align: center;
  font-size: 16px;
  display: block;
  width: 170px;
  height: 40px;
  line-height: 40px;
}
.button-wrapper {
  width: 170px;
  height: 40px;
  overflow: hidden;
}
.button-wrapper input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 170px;
  height: 40px;
  line-height: 40px;
  font-size: 100px;
}
.button-wrapper2 {
  position: absolute; /* 添加绝对定位 */
  bottom: -40px;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
}
.title {
  display: flex;
  justify-content: center;
  align-items: center;
}

.title h1 {
  font-size: 24px;
}
.button-new{
  background-color: #758cf3;
  border-radius: 12px;
  border: none;
  color: white;
  text-align: center;
  font-size: 16px;
  display: block;
  width: 170px;
  height: 40px;
  line-height: 40px;
  position: absolute;
  top: -30px;
  right: -80px;
}
</style>
