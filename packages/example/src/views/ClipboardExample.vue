<template>
  <div class="clipboard-example">
    <a-page-header
      title="剪贴板操作"
      sub-title="展示剪贴板读写功能"
      @back="$router.push('/')"
    />

    <a-card class="example-card">
      <a-typography>
        <a-typography-title :level="4">剪贴板操作示例</a-typography-title>
        <a-typography-paragraph>
          本示例展示了如何使用 <code>ClipboardUtils</code> 直接操作剪贴板，包括读取剪贴板内容和写入内容到剪贴板。
          这些功能可以用于实现更灵活的数据交换场景。
        </a-typography-paragraph>
      </a-typography>

      <a-divider orientation="left">读取剪贴板</a-divider>
      
      <div class="button-group">
        <a-button type="primary" @click="readClipboard" :loading="readLoading">
          <template #icon><DownloadOutlined /></template>
          读取剪贴板
        </a-button>
        <a-button @click="clearReadResult">
          <template #icon><ClearOutlined /></template>
          清空结果
        </a-button>
      </div>

      <a-tabs v-model:activeKey="activeTabKey">
        <a-tab-pane key="text" tab="文本内容">
          <a-textarea
            v-model:value="clipboardData.text"
            placeholder="剪贴板文本内容将显示在这里"
            :rows="6"
            readonly
          />
        </a-tab-pane>
        <a-tab-pane key="html" tab="HTML内容">
          <a-textarea
            v-model:value="clipboardData.html"
            placeholder="剪贴板HTML内容将显示在这里"
            :rows="6"
            readonly
          />
        </a-tab-pane>
        <a-tab-pane key="structured" tab="结构化数据">
          <a-table
            :dataSource="structuredRows"
            :columns="structuredColumns"
            :pagination="false"
            size="small"
            bordered
          />
        </a-tab-pane>
      </a-tabs>

      <a-divider orientation="left">写入剪贴板</a-divider>

      <a-form layout="vertical">
        <a-form-item label="文本内容">
          <a-textarea
            v-model:value="writeData.text"
            placeholder="输入要写入剪贴板的文本"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="HTML内容 (可选)">
          <a-textarea
            v-model:value="writeData.html"
            placeholder="输入要写入剪贴板的HTML (可选)"
            :rows="4"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="writeClipboard" :loading="writeLoading">
            <template #icon><UploadOutlined /></template>
            写入剪贴板
          </a-button>
        </a-form-item>
      </a-form>

      <a-divider />

      <a-collapse>
        <a-collapse-panel key="1" header="查看代码">
          <a-typography>
            <a-typography-title :level="5">1. 导入依赖</a-typography-title>
            <a-typography-paragraph>
              <pre><code>import { ClipboardUtils, type ClipboardData } from '@excel-table-toolkit/core';</code></pre>
            </a-typography-paragraph>

            <a-typography-title :level="5">2. 读取剪贴板</a-typography-title>
            <a-typography-paragraph>
              <pre><code>async function readClipboard() {
  try {
    const data = await ClipboardUtils.readClipboard();
    console.log('剪贴板数据:', data);
    // 处理剪贴板数据
  } catch (error) {
    console.error('读取剪贴板失败:', error);
  }
}</code></pre>
            </a-typography-paragraph>

            <a-typography-title :level="5">3. 写入剪贴板</a-typography-title>
            <a-typography-paragraph>
              <pre><code>async function writeClipboard() {
  try {
    const data: ClipboardData = {
      text: '要写入的文本',
      html: '<b>要写入的HTML</b>' // 可选
    };
    await ClipboardUtils.writeClipboard(data);
    console.log('写入剪贴板成功');
  } catch (error) {
    console.error('写入剪贴板失败:', error);
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
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { ClipboardUtils, type ClipboardData } from '@excel-table-toolkit/core';
import { DownloadOutlined, UploadOutlined, ClearOutlined } from '@ant-design/icons-vue';

// 读取的剪贴板数据
const clipboardData = ref<ClipboardData>({
  text: '',
  html: '',
  structured: []
});

// 要写入的剪贴板数据
const writeData = ref<ClipboardData>({
  text: 'Hello\tWorld\nFoo\tBar',
  html: '<table><tr><td>Hello</td><td>World</td></tr><tr><td>Foo</td><td>Bar</td></tr></table>'
});

// 加载状态
const readLoading = ref(false);
const writeLoading = ref(false);

// 当前活动的标签页
const activeTabKey = ref('text');

// 结构化数据的表格列
const structuredColumns = computed(() => {
  if (!clipboardData.value.structured || clipboardData.value.structured.length === 0) {
    return [];
  }
  
  // 根据第一行数据的列数创建列定义
  const firstRow = clipboardData.value.structured[0];
  return firstRow.map((_, index) => ({
    title: `列 ${index + 1}`,
    dataIndex: index.toString(),
    key: index.toString(),
  }));
});

// 结构化数据的表格行
const structuredRows = computed(() => {
  if (!clipboardData.value.structured || clipboardData.value.structured.length === 0) {
    return [];
  }
  
  // 将二维数组转换为表格行格式
  return clipboardData.value.structured.map((row, rowIndex) => {
    const rowData: Record<string, any> = { key: rowIndex };
    row.forEach((cell, cellIndex) => {
      rowData[cellIndex.toString()] = cell;
    });
    return rowData;
  });
});

// 读取剪贴板
async function readClipboard() {
  readLoading.value = true;
  try {
    const data = await ClipboardUtils.readClipboard();
    clipboardData.value = data;
    message.success('剪贴板内容已读取');
    
    // 根据读取到的内容自动切换到合适的标签页
    if (data.structured && data.structured.length > 0) {
      activeTabKey.value = 'structured';
    } else if (data.html) {
      activeTabKey.value = 'html';
    } else {
      activeTabKey.value = 'text';
    }
  } catch (error) {
    console.error('读取剪贴板失败:', error);
    message.error('读取剪贴板失败，请检查浏览器权限');
  } finally {
    readLoading.value = false;
  }
}

// 写入剪贴板
async function writeClipboard() {
  if (!writeData.value.text) {
    message.warning('请至少输入文本内容');
    return;
  }
  
  writeLoading.value = true;
  try {
    await ClipboardUtils.writeClipboard(writeData.value);
    message.success('内容已成功写入剪贴板');
  } catch (error) {
    console.error('写入剪贴板失败:', error);
    message.error('写入剪贴板失败，请检查浏览器权限');
  } finally {
    writeLoading.value = false;
  }
}

// 清空读取结果
function clearReadResult() {
  clipboardData.value = {
    text: '',
    html: '',
    structured: []
  };
  message.info('已清空读取结果');
}
</script>

<style scoped>
.clipboard-example {
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