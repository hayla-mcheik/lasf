<template>
  <div class="gallery-admin container-fluid">
    <div class="dashboard-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-images me-3 text-primary"></i>
            Media Gallery
          </h1>
          <p class="text-muted mb-0">Upload and manage photos and videos for the federation</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center" @click="showUploadModal = true">
          <i class="bi bi-cloud-upload me-2"></i>
          Upload Media
        </button>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-8">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body d-flex align-items-center">
            <div class="row g-3 w-100">
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="bi bi-search text-muted"></i>
                  </span>
                  <input v-model="filters.search" type="text" class="form-control border-start-0" 
                         placeholder="Search media..." @input="handleSearch">
                </div>
              </div>
              <div class="col-md-4">
                <select v-model="filters.type" class="form-select" @change="fetchMedia">
                  <option value="">All Media Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                </select>
              </div>
              <div class="col-md-3">
                <select v-model="filters.sort" class="form-select" @change="fetchMedia">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="row g-2 h-100">
          <div class="col-6">
            <div class="card border-0 bg-primary-subtle h-100">
              <div class="card-body text-center p-3">
                <div class="fw-bold fs-5 text-primary">{{ stats.images || 0 }}</div>
                <small class="text-muted">Images</small>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="card border-0 bg-info-subtle h-100">
              <div class="card-body text-center p-3">
                <div class="fw-bold fs-5 text-info">{{ stats.videos || 0 }}</div>
                <small class="text-muted">Videos</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Loading media assets...</p>
        </div>
        <div v-else class="table-responsive" style="overflow: visible !important;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Preview</th>
                <th>File Name</th>
                <th>Type</th>
                <th>Uploaded</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in media" :key="item.id">
                <td>
                  <div class="media-thumb-container" @click="previewMedia(item)" style="cursor: pointer;">
                    <img v-if="item.type === 'image'" :src="item.file" class="rounded border" 
                         style="width: 60px; height: 45px; object-fit: cover;">
                    <div v-else class="rounded border bg-dark d-flex align-items-center justify-content-center" 
                         style="width: 60px; height: 45px;">
                      <i class="bi bi-play-fill text-white"></i>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ item.title || 'Untitled Asset' }}</div>
                  <small class="text-muted d-block" style="font-size: 0.75rem;">{{ item.file.split('/').pop() }}</small>
                </td>
                <td>
                  <span :class="`badge rounded-pill px-3 bg-${item.type === 'image' ? 'primary' : 'info'}-subtle text-${item.type === 'image' ? 'primary' : 'info'}`">
                    {{ item.type.toUpperCase() }}
                  </span>
                </td>
                <td>
                  <div class="small text-muted">{{ formatTimeAgo(item.created_at) }}</div>
                </td>
                <td class="text-center">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-light border" type="button" @click.stop="toggleMenu(item.id)">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu shadow-sm" :class="{ 'show': activeMenuId === item.id }" 
                        style="right: 0; left: auto; top: 100%; z-index: 1060;">
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="previewMedia(item)">
                          <i class="bi bi-eye me-2 text-primary"></i> Preview
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="editMedia(item)">
                          <i class="bi bi-pencil me-2"></i> Rename
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="downloadMedia(item)">
                          <i class="bi bi-download me-2"></i> Download
                        </a>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDelete(item)">
                          <i class="bi bi-trash me-2"></i> Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr v-if="media.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">No media files found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showUploadModal" class="modal-backdrop fade show"></div>
    <div v-if="showUploadModal" class="modal fade show d-block" tabindex="-1" @click.self="closeUploadModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom bg-primary text-white">
            <h5 class="modal-title"><i class="bi bi-cloud-upload me-2"></i>Upload Media</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeUploadModal"></button>
          </div>
          <form @submit.prevent="uploadMedia">
            <div class="modal-body p-4">
              <div class="upload-zone border-dashed p-5 text-center mb-3" 
                   @dragover.prevent="isDragging = true" 
                   @dragleave.prevent="isDragging = false" 
                   @drop.prevent="handleDrop"
                   :class="{ 'bg-primary-subtle border-primary': isDragging }">
                <i class="bi bi-cloud-arrow-up display-4 text-muted"></i>
                <h5 class="mt-3">Drag and drop files here</h5>
                <p class="text-muted small">or click to browse from your computer</p>
                <input type="file" ref="fileInput" multiple accept="image/*,video/*" class="d-none" @change="handleFileSelect">
                <button type="button" class="btn btn-outline-primary mt-2" @click="browseFiles">Browse Files</button>
              </div>

              <div v-if="selectedFiles.length" class="selected-files-list mb-3">
                <div v-for="(file, idx) in selectedFiles" :key="idx" class="d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                  <div class="small text-truncate"><i class="bi bi-file-earmark-check me-2"></i>{{ file.name }}</div>
                  <button type="button" class="btn-close small" @click="removeFile(idx)"></button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Global Title (Applied to all)</label>
                <input v-model="uploadData.title" type="text" class="form-control" placeholder="e.g. Summer Competition 2025">
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="closeUploadModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="uploading || !selectedFiles.length">
                <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
                Start Upload
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showPreviewModal" class="modal-backdrop fade show"></div>
    <div v-if="showPreviewModal" class="modal fade show d-block" @click.self="closePreviewModal">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow bg-dark">
          <div class="modal-header border-0 text-white">
            <h5 class="modal-title">{{ previewItem?.title }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closePreviewModal"></button>
          </div>
          <div class="modal-body p-0 text-center">
            <img v-if="previewItem?.type === 'image'" :src="previewItem.file" class="img-fluid">
            <video v-else :src="previewItem?.file" controls autoplay class="w-100"></video>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-backdrop fade show"></div>
    <div v-if="showDeleteModal" class="modal fade show d-block" @click.self="closeDeleteModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete File</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center p-4">
            <i class="bi bi-trash display-4 text-danger mb-3"></i>
            <p>Delete this media file permanently?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteMedia" :disabled="deleting">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()
const config = useRuntimeConfig()

// State
const loading = ref(false)
const uploading = ref(false)
const deleting = ref(false)
const error = ref(null)
const media = ref([])
const activeMenuId = ref(null)
const isDragging = ref(false)

const filters = reactive({ search: '', type: '', sort: 'newest' })
const stats = reactive({ images: 0, videos: 0 })
const pagination = reactive({ current_page: 1, last_page: 1, per_page: 12, total: 0, from: 0, to: 0 })

const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const showDeleteModal = ref(false)

const selectedFiles = ref([])
const uploadData = reactive({ type: 'image', title: '' })
const previewItem = ref(null)
const mediaToDelete = ref(null)
const fileInput = ref(null)

// Helpers
const toggleMenu = (id) => { activeMenuId.value = activeMenuId.value === id ? null : id }
const closeMenus = () => { activeMenuId.value = null }
const formatTimeAgo = (date) => date ? new Date(date).toLocaleDateString() : 'Just now'

// API
const fetchMedia = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({ 
        page: pagination.current_page, 
        search: filters.search, 
        type: filters.type, 
        sort: filters.sort 
    })
    const data = await $fetch(`${config.public.apiBase}/admin/gallery?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    media.value = data.data || []
    if (data.total) Object.assign(pagination, data)
    stats.images = media.value.filter(m => m.type === 'image').length
    stats.videos = media.value.filter(m => m.type === 'video').length
  } finally { loading.value = false }
}

const handleSearch = useDebounceFn(fetchEvents, 500)

const browseFiles = () => fileInput.value.click()
const handleFileSelect = (e) => selectedFiles.value.push(...Array.from(e.target.files))
const handleDrop = (e) => {
    isDragging.value = false
    selectedFiles.value.push(...Array.from(e.dataTransfer.files))
}
const removeFile = (idx) => selectedFiles.value.splice(idx, 1)

const uploadMedia = async () => {
  uploading.value = true
  try {
    for (const file of selectedFiles.value) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', file.type.startsWith('image') ? 'image' : 'video')
      if (uploadData.title) formData.append('title', uploadData.title)

      await $fetch(`${config.public.apiBase}/admin/gallery`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authStore.token}` },
        body: formData
      })
    }
    closeUploadModal()
    fetchMedia()
  } finally { uploading.value = false }
}

