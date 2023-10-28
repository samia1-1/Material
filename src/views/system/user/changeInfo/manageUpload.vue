<template>
  <div class="manage-upload">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" type="border-card">
      <el-tab-pane :label="'全部('+all_count+')'" name="all" >
        <div class="all-data" style="min-height:556px">
          <el-empty v-if="all_count === 0" description="无上传的数据集" />
        </div>
      </el-tab-pane>
      <el-tab-pane :label="'已发布('+published_count+')'" name="published">
        <div class="published-data" style="min-height:556px">
          <el-empty v-if="published_count=== 0" description="无已发布的数据集" />
        </div>
      </el-tab-pane>
      <el-tab-pane :label="'审核中('+reviewing_count+')'" name="reviewing">
        <div class="reviewing-data" style="min-height:556px">
          <el-empty v-if="reviewing_count === 0" description="无审核中的数据集" />
        </div>
      </el-tab-pane>
      <el-tab-pane :label="'未通过('+rejected_count+')'" name="rejected">
        <div class="rejected-data" style="min-height:556px">
          <el-empty v-if="rejected_count === 0" description="无未通过的数据集" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'all', // 当前选中的选项
      all_count:0,
      published_count:0,
      reviewing_count:0,
      rejected_count:0,
    };
  },
  methods: {
    handleTabClick(tab) {
      this.activeTab = tab.name; // 切换选项
    },
  }
}
</script>

<style>
.tablist div{
  min-width: 100px;
  text-align: center;
}
</style>
