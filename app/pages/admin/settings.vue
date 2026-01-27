<template>
  <div class="settings-admin container-fluid">
    <div class="dashboard-header mb-4">
      <h1 class="display-6 fw-bold text-dark mb-2">
        <i class="bi bi-gear me-3 text-primary"></i> Account Settings
      </h1>
      <p class="text-muted">Update your administrative credentials and security</p>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <form @submit.prevent="updateAccount">
              <h5 class="mb-4">Profile Information</h5>
              <div class="mb-3">
                <label class="form-label fw-bold">Name</label>
                <input v-model="form.name" type="text" class="form-control" required>
              </div>
              <div class="mb-4">
                <label class="form-label fw-bold">Email Address</label>
                <input v-model="form.email" type="email" class="form-control" required>
              </div>

              <hr class="my-4">

              <h5 class="mb-4">Change Password</h5>
              <div class="mb-3">
                <label class="form-label fw-bold">Current Password</label>
                <input v-model="form.current_password" type="password" class="form-control" placeholder="Required to change password">
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">New Password</label>
                <input v-model="form.new_password" type="password" class="form-control">
              </div>
              <div class="mb-4">
                <label class="form-label fw-bold">Confirm New Password</label>
                <input v-model="form.new_password_confirmation" type="password" class="form-control">
              </div>

              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })
const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(false)
const form = reactive({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

const updateAccount = async () => {
  loading.value = true
  try {
    const data = await $fetch(`${config.public.apiBase}/user/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: {
        name: form.name,
        email: form.email,
        current_password: form.current_password,
        new_password: form.new_password,
        new_password_confirmation: form.new_password_confirmation
      }
    })
    alert('Account updated successfully!')
    // Update local store with new data
    authStore.user = data.user
    // Clear password fields
    form.current_password = ''
    form.new_password = ''
    form.new_password_confirmation = ''
  } catch (err) {
    alert(err.data?.message || 'Update failed')
  } finally {
    loading.value = false
  }
}
</script>