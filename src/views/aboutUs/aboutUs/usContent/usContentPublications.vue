<template>
  <div class="us-cont-publications">
    <div class="us-cont-publications-tit">论文</div>
    <div class="us-publications-list">

      <div class="us-publications-item">
        <a href="javascript:void(0)">论文1</a>
      </div>
      <div class="us-publications-item">
        <a href="javascript:void(0)">论文2</a>
      </div>
      <div class="us-publications-item">
        <a href="javascript:void(0)">论文3</a>
      </div>
      <div class="us-publications-item">
        <a href="javascript:void(0)">论文4</a>
      </div>
      <div class="us-publications-item">
        <a href="javascript:void(0)">论文5</a>
      </div>
      <div class="us-publications-item">
        <a href="javascript:void(0)">论文6</a>
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
.us-cont-publications-tit{
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
.us-publications-list{
  width: 900px;
  margin: 0 auto;
}
.us-publications-list .us-publications-item{
  height: 80px;
  border-bottom: 1px solid rgb(204, 204, 204);
  padding: 30px 0;
}
.us-publications-list .us-publications-item a{
  font-size: 16px;
}
.us-publications-list .us-publications-item a:hover{
  color: blue;
}
</style>
