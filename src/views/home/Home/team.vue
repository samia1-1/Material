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
          alt="王子"
        >
        <div class="profile">
          <div class="profile-name">王子 / Wang Zi</div>
          <div class="profile-text">中南大学粉末冶金研究院</div>
        </div>
      </div>

      <div class="team-item">
        <img
          src="@/assets/images/TanLiming.png"
          alt="谭黎明"
        >
        <div class="profile">
          <div class="profile-name"><a href="https://faculty.csu.edu.cn/tanliming1/zh_CN/index.htm" target="_blank">谭黎明 / Tan Liming</a></div>
          <div class="profile-text">中国科协青年托举人才<br><br>团队聚焦于AI、高通量实验和材料大数据方法在高温合金和增材制造（3D打印）等关键领域中的应用</div>
        </div>
      </div>

      <div class="team-item">
        <img
          src="@/assets/images/LiWeifu.png"
          alt="李伟夫"
        >
        <div class="profile">
          <div class="profile-name">李伟夫 / Li Weifu</div>
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
  min-height: 250px;
  padding: 20px 0 40px;
  background-image: linear-gradient(to bottom, #f6f8fa, #ffffff);
}

.team-tit {
  max-width: 1200px;
  width: 90%;
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
  max-width: 1200px;
  width: 90%;
  margin: 30px auto 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.team-item {
  flex: 0 1 350px;
  min-height: 150px;
  background-color: #f9f9f9;
  margin-bottom: 15px;
  display: flex;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.team-item img {
  height: auto;
  width: 120px;
  min-width: 100px;
  object-fit: contain;
}

.profile {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.profile-name {
  height: auto;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #121d6f;
}

.profile-text {
  font-size: 14px;
  margin-top: 10px;
  flex: 1;
  overflow-y: auto;
}

.profile-name a {
  color: #121d6f;
  text-decoration: none;
  font-weight: normal;
  padding: 0;
  border-radius: 0;
  transition: all 0.3s ease;
}

.profile-name a:hover {
  color: #0d47a1;
  text-decoration: underline;
  background-color: rgba(26, 115, 232, 0.1);
  padding: 2px 5px;
  border-radius: 4px;
}

.profile-name a:active {
  color: #0d47a1;
  transform: scale(0.99);
}

@media screen and (max-width: 1024px) {
  .team-item {
    flex: 0 1 300px;
  }
}

@media screen and (max-width: 768px) {
  .team-cont {
    /* 移除竖向排列的样式 */
    /* flex-direction: column; */
    width: 95%;
    justify-content: space-around;
  }

  .team-item {
    flex: 0 1 220px;
    min-height: 120px;
  }

  .team-item img {
    width: 80px;
    min-width: 80px;
  }

  .profile-name {
    font-size: 16px;
  }

  .profile-text {
    font-size: 12px;
  }
}

@media screen and (max-width: 480px) {
  .team-item {
    /* 移除竖向排列的样式 */
    /* flex-direction: column; */
    flex: 0 1 90%;
    text-align: left;
    min-height: 100px;
  }

  .team-item img {
    width: 70px;
    min-width: 70px;
    height: auto;
    object-fit: cover;
    /* 移除全宽和固定高度 */
    /* width: 100%;
    height: 180px; */
  }

  .profile {
    padding: 5px;
  }

  .profile-name {
    min-height: 30px;
    font-size: 14px;
  }
}

/* 添加极小屏幕的特殊处理 */
@media screen and (max-width: 350px) {
  .team-cont {
    gap: 10px;
  }

  .team-item {
    margin-bottom: 10px;
  }

  .profile-text {
    margin-top: 5px;
  }
}
</style>
