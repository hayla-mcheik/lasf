<template>
  <div class="flying-locations-admin">
    <div class="dashboard-header mb-6 shadow-sm p-4 bg-white">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-geo-alt me-3 text-primary"></i>
            Flying Locations Management
          </h1>
          <div class="d-flex align-items-center gap-3">
            <p class="text-muted mb-0">
              <i class="bi bi-info-circle me-1"></i>
              Manage technical coordinates (Kato/Nazim) and QR airspace reservation.
            </p>
            <span class="badge bg-primary-subtle text-primary">
              {{ pagination.total }} locations
            </span>
          </div>
        </div>
        <button class="btn btn-primary d-flex align-items-center shadow" @click="openCreateModal">
          <i class="bi bi-plus-circle me-2"></i> Add New Location
        </button>
      </div>
    </div>

    <div v-if="!loading" class="container-fluid px-4">
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
            <input v-model="searchQuery" type="text" class="form-control border-start-0" 
                   placeholder="Search by name, type, or coordinates..." @input="handleSearch">
          </div>
        </div>
      </div>
<div class="row mb-4">

    <!-- Calendar -->

    <div class="col-lg-7">

        <div class="card border-0 shadow-sm h-100">

            <div class="card-body">

     <PermissionCalendar
    :selectedDate="selectedDate"
    :locations="locations"
    @dateSelected="onDateSelected"
/>

            </div>

        </div>

    </div>

    <!-- Information -->

    <div class="col-lg-5">

        <div class="card border-0 shadow-sm h-100">

            <div class="card-body">

                <h5 class="fw-bold mb-4">

                    Selected Date

                </h5>

                <h3 class="text-primary">

                    {{ formattedSelectedDate }}

                </h3>

                <hr>

                <div class="row text-center mt-4">

                    <div class="col-4">

                        <div class="bg-success text-white rounded p-3">

                            <h3>{{ openCount }}</h3>

                            <small>Open</small>

                        </div>

                    </div>

                    <div class="col-4">

                        <div class="bg-warning rounded p-3">

                            <h3>{{ pendingCount }}</h3>

                            <small>Pending</small>

                        </div>

                    </div>

                    <div class="col-4">

                        <div class="bg-danger text-white rounded p-3">

                            <h3>{{ closedCount }}</h3>

                            <small>Closed</small>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>

</div>
<div class="card border-0 shadow-sm mb-4">

    <div class="card-header bg-white">

        <h4 class="mb-0">
            Daily Airspace Permissions
        </h4>

    </div>

    <div class="card-body">

        <div class="row">

            <div
                v-for="location in locations"
                :key="location.id"
                class="col-lg-6 mb-4"
            >

                <PermissionCard
                    :location="location"
                    @save="savePermission"
                />

            </div>

        </div>

    </div>

