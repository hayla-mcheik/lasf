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

    <!-- Search and Filters -->
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
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="col-md-3">
                <select v-model="filters.type" class="form-select" @change="fetchEvents">
                  <option value="">All Types</option>
                  <option value="competition">Competition</option>
                  <option value="training">Training</option>
                  <option value="workshop">Workshop</option>
                  <option value="meeting">Meeting</option>
                  <option value="social">Social Event</option>
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

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Main Table -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Loading events...</p>
        </div>
        <div v-else class="table-responsive">
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
                    <div v-if="event.image" class="avatar me-3">
                      <img :src="event.image" class="rounded border" style="width: 50px; height: 50px; object-fit: cover;">
                    </div>
                    <div v-else class="avatar me-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center rounded" style="width: 50px; height: 50px;">
                      <i class="bi bi-calendar-event"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ event.title }}</div>
                      <small class="text-muted">
                        <i class="bi bi-geo-alt me-1"></i>{{ event.location || 'Location not set' }}
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ formatType(event.type) }}</span>
                </td>
                <td>
                  <div class="small fw-semibold text-primary">{{ formatEventDate(event) }}</div>
                  <small class="text-muted">{{ event.organizer || 'Organizer not set' }}</small>
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
              <tr v-if="events.length === 0 && !loading">
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="bi bi-calendar-x display-6 d-block mb-2"></i>
                  No events found matching your criteria.
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

    <!-- Create/Edit Modal -->
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
              <!-- Form Errors -->
              <div v-if="formErrors.length" class="alert alert-danger">
                <ul class="mb-0">
                  <li v-for="error in formErrors" :key="error">{{ error }}</li>
                </ul>
              </div>
              
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Event Title <span class="text-danger">*</span></label>
                  <input v-model="form.title" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.title }" required>
                  <div v-if="fieldErrors.title" class="invalid-feedback d-block">{{ fieldErrors.title[0] }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">Event Type <span class="text-danger">*</span></label>
                  <select v-model="form.type" class="form-select" :class="{ 'is-invalid': fieldErrors.type }" required>
                    <option value="">Select Type</option>
                    <option value="competition">Competition</option>
                    <option value="training">Training</option>
                    <option value="workshop">Workshop</option>
                    <option value="meeting">Meeting</option>
                    <option value="social">Social Event</option>
                    <option value="seminar">Seminar</option>
                    <option value="exhibition">Exhibition</option>
                  </select>
                  <div v-if="fieldErrors.type" class="invalid-feedback d-block">{{ fieldErrors.type[0] }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">Event Status</label>
                  <select v-model="form.status" class="form-select" :class="{ 'is-invalid': fieldErrors.status }">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div v-if="fieldErrors.status" class="invalid-feedback d-block">{{ fieldErrors.status[0] }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">Start Date & Time <span class="text-danger">*</span></label>
                  <input v-model="form.start_date" type="datetime-local" class="form-control" :class="{ 'is-invalid': fieldErrors.start_date }" required>
                  <div v-if="fieldErrors.start_date" class="invalid-feedback d-block">{{ fieldErrors.start_date[0] }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">End Date & Time</label>
                  <input v-model="form.end_date" type="datetime-local" class="form-control" :class="{ 'is-invalid': fieldErrors.end_date }">
                  <div v-if="fieldErrors.end_date" class="invalid-feedback d-block">{{ fieldErrors.end_date[0] }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">Location</label>
                  <input v-model="form.location" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.location }" placeholder="e.g., Dubai, UAE">
                  <div v-if="fieldErrors.location" class="invalid-feedback d-block">{{ fieldErrors.location[0] }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-bold">Organizer</label>
                  <input v-model="form.organizer" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.organizer }" placeholder="e.g., LASF, Dubai Sports Council">
                  <div v-if="fieldErrors.organizer" class="invalid-feedback d-block">{{ fieldErrors.organizer[0] }}</div>
                </div>
                
                <div class="col-12">
                  <label class="form-label fw-bold">Registration Link</label>
                  <input v-model="form.registration_link" type="url" class="form-control" :class="{ 'is-invalid': fieldErrors.registration_link }" placeholder="https://example.com/register">
                  <div v-if="fieldErrors.registration_link" class="invalid-feedback d-block">{{ fieldErrors.registration_link[0] }}</div>
                </div>
                
                <div class="col-12">
                  <label class="form-label fw-bold">Description <span class="text-danger">*</span></label>
                  <textarea v-model="form.description" class="form-control" :class="{ 'is-invalid': fieldErrors.description }" rows="4" required></textarea>
                  <div v-if="fieldErrors.description" class="invalid-feedback d-block">{{ fieldErrors.description[0] }}</div>
                </div>
                
                <div class="col-12">
                  <label class="form-label fw-bold">Event Banner</label>
                  <div v-if="imagePreview || (editingEvent && editingEvent.image && !form.remove_image)" class="mb-3">
                    <img :src="imagePreview || editingEvent.image" class="rounded border mb-2" style="max-height: 200px; max-width: 100%;">
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeImage">
                      <i class="bi bi-trash me-1"></i> Remove Photo
                    </button>
                  </div>
                  <input type="file" @change="handleImageUpload" class="form-control" :class="{ 'is-invalid': fieldErrors.image }" accept="image/*" ref="fileInput">
                  <div v-if="fieldErrors.image" class="invalid-feedback d-block">{{ fieldErrors.image[0] }}</div>
                  <small class="text-muted">Recommended size: 1200x600px, max 2MB</small>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingEvent ? 'Update' : 'Create' }} Event
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
            <i class="bi bi-calendar-x display-4 text-danger mb-3"></i>
            <p class="lead">Delete event <strong>{{ eventToDelete?.title }}</strong>?</p>
            <p class="text-muted">This action cannot be undone. All associated data will be permanently removed.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteEvent" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Event
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
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

const events = ref([])
const activeMenuId = ref(null)

const filters = reactive({ 
  search: '', 
  status: '', 
  type: '' 
})

const stats = reactive({ 
  upcoming: 0, 
  ongoing: 0,
  completed: 0,
  cancelled: 0
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

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingEvent = ref(null)
const eventToDelete = ref(null)
const imagePreview = ref(null)
const imageFile = ref(null)
const fileInput = ref(null)

const form = reactive({
  title: '', 
  type: '', 
  status: 'upcoming', 
  start_date: '', 
  end_date: '',
  location: '', 
  organizer: '', 
  description: '', 
  registration_link: '',
  remove_image: false
})

// Computed
const isEditing = computed(() => !!editingEvent.value)

// UI Helpers
const toggleMenu = (id) => { 
  activeMenuId.value = activeMenuId.value === id ? null : id 
}

const closeMenus = () => { 
  activeMenuId.value = null 
}

const getStatusBadge = (event) => {
  if (event.status === 'cancelled') return 'danger'
  
  const now = new Date()
  const start = new Date(event.start_date)
  const end = event.end_date ? new Date(event.end_date) : start
  
  if (start > now) return 'info'
  if (start <= now && end >= now) return 'success'
  return 'secondary'
}

const getStatusLabel = (event) => {
  if (event.status === 'cancelled') return 'Cancelled'
  
  const now = new Date()
  const start = new Date(event.start_date)
  const end = event.end_date ? new Date(event.end_date) : start
  
  if (start > now) return 'Upcoming'
  if (start <= now && end >= now) return 'Ongoing'
  return 'Completed'
}

const formatType = (type) => {
  const typeMap = {
    'competition': 'Competition',
    'training': 'Training',
    'workshop': 'Workshop',
    'meeting': 'Meeting',
    'social': 'Social Event',
    'seminar': 'Seminar',
    'exhibition': 'Exhibition'
  }
  return typeMap[type] || type || 'Other'
}

const formatEventDate = (event) => {
  if (!event.start_date) return 'N/A'
  
  const start = new Date(event.start_date)
  const end = event.end_date ? new Date(event.end_date) : null
  
  if (end && start.toDateString() !== end.toDateString()) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  
  return start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Logic
const fetchEvents = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params = new URLSearchParams({ 
      page: pagination.current_page, 
      per_page: pagination.per_page,
      search: filters.search, 
      status: filters.status, 
      type: filters.type 
    })
    
    const response = await $fetch(`${config.public.apiBase}/admin/events?${params}`, {
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      }
    })
    
    events.value = response.data || response
    
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
    const now = new Date()
    stats.upcoming = events.value.filter(e => {
      const start = new Date(e.start_date)
      return start > now && e.status !== 'cancelled'
    }).length
    
    stats.ongoing = events.value.filter(e => {
      const start = new Date(e.start_date)
      const end = e.end_date ? new Date(e.end_date) : start
      return start <= now && end >= now && e.status !== 'cancelled'
    }).length
    
    stats.completed = events.value.filter(e => {
      const end = e.end_date ? new Date(e.end_date) : new Date(e.start_date)
      return end < now && e.status !== 'cancelled'
    }).length
    
    stats.cancelled = events.value.filter(e => e.status === 'cancelled').length
    
  } catch (err) {
    console.error('Failed to fetch events:', err)
    error.value = err.data?.message || err.message || 'Failed to load events'
  } finally { 
    loading.value = false 
  }
}

const handleSearch = useDebounceFn(fetchEvents, 500)

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    // Validate file
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
    form.remove_image = false
  }
}

