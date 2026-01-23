<template>
  <div class="sports-admin">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-trophy me-3 text-primary"></i>
            Sports & Disciplines
          </h1>
          <div class="d-flex align-items-center gap-3">
            <p class="text-muted mb-0">
              <i class="bi bi-activity me-1"></i>
              Manage all aerial sports supported by the federation
            </p>
            <span class="badge bg-primary-subtle text-primary">
              {{ sports.length }} sports
            </span>
          </div>
        </div>
        <div>
          <button class="btn btn-primary d-flex align-items-center" @click="showCreateModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            Add Sport
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="text-center">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading sports...</p>
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
      <!-- Sports Grid -->
      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="sport in sports" :key="sport.id">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-img-top" style="height: 180px; overflow: hidden;">
              <div v-if="sport.image" class="h-100 bg-cover" 
                   :style="{ backgroundImage: `url(${sport.image})` }"></div>
              <div v-else class="h-100 bg-primary-subtle d-flex align-items-center justify-content-center">
                <i class="bi bi-trophy display-4 text-primary"></i>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 class="card-title fw-semibold mb-1">{{ sport.name }}</h5>
                  <div class="text-muted small">
                    <i class="bi bi-geo-alt me-1"></i>
                    {{ sport.flying_locations_count || 0 }} locations
                  </div>
                </div>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" 
                          data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="editSport(sport)">
                        <i class="bi bi-pencil me-2"></i> Edit
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="confirmDelete(sport)">
                        <i class="bi bi-trash me-2 text-danger"></i> Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <p class="card-text text-muted small mb-3" v-if="sport.description">
                {{ truncateText(sport.description, 100) }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Add New Card -->
        <div class="col-md-6 col-lg-4">
          <div class="card border-2 border-dashed h-100" 
               @click="showCreateModal = true"
               style="cursor: pointer; border-style: dashed !important;">
            <div class="card-body d-flex flex-column align-items-center justify-content-center">
              <div class="text-center py-5">
                <i class="bi bi-plus-circle display-6 text-muted mb-3"></i>
                <h5 class="text-muted">Add New Sport</h5>
                <p class="text-muted small mb-0">Add a new aerial sport to the federation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" 
         :class="{ show: showCreateModal }" @click.self="closeModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom" :class="editingSport ? 'bg-primary text-white' : 'bg-success text-white'">
            <h5 class="modal-title">
              <i class="bi me-2" :class="editingSport ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
              {{ editingSport ? 'Edit Sport' : 'Create New Sport' }}
            </h5>
            <button type="button" class="btn-close" :class="editingSport ? 'btn-close-white' : ''" 
                    @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveSport" enctype="multipart/form-data">
            <div class="modal-body">
              <div v-if="formErrors.length" class="alert alert-danger">
                <ul class="mb-0">
                  <li v-for="(error, index) in formErrors" :key="index">{{ error }}</li>
                </ul>
              </div>
              
              <div class="row g-4">
                <!-- Sport Name -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Sport Name <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.name }" required
                         placeholder="e.g., Paragliding, Paramotor, Skydiving...">
                  <div v-if="fieldErrors.name" class="invalid-feedback">
                    {{ fieldErrors.name[0] }}
                  </div>
                </div>
                
                <!-- Image Upload -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Sport Image</label>
                  <div class="image-upload-container">
                    <div v-if="imagePreview" class="image-preview mb-3">
                      <img :src="imagePreview" alt="Preview" class="img-fluid rounded" style="max-height: 150px;">
                      <button type="button" class="btn btn-sm btn-danger mt-2" @click="removeImage">
                        <i class="bi bi-trash"></i> Remove Image
                      </button>
                    </div>
                    <div v-else-if="editingSport?.image" class="image-preview mb-3">
                      <img :src="editingSport.image" alt="Current" class="img-fluid rounded" style="max-height: 150px;">
                      <button type="button" class="btn btn-sm btn-danger mt-2" @click="removeImage">
                        <i class="bi bi-trash"></i> Remove Image
                      </button>
                    </div>
                    <div v-else>
                      <input type="file" class="form-control" :class="{ 'is-invalid': fieldErrors.image }" 
                             accept="image/*" @change="handleImageUpload" ref="fileInput">
                      <div class="form-text">
                        Upload a representative image (max 2MB)
                      </div>
                      <div v-if="fieldErrors.image" class="invalid-feedback">
                        {{ fieldErrors.image[0] }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Description -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Description</label>
                  <textarea v-model="form.description" class="form-control" :class="{ 'is-invalid': fieldErrors.description }" rows="3"
                            placeholder="Brief description of the sport..."></textarea>
                  <div v-if="fieldErrors.description" class="invalid-feedback">
                    {{ fieldErrors.description[0] }}
                  </div>
                </div>
                
                <!-- Additional Info -->
                <div class="col-12" v-if="editingSport">
                  <div class="alert alert-info small">
                    <i class="bi bi-info-circle me-2"></i>
                    This sport is available at {{ editingSport.flying_locations_count || 0 }} flying locations.
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-top">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="btn" :class="editingSport ? 'btn-primary' : 'btn-success'" 
                      :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi" :class="editingSport ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                {{ editingSport ? 'Update Sport' : 'Create Sport' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" 
         :class="{ show: showDeleteModal }">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Delete Sport
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="warning-icon mb-4">
              <i class="bi bi-trophy fs-1 text-danger"></i>
            </div>
            <h5 class="fw-bold">Delete Sport</h5>
            <p class="text-muted">Are you sure you want to delete <strong class="text-danger">{{ sportToDelete?.name }}</strong>?</p>
            <div class="alert alert-warning small">
              <i class="bi bi-info-circle me-2"></i>
              This sport is available at {{ sportToDelete?.flying_locations_count || 0 }} locations.
              Deleting it will remove it from all associated locations.
            </div>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="deleteSport" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Sport
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="showCreateModal || showDeleteModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

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

const sports = ref([])

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)

// Forms
const editingSport = ref(null)
const sportToDelete = ref(null)
const imagePreview = ref(null)
const imageFile = ref(null)
const fileInput = ref(null)

const form = reactive({
  name: '',
  description: '',
  image: null
})

// Utility Functions
const truncateText = (text, length) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// API Methods
const fetchSports = async () => {
  try {
    loading.value = true
    error.value = null
    formErrors.value = []
    
    // Using $fetch like news categories
    const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/sports`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data && data.data) {
      sports.value = data.data
    } else {
      sports.value = data || []
    }
    
  } catch (err) {
    console.error('Failed to fetch sports:', err)
    error.value = err.message || 'Failed to load sports.'
    
    // Fallback to mock data for development
    if (config.public.devMode) {
      console.log('Using mock data for development')
      sports.value = [
        {
          id: 1,
          name: 'Paragliding',
          description: 'Free-flying foot-launched glider aircraft',
          image: null,
          flying_locations_count: 12,
          created_at: '2024-01-10T10:30:00Z'
        },
        {
          id: 2,
          name: 'Paramotor',
          description: 'Powered paragliding with a motor',
          image: null,
          flying_locations_count: 8,
          created_at: '2024-01-09T14:20:00Z'
        },
        {
          id: 3,
          name: 'Hang Gliding',
          description: 'Air sport using a non-motorized foot-launched aircraft',
          image: null,
          flying_locations_count: 5,
          created_at: '2024-01-08T09:15:00Z'
        }
      ]
      error.value = null
    }
  } finally {
    loading.value = false
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB')
      return
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF)')
      return
    }
    
    imageFile.value = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  imagePreview.value = null
  imageFile.value = null
  
  // Clear file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  // If editing and there's an existing image, mark it for deletion
  if (editingSport.value?.image) {
    form.remove_image = true
  }
}

const editSport = (sport) => {
  editingSport.value = sport
  form.name = sport.name
  form.description = sport.description || ''
  form.image = sport.image
  formErrors.value = []
  fieldErrors.value = {}
  showCreateModal.value = true
}

// index.vue - Update the saveSport function
const saveSport = async () => {
  try {
    saving.value = true
    formErrors.value = []
    fieldErrors.value = {}
    
    const formData = new FormData()
    formData.append('name', form.name)
    
    if (form.description) {
      formData.append('description', form.description)
    }
    
    // Handle image upload
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    } else if (form.remove_image) {
      formData.append('remove_image', 'true')
    }
    
    const baseUrl = config.public.apiBase || 'http://localhost:8000'
    let url = `${baseUrl}/admin/sports`
    
    // UPDATED LOGIC: 
    // Always use method: 'POST' for FormData, but spoof 'PUT' if editing
    if (editingSport.value) {
      url = `${baseUrl}/admin/sports/${editingSport.value.id}`
      formData.append('_method', 'PUT') // Laravel Method Spoofing
    }
    
    const response = await $fetch(url, {
      method: 'POST', // Use POST to ensure FormData is parsed
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json' // Ensure Laravel returns JSON validation errors
      },
      body: formData,
    })
    
    if (response.success || response.data) {
      closeModal()
      await fetchSports()
      alert(editingSport.value ? 'Sport updated successfully!' : 'Sport created successfully!')
    } else {
      throw new Error(response.message || 'Operation failed')
    }
    
  } catch (err) {
    console.error('Failed to save sport:', err)
    if (err.data && err.data.errors) {
      fieldErrors.value = err.data.errors
      if (err.data.message) {
        formErrors.value = [err.data.message]
      }
    } else {
      formErrors.value = [err.message || 'Failed to save sport.']
    }
  } finally {
    saving.value = false
  }
}

const confirmDelete = (sport) => {
  sportToDelete.value = sport
  showDeleteModal.value = true
}

const deleteSport = async () => {
  try {
    deleting.value = true
    
    const baseUrl = config.public.apiBase || 'http://localhost:8000'
    const url = `${baseUrl}/admin/sports/${sportToDelete.value.id}`
    
    const response = await $fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success || response.data) {
      closeDeleteModal()
      await fetchSports()
      alert('Sport deleted successfully!')
    } else {
      throw new Error(response.message || 'Failed to delete sport')
    }
    
  } catch (err) {
    console.error('Failed to delete sport:', err)
    
    // Show error message
    if (err.data && err.data.message) {
      alert(err.data.message)
    } else {
      alert(err.message || 'Failed to delete sport. Please try again.')
    }
  } finally {
    deleting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingSport.value = null
  imagePreview.value = null
  imageFile.value = null
  formErrors.value = []
  fieldErrors.value = {}
  form.name = ''
  form.description = ''
  form.image = null
  form.remove_image = false
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  sportToDelete.value = null
}

onMounted(() => {
  fetchSports()
})
</script>

<style scoped>
.sports-admin {
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
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
}

.border-dashed {
  border-color: #dee2e6 !important;
  border-radius: 12px;
  transition: all 0.2s;
}

.border-dashed:hover {
  border-color: #667eea !important;
  background-color: rgba(102, 126, 234, 0.05);
}

/* Image Styles */
.bg-cover {
  background-size: cover;
  background-position: center;
}

.image-preview img {
  max-width: 100%;
  height: auto;
  border: 2px solid #dee2e6;
}

.image-preview button {
  border-radius: 6px;
}

/* Modal Styles */
.modal-content {
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  border-radius: 16px 16px 0 0;
  padding: 1.5rem;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem;
}

.modal-backdrop {
  opacity: 0.5;
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

/* Form Styles */
.form-control {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  padding: 0.75rem 1rem;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

/* Button Styles */
.btn {
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-outline-secondary {
  border: 2px solid #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
}
</style>