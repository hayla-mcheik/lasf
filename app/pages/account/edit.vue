<template>
  <Breadcrumbs />
  <div class="edit-membership-page py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">
              <i class="bi bi-pencil-square me-2 text-success"></i> Edit Membership
            </h2>
            <NuxtLink to="/account" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-1"></i> Back to Account
            </NuxtLink>
          </div>

          <!-- Loading State -->
          <div v-if="loading && !form.name" class="text-center py-5">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading your membership data...</p>
          </div>

          <!-- Edit Form -->
          <div v-else class="card shadow-sm border-0">
            <div class="card-body p-4">
              <!-- Global Error Alert -->
              <div v-if="globalError" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ globalError }}
                <button type="button" class="btn-close" @click="globalError = null"></button>
              </div>

      

              <form @submit.prevent="saveMembership" novalidate>
                <!-- Personal Information -->
                <h5 class="text-success border-bottom pb-2 mb-3">
                  <i class="bi bi-person-badge me-2"></i> Personal Information
                </h5>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold small">
                      Full Name <span class="text-danger">*</span>
                    </label>
                    <input
                      v-model="form.name"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.name }"
                      required
                    >
                    <div v-if="errors.name" class="invalid-feedback">{{ Array.isArray(errors.name) ? errors.name[0] : errors.name }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold small">Email</label>
                    <input
                      :value="userEmail"
                      type="email"
                      class="form-control"
                      disabled
                    >
                    <small class="text-muted">Email cannot be changed</small>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold small">
                      Phone Number <span class="text-danger">*</span>
                    </label>
                    <input
                      v-model="form.phone"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.phone }"
                      required
                    >
                    <div v-if="errors.phone" class="invalid-feedback">{{ Array.isArray(errors.phone) ? errors.phone[0] : errors.phone }}</div>
                  </div>

                  <div class="col-md-6">
              <label class="form-label fw-bold small">
  Date of Birth
  <small class="text-muted">(Optional)</small>
</label>
         <input
  v-model="form.date_of_birth"
  type="date"
  class="form-control"
  :class="{ 'is-invalid': errors.date_of_birth }"
