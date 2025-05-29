<template>
  <div class="advanced-example">
    <a-page-header
      title="高级示例"
      sub-title="展示高级功能和自定义配置"
      @back="$router.push('/')"
    />

    <a-card class="example-card">
      <a-typography>
        <a-typography-title :level="4">自定义适配器</a-typography-title>
        <a-typography-paragraph>
          本示例展示了如何创建自定义适配器，以适应特定的表格组件或数据格式。
          您可以通过继承 <code>BaseTableAdapter</code> 或实现 <code>TableAdapter</code> 接口来创建自定义适配器。
        </a-typography-paragraph>
      </a-typography>

      <a-divider orientation="left">自定义适配器示例</a-divider>

      <a-tabs>
        <a-tab-pane key="1" tab="自定义数据转换">
          <div class="demo-section">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="源数据">
                  <a-textarea
                    v-model:value="sourceData"
                    :rows="8"
                    placeholder="输入源数据，格式为 JSON 字符串"
                  />
                </a-form-item>
                <a-button type="primary" @click="transformData">
                  <template #icon><TranslationOutlined /></template>
                  转换数据
                </a-button>
              </a-col>
              <a-col :span="12">
                <a-form-item label="转换结果">
                  <a-textarea
                    v-model:value="transformedData"
                    :rows="8"
                    placeholder="转换后的数据将显示在这里"
                    readonly
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>

        <a-tab-pane key="2" tab="大数据量处理">
          <div class="demo-section">
            <a-form layout="inline">
              <a-form-item label="行数">
                <a-input-number
                  v-model:value="rowCount"
                  :min="100"
                  :max="10000"
                  :step="100"
                />
              </a-form-item>
              <a-form-item label="列数">
                <a-input-number
                  v-model:value="columnCount"
                  :min="5"
                  :max="50"
                  :step="5"
                />
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="generateLargeData" :loading="generating">
                  <template #icon><TableOutlined /></template>
                  生成数据
                </a-button>
              </a-form-item>
            </a-form>

            <a-divider orientation="left">虚拟滚动表格</a-divider>
            
            <div class="virtual-table-container">
              <a-table
                :dataSource="largeTableData.rows"
                :columns="largeTableColumns"
                :scroll="{ y: 400 }"
                :pagination="{ pageSize: 100 }"
                size="small"
                :rowKey="record => record.id"
              />
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="3" tab="自定义适配器实现">
          <a-typography>
            <a-typography-title :level="5">自定义适配器代码示例</a-typography-title>
            <a-typography-paragraph>
              <pre><code>{{ preCode }}</code></pre>
            </a-typography-paragraph>
          </a-typography>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { DataConverter, type TableData, type TableColumn } from '@excel-table-toolkit/core';
import { TranslationOutlined, TableOutlined } from '@ant-design/icons-vue';
const preCode = `import { BaseTableAdapter, type TableData, type TableColumn } from '@excel-table-toolkit/core';

/**
 * 自定义表格适配器
 */
export class CustomTableAdapter extends BaseTableAdapter {
  private tableElement: HTMLElement;
  
  constructor(tableElement: HTMLElement, columns: TableColumn[]) {
    super();
    this.tableElement = tableElement;
    this.columns = columns;
  }
  
  /**
   * 从表格组件获取数据
   */
  async getTableData(): Promise<TableData> {
    // 实现从自定义表格组件获取数据的逻辑
    const rows = [];
    
    // 示例：从DOM表格中提取数据
    const rowElements = this.tableElement.querySelectorAll('tbody tr');
    
    rowElements.forEach((rowEl, rowIndex) => {
      const row: Record<string, any> = { id: rowIndex };
      
      const cellElements = rowEl.querySelectorAll('td');
      this.columns.forEach((column, colIndex) => {
        if (cellElements[colIndex]) {
          row[column.key] = this.parseCellValue(cellElements[colIndex].textContent, column);
        }
      });
      
      rows.push(row);
    });
    
    return { rows, columns: this.columns };
  }
  
  /**
   * 设置表格组件数据
   */
  async setTableData(data: TableData): Promise<void> {
    // 实现将数据设置到自定义表格组件的逻辑
    const { rows, columns } = data;
    
    // 清空现有表格内容
    const tbody = this.tableElement.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '';
    }
    
    // 添加新数据
    rows.forEach(row => {
      const tr = document.createElement('tr');
      
      columns.forEach(column => {
        const td = document.createElement('td');
        td.textContent = this.formatCellValue(row[column.key], column);
        tr.appendChild(td);
      });
      
      tbody?.appendChild(tr);
    });
  }
  
  /**
   * 解析单元格值
   */
  private parseCellValue(value: string | null, column: TableColumn): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    switch (column.dataType) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'date':
        return new Date(value);
      default:
        return value;
    }
  }
  
  /**
   * 格式化单元格值
   */
  private formatCellValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    switch (column.dataType) {
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : String(value);
      case 'boolean':
        return value ? 'True' : 'False';
      default:
        return String(value);
    }
  }
}`
// 自定义数据转换示例
const sourceData = ref(`{
  "users": [
    { "name": "张三", "age": 28, "department": "技术部" },
    { "name": "李四", "age": 32, "department": "市场部" },
    { "name": "王五", "age": 24, "department": "财务部" }
  ]
}`);

