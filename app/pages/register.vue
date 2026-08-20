<template>
  <Breadcrumbs />

  <ClientOnly>
    <div class="register-page">
      <div class="container py-5">
        <div class="row justify-content-center">

          <div class="col-lg-8">

            <div class="card shadow-lg border-0 rounded-4">

              <!-- Header -->
              <div class="card-header bg-success text-white text-center py-4">
                <h2 class="mb-0">
                  <i class="bi bi-person-plus-fill me-2"></i>
                  Pilot Registration
                </h2>
              </div>

              <div class="card-body p-4">

                <!-- Success -->
                <div
                  v-if="successMessage"
                  class="alert alert-success"
                >
                  {{ successMessage }}
                </div>

                <!-- Errors -->
                <div
                  v-if="error"
                  class="alert alert-danger"
                  style="white-space: pre-line"
                >
                  {{ error }}
                </div>

                <form @submit.prevent="registerPilot" novalidate>

                  <div class="row">

                    <!-- Name - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Full Name <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.name"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.name }"
                        required
                      >
                      <div v-if="formErrors.name" class="invalid-feedback">
                        {{ formErrors.name }}
                      </div>
                    </div>

                    <!-- Email - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Email <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.email"
                        type="email"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.email }"
                        required
                      >
                      <div v-if="formErrors.email" class="invalid-feedback">
                        {{ formErrors.email }}
                      </div>
                    </div>

                    <!-- Phone - REQUIRED -->
          
<div class="col-md-6 mb-3">
  <label class="form-label fw-semibold">
    Phone <span class="text-danger">*</span>
  </label>

  <input
    v-model="form.phone"
    type="tel"
    class="form-control"
    :class="{ 'is-invalid': formErrors.phone }"
    @input="formatPhoneNumber"
    required
    placeholder="e.g. 03263023"
  >
  <div v-if="formErrors.phone" class="invalid-feedback">
    {{ formErrors.phone }}
  </div>
  <small class="text-muted">Enter phone number without spaces</small>
</div>

                    <!-- DOB - OPTIONAL -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label">
                        Date of Birth
                        <small class="text-muted">(Optional)</small>
                      </label>

                      <input
                        type="date"
                        class="form-control"
                        v-model="form.date_of_birth"
                      >
                    </div>

                    <!-- Blood Type - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Blood Type <span class="text-danger">*</span>
                      </label>

                      <select
                        v-model="form.blood_type"
                        class="form-select"
                        :class="{ 'is-invalid': formErrors.blood_type }"
                        required
                      >
                        <option value="">Select Blood Type</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                        <option>O+</option>
                        <option>O-</option>
                      </select>
                      <div v-if="formErrors.blood_type" class="invalid-feedback">
                        {{ formErrors.blood_type }}
                      </div>
                    </div>

                    <!-- Password - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Password <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.password"
                        type="password"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.password }"
                        required
                        minlength="8"
                      >
                      <div v-if="formErrors.password" class="invalid-feedback">
                        {{ formErrors.password }}
                      </div>
                      <small class="text-muted">Minimum 8 characters</small>
                    </div>

                    <!-- Confirm Password - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Confirm Password <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.password_confirmation"
                        type="password"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.password_confirmation }"
                        required
                      >
                      <div v-if="formErrors.password_confirmation" class="invalid-feedback">
                        {{ formErrors.password_confirmation }}
                      </div>
                    </div>

                    <!-- Insurance Provider - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Insurance Provider <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.insurance_provider"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.insurance_provider }"
                        required
                      >
                      <div v-if="formErrors.insurance_provider" class="invalid-feedback">
                        {{ formErrors.insurance_provider }}
                      </div>
                    </div>

                    <!-- Insurance Number - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Insurance Number <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.insurance_number"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.insurance_number }"
                        required
                      >
                      <div v-if="formErrors.insurance_number" class="invalid-feedback">
                        {{ formErrors.insurance_number }}
                      </div>
                    </div>

                    <!-- Club - REQUIRED -->
                    <div class="col-md-6 mb-4">
                      <label class="form-label fw-semibold">
                        Club <span class="text-danger">*</span>
                      </label>

                      <select
                        v-model="selectedClub"
                        class="form-select"
                        :class="{ 'is-invalid': formErrors.club }"
                        @change="updateClub"
                        required
                      >
                        <option value="">Select Club</option>

                        <option
                          v-for="club in clubs"
                          :key="club.code"
                          :value="club"
                        >
                          {{ club.name }}
                        </option>

                      </select>
                      <div v-if="formErrors.club" class="invalid-feedback">
                        {{ formErrors.club }}
                      </div>
                    </div>

                  </div>


                  <!-- Disciplines -->
