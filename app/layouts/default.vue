<template>
  <div>
    <TheHeader />
    <div class="">
      <div class="">
      <slot />
      </div>
    </div>
    <TheFooter />
  </div>
</template>

<script setup>
// Import components directly
import TheHeader from '../components/Frontend/TheHeader.vue'
import TheFooter from '../components/Frontend/TheFooter.vue'
</script>