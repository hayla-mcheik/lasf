<template>
<ClientOnly>
  <div class="login-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-lg border-0 rounded-4">
            <div class="card-header text-white text-center py-4" :class="isPilotMode ? 'bg-success' : 'bg-primary'">
              <h2 class="mb-0">
                <i :class="isPilotMode ? 'bi bi-qr-code-scan' : 'bi bi-person-badge'"></i>
                {{ isPilotMode ? 'Pilot Airspace Entry' : 'Admin Login' }}
              </h2>
            </div>
            
            <div class="card-body p-4">
              <form @submit.prevent="handleLogin">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>

                <div class="mb-3">
                  <label class="form-label fw-bold">{{ isPilotMode ? 'License Number' : 'Email Address' }}</label>
                  <input v-model="identifier" type="text" class="form-control" :placeholder="isPilotMode ? 'PG-LB-001' : 'admin@lasf.lb'" required />
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold">{{ isPilotMode ? 'Phone Number' : 'Password' }}</label>
                  <input 
                    v-model="securityValue" 
                    :type="isPilotMode ? 'tel' : 'password'" 
                    class="form-control" 
                    :placeholder="isPilotMode ? '03123456' : '••••••••'" 
                    required 
                  />
                </div>

                <button type="submit" class="btn btn-lg w-100 py-3 text-white" :class="isPilotMode ? 'bg-success' : 'bg-primary'">
                   {{ isPilotMode ? 'Verify & Check-In' : 'Admin Login' }}
                </button>

                <div class="text-center mt-3">
                    <button type="button" @click="isPilotMode = !isPilotMode" class="btn btn-link btn-sm text-decoration-none">
                        {{ isPilotMode ? 'Admin Login' : 'Pilot Entry' }}
                    </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</ClientOnly>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const identifier = ref('')
const securityValue = ref('')
const error = ref('')
const isPilotMode = ref(false)

onMounted(() => {
    // If arriving from QR, default to Pilot Mode
    if (localStorage.getItem('pending_location_slug') || route.query.source === 'qr') {
        isPilotMode.value = true
    }
})

const handleLogin = async () => {
  error.value = ''
  
  const payload = isPilotMode.value 
    ? { license_number: identifier.value, phone: securityValue.value }
    : { email: identifier.value, password: securityValue.value }

  const result = await authStore.login(payload)

  if (result.success) {
    // 1. Check for the 'redirect' query parameter first (from the URL)
    const redirectPath = route.query.redirect
    
    // 2. Check for the legacy localStorage slug
    const pendingSlug = localStorage.getItem('pending_location_slug')

    if (redirectPath) {
      // If ?redirect=/location/batroun exists, go there
      navigateTo(redirectPath)
    } else if (pendingSlug) {
      // If we have a stored slug, go there
      localStorage.removeItem('pending_location_slug')
      navigateTo(`/location/${pendingSlug}?auto_checkin=true`)
    } else {
      // Default fallback
      navigateTo(authStore.isAdmin ? '/admin/dashboard' : '/')
    }
  } else {
    error.value = 'Verification failed. Please check your details.'
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding-top: 100px; }
.card { border-radius: 20px; }
.btn-primary{
    background-color: #0f6847 !important;
    border-radius: 0px;
    padding: 10px 15px;
    width: 50%;
    margin: auto;
}
.bg-primary{
  background-color: #0f6847 !important;
}
.btn-link{
  color: #0f6847 !important;
}
</style>