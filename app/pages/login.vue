<template>
<Breadcrumbs title="Login" />
  <ClientOnly>
    <div class="login-page">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="card shadow-lg border-0 rounded-4">
              <!-- Card Header with Mode Selection -->
            <div
  class="card-header text-white text-center py-4"
:class="[
  loginType === 'pilot'
    ? 'bg-success text-white'
    : loginType === 'army'
      ? 'bg-warning text-dark'
      : loginType === 'watcher'
        ? 'bg-info text-white'
        : 'bg-primary text-white'
]"
>

  <h2 class="mb-0">

    <template v-if="loginType === 'pilot'">
      <i class="bi bi-qr-code-scan"></i>
      Pilot Login
    </template>

    <template v-else-if="loginType === 'army'">
      <i class="bi bi-shield-lock"></i>
      Army Login
    </template>
<template v-else-if="loginType === 'watcher'">
  <i class="bi bi-eye"></i>
  Watcher Login
</template>
    <template v-else>
      <i class="bi bi-person-badge"></i>
      Admin Login
    </template>

  </h2>

</div>
              
             <div class="card-body p-4">

  <div class="d-flex gap-2 mb-4">

    <button
      type="button"
      class="btn flex-fill"
      :class="loginType === 'pilot'
        ? 'btn-success'
        : 'btn-outline-success'"
      @click="loginType = 'pilot'"
    >
      Pilot
    </button>

    <button
      type="button"
      class="btn flex-fill mx-2"
      :class="loginType === 'army'
        ? 'btn-warning'
        : 'btn-outline-warning'"
      @click="loginType = 'army'"
    >
      Army
    </button>
    <button
  type="button"
  class="btn flex-fill"
  :class="loginType === 'watcher'
    ? 'btn-info'
    : 'btn-outline-info'"
  @click="loginType = 'watcher'"
>
  Watcher
</button>

    <button
      type="button"
      class="btn flex-fill"
      :class="loginType === 'admin'
        ? 'btn-primary'
        : 'btn-outline-primary'"
      @click="loginType = 'admin'"
    >
      Admin
    </button>

  </div>

  <form @submit.prevent="handleLogin">

    <div
      v-if="error"
      class="alert alert-danger"
    >
      {{ error }}
    </div>

    <div class="mb-3">

      <label class="form-label fw-bold">

        {{
          loginType === 'pilot'
            ? 'License Number'
            : 'Email Address'
        }}

      </label>

      <input
        v-model="identifier"
        type="text"
        class="form-control"
        :placeholder="
          loginType === 'pilot'
            ? '26-08-0001'
            : 'admin@lasf.lb'
        "
        required
      >

    </div>

    <div class="mb-4">

      <label class="form-label fw-bold">

        {{
          loginType === 'pilot'
            ? 'Phone Number'
            : 'Password'
        }}

      </label>

      <input
        v-model="securityValue"
        :type="
          loginType === 'pilot'
            ? 'tel'
            : 'password'
        "
        class="form-control"
        :placeholder="
          loginType === 'pilot'
            ? '03123456'
            : '••••••••'
        "
        required
      >

    </div>

    <button
      type="submit"
      class="btn btn-lg w-100 py-3 text-white"
:class="
  loginType === 'pilot'
    ? 'bg-success'
    : loginType === 'army'
      ? 'bg-warning'
      : loginType === 'watcher'
        ? 'bg-info'
        : 'bg-primary'
"
    >

{{
  loginType === 'pilot'
    ? 'Pilot Login'
    : loginType === 'army'
      ? 'Army Login'
      : loginType === 'watcher'
        ? 'Watcher Login'
        : 'Admin Login'
}}

    </button>

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
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const identifier = ref('')
const securityValue = ref('')
const error = ref('')

const loginType = ref('pilot')

onMounted(() => {

  window.scrollTo(0, 0)

  if (route.query.type === 'army') {
    loginType.value = 'army'
  }

  if (
    localStorage.getItem('pending_location_slug') ||
    route.query.source === 'qr'
  ) {
    loginType.value = 'pilot'
  }

})

