<template>
  <div class="open-index">
    <div class="top-search">
      <el-autocomplete
        class="inline-input"
        v-model="searchTag"
        :fetch-suggestions="querySearch"
        placeholder="请输入想要搜索的数据库名称"
        @select="handleSelect"
        style="width:300px"
      >
      <i class="el-icon-search el-input__icon"
          slot="suffix"
          @click="handleSearch">
        </i>
      </el-autocomplete>
      <el-button class="submit-search" type="primary" plain>搜索</el-button>
    </div>


    <!-- <div class="open-announcement">
      <el-card class="box-card open-announcement">
        <div slot="header" class="clearfix">
          <span>公告</span>
          <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
        </div>
        <div v-for="o in 6" :key="o" class="text item">
          {{'列表内容 ' + o }}
        </div>
      </el-card>
    </div> -->
    <div class="open-posts"></div>

  </div>
</template>

<script>
export default {
  components:{},
  data() {
    return {
      searchTag: "",
      posts: [],
      noticeList:[]
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
      ];
    },
    handleSelect(item) {
      // console.log(item);
    },
    handleSearch(){
      this.router.push('/open/database')
    }
  },
  mounted() {
    this.tags = this.loadAll();
  },
};
</script>

<style scoped>
.open-index {
  width: 1200px;
  background-color: #fff;
  margin: 30px auto;
  min-height: 699px;
  position: relative;
}
.top-search {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  height: 36px;
  width: 600px;
}
.submit-search{
  position: absolute;
}
.open-announcement{
  position: absolute;
  top: 40px;
  left: 70px;
  width: 300px;
  font-size: 16px;
  min-height: 500px;
}
</style>
