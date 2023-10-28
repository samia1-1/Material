<template>
  <div class="pic-list">
    <div class="pic-sort">
      <div class="pic-sort-tit">point:</div>

      <div class="pic-sort-points">
          <el-form
            ref="points"
            :model="points"
            size="medium"
            label-width="70px"
          >

              <el-form-item
                label="x:"
                prop="x"
                :style="{width: '400px'}"
              >
                <el-select
                  v-model="points.x"
                  placeholder="请选择x"
                  clearable
                  :style="{width: '300px'}"
                >
                  <el-option
                    v-for="(item, index) in xOptions"
                    :key="index"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="y:"
                prop="y"
                :style="{width: '400px'}"
              >
                <el-select
                  v-model="points.y"
                  placeholder="请选择y"
                  clearable
                  :style="{width: '300px'}"
                >
                  <el-option
                    v-for="(item, index) in yOptions"
                    :key="index"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </el-form-item>

              <el-form-item size="medium">
                <el-button
                  type="primary"
                  @click="submitForm"
                >提交</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>

          </el-form>
      </div>

    </div>
    <div class="pic-list-show">
      <div
        class="pic-list-item"
        v-for="(item,index) in imgList"
        :key="index"
      >
        <router-link
          to="/"
          class="img"
        >
          <img loading="lazy">
        </router-link>
        <router-link
          to="/"
          class="a"
        >item.name</router-link>
      </div>
    </div>

    <div class="pic-list-choose">
      <div class="pic-list-choose-tit">筛选</div>
      <div class="pic-list-choose-list">

        <div class="pic-list-choose-type">
          <div class="pic-list-choose-type-name">单晶/粉末：</div>
          <div class="pic-list-choose-type-option-list">
            <a
              class="pic-list-choose-type-option"
              v-for="(item,index) in wz"
              :key="index"
              :class="{activeInfo:item == activeInfo.wz}"
              @click="changeWZ(item)"
            >{{item}}</a>
          </div>

        </div>

        <div class="pic-list-choose-type">
          <div class="pic-list-choose-type-name">工艺：</div>
          <div class="pic-list-choose-type-option-list">
            <a
              class="pic-list-choose-type-option"
              v-for="(item,index) in craft"
              :key="index"
              :class="{activeInfo:item == activeInfo.craft}"
              @click="changeCraft(item)"
            >{{item}}</a>
          </div>
        </div>

        <div class="pic-list-choose-type">
          <div class="pic-list-choose-type-name">Design：</div>
          <div class="pic-list-choose-type-option-list">
            <a
              class="pic-list-choose-type-option"
              v-for="(item,index) in design"
              :key="index"
              :class="{activeInfo:item == activeInfo.design}"
              @click="changeDesign(item)"
            >{{item}}</a>
          </div>
        </div>

        <div class="pic-list-choose-type"></div>
      </div>
    </div>

    <!-- <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      wz: ["单晶", "粉末"],
      craft: ["STD", "800", "900", "1000", "1100"],
      design: [
        "123",
        "134",
        "125",
        "126",
        "136",
        "142",
        "147",
        "164",
        "167",
        "172",
        "173",
      ],
      imgList: ["", "", "", ""],
      activeInfo: {
        wz: "",
        craft: "",
        design: "",
      },
      points: {
        x: "all",
        y: "all",
      },
      // pointRules: {
      //   x: [
      //     {
      //       required: true,
      //       message: "请选择x",
      //       trigger: "change",
      //     },
      //   ],
      //   y: [
      //     {
      //       required: true,
      //       message: "请选择y",
      //       trigger: "change",
      //     },
      //   ],
      // },
      xOptions: ['0','100'],
      yOptions: ['0','100'],
    };
  },
  created() {
    if (window.sessionStorage.activeInfo) {
      this.activeInfo = JSON.parse(window.sessionStorage.activeInfo);
    }
  },
  mounted() {
    // 在新窗口中监听message事件
    window.addEventListener("message", (event) => {
      //检验是否信任消息来源
      if (event.origin !== "http://localhost:8100") {
        this.$message({
          message: "警告！该消息源不可信任！",
          type: "error",
        });
      }
      // event.data包含接收到的数据
      const receivedData = event.data;
      // 处理接收到的数据
      if (receivedData.wz) {
        console.log("使用新的数据");
        this.activeInfo = receivedData;
        window.sessionStorage.activeInfo = JSON.stringify(this.activeInfo);
      }
    });
  },
  watch: {
    activeInfo: function (newValue, oldValue) {
      // 执行相应的操作
    },
  },
  methods: {
    changeWZ(item) {
      this.activeInfo.wz = item;
      window.sessionStorage.activeInfo = JSON.stringify(this.activeInfo);
    },
    changeCraft(item) {
      this.activeInfo.craft = item;
      window.sessionStorage.activeInfo = JSON.stringify(this.activeInfo);
    },
    changeDesign(item) {
      this.activeInfo.design = item;
      window.sessionStorage.activeInfo = JSON.stringify(this.activeInfo);
    },
    submitForm() {
      this.$refs["points"].validate((valid) => {
        if (!valid) return;
        // TODO 提交表单
      });
    },
    resetForm() {
      this.$refs["points"].resetFields();
    },
  },
};
</script>

<style>
.pic-list {
  min-height: 612px;
  position: relative;
}
.pic-sort {
  width: 1100px;
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  position: relative;
}
.pic-sort-tit {
  font-size: 16px;
  height: 50px;
  width: 100px;
  text-align: center;
  position: absolute;
  left: 0;
}
.pic-sort-points {
  width: 1020px;
  height: 50px;
  text-align: center;
  display: inline-block;
  position: absolute;
  right: 0;
}
.pic-sort-points .el-form{
  height: 50px;
}
.pic-sort-points .el-form .el-form-item{
  float: left;
  margin-bottom: 0;
  margin-top: 7px;
}
.pic-list-show {
  width: 900px;
  background-color: rgb(127, 168, 255);
  display: inline-block;
  padding: 20px 0;
}
.pic-list-item {
  display: inline-block;
  width: 270px;
  background-color: aliceblue;
  height: 200px;
  font-size: 13px;
  margin: 12px;
}
.pic-list-item .a {
  color: black;
  font-size: 13px;
}
.pic-list-choose {
  position: absolute;
  top: 50px;
  width: 290px;
  display: inline-block;
  margin-left: 40px;
  padding-left: 20px;
}
.pic-list-choose-tit {
  font-size: 16px;
  height: 45px;
  line-height: 45px;
}
.pic-list-choose-type {
  float: left;
  min-height: 50px;
  font-size: 12px;
  margin-bottom: 16px;
}
.pic-list-choose-type-name {
  color: #00a1d6;
  margin-right: 10px;
  height: 50px;
  line-height: 50px;
  width: 70px;
  text-align: left;
  float: left;
}
.pic-list-choose-type-option-list {
  width: 180px;
  min-height: 50px;
  float: right;
}
.pic-list-choose-type-option {
  width: 40px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  display: inline-block;
}
.pic-list-choose-type-option:hover {
  color: #00a1d6;
}
.activeInfo {
  color: #00a1d6;
}
.pagination-container {
  height: 50px;
  line-height: 50px;
  width: 100%;
  text-align: center;
  position: relative;
}
.el-pagination {
  position: absolute;
  left: 50%;
}
</style>
