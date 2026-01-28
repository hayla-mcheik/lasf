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
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success d-flex align-items-center" @click="exportPilots">
            <i class="bi bi-file-earmark-excel me-2"></i>
            Export
          </button>
          <button class="btn btn-primary d-flex align-items-center" @click="showCreateModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            Add Pilot
          </button>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text bg-white">
            <i class="bi bi-search"></i>
          </span>
          <input v-model="searchQuery" type="text" class="form-control" 
                 placeholder="Search pilots by name, email, phone, license..." 
                 @input="handleSearch">
        </div>
      </div>
      <div class="col-md-3">
        <select v-model="statusFilter" class="form-select" @change="fetchPilots">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div class="col-md-3">
        <select v-model="licenseTypeFilter" class="form-select" @change="fetchPilots">
          <option value="">All License Types</option>
          <option value="paragliding">Paragliding</option>
          <option value="paramotor">Paramotor</option>
        </select>
      </div>
    </div>

    <!-- Stats -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary bg-opacity-10 border-0">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="bi bi-people-fill fs-1 text-primary"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <h5 class="mb-0">{{ stats.total || 0 }}</h5>
                <small class="text-muted">Total Pilots</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success bg-opacity-10 border-0">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="bi bi-check-circle-fill fs-1 text-success"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <h5 class="mb-0">{{ stats.active || 0 }}</h5>
                <small class="text-muted">Active</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning bg-opacity-10 border-0">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="bi bi-exclamation-circle-fill fs-1 text-warning"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <h5 class="mb-0">{{ stats.inactive || 0 }}</h5>
                <small class="text-muted">Inactive</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Main Table -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Loading pilots...</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Pilot</th>
                <th>Contact</th>
                <th>License</th>
                <th>Club</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pilot in pilots" :key="pilot.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div v-if="pilot.pilot_profile?.image" class="avatar me-3">
                      <img :src="pilot.pilot_profile.image" class="rounded-circle" style="width: 45px; height: 45px; object-fit: cover;">
                    </div>
                    <div v-else class="avatar me-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center rounded-circle" style="width: 45px; height: 45px;">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div>
                      <div class="fw-bold">{{ pilot.name }}</div>
                      <div class="text-muted small">{{ pilot.pilot_profile?.designation || 'Pilot' }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="small">
                    <div><i class="bi bi-envelope me-1"></i> {{ pilot.email }}</div>
                    <div><i class="bi bi-telephone me-1"></i> {{ pilot.phone || 'Not set' }}</div>
                  </div>
                </td>
                <td>
                  <div class="small">
                    <div class="fw-semibold">{{ pilot.pilot_profile?.license_number || 'N/A' }}</div>
                    <div class="text-muted">{{ pilot.pilot_profile?.license_type || 'N/A' }}</div>
                    <div v-if="pilot.pilot_profile?.expiry_date" class="text-muted">
                      Exp: {{ formatDate(pilot.pilot_profile.expiry_date) }}
                    </div>
                  </div>
                </td>
                <td>{{ pilot.pilot_profile?.club_name || 'N/A' }}</td>
                <td>
                  <span :class="pilot.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ pilot.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="editPilot(pilot)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="confirmDelete(pilot)" title="Delete">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="pilots.length === 0 && !loading">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-people display-6 d-block mb-2"></i>
                  No pilots found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total > pagination.per_page" class="d-flex justify-content-between align-items-center mt-4">
      <div class="text-muted small">
        Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} pilots
      </div>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
            <button class="page-link" @click="changePage(pagination.current_page - 1)">Previous</button>
          </li>
          <li v-for="page in pagination.last_page" :key="page" class="page-item" 
              :class="{ active: page === pagination.current_page }">
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
            <button class="page-link" @click="changePage(pagination.current_page + 1)">Next</button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal-backdrop fade show"></div>
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header" :class="editingPilot ? 'bg-primary text-white' : 'bg-success text-white'">
            <h5 class="modal-title">
              <i class="bi me-2" :class="editingPilot ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
              {{ editingPilot ? 'Edit Pilot' : 'Add New Pilot' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="savePilot" enctype="multipart/form-data">
            <div class="modal-body p-4">
              <!-- Error Messages -->
              <div v-if="formErrors.length" class="alert alert-danger">
                <ul class="mb-0">
                  <li v-for="error in formErrors" :key="error">{{ error }}</li>
                </ul>
              </div>
              
              <div class="row g-3">
                <!-- Basic Info -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">Full Name <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.name }" required>
                  <div v-if="fieldErrors.name" class="invalid-feedback d-block">{{ fieldErrors.name[0] }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">Email <span class="text-danger">*</span></label>
                  <input v-model="form.email" type="email" class="form-control" :class="{ 'is-invalid': fieldErrors.email }" required>
                  <div v-if="fieldErrors.email" class="invalid-feedback d-block">{{ fieldErrors.email[0] }}</div>
                </div>

                <!-- Phone Field Added -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">Phone Number <span class="text-danger">*</span></label>
                  <input v-model="form.phone" type="tel" class="form-control" :class="{ 'is-invalid': fieldErrors.phone }" required>
                  <div v-if="fieldErrors.phone" class="invalid-feedback d-block">{{ fieldErrors.phone[0] }}</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold">Status</label>
                  <div class="form-check form-switch">
                    <input v-model="form.is_active" class="form-check-input" type="checkbox" role="switch" id="activeSwitch">
                    <label class="form-check-label" for="activeSwitch">
                      {{ form.is_active ? 'Active' : 'Inactive' }}
                    </label>
                  </div>
                </div>

                <!-- License Info -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">License Number <span class="text-danger">*</span></label>
                  <input v-model="form.license_number" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.license_number }" required>
                  <div v-if="fieldErrors.license_number" class="invalid-feedback d-block">{{ fieldErrors.license_number[0] }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">License Type <span class="text-danger">*</span></label>
                  <select v-model="form.license_type" class="form-select" :class="{ 'is-invalid': fieldErrors.license_type }" required>
                    <option value="">Select Type</option>
                    <option value="paragliding">Paragliding</option>
                    <option value="paramotor">Paramotor</option>
                    <option value="hang-gliding">Hang Gliding</option>
                    <option value="ultralight">Ultralight</option>
                    <option value="other">Other</option>
                  </select>
                  <div v-if="fieldErrors.license_type" class="invalid-feedback d-block">{{ fieldErrors.license_type[0] }}</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold">License Expiry Date</label>
                  <input v-model="form.expiry_date" type="date" class="form-control" :class="{ 'is-invalid': fieldErrors.expiry_date }">
                  <div v-if="fieldErrors.expiry_date" class="invalid-feedback d-block">{{ fieldErrors.expiry_date[0] }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">Club/Organization</label>
                  <input v-model="form.club_name" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.club_name }">
                  <div v-if="fieldErrors.club_name" class="invalid-feedback d-block">{{ fieldErrors.club_name[0] }}</div>
                </div>

                <!-- Designation -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">Designation</label>
                  <input v-model="form.designation" type="text" class="form-control" placeholder="e.g., Senior Pilot, Instructor">
                </div>

                <!-- Photo -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">Profile Photo</label>
                  <div v-if="imagePreview || (editingPilot && editingPilot.pilot_profile?.image)" class="mb-2">
                    <img :src="imagePreview || editingPilot.pilot_profile.image" class="rounded border" style="max-height: 120px; max-width: 120px;">
                    <button type="button" class="btn btn-sm btn-link text-danger" @click="removeImage">Remove Photo</button>
                  </div>
                  <input type="file" @change="handleImageUpload" class="form-control" accept="image/*" ref="fileInput">
                </div>

                <!-- Social Media -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">
                    <i class="bi bi-facebook text-primary me-1"></i> Facebook URL
                  </label>
                  <input v-model="form.facebook_url" type="url" class="form-control" placeholder="https://facebook.com/username">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">
                    <i class="bi bi-instagram text-danger me-1"></i> Instagram URL
                  </label>
                  <input v-model="form.instagram_url" type="url" class="form-control" placeholder="https://instagram.com/username">
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingPilot ? 'Update' : 'Create' }} Pilot
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop fade show"></div>
    <div v-if="showDeleteModal" class="modal fade show d-block" @click.self="closeDeleteModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center p-4">
            <i class="bi bi-person-x display-4 text-danger mb-3"></i>
            <p class="lead">Are you sure you want to delete pilot <strong>{{ pilotToDelete?.name }}</strong>?</p>
            <p class="text-muted">This action cannot be undone. All associated data will be permanently removed.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deletePilot" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Pilot
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

// State
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
  to: 0,
  prev_page_url: null,
  next_page_url: null
})

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)

