<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="牌号" prop="trademark">
        <el-select v-model="queryParams.trademark" clearable @keyup.enter.native="handleQuery" placeholder="请选择牌号">
          <el-option
            v-for="item in brands"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="热处理制度" prop="heat_treatment_system">
        <el-select v-model="queryParams.heat_treatment_system" placeholder="请选择热处理制度">
          <el-option v-for="item in ProcessingSystems" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="最低温度" prop="temperature_min">
        <el-input v-model="queryParams.temperature_min" placeholder="请输入最低温度（摄氏度）"></el-input>
      </el-form-item>
      <el-form-item label="最高温度" prop="temperature_max">
        <el-input v-model="queryParams.temperature_max" placeholder="请输入最高温度（摄氏度）"></el-input>
      </el-form-item>
      <el-form-item label="最低应力" prop="stress_min">
        <el-input v-model="queryParams.stress_min" placeholder="请输入最低应力"></el-input>
      </el-form-item>
      <el-form-item label="最高应力" prop="stress_max">
        <el-input v-model="queryParams.stress_max" placeholder="请输入最高应力"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <!-- <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button> -->
      </el-form-item>

      <el-form-item>
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:post:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:post:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:post:remove']"
        >删除</el-button>
      </el-col>
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="数据编号" align="center" prop="postId" /> -->
      <el-table-column label="牌号" align="center" prop="trademark" />
      <el-table-column label="热处理制度" align="center" prop="heatTreatmentSystem" />
      <el-table-column label="温度" align="center" prop="temperature"/>
      <el-table-column label="应力" align="center" prop="stress"/>
      <!-- <el-table-column label="τ/h_min" align="center" prop="h_min"/>
      <el-table-column label="τ/h_max" align="center" prop="h_max"/>
      <el-table-column label="延伸率" align="center" prop="elongation"/>
      <el-table-column label="断面收缩率" align="center" prop="sectionShrinkage"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"> -->
        <!-- <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">

          <el-button
            size="mini"
            type="text"
            icon="el-icon-search"
            @click="handleSearch(scope.row)"
            v-hasPermi="['system:post:remove']"
          >查看详情</el-button>

          <el-dialog title="查看数据详情" :visible.sync="dialogTableVisible" v-if="dialogTableVisible">
            <el-table :data="oneDataDetail" label-width="110px">
              <el-table-column label="牌号" width="150" align="center" property="trademark"></el-table-column>
              <el-table-column label="热处理制度" align="center" property="heatTreatmentSystem" />
              <el-table-column label="温度" align="center" property="temperature" />
              <el-table-column label="应力" align="center" prop="stress"/>
              <el-table-column label="τ/h_min" align="center" prop="τ_min" />
              <el-table-column label="τ/h_max" align="center" prop="τ_max" />
              <el-table-column label="延伸率" align="center" prop="elongation" />
              <el-table-column label="断面收缩率" align="center" prop="sectionShrinkage" />
            </el-table>
          </el-dialog>
<!--
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:post:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:post:remove']"
          >删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改岗位对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="牌号" prop="brand">
          <el-select v-model="queryParams.brand" clearable @keyup.enter.native="handleQuery" placeholder="请选择牌号">
            <el-option
              v-for="item in brands"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="热处理制度" prop="heat_treatment_system">
          <el-select v-model="queryParams.heat_treatment_system" placeholder="热处理制度">
            <el-option v-for="item in ProcessingSystems" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="温度" prop="temperature">
          <el-input v-model="queryParams.temperature" placeholder="请输入温度"></el-input>
        </el-form-item>
        <el-form-item label="应力" prop="stress">
          <el-input v-model="queryParams.time" placeholder="请输入时间"></el-input>
        </el-form-item>
        <el-form-item label="τ/h_min" prop="h_min">
          <el-input v-model="queryParams.h_min" placeholder="请输入τ/h_min"></el-input>
        </el-form-item>
        <el-form-item label="τ/h_max" prop="h_max">
          <el-input v-model="queryParams.h_max" placeholder="请输入τ/h_max"></el-input>
        </el-form-item>
        <el-form-item label="延伸率" prop="elongation">
          <el-input v-model="queryParams.elongation" placeholder="请输入延伸率"></el-input>
        </el-form-item>
        <el-form-item label="断面收缩率" prop="sectionShrinkage">
          <el-input v-model="queryParams.sectionShrinkage" placeholder="请输入断面收缩率"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPost, getPost, delPost, addPost, updatePost } from "@/api/system/post";
import { getListBrands,getListProcessingSystems,searchPropertie} from '@/api/database/dataPropertie.js'

export default {
  name: "Post",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      brands:[],
      ProcessingSystems:[],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
       //查看单条数据详情
      oneDataDetail:[],
      //嵌套表格的 Dialog
      dialogTableVisible:false,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 岗位表格数据
      postList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        // pageNum: 1,
        // pageSize: 10,
        // postId:undefined,
        trademark: undefined,
        treatmentSystem: undefined,
        temperature_min: undefined,
        temperature_max: undefined,
        stress_min:undefined,
        stress_max:undefined,
        // h_min:undefined,
        // h_max:undefined,
        // elongation:undefined,
        // sectionShrinkage:undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        postName: [
          { required: true, message: "岗位名称不能为空", trigger: "blur" }
        ],
        postCode: [
          { required: true, message: "岗位编码不能为空", trigger: "blur" }
        ],
        postSort: [
          { required: true, message: "岗位顺序不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getBrands();
    this.getProcessingSystems();
  },
  methods: {
    /** 查询牌号列表 */
    getBrands() {
      this.loading = true;
      getListBrands().then(response => {
        this.brands = response.data;
        //console.log(this.brands)
        this.loading = false;
      });
    },
    /** 查询热处理制度列表 */
    getProcessingSystems() {
      this.loading = true;
      getListProcessingSystems().then(response => {
        this.ProcessingSystems = response.data;
        //console.log(this.ProcessingSystems)
        this.loading = false;
      });
    },
    /** 查询岗位列表 */
    getList() {
      this.loading = true;
      listPost(this.queryParams).then(response => {
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
    reset() {
      this.form = {
        postId: undefined,
        postCode: undefined,
        postName: undefined,
        postSort: 0,
        status: "0",
        remark: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.loading = true;
      searchPropertie(this.queryParams).then(response => {
        this.postList = response.data;
        //this.total = response.total;
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
      this.ids = selection.map(item => item.postId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /* 查看详情按钮操作 */
    handleSearch(row){
      this.dialogTableVisible = true
      console.log("row:",row)
      this.oneDataDetail[0] = row
      console.log("this.oneDataDetail",this.oneDataDetail)
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加数据";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const postId = row.postId || this.ids
      getPost(postId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.postId != undefined) {
            updatePost(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPost(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const postIds = row.postId || this.ids;
      this.$modal.confirm('是否确认删除数据编号为"' + postIds + '"的数据项？').then(function() {
        return delPost(postIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/post/export', {
        ...this.queryParams
      }, `post_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style>
.el-input--small .el-input__inner{
  padding-right: 20px;
}
</style>
