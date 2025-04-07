<template>
  <div class="us-inline"  ><!-- :style="{height:this.allHeight+'px'}" -->
    <us-header></us-header>

    <div class="us-main">
      <div class="main-inline">
        <div class="main-inline-in">
          <us-content></us-content>
        </div>
      </div>
    </div>

    <div class="us-footer">
      <home-footer></home-footer>
    </div>

  </div>
</template>

<script scoped>
import HomeFooter from '../home/Home/homeFooter.vue';
import UsContent from './aboutUs/usContent/usContent.vue';
import UsHeader from './aboutUs/usHeader.vue';
export default {
  components: {
    UsHeader,
    HomeFooter,
    UsContent
  },
  methods:{
    // changeAllHeight(newHeight){
    //   console.log(body.offsetHeight)
    // }
  },
  data(){
    return {
      allHeight:1500,
    }
  },
  mounted(){
    // const main = document.getElementsByClassName("us-main")[0];
    // console.log(main.offsetHeight)
    // this.allHeight = 780 + main.offsetHeight;
  },
  watch:{
    // allHeight:{
    //   handler(item1,item2){
		// 			// item1为新值，item2为旧值
    //       console.log(item2)
    //       this.allHeight = item2;
		// 		}
    // }
  }
};
</script>

<style scoped>
.us-inline{
  position: relative;
  height: 1900px;
}
.us-main{
  width: 100%;
}
.us-main .main-inline{
  margin: -150px auto 600px;
}
.us-main .main-inline-in{
  position: relative;
    width: 1200px;
    left: 50%;
    -webkit-transform: translate(-50%);
    transform: translate(-50%);
    padding-bottom: 70px;
    background-color: #fff;
    -webkit-box-shadow: 0 0 3px rgba(0,0,0,.25), -20px 20px hsla(0,0%,89.8%,.7);
    box-shadow: 0 0 3px rgba(0,0,0,.25), -20px 20px hsla(0,0%,89.8%,.7);
    border-radius: 3px;
    overflow: hidden;
}

.us-footer{
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
}
</style>
