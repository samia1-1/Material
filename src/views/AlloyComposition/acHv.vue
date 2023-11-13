<template>
  <div class="ac-hv">
    <div class="ac-choose">
      <el-form
        :model="queryParams"
        ref="queryForm"
        size="small"
        :inline="true"
        v-show="showSearch"
        label-width="100px"
      >

        <el-form-item
          label="单晶/粉末"
          prop="wz"
        >
          <el-select
            v-model="queryParams.wz"
            clearable
            @keyup.enter.native="handleQuery"
            placeholder="请选择"
          >
            <el-option
              v-for="item in choose1"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          label="工艺"
          prop="craft"
        >
          <el-select
            v-model="queryParams.craft"
            clearable
            @keyup.enter.native="handleQuery"
            placeholder="请选择工艺"
          >
            <el-option
              v-for="item in crafts"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item><br>

        <el-form-item
          label="Design"
          prop="craft"
        >
          <wz-design
            :wz="this.queryParams.wz"
            :Design="this.Design"
            :deleteDesignItem="this.deleteDesignItem"
            :addDesignItem="this.addDesignItem"
            ref="wzDesign"
          ></wz-design>
        </el-form-item>

        <div class="prompt-area">

          <div class="prompt-info-tit">建议值区间：</div>

          <div
            class="show-item"
            v-if="promptList.length !== 0"
          >
            <div
              class="prompt-item"
              v-for="(item,index) in promptList"
              :key="index"
            >
              <span class="prompt-item-name">{{item.name}}: </span>
              <span class="prompt-item-num"> {{item.min}} ~ {{item.max}}</span>
            </div>
          </div>

          <div
            class="prompt-info"
            v-else
          >
            请先选择想要查询的金属区块
          </div>

        </div>

        <br>

        <el-form-item
          label="Al"
          prop="Al"
        >
          <el-input
            v-model="queryParams.Al"
            placeholder="请输入铝"
            onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="Ti"
          prop="Ti"
        >
          <el-input
            v-model="queryParams.Ti"
            placeholder="请输入钛"
            onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="Cr"
          prop="Cr"
        >
          <el-input
            v-model="queryParams.Cr"
            placeholder="请输入铬"
            onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="Co"
          prop="Co"
        >
          <el-input
            v-model="queryParams.Co"
            placeholder="请输入钴"
            onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="Ni"
          prop="Ni"
        >
          <el-input
            v-model="queryParams.Ni"
            placeholder="请输入镍"
            onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="Nb"
          prop="Nb"
        >
          <el-input
            v-model="queryParams.Nb"
            placeholder="请输入铌"
            onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="Mo"
          prop="Mo"
        >
          <el-input
            v-model="queryParams.Mo"
            placeholder="请输入钼"
            onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="Hf"
          prop="Hf"
        >
          <el-input
            v-model="queryParams.Hf"
            placeholder="请输入铪"
            onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="Ta"
          prop="Ta"
        >
          <el-input
            v-model="queryParams.Ta"
            placeholder="请输入钽"
            onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="W"
          prop="W"
        >
          <el-input
            v-model="queryParams.W"
            placeholder="请输入钨"
            onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="handleQuery"
          >搜索</el-button>
          <el-button
            type="primary"
            icon="el-icon-refresh"
            size="mini"
            @click="resetQuery"
          >清空</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-row
      :gutter="10"
      class="mb8"
    >
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
        >导出</el-button>
      </el-col> -->
      <!-- <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar> -->
    </el-row>

    <el-table
      v-loading="loading"
      :data="postList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
      />
      <el-table-column
        label="维氏硬度"
        align="center"
        prop="hv"
      />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
//handleExport
import { listPost } from "@/api/system/post";
import {
  getAlloyComposition,
  getSelectLimit,
  getImage_url,
} from "@/api/database/AlloyComposition.js";
import WzDesign from "./Design/wzDesign.vue";

