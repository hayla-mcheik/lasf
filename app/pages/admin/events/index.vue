<template>
  <div class="events-admin container-fluid">
    <div class="dashboard-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-calendar-event me-3 text-primary"></i>
            Events & Competitions
          </h1>
          <p class="text-muted mb-0">Manage upcoming events, competitions, and federation schedules</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center" @click="showCreateModal = true">
          <i class="bi bi-plus-circle me-2"></i>
          Create Event
        </button>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-8">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body d-flex align-items-center">
            <div class="row g-3 w-100">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="bi bi-search text-muted"></i>
                  </span>
                  <input v-model="filters.search" type="text" class="form-control border-start-0" 
                         placeholder="Search events..." @input="handleSearch">
                </div>
              </div>
              <div class="col-md-3">
                <select v-model="filters.status" class="form-select" @change="fetchEvents">
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div class="col-md-3">
                <select v-model="filters.type" class="form-select" @change="fetchEvents">
                  <option value="">All Types</option>
                  <option value="competition">Competition</option>
                  <option value="training">Training</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="row g-2 h-100">
          <div class="col-6">
            <div class="card border-0 bg-info-subtle h-100">
              <div class="card-body text-center p-3">
                <div class="fw-bold fs-5 text-info">{{ stats.upcoming || 0 }}</div>
                <small class="text-muted">Upcoming</small>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="card border-0 bg-success-subtle h-100">
              <div class="card-body text-center p-3">
                <div class="fw-bold fs-5 text-success">{{ stats.ongoing || 0 }}</div>
                <small class="text-muted">Ongoing</small>
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
          <p class="mt-2 text-muted">Loading events...</p>
        </div>
        <div v-else class="table-responsive" style="overflow: visible !important;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Event Details</th>
                <th>Type</th>
                <th>Schedule</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events" :key="event.id">
                <td>
                  <div class="d-flex align-items-center">
                    <img v-if="event.image" :src="event.image" class="rounded me-3 border" 
                         style="width: 50px; height: 50px; object-fit: cover;">
                    <div v-else class="avatar-sm bg-primary-subtle text-primary me-3">
                      <i class="bi bi-calendar-event"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ event.title }}</div>
                      <small class="text-muted"><i class="bi bi-geo-alt me-1"></i>{{ event.location || 'N/A' }}</small>
                    </div>
                  </div>
                </td>
                <td><span class="badge bg-light text-dark border">{{ event.type }}</span></td>
                <td>
                  <div class="small fw-semibold text-primary">{{ formatEventDate(event) }}</div>
                  <small class="text-muted">{{ event.organizer || 'LASF' }}</small>
                </td>
                <td>
                  <span :class="`badge bg-${getStatusBadge(event)} shadow-none`">
                    {{ getStatusLabel(event) }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-light border" type="button" @click.stop="toggleMenu(event.id)">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu shadow-sm" :class="{ 'show': activeMenuId === event.id }" 
                        style="right: 0; left: auto; top: 100%; z-index: 1060;">
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="editEvent(event)">
                          <i class="bi bi-pencil me-2 text-primary"></i> Edit
                        </a>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDelete(event)">
                          <i class="bi bi-trash me-2"></i> Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr v-if="events.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">No events found matching your criteria.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="pagination.total > pagination.per_page" class="d-flex justify-content-between align-items-center mt-4 px-2">
      <div class="text-muted small">
        Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} events
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

    <div v-if="showCreateModal" class="modal-backdrop fade show"></div>
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom text-white" :class="editingEvent ? 'bg-primary' : 'bg-success'">
            <h5 class="modal-title">
              <i class="bi me-2" :class="editingEvent ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
              {{ editingEvent ? 'Edit Event' : 'Create New Event' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveEvent" enctype="multipart/form-data">
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Event Title <span class="text-danger">*</span></label>
                  <input v-model="form.title" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Type</label>
                  <select v-model="form.type" class="form-select" required>
                    <option value="competition">Competition</option>
                    <option value="training">Training</option>
                    <option value="workshop">Workshop</option>
                    <option value="meeting">Meeting</option>
                    <option value="social">Social Event</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Status</label>
                  <select v-model="form.status" class="form-select">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Start Date & Time</label>
                  <input v-model="form.start_date" type="datetime-local" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">End Date & Time</label>
                  <input v-model="form.end_date" type="datetime-local" class="form-control">
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold">Description</label>
                  <textarea v-model="form.description" class="form-control" rows="4" required></textarea>
                </div>
                <div class="col-12">
                   <label class="form-label fw-bold">Event Banner</label>
                   <div v-if="imagePreview || (editingEvent && editingEvent.image && !form.remove_image)" class="mb-2">
                     <img :src="imagePreview || editingEvent.image" class="rounded border" style="max-height: 120px;">
                     <button type="button" class="btn btn-sm btn-link text-danger" @click="removeImage">Remove Photo</button>
                  </div>
                  <input type="file" @change="handleImageUpload" class="form-control" accept="image/*" ref="fileInput">
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                Save Event
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
            <i class="bi bi-calendar-x display-4 text-danger mb-3"></i>
            <p>Delete event <strong>{{ eventToDelete?.title }}</strong>? This cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteEvent" :disabled="deleting">Delete</button>
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
const saving = ref(false)
const deleting = ref(false)
const error = ref(null)
const events = ref([])
const sports = ref([])
const activeMenuId = ref(null)

const filters = reactive({ search: '', status: '', type: '' })
const stats = reactive({ upcoming: 0, ongoing: 0 })
const pagination = reactive({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 })

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingEvent = ref(null)
const eventToDelete = ref(null)
const imagePreview = ref(null)
const imageFile = ref(null)
const fileInput = ref(null)

const form = reactive({
  title: '', type: '', status: 'upcoming', start_date: '', end_date: '',
  location: '', organizer: '', description: '', registration_link: '',
  sports: [], remove_image: false
})

// UI Helpers
const toggleMenu = (id) => { activeMenuId.value = activeMenuId.value === id ? null : id }
const closeMenus = () => { activeMenuId.value = null }
const getStatusBadge = (e) => {
  if (e.status === 'cancelled') return 'danger'
  const now = new Date(); const start = new Date(e.start_date); const end = e.end_date ? new Date(e.end_date) : start
  if (start > now) return 'info'; if (start <= now && end >= now) return 'success'; return 'secondary'
}
const getStatusLabel = (e) => {
  if (e.status === 'cancelled') return 'Cancelled'
  const now = new Date(); const start = new Date(e.start_date); const end = e.end_date ? new Date(e.end_date) : start
  if (start > now) return 'Upcoming'; if (start <= now && end >= now) return 'Ongoing'; return 'Completed'
}
const formatEventDate = (e) => {
  if (!e.start_date) return 'N/A'
  return new Date(e.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Logic
const fetchEvents = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({ 
      page: pagination.current_page, search: filters.search, 
      status: filters.status, type: filters.type 
    })
    const data = await $fetch(`${config.public.apiBase}/admin/events?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    events.value = data.data || []
    if (data.total) Object.assign(pagination, data)
    stats.upcoming = events.value.filter(e => new Date(e.start_date) > new Date()).length
    stats.ongoing = events.value.filter(e => e.status === 'ongoing').length
  } catch (err) { error.value = "Failed to load events" } finally { loading.value = false }
}

const handleSearch = useDebounceFn(fetchEvents, 500)

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
  if (fileInput.value) fileInput.value.value = ''
}

const editEvent = (e) => {
  activeMenuId.value = null
  editingEvent.value = e
  Object.assign(form, e)
  form.start_date = e.start_date ? new Date(e.start_date).toISOString().slice(0, 16) : ''
  form.end_date = e.end_date ? new Date(e.end_date).toISOString().slice(0, 16) : ''
  showCreateModal.value = true
}

const saveEvent = async () => {
  saving.value = true
  const formData = new FormData()
  Object.keys(form).forEach(key => {
    if (key === 'sports') {
      form.sports.forEach(id => formData.append('sports[]', id))
    } else {
      formData.append(key, form[key])
    }
  })
  if (imageFile.value) formData.append('image', imageFile.value)
  if (editingEvent.value) formData.append('_method', 'PUT')

  try {
    const url = editingEvent.value ? `${config.public.apiBase}/admin/events/${editingEvent.value.id}` : `${config.public.apiBase}/admin/events`
    await $fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${authStore.token}` }, body: formData })
    closeModal(); fetchEvents()
  } catch (err) { alert('Save failed') } finally { saving.value = false }
}

const deleteEvent = async () => {
  deleting.value = true
  try {
    await $fetch(`${config.public.apiBase}/admin/events/${eventToDelete.value.id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    closeDeleteModal(); fetchEvents()
  } finally { deleting.value = false }
}

const confirmDelete = (e) => { eventToDelete.value = e; showDeleteModal.value = true; activeMenuId.value = null }
const closeModal = () => { showCreateModal.value = false; editingEvent.value = null; imagePreview.value = null; }
const closeDeleteModal = () => { showDeleteModal.value = false }
const changePage = (p) => { pagination.current_page = p; fetchEvents() }

onMounted(() => { fetchEvents(); window.addEventListener('click', closeMenus) })
onUnmounted(() => window.removeEventListener('click', closeMenus))
</script>

<style scoped>
.avatar-sm { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.dropdown-menu { display: none; position: absolute; min-width: 140px; }
.dropdown-menu.show { display: block; }
.table-responsive { overflow: visible !important; }
</style>