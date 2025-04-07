<template>
  <div class="team">
    <div class="team-tit">
      <span class="team-tit-c">团队</span> /
      <span class="team-tit-e">Team</span>
    </div>

    <div class="team-cont">

      <div class="team-item">
        <img
          src="@/assets/images/wangzi.jpg"
          alt=""
        >
        <div class="profile">
          <div class="pofile-name">王子 / Wang Zi</div>
          <div class="profile-text">中南大学粉末冶金研究院</div>
        </div>
      </div>

      <div class="team-item">
        <img
          src="@/assets/images/TanLiming.png"
          alt=""
        >
        <div class="profile">
          <div class="pofile-name"><a href="https://faculty.csu.edu.cn/tanliming1/zh_CN/index.htm" target="_blank">谭黎明 / Tan Liming</a></div>
          <div class="profile-text">中国科协青年托举人才<br><br>团队聚焦于AI、高通量实验和材料大数据方法在高温合金和增材制造（3D打印）等关键领域中的应用</div>
        </div>
      </div>

      <div class="team-item">
        <img
          src="@/assets/images/LiWeifu.png"
          alt=""
        >
        <div class="profile">
          <div class="pofile-name">李伟夫 / Li Weifu</div>
          <div class="profile-text">华中农业大学信息学院副教授</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.team {
  height: 250px;
  background-image: linear-gradient(to bottom, #f6f8fa, #ffffff);
}
.team-tit {
  width: 1200px;
  height: 50px;
  margin: 0 auto;
  font-size: 24px;
  color: black;
  text-align: center;
  line-height: 50px;
  border-bottom: 1px solid #6b7b80;
}
.team-tit-e {
  color: #555e66;
}
.team-cont {
  width: 60vw;
  margin: 30px auto 0;
  display: flex;
  justify-content: space-between;
  justify-content: center;
  overflow: hidden;
}
.team-item {
  height: 150px;
  width: 20vw;
  background-color: #f9f9f9;
  margin-bottom: 5px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}
.team-item img {
  height: 150px;
  width: 123px;
}
.profile {
  width: 275px;
  height: 150px;
  text-align: center;
}
.pofile-name {
  height: 40px;
  line-height: 40px;
  font-size: 2.4vh;
  color: #121d6f;
}
.profile-text {
  font-size: 1.6vh;
  margin-top: 10px;
  margin-left: 10px;
}
</style>

