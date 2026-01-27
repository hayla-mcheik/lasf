<template>
  <div class="sports-admin">
    <div class="dashboard-header mb-6">
      <div class="d-flex justify-content-between align-items-center container-fluid">
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
          <button class="btn btn-primary d-flex align-items-center" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            Add Sport
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="text-center">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading sports...</p>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger alert-dismissible fade show mb-4 mx-3" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>Error:</strong> {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <div v-else class="container-fluid px-4">
      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="sport in sports" :key="sport.id">
          <div class="card border-0 shadow-sm h-100 position-relative" style="overflow: visible !important;">
            <div class="card-img-top" style="height: 180px; overflow: hidden; border-radius: 12px 12px 0 0;">
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
                  <button class="btn btn-sm btn-outline-secondary border-0" type="button" 
                          @click.stop="toggleMenu(sport.id)">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul v-if="activeMenuId === sport.id" 
                      class="dropdown-menu show shadow-sm" 
                      style="display: block; position: absolute; right: 0; top: 100%; z-index: 1060; min-width: 120px;">
                    <li>
                      <a class="dropdown-item py-2" href="#" @click.prevent="handleEdit(sport)">
                        <i class="bi bi-pencil me-2 text-primary"></i> Edit
                      </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a class="dropdown-item py-2" href="#" @click.prevent="confirmDelete(sport)">
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
        
        <div class="col-md-6 col-lg-4">
          <div class="card border-2 border-dashed h-100" 
               @click="openCreateModal"
               style="cursor: pointer; border-style: dashed !important; min-height: 300px;">
            <div class="card-body d-flex flex-column align-items-center justify-content-center">
              <div class="text-center">
                <i class="bi bi-plus-circle display-6 text-muted mb-3"></i>
                <h5 class="text-muted">Add New Sport</h5>
                <p class="text-muted small mb-0">Add a new aerial sport to the federation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom text-white" :class="editingSport ? 'bg-primary' : 'bg-success'">
            <h5 class="modal-title">
              <i class="bi me-2" :class="editingSport ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
              {{ editingSport ? 'Edit Sport' : 'Create New Sport' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveSport">
            <div class="modal-body p-4">
              <div v-if="formErrors.length" class="alert alert-danger">
                <ul class="mb-0">
                  <li v-for="(error, index) in formErrors" :key="index">{{ error }}</li>
                </ul>
              </div>
              
              <div class="row g-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Sport Name <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control" required placeholder="e.g., Paragliding">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">Sport Image</label>
                  <div class="image-upload-wrapper">
                    <div v-if="imagePreview || (editingSport && editingSport.image && !form.remove_image)" class="mb-3 position-relative">
                      <img :src="imagePreview || editingSport.image" class="img-fluid rounded border" style="max-height: 120px;">
                      <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" @click="removeImage">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                    <input v-else type="file" class="form-control" accept="image/*" @change="handleImageUpload" ref="fileInput">
                  </div>
                </div>
                
                <div class="col-12">
                  <label class="form-label fw-bold">Description</label>
                  <textarea v-model="form.description" class="form-control" rows="4" placeholder="Brief details about this sport..."></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn" :class="editingSport ? 'btn-primary' : 'btn-success'" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingSport ? 'Save Changes' : 'Create Sport' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title"><i class="bi bi-trash me-2"></i>Delete Sport</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center p-4">
            <p>Are you sure you want to delete <strong>{{ sportToDelete?.name }}</strong>?</p>
            <p class="text-danger small"><i class="bi bi-exclamation-triangle me-1"></i> This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteSport" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal || showDeleteModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()
const config = useRuntimeConfig()

// State
const sports = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref(null)
const activeMenuId = ref(null) // Tracks which dropdown is open

// Modals & Form
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingSport = ref(null)
const sportToDelete = ref(null)
const imagePreview = ref(null)
const imageFile = ref(null)
const fileInput = ref(null)

const form = reactive({
  name: '',
  description: '',
  remove_image: false
})

// Toggle Custom Dropdown
const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// API Calls
const fetchSports = async () => {
  loading.value = true
  try {
    const response = await $fetch(`${config.public.apiBase}/admin/sports`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    sports.value = response.data || response
  } catch (err) {
    error.value = 'Failed to load sports list.'
  } finally {
    loading.value = false
  }
}

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = null
  form.remove_image = true
  if (fileInput.value) fileInput.value.value = ''
}

const openCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

const handleEdit = (sport) => {
  activeMenuId.value = null // Close dropdown
  editingSport.value = sport
  form.name = sport.name
  form.description = sport.description || ''
  form.remove_image = false
  showCreateModal.value = true
}

const saveSport = async () => {
  saving.value = true
  const formData = new FormData()
  formData.append('name', form.name)
  formData.append('description', form.description)
  
  if (imageFile.value) {
    formData.append('image', imageFile.value)
  } else if (form.remove_image) {
    formData.append('remove_image', 'true')
  }

  // Laravel Method Spoofing for PUT
  if (editingSport.value) {
    formData.append('_method', 'PUT')
  }

  const url = editingSport.value 
    ? `${config.public.apiBase}/admin/sports/${editingSport.value.id}`
    : `${config.public.apiBase}/admin/sports`

  try {
    await $fetch(url, {
      method: 'POST', // Use POST even for updates due to FormData/Files
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json' 
      },
      body: formData
    })
    alert('Sport saved successfully')
    closeModal()
    fetchSports()
  } catch (err) {
    alert(err.data?.message || 'Error saving record')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (sport) => {
  activeMenuId.value = null
  sportToDelete.value = sport
  showDeleteModal.value = true
}

const deleteSport = async () => {
  deleting.value = true
  try {
    await $fetch(`${config.public.apiBase}/admin/sports/${sportToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    closeDeleteModal()
    fetchSports()
  } catch (err) {
    alert('Delete failed')
  } finally {
    deleting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingSport.value = null
  resetForm()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  sportToDelete.value = null
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.remove_image = false
  imageFile.value = null
  imagePreview.value = null
}

// Global click listener to close dropdowns
const handleGlobalClick = () => { activeMenuId.value = null }

onMounted(() => {
  fetchSports()
  window.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
.sports-admin { background: #f8f9fa; min-height: 100vh; }
.bg-cover { background-size: cover; background-position: center; }
.loading-overlay { min-height: 400px; display: flex; align-items: center; justify-content: center; }
.border-dashed { border: 2px dashed #dee2e6 !important; }
.dropdown-menu { border: none; box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15); }

/* Ensure modal displays above backdrop */
.modal { background: rgba(0,0,0,0.2); }
.modal-backdrop { z-index: 1040; }
</style>