</div>
      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Location & Type</th>
                <th class="text-center">Takeoff (K/N)</th>
                <th class="text-center">Allowed Sports</th>
                <th class="text-center">Status</th>
                <th class="text-center">QR Code</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="location in locations" :key="location.id">
                <td class="ps-4">
                  <div class="fw-bold">{{ location.name }}</div>
                  <span class="badge bg-info-subtle text-info small">{{ location.type }}</span>
                </td>
                <td class="text-center small">
                  <div>K: {{ location.takeoff_kato }}</div>
                  <div class="text-muted">N: {{ location.takeoff_nazim }}</div>
                </td>
                <td class="text-center">
                  <div class="d-flex flex-wrap justify-content-center gap-1">
                    <span v-for="sport in location.sports" :key="sport.id" class="badge bg-secondary-subtle text-secondary border small">
                      {{ sport.name }}
                    </span>
                    <span v-if="!location.sports?.length" class="text-muted small italic">None</span>
                  </div>
                </td>
                <td class="text-center">
                  <span :class="`status-badge-modern ${getCurrentStatus(location).status}`">
                    <span class="pulse-dot"></span>
                    {{ getCurrentStatus(location).label }}
                  </span>
                </td>

                <td class="text-center">
                  <button v-if="location.qr_code" class="btn btn-sm btn-success shadow-sm" @click="showQRCode(location)">
                    <i class="bi bi-qr-code"></i> View QR
                  </button>
                  <button v-else 
                          class="btn btn-sm btn-outline-primary" 
                          @click="generateQRCode(location)"
                          :disabled="generatingId === location.id">
                    <span v-if="generatingId === location.id" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bi bi-plus-circle"></i> 
                    Generate QR
                  </button>
                </td>
                <td class="text-center">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-light border" @click="editLocation(location)"><i class="bi bi-pencil"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>


    <div v-if="showCreateModal" class="modal fade show d-block" @click.self="closeModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">{{ editingLocation ? 'Edit Location' : 'Create Location' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveLocation">
            <div class="modal-body custom-scrollbar" style="max-height: 70vh; overflow-y: auto;">
                  <div class="alert alert-info mb-3">

    <strong>
        Editing permission for:
    </strong>

    {{ form.permission_date }}

</div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Name</label>
                  <input v-model="form.name" type="text" :class="['form-control', {'is-invalid': validationErrors.name}]">
                  <div v-if="validationErrors.name" class="invalid-feedback">{{ validationErrors.name[0] }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Type</label>
                  <input v-model="form.type" type="text" :class="['form-control', {'is-invalid': validationErrors.type}]">
                  <div v-if="validationErrors.type" class="invalid-feedback">{{ validationErrors.type[0] }}</div>
                </div>
                
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Takeoff Kato *</label>
                  <input v-model="form.takeoff_kato" type="text" :class="['form-control', {'is-invalid': validationErrors.takeoff_kato}]">
                  <div v-if="validationErrors.takeoff_kato" class="invalid-feedback">{{ validationErrors.takeoff_kato[0] }}</div>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Takeoff Nazim *</label>
                  <input v-model="form.takeoff_nazim" type="text" :class="['form-control', {'is-invalid': validationErrors.takeoff_nazim}]">
                  <div v-if="validationErrors.takeoff_nazim" class="invalid-feedback">{{ validationErrors.takeoff_nazim[0] }}</div>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Landing Kato</label>
                  <input v-model="form.landing_kato" type="text" class="form-control">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Landing Nazim</label>
                  <input v-model="form.landing_nazim" type="text" class="form-control">
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-bold d-block">Allowed Sports</label>
                  <div class="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                    <div v-for="sport in availableSports" :key="sport.id" class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :id="'sport-' + sport.id"
                        :value="sport.id"
                        v-model="form.sports"
                      >
                      <label class="form-check-label" :for="'sport-' + sport.id">
                        {{ sport.name }}
                      </label>
                    </div>
                    <div v-if="availableSports.length === 0" class="text-muted small">Loading sports...</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold">Max Altitude</label>
                  <input v-model="form.max_altitude" type="text" class="form-control">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Status</label>
                  <select v-model="form.clearance_status" class="form-select">
          <option value="green">
    🟢 Green (Open)
</option>

<option value="yellow">
    🟡 Yellow (Pending)
</option>

<option value="red">
    🔴 Red (Closed)
</option>
                  </select>
                </div>
                <!-- Permission Date -->

<div class="col-md-6">

    <label class="form-label fw-bold">
        Permission Date
    </label>

<input
    type="date"
    class="form-control"
    :class="{
        'is-invalid': validationErrors.permission_date
    }"
    v-model="form.permission_date"
    required
>

<div
    v-if="validationErrors.permission_date"
    class="invalid-feedback"
>
    {{ validationErrors.permission_date[0] }}
</div>

</div>

<!-- Reason -->

<div class="col-12">

    <label class="form-label fw-bold">
        Reason
    </label>

    <textarea
        class="form-control"
        rows="3"
        v-model="form.reason"
        placeholder="Optional reason..."
    ></textarea>

</div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                Save Location
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showQRModal" class="modal fade show d-block" @click.self="closeQRModal">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-qr-code me-2"></i> QR Access</h5>
            <button type="button" class="btn-close" @click="closeQRModal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="p-3 bg-white border rounded">
              <canvas ref="qrCodeRef" class="img-fluid"></canvas>
              <h6 class="mt-3 fw-bold">{{ selectedLocation?.name }}</h6>
              <p class="text-muted small">Token: {{ selectedLocation?.qr_code?.token }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary w-100" @click="downloadQR">Download PNG</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal || showQRModal" class="modal-backdrop fade show" @click="closeModal"></div>
  </div>
</template>

<script setup>
import {
    ref,
    reactive,
    onMounted,
    nextTick,
    computed
} from 'vue'
import QRCode from 'qrcode'
import { useAuthStore } from '~/stores/auth'
import { useDebounceFn } from '@vueuse/core'
import PermissionCalendar from '~/components/admin/PermissionCalendar.vue'
import PermissionCard from '~/components/admin/PermissionCard.vue'
definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()
const config = useRuntimeConfig()
const nuxtApp = useNuxtApp()

// State
const locations = ref([])
const availableSports = ref([])
const validationErrors = ref({})
const loading = ref(false)
const saving = ref(false)
const showCreateModal = ref(false)
const showQRModal = ref(false)
const editingLocation = ref(null)
const selectedLocation = ref(null)
const qrCodeRef = ref(null)
const searchQuery = ref('')
const generatingId = ref(null)
const pagination = reactive({ total: 0 })
const selectedDate = ref(
  new Date().toISOString().split('T')[0]
)
const savePermission = async (data) => {

    try {

        await $fetch(
            `${config.public.apiBase}/admin/clearance-statuses`,
            {
                method: 'POST',

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                },

                body: {
                    flying_location_id: data.location.id,
                    permission_date: selectedDate.value,
                    status: data.status,
                    reason: data.reason
                }
            }
        )

        await fetchLocations()

        alert('Permission updated successfully.')

    } catch (error) {

        console.error(error)

        alert('Unable to update permission.')
    }

}
const form = reactive({

    name: '',

    type: '',

    takeoff_kato: '',

    takeoff_nazim: '',

    landing_kato: '',

    landing_nazim: '',

    max_altitude: '',

    clearance_status: 'green',

    permission_date: '',
reason: '',
    is_enabled: true,

    sports: []

})
const onDateSelected = (date) => {

    selectedDate.value = date

    fetchLocations()

}
const formattedSelectedDate = computed(() => {

    return new Date(selectedDate.value).toLocaleDateString(
        'en-US',
        {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    )

})

const openCount = computed(() =>

    locations.value.filter(location =>

        getCurrentStatus(location).status === 'green'

    ).length

)

const pendingCount = computed(() =>

    locations.value.filter(location =>

        getCurrentStatus(location).status === 'yellow'

    ).length

)

const closedCount = computed(() =>

    locations.value.filter(location =>

        getCurrentStatus(location).status === 'red'

    ).length

)
// --- ROBUST NOTIFICATION HELPER ---
const notify = (type, message) => {
  if (process.client) {
    try {
      if (nuxtApp.$toast && typeof nuxtApp.$toast[type] === 'function') {
        nuxtApp.$toast[type](message)
      } else {
        alert(`${type.toUpperCase()}: ${message}`)
      }
    } catch (e) {
      alert(`${type.toUpperCase()}: ${message}`)
    }
  }
}

// --- FETCH LOGIC ---
const fetchSports = async () => {
  try {
    const res = await $fetch(`${config.public.apiBase}/sports`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    availableSports.value = res.data || res
  } catch (err) {
    console.error('Sports load failed', err)
  }
}

const fetchLocations = async () => {

    loading.value = true

    try {

        const res = await $fetch(

            `${config.public.apiBase}/flying-locations`,

            {

                query: {

                    date: selectedDate.value,

                    search: searchQuery.value

                },

                headers: {

                    Authorization: `Bearer ${authStore.token}`

                }

            }

        )

        locations.value = res.data

        pagination.total = res.data.length

    } catch (e) {

        notify('error','Failed to load locations')

    }

    finally {

        loading.value = false

    }

}

const validateForm = () => {
  validationErrors.value = {}

  if (!form.name?.trim()) {
    validationErrors.value.name = ['Location name is required']
  }

  if (!form.takeoff_kato?.trim()) {
    validationErrors.value.takeoff_kato = ['Takeoff Kato is required']
  }

  if (!form.takeoff_nazim?.trim()) {
    validationErrors.value.takeoff_nazim = ['Takeoff Nazim is required']
  }

 if (!['green', 'yellow', 'red'].includes(form.clearance_status)){
    validationErrors.value.clearance_status = ['Invalid status']
  }
if (!form.permission_date) {

    validationErrors.value.permission_date = [
        'Permission date is required'
    ]

}
  if (
    form.max_altitude &&
    form.max_altitude.length > 255
  ) {
    validationErrors.value.max_altitude = [
      'Maximum altitude is too long'
    ]
  }

  return Object.keys(validationErrors.value).length === 0
}
// --- SAVE LOGIC ---
const saveLocation = async () => {
    validationErrors.value = {}

    if (!validateForm()) {
        notify('error', 'Please fix validation errors')
        return
    }

    saving.value = true

    const isEditing = !!editingLocation.value

    try {

        // ---------------------------------
        // 1. Save Location
        // ---------------------------------

        const locationUrl = isEditing
            ? `${config.public.apiBase}/admin/flying-locations/${editingLocation.value.id}`
            : `${config.public.apiBase}/admin/flying-locations`

        const locationResponse = await $fetch(locationUrl, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                Authorization: `Bearer ${authStore.token}`
            },
            body: form
        })

        const location =
            locationResponse.data || locationResponse

        // ---------------------------------
        // 2. Save Daily Permission
        // ---------------------------------

        await $fetch(
            `${config.public.apiBase}/admin/clearance-statuses`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                },
                body: {
                    flying_location_id: location.id,
                    permission_date: form.permission_date,
                    status: form.clearance_status,
                    reason: form.reason
                }
            }
        )

        notify('success', 'Location saved successfully')

        closeModal()

        await fetchLocations()

    } catch (error) {

        console.error(error)

        if (error.status === 422) {
            validationErrors.value = error.data?.errors || {}
        }

        notify(
            'error',
            error.data?.message || 'Server Error'
        )

    } finally {

        saving.value = false

    }
}

