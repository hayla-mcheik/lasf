<template>
  <div class="testimonials-admin container-fluid">
    <div class="dashboard-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-chat-quote me-3 text-primary"></i>
            Testimonials Management
          </h1>
          <p class="text-muted mb-0">Manage pilot feedback and federation testimonials</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center" @click="showCreateModal = true">
          <i class="bi bi-plus-circle me-2"></i>
          Add Testimonial
        </button>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card shadow-sm border-0 border-start border-primary border-4">
          <div class="card-body">
            <h6 class="text-muted mb-1">Total Feedback</h6>
            <h3 class="fw-bold mb-0">{{ pagination.total }}</h3>
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
                <th>Pilot</th>
                <th>Testimonial</th>
                <th>Rating</th>
                <th>Date</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="testimonial in testimonials" :key="testimonial.id">
                <td>
                  <div class="d-flex align-items-center">
                    <img v-if="testimonial.image" :src="testimonial.image" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
                    <div v-else class="avatar-sm bg-primary-subtle text-primary me-2">
                      {{ getInitials(testimonial.name) }}
                    </div>
                    <div>
                      <div class="fw-bold">{{ testimonial.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="text-muted small" style="max-width: 300px;">
                  <span class="fst-italic">"{{ truncateText(testimonial.description, 100) }}"</span>
                </td>
                <td>
                  <div class="text-warning">
                    <i v-for="star in 5" :key="star" class="bi" :class="star <= testimonial.rating ? 'bi-star-fill' : 'bi-star'"></i>
                  </div>
                </td>
                <td class="small">{{ formatDate(testimonial.created_at) }}</td>
                <td class="text-center">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-light border" type="button" @click.stop="toggleMenu(testimonial.id)">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu shadow-sm" :class="{ 'show': activeMenuId === testimonial.id }" 
                        style="right: 0; left: auto; top: 100%; z-index: 1060;">
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="editTestimonial(testimonial)">
                          <i class="bi bi-pencil me-2 text-primary"></i> Edit
                        </a>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDelete(testimonial)">
                          <i class="bi bi-trash me-2"></i> Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr v-if="!loading && testimonials.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">No testimonials found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="pagination.total > pagination.per_page" class="d-flex justify-content-between align-items-center mt-4 px-2">
      <div class="text-muted small">
        Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} testimonials
      </div>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
            <button class="page-link" @click="changePage(pagination.current_page - 1)">Previous</button>
          </li>
          <li v-for="page in pagination.last_page" :key="page" class="page-item" :class="{ active: page === pagination.current_page }">
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
            <button class="page-link" @click="changePage(pagination.current_page + 1)">Next</button>
          </li>
        </ul>
      </nav>
    </div>

    <div v-if="showCreateModal" class="modal-backdrop fade show"></div>
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom" :class="editingTestimonial ? 'bg-primary text-white' : 'bg-success text-white'">
            <h5 class="modal-title">{{ editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveTestimonial">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Pilot Name</label>
                  <input v-model="form.name" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Rating</label>
                  <select v-model="form.rating" class="form-select">
                    <option v-for="n in 5" :key="n" :value="n">{{ n }} Stars</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label fw-bold">Pilot Photo</label>
                  <div v-if="imagePreview || (editingTestimonial && editingTestimonial.image && !form.remove_image)" class="mb-2 d-flex align-items-center">
                     <img :src="imagePreview || editingTestimonial.image" class="rounded-circle border" style="width: 60px; height: 60px; object-fit: cover;">
                     <button type="button" class="btn btn-sm btn-link text-danger ms-2" @click="removeImage">Remove</button>
                  </div>
                  <input type="file" @change="handleImageUpload" class="form-control" accept="image/*">
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold">Feedback Description</label>
                  <textarea v-model="form.description" class="form-control" rows="4" required></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                Save Testimonial
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
            <p>Are you sure you want to delete testimonial from <strong>{{ testimonialToDelete?.name }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteTestimonial" :disabled="deleting">Delete</button>
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

// DATA
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref(null)
const testimonials = ref([])
const activeMenuId = ref(null)

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingTestimonial = ref(null)
const testimonialToDelete = ref(null)
const imagePreview = ref(null)
const imageFile = ref(null)

const form = reactive({
  name: '',
  description: '',
  rating: 5,
  remove_image: false
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0,
  prev_page_url: null,
  next_page_url: null
})

// HELPERS
const toggleMenu = (id) => { activeMenuId.value = activeMenuId.value === id ? null : id }
const closeMenus = () => { activeMenuId.value = null }
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'P'
const truncateText = (text, length) => text && text.length > length ? text.substring(0, length) + '...' : text
const formatDate = (date) => date ? new Date(date).toLocaleDateString() : ''

// API
const fetchTestimonials = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({ page: pagination.current_page, per_page: pagination.per_page })
    const data = await $fetch(`${config.public.apiBase}/admin/testimonials?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    testimonials.value = data.data || data
    if (data.total) Object.assign(pagination, data)
  } catch (err) {
    error.value = 'Failed to load.'
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
  imagePreview.value = null
  imageFile.value = null
  form.remove_image = true
}

const saveTestimonial = async () => {
  try {
    saving.value = true
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('rating', form.rating)
    if (imageFile.value) formData.append('image', imageFile.value)
    if (editingTestimonial.value) formData.append('_method', 'PUT')

    const url = editingTestimonial.value 
      ? `${config.public.apiBase}/admin/testimonials/${editingTestimonial.value.id}`
      : `${config.public.apiBase}/admin/testimonials`

    await $fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData
    })
    closeModal()
    fetchTestimonials()
  } catch (err) {
    alert('Error saving')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (t) => {
  testimonialToDelete.value = t
  showDeleteModal.value = true
}

const deleteTestimonial = async () => {
  try {
    deleting.value = true
    await $fetch(`${config.public.apiBase}/admin/testimonials/${testimonialToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    closeDeleteModal()
    fetchTestimonials()
  } catch (err) {
    alert('Delete failed')
  } finally {
    deleting.value = false
  }
}

const editTestimonial = (t) => {
  editingTestimonial.value = t
  form.name = t.name
  form.description = t.description
  form.rating = t.rating
  showCreateModal.value = true
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
  Object.assign(form, { name: '', description: '', rating: 5, remove_image: false })
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

onMounted(() => {
  fetchTestimonials()
  window.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  window.removeEventListener('click', closeMenus)
})
</script>

<style scoped>
.avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.dropdown-menu { display: none; position: absolute; min-width: 140px; }
.dropdown-menu.show { display: block; }
.table-responsive { overflow: visible !important; }
</style>