// Forms
const editingPilot = ref(null)
const pilotToDelete = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const fileInput = ref(null)

const form = reactive({
  name: '',
  email: '',
  phone: '', // Added phone field
  license_number: '',
  license_type: '',
  expiry_date: '',
  club_name: '',
  is_active: true,
  designation: '',
  facebook_url: '',
  instagram_url: '',
  remove_image: false
})

// Computed
const isEditing = computed(() => !!editingPilot.value)

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleSearch = useDebounceFn(fetchPilots, 500)

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
    
    const url = `${config.public.apiBase}/admin/pilots?${params}`
    
    const response = await $fetch(url, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      }
    })
    
    pilots.value = response.data || response
    
    // Update pagination
    if (response) {
      Object.assign(pagination, {
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        total: response.total || 0,
        from: response.from || 0,
        to: response.to || 0,
        prev_page_url: response.prev_page_url || null,
        next_page_url: response.next_page_url || null
      })
    }
    
    // Update stats
    stats.active = pilots.value.filter(p => p.is_active).length
    stats.inactive = pilots.value.filter(p => !p.is_active).length
    stats.total = pilots.value.length
    
  } catch (err) {
    console.error('Failed to fetch pilots:', err)
    error.value = err.data?.message || err.message || 'Failed to load pilots'
  } finally {
    loading.value = false
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      alert('Image size should be less than 2MB')
      return
    }
    
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const removeImage = () => {
  imagePreview.value = null
  imageFile.value = null
  form.remove_image = true
  if (fileInput.value) fileInput.value.value = ''
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
    formErrors.value = []
    fieldErrors.value = {}

    const formData = new FormData()
    
    // Append all form fields
    Object.keys(form).forEach(key => {
      if (key !== 'remove_image') {
        const value = form[key]
        if (value !== null && value !== undefined) {
          formData.append(key, value)
        }
      }
    })
    
    // Append image if selected
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }
    
    // Append remove_image flag if needed
    if (form.remove_image) {
      formData.append('remove_image', '1')
    }

    const url = isEditing.value 
      ? `${config.public.apiBase}/admin/pilots/${editingPilot.value.id}`
      : `${config.public.apiBase}/admin/pilots`

    // Use POST for create, PUT for update
    const method = isEditing.value ? 'PUT' : 'POST'
    
    // For Laravel's method spoofing with FormData
    if (isEditing.value) {
      formData.append('_method', 'PUT')
    }

    const response = await $fetch(url, {
      method: 'POST', // Always use POST with FormData
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      },
      body: formData
    })

    if (response.success) {
      alert(isEditing.value ? 'Pilot updated successfully!' : 'Pilot created successfully!')
      closeModal()
      await fetchPilots()
    } else {
      throw new Error(response.message || 'Operation failed')
    }

  } catch (err) {
    console.error('Save pilot error:', err)
    
    if (err.data?.errors) {
      fieldErrors.value = err.data.errors
    } else if (err.data?.message) {
      formErrors.value = [err.data.message]
    } else {
      formErrors.value = [err.message || 'An error occurred. Please try again.']
    }
  } finally {
    saving.value = false
  }
}

