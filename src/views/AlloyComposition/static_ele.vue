<template>
  <div class="ac-static_ele">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">

      <el-form-item label="W/Z" prop="wz">
        <el-select v-model="queryParams.wz" clearable @keyup.enter.native="handleQuery" placeholder="请选择">
          <el-option v-for="item in choose1" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="工艺" prop="craft">
        <el-select v-model="queryParams.craft" clearable @keyup.enter.native="handleQuery" placeholder="请选择工艺">
          <el-option v-for="item in crafts" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Design" prop="design">
        <el-select v-model="queryParams.design" clearable @keyup.enter.native="handleQuery" placeholder="请选择Design">
          <el-option v-for="item in designs" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="数据类型" prop="type">
        <el-select v-model="queryParams.type" clearable @keyup.enter.native="handleQuery" placeholder="请选择查询类型">
          <el-option v-for="item in types" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <!-- <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button> -->
      </el-form-item>

    </el-form>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <!-- <el-table-column
        type="selection"
        width="55"
        align="center"
      /> -->
      <el-table-column label="Al" align="center" prop="Al" />
      <el-table-column label="Ti" align="center" prop="Ti" />
      <el-table-column label="Cr" align="center" prop="Cr" />
      <el-table-column label="Co" align="center" prop="Co" />
      <el-table-column label="Ni" align="center" prop="Ni" />
      <el-table-column label="Nb" align="center" prop="Nb" />
      <el-table-column label="Mo" align="center" prop="Mo" />
      <el-table-column label="Ta" align="center" prop="Ta" />
      <el-table-column label="W" align="center" prop="W" />


    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

  </div>
</template>

<script>
import { listPost } from "@/api/system/post";
import { getacStatic_ele } from "@/api/database/AlloyComposition.js";

export default {
  // name: "Post",
  dicts: ["sys_normal_disable"],
  data() {
    return {
      choose1: ["单晶", "粉末"],
      crafts: ["STD", "800", "900", "1000", "1100"],
      shows: ['Al', 'Ti', 'Cr', 'Co', 'Ni', 'Nb', 'Mo', 'Hf', 'Ta', 'W'],
      designs: [
        "123",
        "125",
        "126",
        "134",
        "136",
        "142",
        "147",
        "164",
        "167",
        "172",
        "173",
      ],
      types: [
        "mean",
        "std",
        "min",
        "Q1",
        "Q2",
        "Q3",
        "max",
        "range",
        "COV",
        "Q31",
        "up",
        "down",
      ],
      //嵌套表格的 Dialog
      dialogTableVisible: false,
      oneDataDetail: [],
      // 遮罩层
      loading: true,
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
      // 表格数据
      postList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        wz: "粉末",
        craft: undefined,
        design: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    this.loading = false;
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      listPost(this.queryParams).then((response) => {
        this.postList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    // reset() {
    //   this.form = {
    //     postId: undefined,
    //     postCode: undefined,
    //     postName: undefined,
    //     postSort: 0,
    //     status: "0",
    //     remark: undefined,
    //   };
    //   this.resetForm("form");
    // },
    /** 搜索按钮操作 */
    handleQuery() {
      let num = this.queryParams.design;
      this.loading = true;
      if (this.queryParams.wz === "粉末") {
        if (this.queryParams.craft === "STD") {
          var str1 = "W" + "_" + this.queryParams.craft + "_" + num + "_" + "static_ele";
        } else {
          var str1 = "W" + this.queryParams.craft + "_" + num + "_" + "static_ele";
        }
      } else if (this.queryParams.wz === "单晶") {
        if (this.queryParams.craft === "STD") {
          var str1 = "Z" + "_" + this.queryParams.craft + "_" + num + "_" + "static_ele";
        } else {
          var str1 = "Z" + this.queryParams.craft + "_" + num + "_" + "static_ele";
        }
      }
      getacStatic_ele({
        tablename: str1,
        attribute: this.queryParams.type
      }
      ).then((response) => {
        this.postList = [response.data];
        console.log(this.postList)
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

  },
};
</script>

<style scoped>
.el-input--small .el-input__inner {
  padding-right: 20px;
}
</style>
