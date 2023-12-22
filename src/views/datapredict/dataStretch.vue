<template>
  <div class="data-show">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="5vw">
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
        <el-select v-model="queryParams.heat_treatment_system" placeholder="热处理制度">
          <el-option v-for="item in ProcessingSystems" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="预测温度" prop="temperature">
        <el-input v-model="queryParams.temperature" placeholder="预测温度"></el-input>
      </el-form-item>

      <el-form-item label="算法类型" prop="algorithms">
        <el-select v-model="queryParams.algorithms" clearable @keyup.enter.native="handleQuery" placeholder="请选择算法类型">
          <el-option
            v-for="item in algorithms"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange" >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="牌号" align="center" prop="trademark" />
      <el-table-column label="热处理制度" align="center" prop="heatTreatmentSystem" />
      <el-table-column label="温度" align="center" prop="temperature"></el-table-column>
      <el-table-column label="屈服强度" align="center" property="yieldStrength" />
      <el-table-column label="抗拉强度" align="center" property="tensileStrength" />
      <el-table-column label="延伸率" align="center" property="elongation" />
      <el-table-column label="断面收缩率" align="center" property="sectionShrinkage" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <!-- <template slot-scope="scope">
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
              <el-table-column label="屈服强度" align="center" property="yieldStrength" />
              <el-table-column label="抗拉强度" align="center" property="tensileStrength" />
              <el-table-column label="延伸率" align="center" property="elongation" />
              <el-table-column label="断面收缩率" align="center" property="sectionShrinkage" />
            </el-table>
          </el-dialog>
        </template> -->
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { listPost, getPost, delPost, addPost, updatePost } from "@/api/system/post";
import { getListBrands,predictStretch  } from "@/api/database/dataStretch.js";

export default {
  name: "Post",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      algorithms:['RandomForestRegressor','XGBRegressor','GradientBoostingRegressor','LGBMRegressor'],
      brands: [/* 'K213','K214','K2136','K403','K405','K406','K406C','K409','K412','K414','K417','K417G','K417L','K418','K418B','K419','K419H','K420',
          'K423','K423A','K424','K435','K438','K438G','K441','K444','K446','K452','K465','K477','K480','K487','K4002','K4130','K4163','K4169','K4202',
          'K4208','K4222','K4242','K4537','K4648','K4708','K4951','K640','K640S','K644','K6509','K825' */],
        ProcessingSystems:[ '标准热处理','铸态' ],
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
      postList: [
        {
          temperature:undefined,
          algorithms:undefined,
          yieldStrength:undefined,
          tensileStrength:undefined,
          elongation:undefined,
          sectionShrinkage:undefined,
        }
      ],
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
        temperature: undefined,
        algorithms: undefined,
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
  mounted(){
    //判断目前是否有数据
    this.checkData()
  },
  created() {
    this.getBrands();
  },
  methods: {
    //判断目前是否有数据
    checkData(){
      // if(this.postList.temperature === undefined){
      //   Vue.set(this.postList,'temperature','请查询')
      //   this.$forceUpdate()
      //     // algorithms:undefined,
      //     // yieldStrength:undefined,
      //     // tensileStrength:undefined,
      //     // elongation:undefined,
      //     // sectionShrinkage:undefined,
      // }
      // console.log(this.postList.temperature)
    },
    /** 查询牌号列表 */
    getBrands() {
      this.loading = true;
      getListBrands().then(response => {
        this.brands = response.data;
        //console.log(this.brands)
        this.loading = false;
      });
    },
    /** 查询列表 */
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
      this.loading = true;
      this.queryParams.temperature = this.queryParams.temperature.toString()
      this.queryParams.algorithms = this.queryParams.algorithms.toString()
      predictStretch(this.queryParams).then(response => {
        this.postList[0].trademark = this.queryParams.trademark;
        this.postList[0].heatTreatmentSystem = this.queryParams.heat_treatment_system ;
        this.postList[0].temperature = this.queryParams.temperature;
        this.postList[0].algorithms = this.queryParams.algorithms;
        this.postList[0].yieldStrength = response.data[0];
        this.postList[0].tensileStrength = response.data[1];
        this.postList[0].elongation = response.data[2];
        this.postList[0].sectionShrinkage = response.data[3];
        this.loading = false;
      });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        trademark: undefined,
        treatmentSystem: undefined,
        temperature: undefined,
        algorithms: undefined,
      }
      this.postList = [{
          temperature:undefined,
          algorithms:undefined,
          yieldStrength:undefined,
          tensileStrength:undefined,
          elongation:undefined,
          sectionShrinkage:undefined,
        }]
      // this.resetForm("queryForm");
      // this.handleQuery();
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
      // console.log("row:",row)
      this.oneDataDetail[0] = row
      console.log("this.oneDataDetail",this.oneDataDetail)
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
  width: 180px;
}
</style>
