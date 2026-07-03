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

                <form @submit.prevent="registerPilot">

                  <div class="row">

                    <!-- Name -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Full Name
                      </label>

                      <input
                        v-model="form.name"
                        type="text"
                        class="form-control"
                        required
                      >
                    </div>

                    <!-- Email -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Email
                      </label>

                      <input
                        v-model="form.email"
                        type="email"
                        class="form-control"
                        required
                      >
                    </div>

                    <!-- Phone -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Phone
                      </label>

                      <input
                        v-model="form.phone"
                        type="text"
                        class="form-control"
                        required
                      >
                    </div>

                    <!-- DOB -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Date of Birth
                      </label>

                      <input
                        v-model="form.date_of_birth"
                        type="date"
                        class="form-control"
                        required
                      >
                    </div>

                    <!-- Blood -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Blood Type
                      </label>

                      <select
                        v-model="form.blood_type"
                        class="form-select"
                        required
                      >
                        <option value="">Select</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                        <option>O+</option>
                        <option>O-</option>
                      </select>
                    </div>

                    <!-- Password -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Password
                      </label>

                      <input
                        v-model="form.password"
                        type="password"
                        class="form-control"
                        required
                      >
                    </div>

                    <!-- Confirm Password -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Confirm Password
                      </label>

                      <input
                        v-model="form.password_confirmation"
                        type="password"
                        class="form-control"
                        required
                      >
                    </div>

                    <!-- Insurance Provider -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Insurance Provider
                      </label>

                      <input
                        v-model="form.insurance_provider"
                        type="text"
                        class="form-control"
                      >
                    </div>

                    <!-- Insurance Number -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Insurance Number
                      </label>

                      <input
                        v-model="form.insurance_number"
                        type="text"
                        class="form-control"
                      >
                    </div>

                    <!-- Club -->
                    <div class="col-md-6 mb-4">

                      <label class="form-label fw-semibold">
                        Club
                      </label>

                      <select
                        v-model="selectedClub"
                        class="form-select"
                        @change="updateClub"
                        required
                      >
                        <option value="">
                          Select Club
                        </option>

                        <option
                          v-for="club in clubs"
                          :key="club.code"
                          :value="club"
                        >
                          {{ club.name }}
                        </option>

                      </select>

                    </div>

                  </div>

                  <!-- Disciplines -->

                  <div class="mb-4">

                    <label class="form-label fw-bold">
                      Disciplines
                    </label>

                    <div class="border rounded p-3">

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

                        <label
                          class="form-check-label"
                          :for="'sport-'+sport.id"
                        >
                          {{ sport.name }}
                        </label>

                      </div>

                    </div>

                  </div>

                  <!-- Ratings -->

                  <div
                    class="mb-4"
                    v-if="allowedRatingsOptions.length"
                  >

                    <label class="form-label fw-bold">
                      Ratings
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
const error = ref('')
const successMessage = ref('')

const sports = ref([])
const selectedClub = ref(null)

const imageFile = ref(null)
const licenseAttachment = ref(null)

const imageInput = ref(null)
const licenseInput = ref(null)

const allowedRatingsOptions = ref([])

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
    error.value =
      'License must be PDF, JPG, PNG or WEBP.'
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

const loadSports = async () => {

  try {

    sports.value = await $fetch(
      `${config.public.apiBase}/sports`
    )

  } catch (e) {

    console.log(e)

  }

}
const registerPilot = async () => {

  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {

    if (form.disciplines.length === 0) {
      error.value = 'Please select at least one discipline.'
      loading.value = false
      return
    }

    if (form.ratings.length === 0) {
      error.value = 'Please select at least one rating.'
      loading.value = false
      return
    }

    const formData = new FormData()

    formData.append('name', form.name)
    formData.append('email', form.email)
    formData.append('phone', form.phone)
    formData.append('date_of_birth', form.date_of_birth)

    formData.append('password', form.password)
    formData.append(
      'password_confirmation',
      form.password_confirmation
    )

    formData.append('blood_type', form.blood_type)

    formData.append(
      'insurance_provider',
      form.insurance_provider || ''
    )

    formData.append(
      'insurance_number',
      form.insurance_number || ''
    )

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
      formData.append(
        'license_attachment',
        licenseAttachment.value
      )
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

    if (err?.data?.errors) {

      error.value = Object.values(
        err.data.errors
      ).flat().join('\n')

    } else {

      error.value =
        err?.data?.message ||
        'Registration failed.'

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

</style>

