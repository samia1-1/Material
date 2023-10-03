<template>
  <div class="us-cont-news">
    <div class="us-cont-news-tit">资讯</div>
    <div class="us-news-list">

      <div
        class="us-news-item"
        v-for="item in paperList"
        :key="item.id"
        @click="lookNew(item)"
      >
        <a href="javascript:void(0)">{{item.name}}</a>
        <div class="news-author">{{item.author}}</div>
      </div>

    </div>
  </div>
</template>

<script>
import { getPaperList,getPaperListContent } from "@/api/aboutus/aboutus.js";
export default {
  data() {
    return {
      paperList: [],
    };
  },
  created() {
    getPaperList().then((res) => {
      this.paperList = res.data;
    });
  },
  methods:{
    lookNew(item){
      getPaperListContent({
        id:item.id
      }).then(res => {
        console.log(res.data)
      })
    }
  }
};
</script>

<style>
.us-cont-news{
  min-height: 900px;
}
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
