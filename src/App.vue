<template>
  <!-- <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav> -->
  <SnakeGame />
  <!-- <RouterView /> -->
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
import SnakeGame from "./components/SnakeGame.vue";
</script>

<style>
</style>
