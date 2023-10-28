<template>
  <div class="data-stretch">
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
        <el-input v-model="queryParams.temperature_min" :placeholder="'输入高于' + this.temMin +'摄氏度'"></el-input>
      </el-form-item>
      <el-form-item label="最高温度" prop="temperature_max">
        <el-input v-model="queryParams.temperature_max" :placeholder="'输入低于' + this.temMax +'摄氏度'"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>

      <!-- <el-form-item>
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
        >导出</el-button>
      </el-form-item> -->
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

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange" >
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="数据编号" align="center" prop="postId" /> -->
      <el-table-column label="牌号" align="center" prop="trademark" />
      <el-table-column label="热处理制度" align="center" prop="heatTreatmentSystem" />
      <el-table-column label="温度" align="center" prop="temperature">
      </el-table-column>
      <el-table-column label="屈服强度 /MPa" align="center" prop="yieldStrength" />
      <el-table-column label="抗拉强度 /MPa" align="center" prop="tensileStrength" />
      <el-table-column label="延伸率" align="center" prop="elongation" />
      <el-table-column label="断面收缩率" align="center" prop="sectionShrinkage" />
      <!-- <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <!-- <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-search"
            @click="handleSearch(scope.row)"
            v-hasPermi="['system:post:remove']"
          >查看详情</el-button>

          <el-dialog  center title="查看数据详情" :visible.sync="dialogTableVisible" v-if="dialogTableVisible">
            <el-table :data="oneDataDetail" label-width="110px">
              <el-table-column label="牌号" width="150" align="center" property="trademark"></el-table-column>
              <el-table-column label="热处理制度" align="center" property="heatTreatmentSystem" />
              <el-table-column label="温度" align="center" property="temperature" />
              <el-table-column label="屈服强度" align="center" property="yieldStrength" />
              <el-table-column label="抗拉强度" align="center" property="tensileStrength" />
              <el-table-column label="延伸率" align="center" property="elongation" />
              <el-table-column label="断面收缩率" align="center" property="sectionShrinkage" />
            </el-table>
          </el-dialog>

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
          >删除</el-button>
        </template> -->
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改 拉伸性能.精铸试棒 数据的对话框 -->
    <!-- <el-dialog :title="title" :visible.sync="open" width="500px" label-width="100px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="牌号" prop="brand">
          <el-select v-model="form.brand" clearable @keyup.enter.native="handleQuery" placeholder="请选择牌号">
            <el-option
              v-for="item in brands"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="热处理制度" prop="treatmentSystem">
          <el-select v-model="form.treatmentSystem" placeholder="热处理制度">
            <el-option v-for="item in ProcessingSystems" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="温度" prop="temperature">
          <el-input v-model="form.temperature" placeholder="温度"></el-input>
        </el-form-item>
        <el-form-item label="屈服强度" prop="offsetStress">
          <el-input v-model="form.offsetStress" placeholder="屈服强度"></el-input>
        </el-form-item>
        <el-form-item label="抗拉强度" prop="tensileStrength">
          <el-input v-model="form.tensileStrength" placeholder="抗拉强度"></el-input>
        </el-form-item>
        <el-form-item label="延伸率" prop="elongation">
          <el-input v-model="form.elongation" placeholder="延伸率"></el-input>
        </el-form-item>
        <el-form-item label="断面收缩率" prop="sectionShrinkage">
          <el-input v-model="form.sectionShrinkage" placeholder="断面收缩率"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import { listPost, getPost, delPost, addPost, updatePost } from "@/api/system/post";
import { getListBrands,getListProcessingSystems,searchStretch,getTemMax,getTemMin } from "@/api/database/dataStretch.js";

export default {
  name: "Post",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      brands: [/* 'K213','K214','K2136','K403','K405','K406','K406C','K409','K412','K414','K417','K417G','K417L','K418','K418B','K419','K419H','K420',
          'K423','K423A','K424','K435','K438','K438G','K441','K444','K446','K452','K465','K477','K480','K487','K4002','K4130','K4163','K4169','K4202',
          'K4208','K4222','K4242','K4537','K4648','K4708','K4951','K640','K640S','K644','K6509','K825' */],
        ProcessingSystems:[/* '标准热处理','制度1','制度2','铸态' */],
        temMin:undefined,
        temMax:undefined,
      // 遮罩层
      loading: true,
      //查看单条数据详情
      oneDataDetail:[],
      // 选中数组
      ids: [],
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
      // 数据表格数据
      postList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        //pageNum: 1,
        //pageSize: 10,
        //postId:undefined,
        trademark: undefined,
        treatmentSystem: undefined,
        temperature_min: undefined,
        temperature_max: undefined,
        // offsetStress:undefined,
        // tensileStrength:undefined,
        // elongation:undefined,
        // sectionShrinkage:undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        brand: [
          { required: true, message: "牌号不能为空", trigger: "change" }
        ],
        treatmentSystem: [
          { required: true, message: "热处理制度不能为空", trigger: "change" }
        ],
        temperature: [
          { required: true, message: "温度不能为空", trigger: "blur" }
        ],
        offsetStress: [
          { required: true, message: "屈服强度不能为空", trigger: "blur" }
        ],
        tensileStrength: [
          { required: true, message: "抗拉强度不能为空", trigger: "blur" }
        ],
        elongation: [
          { required: true, message: "延伸率不能为空", trigger: "blur" }
        ],
        sectionShrinkage: [
          { required: true, message: "断面收缩率不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getBrands();
    this.getProcessingSystems();
    getTemMax().then(res => {
      this.temMax = res.data
    })
    getTemMin().then(res => {
      this.temMin = res.data
    })
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
        // console.log(this.ProcessingSystems)
        this.loading = false;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      listPost(this.queryParams).then(response => {
        this.postList = response.rows;
        // console.log(this.postList)
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    // cancel() {
    //   this.open = false;
    //   this.reset();
    // },
    // 表单重置
    // reset() {
    //   this.form = {
    //     postId: undefined,
    //     postCode: undefined,
    //     postName: undefined,
    //     postSort: 0,
    //     status: "0",
    //     remark: undefined
    //   };
    //   this.resetForm("form");
    // },
    /** 搜索按钮操作 */
    handleQuery() {
      //this.queryParams.pageNum = 1;
      this.loading = true;
      searchStretch(this.queryParams).then(response => {
        this.postList = response.data;
        console.log(this.postList)
        //this.total = response.total;
        this.loading = false;
      });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        trademark: undefined,
        treatmentSystem: undefined,
        temperature_min: undefined,
        temperature_max: undefined,
      }
      this.postList = []
      // this.resetForm("queryForm");
      // this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.postId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加 拉伸性能.精铸试棒 数据";
    },
    /* 查看详情按钮操作 */
    handleSearch(row){
      this.dialogTableVisible = true
      // console.log("row:",row)
      this.oneDataDetail[0] = row
      console.log("this.oneDataDetail",this.oneDataDetail)
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const postId = row.postId || this.ids
      getPost(postId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改 拉伸性能.精铸试棒 数据";
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

<style scoped>
.el-input--small .el-input__inner{
  padding-right: 20px;
}
</style>
