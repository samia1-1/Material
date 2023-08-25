<template>
  <div class="us-content-team">
    <div class="us-cont-tit">
      <span class="us-cont-tit-c">团队</span>
      <span class="us-cont-tit-e">Team</span>
    </div>

    <div class="us-cont-right-peo">
      <div class="us-cont-right-peo-item peo-1">
        <img
          src="@/assets/images/TanLiming.png"
          alt=""
        >
        <div class="profile">
          <div class="pofile-name">谭黎明 / Tan Liming</div>
          <div class="profile-text">中国科协青年托举人才（第八届）</div>
          <div class="profile-text">中国有色金属工业科技进步一等奖</div>
        </div>
      </div>

      <div class="us-cont-right-peo-item peo-2">
        <img
          src="@/assets/images/LiWeifu.png"
          alt=""
        >
        <div class="profile">
          <div class="pofile-name">李伟夫 / Li Weifu</div>
          <div class="profile-text">华中农业大学信息学院副教授</div>
          <div class="profile-text">华中农业大学硕彦计划青年英才B岗</div>
        </div>
      </div>

    </div>

    <div class="us-cont-team-members">
      <div class="us-team-members-tit">贡献人员</div>
      <div class="us-team-members-list">

        <div
          class="us-team-members-item"
          v-for="(item,index) in usTeamMembersList"
          :key="index"
        >
          <a
            :href="item.url"
            target="_blank"
          >
            <div class="us-team-members-item-name">{{item.name}}</div>
            <div class="us-team-members-item-text">{{item.text}}</div>
          </a>
        </div>

      </div>
    </div>

  </div>
</template>

<script scoped>
export default {
  created() {
    // console.log(document.offsetHeight)
  },
  data() {
    return {
      usTeamMembersList: [
        {
          name: "王青林",
          text: "华中农业大学人工智能与统计学习团队2020级研究生",
          url: "http://aisle.hzau.edu.cn/info/1128/1086.htm",
          target:true,
        },
        {
          name: "刘青秀",
          text: "华中农业大学人工智能与统计学习团队2023级研究生",
          url: "http://aisle.hzau.edu.cn/info/1158/1760.htm",
          target:true,
        },
        {
          name: "吴昊",
          text: "华中农业大学人工智能与统计学习团队2022级研究生",
          url: "http://aisle.hzau.edu.cn/info/1159/1537.htm",
          target:true,
        },
        {
          name: "刘雪丽",
          text: "华中农业大学人工智能与统计学习团队2022级研究生",
          url: "http://aisle.hzau.edu.cn/info/1159/1532.htm",
          target:true,
        },
        {
          name: "刘洋",
          text: "华中农业大学信息与计算科学2021级本科生",
          url: "javascript:void(0)",
          target:false,
        },
        {
          name: "曾新月",
          text: "华中农业大学信息与计算科学2021级本科生",
          url: "javascript:void(0)",
          target:false,
        },
      ],
    };
  },
};
</script>

<style>
.us-content-team {
  position: relative;
}
.us-cont-tit {
  width: 600px;
  height: 300px;
  position: relative;
}
.us-cont-tit span {
  position: absolute;
  text-align: center;
}
.us-cont-tit-c {
  font-size: 50px;
  z-index: 9;
  left: 60px;
  top: 110px;
  font-weight: 500;
}
.us-cont-tit-e {
  left: 50px;
  top: 35px;
  z-index: 8;
  font-size: 150px;
  color: rgb(216, 216, 216);
}
.us-cont-right-peo {
  width: 600px;
  height: 300px;
  position: absolute;
  top: 0;
  right: 0;
}
.us-cont-right-peo .us-cont-right-peo-item {
  width: 300px;
  height: 300px;
  position: absolute;
  text-align: center;
}
.peo-1 {
  left: 0;
}
.peo-2 {
  right: 0;
}
.us-cont-right-peo .us-cont-right-peo-item img {
  width: 150px;
  margin-top: 20px;
}
.us-cont-right-peo .us-cont-right-peo-item .profile {
  font-size: 20px;
  position: absolute;
  top: 200px;
  width: 275px;
  height: 150px;
}
.us-cont-right-peo .us-cont-right-peo-item .profile .pofile-name {
  height: 40px;
  line-height: 40px;
  font-size: 24px;
  color: #121d6f;
}
.us-cont-right-peo .us-cont-right-peo-item .profile .profile-text {
  font-size: 16px;
  margin-top: 8px;
  margin-left: 10px;
}
.us-team-members-tit {
  width: 1100px;
  margin: auto;
  height: 200px;
  text-align: center;
  color: #2f3237;
  font-size: 30px;
  font-weight: 600;
  line-height: 300px;
  border-bottom: 1px solid rgb(204, 204, 204);
}
.us-team-members-list {
  display: flex;
  flex-wrap: wrap;
  margin: 30px auto;
  width: 1160px;
  height: 300px;
}
.us-team-members-item {
  width: 270px;
  height: 120px;
  border: 1px solid rgb(196, 196, 196);
  border-radius: 3px;
  margin: 10px;
  padding: 20px;
}
.us-team-members-item:hover {
  background-color: #aeadad;
  color: white;
}
.us-team-members-item-name {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 7px;
}
</style>
