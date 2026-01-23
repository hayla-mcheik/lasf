<template>
  <div class="events-create-admin">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-calendar-event me-3 text-primary"></i>
            {{ eventId ? 'Edit Event' : 'Create Event' }}
          </h1>
          <div class="d-flex align-items-center gap-3">
            <p class="text-muted mb-0">
              <i class="bi bi-calendar-plus me-1"></i>
              {{ eventId ? 'Edit existing event' : 'Create a new event or competition' }}
            </p>
          </div>
        </div>
        <div>
          <NuxtLink to="/admin/events" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-2"></i>
            Back to Events
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main Form -->
    <div class="row">
      <div class="col-lg-8">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <form @submit.prevent="saveEvent">
              <!-- Title -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Event Title <span class="text-danger">*</span></label>
                <input v-model="form.title" type="text" class="form-control form-control-lg" required
                       placeholder="Enter event title...">
                <div v-if="errors.title" class="text-danger small mt-1">{{ errors.title[0] }}</div>
              </div>

              <!-- Description -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Description <span class="text-danger">*</span></label>
                <textarea v-model="form.description" class="form-control" rows="6" required
                          placeholder="Enter event description..."></textarea>
                <div v-if="errors.description" class="text-danger small mt-1">{{ errors.description[0] }}</div>
              </div>

              <!-- Details -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Event Details</label>
                <textarea v-model="form.details" class="form-control" rows="8"
                          placeholder="Enter detailed information about the event..."></textarea>
                <div v-if="errors.details" class="text-danger small mt-1">{{ errors.details[0] }}</div>
              </div>

              <!-- Date & Time -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Start Date & Time <span class="text-danger">*</span></label>
                  <input v-model="form.start_date" type="datetime-local" class="form-control" required>
                  <div v-if="errors.start_date" class="text-danger small mt-1">{{ errors.start_date[0] }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">End Date & Time <span class="text-danger">*</span></label>
                  <input v-model="form.end_date" type="datetime-local" class="form-control" required>
                  <div v-if="errors.end_date" class="text-danger small mt-1">{{ errors.end_date[0] }}</div>
                </div>
              </div>

              <!-- Location -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Location</label>
                <input v-model="form.location" type="text" class="form-control"
                       placeholder="Enter event location...">
                <div v-if="errors.location" class="text-danger small mt-1">{{ errors.location[0] }}</div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <!-- Event Settings -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">
              <i class="bi bi-gear me-2"></i>
              Event Settings
            </h5>
          </div>
          <div class="card-body">
            <!-- Event Type -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Event Type</label>
              <select v-model="form.type" class="form-select">
                <option value="competition">Competition</option>
                <option value="training">Training</option>
                <option value="workshop">Workshop</option>
                <option value="meeting">Meeting</option>
                <option value="social">Social Event</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Status -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Status</label>
              <select v-model="form.status" class="form-select">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <!-- Registration -->
            <div class="mb-4">
              <div class="form-check mb-2">
                <input v-model="form.registration_required" class="form-check-input" type="checkbox" 
                       id="registration-required" :true-value="true" :false-value="false">
                <label class="form-check-label" for="registration-required">
                  Registration Required
                </label>
              </div>
              <div class="form-check">
                <input v-model="form.is_featured" class="form-check-input" type="checkbox" 
                       id="is-featured" :true-value="true" :false-value="false">
                <label class="form-check-label" for="is-featured">
                  Featured Event
                </label>
              </div>
            </div>

            <!-- Max Participants -->
            <div class="mb-4" v-if="form.registration_required">
              <label class="form-label fw-semibold">Max Participants</label>
              <input v-model="form.max_participants" type="number" class="form-control" min="1">
            </div>

            <!-- Registration Link -->
            <div class="mb-4" v-if="form.registration_required">
              <label class="form-label fw-semibold">Registration Link</label>
              <input v-model="form.registration_link" type="url" class="form-control"
                     placeholder="https://example.com/register">
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body">
            <div class="d-grid gap-2">
              <button type="button" class="btn btn-primary" @click="saveEvent" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-lg me-2"></i>
                {{ eventId ? 'Update Event' : 'Create Event' }}
              </button>
              <button v-if="eventId" type="button" class="btn btn-outline-danger" @click="deleteEvent" :disabled="saving">
                <i class="bi bi-trash me-2"></i>
                Delete Event
              </button>
            </div>
          </div>
        </div>

        <!-- Event Info -->
        <div class="card shadow-sm border-0" v-if="eventId">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">
              <i class="bi bi-info-circle me-2"></i>
              Event Info
            </h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Created Date</label>
              <p class="mb-0" v-if="event.created_at">
                {{ formatDate(event.created_at) }}
              </p>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Last Updated</label>
              <p class="mb-0" v-if="event.updated_at">
                {{ formatDate(event.updated_at) }}
              </p>
            </div>
            <div class="mb-3" v-if="event.registered_participants">
              <label class="form-label fw-semibold">Participants</label>
              <p class="mb-0">
                {{ event.registered_participants }} registered
                <span v-if="event.max_participants">
                  / {{ event.max_participants }} max
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id
const loading = ref(true)
const saving = ref(false)
const errors = ref({})

// Form data
const form = reactive({
  title: '',
  description: '',
  details: '',
  start_date: null,
  end_date: null,
  location: '',
  type: 'competition',
  status: 'upcoming',
  registration_required: false,
  is_featured: false,
  max_participants: null,
  registration_link: ''
})

// Event data
const event = ref({})

// Load event if editing
const loadEvent = async () => {
  if (!eventId) {
    loading.value = false
    return
  }
  
  try {
    const response = await $fetch(`/api/admin/events/${eventId}`)
    if (response.success) {
      event.value = response.data
      
      // Populate form
      form.title = event.value.title
      form.description = event.value.description
      form.details = event.value.details || ''
      form.start_date = formatDateTimeLocal(event.value.start_date)
      form.end_date = formatDateTimeLocal(event.value.end_date)
      form.location = event.value.location || ''
      form.type = event.value.type || 'competition'
      form.status = event.value.status || 'upcoming'
      form.registration_required = event.value.registration_required || false
      form.is_featured = event.value.is_featured || false
      form.max_participants = event.value.max_participants
      form.registration_link = event.value.registration_link || ''
    }
  } catch (error) {
    console.error('Error loading event:', error)
  } finally {
    loading.value = false
  }
}

// Format date for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

// Format date for datetime-local input
const formatDateTimeLocal = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

// Save event
const saveEvent = async () => {
  saving.value = true
  errors.value = {}
  
  try {
    const data = { ...form }
    
    if (eventId) {
      // Update existing event
      const response = await $fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        body: data
      })
      
      if (response.success) {
        showSuccess('Event updated successfully!')
        router.push('/admin/events')
      }
    } else {
      // Create new event
      const response = await $fetch('/api/admin/events', {
        method: 'POST',
        body: data
      })
      
      if (response.success) {
        showSuccess('Event created successfully!')
        router.push('/admin/events')
      }
    }
  } catch (error) {
    if (error.data?.errors) {
      errors.value = error.data.errors
    } else {
      showError('Failed to save event. Please try again.')
    }
  } finally {
    saving.value = false
  }
}

