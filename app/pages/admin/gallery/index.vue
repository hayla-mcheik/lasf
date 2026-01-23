<template>
  <div class="gallery-admin">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-images me-3 text-primary"></i>
            Media Gallery
          </h1>
          <div class="d-flex align-items-center gap-3">
            <p class="text-muted mb-0">
              <i class="bi bi-folder me-1"></i>
              Upload and manage photos, videos, and documents
            </p>
            <span class="badge bg-primary-subtle text-primary">
              {{ media.length }} items
            </span>
          </div>
        </div>
        <div>
          <button class="btn btn-primary d-flex align-items-center" @click="showUploadModal = true">
            <i class="bi bi-cloud-upload me-2"></i>
            Upload Media
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
        <p class="mt-3 text-muted">Loading media...</p>
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
      <!-- Filters & Stats -->
      <div class="row g-4 mb-4">
        <div class="col-md-8">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <div class="row g-3 align-items-center">
                <!-- Type Filter -->
                <div class="col-md-4">
                  <select v-model="filters.type" class="form-select" @change="fetchMedia">
                    <option value="">All Media</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                  </select>
                </div>
                
                <!-- Search -->
                <div class="col-md-5">
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input v-model="filters.search" type="text" class="form-control" 
                           placeholder="Search media..." @input="handleSearch">
                  </div>
                </div>
                
                <!-- Sort -->
                <div class="col-md-3">
                  <select v-model="filters.sort" class="form-select" @change="fetchMedia">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="col-md-4">
          <div class="row g-2">
            <div class="col-6">
              <div class="card border-0 bg-primary-subtle">
                <div class="card-body text-center p-3">
                  <div class="text-primary mb-1">
                    <i class="bi bi-image fs-4"></i>
                  </div>
                  <div class="fw-bold fs-5">{{ stats.images || 0 }}</div>
                  <small class="text-muted">Images</small>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="card border-0 bg-info-subtle">
                <div class="card-body text-center p-3">
                  <div class="text-info mb-1">
                    <i class="bi bi-film fs-4"></i>
                  </div>
                  <div class="fw-bold fs-5">{{ stats.videos || 0 }}</div>
                  <small class="text-muted">Videos</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Media Grid -->
      <div class="row g-4">
        <div class="col-md-6 col-lg-4 col-xl-3" v-for="item in media" :key="item.id">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-img-top position-relative" style="height: 200px; overflow: hidden;">
              <div v-if="item.type === 'image'" class="h-100 bg-cover" 
                   :style="{ backgroundImage: `url(${item.file})` }"
                   @click="previewMedia(item)"></div>
              <div v-else class="h-100 bg-info-subtle d-flex align-items-center justify-content-center"
                   @click="previewMedia(item)">
                <i class="bi bi-play-circle display-4 text-info"></i>
              </div>
              <div class="position-absolute top-0 end-0 m-2">
                <span :class="`badge bg-${item.type === 'image' ? 'primary' : 'info'}`">
                  {{ item.type }}
                </span>
              </div>
              <div class="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 p-2">
                <div class="text-white small text-truncate">
                  {{ item.title || 'Untitled' }}
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                  {{ formatTimeAgo(item.created_at) }}
                </small>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" 
                          data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="editMedia(item)">
                        <i class="bi bi-pencil me-2"></i> Edit
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="downloadMedia(item)">
                        <i class="bi bi-download me-2"></i> Download
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="confirmDelete(item)">
                        <i class="bi bi-trash me-2 text-danger"></i> Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Upload Card -->
        <div class="col-md-6 col-lg-4 col-xl-3">
          <div class="card border-2 border-dashed h-100" 
               @click="showUploadModal = true"
               style="cursor: pointer; border-style: dashed !important;">
            <div class="card-body d-flex flex-column align-items-center justify-content-center">
              <div class="text-center py-5">
                <i class="bi bi-cloud-arrow-up display-6 text-muted mb-3"></i>
                <h5 class="text-muted">Upload Media</h5>
                <p class="text-muted small mb-0">Add new images or videos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > pagination.per_page" class="d-flex justify-content-between align-items-center mt-4">
        <div class="text-muted small">
          Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} items
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

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal fade show d-block" tabindex="-1" 
         :class="{ show: showUploadModal }" @click.self="closeUploadModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-cloud-upload me-2"></i>
              Upload Media
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeUploadModal"></button>
          </div>
          <form @submit.prevent="uploadMedia" enctype="multipart/form-data">
            <div class="modal-body">
              <div v-if="formErrors.length" class="alert alert-danger">
                <ul class="mb-0">
                  <li v-for="(error, index) in formErrors" :key="index">{{ error }}</li>
                </ul>
              </div>
              
              <div class="mb-4">
                <div class="upload-zone" @dragover.prevent @drop="handleDrop" 
                     :class="{ 'border-primary': isDragging }">
                  <div class="text-center py-5">
                    <i class="bi bi-cloud-arrow-up display-4 text-muted mb-3"></i>
                    <h5 class="mb-3">Drop files here or click to browse</h5>
                    <input type="file" ref="fileInput" multiple 
                           accept="image/*,video/*" 
                           class="d-none" 
                           @change="handleFileSelect">
                    <button type="button" class="btn btn-outline-primary" @click="browseFiles">
                      Browse Files
                    </button>
                    <p class="text-muted small mt-3">
                      Supported: JPG, PNG, GIF, MP4, AVI (Max 50MB each)
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Selected Files -->
              <div v-if="selectedFiles.length > 0" class="mb-4">
                <h6 class="mb-3">Selected Files ({{ selectedFiles.length }})</h6>
                <div class="selected-files">
                  <div v-for="(file, index) in selectedFiles" :key="index" 
                       class="selected-file-item mb-2">
                    <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                      <div>
                        <i :class="`bi me-2 ${getFileIcon(file.type)}`"></i>
                        <span class="fw-semibold">{{ file.name }}</span>
                        <small class="text-muted ms-2">({{ formatFileSize(file.size) }})</small>
                      </div>
                      <button type="button" class="btn btn-sm btn-outline-danger" 
                              @click="removeFile(index)">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Media Type -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Media Type</label>
                <div class="row g-3">
                  <div class="col-6">
                    <div class="form-check card border" :class="{ 'border-primary': uploadData.type === 'image' }">
                      <div class="card-body p-3">
                        <input v-model="uploadData.type" class="form-check-input" type="radio" 
                               value="image" id="type-image">
                        <label class="form-check-label fw-semibold" for="type-image">
                          <i class="bi bi-image me-2"></i> Images
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="form-check card border" :class="{ 'border-info': uploadData.type === 'video' }">
                      <div class="card-body p-3">
                        <input v-model="uploadData.type" class="form-check-input" type="radio" 
                               value="video" id="type-video">
                        <label class="form-check-label fw-semibold" for="type-video">
                          <i class="bi bi-film me-2"></i> Videos
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Title -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Title (Optional)</label>
                <input v-model="uploadData.title" type="text" class="form-control" 
                       placeholder="Enter a title for the media...">
              </div>
            </div>
            <div class="modal-footer border-top">
              <button type="button" class="btn btn-outline-secondary" @click="closeUploadModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="uploading || selectedFiles.length === 0">
                <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-cloud-arrow-up me-2"></i>
                Upload {{ selectedFiles.length }} File(s)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreviewModal" class="modal fade show d-block" tabindex="-1" 
         :class="{ show: showPreviewModal }" @click.self="closePreviewModal">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom">
            <h5 class="modal-title">{{ previewItem?.title || 'Media Preview' }}</h5>
            <button type="button" class="btn-close" @click="closePreviewModal"></button>
          </div>
          <div class="modal-body text-center">
            <div v-if="previewItem?.type === 'image'" class="media-preview">
              <img :src="previewItem.file" alt="Preview" class="img-fluid rounded">
            </div>
            <div v-else class="media-preview">
              <video :src="previewItem.file" controls class="w-100 rounded"></video>
            </div>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-outline-secondary" @click="closePreviewModal">
              Close
            </button>
            <button type="button" class="btn btn-primary" @click="downloadMedia(previewItem)">
              <i class="bi bi-download me-2"></i> Download
            </button>
          </div>
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
              Delete Media
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="warning-icon mb-4">
              <i class="bi bi-trash fs-1 text-danger"></i>
            </div>
            <h5 class="fw-bold">Delete Media</h5>
            <p class="text-muted">Are you sure you want to delete this media file?</p>
            <div class="alert alert-warning small">
              <i class="bi bi-info-circle me-2"></i>
              This action cannot be undone. The file will be permanently removed.
            </div>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="deleteMedia" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="showUploadModal || showPreviewModal || showDeleteModal" 
         class="modal-backdrop fade show"></div>
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
const fileInput = ref(null)

