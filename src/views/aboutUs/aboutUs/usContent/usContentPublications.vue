<template>
  <div class="us-cont-publications">
    <div class="us-cont-publications-tit">论文</div>
    <div class="us-publications-list">

      <div
        layout="prev, pager, next"
        class="us-publications-item"
        v-for="(item,index) in this.usPublicationsListNow"
        :key="index"
      >
        <a
          target="=_blank"
          :href="item.href"
        >{{item.name}}</a>
      </div>

    </div>

    <div class="us-block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        layout="prev, pager, next"
        :total="total"
      >
      </el-pagination>
    </div>

  </div>
</template>

<script>
export default {
  created() {
    if (this.queryInfo.pagenum === 1) {
      this.usPublicationsListNow = this.usPublicationsList1;
    } else {
      this.usPublicationsListNow = this.usPublicationsList2;
    }
  },
  data() {
    return {
      usPublicationsList1: [
        {
          href: "https://www.sciencedirect.com/science/article/pii/S2352492820306127",
          name: "High-throughput determination of interdiffusivity matrices in Ni-Al-Ti-Cr-Co-Mo-Ta-W multicomponent superalloys and their application in optimization of creep resistance",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S2238785422015708",
          name: "High-throughput characterization methods for Ni-based superalloys and phase prediction via deep learning",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S2352492822000496",
          name: "Design of NiCoCrAl eutectic high entropy alloys by combining machine learning with CALPHAD method",
        },
        {
          href: "https://www.x-mol.com/paper/1336473241433268224",
          name: "Additively manufactured oxide dispersion strengthened nickel-based superalloy with superior high temperature properties",
        },
        {
          href: "https://www.semanticscholar.org/paper/Phase-prediction-of-Ni-base-superalloys-via-and-Qin-Wang/e91b7a7a09389b7102ef702751ed426041ec530b",
          name: "Phase prediction of Ni-base superalloys via high-throughput experiments and machine learning",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S0264127517305889",
          name: "Effects of strain amount and strain rate on grain structure of a novel high Co nickel-based polycrystalline superalloy",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S1005030219301458",
          name: "Superplastic behavior of a powder metallurgy superalloy during isothermal compression",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S1359646219306748",
          name: "High throughput experiment assisted discovery of new Ni-base superalloys",
        },
      ],
      usPublicationsList2: [
        {
          href: "https://www.sciencedirect.com/science/article/pii/S0924013618302863",
          name: "Flow behaviors and microstructural evolutions of a novel high-Co powder metallurgy superalloy during hot working",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S0924013618302863",
          name: "Strengthening the bimodal-grained powder metallurgy ferritic steels with Cu addition by aging hardening",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S0925838821002723",
          name: "Creep behaviors of fine-grained Ni-base powder metallurgy superalloys at elevated temperatures",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S092583881933628X",
          name: "Mechanism of grain refinement in an equiatomic medium-entropy alloy CrCoNi during hot deformation",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S0925838819324892",
          name: "Tensile properties of three newly developed Ni-base powder metallurgy superalloys",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S0020740321002290",
          name: "Evolution of residual stress and its impact on Ni-based superalloy",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S1044580318326421",
          name: "Optimized hot workability of a powder metallurgy nickel-base superalloy",
        },
        {
          href: "https://www.sciencedirect.com/science/article/pii/S1044580318306594",
          name: "The evolution history of superalloy powders during hot consolidation and plastic deformation",
        },
      ],
      usPublicationsListNow: [],
      // 总条数
      total: 16,
      //参数
      queryInfo: {
        // 当前页数
        pagenum: 1,
        // 显示一页多少条数据
        pagesize: 8,
      },
    };
  },
  methods: {
    handleSizeChange(newsize) {
      //最新的条数（newsize）赋值给 动态的 pagesie
      this.queryInfo.pagesize = newsize;
      if (this.queryInfo.pagenum === 1) {
        this.usPublicationsListNow = this.usPublicationsList1;
      } else {
        this.usPublicationsListNow = this.usPublicationsList2;
      }
    },

    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      if (this.queryInfo.pagenum === 1) {
        this.usPublicationsListNow = this.usPublicationsList1;
      } else {
        this.usPublicationsListNow = this.usPublicationsList2;
      }
    },
  },
  watch: {
    usPublicationsListNow: {
      handler(val, oldVal) {},
    },
  },
};
</script>

<style>
.us-cont-publications-tit {
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
.us-publications-list {
  width: 900px;
  margin: 0 auto;
}
.us-publications-list .us-publications-item {
  height: 80px;
  border-bottom: 1px solid rgb(204, 204, 204);
  padding: 30px 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.us-publications-list .us-publications-item a {
  font-size: 16px;
}
.us-publications-list .us-publications-item a:hover {
  color: rgb(103, 52, 232);
}

.us-block {
  position: absolute;
  margin: 10px;
  left: 40%;
}
.us-publications-item a:before {
  content: "";
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 10px; /**控制形状**/
  background-color: rgb(47, 27, 99); /**控制图标颜色**/
  position: absolute;
}
.us-publications-item a{
  padding: 0 0 0 25px;
  line-height: 14px;
}
</style>
