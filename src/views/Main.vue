<template>
  <el-container style="height: 100%;width:100%;position:absolute">
    <el-container>
      <el-header>
        <NavHeaderVue></NavHeaderVue>
      </el-header>
      <el-main>
        <home></home>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>

import NavHeaderVue from "@/components/layout/NavHeader.vue";
import home from "@/views/home.vue";

export default {
  name: 'Main',
  components: {

    NavHeaderVue,
    home
  }
}
</script>
<style>
</style>
