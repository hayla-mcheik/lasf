<template>
  <div class="app-layout">
    <TheHeader />

    <main class="app-main">
      <slot />
    </main>

    <TheFooter />
  </div>
</template>

<script setup>
import TheHeader from '~/components/Frontend/TheHeader.vue'
import TheFooter from '~/components/Frontend/TheFooter.vue'
</script>

<style>
.app-layout {
  width: 100%;
  min-width: 0;
}

.app-main {
  width: 100%;
  min-width: 0;
}
</style>