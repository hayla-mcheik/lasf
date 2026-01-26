<template>
  <div class="qrcodes-admin">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-qr-code-scan me-3 text-primary"></i>
            QR Codes Management
          </h1>
          <div class="d-flex align-items-center gap-3">
            <p class="text-muted mb-0">
              <i class="bi bi-geo-alt me-1"></i>
              Manage QR codes for flying locations
            </p>
            <span class="badge bg-primary-subtle text-primary">
              {{ totalQRCodes }} QR codes
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="text-center">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading QR codes...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>Error:</strong> {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input v-model="searchQuery" type="text" class="form-control" placeholder="Search locations...">
          </div>
        </div>
        <div class="col-md-4">
          <select v-model="regionFilter" class="form-select">
            <option value="">All Regions</option>
            <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <select v-model="qrStatusFilter" class="form-select">
            <option value="">All QR Status</option>
            <option value="has_qr">Has QR Code</option>
            <option value="no_qr">No QR Code</option>
          </select>
        </div>
      </div>

      <!-- Locations with QR Codes -->
      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="location in filteredLocations" :key="location.id">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 class="mb-0 fw-semibold">{{ location.name }}</h6>
              <span :class="`badge bg-${location.is_enabled ? 'success' : 'secondary'}`">
                {{ location.is_enabled ? 'Active' : 'Disabled' }}
              </span>
            </div>
            
            <div class="card-body">
              <!-- Location Info -->
              <div class="mb-3">
                <div class="d-flex align-items-center mb-2">
                  <i class="bi bi-geo-alt text-muted me-2"></i>
                  <span class="text-muted">{{ location.region }}</span>
                </div>
                <div class="d-flex align-items-center mb-2">
                  <i class="bi bi-sports text-muted me-2"></i>
                  <div>
                    <span v-for="sport in location.sports" :key="sport.id" class="badge bg-light text-dark me-1 mb-1">
                      {{ sport.name }}
                    </span>
                  </div>
                </div>
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-calendar-check text-muted me-2"></i>
                  <span class="text-muted">
                    {{ location.active_sessions || 0 }} active sessions
                  </span>
                </div>
              </div>

              <!-- Clearance Status -->
              <div class="mb-4">
                <h6 class="fw-semibold mb-2">Clearance Status</h6>
                <div v-if="location.latest_clearance" class="d-flex align-items-center">
                  <div :class="`status-indicator ${location.latest_clearance.status}`">
                    <i :class="location.latest_clearance.status === 'green' ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                  </div>
                  <div class="ms-3">
                    <div class="fw-semibold text-capitalize">{{ location.latest_clearance.status }}</div>
                    <small class="text-muted">{{ formatTimeAgo(location.latest_clearance.created_at) }}</small>
                    <div v-if="location.latest_clearance.reason" class="small text-muted mt-1">
                      {{ location.latest_clearance.reason }}
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted">
                  No clearance status set
                </div>
              </div>

              <!-- QR Code Section -->
              <div class="qr-section">
                <h6 class="fw-semibold mb-3">QR Code</h6>
                
                <div v-if="location.qr_code" class="text-center">
                  <!-- QR Code Display -->
                  <div class="qr-code-preview mb-3">
                    <canvas ref="qrCanvas" class="d-none"></canvas>
                    <img :src="generateQRImage(location.qr_code.token)" alt="QR Code" 
                         class="img-fluid rounded border" style="max-width: 150px;">
                  </div>
                  
                  <!-- QR Info -->
                  <div class="qr-info mb-3">
                    <div class="input-group input-group-sm mb-2">
                      <input :value="generateQRURL(location.qr_code.token)" 
                             type="text" 
                             class="form-control form-control-sm" 
                             readonly>
                      <button class="btn btn-outline-secondary" @click="copyQRURL(location)">
                        <i class="bi bi-clipboard"></i>
                      </button>
                    </div>
                    <small class="text-muted d-block">
                      <i class="bi bi-calendar me-1"></i>
                      Created {{ formatTimeAgo(location.qr_code.created_at) }}
                    </small>
                  </div>
                  
                  <!-- QR Actions -->
                  <div class="d-grid gap-2">
                    <button class="btn btn-sm btn-outline-primary" @click="downloadQR(location)">
                      <i class="bi bi-download me-2"></i>
                      Download QR
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmRegenerateQR(location)">
                      <i class="bi bi-arrow-repeat me-2"></i>
                      Regenerate
                    </button>
                  </div>
                </div>
                
                <!-- No QR Code -->
                <div v-else class="text-center py-3">
                  <div class="mb-3">
                    <i class="bi bi-qr-code display-5 text-muted"></i>
                  </div>
                  <p class="text-muted mb-3">No QR code generated</p>
                  <button class="btn btn-sm btn-primary" @click="generateQR(location)">
                    <i class="bi bi-plus-circle me-2"></i>
                    Generate QR Code
                  </button>
                </div>
              </div>
            </div>
            
            <div class="card-footer bg-white border-top">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                  <i class="bi bi-clock me-1"></i>
                  Updated {{ formatTimeAgo(location.updated_at) }}
                </small>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" 
                          data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <NuxtLink :to="`/admin/flying-locations/${location.id}/edit`" class="dropdown-item">
                        <i class="bi bi-pencil me-2"></i> Edit Location
                      </NuxtLink>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="viewSessions(location)">
                        <i class="bi bi-clock-history me-2"></i> View Sessions
                      </a>
                    </li>
                    <li v-if="!location.qr_code">
                      <a class="dropdown-item" href="#" @click.prevent="generateQR(location)">
                        <i class="bi bi-qr-code me-2"></i> Generate QR
                      </a>
                    </li>
                    <li v-else>
                      <a class="dropdown-item" href="#" @click.prevent="downloadQR(location)">
                        <i class="bi bi-download me-2"></i> Download QR
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Regenerate QR Modal -->
    <div v-if="showRegenerateModal" class="modal fade show d-block" tabindex="-1" 
         :class="{ show: showRegenerateModal }">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom bg-warning text-white">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Regenerate QR Code
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeRegenerateModal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="warning-icon mb-4">
              <i class="bi bi-qr-code fs-1 text-warning"></i>
            </div>
            <h5 class="fw-bold">Regenerate QR Code</h5>
            <p class="text-muted">
              Are you sure you want to regenerate the QR code for 
              <strong class="text-warning">{{ locationToRegenerate?.name }}</strong>?
            </p>
            <div class="alert alert-warning small">
              <i class="bi bi-info-circle me-2"></i>
              This will invalidate the existing QR code. Any printed codes will no longer work.
            </div>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-outline-secondary" @click="closeRegenerateModal">
              Cancel
            </button>
            <button type="button" class="btn btn-warning" @click="regenerateQR" :disabled="regenerating">
              <span v-if="regenerating" class="spinner-border spinner-border-sm me-2"></span>
              Regenerate QR Code
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="showRegenerateModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import QRCode from 'qrcode'

definePageMeta({
  layout: 'admin',
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

// Data
const loading = ref(false)
const regenerating = ref(false)
const error = ref(null)

const locations = ref([])
const regions = ref([])

// Filters
const searchQuery = ref('')
const regionFilter = ref('')
const qrStatusFilter = ref('')

// Modals
const showRegenerateModal = ref(false)
const locationToRegenerate = ref(null)

// Computed
const filteredLocations = computed(() => {
  return locations.value.filter(location => {
    // Search filter
    if (searchQuery.value && !location.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
        !location.region.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }
    
    // Region filter
    if (regionFilter.value && location.region !== regionFilter.value) {
      return false
    }
    
    // QR Status filter
    if (qrStatusFilter.value === 'has_qr' && !location.qr_code) {
      return false
    }
    if (qrStatusFilter.value === 'no_qr' && location.qr_code) {
      return false
    }
    
    return true
  })
})

const totalQRCodes = computed(() => {
  return locations.value.filter(l => l.qr_code).length
})

// Methods
const fetchLocations = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Using $fetch like news categories
    const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/flying-locations?with_qr=true&with_clearance=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data && data.data) {
      locations.value = data.data
    } else {
      locations.value = data
    }
    
  } catch (err) {
    console.error('Failed to fetch locations:', err)
    error.value = err.message || 'Failed to load locations.'
    
    // Fallback to mock data for development
    if (config.public.devMode) {
      console.log('Using mock data for development')
      locations.value = [
        {
          id: 1,
          name: 'Mount Eagle',
          region: 'Northern Region',
          is_enabled: true,
          sports: [{ id: 1, name: 'Paragliding' }],
          active_sessions: 5,
          latest_clearance: {
            status: 'green',
            reason: 'Clear weather',
            created_at: '2024-01-10T10:30:00Z'
          },
          qr_code: {
            id: 1,
            token: 'qr-12345',
            created_at: '2024-01-10T10:30:00Z'
          },
          updated_at: '2024-01-10T10:30:00Z'
        },
        {
          id: 2,
          name: 'Valley View',
          region: 'Southern Region',
          is_enabled: true,
          sports: [{ id: 2, name: 'Paramotor' }],
          active_sessions: 3,
          latest_clearance: {
            status: 'red',
            reason: 'Strong winds',
            created_at: '2024-01-09T14:20:00Z'
          },
          qr_code: null,
          updated_at: '2024-01-09T14:20:00Z'
        }
      ]
      error.value = null
    }
  } finally {
    loading.value = false
  }
}

