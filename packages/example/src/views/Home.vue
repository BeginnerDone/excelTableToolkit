<template>
  <div class="home">
    <div class="hero">
      <h1 class="title">Excel Table Toolkit</h1>
      <p class="subtitle">Excel 与表格数据交换工具库</p>
      <div class="features">
        <a-row :gutter="[24, 24]">
          <a-col :span="8">
            <a-card class="feature-card">
              <template #cover>
                <div class="feature-icon">
                  <TableOutlined :style="{ fontSize: '48px', color: '#1890ff' }" />
                </div>
              </template>
              <a-card-meta title="数据交换" description="支持 Excel 与各种表格组件之间的数据交换" />
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="feature-card">
              <template #cover>
                <div class="feature-icon">
                  <CopyOutlined :style="{ fontSize: '48px', color: '#52c41a' }" />
                </div>
              </template>
              <a-card-meta title="剪贴板操作" description="便捷的复制粘贴功能，支持多种数据格式" />
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="feature-card">
              <template #cover>
                <div class="feature-icon">
                  <CheckCircleOutlined :style="{ fontSize: '48px', color: '#fa8c16' }" />
                </div>
              </template>
              <a-card-meta title="数据验证" description="灵活的数据验证规则，确保数据质量" />
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>

    <a-divider />

    <div class="quick-start">
      <h2>快速开始</h2>
      <a-steps :current="0" direction="vertical">
        <a-step title="安装">
          <template #description>
            <a-typography-paragraph>
              <pre><code>npm install @excel-table-toolkit/core</code></pre>
            </a-typography-paragraph>
          </template>
        </a-step>
        <a-step title="导入">
          <template #description>
            <a-typography-paragraph>
              <pre><code>import { ExcelTableAdapter } from '@excel-table-toolkit/core'</code></pre>
            </a-typography-paragraph>
          </template>
        </a-step>
        <a-step title="使用">
          <template #description>
            <a-typography-paragraph>
              <pre><code>const adapter = new ExcelTableAdapter()
const data = await adapter.pasteFromClipboard(columns)</code></pre>
            </a-typography-paragraph>
          </template>
        </a-step>
      </a-steps>
    </div>

    <a-divider />

    <div class="examples">
      <h2>示例演示</h2>
      <a-row :gutter="[16, 16]">
        <a-col :span="12">
          <a-card hoverable @click="$router.push('/basic')">
            <template #cover>
              <div class="example-cover">
                <TableOutlined :style="{ fontSize: '32px' }" />
              </div>
            </template>
            <a-card-meta title="基础示例" description="演示基本的数据交换功能" />
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card hoverable @click="$router.push('/advanced')">
            <template #cover>
              <div class="example-cover">
                <SettingOutlined :style="{ fontSize: '32px' }" />
              </div>
            </template>
            <a-card-meta title="高级示例" description="展示高级功能和自定义配置" />
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card hoverable @click="$router.push('/clipboard')">
            <template #cover>
              <div class="example-cover">
                <CopyOutlined :style="{ fontSize: '32px' }" />
              </div>
            </template>
            <a-card-meta title="剪贴板操作" description="演示剪贴板读写功能" />
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card hoverable @click="$router.push('/validation')">
            <template #cover>
              <div class="example-cover">
                <CheckCircleOutlined :style="{ fontSize: '32px' }" />
              </div>
            </template>
            <a-card-meta title="数据验证" description="展示数据验证规则的使用" />
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TableOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 60px 0;
}

.title {
  font-size: 48px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 20px;
  color: #666;
  margin-bottom: 48px;
}

.feature-card {
  height: 100%;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  background: #fafafa;
}

.quick-start {
  margin: 48px 0;
}

.quick-start h2 {
  text-align: center;
  margin-bottom: 32px;
  color: #1890ff;
}

.examples {
  margin: 48px 0;
}

.examples h2 {
  text-align: center;
  margin-bottom: 32px;
  color: #1890ff;
}

.example-cover {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  background: #fafafa;
  color: #1890ff;
}

pre {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 4px;
  margin: 0;
}

code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>