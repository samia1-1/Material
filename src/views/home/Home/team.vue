<template>
  <div class="team">
    <div class="team-tit">
      <span class="team-tit-c">团队</span> /
      <span class="team-tit-e">Team</span>
    </div>

    <div class="team-cont">
      <div class="team-item">
        <img src="@/assets/images/TanLiming.png" alt="">、
        <div class="profile">
          <div class="pofile-name">谭黎明 / Tan Liming</div>
          <div class="profile-text">中国科协青年托举人才（第八届）</div>
        </div>
      </div>
      <div class="team-item">
        <img src="@/assets/images/LiWeifu.png" alt="">
        <div class="profile">
          <div class="pofile-name">李伟夫 / Li Weifu</div>
          <div class="profile-text">华中农业大学信息学院副教授</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.team{
  height: 230px;
  background-image: linear-gradient(to bottom,#f6f8fa,#ffffff);
}
.team-tit{
  width: 960px;
  height: 50px;
  margin: 0 auto;
  font-size: 24px;
  color: black;
  text-align: center;
  line-height: 50px;
  border-bottom: 1px solid #6b7b80;
}
.team-tit-e{
  color: #555e66;
}
.team-cont{
  width: 960px;
  margin: 30px auto 0;
  display: flex;
  justify-content: space-between;
}
.team-item{
  height: 150px;
  width: 400px;
  background-color: #fafbfc;
  position: relative;
}
.team-item img{
  height: 150px;
}
.profile{
  position: absolute;
  right: 0;
  top: 0;
  width: 275px;
  height: 150px;
  text-align: center;
}
.pofile-name{
  height: 40px;
  line-height: 40px;
  font-size: 24px;
  color: #121d6f;
}
.profile-text{
  font-size: 16px;
  margin-top: 10px;
  margin-left: 10px;
}
</style>
