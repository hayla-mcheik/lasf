<template>
  <div class="pilots-admin container-fluid">
    <div class="dashboard-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-people me-3 text-primary"></i>
            Pilots Management
          </h1>
          <p class="text-muted mb-0">Manage pilot registrations, licenses, and social profiles</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center" @click="showCreateModal = true">
          <i class="bi bi-plus-circle me-2"></i>
          Add Pilot
        </button>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Pilot</th>
                <th>License</th>
                <th>Designation</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pilot in pilots" :key="pilot.id">
                <td>
                  <div class="d-flex align-items-center">
                    <img v-if="pilot.pilot_profile?.image" :src="pilot.pilot_profile.image" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
                    <div v-else class="avatar-sm bg-primary-subtle text-primary me-2">{{ (pilot.name) }}</div>
                    <div>
                      <div class="fw-bold">{{ pilot.name }}</div>
                      <small class="text-muted">{{ pilot.email }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ pilot.pilot_profile?.license_number }} ({{ pilot.pilot_profile?.license_type }})</td>
                <td>{{ pilot.pilot_profile?.designation || 'N/A' }}</td>
                <td>
                  <span :class="pilot.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ pilot.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editPilot(pilot)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(pilot)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal-backdrop fade show"></div>
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom" :class="editingPilot ? 'bg-primary text-white' : 'bg-success text-white'">
            <h5 class="modal-title">{{ editingPilot ? 'Edit Pilot' : 'Add New Pilot' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="savePilot" enctype="multipart/form-data">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Full Name</label>
                  <input v-model="form.name" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input v-model="form.email" type="email" class="form-control" required>
                </div>
<div class="col-md-6">
  <label class="form-label">Phone Number</label>
  <input v-model="form.phone" type="text" class="form-control" placeholder="+961...">
</div>
                <div class="col-md-6">
                  <label class="form-label">Pilot Photo</label>
                  <input type="file" @change="handleFileUpload" class="form-control" accept="image/*">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Designation (e.g. Senior Pilot)</label>
                  <input v-model="form.designation" type="text" class="form-control">
                </div>

                <div class="col-md-4">
                  <label class="form-label">License #</label>
                  <input v-model="form.license_number" type="text" class="form-control" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label">License Type</label>
                  <select v-model="form.license_type" class="form-select" required>
                    <option value="paragliding">Paragliding</option>
                    <option value="paramotor">Paramotor</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Expiry Date</label>
                  <input v-model="form.expiry_date" type="date" class="form-control">
                </div>

                <div class="col-md-6">
                  <label class="form-label"><i class="bi bi-facebook me-2"></i>Facebook URL</label>
                  <input v-model="form.facebook_url" type="url" class="form-control" placeholder="https://facebook.com/...">
                </div>
                <div class="col-md-6">
                  <label class="form-label"><i class="bi bi-instagram me-2"></i>Instagram URL</label>
                  <input v-model="form.instagram_url" type="url" class="form-control" placeholder="https://instagram.com/...">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                Save Pilot
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-backdrop fade show"></div>
    <div v-if="showDeleteModal" class="modal fade show d-block" @click.self="closeDeleteModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete pilot <strong>{{ pilotToDelete?.name }}</strong>?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deletePilot" :disabled="deleting">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

// Data
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref(null)
const formErrors = ref([])
const fieldErrors = ref({})

const pilots = ref([])
const stats = reactive({
  active: 0,
  inactive: 0,
  total: 0
})

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const licenseTypeFilter = ref('')

// Pagination
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0
})

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)

// Forms
const editingPilot = ref(null)
const pilotToDelete = ref(null)
const imageFile = ref(null) // New: for file upload

const form = reactive({
  name: '',
  email: '',
  phone: '',
  license_number: '',
  license_type: '',
  expiry_date: '',
  club_name: '',
  is_active: true,
  email_verified: false,
  // New Fields
  designation: '',
  facebook_url: '',
  instagram_url: '',
  remove_image: false
})

