<template>
  <RouterView />
  <ShoppingCart />
</template>

<!-- <script setup lang="ts">
import ShoppingCart from './components/ShoppingCart.vue';
</script> -->

<style lang="scss">
@import 'scss/main.scss';

#app {
  font-family: 'Inter', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 20rem;
}
</style>
