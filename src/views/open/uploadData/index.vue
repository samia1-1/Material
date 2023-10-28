<template>
  <div class="upload-data">
    <div class="choose-data-category">

      <div class="choose-data-item">
        <el-autocomplete
          class="inline-input"
          v-model="choosedData.dataCategory"
          :fetch-suggestions="querySearch"
          placeholder="请输入上传数据的标签"
          @select="handleSelect"
          style="width:200px"
        >
        </el-autocomplete>
      </div>

      <div class="choose-data-file">
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

      <div class="choose-data-tit"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataCategory: [
        "蠕变性能",
        "持久极限性能",
        "持久性能",
        "拉伸性能.精铸试棒",
        "热成分处理",
        "合金成分查询性能",
        "其他数据",
      ],
      choosedData: {
        dataCategory: "",
      },
    };
  },
  methods: {
    querySearch(queryString, cb) {
      var tags = this.tags;
      var results = queryString
        ? tags.filter(this.createFilter(queryString))
        : tags;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (tag) => {
        return tag.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    loadAll() {
      return [
        { value: "材料数据" },
        { value: "蠕变性能" },
        { value: "持久极限性能" },
        { value: "持久性能" },
        { value: "拉伸性能.精铸试棒" },
        { value: "热成分处理" },
        { value: "合金成分查询性能" },
        { value: "其他数据" },
      ];
    },
    handleSelect(item) {
      // console.log(item);
    },
  },
  created() {},
  mounted() {
    this.tags = this.loadAll();
  },
};
</script>

<style>
.upload-data {
  width: 100%;
}
.choose-data-category {
  margin: 30px auto;
  width: 1200px;
  height: 100px;
}
.choose-data-item {
  margin-left: 200px;
  margin-top: 10px;
}
.choose-data-file{
  margin: 20px 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.el-upload-dragger{
  width: 800px;
  height: 200px;
}
.el-upload__tip{
  text-align: center;
}
</style>
