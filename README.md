# Excel Table Toolkit

一个用于在 Excel 和表格组件之间进行数据复制粘贴的工具库，支持扩展多种 UI 库。

## 特性

- 🔄 **双向数据传输**: 支持 Excel 数据复制到表格组件，以及表格数据复制到 Excel
- 🎨 **多 UI 库支持**: 可扩展支持原生 table、ant-design-vue 等多种 UI 库
- 📝 **TypeScript 支持**: 完整的 TypeScript 类型定义
- 🏗️ **现代化构建**: 使用 rolldown + pnpm + monorepo 架构

## 技术栈

- **构建工具**: rolldown + Vite
- **包管理**: pnpm + monorepo
- **语言**: TypeScript
- **框架**: Vue 3

## 项目结构

```
excel-table-toolkit/
├── packages/
│   ├── core/           # 核心库
│   └── docs/           # 文档站点
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动文档站点
pnpm docs:dev

# 构建核心库
pnpm core:build
```

### 构建

```bash
# 构建所有包
pnpm build

# 构建文档
pnpm docs:build
```

## 使用示例

### 基本使用

```typescript
import { ExcelTableAdapter } from '@excel-table-toolkit/core';

// 定义表格列
const columns = [
  { key: 'name', title: '姓名', dataType: 'string' },
  { key: 'age', title: '年龄', dataType: 'number' },
  { key: 'birthday', title: '生日', dataType: 'date' },
  { key: 'isActive', title: '是否激活', dataType: 'boolean' }
];

// 创建适配器实例
const adapter = new ExcelTableAdapter({
  includeHeader: true, // 是否包含表头
  delimiter: '\t',     // 数据分隔符
  rowDelimiter: '\n'   // 行分隔符
});

// 从剪贴板粘贴数据到表格
const tableData = await adapter.pasteFromClipboard(columns);
console.log(tableData);
// 输出: { rows: [...], columns: [...] }

// 从表格复制数据到剪贴板
await adapter.copyToClipboard(tableData);

// 导入 Excel 文件
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
fileInput.addEventListener('change', async (event) => {
  const file = fileInput.files?.[0];
  if (file) {
    const importedData = await adapter.importFromExcel(file, columns);
    console.log(importedData);
  }
});

// 导出表格数据到 Excel 文件
await adapter.exportToExcel(tableData, 'exported-data.xlsx');
```

### 添加回调函数

```typescript
import { ExcelTableAdapter } from '@excel-table-toolkit/core';

// 创建适配器实例，添加回调函数
const adapter = new ExcelTableAdapter(
  { includeHeader: true },
  {
    // 复制前处理数据
    beforeCopy: (data) => {
      console.log('准备复制数据', data);
      return data; // 可以返回修改后的数据
    },
    
    // 复制后回调
    afterCopy: (data) => {
      console.log('数据已复制到剪贴板', data);
    },
    
    // 粘贴前处理数据
    beforePaste: (clipboardData) => {
      console.log('准备粘贴数据', clipboardData);
      return clipboardData; // 可以返回修改后的数据
    },
    
    // 粘贴后回调
    afterPaste: (tableData) => {
      console.log('数据已粘贴到表格', tableData);
    },
    
    // 错误处理
    onError: (error) => {
      console.error('操作出错', error);
    }
  }
);
```

### 数据验证

#### 基本验证示例

```typescript
import { ExcelTableAdapter, DataValidator } from '@excel-table-toolkit/core';

// 创建适配器实例
const adapter = new ExcelTableAdapter();
const validator = adapter.getValidator();

// 添加验证规则
const rules = DataValidator.createCommonRules();

// 添加必填验证
validator.addRule('name', rules.required('姓名不能为空'));

// 添加数值范围验证
validator.addRule('age', rules.range(18, 60, '年龄必须在18-60岁之间'));

// 添加邮箱格式验证
validator.addRule('email', rules.email());

// 添加自定义验证
validator.addRule('code', rules.custom(
  (value) => /^[A-Z]{3}\d{3}$/.test(String(value)),
  '代码必须是3个大写字母后跟3个数字'
));

// 验证数据
const validationResult = adapter.validateData(tableData);
console.log(validationResult.valid); // 是否验证通过
console.log(validationResult.errors); // 错误信息列表
```