const confirmDelete = (pilot) => {
  pilotToDelete.value = pilot
  showDeleteModal.value = true
}

const deletePilot = async () => {
  try {
    deleting.value = true
    
    const url = `${config.public.apiBase}/admin/pilots/${pilotToDelete.value.id}`
    
    const response = await $fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      }
    })
    
    if (response.success) {
      alert('Pilot deleted successfully!')
      closeDeleteModal()
      await fetchPilots()
    } else {
      throw new Error(response.message || 'Failed to delete pilot')
    }
    
  } catch (err) {
    console.error('Delete pilot error:', err)
    error.value = err.data?.message || err.message || 'Failed to delete pilot'
  } finally {
    deleting.value = false
  }
}

const exportPilots = async () => {
  try {
    const url = `${config.public.apiBase}/admin/pilots/export`
    
    const response = await $fetch(url, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      }
    })
    
    if (response.success && response.data) {
      // Convert to CSV and download
      const headers = Object.keys(response.data[0] || {})
      const csvContent = [
        headers.join(','),
        ...response.data.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `pilots-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      throw new Error('Export failed')
    }
  } catch (err) {
    console.error('Export error:', err)
    error.value = 'Failed to export pilots'
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
  imagePreview.value = null
  formErrors.value = []
  fieldErrors.value = {}
  
  // Reset form
  Object.keys(form).forEach(key => {
    if (key === 'is_active') {
      form[key] = true
    } else {
      form[key] = ''
    }
  })
  form.remove_image = false
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  pilotToDelete.value = null
}

// Initialize
onMounted(() => {
  fetchPilots()
})
</script>

<style scoped>
.pilots-admin {
  padding: 1.5rem;
  background: #f8f9fa;
  min-height: calc(100vh - 56px); /* Adjust based on your header height */
}

.dashboard-header {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 2rem;
}

.avatar {
  flex-shrink: 0;
}

.table th {
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  padding: 1rem 0.75rem;
}

.table td {
  vertical-align: middle;
  padding: 1rem 0.75rem;
}

.table-hover tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.04);
}

.modal-backdrop {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .pilots-admin {
    padding: 1rem;
  }
  
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
}
</style>