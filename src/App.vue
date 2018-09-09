<template>
  <div id="app">
    <AdUsers />
  </div>
</template>

<script>
import AdUsers from './components/AdUsers'

export default {
  name: 'app',
  components: {
    AdUsers
  }
}
</script>

<style src="./assets/style.css"></style>
<style lang="scss">
#app {
  margin-top: 48px;
}
</style>
