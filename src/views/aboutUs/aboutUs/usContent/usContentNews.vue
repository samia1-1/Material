<template>
  <div class="us-cont-news">
    <div class="us-cont-news-tit">资讯</div>
    <div class="us-news-list">

      <div class="us-news-item">
        <a href="javascript:void(0)">资讯1</a>
      </div>
      <div class="us-news-item">
        <a href="javascript:void(0)">资讯2</a>
      </div>
      <div class="us-news-item">
        <a href="javascript:void(0)">资讯3</a>
      </div>
      <div class="us-news-item">
        <a href="javascript:void(0)">资讯4</a>
      </div>
      <div class="us-news-item">
        <a href="javascript:void(0)">资讯5</a>
      </div>
      <div class="us-news-item">
        <a href="javascript:void(0)">资讯6</a>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  created(){
  }
}
</script>

<style>
.us-cont-news-tit{
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
.us-news-list{
  width: 900px;
  margin: 0 auto;
}
.us-news-list .us-news-item{
  height: 80px;
  border-bottom: 1px solid rgb(204, 204, 204);
  padding: 30px 0;
}
.us-news-list .us-news-item a{
  font-size: 16px;
}
.us-news-list .us-news-item a:hover{
  color: blue;
}
</style>
