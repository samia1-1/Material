<template>
  <div class="new-index">
    <div class="us-cont-news-tit">资讯</div>
    <div class="us-news-list">

      <div
        class="us-news-item"
        v-for="item in paperList"
        :key="item.id"
      >
        <!-- <router-link
          to="/detail"
          target="_blank"
        >{{item.name}}</router-link> -->
        <a :href="'files/' + item.name + '.doc'" :download="item.name">{{item.name}}</a>
        <div class="news-author">{{item.author}}</div>
      </div>

    </div>
  </div>
</template>

<script>
import { getPaperList, getPaperListContent } from "@/api/aboutus/aboutus.js";
export default {
  data() {
    return {
      paperList: [],
      convertedHtml: null, // 用于存储转换后的HTML内容
    };
  },
  created() {
    getPaperList().then((res) => {
      this.paperList = res.data;
      console.log(res.data);
    });
  },
  methods: {
    // lookNew(item) {
    //   getPaperListContent({
    //     id: item.id,
    //   }).then((res) => {
    //     this.convertedHtml = res.msg;
    //     this.convertedHtml = this.convertedHtml.replace(/\r\n/g, "");
    //     // this.$store.dispatch("setNewSRC", this.convertedHtml).then((res) => {});
    //     // localStorage.setItem("newSRC", JSON.stringify(this.convertedHtml));
    //     //弹出图片窗口
    //     const newPage = window.open("/#/detail", "_blank");
    //     const data = {
    //       fileUrl:'/files/'+ item.name +'.doc'
    //     };
    //     // 使用postMessage方法向新窗口发送数据
    //     window.setTimeout(function () {
    //       newPage.postMessage(
    //         data,
    //         "http://localhost:8100/#/aboutus/news/detail"
    //       );
    //     }, 1000);
    //   });
    // },
  },
};
</script>

<style scoped>
.us-cont-news-tit {
  width: 900px;
  margin: auto;
  height: 200px;
  text-align: center;
  color: #2f3237;
  font-size: 30px;
  font-weight: 600;
  line-height: 300px;
  border-bottom: 1px solid rgb(204, 204, 204);
}
.us-news-list {
  width: 900px;
  margin: 0 auto;
}
.us-news-list .us-news-item {
  height: 80px;
  border-bottom: 1px solid rgb(204, 204, 204);
  padding: 30px 0;
  position: relative;
}
.us-news-list .us-news-item a {
  font-size: 16px;
  width: 50%;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.us-news-list .us-news-item a:hover {
  color: rgb(42, 42, 255);
  text-decoration: underline;
}
.news-author {
  display: block;
  position: absolute;
  right: 30px;
  color: rgb(181, 181, 181);
  top: 30px;
}
</style>