// Methods
const fetchPilots = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = new URLSearchParams({
      page: pagination.current_page,
      per_page: pagination.per_page,
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(statusFilter.value && { status: statusFilter.value }),
      ...(licenseTypeFilter.value && { license_type: licenseTypeFilter.value })
    })
    
    const data = await $fetch(`${config.public.apiBase}/admin/pilots?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      }
    })
    
    pilots.value = data.data || data
    
    if (data) {
      Object.assign(pagination, {
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
        from: data.from || 0,
        to: data.to || 0
      })
    }
    
    updateStats()
    
  } catch (err) {
    console.error('Failed to fetch pilots:', err)
    error.value = err.message || 'Failed to load pilots.'
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  stats.active = pilots.value.filter(p => p.is_active).length
  stats.inactive = pilots.value.filter(p => !p.is_active).length
  stats.total = pilots.value.length
}

const handleFileUpload = (event) => {
  imageFile.value = event.target.files[0]
}

const editPilot = (pilot) => {
  editingPilot.value = pilot
  form.name = pilot.name
  form.email = pilot.email
  form.phone = pilot.phone || ''
  form.license_number = pilot.pilot_profile?.license_number || ''
  form.license_type = pilot.pilot_profile?.license_type || ''
  form.expiry_date = pilot.pilot_profile?.expiry_date ? pilot.pilot_profile.expiry_date.split('T')[0] : ''
  form.club_name = pilot.pilot_profile?.club_name || ''
  form.is_active = pilot.is_active
  form.email_verified = pilot.email_verified || false
  // New Fields
  form.designation = pilot.pilot_profile?.designation || ''
  form.facebook_url = pilot.pilot_profile?.facebook_url || ''
  form.instagram_url = pilot.pilot_profile?.instagram_url || ''
  
  formErrors.value = []
  fieldErrors.value = {}
  showCreateModal.value = true
}

const savePilot = async () => {
  try {
    saving.value = true
    const formData = new FormData()
    
    // User fields
    formData.append('name', form.name)
    formData.append('email', form.email)
    formData.append('phone', form.phone || '') // Sending phone
    formData.append('is_active', form.is_active ? '1' : '0')

    // Profile fields
    formData.append('license_number', form.license_number)
    formData.append('license_type', form.license_type)
    formData.append('expiry_date', form.expiry_date || '')
    formData.append('designation', form.designation || '')
    formData.append('facebook_url', form.facebook_url || '')
    formData.append('instagram_url', form.instagram_url || '')
    formData.append('club_name', form.club_name || '')

    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }

    const isEdit = !!editingPilot.value
    if (isEdit) formData.append('_method', 'PUT') // Laravel Spoofing

    const url = isEdit 
      ? `${config.public.apiBase}/admin/pilots/${editingPilot.value.id}` 
      : `${config.public.apiBase}/admin/pilots`

    await $fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData
    })

    alert('Pilot saved successfully!')
    closeModal()
    fetchPilots()
  } catch (err) {
    console.error(err)
    alert('Save failed. Check console for details.')
  } finally {
    saving.value = false
  }
}
const confirmDelete = (pilot) => {
  pilotToDelete.value = pilot
  showDeleteModal.value = true
}

const deletePilot = async () => {
  deleting.value = true
  try {
    await $fetch(`${config.public.apiBase}/admin/pilots/${pilotToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    closeDeleteModal()
    await fetchPilots()
    alert('Pilot deleted successfully!')
  } catch (err) {
    console.error('Delete failed:', err)
    alert(err.data?.message || 'Failed to delete pilot')
  } finally { 
    deleting.value = false 
  }
}
const exportPilots = async () => {
  try {
    const baseUrl = config.public.apiBase || 'http://localhost:8000'
    const data = await $fetch(`${baseUrl}/admin/pilots/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data.url) {
      // Download the exported file
      window.open(data.url, '_blank')
      alert('Pilots export started successfully!')
    } else if (data) {
      // If the API returns CSV content directly
      const blob = new Blob([data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pilots-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
    
  } catch (err) {
    console.error('Failed to export pilots:', err)
    alert(err.message || 'Failed to export pilots')
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    pagination.current_page = page
    fetchPilots()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingPilot.value = null
  imageFile.value = null
  formErrors.value = []
  fieldErrors.value = {}
  form.name = ''
  form.email = ''
  form.phone = ''
  form.license_number = ''
  form.license_type = ''
  form.expiry_date = ''
  form.club_name = ''
  form.is_active = true
  form.designation = ''
  form.facebook_url = ''
  form.instagram_url = ''
}
const closeDeleteModal = () => {
  showDeleteModal.value = false
  pilotToDelete.value = null
}

onMounted(() => {
  fetchPilots()
})
</script>

<style scoped>
.pilots-admin {
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

/* Avatar */
.avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

/* Table Styles */
.table th {
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
  padding: 1rem;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.04);
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

/* Form Styles */
.form-switch .form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .btn-group .btn {
    width: 100%;
  }
}
</style>