// Data
const loading = ref(false)
const uploading = ref(false)
const deleting = ref(false)
const error = ref(null)
const formErrors = ref([])
const isDragging = ref(false)

const media = ref([])
const stats = reactive({
  images: 0,
  videos: 0,
  total: 0
})

// Filters
const filters = reactive({
  search: '',
  type: '',
  sort: 'newest'
})

// Pagination
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
  from: 0,
  to: 0,
  prev_page_url: null,
  next_page_url: null
})

// Modals
const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const showDeleteModal = ref(false)

// Upload
const selectedFiles = ref([])
const uploadData = reactive({
  type: 'image',
  title: ''
})

// Preview & Delete
const previewItem = ref(null)
const mediaToDelete = ref(null)

// Methods
const fetchMedia = async () => {
  try {
    loading.value = true
    error.value = null
    formErrors.value = []
    
    const params = new URLSearchParams({
      page: pagination.current_page,
      per_page: pagination.per_page,
      ...(filters.search && { search: filters.search }),
      ...(filters.type && { type: filters.type }),
      ...(filters.sort && { sort: filters.sort })
    })
    
    // Using $fetch like news categories
    const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/gallery?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data && data.data) {
      media.value = data.data
    } else {
      media.value = data
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
    
    // Update stats
    updateStats()
    
  } catch (err) {
    console.error('Failed to fetch media:', err)
    error.value = err.message || 'Failed to load media.'
    
    // Fallback to mock data for development
    if (config.public.devMode) {
      console.log('Using mock data for development')
      media.value = [
        {
          id: 1,
          title: 'Paragliding Event',
          type: 'image',
          file: 'https://via.placeholder.com/300x200',
          created_at: '2024-01-10T10:30:00Z'
        },
        {
          id: 2,
          title: 'Safety Training',
          type: 'video',
          file: 'https://example.com/video.mp4',
          created_at: '2024-01-09T14:20:00Z'
        }
      ]
      error.value = null
      updateStats()
    }
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  const images = media.value.filter(m => m.type === 'image').length
  const videos = media.value.filter(m => m.type === 'video').length
  
  stats.images = images
  stats.videos = videos
  stats.total = media.value.length
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

const handleSearch = useDebounceFn(() => {
  pagination.current_page = 1
  fetchMedia()
}, 500)

const browseFiles = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  validateAndAddFiles(files)
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = Array.from(event.dataTransfer.files)
  validateAndAddFiles(files)
}

const validateAndAddFiles = (files) => {
  const validFiles = files.filter(file => {
    const fileType = file.type.split('/')[0]
    const isValidType = fileType === 'image' || fileType === 'video'
    const isValidSize = file.size <= 50 * 1024 * 1024 // 50MB
    
    if (!isValidType) {
      alert(`${file.name}: Invalid file type. Only images and videos are allowed.`)
      return false
    }
    
    if (!isValidSize) {
      alert(`${file.name}: File too large. Maximum size is 50MB.`)
      return false
    }
    
    return true
  })
  
  selectedFiles.value.push(...validFiles)
  if (validFiles.length > 0) {
    // Auto-set media type based on first file
    const firstFileType = validFiles[0].type.split('/')[0]
    uploadData.type = firstFileType
  }
}

const getFileIcon = (fileType) => {
  const type = fileType.split('/')[0]
  return type === 'image' ? 'bi-image' : 'bi-film'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const uploadMedia = async () => {
  try {
    uploading.value = true
    formErrors.value = []
    
    for (const file of selectedFiles.value) {
      const formData = new FormData()
      formData.append('type', uploadData.type)
      formData.append('file', file)
      if (uploadData.title) {
        formData.append('title', uploadData.title)
      }
      
      const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        },
        body: formData,
      })
      
      if (!data.success && !data.data) {
        const message = data.message || 'Failed to upload'
        formErrors.value.push(`${file.name}: ${message}`)
      }
    }
    
    if (formErrors.value.length === 0) {
      closeUploadModal()
      await fetchMedia()
      alert(`${selectedFiles.value.length} file(s) uploaded successfully!`)
    } else {
      alert('Some files failed to upload. Please check the errors.')
    }
    
  } catch (err) {
    console.error('Failed to upload media:', err)
    formErrors.value = [err.message || 'Failed to upload media']
  } finally {
    uploading.value = false
  }
}

