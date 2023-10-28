<template>
  <div class="home-intro">
    <div class="part-1 part">
      <div class="part1-tit tit">
        铸造高温合金“成分-工艺-性能”数据库
      </div>
      <div class="part1-in">
        <img
          class="part-img-1"
          src="@/assets/images/home-part3-1.jpg"
        >
        <div class="part1-text">
          <div class="part1-text-tit">大量可靠数据</div>
          <div class="part1-text-intro">实验室前期收集了《中国高温合金手册》和中南大学粉末冶金国家重点实验室的实验数据(中国金属学会高温材料分会2012)。主要包含铸造高温合金成分数据、拉伸性能数据、蠕变性能数据和持久性能数据。</div>
        </div>
      </div>
    </div>

    <div class="part-2 part">

      <div class="part2-tit tit">高通量镍基粉末高温合金“成分-工艺-组织-性能”数据库</div>

      <div class="part2-in">

        <div class="part2-text">
          <div class="part2-text-tit">提供量化数据</div>
          <div class="part2-text-intro">实验室开发多元合金扩散节技术，利用多台微区表征设备测定成分（Micro-XRF）、微观组织（LargeArea-SEM）、性能（Micro-Hardness）数据，并建立对应关系，形成了镍基高温合金材料数据库。结合深度学习算法提取微观组织的形态学参数，为后续研究提供量化数据。</div>
        </div>

        <img
          class="part-img-2"
          src="@/assets/images/home-part3-2.jpg"
        >

      </div>

    </div>
    <!-- <div class="part-3 part">
      <div class="part3-tit tit">数据库的成分范围</div>
    </div> -->
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.home-intro {
  width: 1200px;
}
.part {
  background-image: linear-gradient(to bottom, #f6f8fa, #ffffff);
  height: 420px;
}
.tit {
  width: 960px;
  height: 60px;
  margin: 0 auto;
  font-size: 24px;
  color: black;
  text-align: center;
  line-height: 60px;
  border-bottom: 1px solid #6b7b80;
}
.part1-in {
  width: 900px;
  margin: 0 auto;
  position: relative;
}
.part-img-1 {
  width: 300px;
  margin: 20px 50px 20px 0;
}
.part1-text {
  width: 540px;
  position: absolute;
  right: 0;
  top: 20%;
}
.part1-text-tit {
  font-size: 22px;
  border-bottom: 1px solid #000;
  height: 50px;
  line-height: 50px;
  text-align: center;
}
.part1-text-intro {
  font-size: 16px;
  margin-top: 30px;
}
.part-img-2 {
  height: 300px;
  margin: 20px 0 20px 50px;
  position: absolute;
  right: 0;
}
.part2-in {
  width: 900px;
  margin: 0 auto;
  position: relative;
  height: calc(100% - 60px);
}

.part2-text {
  width: 350px;
  position: absolute;
  left: 0;
  top: 17%;
}
.part2-text-tit {
  font-size: 22px;
  border-bottom: 1px solid #000;
  height: 50px;
  line-height: 50px;
  text-align: center;
}
.part2-text-intro {
  font-size: 16px;
  margin-top: 30px;
}
</style>
