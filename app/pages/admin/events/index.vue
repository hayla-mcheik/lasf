<template>
  <div class="events-admin">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-calendar-event me-3 text-primary"></i>
            Events & Competitions
          </h1>
          <div class="d-flex align-items-center gap-3">
            <p class="text-muted mb-0">
              <i class="bi bi-calendar-check me-1"></i>
              Manage upcoming events, competitions, and schedules
            </p>
            <span class="badge bg-primary-subtle text-primary">
              {{ pagination.total }} events
            </span>
          </div>
        </div>
        <div>
          <button class="btn btn-primary d-flex align-items-center" @click="showCreateModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            Create Event
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
        <p class="mt-3 text-muted">Loading events...</p>
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
              <div class="row g-3">
                <!-- Search -->
                <div class="col-md-6">
                  <div class="input-group">
                    <span class="input-group-text bg-white border-end-0">
                      <i class="bi bi-search text-muted"></i>
                    </span>
                    <input 
                      v-model="filters.search" 
                      type="text" 
                      class="form-control border-start-0" 
                      placeholder="Search events..."
                      @input="handleSearch"
                    >
                  </div>
                </div>
                
                <!-- Status Filter -->
                <div class="col-md-3">
                  <select v-model="filters.status" class="form-select" @change="fetchEvents">
                    <option value="">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <!-- Type Filter -->
                <div class="col-md-3">
                  <select v-model="filters.type" class="form-select" @change="fetchEvents">
                    <option value="">All Types</option>
                    <option value="competition">Competition</option>
                    <option value="training">Training</option>
                    <option value="workshop">Workshop</option>
                    <option value="meeting">Meeting</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
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
              <div class="card border-0 bg-info-subtle">
                <div class="card-body text-center p-3">
                  <div class="text-info mb-1">
                    <i class="bi bi-calendar-plus fs-4"></i>
                  </div>
                  <div class="fw-bold fs-5">{{ stats.upcoming || 0 }}</div>
                  <small class="text-muted">Upcoming</small>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="card border-0 bg-success-subtle">
                <div class="card-body text-center p-3">
                  <div class="text-success mb-1">
                    <i class="bi bi-calendar-event fs-4"></i>
                  </div>
                  <div class="fw-bold fs-5">{{ stats.ongoing || 0 }}</div>
                  <small class="text-muted">Ongoing</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Events Grid -->
      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="event in events" :key="event.id">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-img-top position-relative" style="height: 200px; overflow: hidden;">
              <div v-if="event.image" class="h-100 bg-cover" 
                   :style="{ backgroundImage: `url(${event.image})` }"></div>
              <div v-else class="h-100 bg-primary-subtle d-flex align-items-center justify-content-center">
                <i class="bi bi-calendar-event display-4 text-primary"></i>
              </div>
              <div class="position-absolute top-0 end-0 m-2">
                <span :class="`badge bg-${getStatusBadge(event)}`">
                  {{ getStatusLabel(event) }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 class="card-title fw-semibold mb-1">{{ event.title }}</h5>
                  <div class="text-muted small">
                    <i class="bi bi-calendar me-1"></i>
                    {{ formatEventDate(event) }}
                  </div>
                  <div v-if="event.location" class="text-muted small">
                    <i class="bi bi-geo-alt me-1"></i>
                    {{ event.location }}
                  </div>
                </div>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" 
                          data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="editEvent(event)">
                        <i class="bi bi-pencil me-2"></i> Edit
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="confirmDelete(event)">
                        <i class="bi bi-trash me-2 text-danger"></i> Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              
              <p class="card-text text-muted small mb-3" v-if="event.description">
                {{ truncateText(event.description, 100) }}
              </p>
              
              <div class="d-flex justify-content-between align-items-center mt-4">
                <div>
                  <span class="badge bg-light text-dark">
                    <i class="bi bi-tag me-1"></i>
                    {{ event.type || 'Event' }}
                  </span>
                </div>
                <small class="text-muted">
                  {{ formatTimeAgo(event.created_at) }}
                </small>
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
                <h5 class="text-muted">Create New Event</h5>
                <p class="text-muted small mb-0">Add a new event or competition</p>
              </div>
            </div>
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
          <div class="modal-header border-bottom" :class="editingEvent ? 'bg-primary text-white' : 'bg-success text-white'">
            <h5 class="modal-title">
              <i class="bi me-2" :class="editingEvent ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
              {{ editingEvent ? 'Edit Event' : 'Create New Event' }}
            </h5>
            <button type="button" class="btn-close" :class="editingEvent ? 'btn-close-white' : ''" 
                    @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveEvent" enctype="multipart/form-data">
            <div class="modal-body">
              <div v-if="formErrors.length" class="alert alert-danger">
                <ul class="mb-0">
                  <li v-for="(error, index) in formErrors" :key="index">{{ error }}</li>
                </ul>
              </div>
              
              <div class="row g-4">
                <!-- Event Title -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Event Title <span class="text-danger">*</span></label>
                  <input v-model="form.title" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.title }" required
                         placeholder="e.g., National Paragliding Championship 2024">
                  <div v-if="fieldErrors.title" class="invalid-feedback">
                    {{ fieldErrors.title[0] }}
                  </div>
                </div>
                
                <!-- Event Type -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Event Type <span class="text-danger">*</span></label>
                  <select v-model="form.type" class="form-select" :class="{ 'is-invalid': fieldErrors.type }" required>
                    <option value="">Select Type</option>
                    <option value="competition">Competition</option>
                    <option value="training">Training</option>
                    <option value="workshop">Workshop</option>
                    <option value="meeting">Meeting</option>
                    <option value="social">Social Event</option>
                    <option value="other">Other</option>
                  </select>
                  <div v-if="fieldErrors.type" class="invalid-feedback">
                    {{ fieldErrors.type[0] }}
                  </div>
                </div>
                
                <!-- Event Status -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Status</label>
                  <select v-model="form.status" class="form-select" :class="{ 'is-invalid': fieldErrors.status }">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div v-if="fieldErrors.status" class="invalid-feedback">
                    {{ fieldErrors.status[0] }}
                  </div>
                </div>
                
                <!-- Date & Time -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Start Date & Time <span class="text-danger">*</span></label>
                  <input v-model="form.start_date" type="datetime-local" class="form-control" 
                         :class="{ 'is-invalid': fieldErrors.start_date }" required>
                  <div v-if="fieldErrors.start_date" class="invalid-feedback">
                    {{ fieldErrors.start_date[0] }}
                  </div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-semibold">End Date & Time</label>
                  <input v-model="form.end_date" type="datetime-local" class="form-control" 
                         :class="{ 'is-invalid': fieldErrors.end_date }">
                  <div v-if="fieldErrors.end_date" class="invalid-feedback">
                    {{ fieldErrors.end_date[0] }}
                  </div>
                </div>
                
                <!-- Location -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Location</label>
                  <input v-model="form.location" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.location }"
                         placeholder="e.g., Mount Eagle, Jounieh">
                  <div v-if="fieldErrors.location" class="invalid-feedback">
                    {{ fieldErrors.location[0] }}
                  </div>
                </div>
                
                <!-- Organizer -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Organizer</label>
                  <input v-model="form.organizer" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.organizer }"
                         placeholder="e.g., LASF, Sky Flyers Club">
                  <div v-if="fieldErrors.organizer" class="invalid-feedback">
                    {{ fieldErrors.organizer[0] }}
                  </div>
                </div>
                
                <!-- Image Upload -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Event Image</label>
                  <div class="image-upload-container">
                    <div v-if="imagePreview" class="image-preview mb-3">
                      <img :src="imagePreview" alt="Preview" class="img-fluid rounded" style="max-height: 200px;">
                      <button type="button" class="btn btn-sm btn-danger mt-2" @click="removeImage">
                        <i class="bi bi-trash"></i> Remove Image
                      </button>
                    </div>
                    <div v-else-if="editingEvent?.image" class="image-preview mb-3">
                      <img :src="editingEvent.image" alt="Current" class="img-fluid rounded" style="max-height: 200px;">
                      <button type="button" class="btn btn-sm btn-danger mt-2" @click="removeImage">
                        <i class="bi bi-trash"></i> Remove Image
                      </button>
                    </div>
                    <div v-else>
                      <input type="file" class="form-control" :class="{ 'is-invalid': fieldErrors.image }" 
                             accept="image/*" @change="handleImageUpload" ref="fileInput">
                      <div class="form-text">
                        Upload an event banner image (optional, max 5MB)
                      </div>
                      <div v-if="fieldErrors.image" class="invalid-feedback">
                        {{ fieldErrors.image[0] }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Description -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Description <span class="text-danger">*</span></label>
                  <textarea v-model="form.description" class="form-control" :class="{ 'is-invalid': fieldErrors.description }" 
                            rows="5" required
                            placeholder="Describe the event details, schedule, requirements, registration information..."></textarea>
                  <div v-if="fieldErrors.description" class="invalid-feedback">
                    {{ fieldErrors.description[0] }}
                  </div>
                </div>
                
                <!-- Registration Link -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Registration Link</label>
                  <input v-model="form.registration_link" type="url" class="form-control" 
                         :class="{ 'is-invalid': fieldErrors.registration_link }"
                         placeholder="https://forms.google.com/...">
                  <div v-if="fieldErrors.registration_link" class="invalid-feedback">
                    {{ fieldErrors.registration_link[0] }}
                  </div>
                </div>
                
                <!-- Sports -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Related Sports</label>
                  <div class="d-flex flex-wrap gap-2">
                    <div v-for="sport in sports" :key="sport.id" class="form-check">
                      <input class="form-check-input" type="checkbox" :value="sport.id" 
                             :id="`sport-${sport.id}`" v-model="form.sports">
                      <label class="form-check-label" :for="`sport-${sport.id}`">
                        {{ sport.name }}
                      </label>
                    </div>
                  </div>
                  <div v-if="fieldErrors.sports" class="invalid-feedback d-block">
                    {{ fieldErrors.sports[0] }}
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-top">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="btn" :class="editingEvent ? 'btn-primary' : 'btn-success'" 
                      :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi" :class="editingEvent ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                {{ editingEvent ? 'Update Event' : 'Create Event' }}
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
              Delete Event
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="warning-icon mb-4">
              <i class="bi bi-calendar-x fs-1 text-danger"></i>
            </div>
            <h5 class="fw-bold">Delete Event</h5>
            <p class="text-muted">Are you sure you want to delete <strong class="text-danger">{{ eventToDelete?.title }}</strong>?</p>
            <div class="alert alert-warning small">
              <i class="bi bi-info-circle me-2"></i>
              This action cannot be undone. All event details will be permanently removed.
            </div>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="deleteEvent" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Event
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
import { useDebounceFn } from '@vueuse/core'

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

const events = ref([])
const sports = ref([])
const stats = reactive({
  upcoming: 0,
  ongoing: 0,
  past: 0,
  cancelled: 0
})

// Filters
const filters = reactive({
  search: '',
  status: '',
  type: ''
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

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)

// Forms
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
  sports: [],
  image: null,
  remove_image: false
})

