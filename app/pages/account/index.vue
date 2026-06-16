<template>
  <Breadcrumbs />
  <div class="membership-card-page py-5">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading your membership details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
      </div>

      <!-- Membership Card -->
      <div v-else-if="membership && membership.user && membership.user.pilot_profile" class="d-flex flex-column align-items-center">
        
        <!-- Header Actions -->
        <div class="d-flex justify-content-between align-items-center w-100 mb-4 hide-on-print" style="max-width: 420px;">
          <div class="d-flex gap-2">
            <button class="btn btn-outline-danger btn-sm" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-1"></i> Logout
            </button>
            <button class="btn btn-success btn-sm" @click="printCard">
              <i class="bi bi-printer me-1"></i> Print
            </button>
          </div>
        </div>

        <!-- FRONT OF CARD -->
        <div class="lasf-official-card front-side position-relative" id="membership-card">
          <div class="brand-top-band"></div>
          
          <div class="brand-header-area d-flex align-items-center justify-content-between">
            <div class="brand-logo-graphics">
              <img src="/assets/images/logocard.png" alt="LASF" class="img-fluid" @error="(e) => e.target.style.display='none'">
            </div>
            <div class="brand-title-text">
  
            </div>
            <div class="qr-code-wrapper">
              <img 
                v-if="qrCodeData" 
                :src="qrCodeData" 
                alt="QR Code" 
                class="qr-code-image"
              >
              <div v-else class="qr-placeholder">
                <i class="bi bi-qr-code"></i>
              </div>
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
                :src="getAvatarUrl(membership.user.pilot_profile?.image)" 
                class="pilot-card-img"
                @error="(e) => e.target.src = '/assets/images/avatarpilot.jpg'"
              >
            </div>
            <div class="pilot-identity pb-1">
              <h2 class="m-0 pilot-fullname text-dark">{{ membership.user.name }}</h2>
              <div class="m-0 pilot-disciplines text-muted text-capitalize">
                {{ formatDisciplinesString(membership.user.pilot_profile) }}
              </div>
              <div class="m-0 pilot-dob text-muted">
                {{ formatDate(membership.user.pilot_profile?.date_of_birth) }}
              </div>
            </div>
          </div>

          <div class="px-4 data-grid-matrix row m-0 g-0">
            <div class="col-6 p-0 pe-2 d-flex flex-column gap-1">
              <div>
                <label class="matrix-label">Member No.</label>
                <div class="matrix-value text-dark font-roboto">{{ membership.user.pilot_profile?.license_number || 'Pending' }}</div>
              </div>
              <div>
                <label class="matrix-label">Blood type</label>
                <div class="matrix-value text-dark font-roboto">{{ membership.user.pilot_profile?.blood_type || 'O+' }}</div>
              </div>
              <div>
                <label class="matrix-label">Ratings</label>
                <div class="matrix-value text-dark font-roboto">{{ membership.user.pilot_profile?.ratings || 'N/A' }}</div>
              </div>
            </div>

            <div class="col-6 p-0 ps-2 d-flex flex-column gap-1">
              <div>
                <label class="matrix-label">Insurance</label>
                <div class="matrix-value text-dark text-truncate font-roboto" style="max-width: 160px;">
                  {{ membership.user.pilot_profile?.insurance_provider || 'N/A' }} 
                  <span v-if="membership.user.pilot_profile?.insurance_number">#{{ membership.user.pilot_profile.insurance_number }}</span>
                </div>
              </div>
              <div>
                <label class="matrix-label">Club member of</label>
                <div class="matrix-value text-dark text-truncate font-roboto">{{ membership.user.pilot_profile?.club_name || 'N/A' }}</div>
              </div>
              <div>
                <label class="matrix-label">Valid until</label>
                <div class="matrix-value text-dark font-roboto fw-bold" style="color: #2e7d32;">
                  {{ formatDate(membership.user.pilot_profile?.valid_until) || '19/05/2027' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Button -->
        <div class="mt-4 hide-on-print">
          <NuxtLink to="/account/edit" class="btn btn-outline-success px-4">
            <i class="bi bi-pencil me-2"></i> Edit Membership
          </NuxtLink>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="text-center py-5">
        <i class="bi bi-person-x display-1 text-muted"></i>
        <h4 class="mt-3">No membership data found</h4>
        <p class="text-muted">Please contact the federation for assistance.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'

// SEO
useHead({
  title: 'My Membership Card'
})

const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()

const membership = ref(null)
const loading = ref(false)
const error = ref(null)
const qrCodeData = ref(null)

const getAvatarUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/avatarpilot.jpg'
  let baseUrl = config.public.apiBase
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.replace(/\/api$/, '')
  }
  return `${baseUrl}${imagePath}`
}

