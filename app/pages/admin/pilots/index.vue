<template>
  <div class="pilots-admin container-fluid">
    <div class="dashboard-header mb-4 shadow-sm p-4 bg-white rounded">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-people me-3 text-primary"></i> Pilots Management
          </h1>
          <p class="text-muted mb-0">Manage registrations, bulk import, and pilot documentation.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success d-flex align-items-center" @click="exportPilots">
            <i class="bi bi-download me-2"></i> Export CSV
          </button>
          <label class="btn btn-outline-primary d-flex align-items-center mb-0 cursor-pointer">
            <i class="bi bi-upload me-2"></i> Import CSV
            <input type="file" @change="importPilots" hidden accept=".csv">
          </label>
          <button class="btn btn-primary d-flex align-items-center shadow-sm" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i> Add Pilot
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
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
                <th>License</th>
                <th>Designation</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pilot in pilots" :key="pilot.id">
                <td>
                  <div class="d-flex align-items-center">
                    <img 
                      :src="pilot.pilot_profile?.image || '/assets/images/avatarpilot.jpg'" 
                      class="rounded-circle me-2 border" 
                      style="width: 40px; height: 40px; object-fit: cover;"
                      @error="(e) => e.target.src = '/assets/images/avatarpilot.jpg'"
                    >
                    <div>
                      <div class="fw-bold">{{ pilot.name }}</div>
                      <small class="text-muted">{{ pilot.email }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="small fw-bold">{{ pilot.pilot_profile?.license_number }}</div>
                  <div class="text-muted small text-capitalize">{{ pilot.pilot_profile?.license_type }}</div>
                </td>
                <td>{{ pilot.pilot_profile?.designation || 'N/A' }}</td>
                <td>
                  <span :class="pilot.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ pilot.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="editPilot(pilot)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(pilot)"><i class="bi bi-trash"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal-backdrop fade show"></div>
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header" :class="editingPilot ? 'bg-primary text-white' : 'bg-success text-white'">
            <h5 class="modal-title">{{ editingPilot ? 'Edit Pilot' : 'Add New Pilot' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="savePilot">
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Full Name</label>
                  <input v-model="form.name" type="text" class="form-control" :class="{'is-invalid': fieldErrors.name}">
                  <div class="invalid-feedback" v-if="fieldErrors.name">{{ fieldErrors.name[0] }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Email</label>
                  <input v-model="form.email" type="email" class="form-control" :class="{'is-invalid': fieldErrors.email}">
                  <div class="invalid-feedback" v-if="fieldErrors.email">{{ fieldErrors.email[0] }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Phone Number</label>
                  <input v-model="form.phone" type="text" class="form-control" placeholder="+961..." :class="{'is-invalid': fieldErrors.phone}">
                  <div class="invalid-feedback" v-if="fieldErrors.phone">{{ fieldErrors.phone[0] }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Pilot Photo (Max 2MB)</label>
                  <input type="file" @change="handleFileUpload" class="form-control" accept="image/*" :class="{'is-invalid': fieldErrors.image}">
                  <div class="invalid-feedback" v-if="fieldErrors.image">{{ fieldErrors.image[0] }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">License #</label>
                  <input v-model="form.license_number" type="text" class="form-control" :class="{'is-invalid': fieldErrors.license_number}">
                  <div class="invalid-feedback" v-if="fieldErrors.license_number">{{ fieldErrors.license_number[0] }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">License Type</label>
                  <select v-model="form.license_type" class="form-select" :class="{'is-invalid': fieldErrors.license_type}">
                    <option value="paragliding">Paragliding</option>
                    <option value="paramotor">Paramotor</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Designation</label>
                  <input v-model="form.designation" type="text" class="form-control" placeholder="e.g. Tandem Pilot">
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span> Save Pilot
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-backdrop fade show"></div>
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close btn-close-white" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete pilot <strong>{{ pilotToDelete?.name }}</strong>?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deletePilot" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()
const config = useRuntimeConfig()

// Data
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref(null)
const fieldErrors = ref({})
const pilots = ref([])
const pagination = reactive({ total: 0 })

// Modal Controls
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingPilot = ref(null)
const pilotToDelete = ref(null)
const imageFile = ref(null)

const form = reactive({
  name: '', email: '', phone: '', license_number: '',
  license_type: 'paragliding', designation: '', is_active: true
})

const fetchPilots = async () => {
  loading.value = true
  try {
    const data = await $fetch(`${config.public.apiBase}/admin/pilots`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    pilots.value = data.data || data
    pagination.total = pilots.value.length
  } catch (err) {
    error.value = "Failed to load pilots."
  } finally {
    loading.value = false
  }
}

// Inside pilots.vue -> savePilot function

const savePilot = async () => {
  saving.value = true;
  fieldErrors.value = {};
  error.value = null;
  
  const formData = new FormData();
  
  // Only append necessary fields, skipping is_active
  formData.append('name', form.name);
  formData.append('email', form.email);
  formData.append('phone', form.phone || '');
  formData.append('license_number', form.license_number);
  formData.append('license_type', form.license_type);
  formData.append('designation', form.designation || '');
  
  if (imageFile.value) {
    formData.append('image', imageFile.value);
  }
  
  const isEdit = !!editingPilot.value;
  if (isEdit) formData.append('_method', 'PUT');

  const url = isEdit 
    ? `${config.public.apiBase}/admin/pilots/${editingPilot.value.id}` 
    : `${config.public.apiBase}/admin/pilots`;

  try {
    await $fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json' 
      },
      body: formData
    });
    alert('Pilot saved successfully!');
    closeModal();
    fetchPilots();
  } catch (err) {
    if (err.status === 422) {
      // 1. Set the red highlights for the UI
      fieldErrors.value = err.data.errors;
      
      // 2. Extract specific error messages for the Alert
      const errorList = Object.values(err.data.errors).flat();
      const specificMessage = errorList.length > 0 ? errorList[0] : "Validation failed";
      
      alert(`Problem: ${specificMessage}`); // The client sees exactly what is wrong
    } else {
      const generalMessage = err.data?.message || "An error occurred while saving.";
      alert(`Error: ${generalMessage}`);
    }
  } finally {
    saving.value = false;
  }
}

// Delete Logic
const confirmDelete = (pilot) => {
  pilotToDelete.value = pilot
  showDeleteModal.value = true
}

const deletePilot = async () => {
  deleting.value = true
  try {
    await $fetch(`${config.public.apiBase}/admin/pilots/${pilotToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    showDeleteModal.value = false
    alert('Pilot deleted successfully!')
    fetchPilots()
  } catch (err) {
    alert(err.data?.message || 'Failed to delete pilot')
  } finally { 
    deleting.value = false 
  }
}

const exportPilots = () => {
  const baseUrl = config.public.apiBase;
  // Token in URL solves GET method authentication issue
  const exportUrl = `${baseUrl}/admin/pilots/export?token=${authStore.token}`;
  window.open(exportUrl, '_blank');
};

const importPilots = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    loading.value = true
    const res = await $fetch(`${config.public.apiBase}/admin/pilots/import`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData
    })
    alert(res.message)
    fetchPilots()
  } catch (err) {
    alert(err.data?.message || 'Import failed')
  } finally {
    loading.value = false
    event.target.value = ''
  }
}

const handleFileUpload = (e) => imageFile.value = e.target.files[0]
const openCreateModal = () => { resetForm(); showCreateModal.value = true }
const closeModal = () => { showCreateModal.value = false; editingPilot.value = null; fieldErrors.value = {} }
const resetForm = () => Object.assign(form, { name: '', email: '', phone: '', license_number: '', license_type: 'paragliding', designation: '', is_active: true })
const editPilot = (p) => { 
  editingPilot.value = p
  Object.assign(form, p)
  form.license_number = p.pilot_profile?.license_number
  form.license_type = p.pilot_profile?.license_type
  form.designation = p.pilot_profile?.designation
  showCreateModal.value = true 
}

onMounted(fetchPilots)
</script>

<style scoped>
.avatar-sm { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.cursor-pointer { cursor: pointer; }
.italic { font-style: italic; }
</style>