<div class="mb-4">
  <label class="form-label fw-bold"> Disciplines <span class="text-danger">*</span>

  </label>
  
  <!-- Always show this container -->
  <div class="border rounded p-3 bg-white">
    
    <!-- Loading State -->
    <div v-if="loadingSports" class="text-center py-3">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <span class="ms-2 text-muted">Loading disciplines...</span>
    </div>

    <!-- Disciplines List -->
    <template v-else-if="sports && sports.length">
      <div 
        v-for="sport in sports" 
        :key="sport.id" 
        class="form-check"
      >
        <input
          class="form-check-input"
          type="checkbox"
          :value="sport.id"
          v-model="form.disciplines"
          @change="evaluateDynamicRatings"
          :id="'sport-'+sport.id"
        >
        <label class="form-check-label" :for="'sport-'+sport.id">
          {{ sport.name }}
        </label>
      </div>
    </template>

    <!-- No Disciplines -->
    <div v-else class="text-center py-3 text-muted">
      <i class="bi bi-exclamation-circle me-2"></i>
      No disciplines available.
      <button 
        @click="loadSports" 
        type="button"
        class="btn btn-sm btn-outline-primary ms-2"
      >
        <i class="bi bi-arrow-repeat me-1"></i> Retry
      </button>
    </div>
    
  </div>
</div>
                  <!-- Ratings -->

                  <div
                    class="mb-4"
                    v-if="allowedRatingsOptions.length"
                  >

                    <label class="form-label fw-bold">
                       Ratings <span class="text-danger">*</span>
                    </label>

                    <div class="border rounded p-3">

                      <div
                        v-for="rating in allowedRatingsOptions"
                        :key="rating"
                        class="form-check"
                      >

                        <input
                          class="form-check-input"
                          type="checkbox"
                          :value="rating"
                          v-model="form.ratings"
                          :id="'rating-'+rating"
                        >

                        <label
                          class="form-check-label"
                          :for="'rating-'+rating"
                        >
                          {{ rating }}
                        </label>

                      </div>

                    </div>

                  </div>
                                    <!-- Profile Picture -->

                  <div class="row">

                    <div class="col-md-6 mb-4">

                      <label class="form-label fw-semibold">
                        Profile Picture
                      </label>

                      <input
                        ref="imageInput"
                        type="file"
                        class="form-control"
                        accept="image/jpeg,image/png,image/webp"
                        @change="handleImage"
                      >

                      <small class="text-muted d-block mt-2">
                        Allowed: JPG, PNG, WEBP (Maximum 2 MB)
                      </small>

                      <div
                        v-if="imageFile"
                        class="alert alert-success py-2 mt-3 mb-0"
                      >
                        <i class="bi bi-image-fill me-2"></i>
                        {{ imageFile.name }}
                      </div>

                    </div>

                    <!-- License -->

                    <div class="col-md-6 mb-4">

                      <label class="form-label fw-semibold">
                        Pilot License
                      </label>

                      <input
                        ref="licenseInput"
                        type="file"
                        class="form-control"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        @change="onLicenseChange"
                      >

                      <small class="text-muted d-block mt-2">
                        Allowed: PDF, JPG, PNG, WEBP (Maximum 5 MB)
                      </small>

                      <div
                        v-if="licenseAttachment"
                        class="alert alert-success py-2 mt-3 mb-0"
                      >
                        <i class="bi bi-file-earmark-check-fill me-2"></i>
                        {{ licenseAttachment.name }}
                      </div>

                    </div>

                  </div>

                  <!-- Submit -->

                  <div class="mt-4">

                    <button
                      type="submit"
                      class="btn btn-success w-100 py-3 fw-bold fs-5"
                      :disabled="loading"
                    >

                      <span
                        v-if="loading"
                        class="spinner-border spinner-border-sm me-2"
                      ></span>

                      <i
                        v-else
                        class="bi bi-person-check-fill me-2"
                      ></i>

                      {{
                        loading
                          ? 'Registering Pilot...'
                          : 'Register Pilot'
                      }}

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
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'

const config = useRuntimeConfig()

const loading = ref(false)
const loadingSports = ref(true) // Add this
const error = ref('')
const successMessage = ref('')

const sports = ref([])
const selectedClub = ref(null)

const imageFile = ref(null)
const licenseAttachment = ref(null)

const imageInput = ref(null)
const licenseInput = ref(null)

const allowedRatingsOptions = ref([])

// Form validation errors
const formErrors = reactive({
  name: '',
  email: '',
  phone: '',
  blood_type: '',
  password: '',
  password_confirmation: '',
  insurance_provider: '',
  insurance_number: '',
  club: '',
  disciplines: '',
  ratings: ''
})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  password: '',
  password_confirmation: '',
  blood_type: '',
  insurance_provider: '',
  insurance_number: '',
  club_name: '',
  club_code: '',
  disciplines: [],
  ratings: [],
  license_attachment: null
})