#### 内置数据类型验证

当表格列定义了 `dataType` 属性时，适配器会自动进行数据类型验证：

```typescript
// 定义表格列，包含数据类型
const columns = [
  { key: 'name', title: '姓名', dataType: 'string' },
  { key: 'age', title: '年龄', dataType: 'number' },
  { key: 'birthday', title: '生日', dataType: 'date' },
  { key: 'isActive', title: '是否激活', dataType: 'boolean' }
];

// 创建适配器实例
const adapter = new ExcelTableAdapter();

// 从剪贴板粘贴数据时会自动验证数据类型
const tableData = await adapter.pasteFromClipboard(columns);
```

#### 所有可用的验证规则

```typescript
import { ExcelTableAdapter, DataValidator } from '@excel-table-toolkit/core';

const adapter = new ExcelTableAdapter();
const validator = adapter.getValidator();
const rules = DataValidator.createCommonRules();

// 必填验证
validator.addRule('name', rules.required('此字段为必填项'));

// 最小长度验证
validator.addRule('description', rules.minLength(10, '描述至少需要10个字符'));

// 最大长度验证
validator.addRule('title', rules.maxLength(50, '标题最多允许50个字符'));

// 数值范围验证
validator.addRule('score', rules.range(0, 100, '分数必须在0-100之间'));

// 正则表达式验证
validator.addRule('zipCode', rules.pattern(/^\d{6}$/, '邮政编码必须是6位数字'));

// 邮箱验证
validator.addRule('email', rules.email('请输入有效的邮箱地址'));

// 手机号验证
validator.addRule('phone', rules.phone('请输入有效的手机号'));

// 自定义验证
validator.addRule('customField', rules.custom(
  (value, column) => {
    // 返回 true 表示验证通过
    // 返回 false 表示验证失败，使用默认错误消息
    // 返回字符串表示验证失败，并使用返回的字符串作为错误消息
    return value === 'expected' || '值必须是 expected';
  },
  '默认错误消息'
));
```

#### 处理验证错误

```typescript
import { ExcelTableAdapter } from '@excel-table-toolkit/core';
import type { ValidationResult, ValidationError } from '@excel-table-toolkit/core';

const adapter = new ExcelTableAdapter();

// 设置验证规则...

// 验证数据
const result = adapter.validateData(tableData);

if (!result.valid) {
  // 处理验证错误
  result.errors.forEach((error: ValidationError) => {
    console.error(
      `行 ${error.rowIndex + 1} 的 ${error.columnKey} 列验证失败: ${error.message}`,
      `错误值: ${error.value}`
    );
    
    // 可以在界面上标记错误单元格
    highlightErrorCell(error.rowIndex, error.columnKey, error.message);
  });
}
```

#### 在粘贴和导入时自动验证

适配器在从剪贴板粘贴数据或导入 Excel 文件时会自动进行数据验证：

```typescript
import { ExcelTableAdapter } from '@excel-table-toolkit/core';

const adapter = new ExcelTableAdapter();
const validator = adapter.getValidator();

// 设置验证规则...

// 添加错误处理回调
const adapterWithCallbacks = new ExcelTableAdapter(
  { includeHeader: true },
  {
    // 错误处理回调
    onError: (error) => {
      console.error('操作出错', error);
    },
    
    // 粘贴后回调，可以检查验证结果
    afterPaste: (tableData) => {
      const result = adapter.validateData(tableData);
      if (!result.valid) {
        // 显示验证错误
        showValidationErrors(result.errors);
      }
    }
  }
);

// 从剪贴板粘贴数据（会自动验证）
const tableData = await adapterWithCallbacks.pasteFromClipboard(columns);
```

#### 创建和管理验证规则