export default {
  dicts: ["sys_normal_disable"],
  components: {
    WzDesign,
  },
  data() {
    return {
      promptList: [],
      choose1: ["单晶", "粉末"],
      crafts: ["STD", "800", "900", "1000", "1100"],
      //嵌套表格的 Dialog
      dialogTableVisible: false,
      oneDataDetail: [],
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 查询得到的表格数据
      postList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        Al: undefined,
        Ti: undefined,
        Cr: undefined,
        Co: undefined,
        Ni: undefined,
        Nb: undefined,
        Mo: undefined,
        Hf: 0,
        Ta: undefined,
        W: undefined,
        wz: undefined,
        craft: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      Design: "",
    };
  },
  mounted() {
    this.arr = this.$refs.wzDesign.Design;
  },
  watch: {
    Design: {
      handler(newValue) {
        if (newValue !== "") {
          // console.log(newValue[0])
          this.handlePromptInfo(newValue);
        }
      },
    },
  },
  methods: {
    deleteDesignItem() {
      this.Design = "";
    },
    addDesignItem(value) {
      this.Design = value;
    },
    handlePromptInfo(value) {
      //先检查选择是否完整
      if (this.queryParams.wz !== "粉末" && this.queryParams.wz !== "单晶") {
        this.$message({
          message: "请选择单晶或粉末",
          type: "warning",
        });
        this.resetQuery();
        return;
      }
      if (!this.queryParams.craft) {
        this.$message({
          message: "工艺不能为空",
          type: "warning",
        });
        this.resetQuery();
        return;
      }
      //请求预测范围数据
      let num = value.replace(/[^0-9]/gi, "");
      if (this.queryParams.wz === "粉末") {
        if (this.queryParams.craft === "STD") {
          var str1 = "W" + "_" + this.queryParams.craft + "_" + num + "_ele";
        } else {
          var str1 = "W" + this.queryParams.craft + "_" + num + "_ele";
        }
      } else if (this.queryParams.wz === "单晶") {
        if (this.queryParams.craft === "STD") {
          var str1 = "Z" + "_" + this.queryParams.craft + "_" + num + "_ele";
        } else {
          var str1 = "Z" + this.queryParams.craft + "_" + num + "_ele";
        }
      }
      getSelectLimit({
        tablename: str1,
      })
        .then((res) => {
          if (res.msg === "数据库不存在此表") {
            this.$message({
              message: "数据库不存在此表，请查询其他内容！",
              type: "warning",
            });
            this.resetQuery();
            return;
          }
          if (res.data) this.promptList = res.data;
          else return;
          const chemicals = [
            "Al",
            "Ti",
            "Cr",
            "Co",
            "Ni",
            "Nb",
            "Mo",
            "Hf",
            "Ta",
            "W",
          ];
          var numm = 0;
          this.promptList.forEach((element) => {
            let name = chemicals[numm];
            this.queryParams[name] = (element.max + element.min) / 2;
            this.queryParams[name] = parseFloat(
              this.queryParams[name].toFixed(3)
            );
            numm++;
          });
          this.$message({
            message: "已为您自动填充平均值",
            type: "success",
          });
        })
        .catch((error) => {
          this.$message({
            message: error,
            type: "error",
          });
        });
      // 弹出图片窗口
      // const newPage = window.open("/#/alloycomposition/piclist", "_blank");
      // const data = {
      //   wz: this.queryParams.wz,
      //   craft: this.queryParams.craft,
      //   design: num,
      // };
      // // 使用postMessage方法向新窗口发送数据
      // window.setTimeout(function(){
      //   newPage.postMessage(data, "http://localhost:8100/#/alloycomposition/piclist");
      // },1000)
    },
    // chooseCraft() {
    //   if (this.queryForm.wz === undefined) {
    //     console.log("yes");
    //     this.$message({
    //       message: "请先选择W/Z!",
    //       type: "warning",
    //     });
    //   }
    // },

    /** 搜索按钮操作 */
    handleQuery() {
      this.loading = true;
      let num = this.Design.replace(/[^0-9]/gi, "");
      if (this.queryParams.wz === "粉末") {
        if (this.queryParams.craft === "STD") {
          var str1 = "W" + "_" + this.queryParams.craft + "_" + num + "_ele";
          var str2 =
            "W" + "_" + this.queryParams.craft + "_" + num + "_hardness";
        } else {
          var str1 = "W" + this.queryParams.craft + "_" + num + "_ele";
          var str2 = "W" + this.queryParams.craft + "_" + num + "_hardness";
        }
      } else if (this.queryParams.wz === "单晶") {
        if (this.queryParams.craft === "STD") {
          var str1 = "Z" + "_" + this.queryParams.craft + "_" + num + "_ele";
          var str2 =
            "Z" + "_" + this.queryParams.craft + "_" + num + "_hardness";
        } else {
          var str1 = "Z" + this.queryParams.craft + "_" + num + "_ele";
          var str2 = "Z" + this.queryParams.craft + "_" + num + "_hardness";
        }
      }
      getAlloyComposition({
        table_name1: str1,
        table_name2: str2,
        Al: this.queryParams.Al,
        Ti: this.queryParams.Ti,
        Cr: this.queryParams.Cr,
        Co: this.queryParams.Co,
        Ni: this.queryParams.Ni,
        Nb: this.queryParams.Nb,
        Mo: this.queryParams.Mo,
        Hf: this.queryParams.Hf,
        Ta: this.queryParams.Ta,
        W: this.queryParams.W,
      })
        .then((response) => {
          if (response.msg === "抱歉,未查询到相关维氏硬度信息;") {
            this.$message({
              message: "Sorry，数据库没有查到该数据，请查询其他数据",
              type: "warning",
            });
          } else {
            this.postList.push({ hv: response.msg });
          }
          this.loading = false;
          getImage_url(
            {
              table_name1: str1,
              table_name2: str2,
              Al: this.queryParams.Al,
              Ti: this.queryParams.Ti,
              Cr: this.queryParams.Cr,
              Co: this.queryParams.Co,
              Ni: this.queryParams.Ni,
              Nb: this.queryParams.Nb,
              Mo: this.queryParams.Mo,
              Hf: this.queryParams.Hf,
              Ta: this.queryParams.Ta,
              W: this.queryParams.W,
            },
            { HD_SE: "SE" }
          )
            .then((res) => {
              //弹出图片详情窗口
              this.openWiindowImage(res.data.url);
            })
            .catch((err) => console.log(err));
        })
        .catch((error) => {
          console.log(error);
          this.loading = false;
        });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.wzDesign.clickPoint("");
      this.promptList = [];
      this.Design = "";
      this.queryParams = {
        Al: undefined,
        Ti: undefined,
        Cr: undefined,
        Co: undefined,
        Ni: undefined,
        Nb: undefined,
        Mo: undefined,
        Hf: 0,
        Ta: undefined,
        W: undefined,
        wz: undefined,
        craft: undefined,
      };
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.postId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    //查询列表
    getList() {
      this.loading = true;
      listPost(this.queryParams).then((response) => {
        this.postList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /* 查看详情按钮操作 */
    handleSearch(row) {
      this.dialogTableVisible = true;
      this.oneDataDetail[0] = row;
      console.log("this.oneDataDetail", this.oneDataDetail);
    },
    /* 弹出图片详情窗口 */
    openWiindowImage(url) {
      const newPage = window.open("/#/alloycomposition/pic_detail", "_blank");
      const data = { img_src: url };
      // 使用postMessage方法向新窗口发送数据
      window.setTimeout(function () {
        newPage.postMessage(
          data,
          "http://localhost:8100/#/alloycomposition/pic_detail"
        );
      }, 1000);
    },
  },
};
</script>

<style scoped>
.design1 .row {
  width: 500px;
  height: 50px;
  border-bottom: 0;
  cursor: pointer;
}
.ac-choose {
  position: relative;
}
.prompt-area {
  padding: 5px;
  width: 550px;
  height: 300px;
  border: 3px grey dashed;
  position: absolute;
  top: 0px;
  right: 40px;
  border-radius: 10px;
  box-shadow: 5px 5px 5px 5px rgb(227, 227, 227);
}
.prompt-info-tit {
  height: 20px;
  line-height: 20px;
  font-size: 18px;
  padding-left: 10px;
  margin: 10px;
}
.prompt-info {
  text-align: center;
  height: 220px;
  line-height: 230px;
  font-size: 22px;
  color: grey;
}
.show-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 540px;
  margin: 10px 0 0 0;
}
.prompt-item {
  width: 150px;
  height: 40px;
  line-height: 40px;
  border-bottom: 2px solid rgb(212, 212, 212);
  margin: 10px 10px;
  font-size: 16px;
}
.prompt-item-name {
  color: grey;
}
.prompt-item-num {
  color: rgb(114, 166, 255);
}
</style>
