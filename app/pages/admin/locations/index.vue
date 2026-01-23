<template>
  <div class="flying-locations-admin">
    <div class="dashboard-header mb-6 shadow-sm p-4 bg-white">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-geo-alt me-3 text-primary"></i>
            Flying Locations Management
          </h1>
          <div class="d-flex align-items-center gap-3">
            <p class="text-muted mb-0">
              <i class="bi bi-info-circle me-1"></i>
              Manage technical coordinates (Kato/Nazim) and QR airspace reservation.
            </p>
            <span class="badge bg-primary-subtle text-primary">
              {{ pagination.total }} locations
            </span>
          </div>
        </div>
        <button class="btn btn-primary d-flex align-items-center shadow" @click="openCreateModal">
          <i class="bi bi-plus-circle me-2"></i> Add New Location
        </button>
      </div>
    </div>

    <div v-if="!loading" class="container-fluid px-4">
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
            <input v-model="searchQuery" type="text" class="form-control border-start-0" 
                   placeholder="Search by name, type, or coordinates..." @input="handleSearch">
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Location & Type</th>
                <th class="text-center">Takeoff (K/N)</th>
                <th class="text-center">Status</th>
                <th class="text-center">QR Code</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="location in locations" :key="location.id">
                <td class="ps-4">
                  <div class="fw-bold">{{ location.name }}</div>
                  <span class="badge bg-info-subtle text-info small">{{ location.type }}</span>
                </td>
                <td class="text-center small">
                  <div>K: {{ location.takeoff_kato }}</div>
                  <div class="text-muted">N: {{ location.takeoff_nazim }}</div>
                </td>
                <td class="text-center">
                  <span :class="`status-badge-modern ${getCurrentStatus(location).status}`">
                    <span class="pulse-dot"></span>
                    {{ getCurrentStatus(location).label }}
                  </span>
                </td>
<td class="text-center">
  <button v-if="location.qr_code" class="btn btn-sm btn-success shadow-sm" @click="showQRCode(location)">
    <i class="bi bi-qr-code"></i> View QR
  </button>
  
  <button v-else 
          class="btn btn-sm btn-outline-primary" 
          @click="generateQRCode(location)"
          :disabled="generatingId === location.id">
    <span v-if="generatingId === location.id" class="spinner-border spinner-border-sm me-1"></span>
    <i v-else class="bi bi-plus-circle"></i> 
    Generate QR
  </button>
