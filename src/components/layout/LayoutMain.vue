<template>
  <div class="layout-container">
      <div class="layout-header">
        <NavHeaderVue></NavHeaderVue>
      </div>
    <Main></Main>>
  </div>
</template>
<script>
import NavHeaderVue from "@/components/layout/NavHeader.vue";
import Main from "@/views/Main.vue";

export default {
  name: 'LayoutMain',
  components: {
    NavHeaderVue,
    Main
  }
}
</script>
<style>
</style>
