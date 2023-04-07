<template>

  <el-menu
      height="100%"
      default-active="2"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon><location /></el-icon>
        <span>Protocol</span>
      </template>
      <el-menu-item-group>
        <template #title><span>Position Building</span></template>
        <el-menu-item index="1-1">AAVE</el-menu-item>
        <el-menu-item index="1-2">dYdX</el-menu-item>
        <el-menu-item index="1-3">Uniswap</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group title="Automated Strategies">
        <el-menu-item index="2-1">Auto Borrow</el-menu-item>
        <el-menu-item index="2-2">Auto Repay</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-menu-item index="2">
      <el-icon><icon-menu /></el-icon>
      <template #title>My Profile</template>
    </el-menu-item>
    <el-menu-item index="3" >
      <el-icon><document /></el-icon>
      <template #title>About Us</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'


const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
