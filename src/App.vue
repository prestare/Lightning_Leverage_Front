<template>
  <div>
    <Main></Main>
  </div>
</template>

<script>
import Main from './views/Main.vue';
export default {
  name: 'app',
  components:{Main},
  props: {
    msg: String
  }
}
</script>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
  height: 100%;
  width: 100%;
  position: absolute;
  body {
    position:absolute;
    margin: 0;
    height: 100vh;
    width: 100vw;
  }
  html{
    position:absolute;
    margin: 0;
    height: 100vh;
    width: 100vw;
  }
}
</style>