const clubs = [
  { code: '01', name: 'Thermique' },
  { code: '02', name: 'CLVL' },
  { code: '03', name: 'Northen Eagles' },
  { code: '04', name: 'Sama Lebnan' },
  { code: '05', name: 'Cedars Paragliding' },
  { code: '06', name: 'Sky to Sea' },
  { code: '07', name: 'Paragliding 961' },
  { code: '08', name: 'Fly GYM' },
  { code: '09', name: 'Gravity Outdoors' },
  { code: '10', name: 'Exit to Nature' },
  { code: '11', name: 'Delta Sports' },
  { code: '12', name: 'FAL' },
  { code: '13', name: 'Fly Paragliding' },
  { code: '14', name: 'Paragliding LB' },
  { code: '15', name: 'ROS Outdoors' }
]

const evaluateDynamicRatings = () => {
  const optionsSet = new Set()

  const selectedSportNames = sports.value
    .filter(s => form.disciplines.includes(s.id))
    .map(s => s.name.toLowerCase())

  const hasParaglideGroup = selectedSportNames.some(name =>
    [
      'paragliding',
      'paramotor',
      'paratrike',
      'speedwing',
      'delta plane',
      'speed wing'
    ].includes(name)
  )

  const hasSkydiveGroup =
    selectedSportNames.some(name =>
      name.includes('skydive')
    )

  if (hasParaglideGroup) {
    [
      'P1',
      'P2',
      'P3',
      'P4',
      'TP Non Commercial',
      'TP Commercial',
      'AI',
      'I',
      'MI'
    ].forEach(rate => optionsSet.add(rate))
  }

  if (hasSkydiveGroup) {
    [
      'A',
      'B',
      'C',
      'D',
      'PRO',
      'Coach',
      'Instructor',
      'Examiner',
      'TAN'
    ].forEach(rate => optionsSet.add(rate))
  }

  allowedRatingsOptions.value = [...optionsSet]

  form.ratings = form.ratings.filter(rate =>
    allowedRatingsOptions.value.includes(rate)
  )
}

const handleImage = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    error.value = 'Profile image must be less than 2 MB.'
    return
  }

  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  if (!allowed.includes(file.type)) {
    error.value = 'Profile image must be JPG, PNG or WEBP.'
    return
  }

  error.value = ''
  imageFile.value = file
}

const onLicenseChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    error.value = 'License attachment must be less than 5 MB.'
    return
  }

  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  if (!allowed.includes(file.type)) {
    error.value = 'License must be PDF, JPG, PNG or WEBP.'
    return
  }

  error.value = ''
  licenseAttachment.value = file
}

const updateClub = () => {
  if (!selectedClub.value) return
  form.club_name = selectedClub.value.name
  form.club_code = selectedClub.value.code
}

const loadSports = async (retryCount = 0) => {
  loadingSports.value = true
  error.value = ''
  
  try {
    const response = await $fetch(`${config.public.apiBase}/sports`, {
      timeout: 10000
    })
    
    if (response.data) {
      sports.value = response.data
    } else if (Array.isArray(response)) {
      sports.value = response
    } else {
      sports.value = []
    }
    
    console.log('✅ Sports loaded:', sports.value.length, 'items')
    
    if (sports.value.length === 0 && retryCount < 3) {
      console.log('⚠️ No sports found, retrying...')
      setTimeout(() => loadSports(retryCount + 1), 1000)
    }
    
  } catch (e) {
    console.log('❌ Error loading sports:', e)
    
    if (retryCount < 3) {
      console.log(`🔄 Retrying (${retryCount + 1}/3)...`)
      setTimeout(() => loadSports(retryCount + 1), 2000)
    } else {
      error.value = 'Failed to load disciplines. Please refresh the page.'
      sports.value = []
    }
  } finally {
    loadingSports.value = false
  }
}