// --- UI HANDLERS ---
const openCreateModal = () => {
  editingLocation.value = null
  resetForm()
  form.permission_date = selectedDate.value
  validationErrors.value = {}
  showCreateModal.value = true
}

const editLocation = (location) => {

    editingLocation.value = location

    validationErrors.value = {}

    Object.assign(form, {

        ...location,

        sports: location.sports.map(s => s.id),

        permission_date: selectedDate.value,

        clearance_status:
            location.today_clearance_status?.status ?? 'red',

        reason:
            location.today_clearance_status?.reason ?? ''

    })

    showCreateModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingLocation.value = null
  resetForm()
}

const resetForm = () => {

    Object.assign(form, {

        name: '',

        type: '',

        takeoff_kato: '',

        takeoff_nazim: '',

        landing_kato: '',

        landing_nazim: '',

        max_altitude: '',

        clearance_status: 'green',
reason: '',
        permission_date: selectedDate.value,

        is_enabled: true,

        sports: []

    })

}
const showQRCode = async (location) => {
  selectedLocation.value = location
  showQRModal.value = true
  await nextTick()
  if (location.qr_code?.token && qrCodeRef.value) {
    const url = `${window.location.origin}/location/${location.slug}?token=${location.qr_code.token}`
    QRCode.toCanvas(qrCodeRef.value, url, { width: 220, margin: 2 })
  }
}

