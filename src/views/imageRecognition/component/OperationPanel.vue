<template>
  <el-aside width="440px" class="left-sidebar">
    <el-card class="combined-card">
      <div slot="header" class="card-header">
        <span><i class="el-icon-s-operation"></i> 操作与分析面板</span>
      </div>

      <!-- 操作控制区域 -->
      <div class="panel-section operation-section">
        <div class="section-title">
          <i class="el-icon-s-tools"></i> 操作控制
        </div>
        <div class="operation-buttons">
          <el-button
            v-for="(btn, idx) in operationButtons.slice(0, 4)"
            :key="idx"
            @click="$emit('operation-click', btn.handler)"
            :icon="btn.icon"
            class="op-button">
            {{ btn.label }}
          </el-button>
        </div>
        <div class="operation-buttons">
          <el-button
            v-for="(btn, idx) in operationButtons.slice(4)"
            :key="idx + 4"
            @click="$emit('operation-click', btn.handler)"
            :icon="btn.icon"
            class="op-button special-button">
            {{ btn.label }}
          </el-button>
        </div>
      </div>

      <!-- 数据分析区域 -->
      <div class="panel-section data-section">
        <div class="section-title">
          <i class="el-icon-data-analysis"></i> 数据分析
        </div>
        <el-form label-position="left" size="small" class="data-form" label-width="160px">
          <el-form-item v-for="(item, index) in dataFields" :key="index" :label="item.label">
            <el-input
              v-model="item.value"
              :placeholder="item.placeholder || '点击查询后显示'"
              :disabled="true">
            </el-input>
          </el-form-item>
        </el-form>
        <div class="chart-action">
          <el-button
            @click="$emit('get-statistic')"
            icon="el-icon-data-analysis"
            class="analysis-button">
            查询统计数据
          </el-button>
        </div>
      </div>
    </el-card>
  </el-aside>
</template>

<script>
export default {
  name: 'OperationPanel',
  props: {
    operationButtons: {
      type: Array,
      required: true
    },
    dataFields: {
      type: Array,
      required: true
    }
  },
  emits: ['operation-click', 'get-statistic']
}
</script>

<style lang="scss" scoped>
.left-sidebar {
  background-color: #000;
  border-right: 1px solid #0f0f0f;
  padding: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.4);
  width: 440px !important;
  flex: 0 0 440px;
  overflow-y: auto; /* 添加垂直滚动 */
  height: 100%; /* 使用父容器的100%高度 */

  /* 深色主题滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.6);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border-radius: 3px;
    transition: background 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
    }
  }
}

.combined-card {
  border-radius: 2px;
  background-color: #050505;
  border: 1px solid #101010;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #101010;
    padding: 10px 12px;
    background-color: #030303;

    span {
      font-weight: bold;
      font-size: 14px;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      text-shadow: 0 0 5px rgba(58, 123, 189, 0.6);
    }
  }
}

.panel-section {
  padding: 8px 5px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px dashed #151515;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: 0 0 8px rgba(58, 123, 189, 0.6);

    i {
      margin-right: 5px;
      color: #56a9ff;
    }
  }
}

.operation-section {
  width: 100%;
  margin-bottom: 15px;

  .operation-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 10px;
    padding: 0 2px;
  }
}

.op-button, .analysis-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  width: 100% !important;
  height: 38px;
  padding: 0 10px;
  margin: 0;
  font-size: 13px;

  i {
    margin-right: 6px;
    font-size: 16px;
    color: #56a9ff;
  }
}

.op-button {
  background-color: #080808;
  border: 1px solid #151515;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);

  &:hover {
    background-color: #101010;
    border-color: #1e1e1e;
  }
}

.special-button, .analysis-button {
  background-color: #071525;
  border-color: #0e2740;

  &:hover {
    background-color: #0a2235;
    border-color: #15304d;
  }
}

.data-section {
  width: 100%;
  background-color: #030303;
  border-radius: 2px;
  border: 1px solid #101010;
  padding: 12px;
  margin: 0 3px;

  .data-form {
    margin-bottom: 12px;

    ::v-deep .el-form-item {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      flex-direction: row;

      &__label {
        color: #ffffff !important;
        font-size: 13px;
        line-height: 32px;
        font-weight: 500;
        text-align: left;
        float: none;
        width: 160px !important;
        padding: 0 8px 0 0;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }

      &__content {
        line-height: 32px;
        margin-left: 0 !important;
        flex: 1;
      }
    }

    ::v-deep .el-input__inner {
      background-color: #071525 !important;
      border-color: #0e2740 !important;
      color: #ffffff !important;
      height: 32px;
      font-size: 13px;
      border-radius: 2px;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 5px rgba(58, 123, 189, 0.2);
      padding: 0 10px;
      width: 100%;
      letter-spacing: 0.5px;
      font-weight: 500;
      text-align: left;

      &::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
      }
    }
  }

  .chart-action {
    margin-top: 12px;
    text-align: center;
    padding: 0 5px;
  }
}
</style>
