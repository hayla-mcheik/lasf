<template>
  <div class="testimonials-admin">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-chat-quote me-3 text-primary"></i>
            Testimonials
          </h1>
          <div class="d-flex align-items-center gap-3">
            <p class="text-muted mb-0">
              <i class="bi bi-person-badge me-1"></i>
              Manage pilot testimonials and feedback
            </p>
            <span class="badge bg-primary-subtle text-primary">
              {{ pagination.total }} testimonials
            </span>
          </div>
        </div>
        <div>
          <button class="btn btn-primary d-flex align-items-center" @click="showCreateModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            Add Testimonial
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
        <p class="mt-3 text-muted">Loading testimonials...</p>
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
      <!-- Testimonials Grid -->
      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="testimonial in testimonials" :key="testimonial.id">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-start mb-3">
                <div v-if="testimonial.image" class="flex-shrink-0">
                  <img :src="testimonial.image" alt="Avatar" class="rounded-circle" 
                       style="width: 48px; height: 48px; object-fit: cover;">
                </div>
                <div v-else class="flex-shrink-0">
                  <div class="avatar-placeholder rounded-circle bg-primary-subtle text-primary">
                    {{ getInitials(testimonial.name) }}
                  </div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="fw-semibold mb-1">{{ testimonial.name }}</h6>
                  <div class="text-muted small">
                    <i class="bi bi-star-fill text-warning me-1"></i>
                    Pilot Testimonial
                  </div>
                </div>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" 
                          data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="editTestimonial(testimonial)">
                        <i class="bi bi-pencil me-2"></i> Edit
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="confirmDelete(testimonial)">
                        <i class="bi bi-trash me-2 text-danger"></i> Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div class="testimonial-content mb-3">
                <p class="mb-0" style="font-style: italic;">
                  "{{ truncateText(testimonial.description, 150) }}"
                </p>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mt-4">
                <small class="text-muted">
                  {{ formatTimeAgo(testimonial.created_at) }}
                </small>
                <span class="badge bg-light text-dark">
                  <i class="bi bi-calendar me-1"></i>
                  {{ formatDate(testimonial.created_at) }}
                </span>
              </div>
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
                <h5 class="text-muted">Add Testimonial</h5>
                <p class="text-muted small mb-0">Share pilot feedback and experiences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > pagination.per_page" class="d-flex justify-content-between align-items-center mt-4">
        <div class="text-muted small">
          Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} testimonials
        </div>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
              <button class="page-link" @click="changePage(pagination.current_page - 1)" :disabled="!pagination.prev_page_url">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li v-for="page in pagination.last_page" 
                :key="page"
                class="page-item" 
                :class="{ active: page === pagination.current_page }">
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
              <button class="page-link" @click="changePage(pagination.current_page + 1)" :disabled="!pagination.next_page_url">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" 
         :class="{ show: showCreateModal }" @click.self="closeModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom" :class="editingTestimonial ? 'bg-primary text-white' : 'bg-success text-white'">
            <h5 class="modal-title">
              <i class="bi me-2" :class="editingTestimonial ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
              {{ editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial' }}
            </h5>
            <button type="button" class="btn-close" :class="editingTestimonial ? 'btn-close-white' : ''" 
                    @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveTestimonial" enctype="multipart/form-data">
            <div class="modal-body">
              <div v-if="formErrors.length" class="alert alert-danger">
                <ul class="mb-0">
                  <li v-for="(error, index) in formErrors" :key="index">{{ error }}</li>
                </ul>
              </div>
              
              <div class="row g-4">
                <!-- Pilot Info -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Pilot Name <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.name }" required
                         placeholder="Enter pilot's full name">
                  <div v-if="fieldErrors.name" class="invalid-feedback">
                    {{ fieldErrors.name[0] }}
                  </div>
                </div>
                
                <!-- Image Upload -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Pilot Photo</label>
                  <div class="image-upload-container">
                    <div v-if="imagePreview" class="image-preview mb-3">
                      <img :src="imagePreview" alt="Preview" class="img-fluid rounded-circle" 
                           style="width: 80px; height: 80px; object-fit: cover;">
                      <button type="button" class="btn btn-sm btn-danger mt-2" @click="removeImage">
                        <i class="bi bi-trash"></i> Remove Photo
                      </button>
                    </div>
                    <div v-else-if="editingTestimonial?.image" class="image-preview mb-3">
                      <img :src="editingTestimonial.image" alt="Current" class="img-fluid rounded-circle"
                           style="width: 80px; height: 80px; object-fit: cover;">
                      <button type="button" class="btn btn-sm btn-danger mt-2" @click="removeImage">
                        <i class="bi bi-trash"></i> Remove Photo
                      </button>
                    </div>
                    <div v-else>
                      <input type="file" class="form-control" :class="{ 'is-invalid': fieldErrors.image }" 
                             accept="image/*" @change="handleImageUpload" ref="fileInput">
                      <div class="form-text">
                        Upload a photo (optional, max 2MB)
                      </div>
                      <div v-if="fieldErrors.image" class="invalid-feedback">
                        {{ fieldErrors.image[0] }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Testimonial -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Testimonial <span class="text-danger">*</span></label>
                  <textarea v-model="form.description" class="form-control" :class="{ 'is-invalid': fieldErrors.description }" 
                            rows="5" required
                            placeholder="Share the pilot's experience, feedback, or story..."></textarea>
                  <div v-if="fieldErrors.description" class="invalid-feedback">
                    {{ fieldErrors.description[0] }}
                  </div>
                  <div class="form-text">
                    Use quotation marks if directly quoting the pilot
                  </div>
                </div>
                
                <!-- Rating -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Rating (Optional)</label>
                  <div class="rating-stars">
                    <button type="button" v-for="star in 5" :key="star"
                            class="btn btn-link p-0 me-1"
                            @click.prevent="form.rating = star">
                      <i class="bi" :class="star <= form.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'"
                         style="font-size: 1.5rem;"></i>
                    </button>
                    <span class="ms-2 text-muted small">
                      {{ form.rating }}/5 stars
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-top">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="btn" :class="editingTestimonial ? 'btn-primary' : 'btn-success'" 
                      :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi" :class="editingTestimonial ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                {{ editingTestimonial ? 'Update Testimonial' : 'Add Testimonial' }}
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
              Delete Testimonial
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="warning-icon mb-4">
              <i class="bi bi-trash fs-1 text-danger"></i>
            </div>
            <h5 class="fw-bold">Delete Testimonial</h5>
            <p class="text-muted">Are you sure you want to delete the testimonial from <strong class="text-danger">{{ testimonialToDelete?.name }}</strong>?</p>
            <div class="alert alert-warning small">
              <i class="bi bi-info-circle me-2"></i>
              This action cannot be undone. The testimonial will be permanently removed.
            </div>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="deleteTestimonial" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Testimonial
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

const testimonials = ref([])

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)

// Forms
const editingTestimonial = ref(null)
const testimonialToDelete = ref(null)
const imagePreview = ref(null)
const imageFile = ref(null)
const fileInput = ref(null)

const form = reactive({
  name: '',
  description: '',
  rating: 5,
  image: null,
  remove_image: false
})

// Pagination
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 9,
  total: 0,
  from: 0,
  to: 0,
  prev_page_url: null,
  next_page_url: null
})

