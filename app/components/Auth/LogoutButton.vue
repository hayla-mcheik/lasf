<!-- components/Auth/LogoutButton.vue -->
<template>
  <button @click="handleLogout" class="btn btn-outline-danger btn-sm">
    <i class="bi bi-box-arrow-right me-1"></i> Logout
  </button>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    authStore.logout()
  }
}
</script>