</td>
                <td class="text-center">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-light border" @click="editLocation(location)"><i class="bi bi-pencil"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal fade show d-block" @click.self="closeModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">{{ editingLocation ? 'Edit Location' : 'Create Location' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveLocation">
            <div class="modal-body custom-scrollbar" style="max-height: 70vh; overflow-y: auto;">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Name</label>
                  <input v-model="form.name" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Type (Excel)</label>
                  <input v-model="form.type" type="text" class="form-control" required>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Takeoff Kato</label>
                  <input v-model="form.takeoff_kato" type="text" class="form-control">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Takeoff Nazim</label>
                  <input v-model="form.takeoff_nazim" type="text" class="form-control">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Landing Kato</label>
                  <input v-model="form.landing_kato" type="text" class="form-control">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Landing Nazim</label>
                  <input v-model="form.landing_nazim" type="text" class="form-control">
                </div>
                <div class="col-md-12">
                  <label class="form-label fw-bold">Max Altitude</label>
                  <input v-model="form.max_altitude" type="text" class="form-control">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Status</label>
                  <select v-model="form.clearance_status" class="form-select">
                    <option value="green">Green (Open)</option>
                    <option value="red">Red (Closed)</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showQRModal" class="modal fade show d-block" @click.self="closeQRModal">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-qr-code me-2"></i> QR Access</h5>
            <button type="button" class="btn-close" @click="closeQRModal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="p-3 bg-white border rounded">
              <canvas ref="qrCodeRef" class="img-fluid"></canvas>
              <h6 class="mt-3 fw-bold">{{ selectedLocation?.name }}</h6>
              <p class="text-muted small">Token: {{ selectedLocation?.qr_code?.token }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary w-100" @click="downloadQR">Download PNG</button>
          </div>
        </div>
      </div>
    </div>

<div v-if="showCreateModal || showQRModal" 
     class="modal-backdrop fade show" 
     @click="closeModal"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import QRCode from 'qrcode'
import { useAuthStore } from '~/stores/auth'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()
const config = useRuntimeConfig()
const { $toast } = useNuxtApp()

// State
const locations = ref([])
const loading = ref(false)
const saving = ref(false)
const showCreateModal = ref(false)
const showQRModal = ref(false)
const editingLocation = ref(null)
const selectedLocation = ref(null)
const qrCodeRef = ref(null)
const searchQuery = ref('')
const pagination = reactive({ total: 0 })

const form = reactive({
  name: '', type: '', takeoff_kato: '', takeoff_nazim: '',
  landing_kato: '', landing_nazim: '', max_altitude: '',
  clearance_status: 'green', is_enabled: true
})

// Functions
const fetchLocations = async () => {
  loading.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/admin/flying-locations?search=${searchQuery.value}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    locations.value = res.data || res
    pagination.total = locations.value.length
  } catch (err) {
    $toast.error('Failed to load data')
  } finally {
    loading.value = false
  }
}

const showQRCode = async (location) => {
  selectedLocation.value = location
  showQRModal.value = true
  await nextTick()
  
  if (location.qr_code?.token && qrCodeRef.value) {
    const url = `${window.location.origin}/reserve/${location.slug}?token=${location.qr_code.token}`
    QRCode.toCanvas(qrCodeRef.value, url, { width: 220, margin: 2 })
  }
}

// أضف هذا المتغير في قسم الـ State
const generatingId = ref(null)

const generateQRCode = async (location) => {
  generatingId.value = location.id // تفعيل حالة التحميل لهذا الزر فقط
  
  try {
    const res = await $fetch(`${config.public.apiBase}/admin/flying-locations/${location.id}/generate-qr`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (res.success) {
      // 1. ابحث عن مكان هذا الموقع في المصفوفة الحالية
      const index = locations.value.findIndex(l => l.id === location.id)
      
      if (index !== -1) {
        // 2. تحديث الكائن بالكامل (Object Spread) 
        // هذه الطريقة تجبر Vue على إعادة رندر هذا السطر فوراً
        const updatedLocation = {
          ...locations.value[index],
          qr_code: res.data // تأكد أن السيرفر يرجع بيانات الـ QR في res.data
        }
        
        locations.value[index] = updatedLocation
        
        $toast.success('QR Code Generated Successfully')
        
        // 3. فتح نافذة العرض تلقائياً للمستخدم بعد التوليد
        showQRCode(updatedLocation)
      }
    }
  } catch (err) {
    console.error('QR Generation Error:', err)
    $toast.error('Failed to generate QR code')
  } finally {
    generatingId.value = null // إغلاق حالة التحميل
  }
}
// Add this helper function at the top of your script
const showToast = (type, message) => {
  try {
    if (typeof $toast !== 'undefined') {
      if (type === 'success' && $toast.success) {
        $toast.success(message)
      } else if (type === 'error' && $toast.error) {
        $toast.error(message)
      } else if ($toast) {
        $toast(message) // Fallback
      }
    } else {
      // Fallback if $toast is not available
      console.log(`${type.toUpperCase()}: ${message}`)
      
      // Optionally use a different toast library or simple alert
      if (process.client) {
        // You could use a simple browser notification
        if (type === 'error') {
          alert('Error: ' + message)
        } else {
          alert(message)
        }
      }
    }
  } catch (e) {
    console.error('Toast error:', e)
  }
}

const saveLocation = async () => {
  saving.value = true
  
  const isEditing = !!editingLocation.value
  const url = isEditing 
    ? `${config.public.apiBase}/admin/flying-locations/${editingLocation.value.id}`
    : `${config.public.apiBase}/admin/flying-locations`

  try {
    const result = await $fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    })

    console.log('Save successful:', result)
    
    // ============ IMPORTANT: UPDATE UI IMMEDIATELY ============
    if (isEditing) {
      // Find and update the existing location in the array
      const index = locations.value.findIndex(l => l.id === editingLocation.value.id)
      if (index !== -1) {
        // Create a new array to trigger Vue reactivity
        const updatedLocations = [...locations.value]
        
        // Update with the returned data or form data
        const updatedData = result.data || result || form
        
        // Preserve the QR code if it exists
        const existingQrCode = updatedLocations[index].qr_code
        
        updatedLocations[index] = {
          ...updatedLocations[index],
          ...updatedData,
          qr_code: existingQrCode, // Keep existing QR code
          clearance_statuses: [{ 
            status: form.clearance_status,
            updated_at: new Date().toISOString()
          }]
        }
        
        locations.value = updatedLocations
      }
    } else {
      // For new location - add to the beginning of the array
      const newLocation = result.data || result || form
      
      if (newLocation.id) {
        locations.value = [newLocation, ...locations.value]
        pagination.total += 1
      } else {
        // If no ID returned, refresh the list
        await fetchLocations()
      }
    }
    // ============ END UI UPDATE ============
    
    showToast('success', 'Saved successfully')
    closeModal()
    
  } catch (error) {
    console.error('Save failed:', error)
    
    let errorMsg = 'Failed to save location'
    if (error.data) {
      errorMsg = error.data.message || JSON.stringify(error.data)
    } else if (error.message) {
      errorMsg = error.message
    }
    
    showToast('error', errorMsg)
    
    if (error.status !== 422) {
      closeModal()
    }
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  console.log('Closing modal...')
  showCreateModal.value = false
  editingLocation.value = null
  resetForm()
  
  // Small delay to ensure DOM updates
  setTimeout(() => {
    if (process.client) {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = 'auto'
    }
  }, 50)
}

const handleSearch = useDebounceFn(() => fetchLocations(), 500)

const editLocation = (location) => {
  editingLocation.value = location
  Object.assign(form, location)
  form.clearance_status = location.clearance_statuses?.[0]?.status || 'green'
  showCreateModal.value = true
}

const openCreateModal = () => {
  editingLocation.value = null
  resetForm()
  showCreateModal.value = true
}



const closeQRModal = () => { showQRModal.value = false }
const resetForm = () => {
  Object.assign(form, {
    name: '', type: '', takeoff_kato: '', takeoff_nazim: '',
    landing_kato: '', landing_nazim: '', max_altitude: '',
    clearance_status: 'green', is_enabled: true
  })
}

const getCurrentStatus = (location) => {
  const s = location.clearance_statuses?.[0]?.status || 'green'
  return { status: s, label: s === 'green' ? 'Cleared' : 'Closed' }
}

const downloadQR = () => {
  const link = document.createElement('a')
  link.download = `QR-${selectedLocation.value.name}.png`
  link.href = qrCodeRef.value.toDataURL()
  link.click()
}

onMounted(fetchLocations)
</script>

<style scoped>
.flying-locations-admin { background: #f8fafc; min-height: 100vh; }
.status-badge-modern { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
.status-badge-modern.green { background: #dcfce7; color: #166534; }
.status-badge-modern.red { background: #fee2e2; color: #991b1b; }
.pulse-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
.green .pulse-dot { background: #22c55e; animation: pulse 2s infinite; }

@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
</style>