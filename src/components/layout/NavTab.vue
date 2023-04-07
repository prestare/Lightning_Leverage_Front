<template>
  <div>
      <template  class="wrapper" item-key="index">
        <div class="item">
          <el-button type="primary">NavTab</el-button>
        </div>
      </template>
  </div>
</template>

<script setup>
import { reactive } from 'vue'


const state = reactive({
  drag: false,
  list: [1, 2, 3, 4, 5, 6]
})


</script>

<style scoped>
/* 弹性盒子居左对其 */
.wrapper {
  display: flex;
  justify-content: start;
}
/* 间隔10px */
.item {
  margin-left: 10px;
}
</style>
