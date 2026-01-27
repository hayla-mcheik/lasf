<template>
  <div class="news-categories-admin container-fluid">
    <div class="dashboard-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-tags me-3 text-primary"></i>
            News Categories
          </h1>
          <p class="text-muted mb-0">Organize news articles by categories (Clearance, Weather, Events, etc.)</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center" @click="showCreateModal = true">
          <i class="bi bi-plus-circle me-2"></i>
          Add Category
        </button>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card shadow-sm border-0 border-start border-primary border-4">
          <div class="card-body">
            <h6 class="text-muted mb-1">Total Categories</h6>
            <h3 class="fw-bold mb-0">{{ categories.length }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Loading categories...</p>
        </div>
        <div v-else class="table-responsive" style="overflow: visible !important;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Category Name</th>
                <th>Auto-Type</th>
                <th>Articles Count</th>
                <th>Created</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in categories" :key="category.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary-subtle text-primary me-3">
                      <i class="bi bi-tag"></i>
                    </div>
                    <div class="fw-bold text-dark">{{ category.name }}</div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-info-subtle text-info rounded-pill px-3">
                    {{ getCategoryType(category.name) }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-newspaper me-2 text-muted"></i>
                    <span>{{ category.news_count || 0 }} articles</span>
                  </div>
                </td>
                <td>
                  <div class="small text-muted">{{ formatTimeAgo(category.created_at) }}</div>
                </td>
                <td class="text-center">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-light border" type="button" @click.stop="toggleMenu(category.id)">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu shadow-sm" :class="{ 'show': activeMenuId === category.id }" 
                        style="right: 0; left: auto; top: 100%; z-index: 1060;">
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="editCategory(category)">
                          <i class="bi bi-pencil me-2 text-primary"></i> Edit
                        </a>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDelete(category)">
                          <i class="bi bi-trash me-2"></i> Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr v-if="categories.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">No categories found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal-backdrop fade show"></div>
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom text-white" :class="editingCategory ? 'bg-primary' : 'bg-success'">
            <h5 class="modal-title">
              <i class="bi me-2" :class="editingCategory ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
              {{ editingCategory ? 'Edit Category' : 'Create New Category' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveCategory">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label fw-bold">Category Name <span class="text-danger">*</span></label>
                <input v-model="form.name" type="text" class="form-control" required
                       placeholder="e.g., Weather Alerts, Event Updates">
                <div v-if="fieldErrors.name" class="text-danger small mt-1">{{ fieldErrors.name[0] }}</div>
              </div>
              <div v-if="editingCategory" class="alert alert-info small mb-0">
                <i class="bi bi-info-circle me-2"></i>
                This category is linked to {{ editingCategory.news_count || 0 }} articles.
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                Save Category
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
            <i class="bi bi-trash display-4 text-danger mb-3"></i>
            <p class="mb-0">Delete category <strong>{{ categoryToDelete?.name }}</strong>?</p>
            <p class="text-muted small">Articles using this category will lose their reference.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteCategory" :disabled="deleting">Delete</button>
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

// State
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref(null)
const fieldErrors = ref({})
const categories = ref([])
const activeMenuId = ref(null)

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref(null)
const categoryToDelete = ref(null)
const form = reactive({ name: '' })

// HELPERS
const getCategoryType = (name) => {
  if (!name) return 'General'
  const n = name.toLowerCase()
  if (n.includes('weather')) return 'Weather'
  if (n.includes('clearance') || n.includes('status')) return 'Safety'
  if (n.includes('event')) return 'Community'
  if (n.includes('alert') || n.includes('urgent')) return 'Alert'
  return 'Information'
}

const formatTimeAgo = (date) => {
  if (!date) return 'Recently'
  const diff = Math.floor((new Date() - new Date(date)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const toggleMenu = (id) => { activeMenuId.value = activeMenuId.value === id ? null : id }
const handleGlobalClick = () => { activeMenuId.value = null }

// API METHODS
const fetchCategories = async () => {
  loading.value = true
  try {
    const data = await $fetch(`${config.public.apiBase}/admin/news-categories`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    categories.value = data.data || data
  } catch (err) { error.value = "Load failed" } finally { loading.value = false }
}

const saveCategory = async () => {
  saving.value = true
  try {
    const isEditing = !!editingCategory.value
    const url = isEditing 
      ? `${config.public.apiBase}/admin/news-categories/${editingCategory.value.id}`
      : `${config.public.apiBase}/admin/news-categories`
    
    await $fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: form,
    })
    closeModal()
    fetchCategories()
  } catch (err) { fieldErrors.value = err.data?.errors || {} } finally { saving.value = false }
}

const deleteCategory = async () => {
  deleting.value = true
  try {
    await $fetch(`${config.public.apiBase}/admin/news-categories/${categoryToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    closeDeleteModal()
    fetchCategories()
  } finally { deleting.value = false }
}

const editCategory = (c) => { activeMenuId.value = null; editingCategory.value = c; form.name = c.name; showCreateModal.value = true }
const confirmDelete = (c) => { activeMenuId.value = null; categoryToDelete.value = c; showDeleteModal.value = true }
const closeModal = () => { showCreateModal.value = false; editingCategory.value = null; form.name = ''; fieldErrors.value = {} }
const closeDeleteModal = () => { showDeleteModal.value = false }

onMounted(() => { fetchCategories(); window.addEventListener('click', handleGlobalClick) })
onUnmounted(() => window.removeEventListener('click', handleGlobalClick))
</script>

<style scoped>
.avatar-sm { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.dropdown-menu { display: none; position: absolute; min-width: 140px; }
.dropdown-menu.show { display: block; }
.table-responsive { overflow: visible !important; }
</style>