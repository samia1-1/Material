<template>
  <div class="footer">

    <div class="func">
      <div class="func-span func-1">
        <div class="func-tit">快速访问</div>
        <ul>
          <li><a href="#" @click="toDatabase">数据查询</a></li>
          <li><a href="#" @click="toDatapredict">拉伸性能预测</a></li>
          <li><a href="http://124.221.104.7:5000" target="_blank">金属损伤图像识别</a></li>
        </ul>
      </div>
      <div class="func-span func-2">
        <div class="func-tit">关于我们</div>
        <ul>
          <li><a href="#" @click="toAboutUs">团队概况</a></li>
          <!-- <li><a href="#">联系我们</a></li> -->
          <li><a href="http://aisle.hzau.edu.cn/info/1140/1162.htm#" target="_blank">加入我们</a></li>
        </ul>
      </div>

      <div class="func-span func-3">
        <div class="func-tit">关注我们</div>
        <ul>
          <li><a href="#">公众号关注</a></li>
          <li><a href="http://www.hzau.edu.cn/">华中农业大学</a></li>
        </ul>
      </div>

      <div class="func-span-right func-4">
        <div class="func-tit">办公地址</div>
        <div class="func-place">
          <a href="http://www.hzau.edu.cn/">湖北省武汉市洪山区狮子山街道华中农业大学</a>
        </div>
        <div class="func-tit">联系电话</div>
        <div class="func-phone">15972007638</div>
      </div>

    </div>

    <div class="friend-link">
      <div class="friend-link-item" v-for="(item,index) in links" :key="index">
        <a :href="item.url" target="_blank">{{item.name}}</a>
      </div>
    </div>

    <div class="copyright">
      Copyright ©2023 版权所有 @李伟夫 备案号 鄂ICP备2023013885号
    </div>
  </div>
</template>

<script>
import {getFriendLink} from '@/api/home/home.js'
export default {
  data(){
    return{
      links:[]
    }
  },
  created(){
    this.getLinks()
  },
  methods:{
    getLinks(){
      getFriendLink().then(res => {
        this.links = res.data
        // console.log(this,this.links)
      })
    },
    toDatabase(){
      this.$router.push('/datasearch')
    },
    toImageRecognition(){
      this.$router.push('/imagerecognition')
    },
    toDatapredict(){
      this.$router.push('/datapredict')
    },
    toAboutUs(){
      this.$router.push('/aboutus')
    }
  }
}
</script>
<!--
  position: absolute;
  bottom: 0px; -->
<style>
.footer{
  height: 500px;
  background-color: #222;
  color: aliceblue;
}
.func{
  height: 300px;
  display: flex;
  justify-content:center;
  box-sizing: border-box;
}
.func-span{
  width: 300px;
  height: 200px;
  margin: 50px 0;
  text-align: center;
  padding: 20px 0 0 0 ;
}
.func-1,.func-3{
  background-color: rgba(0,0,0,0.20);
}
.func-2,.func-4{
  background-color: rgba(0,0,0,0.40);
}
.func-tit{
  font-size: 20px;
  margin: 10px 0;
}
ul{
  list-style-type: none;
  padding: 0;
}
.footer a:hover{
  text-decoration: underline;
}
.func ul li{
  font-size: 14px;
  margin: 10px 0;
}
.func ul li a:hover{
  text-decoration: underline;
}
.func-span-right{
  width: 300px;
  height: 200px;
  margin: 50px 0;
  padding: 20px 20px;
}
.func-place{
  font-size: 12px;
  color: rgba(255,255,255,0.50);
  height: 20px;
  line-height: 20px;
}
.func-phone{
  font-size: 20px;
  color: rgb(255, 255, 255);
  height: 30px;
  line-height: 30px;
  font-weight: 500;
}
.friend-link{
  height: 140px;
  line-height: 20px;
  display: flex;
  justify-content : center;
  flex-wrap: wrap;
  margin: 0 50px 0 50px;
}
.friend-link-item{
  margin: 0 10px;
}
.friend-link a{
  color: rgba(255,255,255,0.50);
  font-size: 14px;
}
.copyright{
  margin: 10px 50px;
  border-top: 2px solid rgb(79, 79, 79);
  text-align: center;
  height: 40px;
  line-height: 40px;
}
</style>
