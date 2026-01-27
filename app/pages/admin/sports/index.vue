<template>
  <div class="sports-admin">
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

    <div v-if="loading" class="loading-overlay">
      <div class="text-center">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading sports...</p>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>Error:</strong> {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <div v-else>
      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="sport in sports" :key="sport.id">
          <div class="card border-0 shadow-sm h-100" style="overflow: visible !important;">
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
                          @click.stop="toggleMenu(sport.id)">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu shadow-sm" :class="{ 'show': activeMenuId === sport.id }" 
                      style="right: 0; left: auto;">
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
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Sport Name <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.name }" required
                         placeholder="e.g., Paragliding, Paramotor, Skydiving...">
                  <div v-if="fieldErrors.name" class="invalid-feedback">
                    {{ fieldErrors.name[0] }}
                  </div>
                </div>
                
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
                
                <div class="col-12">
                  <label class="form-label fw-semibold">Description</label>
                  <textarea v-model="form.description" class="form-control" :class="{ 'is-invalid': fieldErrors.description }" rows="3"
                            placeholder="Brief description of the sport..."></textarea>
                  <div v-if="fieldErrors.description" class="invalid-feedback">
                    {{ fieldErrors.description[0] }}
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-top">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn" :class="editingSport ? 'btn-primary' : 'btn-success'" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi" :class="editingSport ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                {{ editingSport ? 'Update Sport' : 'Create Sport' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom bg-danger text-white">
            <h5 class="modal-title"><i class="bi bi-exclamation-triangle me-2"></i>Delete Sport</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center">
            <h5 class="fw-bold">Delete Sport</h5>
            <p class="text-muted">Are you sure you want to delete <strong class="text-danger">{{ sportToDelete?.name }}</strong>?</p>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteSport" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Sport
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

// DATA & STATE
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref(null)
const sports = ref([])
const activeMenuId = ref(null) // TRACKS OPEN DROPDOWN

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
  image: null,
  remove_image: false
})

// DROPDOWN LOGIC
const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

// Close menu when clicking outside
const closeMenus = () => { activeMenuId.value = null }

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length <= length ? text : text.substring(0, length) + '...'
}

const fetchSports = async () => {
  try {
    loading.value = true
    const data = await $fetch(`${config.public.apiBase}/admin/sports`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    sports.value = data.data || data
  } catch (err) {
    error.value = err.message || 'Failed to load sports.'
  } finally {
    loading.value = false
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => { imagePreview.value = e.target.result }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  imagePreview.value = null
  imageFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  if (editingSport.value?.image) form.remove_image = true
}

const editSport = (sport) => {
  activeMenuId.value = null
  editingSport.value = sport
  form.name = sport.name
  form.description = sport.description || ''
  showCreateModal.value = true
}

const saveSport = async () => {
  try {
    saving.value = true
    const formData = new FormData()
    formData.append('name', form.name)
    if (form.description) formData.append('description', form.description)
    if (imageFile.value) formData.append('image', imageFile.value)
    
    let url = `${config.public.apiBase}/admin/sports`
    if (editingSport.value) {
      url += `/${editingSport.value.id}`
      formData.append('_method', 'PUT')
    }
    
    await $fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData,
    })
    
    closeModal()
    await fetchSports()
  } catch (err) {
    console.error(err)
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
  try {
    deleting.value = true
    await $fetch(`${config.public.apiBase}/admin/sports/${sportToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    closeDeleteModal()
    await fetchSports()
  } catch (err) {
    console.error(err)
  } finally {
    deleting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingSport.value = null
  imagePreview.value = null
  Object.assign(form, { name: '', description: '', remove_image: false })
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  sportToDelete.value = null
}

onMounted(() => {
  fetchSports()
  window.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  window.removeEventListener('click', closeMenus)
})
</script>

<style scoped>
/* Added overflow visible to card to ensure dropdown isn't clipped */
.card { overflow: visible !important; }
.dropdown-menu { 
  display: none; 
  position: absolute; 
  z-index: 1000; 
  top: 100%; 
  right: 0; 
}
.dropdown-menu.show { display: block; }

.sports-admin { padding: 1.5rem 0; background: #f8f9fa; min-height: 100vh; }
.bg-cover { background-size: cover; background-position: center; }
.modal-backdrop { opacity: 0.5; z-index: 1040; }
.modal { z-index: 1050; }
</style>