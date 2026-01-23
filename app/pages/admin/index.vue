<template>
  <div></div>
</template>

<script setup>
definePageMeta({
  middleware: 'admin'
})

onMounted(() => {
  navigateTo('/admin/dashboard')
})
</script>