const transformedData = ref('');

// 自定义数据转换函数
function transformData() {
  try {
    // 解析源数据
    const source = JSON.parse(sourceData.value);
    
    // 定义表格列
    const columns: TableColumn[] = [
      { key: 'name', title: '姓名', dataType: 'string' },
      { key: 'age', title: '年龄', dataType: 'number' },
      { key: 'department', title: '部门', dataType: 'string' },
      { key: 'status', title: '状态', dataType: 'string' } // 新增列
    ];
    
    // 转换数据
    const rows = source.users.map((user: any, index: number) => ({
      id: index + 1,
      name: user.name,
      age: user.age,
      department: user.department,
      status: user.age > 30 ? '资深' : '普通' // 根据年龄计算状态
    }));
    
    // 创建表格数据
    const tableData: TableData = { rows, columns };
    
    // 转换为剪贴板格式
    const clipboardData = DataConverter.tableToClipboard(tableData, { includeHeader: true });
    
    // 显示结果
    transformedData.value = clipboardData.text;
    message.success('数据转换成功');
  } catch (error) {
    console.error('数据转换失败:', error);
    message.error('数据转换失败，请检查源数据格式');
  }
}

// 大数据量处理示例
const rowCount = ref(1000);
const columnCount = ref(10);
const generating = ref(false);

// 大表格数据
const largeTableData = reactive<TableData>({
  rows: [],
  columns: []
});

// 大表格列
const largeTableColumns = computed(() => {
  return largeTableData.columns.map(col => ({
    title: col.title,
    dataIndex: col.key,
    key: col.key,
    width: 120,
  }));
});

// 生成大量数据
async function generateLargeData() {
  generating.value = true;
  
  try {
    // 使用 setTimeout 和 Promise 来避免阻塞 UI
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 生成列
    const columns: TableColumn[] = [];
    for (let i = 0; i < columnCount.value; i++) {
      const dataType = i === 0 ? 'string' : 
                      i % 3 === 1 ? 'number' : 
                      i % 3 === 2 ? 'boolean' : 'string';
      
      columns.push({
        key: `col${i}`,
        title: `列 ${i + 1}`,
        dataType: dataType as 'string' | 'number' | 'boolean' | 'date'
      });
    }
    
    // 生成行数据
    const rows = [];
    for (let i = 0; i < rowCount.value; i++) {
      const row: Record<string, any> = { id: i + 1 };
      
      for (let j = 0; j < columns.length; j++) {
        const col = columns[j];
        if (col.dataType === 'string') {
          row[col.key] = `数据 ${i}-${j}`;
        } else if (col.dataType === 'number') {
          row[col.key] = Math.floor(Math.random() * 1000);
        } else if (col.dataType === 'boolean') {
          row[col.key] = Math.random() > 0.5;
        }
      }
      
      rows.push(row);
    }
    
    // 更新表格数据
    largeTableData.columns = columns;
    largeTableData.rows = rows;
    
    message.success(`已生成 ${rowCount.value} 行 ${columnCount.value} 列数据`);
  } catch (error) {
    console.error('生成数据失败:', error);
    message.error('生成数据失败');
  } finally {
    generating.value = false;
  }
}
</script>

<style scoped>
.advanced-example {
  padding: 24px;
}

.example-card {
  margin-top: 24px;
}

.demo-section {
  margin: 16px 0;
}

.virtual-table-container {
  margin-top: 16px;
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