const generateQRCode = async (location) => {
  generatingId.value = location.id
  try {
    const res = await $fetch(`${config.public.apiBase}/admin/flying-locations/${location.id}/generate-qr`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (res.success) {
      const index = locations.value.findIndex(l => l.id === location.id)
      if (index !== -1) {
        locations.value[index].qr_code = res.data
        showQRCode(locations.value[index])
      }
      notify('success', 'QR Code Generated')
    }
  } catch (err) {
    notify('error', 'Failed to generate QR')
  } finally {
    generatingId.value = null
  }
}

const closeQRModal = () => { showQRModal.value = false }
const downloadQR = () => {
  const link = document.createElement('a')
  link.download = `QR-${selectedLocation.value.name}.png`
  link.href = qrCodeRef.value.toDataURL()
  link.click()
}

const handleSearch = useDebounceFn(() => fetchLocations(), 500)
const getCurrentStatus = (location) => {

    const permission =
        location.clearance_statuses
            ?.sort((a, b) =>
                new Date(b.permission_date) -
                new Date(a.permission_date)
            )[0]

    const status = permission?.status ?? 'red'

    switch (status) {

        case 'green':
            return {
                status: 'green',
                label: 'Open'
            }

        case 'yellow':
            return {
                status: 'yellow',
                label: 'Pending'
            }

        default:
            return {
                status: 'red',
                label: 'Closed'
            }
    }
}
onMounted(() => {
  fetchLocations()
  fetchSports()
})
</script>

<style scoped>
.flying-locations-admin { background: #f8fafc; min-height: 100vh; }
.status-badge-modern { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
.status-badge-modern.green { background: #dcfce7; color: #166534; }
.status-badge-modern.yellow {
    background: #fff3cd;
    color: #856404;
}
.status-badge-modern.red { background: #fee2e2; color: #991b1b; }
.pulse-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
.green .pulse-dot { background: #22c55e; animation: pulse 2s infinite; }
.yellow .pulse-dot {
    background: #ffc107;
    animation: pulse 2s infinite;
}
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
.italic { font-style: italic; }
</style>