// Delete event
const deleteEvent = async () => {
  if (!confirm('Are you sure you want to delete this event?')) return
  
  saving.value = true
  try {
    const response = await $fetch(`/api/admin/events/${eventId}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      showSuccess('Event deleted successfully!')
      router.push('/admin/events')
    }
  } catch (error) {
    showError('Failed to delete event. Please try again.')
  } finally {
    saving.value = false
  }
}

// Show success message
const showSuccess = (message) => {
  alert(message)
}

// Show error message
const showError = (message) => {
  alert(message)
}

onMounted(async () => {
  await loadEvent()
})
</script>

<style scoped>
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 1rem;
  color: white;
}

.dashboard-header h1 {
  color: white;
}

.dashboard-header .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

.card {
  border-radius: 1rem;
  overflow: hidden;
}

.card-header {
  background: white;
  border-bottom: 2px solid #f0f0f0;
  padding: 1rem 1.5rem;
}

.form-control-lg {
  border-radius: 0.75rem;
  border: 2px solid #e9ecef;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
}

.form-control-lg:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
}

textarea.form-control {
  border-radius: 0.75rem;
  border: 2px solid #e9ecef;
  padding: 1rem;
}

textarea.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
}

.form-select {
  border-radius: 0.75rem;
  border: 2px solid #e9ecef;
  padding: 0.75rem 1rem;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
}

.btn {
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
</style>