const removeImage = () => {
  imagePreview.value = null
  imageFile.value = null
  form.remove_image = true
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const editEvent = (event) => {
  activeMenuId.value = null
  editingEvent.value = event
  
  // Reset form
  Object.keys(form).forEach(key => {
    form[key] = event[key] || ''
  })
  
  // Format dates for datetime-local input
  if (event.start_date) {
    form.start_date = new Date(event.start_date).toISOString().slice(0, 16)
  }
  
  if (event.end_date) {
    form.end_date = new Date(event.end_date).toISOString().slice(0, 16)
  }
  
  // Reset image preview
  imagePreview.value = null
  imageFile.value = null
  form.remove_image = false
  
  // Reset errors
  formErrors.value = []
  fieldErrors.value = {}
  
  showCreateModal.value = true
}

const saveEvent = async () => {
  saving.value = true
  formErrors.value = []
  fieldErrors.value = {}
  
  try {
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
      ? `${config.public.apiBase}/admin/events/${editingEvent.value.id}`
      : `${config.public.apiBase}/admin/events`
    
    // Use POST with method spoofing for Laravel
    if (isEditing.value) {
      formData.append('_method', 'PUT')
    }
    
    const response = await $fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      },
      body: formData
    })
    
    if (response.success) {
      alert(isEditing.value ? 'Event updated successfully!' : 'Event created successfully!')
      closeModal()
      await fetchEvents()
    } else {
      throw new Error(response.message || 'Operation failed')
    }
    
  } catch (err) {
    console.error('Save event error:', err)
    
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

const deleteEvent = async () => {
  deleting.value = true
  
  try {
    const response = await $fetch(`${config.public.apiBase}/admin/events/${eventToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      }
    })
    
    if (response.success) {
      alert('Event deleted successfully!')
      closeDeleteModal()
      await fetchEvents()
    } else {
      throw new Error(response.message || 'Failed to delete event')
    }
    
  } catch (err) {
    console.error('Delete event error:', err)
    error.value = err.data?.message || err.message || 'Failed to delete event'
  } finally {
    deleting.value = false
  }
}

const confirmDelete = (event) => { 
  eventToDelete.value = event
  showDeleteModal.value = true
  activeMenuId.value = null 
}

const closeModal = () => { 
  showCreateModal.value = false
  editingEvent.value = null
  imagePreview.value = null
  imageFile.value = null
  
  // Reset form
  Object.keys(form).forEach(key => {
    if (key === 'status') {
      form[key] = 'upcoming'
    } else if (key === 'remove_image') {
      form[key] = false
    } else {
      form[key] = ''
    }
  })
  
  // Reset errors
  formErrors.value = []
  fieldErrors.value = {}
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const closeDeleteModal = () => { 
  showDeleteModal.value = false
  eventToDelete.value = null
}

const changePage = (page) => { 
  if (page >= 1 && page <= pagination.last_page) {
    pagination.current_page = page
    fetchEvents()
  }
}

// Event Listeners
onMounted(() => { 
  fetchEvents()
  window.addEventListener('click', closeMenus) 
})

onUnmounted(() => {
  window.removeEventListener('click', closeMenus)
  
  // Clean up image preview URLs
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
})
</script>

<style scoped>
.events-admin {
  padding: 1.5rem;
  background: #f8f9fa;
  min-height: calc(100vh - 56px);
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

.dropdown-menu {
  display: none;
  position: absolute;
  min-width: 140px;
  right: 0;
  left: auto;
  top: 100%;
  z-index: 1060;
}

.dropdown-menu.show {
  display: block;
}

.modal-backdrop {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .events-admin {
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
}
</style>