const handleLogin = async () => {

  error.value = ''


const payload =
  loginType.value === 'pilot'
    ? {
        license_number: identifier.value,
        phone: securityValue.value
      }
    : {
        email: identifier.value,
        password: securityValue.value,
        login_type: loginType.value
      }


  const result =
    await authStore.login(payload)
console.log('RESULT:', result)
console.log('USER:', authStore.user)
console.log('ROLE:', authStore.user?.role)
console.log('IS ADMIN:', authStore.isAdmin)
console.log('IS ARMY:', authStore.isArmy)
console.log('IS WATCHER:', authStore.isWatcher)

  if (!result.success) {

    error.value = result.message

    return

  }


  /*
  |--------------------------------------------------------------------------
  | REDIRECT QUERY
  |--------------------------------------------------------------------------
  */

  const redirectPath =
    route.query.redirect


  if (redirectPath) {

    await navigateTo(redirectPath)

    return

  }


  /*
  |--------------------------------------------------------------------------
  | QR PILOT REDIRECTION
  |--------------------------------------------------------------------------
  */

  const pendingSlug = import.meta.client

    ? localStorage.getItem(
        'pending_location_slug'
      )

    : null


  if (pendingSlug) {

    localStorage.removeItem(
      'pending_location_slug'
    )


    await navigateTo(

      `/location/${pendingSlug}?auto_checkin=true`

    )


    return

  }


  /*
  |--------------------------------------------------------------------------
  | ADMIN
  |--------------------------------------------------------------------------
  */

  if (authStore.isAdmin) {

    await navigateTo(
      '/admin/dashboard'
    )

    return

  }


  /*
  |--------------------------------------------------------------------------
  | ARMY
  |--------------------------------------------------------------------------
  */

  if (authStore.isArmy) {

    await navigateTo(
      '/admin/dashboard'
    )

    return

  }


  /*
  |--------------------------------------------------------------------------
  | WATCHER
  |--------------------------------------------------------------------------
  */

if (authStore.isWatcher) {

    console.log('WATCHER REDIRECT')

    await navigateTo('/admin/dashboard', {
        replace: true
    })

    return

}


  /*
  |--------------------------------------------------------------------------
  | PILOT
  |--------------------------------------------------------------------------
  */

  await navigateTo('/account')

}
</script>

<style scoped>
.login-page { 
  min-height: 100vh; 
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
  padding-top: 100px; 
}

.card { 
  border-radius: 20px; 
  overflow: hidden;
}

.card-header {
  border-bottom: none;
}

.bg-primary {
  background-color: #0f6847 !important;
}

.btn-primary {
  background-color: #0f6847 !important;
  border-color: #0f6847 !important;
}

.btn-primary:hover {
  background-color: #0a4d34 !important;
  border-color: #0a4d34 !important;
}

.btn-outline-primary {
  color: #0f6847 !important;
  border-color: #0f6847 !important;
}

.btn-outline-primary:hover,
.btn-outline-primary.active {
  background-color: #0f6847 !important;
  color: #fff !important;
  border-color: #0f6847 !important;
}

.btn-outline-success.active {
  background-color: #198754 !important;
  color: #fff !important;
}

.btn-outline-warning.active {
  background-color: #ffc107 !important;
  color: #000 !important;
}

.btn-link {
  color: #0f6847 !important;
}

.btn-link:hover {
  color: #0a4d34 !important;
}

.btn-group .btn {
  flex: 1;
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-radius: 4px 0 0 4px;
}

.btn-group .btn:last-child {
  border-radius: 0 4px 4px 0;
}

.btn-group .btn:not(:first-child):not(:last-child) {
  border-radius: 0;
}

.form-control:focus {
  border-color: #0f6847;
  box-shadow: 0 0 0 0.2rem rgba(15, 104, 71, 0.15);
}

.alert {
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 576px) {
  .login-page {
    padding-top: 60px;
  }
  
  .card-header h2 {
    font-size: 1.25rem;
  }
  
  .btn-group .btn {
    font-size: 0.8rem;
    padding: 0.5rem 0.25rem;
  }
}
</style>