const fetchRegions = async () => {
  try {
    const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/flying-locations/regions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data && data.success) {
      regions.value = data.data || []
    }
  } catch (err) {
    console.error('Failed to fetch regions:', err)
    // Fallback to mock data
    if (config.public.devMode) {
      regions.value = ['Northern Region', 'Southern Region', 'Eastern Region', 'Western Region']
    }
  }
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`
  return `${Math.floor(diffMins / 10080)}w ago`
}

const generateQRURL = (token, locationId) => {
  const baseURL = window.location.origin 
  // This will create a link like: https://lasf.info/location/11?token=your-uuid-token
  return `${baseURL}/location/${locationId}?token=${token}`
}

const generateQRImage = (token) => {
  const qrURL = generateQRURL(token)
  // Using a QR code generation service
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrURL)}`
}

const copyQRURL = async (location) => {
  if (!location.qr_code?.token) return
  
  const url = generateQRURL(location.qr_code.token)
  try {
    await navigator.clipboard.writeText(url)
    alert('QR Code URL copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = url
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('QR Code URL copied to clipboard!')
  }
}

const downloadQR = async (location) => {
  if (!location.qr_code?.token) return
  
  try {
    const qrURL = generateQRURL(location.qr_code.token)
    const canvas = document.createElement('canvas')
    
    await QRCode.toCanvas(canvas, qrURL, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    // Create download link
    const link = document.createElement('a')
    link.download = `qr-${location.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    alert('QR Code downloaded successfully!')
  } catch (err) {
    console.error('Failed to generate QR code:', err)
    alert('Failed to download QR code')
  }
}

const generateQR = async (location) => {
  try {
    const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/flying-locations/${location.id}/generate-qr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data.success || data.data) {
      // Update the location with new QR code
      const index = locations.value.findIndex(l => l.id === location.id)
      if (index !== -1) {
        locations.value[index].qr_code = data.data || data
      }
      alert('QR code generated successfully!')
    } else {
      throw new Error(data.message || 'Failed to generate QR code')
    }
  } catch (err) {
    console.error('Failed to generate QR code:', err)
    alert(err.message || 'Failed to generate QR code')
  }
}

const confirmRegenerateQR = (location) => {
  locationToRegenerate.value = location
  showRegenerateModal.value = true
}

const regenerateQR = async () => {
  if (!locationToRegenerate.value) return
  
  try {
    regenerating.value = true
    
    // First delete existing QR code if exists
    if (locationToRegenerate.value.qr_code) {
      await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/qr-codes/${locationToRegenerate.value.qr_code.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })
    }
    
    // Generate new QR code
    await generateQR(locationToRegenerate.value)
    
    closeRegenerateModal()
    
  } catch (err) {
    console.error('Failed to regenerate QR code:', err)
    alert('Failed to regenerate QR code')
  } finally {
    regenerating.value = false
  }
}

const viewSessions = (location) => {
  navigateTo(`/admin/flying-locations/${location.id}/sessions`)
}

const closeRegenerateModal = () => {
  showRegenerateModal.value = false
  locationToRegenerate.value = null
}

onMounted(async () => {
  await Promise.all([
    fetchLocations(),
    fetchRegions()
  ])
})
</script>

<style scoped>
.qrcodes-admin {
  padding: 1.5rem 0;
  background: #f8f9fa;
  min-height: 100vh;
}

.dashboard-header {
  padding: 1.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* Card Styles */
.card {
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 12px;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
}

/* Status Indicator */
.status-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.status-indicator.green {
  background-color: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.status-indicator.red {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

/* QR Code Section */
.qr-section {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
  margin-top: 1rem;
}

.qr-code-preview {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.qr-code-preview img {
  width: 100%;
  max-width: 150px;
  height: auto;
}

/* QR Info */
.qr-info .input-group {
  max-width: 300px;
  margin: 0 auto;
}

/* Modal Styles */
.modal-content {
  border-radius: 12px;
}

.modal-header {
  border-radius: 12px 12px 0 0;
}

.modal-backdrop {
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .qr-code-preview {
    padding: 0.5rem;
  }
  
  .qr-code-preview img {
    max-width: 120px;
  }
  
  .qr-info .input-group {
    max-width: 100%;
  }
}
</style>