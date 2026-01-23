<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">Regulations & Safety</h3>
      <button class="btn btn-success" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Add Rule
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th>Priority</th>
              <th>Category</th>
              <th>Title</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reg in regulations" :key="reg.id">
              <td><span class="badge bg-secondary">{{ reg.order_priority }}</span></td>
              <td><span class="text-uppercase fw-bold small text-primary">{{ reg.category }}</span></td>
              <td>
                <div class="fw-bold">{{ reg.title }}</div>
                <small class="text-muted">{{ truncate(reg.content, 50) }}</small>
              </td>
              <td>
                <span v-if="reg.is_critical" class="badge bg-danger">Critical Safety</span>
                <span v-else class="badge bg-info">General</span>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-2" @click="openModal(reg)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteReg(reg.id)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop fade show"></div>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingId ? 'Edit Rule' : 'New Safety Rule' }}</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <form @submit.prevent="saveRegulation">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Category</label>
                <select v-model="regForm.category" class="form-select" required>
                  <option value="Safety">Safety First</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Pilot Conduct">Pilot Conduct</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Rule Title</label>
                <input v-model="regForm.title" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea v-model="regForm.content" class="form-control" rows="4" required></textarea>
              </div>
              <div class="form-check form-switch mb-3">
                <input v-model="regForm.is_critical" class="form-check-input" type="checkbox" id="criticalSwitch">
                <label class="form-check-label" for="criticalSwitch">Is this a critical safety rule?</label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary w-100" :disabled="loading">Save Regulation</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
definePageMeta({
  layout: 'admin',

})

const config = useRuntimeConfig()
const authStore = useAuthStore()

const regulations = ref([])
const showModal = ref(false)
const editingId = ref(null)
const loading = ref(false)

const regForm = reactive({
  category: 'Safety',
  title: '',
  content: '',
  is_critical: false,
  order_priority: 0
})

const fetchRegs = async () => {
  const data = await $fetch(`${config.public.apiBase}/regulations`)
  // Note: Backend groupBy returns an object, so we flatten it for the table
  regulations.value = Object.values(data).flat()
}

const openModal = (item = null) => {
  if (item) {
    editingId.value = item.id
    Object.assign(regForm, item)
  } else {
    editingId.value = null
    Object.assign(regForm, { category: 'Safety', title: '', content: '', is_critical: false })
  }
  showModal.value = true
}

const saveRegulation = async () => {
  loading.value = true
  const url = editingId.value 
    ? `${config.public.apiBase}/admin/regulations/${editingId.value}` 
    : `${config.public.apiBase}/admin/regulations`
  
  try {
    await $fetch(url, {
      method: editingId.value ? 'PUT' : 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: regForm
    })
    showModal.value = false
    fetchRegs()
  } catch (e) { alert('Error saving rule') }
  finally { loading.value = false }
}

const deleteReg = async (id) => {
  if (!confirm('Delete this rule?')) return
  await $fetch(`${config.public.apiBase}/admin/regulations/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authStore.token}` }
  })
  fetchRegs()
}

const truncate = (txt, len) => txt.length > len ? txt.substring(0, len) + '...' : txt

onMounted(fetchRegs)
</script>