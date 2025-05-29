<template>
  <div class="validation-example">
    <a-page-header
      title="数据验证"
      sub-title="展示数据验证功能"
      @back="$router.push('/')"
    />

    <a-card class="example-card">
      <a-typography>
        <a-typography-title :level="4">数据验证示例</a-typography-title>
        <a-typography-paragraph>
          本示例展示了如何使用 <code>DataValidator</code> 对表格数据进行验证，包括内置验证规则和自定义验证规则。
          您可以编辑表格数据，然后点击"验证数据"按钮查看验证结果。
        </a-typography-paragraph>
      </a-typography>

      <a-divider orientation="left">验证规则配置</a-divider>

      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名验证规则">
              <a-checkbox v-model:checked="rules.name.required">必填</a-checkbox>
              <a-input-number 
                v-model:value="rules.name.minLength" 
                placeholder="最小长度" 
                addon-before="最小长度" 
                :min="0" 
                :max="20"
                style="width: 150px; margin-left: 8px;"
              />
              <a-input-number 
                v-model:value="rules.name.maxLength" 
                placeholder="最大长度" 
                addon-before="最大长度" 
                :min="0" 
                :max="50"
                style="width: 150px; margin-left: 8px;"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="年龄验证规则">
              <a-checkbox v-model:checked="rules.age.required">必填</a-checkbox>
              <a-input-number 
                v-model:value="rules.age.min" 
                placeholder="最小值" 
                addon-before="最小值" 
                :min="0" 
                :max="150"
                style="width: 150px; margin-left: 8px;"
              />
              <a-input-number 
                v-model:value="rules.age.max" 
                placeholder="最大值" 
                addon-before="最大值" 
                :min="0" 
                :max="150"
                style="width: 150px; margin-left: 8px;"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="邮箱验证规则">
              <a-checkbox v-model:checked="rules.email.required">必填</a-checkbox>
              <a-checkbox v-model:checked="rules.email.format" style="margin-left: 8px;">格式验证</a-checkbox>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="自定义验证规则">
              <a-checkbox v-model:checked="rules.custom.enabled">启用自定义验证</a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <a-divider orientation="left">表格数据</a-divider>

      <div class="button-group">
        <a-button type="primary" @click="validateData">
          <template #icon><CheckOutlined /></template>
          验证数据
        </a-button>
        <a-button @click="resetData">
          <template #icon><ReloadOutlined /></template>
          重置数据
        </a-button>
      </div>

      <a-table
        :dataSource="tableData.rows"
        :columns="antdColumns"
        :pagination="false"
        :rowKey="record => record.id"
        bordered
        :rowClassName="getRowClassName"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'name'">
            <a-input v-model:value="record.name" />
          </template>
          <template v-else-if="column.dataIndex === 'age'">
            <a-input-number v-model:value="record.age" :min="0" style="width: 100%" />
          </template>
          <template v-else-if="column.dataIndex === 'email'">
            <a-input v-model:value="record.email" />
          </template>
        </template>
      </a-table>

      <a-divider orientation="left">验证结果</a-divider>

      <a-alert
        v-if="validationResult.valid"
        message="验证通过"
        description="所有数据都符合验证规则"
        type="success"
        show-icon
      />

      <a-alert
        v-else
        message="验证失败"
        :description="`发现 ${validationResult.errors.length} 个错误`"
        type="error"
        show-icon
      />

      <a-list
        v-if="!validationResult.valid"
        class="error-list"
        item-layout="horizontal"
        :data-source="validationResult.errors"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <span>行 {{ item.rowIndex + 1 }}, 列 "{{ getColumnTitle(item.columnKey) }}"</span>
              </template>
              <template #description>
                <span>{{ item.message }}</span>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>

      <a-divider />

      <a-collapse>
        <a-collapse-panel key="1" header="查看代码">
          <a-typography>
            <a-typography-title :level="5">1. 导入依赖</a-typography-title>
            <a-typography-paragraph>
              <pre><code>import { DataValidator, type TableData, type ValidationResult } from '@excel-table-toolkit/core';</code></pre>
            </a-typography-paragraph>

            <a-typography-title :level="5">2. 创建验证器</a-typography-title>
            <a-typography-paragraph>
              <pre><code>const validator = new DataValidator();</code></pre>
            </a-typography-paragraph>

            <a-typography-title :level="5">3. 添加验证规则</a-typography-title>
            <a-typography-paragraph>
              <pre><code>// 添加必填规则
validator.addRule('name', {
  validator: (value) => !!value,
  message: '姓名不能为空'
});

// 添加长度规则
validator.addRule('name', {
  validator: (value) => value.length >= 2,
  message: '姓名长度不能少于2个字符'
});

// 添加数值范围规则
validator.addRule('age', {
  validator: (value) => value >= 18 && value <= 100,
  message: '年龄必须在18到100之间'
});

// 添加邮箱格式规则
validator.addRule('email', {
  validator: (value) => /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value),
  message: '邮箱格式不正确'
});

