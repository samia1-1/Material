<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >

      <el-form-item
        label="W/Z"
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
          ref="wzDesign"
        ></wz-design>
      </el-form-item><br>

      <el-form-item
        label="Al"
        prop="Al"
      >
        <el-input
          v-model="queryParams.Al"
          placeholder="请输入铝"
          type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Ti"
        prop="Ti"
      >
        <el-input
          v-model="queryParams.Ti"
          placeholder="请输入钛"
          type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Cr"
        prop="Cr"
      >
        <el-input
          v-model="queryParams.Cr"
          placeholder="请输入铬"
          type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Co"
        prop="Co"
      >
        <el-input
          v-model="queryParams.Co"
          placeholder="请输入钴"
          type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Ni"
        prop="Ni"
      >
        <el-input
          v-model="queryParams.Ni"
          placeholder="请输入镍"
          type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Nb"
        prop="Nb"
      >
        <el-input
          v-model="queryParams.Nb"
          placeholder="请输入铌"
          type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Mo"
        prop="Mo"
      >
        <el-input
          v-model="queryParams.Mo"
          placeholder="请输入钼"
          type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Hf"
        prop="Hf"
      >
        <el-input
          v-model="queryParams.Hf"
          placeholder="请输入铪"
          type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Ta"
        prop="Ta"
      >
        <el-input
          v-model="queryParams.Ta"
          placeholder="请输入钽"
          type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="W"
        prop="W"
      >
        <el-input
          v-model="queryParams.W"
          placeholder="请输入钨"
          type="text" onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,3})?).*$/g, '$1')"
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
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-row
      :gutter="10"
      class="mb8"
    >
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
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
import {
  listPost,
  getPost,
  delPost,
  addPost,
  updatePost,
} from "@/api/system/post";
import { getAlloyComposition } from "@/api/database/AlloyComposition.js";
import WzDesign from "../AlloyComposition/Design/wzDesign.vue";

export default {
  // name: "Post",
  dicts: ["sys_normal_disable"],
  components: {
    WzDesign,
  },
  data() {
    return {
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
        // pageNum: 1,
        // pageSize: 10,
        // postId:undefined,Al" prop="Al">
        Al: undefined,
        Ti: undefined,
        Cr: undefined,
        Co: undefined,
        Ni: undefined,
        Nb: undefined,
        Mo: undefined,
        Hf: undefined,
        Ta: undefined,
        W: undefined,
        wz: "粉末",
        craft: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    this.$message({
      message:"合金成分查询性能功能出现了一点小问题，正在维护中......",
      type:"warning"
    })
    this.$router.replace('/datasearch')
  },
  methods: {
    chooseCraft() {
      if (this.queryForm.wz === undefined) {
        console.log("yes");
        this.$message({
          message: "请先选择W/Z!",
          type: "warning",
        });
      }
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        postId: undefined,
        postCode: undefined,
        postName: undefined,
        postSort: 0,
        status: "0",
        remark: undefined,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.loading = true;
      let arr = this.$refs.wzDesign.Design;
      let num = "";
      arr.forEach(element => {
        num = element.replace(/[^0-9]/ig,"")
      });
      if (this.queryParams.wz === "粉末") {
        if (this.queryParams.craft === "STD") {
          var str1 = "W" + "_" + this.queryParams.craft + "_" + num + "_ele";
          var str2 = "W" + "_" + this.queryParams.craft + "_" + num +  "_hardness";
        } else {
          var str1 = "W" + this.queryParams.craft + "_" + num +  "_ele";
          var str2 = "W" + this.queryParams.craft + "_" + num +  "_hardness";
        }
      }else if(this.queryParams.wz === "单晶"){
        if (this.queryParams.craft === "STD") {
          var str1 = "Z" + "_" + this.queryParams.craft + "_" + num +  "_ele";
          var str2 = "Z" + "_" + this.queryParams.craft + "_" + num +  "_hardness";
        } else {
          var str1 = "Z" + this.queryParams.craft + "_" + num +  "_ele";
          var str2 = "Z" + this.queryParams.craft + "_" + num +  "_hardness";
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
      }).then((response) => {
        if(response.msg === null){
          this.$message({
            message: "Sorry，数据库没有查到该数据，请查询其他数据",
            type: "warning",
          })
          return ;
        }
        this.postList.push({hv:response.msg});
        this.loading = false;
      });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
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
      // console.log("row:",row)
      this.oneDataDetail[0] = row;
      console.log("this.oneDataDetail", this.oneDataDetail);
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "system/post/export",
        {
          ...this.queryParams,
        },
        `post_${new Date().getTime()}.xlsx`
      );
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
</style>