// Methods
const fetchEvents = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = new URLSearchParams({
      page: pagination.current_page,
      per_page: pagination.per_page,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type })
    })
    
    // Using $fetch like news categories
    const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/events?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data && data.data) {
      events.value = data.data
    } else {
      events.value = data || []
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
    console.error('Failed to fetch events:', err)
    error.value = err.message || 'Failed to load events.'
    
    // Fallback to mock data for development
    if (config.public.devMode) {
      console.log('Using mock data for development')
      events.value = [
        {
          id: 1,
          title: 'National Paragliding Championship',
          description: 'Annual national championship for paragliding pilots',
          type: 'competition',
          status: 'upcoming',
          start_date: '2024-03-15T09:00:00Z',
          end_date: '2024-03-17T18:00:00Z',
          location: 'Mount Eagle, Northern Region',
          organizer: 'LASF',
          image: null,
          registration_link: 'https://forms.google.com/...',
          sports: [{ id: 1, name: 'Paragliding' }],
          created_at: '2024-01-10T10:30:00Z'
        },
        {
          id: 2,
          title: 'Safety Workshop',
          description: 'Workshop on safety procedures and emergency protocols',
          type: 'workshop',
          status: 'upcoming',
          start_date: '2024-02-10T14:00:00Z',
          end_date: '2024-02-10T17:00:00Z',
          location: 'Federation HQ',
          organizer: 'LASF Safety Committee',
          image: null,
          registration_link: '',
          sports: [{ id: 1, name: 'Paragliding' }, { id: 2, name: 'Paramotor' }],
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

const fetchSports = async () => {
  try {
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
    // Fallback to mock data
    if (config.public.devMode) {
      sports.value = [
        { id: 1, name: 'Paragliding' },
        { id: 2, name: 'Paramotor' },
        { id: 3, name: 'Hang Gliding' },
        { id: 4, name: 'Skydiving' }
      ]
    }
  }
}

const updateStats = () => {
  const now = new Date()
  stats.upcoming = events.value.filter(e => {
    const start = new Date(e.start_date)
    return start > now
  }).length
  
  stats.ongoing = events.value.filter(e => {
    const start = new Date(e.start_date)
    const end = e.end_date ? new Date(e.end_date) : start
    return start <= now && end >= now
  }).length
  
  stats.past = events.value.filter(e => {
    const end = e.end_date ? new Date(e.end_date) : new Date(e.start_date)
    return end < now
  }).length
  
  stats.cancelled = events.value.filter(e => e.status === 'cancelled').length
}

const getStatusBadge = (event) => {
  const now = new Date()
  const start = new Date(event.start_date)
  const end = event.end_date ? new Date(event.end_date) : start
  
  if (event.status === 'cancelled') return 'danger'
  if (start > now) return 'info'
  if (start <= now && end >= now) return 'success'
  return 'secondary'
}

const getStatusLabel = (event) => {
  const now = new Date()
  const start = new Date(event.start_date)
  const end = event.end_date ? new Date(event.end_date) : start
  
  if (event.status === 'cancelled') return 'Cancelled'
  if (start > now) return 'Upcoming'
  if (start <= now && end >= now) return 'Ongoing'
  return 'Completed'
}

const formatEventDate = (event) => {
  const start = new Date(event.start_date)
  const end = event.end_date ? new Date(event.end_date) : null
  
  if (!end || start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
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
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
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
  if (editingEvent.value?.image) {
    form.remove_image = true
  }
}

const editEvent = (event) => {
  editingEvent.value = event
  form.title = event.title
  form.type = event.type
  form.status = event.status || 'upcoming'
  form.start_date = event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : ''
  form.end_date = event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : ''
  form.location = event.location || ''
  form.organizer = event.organizer || ''
  form.description = event.description
  form.registration_link = event.registration_link || ''
  form.sports = event.sports?.map(s => s.id) || []
  form.image = event.image
  form.remove_image = false
  formErrors.value = []
  fieldErrors.value = {}
  showCreateModal.value = true
}

const saveEvent = async () => {
  try {
    saving.value = true
    formErrors.value = []
    fieldErrors.value = {}
    
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('type', form.type)
    formData.append('status', form.status)
    formData.append('start_date', form.start_date)
    
    if (form.end_date) {
      formData.append('end_date', form.end_date)
    }
    
    if (form.location) {
      formData.append('location', form.location)
    }
    
    if (form.organizer) {
      formData.append('organizer', form.organizer)
    }
    
    formData.append('description', form.description)
    
    if (form.registration_link) {
      formData.append('registration_link', form.registration_link)
    }
    
    if (form.sports.length > 0) {
      form.sports.forEach(sportId => {
        formData.append('sports[]', sportId)
      })
    }
    
    // Handle image upload
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    } else if (form.remove_image) {
      formData.append('remove_image', 'true')
    }
    
    const baseUrl = config.public.apiBase || 'http://localhost:8000'
    let url
    let method
    
    if (editingEvent.value) {
      url = `${baseUrl}/admin/events/${editingEvent.value.id}`
      method = 'PUT'
    } else {
      url = `${baseUrl}/admin/events`
      method = 'POST'
    }
    
    const response = await $fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: formData,
    })
    
    if (response.success || response.data) {
      closeModal()
      await fetchEvents()
      
      if (editingEvent.value) {
        alert('Event updated successfully!')
      } else {
        alert('Event created successfully!')
      }
    } else {
      throw new Error(response.message || 'Operation failed')
    }
    
  } catch (err) {
    console.error('Failed to save event:', err)
    
    // Handle Laravel validation errors
    if (err.data && err.data.errors) {
      fieldErrors.value = err.data.errors
      if (err.data.message) {
        formErrors.value = [err.data.message]
      }
    } else if (err.message) {
      formErrors.value = [err.message]
    } else {
      formErrors.value = ['Failed to save event. Please try again.']
    }
  } finally {
    saving.value = false
  }
}

const handleSearch = useDebounceFn(() => {
  pagination.current_page = 1
  fetchEvents()
}, 500)

const confirmDelete = (event) => {
  eventToDelete.value = event
  showDeleteModal.value = true
}

const deleteEvent = async () => {
  try {
    deleting.value = true
    
    const baseUrl = config.public.apiBase || 'http://localhost:8000'
    const url = `${baseUrl}/admin/events/${eventToDelete.value.id}`
    
    const response = await $fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success || response.data) {
      closeDeleteModal()
      await fetchEvents()
      alert('Event deleted successfully!')
    } else {
      throw new Error(response.message || 'Failed to delete event')
    }
    
  } catch (err) {
    console.error('Failed to delete event:', err)
    
    // Show error message
    if (err.data && err.data.message) {
      alert(err.data.message)
    } else {
      alert(err.message || 'Failed to delete event. Please try again.')
    }
  } finally {
    deleting.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    pagination.current_page = page
    fetchEvents()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingEvent.value = null
  imagePreview.value = null
  imageFile.value = null
  formErrors.value = []
  fieldErrors.value = {}
  form.title = ''
  form.type = ''
  form.status = 'upcoming'
  form.start_date = ''
  form.end_date = ''
  form.location = ''
  form.organizer = ''
  form.description = ''
  form.registration_link = ''
  form.sports = []
  form.image = null
  form.remove_image = false
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  eventToDelete.value = null
}

onMounted(async () => {
  await Promise.all([
    fetchEvents(),
    fetchSports()
  ])
})
</script>

<style scoped>
.events-admin {
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
}

/* Badge Styles */
.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
}

/* Image Upload */
.image-preview img {
  max-width: 100%;
  height: auto;
  border: 2px solid #dee2e6;
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
.form-control.is-invalid, .form-select.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus, .form-select.is-invalid:focus {
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .image-preview img {
    max-height: 150px;
  }
}
</style>