const previewMedia = (item) => {
  previewItem.value = item
  showPreviewModal.value = true
}

const editMedia = async (item) => {
  try {
    const newTitle = prompt('Edit media title:', item.title || '')
    if (newTitle !== null) {
      const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/gallery/${item.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      })
      
      if (data.success || data.data) {
        item.title = newTitle
        alert('Media updated successfully!')
      } else {
        throw new Error(data.message || 'Failed to update media')
      }
    }
  } catch (err) {
    console.error('Failed to edit media:', err)
    alert(err.message || 'Failed to update media')
  }
}

const downloadMedia = (item) => {
  if (item.file) {
    const link = document.createElement('a')
    link.href = item.file
    link.download = item.title || item.file.split('/').pop()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    alert('Download started')
  }
}

const confirmDelete = (item) => {
  mediaToDelete.value = item
  showDeleteModal.value = true
}

const deleteMedia = async () => {
  try {
    deleting.value = true
    
    const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/gallery/${mediaToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data.success || data.data) {
      closeDeleteModal()
      await fetchMedia()
      alert('Media deleted successfully!')
    } else {
      throw new Error(data.message || 'Failed to delete media')
    }
    
  } catch (err) {
    console.error('Failed to delete media:', err)
    alert(err.message || 'Failed to delete media')
  } finally {
    deleting.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    pagination.current_page = page
    fetchMedia()
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  selectedFiles.value = []
  uploadData.type = 'image'
  uploadData.title = ''
  formErrors.value = []
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  previewItem.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  mediaToDelete.value = null
}

onMounted(() => {
  fetchMedia()
})
</script>

<style scoped>
.gallery-admin {
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

/* Image Styles */
.bg-cover {
  background-size: cover;
  background-position: center;
  cursor: pointer;
}

.bg-cover:hover {
  opacity: 0.9;
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  transition: all 0.3s;
  background: #f8f9fa;
}

.upload-zone:hover {
  border-color: #0d6efd;
  background: #e7f1ff;
}

.upload-zone.border-primary {
  border-color: #0d6efd !important;
  background: #e7f1ff;
}

/* Selected Files */
.selected-file-item {
  transition: all 0.2s;
}

.selected-file-item:hover {
  background-color: #f1f3f4 !important;
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

/* Media Preview */
.media-preview img, .media-preview video {
  max-height: 70vh;
  object-fit: contain;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .card-img-top {
    height: 150px !important;
  }
}
</style>