<template>
  <div class="pilot-profile-page py-5">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading pilot profile...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
      </div>

      <!-- Pilot Profile Card -->
      <div v-else-if="pilot" class="d-flex flex-column align-items-center">
        <!-- FRONT OF CARD -->
        <div class="lasf-official-card front-side position-relative">
          <div class="brand-top-band"></div>
          
          <div class="brand-header-area d-flex align-items-center justify-content-between">
            <div class="brand-logo-graphics">
              <img src="/assets/images/logocard.png" alt="LASF" class="img-fluid" @error="(e) => e.target.style.display='none'">
            </div>
            <div class="brand-title-text">
       
            </div>
          </div>

          <div class="disclaimer-red-block text-start">
            <p class="m-0 disclaimer-paragraph">
              The holder of this card pledges to comply with and respect the safety standards and the instructions of the federation and the instructors. He fully understands the risks associated with this sport and releases the LASF from all liability, assuming full responsibility for any damages or losses to property or life, whether caused intentionally or unintentionally.
            </p>
            <p class="m-0 contact-line mt-1">
              For more information or to initiate a claim, please call +96171909008.
            </p>
          </div>
        </div>

        <!-- BACK OF CARD -->
        <div class="lasf-official-card lasf-official-cardtwo back-side text-start position-relative">
          <div class="brand-top-band"></div>

          <div class="pilot-header-row d-flex align-items-end px-4 pt-3 mb-2">
            <div class="pilot-photo-frame me-3 position-relative">
              <img 
                :src="getAvatarUrl(pilot?.image)" 
                class="pilot-card-img"
                @error="(e) => e.target.src = '/assets/images/avatarpilot.jpg'"
              >
            </div>
            <div class="pilot-identity pb-1">
              <h2 class="m-0 pilot-fullname text-dark">{{ pilot.user?.name || 'Pilot' }}</h2>
              <div class="m-0 pilot-disciplines text-muted text-capitalize">
                <span v-for="(disc, index) in (pilot.disciplines || [])" :key="disc.id">
                  {{ disc.name }}<span v-if="index < pilot.disciplines.length - 1"> | </span>
                </span>
                <span v-if="!pilot.disciplines?.length">No Active Disciplines</span>
              </div>
              <div class="m-0 pilot-dob text-muted">
                {{ pilot.date_of_birth ? formatDate(pilot.date_of_birth) : 'N/A' }}
              </div>
            </div>
          </div>

          <div class="px-4 data-grid-matrix row m-0 g-0">
            <div class="col-6 p-0 pe-2 d-flex flex-column gap-1">
              <div>
                <label class="matrix-label">Member No.</label>
                <div class="matrix-value text-dark font-roboto">{{ pilot.license_number || 'Pending' }}</div>
              </div>
              <div>
                <label class="matrix-label">Blood type</label>
                <div class="matrix-value text-dark font-roboto">{{ pilot.blood_type || 'O+' }}</div>
              </div>
              <div>
                <label class="matrix-label">Ratings</label>
                <div class="matrix-value text-dark font-roboto">{{ pilot.ratings || 'N/A' }}</div>
              </div>
            </div>

            <div class="col-6 p-0 ps-2 d-flex flex-column gap-1">
              <div>
                <label class="matrix-label">Insurance</label>
                <div class="matrix-value text-dark text-truncate font-roboto" style="max-width: 160px;">
                  {{ pilot.insurance_provider || 'N/A' }} 
                  <span v-if="pilot.insurance_number">#{{ pilot.insurance_number }}</span>
                </div>
              </div>
              <div>
                <label class="matrix-label">Club member of</label>
                <div class="matrix-value text-dark text-truncate font-roboto">{{ pilot.club_name || 'N/A' }}</div>
              </div>
              <div>
                <label class="matrix-label">Valid until</label>
                <div class="matrix-value text-dark font-roboto fw-bold" style="color: #2e7d32;">
                  {{ pilot.valid_until ? formatDate(pilot.valid_until) : '19/05/2027' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Back to Home Button -->
        <div class="mt-4 hide-on-print">
          <NuxtLink to="/" class="btn btn-outline-secondary px-4">
            <i class="bi bi-arrow-left me-2"></i> Back to Home
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// SEO
useHead({
  title: 'Pilot Profile'
})

const route = useRoute()
const config = useRuntimeConfig()

const pilot = ref(null)
const loading = ref(false)
const error = ref(null)

const getAvatarUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/avatarpilot.jpg'
  let baseUrl = config.public.apiBase
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.replace(/\/api$/, '')
  }
  return `${baseUrl}${imagePath}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'N/A'
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  } catch {
    return 'N/A'
  }
}

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const license = String(route.params.license || '')
    const data = await $fetch(
      `${config.public.apiBase}/pilot/${encodeURIComponent(license)}`
    )

    if (data?.pilot) {
      pilot.value = data.pilot
    } else {
      throw new Error('Pilot not found')
    }
  } catch (err) {
    error.value = err?.data?.message || err?.message || 'Pilot not found. Please check the license number.'
    console.error('Error loading pilot:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

.pilot-profile-page {
  background: #f0f2f5;
  min-height: 100vh;
  padding: 2rem 0;
}

/* Card Styles - Same as Membership Card */
.lasf-official-card {
  width: 340px;
  max-width: 100%;
  background-color: #ffffff !important;
  border-radius: 0px !important;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
  border: 1px solid #d3d3d3;
  box-sizing: border-box;
  print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.lasf-official-cardtwo {
  height: 215px !important;
}

.brand-top-band {
  background-color: #c62828 !important;
  height: 18px;
  width: 100%;
  print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important;
}

/* Front Side */
.brand-header-area {
  height: 70px;
  padding: 0 15px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.brand-logo-graphics {
  width: 130px;
  height: 85px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-logo-graphics img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.brand-title-text {
  text-align: center;
  flex: 1;
  line-height: 1.1;
}

.brand-title-text .main-title {
  font-size: 0.55rem;
  color: #1a1a1a;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin: 0;
}

/* Disclaimer */
.disclaimer-red-block {
  background-color: #c62828 !important;
  height: 100px;
  padding: 8px 15px;
  color: #ffffff !important;
  print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important;
}

.disclaimer-paragraph {
  font-size: 0.55rem !important;
  line-height: 1.3;
  font-weight: 300;
  text-align: justify;
}

.contact-line {
  font-size: 0.55rem !important;
  font-weight: 500;
}

/* Back Side */
.pilot-header-row {
  height: 75px;
  padding-top: 5px !important;
  padding-bottom: 0 !important;
}

.pilot-photo-frame {
  width: 85px !important;
  height: 100px !important;
  background: #f0f0f0 !important;
  overflow: hidden;
  margin-top: -10px;
  border-radius: 4px;
  z-index: 10;
  print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important;
  flex-shrink: 0;
}

.pilot-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pilot-identity {
  max-width: calc(100% - 80px);
}

.pilot-fullname {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a1a;
}

.pilot-disciplines {
  font-size: 0.65rem;
  font-weight: 500;
  color: #666;
}

.pilot-dob {
  font-size: 0.6rem;
  color: #888;
}

/* Data Grid */
.data-grid-matrix .matrix-label {
  display: block;
  font-size: 0.5rem;
  color: #888;
  margin-bottom: 1px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.data-grid-matrix .matrix-value {
  font-size: 0.7rem;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.2;
}

.data-grid-matrix .gap-1 {
  gap: 3px !important;
}

/* Responsive */
@media (max-width: 576px) {
  .lasf-official-card {
    width: 100%;
    max-width: 340px;
  }
  
  .lasf-official-cardtwo {
    height: 200px !important;
  }
  
  .brand-header-area {
    height: 60px;
    padding: 0 10px;
    gap: 10px;
  }
  
  .brand-logo-graphics {
    width: 100px;
    height: 65px;
  }
  
  .brand-title-text .main-title {
    font-size: 0.45rem;
    letter-spacing: 0.3px;
  }
  
  .disclaimer-red-block {
    height: 85px;
    padding: 6px 10px;
  }
  
  .disclaimer-paragraph {
    font-size: 0.48rem !important;
  }
  
  .contact-line {
    font-size: 0.48rem !important;
  }
  
  .pilot-header-row {
    height: 65px;
    padding: 0 12px !important;
  }
  
  .pilot-photo-frame {
    width: 85px !important;
    height: 90px !important;
    margin-top: -8px;
  }
  
  .pilot-identity {
    max-width: calc(100% - 70px);
  }
  
  .pilot-fullname {
    font-size: 0.8rem;
  }
  
  .pilot-disciplines {
    font-size: 0.55rem;
  }
  
  .pilot-dob {
    font-size: 0.5rem;
  }
  
  .data-grid-matrix .matrix-value {
    font-size: 0.6rem;
  }
  
  .data-grid-matrix .matrix-label {
    font-size: 0.45rem;
  }
}
</style>