const formatDisciplinesString = (profile) => {
  if (!profile?.disciplines?.length) return 'No Active Disciplines'
  return profile.disciplines.map(d => d.name).join(' | ')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const printCard = () => {
  window.print()
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Generate QR Code with member data
const generateQRCode = async () => {
  if (!membership.value?.user) return
  
  try {
    // Get the license number
    const license = membership.value?.user?.pilot_profile?.license_number
    
    if (!license) {
      console.warn('No license number found for QR code')
      return
    }
    
    // Create the URL that links to the public pilot profile
    // Using the route: /pilot/{license}
    const baseUrl = window.location.origin
    const profileUrl = `${baseUrl}/pilot/${encodeURIComponent(license)}`
    
    console.log('QR Code URL:', profileUrl)
    
    // Generate QR Code as data URL
    const qrDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 80,
      margin: 2,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
    
    qrCodeData.value = qrDataUrl
  } catch (err) {
    console.error('Failed to generate QR Code:', err)
  }
}

// Watch for membership data changes
watch(membership, (newVal) => {
  if (newVal?.user?.pilot_profile?.license_number) {
    generateQRCode()
  }
}, { immediate: true })

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    membership.value = await $fetch(
      `${config.public.apiBase}/my-membership`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )
    console.log('Membership data:', membership.value)
    await generateQRCode()
  } catch (err) {
    error.value = err.data?.message || 'Failed to load membership data. Please try again.'
    console.error('Error loading membership:', err)
  } finally {
    loading.value = false
  }
})
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

.membership-card-page {
  background: #f0f2f5;
  min-height: 100vh;
  padding: 2rem 0;
}

/* Card Styles - Standard ID Card Size (85.6mm x 53.98mm) */
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
  padding: 0 35px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
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

/* QR Code */
.qr-code-wrapper {
  width: 55px;
  height: 55px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 3px;
}

.qr-code-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-placeholder {
  font-size: 1.5rem;
  color: #ccc;
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

/* Print Styles */
@media print {
  body, html, #__nuxt, #layout-wrapper {
    visibility: hidden !important;
    background: none !important;
  }
  
  .lasf-official-card,
  .lasf-official-card * {
    visibility: visible !important;
  }
  
  .lasf-official-card {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    box-shadow: none !important;
    border: 1px solid #d3d3d3 !important;
    page-break-inside: avoid;
    margin-bottom: 10px;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
    width: 340px !important;
  }

  .lasf-official-cardtwo {
    page-break-before: always;
  }
  
  .hide-on-print {
    display: none !important;
  }
  
  .brand-top-band {
    background-color: #c62828 !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
  
  .disclaimer-red-block {
    background-color: #c62828 !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
  
  .qr-code-wrapper {
    border: 1px solid #e0e0e0 !important;
  }
  
  .pilot-photo-frame {
    border: 2px solid #c62828 !important;
  }
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
    padding: 0 30px;
    gap: 6px;
  }
  
  .brand-logo-graphics {
    width: 100px;
    height: 65px;
  }
  
  .brand-title-text .main-title {
    font-size: 0.45rem;
    letter-spacing: 0.3px;
  }
  
  .qr-code-wrapper {
    width: 45px;
    height: 45px;
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