>
                    <div v-if="errors.date_of_birth" class="invalid-feedback">{{ Array.isArray(errors.date_of_birth) ? errors.date_of_birth[0] : errors.date_of_birth }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold small">
                      Blood Type <span class="text-danger">*</span>
                    </label>
                    <select
                      v-model="form.blood_type"
                      class="form-select"
                      :class="{ 'is-invalid': errors.blood_type }"
                      required
                    >
                      <option value="">Select Blood Type</option>
                      <option v-for="type in bloodTypes" :key="type" :value="type">
                        {{ type }}
                      </option>
                    </select>
                    <div v-if="errors.blood_type" class="invalid-feedback">{{ Array.isArray(errors.blood_type) ? errors.blood_type[0] : errors.blood_type }}</div>
                  </div>
                </div>

                <!-- Insurance Information -->
                <h5 class="text-success border-bottom pb-2 mb-3 mt-4">
                  <i class="bi bi-shield-shaded me-2"></i> Insurance Information
                </h5>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold small">Insurance Provider</label>
                    <input
                      v-model="form.insurance_provider"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.insurance_provider }"
                      placeholder="e.g. Commercial Insurance"
                    >
                    <div v-if="errors.insurance_provider" class="invalid-feedback">{{ Array.isArray(errors.insurance_provider) ? errors.insurance_provider[0] : errors.insurance_provider }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold small">Insurance Policy Number</label>
                    <input
                      v-model="form.insurance_number"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.insurance_number }"
                      placeholder="Policy ID Tag"
                    >
                    <div v-if="errors.insurance_number" class="invalid-feedback">{{ Array.isArray(errors.insurance_number) ? errors.insurance_number[0] : errors.insurance_number }}</div>
                  </div>
                </div>

                <!-- Social Media -->
                <h5 class="text-success border-bottom pb-2 mb-3 mt-4">
                  <i class="bi bi-share me-2"></i> Social Media
                </h5>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold small">Facebook URL</label>
                    <input
                      v-model="form.facebook_url"
                      type="url"
                      class="form-control"
                      :class="{ 'is-invalid': errors.facebook_url }"
                      placeholder="https://facebook.com/username"
                    >
                    <div v-if="errors.facebook_url" class="invalid-feedback">{{ Array.isArray(errors.facebook_url) ? errors.facebook_url[0] : errors.facebook_url }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold small">Instagram URL</label>
                    <input
                      v-model="form.instagram_url"
                      type="url"
                      class="form-control"
                      :class="{ 'is-invalid': errors.instagram_url }"
                      placeholder="https://instagram.com/username"
                    >
                    <div v-if="errors.instagram_url" class="invalid-feedback">{{ Array.isArray(errors.instagram_url) ? errors.instagram_url[0] : errors.instagram_url }}</div>
                  </div>
                </div>

                <!-- Disciplines -->
<div class="col-12 mt-3">

    <label class="form-label fw-bold small">
        Disciplines <span class="text-danger">*</span>
    </label>

    <div
        class="border rounded p-3"
        :class="{ 'border-danger': errors.disciplines }"
    >

        <div
            v-for="discipline in disciplines"
            :key="discipline.id"
            class="form-check form-check-inline mb-2"
        >

            <input
                class="form-check-input"
                type="checkbox"
                :id="`discipline-${discipline.id}`"
                :value="discipline.id"
                v-model="form.disciplines"
            >

            <label
                class="form-check-label"
                :for="`discipline-${discipline.id}`"
            >
                {{ discipline.name }}
            </label>

        </div>

    </div>

    <div
        v-if="errors.disciplines"
        class="invalid-feedback d-block"
    >
        {{ Array.isArray(errors.disciplines)
            ? errors.disciplines[0]
            : errors.disciplines
        }}
    </div>

</div>
<!-- License Attachment -->
<h5 class="text-success border-bottom pb-2 mb-3 mt-4">
    <i class="bi bi-file-earmark-pdf me-2"></i>
    Pilot License
</h5>

<div class="row g-3">

    <div class="col-12">

        <div class="mb-3">

            <label class="form-label fw-bold small">
                Current License
            </label>

            <div v-if="currentLicense">

                <a
                    :href="currentLicense"
                    target="_blank"
                    class="btn btn-outline-success btn-sm"
                >
                    <i class="bi bi-eye"></i>
                    View Current License
                </a>

            </div>

            <div v-else class="text-muted">
                No license uploaded.
            </div>

        </div>

        <label class="form-label fw-bold small">
            Upload New License
        </label>

        <input
            ref="licenseInput"
            type="file"
            class="form-control"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            @change="onLicenseChange"
        >

        <small class="text-muted">
            PDF, JPG, PNG or WEBP (Max 5MB)
        </small>

    </div>

</div>
                <!-- Profile Image -->
                <h5 class="text-success border-bottom pb-2 mb-3 mt-4">
                  <i class="bi bi-image me-2"></i> Profile Image
                </h5>

                <div class="row g-3">
                  <div class="col-12">
                    <div class="d-flex align-items-center gap-4">
                      <div class="current-avatar">
                        <img
                          v-if="currentImage"
                          :src="currentImage"
                          alt="Current Profile"
                          class="rounded-circle border"
                          style="width: 80px; height: 80px; object-fit: cover;"
                        >
                        <div v-else class="avatar-placeholder rounded-circle bg-light d-flex align-items-center justify-content-center border" style="width: 80px; height: 80px;">
                          <i class="bi bi-person display-6 text-muted"></i>
                        </div>
                      </div>
                      <div class="flex-grow-1">
                        <label class="form-label fw-bold small">Upload New Image</label>
                        <input
                          type="file"
                          class="form-control"
                          :class="{ 'is-invalid': errors.image }"
                          accept="image/*"
                          @change="onFileChange"
                        >
                        <small class="text-muted">Max file size: 2MB. Supported formats: JPG, PNG, WEBP</small>
                        <div v-if="errors.image" class="invalid-feedback d-block">{{ Array.isArray(errors.image) ? errors.image[0] : errors.image }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Submit Buttons -->
                <div class="d-flex gap-3 mt-4 pt-3 border-top">
                  <button
                    type="submit"
                    class="btn btn-success px-4"
                    :disabled="saving"
                  >
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                    {{ saving ? 'Saving...' : 'Save Changes' }}
                  </button>
                  <NuxtLink to="/account" class="btn btn-outline-secondary px-4">
                    Cancel
                  </NuxtLink>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'

// SEO
useHead({
  title: 'Edit Membership'
})

const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()
const licenseInput = ref(null)
const currentLicense = ref(null)
const loading = ref(false)
const saving = ref(false)
const errors = ref({})
const globalError = ref(null)
const imageFile = ref(null)
const licenseFile = ref(null)
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const disciplines = ref([])
const form = ref({
  name: '',
  phone: '',
  blood_type: '',
  insurance_provider: '',
  insurance_number: '',
  facebook_url: '',
  instagram_url: '',
  date_of_birth: '',
  disciplines: [],
  image: null,
  license_attachment: null
})


// Field labels for error display
const fieldLabels = {
  name: 'Full Name',
  phone: 'Phone Number',
  date_of_birth: 'Date of Birth',
  blood_type: 'Blood Type',
  insurance_provider: 'Insurance Provider',
  insurance_number: 'Insurance Number',
  facebook_url: 'Facebook URL',
  instagram_url: 'Instagram URL',
  image: 'Profile Image'
}

const getFieldLabel = (field) => {
  return fieldLabels[field] || field
}

const userEmail = computed(() => {
  return authStore.user?.email || ''
})

const currentImage = ref(null)

const getAvatarUrl = (imagePath) => {
  if (!imagePath) return null
  let baseUrl = config.public.apiBase
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.replace(/\/api$/, '')
  }
  return `${baseUrl}${imagePath}`
}

const fetchMembership = async () => {
  loading.value = true
  errors.value = {}
  globalError.value = null

  try {
    const data = await $fetch(
      `${config.public.apiBase}/my-membership`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    const user = data.user
    
    form.value.name = user.name || ''
    form.value.phone = user.phone || ''
    form.value.disciplines =
    user.pilot_profile?.disciplines?.map(d => d.id) || []
    form.value.blood_type = user.pilot_profile?.blood_type || ''
    form.value.insurance_provider = user.pilot_profile?.insurance_provider || ''
    form.value.insurance_number = user.pilot_profile?.insurance_number || ''
    form.value.facebook_url = user.pilot_profile?.facebook_url || ''
    form.value.instagram_url = user.pilot_profile?.instagram_url || ''
    form.value.date_of_birth = user.pilot_profile?.date_of_birth ? 
      user.pilot_profile.date_of_birth.substring(0, 10) : ''
    
    if (user.pilot_profile?.image) {
      currentImage.value = getAvatarUrl(user.pilot_profile.image)
    }
    if (user.pilot_profile?.licenses_attachments) {
    currentLicense.value = getAvatarUrl(
        user.pilot_profile.licenses_attachments
    )
}

  } catch (err) {
    console.error('Failed to load membership:', err)
    globalError.value = 'Failed to load membership data. Please try again.'
  } finally {
    loading.value = false
  }
}

const fetchDisciplines = async () => {
    try {

        const data = await $fetch(
            `${config.public.apiBase}/sports`,
            {
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        )

        disciplines.value = data.data || data

    } catch (err) {

        console.error('Failed to load disciplines:', err)

    }
}
const onFileChange = (event) => {

    const file = event.target.files[0]

    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
        errors.value.image = 'File size must be less than 2MB'
        return
    }

    const validTypes = ['image/jpeg','image/png','image/webp']

    if (!validTypes.includes(file.type)) {
        errors.value.image = 'File must be JPG, PNG or WEBP'
        return
    }

    delete errors.value.image

    imageFile.value = file

    const reader = new FileReader()

    reader.onload = e => {
        currentImage.value = e.target.result
    }

    reader.readAsDataURL(file)

}
const onLicenseChange = (event) => {

    const file = event.target.files[0]

    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
        errors.value.license_attachment =
            'License must be smaller than 5MB.'
        return
    }

    delete errors.value.license_attachment

    licenseFile.value = file

}

const saveMembership = async () => {
  saving.value = true
  errors.value = {}
  globalError.value = null

  try {
    // Client-side validation before sending
    if (!form.value.name.trim()) {
      errors.value.name = 'Full name is required'
      saving.value = false
      return
    }
    if (!form.value.phone.trim()) {
      errors.value.phone = 'Phone number is required'
      saving.value = false
      return
    }

    if (!form.value.blood_type) {
      errors.value.blood_type = 'Blood type is required'
      saving.value = false
      return
    }

    const formData = new FormData()
    
    // Add all form fields
    formData.append('name', form.value.name.trim())
    formData.append('phone', form.value.phone.trim())
    formData.append('blood_type', form.value.blood_type)
    formData.append('date_of_birth', form.value.date_of_birth)
    form.value.disciplines.forEach((disciplineId) => {
    formData.append('disciplines[]', disciplineId)
})
    if (form.value.insurance_provider) {
      formData.append('insurance_provider', form.value.insurance_provider.trim())
    }
    if (form.value.insurance_number) {
      formData.append('insurance_number', form.value.insurance_number.trim())
    }
    if (form.value.facebook_url) {
      formData.append('facebook_url', form.value.facebook_url.trim())
    }
    if (form.value.instagram_url) {
      formData.append('instagram_url', form.value.instagram_url.trim())
    }
    
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }
if (licenseFile.value) {
    formData.append(
        'license_attachment',
        licenseFile.value
    )
}
    // Add method spoofing for PUT
    formData.append('_method', 'PUT')

    await $fetch(
      `${config.public.apiBase}/my-membership`,
      {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    // Success - show message and redirect
 alert('Membership updated successfully!')
licenseFile.value = null
if (licenseInput.value) {
    licenseInput.value.value = ''
}

router.push('/account')
  } catch (err) {
    console.error('Update failed:', err)
    
    if (err.status === 422) {
      // Validation errors from backend
      errors.value = err.data.errors || {}
      
      // Check if there are any errors and show the first one in a summary
      const errorMessages = Object.values(errors.value).flat()
      if (errorMessages.length > 0) {
        globalError.value = `Please fix the following: ${errorMessages[0]}`
      }
    } else if (err.status === 403) {
      globalError.value = err.data?.message || 'You do not have permission to update this membership.'
    } else if (err.status === 404) {
      globalError.value = 'Membership not found. Please try again.'
    } else {
      globalError.value = err.data?.message || 'Update failed. Please try again.'
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
    await Promise.all([
        fetchMembership(),
        fetchDisciplines()
    ])
})
</script>

<style scoped>
.edit-membership-page {
  background: #f8f9fa;
  min-height: 100vh;
}

.card {
  border-radius: 12px;
  overflow: hidden;
}

.form-control:focus,
.form-select:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 0 0.2rem rgba(46, 125, 50, 0.15);
}

.btn-success {
  background-color: #2e7d32;
  border-color: #2e7d32;
}

.btn-success:hover {
  background-color: #1b5e20;
  border-color: #1b5e20;
}

.btn-success:disabled {
  background-color: #4caf50;
  border-color: #4caf50;
}

.avatar-placeholder {
  background-color: #f0f0f0;
}

/* Error styles */
.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

.alert ul {
  padding-left: 1.25rem;
  margin-bottom: 0;
}

.alert ul li {
  margin-bottom: 0.25rem;
}

.alert ul li:last-child {
  margin-bottom: 0;
}

/* Mobile Responsive */
@media (max-width: 576px) {
  .edit-membership-page {
    padding: 1rem 0;
  }
  
  .card-body {
    padding: 1.25rem !important;
  }
  
  .current-avatar {
    width: 60px;
    height: 60px;
  }
  
  .current-avatar img,
  .avatar-placeholder {
    width: 60px !important;
    height: 60px !important;
  }
}
</style>