```typescript
import { ExcelTableAdapter, DataValidator } from '@excel-table-toolkit/core';
import type { ValidationRule } from '@excel-table-toolkit/core';

const adapter = new ExcelTableAdapter();
const validator = adapter.getValidator();

// 创建自定义验证规则
const uniqueCodeRule: ValidationRule = {
  validator: (value, column) => {
    // 检查代码是否唯一
    return !existingCodes.includes(value) || '代码已存在，请使用唯一代码';
  },
  message: '代码必须唯一'
};

// 添加规则
validator.addRule('code', uniqueCodeRule);

// 移除特定规则
validator.removeRule('code', uniqueCodeRule);

// 移除列的所有规则
validator.removeRule('code');

// 清空所有验证规则
validator.clearRules();

// 获取指定列的所有验证规则
const codeRules = validator.getRules('code');
```

## 扩展 UI 库

### 使用内置适配器

```typescript
import { createTableAdapter } from '@excel-table-toolkit/core';

// 为原生 HTML 表格创建适配器
const tableElement = document.getElementById('myTable') as HTMLTableElement;
const nativeAdapter = createTableAdapter({
  type: 'native',
  target: tableElement,
  columns: [
    { key: 'name', title: '姓名', dataType: 'string' },
    { key: 'age', title: '年龄', dataType: 'number' }
  ],
  options: { includeHeader: true }
});

// 为 Ant Design Vue 表格创建适配器
const antdAdapter = createTableAdapter({
  type: 'ant-design-vue',
  target: tableRef.value, // Vue 组件实例
  columns: [
    { key: 'name', title: '姓名', dataType: 'string' },
    { key: 'age', title: '年龄', dataType: 'number' }
  ]
});

// 为 Element Plus 表格创建适配器
const elementAdapter = createTableAdapter({
  type: 'element-plus',
  target: tableRef.value, // Vue 组件实例
  columns: [
    { key: 'name', title: '姓名', dataType: 'string' },
    { key: 'age', title: '年龄', dataType: 'number' }
  ]
});
```

### 创建自定义适配器

```typescript
import { BaseTableAdapter, registerAdapter, createTableAdapter } from '@excel-table-toolkit/core';
import type { TableData, TableColumn, AdapterOptions } from '@excel-table-toolkit/core';

// 创建自定义适配器类
class MyCustomAdapter extends BaseTableAdapter {
  name = 'my-custom-adapter';
  private tableInstance: any;

  constructor(tableInstance: any, columns: TableColumn[], options: AdapterOptions = {}) {
    super(options);
    this.tableInstance = tableInstance;
  }

  getTableData(): TableData {
    // 实现从自定义表格组件获取数据的逻辑
    const data = this.tableInstance.getData();
    return {
      rows: data,
      columns: this.tableInstance.getColumns()
    };
  }

  setTableData(data: TableData): void {
    // 实现向自定义表格组件设置数据的逻辑
    this.tableInstance.setData(data.rows);
  }
}

// 注册自定义适配器
registerAdapter('my-custom-adapter', MyCustomAdapter);

// 使用自定义适配器
const customAdapter = createTableAdapter({
  type: 'custom',
  target: myTableInstance,
  columns: myColumns,
  customAdapter: MyCustomAdapter
});
```

## 参数说明

### ExcelTableAdapter 配置选项

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| includeHeader | boolean | true | 是否包含表头 |
| delimiter | string | '\t' | 数据分隔符 |
| rowDelimiter | string | '\n' | 行分隔符 |
| transform | object | - | 数据转换函数 |
| transform.export | function | - | 导出时的数据转换函数 |
| transform.import | function | - | 导入时的数据转换函数 |

### 回调函数

| 回调函数 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| beforeCopy | tableData | tableData | 复制前处理数据 |
| afterCopy | tableData | void | 复制后回调 |
| beforePaste | clipboardData | clipboardData | 粘贴前处理数据 |
| afterPaste | tableData | void | 粘贴后回调 |
| onError | error | void | 错误处理回调 |

### 表格列配置

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| key | string | - | 列唯一标识 |
| title | string | - | 列标题 |
| dataType | string | 'string' | 数据类型，可选值：'string'、'number'、'boolean'、'date' |
| width | number | - | 列宽度 |
| editable | boolean | - | 是否可编辑 |

## 许可证

MIT