// Validate form before submission
const validateForm = () => {
  let isValid = true
  
  // Clear previous errors
  Object.keys(formErrors).forEach(key => formErrors[key] = '')
  
  // Validate Name
  if (!form.name.trim()) {
    formErrors.name = 'Full name is required'
    isValid = false
  }
  
  // Validate Email
  if (!form.email.trim()) {
    formErrors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    formErrors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Validate Phone
  if (!form.phone.trim()) {
    formErrors.phone = 'Phone number is required'
    isValid = false
  }
  
  // Validate Blood Type
  if (!form.blood_type) {
    formErrors.blood_type = 'Blood type is required'
    isValid = false
  }
  
  // Validate Password
  if (!form.password) {
    formErrors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 8) {
    formErrors.password = 'Password must be at least 8 characters'
    isValid = false
  }
  
  // Validate Confirm Password
  if (!form.password_confirmation) {
    formErrors.password_confirmation = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.password_confirmation) {
    formErrors.password_confirmation = 'Passwords do not match'
    isValid = false
  }
  
  // Validate Insurance Provider
  if (!form.insurance_provider.trim()) {
    formErrors.insurance_provider = 'Insurance provider is required'
    isValid = false
  }
  
  // Validate Insurance Number
  if (!form.insurance_number.trim()) {
    formErrors.insurance_number = 'Insurance number is required'
    isValid = false
  }
  
  // Validate Club
  if (!selectedClub.value) {
    formErrors.club = 'Please select a club'
    isValid = false
  }
  
  // Validate Disciplines
  if (form.disciplines.length === 0) {
    formErrors.disciplines = 'Please select at least one discipline'
    isValid = false
  }
  
  // Validate Ratings
  if (form.ratings.length === 0) {
    formErrors.ratings = 'Please select at least one rating'
    isValid = false
  }
  
  return isValid
}

// Format phone number - remove spaces and special characters
const formatPhoneNumber = (e) => {
  // Remove all spaces and special characters except numbers and +
  form.phone = form.phone.replace(/[^\d+]/g, '')
  
  // Optional: Limit to 15 characters (international standard)
  if (form.phone.length > 15) {
    form.phone = form.phone.slice(0, 15)
  }
}
const registerPilot = async () => {
  // Clear previous errors
  error.value = ''
  successMessage.value = ''
  
  // Validate form first
  if (!validateForm()) {
    // Scroll to first error
    const firstError = document.querySelector('.is-invalid')
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstError.focus()
    }
    return
  }

  loading.value = true

  try {
    const formData = new FormData()

    formData.append('name', form.name)
    formData.append('email', form.email)
    formData.append('phone', form.phone)
    formData.append('date_of_birth', form.date_of_birth || '')
    formData.append('password', form.password)
    formData.append('password_confirmation', form.password_confirmation)
    formData.append('blood_type', form.blood_type)
    formData.append('insurance_provider', form.insurance_provider)
    formData.append('insurance_number', form.insurance_number)
    formData.append('club_name', form.club_name)
    formData.append('club_code', form.club_code)

    form.disciplines.forEach(id => {
      formData.append('disciplines[]', id)
    })

    form.ratings.forEach(rate => {
      formData.append('ratings[]', rate)
    })

    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }

    if (licenseAttachment.value) {
      formData.append('license_attachment', licenseAttachment.value)
    }

    const response = await $fetch(
      `${config.public.apiBase}/register`,
      {
        method: 'POST',
        body: formData
      }
    )

    successMessage.value =
      `Registration successful. Your member number is ${response.license_number}. Redirecting to home page...`

    // Reset form
    Object.assign(form, {
      name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      password: '',
      password_confirmation: '',
      blood_type: '',
      insurance_provider: '',
      insurance_number: '',
      club_name: '',
      club_code: '',
      disciplines: [],
      ratings: [],
      license_attachment: null
    })

    selectedClub.value = null
    imageFile.value = null
    licenseAttachment.value = null
    allowedRatingsOptions.value = []

    if (imageInput.value) {
      imageInput.value.value = ''
    }

    if (licenseInput.value) {
      licenseInput.value.value = ''
    }

    setTimeout(() => {
      navigateTo('/')
    }, 2000)

  } catch (err) {
    console.log(err)
    console.log(err.data)

    if (err?.data?.errors) {
      // Display validation errors from server
      const serverErrors = err.data.errors
      Object.keys(serverErrors).forEach(key => {
        if (formErrors[key] !== undefined) {
          formErrors[key] = serverErrors[key][0]
        }
      })
      error.value = Object.values(serverErrors).flat().join('\n')
    } else {
      error.value = err?.data?.message || err?.message || 'Registration failed.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSports()
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f5f7fa 0%,
    #c3cfe2 100%
  );
  padding-top: 100px;
}

.card {
  border-radius: 20px;
}

/* Make sure disciplines are always visible */
.form-check {
  padding: 4px 0 !important;
}

.is-invalid {
  border-color: #dc3545 !important;
}

.invalid-feedback {
  display: block !important;
}

/* Ensure the disciplines border shows error state */
.border.is-invalid {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.text-danger {
  color: #dc3545 !important;
}
.form-check .form-check-input {
    float: left;
    margin-left: 0.5em;
}
.form-check-label{
  margin-left: 5px;
}
</style>