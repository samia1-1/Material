<template>
  <div class="upload-data">
    <div class="choose-data-category">

      <div class="choose-data-item">
        <el-select
          v-model="choosedData.dataCategory"
          clearable
          placeholder="请选择上传数据的标签"
          style="width:200px"
        >
          <el-option
            v-for="item in dataCategory"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          >
          </el-option>
        </el-select>

        <el-select
          v-model="choosedData.uploadType"
          clearable
          placeholder="请选择上传方式"
          style="width:200px"
        >
          <el-option
            v-for="item in uploadType"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          >
          </el-option>
        </el-select>
      </div>

      <div class="upload-data-type">
        <div
          class="upload-byfile"
          v-if="choosedData.uploadType === 'file'"
        >
          <el-upload
            class="upload-demo"
            drag
            action="https://jsonplaceholder.typicode.com/posts/"
            multiple
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div
              class="el-upload__tip"
              slot="tip"
            >接受任何类型的文件</div>
          </el-upload>
        </div>

        <div class="upload-bydetail">

        </div>

      </div>

      <div class="choose-data-tit"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataCategory: [
        {
          label: "蠕变性能",
          value: "creep",
        },
        {
          label: "持久极限性能",
          value: "extreme",
        },
        {
          label: "持久性能",
          value: "propertie",
        },
        {
          label: "拉伸性能.精铸试棒",
          value: "stretch",
        },
        {
          label: "热成分处理",
          value: "chemical",
        },
        {
          label: "合金成分查询性能",
          value: "alloyComposition",
        },
        {
          label: "其他数据",
          value: "others",
          disabled: false,
        },
      ],
      uploadType: [
        {
          label: "文件上传",
          value: "file",
        },
        {
          label: "单条输入",
          value: "detail",
          disabled: false,
        },
      ],
      choosedData: {
        dataCategory: "",
        uploadType: "",
      },
    };
  },
  methods: {
    handleSelect(item) {},
  },
  created() {},
  mounted() {},
  watch: {
    choosedData: {
      handler(newValue) {
        let othersOK = false,
          detailOK = false;
        if (newValue.dataCategory === "others") {//选中其他数据
          detailOK = true;
        }
        this.uploadType.map((item) => {
          if (item.value === "detail") {
            item.disabled = detailOK;
          }
        });
        if (newValue.uploadType === "detail") {//选中单条输入
          othersOK = true;
        }
        this.dataCategory.map((item) => {
          if (item.value === "others") {
            item.disabled = othersOK;
          }
        });
      },
      deep: true,
    },
  },
  computed: {

  },
};
</script>

<style>
.upload-data {
  width: 100%;
}
.choose-data-category {
  margin: 30px auto;
  width: 80vw;
  height: 100px;
}
.choose-data-item {
  display: flex;
  justify-content: space-evenly;
}
.upload-data-type {
  margin: 20px 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.el-upload-dragger {
  width: 800px;
  height: 200px;
}
.el-upload__tip {
  text-align: center;
}
</style>