// Methods
const fetchTestimonials = async () => {
  try {
    loading.value = true
    error.value = null
    formErrors.value = []
    
    const params = new URLSearchParams({
      page: pagination.current_page,
      per_page: pagination.per_page
    })
    
    // Using $fetch like news categories
    const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/testimonials?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data && data.data) {
      testimonials.value = data.data
    } else {
      testimonials.value = data || []
    }
    
    // Update pagination from response
    if (data) {
      Object.assign(pagination, {
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
        from: data.from || 0,
        to: data.to || 0,
        prev_page_url: data.prev_page_url,
        next_page_url: data.next_page_url
      })
    }
    
  } catch (err) {
    console.error('Failed to fetch testimonials:', err)
    error.value = err.message || 'Failed to load testimonials.'
    
    // Fallback to mock data for development
    if (config.public.devMode) {
      console.log('Using mock data for development')
      testimonials.value = [
        {
          id: 1,
          name: 'John Pilot',
          description: 'Great federation with excellent support for pilots. The clearance system is very helpful!',
          rating: 5,
          image: null,
          created_at: '2024-01-10T10:30:00Z'
        },
        {
          id: 2,
          name: 'Sarah Flyer',
          description: 'The weather alerts have saved me multiple times. Very reliable information.',
          rating: 4,
          image: null,
          created_at: '2024-01-09T14:20:00Z'
        }
      ]
      error.value = null
    }
  } finally {
    loading.value = false
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatTimeAgo = (date) => {
  if (!date) return ''
  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`
  return `${Math.floor(diffMins / 10080)}w ago`
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
  if (editingTestimonial.value?.image) {
    form.remove_image = true
  }
}

const editTestimonial = (testimonial) => {
  editingTestimonial.value = testimonial
  form.name = testimonial.name
  form.description = testimonial.description
  form.rating = testimonial.rating || 5
  form.image = testimonial.image
  form.remove_image = false
  formErrors.value = []
  fieldErrors.value = {}
  showCreateModal.value = true
}

const saveTestimonial = async () => {
  try {
    saving.value = true
    formErrors.value = []
    fieldErrors.value = {}
    
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    
    if (form.rating) {
      formData.append('rating', form.rating.toString())
    }
    
    // Add the image file if selected
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }

    const baseUrl = config.public.apiBase || 'http://localhost:8000'
    let url = `${baseUrl}/admin/testimonials`
    
    // CHANGE IS HERE:
    // Always use POST when sending files, but tell Laravel it's a PUT
    if (editingTestimonial.value) {
      url = `${baseUrl}/admin/testimonials/${editingTestimonial.value.id}`
      formData.append('_method', 'PUT') // Method Spoofing
    }
    
    const response = await $fetch(url, {
      method: 'POST', // Keep this POST so FormData works
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      },
      body: formData,
    })
    if (response.success || response.data) {
      closeModal()
      await fetchTestimonials()
      
      if (editingTestimonial.value) {
        alert('Testimonial updated successfully!')
      } else {
        alert('Testimonial created successfully!')
      }
    } else {
      throw new Error(response.message || 'Operation failed')
    }
    
  } catch (err) {
    console.error('Failed to save testimonial:', err)
    
    // Handle Laravel validation errors
    if (err.data && err.data.errors) {
      fieldErrors.value = err.data.errors
      if (err.data.message) {
        formErrors.value = [err.data.message]
      }
    } else if (err.message) {
      formErrors.value = [err.message]
    } else {
      formErrors.value = ['Failed to save testimonial. Please try again.']
    }
  } finally {
    saving.value = false
  }
}

const confirmDelete = (testimonial) => {
  testimonialToDelete.value = testimonial
  showDeleteModal.value = true
}

const deleteTestimonial = async () => {
  try {
    deleting.value = true
    
    const baseUrl = config.public.apiBase || 'http://localhost:8000'
    const url = `${baseUrl}/admin/testimonials/${testimonialToDelete.value.id}`
    
    const response = await $fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success || response.data) {
      closeDeleteModal()
      await fetchTestimonials()
      alert('Testimonial deleted successfully!')
    } else {
      throw new Error(response.message || 'Failed to delete testimonial')
    }
    
  } catch (err) {
    console.error('Failed to delete testimonial:', err)
    
    // Show error message
    if (err.data && err.data.message) {
      alert(err.data.message)
    } else {
      alert(err.message || 'Failed to delete testimonial. Please try again.')
    }
  } finally {
    deleting.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    pagination.current_page = page
    fetchTestimonials()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingTestimonial.value = null
  imagePreview.value = null
  imageFile.value = null
  formErrors.value = []
  fieldErrors.value = {}
  form.name = ''
  form.description = ''
  form.rating = 5
  form.image = null
  form.remove_image = false
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  testimonialToDelete.value = null
}

onMounted(() => {
  fetchTestimonials()
})
</script>

<style scoped>
.testimonials-admin {
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

.border-dashed {
  border-color: #dee2e6 !important;
}

.border-dashed:hover {
  background-color: #f8f9fa;
}

/* Avatar Styles */
.avatar-placeholder {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

/* Testimonial Content */
.testimonial-content {
  position: relative;
  padding-left: 1rem;
}

.testimonial-content::before {
  content: '"';
  position: absolute;
  left: 0;
  top: -0.5rem;
  font-size: 2rem;
  color: #dee2e6;
  font-family: Georgia, serif;
}

/* Rating Stars */
.rating-stars {
  display: flex;
  align-items: center;
}

.rating-stars .btn-link {
  text-decoration: none;
}

.rating-stars .btn-link:hover i {
  transform: scale(1.2);
}

.rating-stars i {
  transition: transform 0.2s;
}

/* Image Upload */
.image-preview img {
  max-width: 100%;
  height: auto;
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
.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .testimonial-content {
    padding-left: 0.5rem;
  }
  
  .testimonial-content::before {
    left: -0.5rem;
  }
}
</style>