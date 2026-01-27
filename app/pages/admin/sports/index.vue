<template>
  <div class="sports-admin container-fluid">
    <div class="dashboard-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-trophy me-3 text-primary"></i>
            Sports & Disciplines
          </h1>
          <p class="text-muted mb-0">Manage all aerial sports supported by the federation</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center" @click="showCreateModal = true">
          <i class="bi bi-plus-circle me-2"></i>
          Add Sport
        </button>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card shadow-sm border-0 border-start border-primary border-4">
          <div class="card-body">
            <h6 class="text-muted mb-1">Total Sports</h6>
            <h3 class="fw-bold mb-0">{{ sports.length }}</h3>
          </div>
        </div>
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
                <th>Sport Name</th>
                <th>Description</th>
                <th>Locations</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sport in sports" :key="sport.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="sport-img-wrapper me-3">
                      <img v-if="sport.image" :src="sport.image" class="rounded border" style="width: 50px; height: 50px; object-fit: cover;">
                      <div v-else class="avatar-sm bg-primary-subtle text-primary">
                        <i class="bi bi-trophy"></i>
                      </div>
                    </div>
                    <div class="fw-bold">{{ sport.name }}</div>
                  </div>
                </td>
                <td class="text-muted small">
                  {{ truncateText(sport.description, 80) || 'No description provided' }}
                </td>
                <td>
                  <span class="badge bg-info-subtle text-info rounded-pill px-3">
                    {{ sport.flying_locations_count || 0 }} Locations
                  </span>
                </td>
                <td class="text-center">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-light border" type="button" @click.stop="toggleMenu(sport.id)">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu shadow-sm" :class="{ 'show': activeMenuId === sport.id }" 
                        style="right: 0; left: auto; top: 100%; z-index: 1060;">
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="editSport(sport)">
                          <i class="bi bi-pencil me-2 text-primary"></i> Edit
                        </a>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDelete(sport)">
                          <i class="bi bi-trash me-2"></i> Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr v-if="!loading && sports.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">No sports found. Add your first sport!</td>
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
          <div class="modal-header border-bottom" :class="editingSport ? 'bg-primary text-white' : 'bg-success text-white'">
            <h5 class="modal-title">{{ editingSport ? 'Edit Sport' : 'Add New Sport' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveSport" enctype="multipart/form-data">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-12">
                  <label class="form-label fw-bold">Sport Name</label>
                  <input v-model="form.name" type="text" class="form-control" placeholder="e.g. Paragliding" required>
                </div>
                <div class="col-md-12">
                  <label class="form-label fw-bold">Sport Image</label>
                  <div v-if="imagePreview || (editingSport && editingSport.image && !form.remove_image)" class="mb-2">
                     <img :src="imagePreview || editingSport.image" class="rounded border" style="max-height: 100px;">
                     <button type="button" class="btn btn-sm btn-link text-danger" @click="removeImage">Remove</button>
                  </div>
                  <input type="file" @change="handleImageUpload" class="form-control" accept="image/*">
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold">Description</label>
                  <textarea v-model="form.description" class="form-control" rows="4" placeholder="Describe the sport..."></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                Save Sport
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-backdrop fade show"></div>
    <div v-if="showDeleteModal" class="modal fade show d-block" @click.self="closeDeleteModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center p-4">
            <i class="bi bi-exclamation-triangle display-4 text-danger mb-3"></i>
            <p class="mb-0">Are you sure you want to delete sport <strong>{{ sportToDelete?.name }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteSport" :disabled="deleting">Delete</button>
          </div>
        </div>
      </div>
    </div>
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
const activeMenuId = ref(null) 

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

// DROPDOWN LOGIC
const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

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
  form.remove_image = true
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
  imageFile.value = null
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
.pilots-admin {
  padding: 1.5rem 0;
  background: #f8f9fa;
  min-height: 100vh;
}

.dashboard-header {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

/* Avatar Sm matching Pilot style */
.avatar-sm {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
}

/* Table Management */
.table thead th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Dropdown fix */
.dropdown {
  position: relative;
}
.dropdown-menu {
  display: none;
  position: absolute;
  min-width: 150px;
}
.dropdown-menu.show {
  display: block;
}

.modal-backdrop {
  z-index: 1040;
}
.modal {
  z-index: 1050;
}
</style>