const previewMedia = (item) => { previewItem.value = item; showPreviewModal.value = true }
const downloadMedia = (item) => window.open(item.file, '_blank')
const confirmDelete = (item) => { mediaToDelete.value = item; showDeleteModal.value = true }

const deleteMedia = async () => {
  deleting.value = true
  try {
    await $fetch(`${config.public.apiBase}/admin/gallery/${mediaToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    showDeleteModal.value = false; fetchMedia()
  } finally { deleting.value = false }
}

const editMedia = async (item) => {
  const newTitle = prompt('New title:', item.title)
  if (newTitle) {
    await $fetch(`${config.public.apiBase}/admin/gallery/${item.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: { title: newTitle }
    })
    fetchMedia()
  }
}

const closeUploadModal = () => { showUploadModal.value = false; selectedFiles.value = [] }
const closePreviewModal = () => { showPreviewModal.value = false }
const closeDeleteModal = () => { showDeleteModal.value = false }

onMounted(() => { fetchMedia(); window.addEventListener('click', closeMenus) })
onUnmounted(() => window.removeEventListener('click', closeMenus))
</script>

<style scoped>
.avatar-sm { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.dropdown-menu { display: none; position: absolute; min-width: 140px; }
.dropdown-menu.show { display: block; }
.border-dashed { border: 2px dashed #dee2e6; border-radius: 12px; }
.table-responsive { overflow: visible !important; }
</style>