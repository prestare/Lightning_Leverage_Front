<template>
  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
  >
    <el-menu-item index="0" >Prestare</el-menu-item>
    <div class="flex-grow" />
    <el-menu-item index="1">Home</el-menu-item>
    <el-sub-menu index="2">
      <template #title>More</template>
      <el-menu-item index="2-1">FAQ</el-menu-item>
      <el-menu-item index="2-2">GitHub</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
.flex-grow {
  flex-grow: 1;
}
</style>