// 添加自定义复杂规则
validator.addRule('custom', {
  validator: (value, column, row) => {
    // 可以访问整行数据进行复杂验证
    return customValidation(value, row);
  },
  message: '自定义验证失败'
});</code></pre>
            </a-typography-paragraph>

            <a-typography-title :level="5">4. 验证数据</a-typography-title>
            <a-typography-paragraph>
              <pre><code>function validateData() {
  const result = validator.validate(tableData);
  console.log('验证结果:', result);
  
  if (result.valid) {
    // 验证通过
  } else {
    // 验证失败，显示错误
    console.error('验证错误:', result.errors);
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
import { ref, reactive, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { DataValidator, type TableData, type TableColumn, type ValidationResult, type ValidationError } from '@excel-table-toolkit/core';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons-vue';

// 定义表格列
const columns: TableColumn[] = [
  { key: 'name', title: '姓名', dataType: 'string' },
  { key: 'age', title: '年龄', dataType: 'number' },
  { key: 'email', title: '邮箱', dataType: 'string' }
];

// 转换为 Ant Design Vue 表格列格式
const antdColumns = computed(() => {
  return columns.map(col => ({
    dataIndex: col.key,
    title: col.title,
    key: col.key,
    width: col.width,
  }));
});

// 表格数据
const tableData = reactive<TableData>({
  rows: [
    { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 17, email: 'lisi@example' },
    { id: 3, name: '', age: 35, email: 'wangwu@example.com' }
  ],
  columns
});

// 验证规则配置
const rules = reactive({
  name: {
    required: true,
    minLength: 2,
    maxLength: 20
  },
  age: {
    required: true,
    min: 18,
    max: 100
  },
  email: {
    required: true,
    format: true
  },
  custom: {
    enabled: false
  }
});

// 验证结果
const validationResult = ref<ValidationResult>({
  valid: true,
  errors: []
});

// 创建验证器
const validator = new DataValidator();

// 更新验证规则
function updateValidationRules() {
  // 清除所有规则
  columns.forEach(col => {
    validator.removeRule(col.key);
  });

  // 添加姓名验证规则
  if (rules.name.required) {
    validator.addRule('name', {
      validator: (value) => value !== undefined && value !== null && value !== '',
      message: '姓名不能为空'
    });
  }
  
  if (rules.name.minLength > 0) {
    validator.addRule('name', {
      validator: (value) => !value || String(value).length >= rules.name.minLength,
      message: `姓名长度不能少于${rules.name.minLength}个字符`
    });
  }
  
  if (rules.name.maxLength > 0) {
    validator.addRule('name', {
      validator: (value) => !value || String(value).length <= rules.name.maxLength,
      message: `姓名长度不能超过${rules.name.maxLength}个字符`
    });
  }

  // 添加年龄验证规则
  if (rules.age.required) {
    validator.addRule('age', {
      validator: (value) => value !== undefined && value !== null && value !== '',
      message: '年龄不能为空'
    });
  }
  
  if (rules.age.min !== undefined) {
    validator.addRule('age', {
      validator: (value) => !value || value >= rules.age.min,
      message: `年龄不能小于${rules.age.min}`
    });
  }
  
  if (rules.age.max !== undefined) {
    validator.addRule('age', {
      validator: (value) => !value || value <= rules.age.max,
      message: `年龄不能大于${rules.age.max}`
    });
  }

  // 添加邮箱验证规则
  if (rules.email.required) {
    validator.addRule('email', {
      validator: (value) => value !== undefined && value !== null && value !== '',
      message: '邮箱不能为空'
    });
  }
  
  if (rules.email.format) {
    validator.addRule('email', {
      validator: (value) => !value || /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value),
      message: '邮箱格式不正确'
    });
  }

  // 添加自定义验证规则
  if (rules.custom.enabled) {
    validator.addRule('name', {
      validator: (value, column, rowIndex) => {
        // 自定义规则：姓名不能包含数字
        return !value || !/\d/.test(value);
      },
      message: '姓名不能包含数字'
    });
    
    validator.addRule('email', {
      validator: (value, column, rowIndex) => {
        // 自定义规则：邮箱域名必须是example.com
        return !value || value.endsWith('@example.com');
      },
      message: '邮箱域名必须是example.com'
    });
  }
}

// 验证数据
function validateData() {
  updateValidationRules();
  validationResult.value = validator.validate(tableData);
  
  if (validationResult.value.valid) {
    message.success('验证通过！');
  } else {
    message.error(`验证失败，发现 ${validationResult.value.errors.length} 个错误`);
  }
}

// 重置数据
function resetData() {
  tableData.rows = [
    { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 17, email: 'lisi@example' },
    { id: 3, name: '', age: 35, email: 'wangwu@example.com' }
  ];
  
  validationResult.value = {
    valid: true,
    errors: []
  };
  
  message.info('数据已重置');
}

// 获取行样式
function getRowClassName(record: any) {
  if (!validationResult.value.valid) {
    const hasError = validationResult.value.errors.some(
      error => error.rowIndex === tableData.rows.findIndex(row => row.id === record.id)
    );
    return hasError ? 'error-row' : '';
  }
  return '';
}

// 获取列标题
function getColumnTitle(key: string): string {
  const column = columns.find(col => col.key === key);
  return column ? column.title : key;
}

// 监听规则变化，自动更新验证规则
watch(rules, () => {
  // 规则变化时，清除验证结果
  validationResult.value = {
    valid: true,
    errors: []
  };
}, { deep: true });

// 初始化验证规则
updateValidationRules();
</script>

<style scoped>
.validation-example {
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

.error-list {
  margin-top: 16px;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  background-color: #fff2f0;
  padding: 8px;
}

:deep(.error-row) {
  background-color: #fff2f0;
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