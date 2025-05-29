<template>
  <a-layout class="layout">
    <a-layout-header>
      <div class="logo">
        <h2 style="color: white; margin: 0;">Excel Table Toolkit</h2>
      </div>
      <a-menu
        theme="dark"
        mode="horizontal"
        :selected-keys="[currentRoute]"
        class="menu"
      >
        <a-menu-item key="/" @click="$router.push('/')">
          <HomeOutlined />
          首页
        </a-menu-item>
        <a-menu-item key="/basic" @click="$router.push('/basic')">
          <TableOutlined />
          基础示例
        </a-menu-item>
        <a-menu-item key="/advanced" @click="$router.push('/advanced')">
          <SettingOutlined />
          高级示例
        </a-menu-item>
        <a-menu-item key="/clipboard" @click="$router.push('/clipboard')">
          <CopyOutlined />
          剪贴板操作
        </a-menu-item>
        <a-menu-item key="/validation" @click="$router.push('/validation')">
          <CheckCircleOutlined />
          数据验证
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content class="content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </a-layout-content>
    <a-layout-footer class="footer">
      Excel Table Toolkit ©2024 Created with Vue 3 + Ant Design Vue
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeOutlined,
  TableOutlined,
  SettingOutlined,
  CopyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const currentRoute = computed(() => route.path)
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.logo {
  float: left;
  margin-right: 24px;
}

.menu {
  line-height: 64px;
}

.content {
  padding: 24px;
  background: #f0f2f5;
}

.content-wrapper {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 200px);
}

.footer {
  text-align: center;
  background: #f0f2f5;
  color: #666;
}
</style>