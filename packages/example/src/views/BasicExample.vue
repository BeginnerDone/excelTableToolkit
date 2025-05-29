<template>
  <div class="basic-example">
    <a-page-header
      title="基础示例"
      sub-title="展示 Excel 表格数据交换的基本功能"
      @back="$router.push('/')"
    />

    <a-card class="example-card">
      <a-typography>
        <a-typography-title :level="4">表格数据交换</a-typography-title>
        <a-typography-paragraph>
          本示例展示了如何使用 <code>ExcelTableAdapter</code> 实现 Excel 与表格组件之间的数据交换。
          您可以从 Excel 复制数据，然后点击"从剪贴板粘贴"按钮将数据导入表格；
          也可以选择表格数据，点击"复制到剪贴板"按钮将数据复制到剪贴板，然后粘贴到 Excel 中。
        </a-typography-paragraph>
      </a-typography>

      <div class="button-group">
        <a-button type="primary" @click="pasteFromClipboard" :loading="loading">
          <template #icon><CopyOutlined /></template>
          从剪贴板粘贴
        </a-button>
        <a-button @click="copyToClipboard" :disabled="!tableData.rows.length">
          <template #icon><ExportOutlined /></template>
          复制到剪贴板
        </a-button>
        <a-button @click="clearTable" :disabled="!tableData.rows.length">
          <template #icon><ClearOutlined /></template>
          清空表格
        </a-button>
      </div>

      <a-table
        :dataSource="tableData.rows"
        :columns="antdColumns"
        :pagination="{ pageSize: 5 }"
        :rowKey="record => record.id || record.key"
        bordered
      />

      <a-divider />

      <a-collapse>
        <a-collapse-panel key="1" header="查看代码">
          <a-typography>
            <a-typography-title :level="5">1. 导入依赖</a-typography-title>
            <a-typography-paragraph>
              <pre><code>import { ExcelTableAdapter } from '@excel-table-toolkit/core';</code></pre>
            </a-typography-paragraph>

            <a-typography-title :level="5">2. 定义表格列</a-typography-title>
            <a-typography-paragraph>
              <pre><code>const columns = [
  { key: 'name', title: '姓名', dataType: 'string' },
  { key: 'age', title: '年龄', dataType: 'number' },
  { key: 'address', title: '地址', dataType: 'string' },
  { key: 'active', title: '是否活跃', dataType: 'boolean' }
];</code></pre>
            </a-typography-paragraph>

            <a-typography-title :level="5">3. 创建适配器</a-typography-title>
            <a-typography-paragraph>
              <pre><code>const adapter = new ExcelTableAdapter();</code></pre>
            </a-typography-paragraph>

            <a-typography-title :level="5">4. 从剪贴板粘贴数据</a-typography-title>
            <a-typography-paragraph>
              <pre><code>async function pasteFromClipboard() {
  try {
    const data = await adapter.pasteFromClipboard(columns);
    // 更新表格数据
    tableData.value = data;
  } catch (error) {
    console.error('粘贴失败:', error);
  }
}</code></pre>
            </a-typography-paragraph>

            <a-typography-title :level="5">5. 复制数据到剪贴板</a-typography-title>
            <a-typography-paragraph>
              <pre><code>async function copyToClipboard() {
  try {
    await adapter.copyToClipboard(tableData.value);
    // 提示用户复制成功
  } catch (error) {
    console.error('复制失败:', error);
  }
}</code></pre>
            </a-typography-paragraph>
          </a-typography>
        </a-collapse-panel>
      </a-collapse>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { ExcelTableAdapter, type TableData, type TableColumn } from '@excel-table-toolkit/core';
import { CopyOutlined, ExportOutlined, ClearOutlined } from '@ant-design/icons-vue';

// 定义表格列
const columns: TableColumn[] = [
  { key: 'name', title: '姓名', dataType: 'string' },
  { key: 'age', title: '年龄', dataType: 'number' },
  { key: 'address', title: '地址', dataType: 'string' },
  { key: 'active', title: '是否活跃', dataType: 'boolean' }
];

// 转换为 Ant Design Vue 表格列格式
const antdColumns = computed(() => {
  return columns.map(col => ({
    dataIndex: col.key,
    title: col.title,
    key: col.key,
    width: col.width,
    // 为布尔类型添加自定义渲染
    customRender: col.dataType === 'boolean' 
      ? ({ text }: { text: boolean }) => text ? '是' : '否'
      : undefined
  }));
});

// 表格数据
const tableData = ref<TableData>({
  rows: [],
  columns
});

// 加载状态
const loading = ref(false);

// 创建适配器
const adapter = new ExcelTableAdapter({
  // 配置选项
  includeHeader: true
}, {
  // 回调函数
  beforePaste: (data) => {
    console.log('粘贴前处理数据', data);
    return data;
  },
  afterPaste: (data) => {
    console.log('粘贴后处理数据', data);
    message.success('数据已成功粘贴到表格');
  },
  onError: (error) => {
    console.error('发生错误', error);
    message.error(`操作失败: ${error.message}`);
  }
});

// 从剪贴板粘贴数据
async function pasteFromClipboard() {
  loading.value = true;
  try {
    const data = await adapter.pasteFromClipboard(columns);
    tableData.value = data;
  } catch (error) {
    console.error('粘贴失败:', error);
    message.error('粘贴失败，请确保已复制有效的表格数据');
  } finally {
    loading.value = false;
  }
}

// 复制数据到剪贴板
async function copyToClipboard() {
  try {
    await adapter.copyToClipboard(tableData.value);
    message.success('数据已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    message.error('复制失败，请稍后重试');
  }
}

// 清空表格
function clearTable() {
  tableData.value = {
    rows: [],
    columns
  };
  message.info('表格已清空');
}

// 组件挂载时添加示例数据
onMounted(() => {
  // 添加示例数据
  tableData.value = {
    rows: [
      { id: 1, name: '张三', age: 28, address: '北京市朝阳区', active: true },
      { id: 2, name: '李四', age: 32, address: '上海市浦东新区', active: false },
      { id: 3, name: '王五', age: 24, address: '广州市天河区', active: true }
    ],
    columns
  };
});
</script>

<style scoped>
.basic-example {
  padding: 24px;
}

.example-card {
  margin-top: 24px;
}

.button-group {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

pre {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', Courier, monospace;
}
</style>