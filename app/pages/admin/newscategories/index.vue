<template>
  <div class="news-categories-admin">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-tags me-3 text-primary"></i>
            News Categories
          </h1>
          <div class="d-flex align-items-center gap-3">
            <p class="text-muted mb-0">
              <i class="bi bi-diagram-3 me-1"></i>
              Organize news articles by categories (Clearance, Weather, Events, etc.)
            </p>
            <span class="badge bg-primary-subtle text-primary">
              {{ categories.length }} categories
            </span>
          </div>
        </div>
        <div>
          <button class="btn btn-primary d-flex align-items-center" @click="showCreateModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            Add Category
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
        <p class="mt-3 text-muted">Loading categories...</p>
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
      <!-- Categories Grid -->
      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="category in categories" :key="category.id">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 class="card-title fw-semibold mb-1">{{ category.name }}</h5>
                  <div class="text-muted small">
                    <i class="bi bi-newspaper me-1"></i>
                    {{ category.news_count || 0 }} articles
                  </div>
                </div>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" 
                          data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="editCategory(category)">
                        <i class="bi bi-pencil me-2"></i> Edit
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="confirmDelete(category)">
                        <i class="bi bi-trash me-2 text-danger"></i> Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mt-4">
                <div>
                  <span class="badge bg-primary-subtle text-primary">
                    {{ getCategoryType(category.name) }}
                  </span>
                </div>
                <small class="text-muted">
                  {{ formatTimeAgo(category.created_at) }}
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
                <h5 class="text-muted">Add New Category</h5>
                <p class="text-muted small mb-0">Create a new category for news articles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" 
         :class="{ show: showCreateModal }" @click.self="closeModal">
      <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom" :class="editingCategory ? 'bg-primary text-white' : 'bg-success text-white'">
            <h5 class="modal-title">
              <i class="bi me-2" :class="editingCategory ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
              {{ editingCategory ? 'Edit Category' : 'Create New Category' }}
            </h5>
            <button type="button" class="btn-close" :class="editingCategory ? 'btn-close-white' : ''" 
                    @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveCategory">
            <div class="modal-body">
              <div v-if="formErrors.length" class="alert alert-danger">
                <ul class="mb-0">
                  <li v-for="(error, index) in formErrors" :key="index">{{ error }}</li>
                </ul>
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-semibold">Category Name <span class="text-danger">*</span></label>
                <input v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.name }" required
                       placeholder="e.g., Clearance Updates, Weather Alerts, Events...">
                <div v-if="fieldErrors.name" class="invalid-feedback">
                  {{ fieldErrors.name[0] }}
                </div>
                <div class="form-text">
                  Use clear, descriptive names for better organization
                </div>
              </div>
              
              <div v-if="editingCategory" class="mt-4">
                <h6 class="text-muted mb-3">Category Usage</h6>
                <div class="alert alert-info small">
                  <i class="bi bi-info-circle me-2"></i>
                  This category is used by {{ editingCategory.news_count || 0 }} news articles.
                  Deleting it will remove the category from all associated articles.
                </div>
              </div>
            </div>
            <div class="modal-footer border-top">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="btn" :class="editingCategory ? 'btn-primary' : 'btn-success'" 
                      :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi" :class="editingCategory ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                {{ editingCategory ? 'Update Category' : 'Create Category' }}
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
              Delete Category
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="warning-icon mb-4">
              <i class="bi bi-trash fs-1 text-danger"></i>
            </div>
            <h5 class="fw-bold">Delete Category</h5>
            <p class="text-muted">Are you sure you want to delete <strong class="text-danger">{{ categoryToDelete?.name }}</strong>?</p>
            <div class="alert alert-warning small">
              <i class="bi bi-info-circle me-2"></i>
              This category is used by {{ categoryToDelete?.news_count || 0 }} articles.
              Deleting it will remove the category from all associated articles.
            </div>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">
              Cancel
            </button>
            <!-- <button type="button" class="btn btn-danger" @click="deleteCategory" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Category
            </button> -->
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
const categories = ref([])

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)

// Forms
const editingCategory = ref(null)
const categoryToDelete = ref(null)

const form = reactive({
  name: ''
})

// Methods
const fetchCategories = async () => {
  try {
    loading.value = true
    error.value = null

    const data = await $fetch(`${config.public.apiBase || 'http://localhost:8000'}/admin/news-categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    categories.value = data.data || data
    
  } catch (err) {
    console.error('Failed to fetch categories:', err)
    error.value = err.message || 'Failed to load categories.'
    
    if (config.public.devMode) {
      categories.value = [
        { id: 1, name: 'Clearance Updates', news_count: 12, created_at: '2024-01-10T10:30:00Z' },
        { id: 2, name: 'Weather Alerts', news_count: 8, created_at: '2024-01-09T14:20:00Z' },
      ]
      error.value = null
    }
  } finally {
    loading.value = false
  }
}

const saveCategory = async () => {
  try {
    saving.value = true
    formErrors.value = []
    fieldErrors.value = {}
    
    const baseUrl = config.public.apiBase || 'http://localhost:8000'
    const isEditing = !!editingCategory.value
    const url = isEditing 
      ? `${baseUrl}/admin/news-categories/${editingCategory.value.id}`
      : `${baseUrl}/admin/news-categories`
    
    const response = await $fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form),
    })
    
    if (response.success || response.data) {
      // 1. Update the local list instantly (Optimistic UI)
      if (isEditing) {
        const index = categories.value.findIndex(c => c.id === editingCategory.value.id)
        if (index !== -1) {
          categories.value[index] = { ...categories.value[index], ...form }
        }
      } else {
        await fetchCategories()
      }

      // 2. Trigger SUCCESS Toast
      addToast(
        isEditing ? 'Category updated successfully!' : 'Category created successfully!', 
        'success'
      )
      
      closeModal()
    }
  } catch (err) {
    console.error('Failed to save category:', err)
    
    // Extract error message for the Toast
    const errorMsg = err.data?.message || err.message || 'Failed to save category'
    addToast(errorMsg, 'error')

    if (err.data?.errors) {
      fieldErrors.value = err.data.errors
      formErrors.value = [err.data.message]
    }
  } finally {
    saving.value = false
  }
}

const deleteCategory = async () => {
  try {
    deleting.value = true
    const baseUrl = config.public.apiBase || 'http://localhost:8000'
    const url = `${baseUrl}/admin/news-categories/${categoryToDelete.value.id}`
    
    const response = await $fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
    })
    
    if (response.success || response.data) {
      // Remove from local list instantly
      categories.value = categories.value.filter(c => c.id !== categoryToDelete.value.id)
      
      addToast('Category deleted successfully!', 'success')
      closeDeleteModal()
    }
  } catch (err) {
    const errorMsg = err.data?.message || err.message || 'Failed to delete category'
    addToast(errorMsg, 'error')
  } finally {
    deleting.value = false
  }
}

// Utility methods remain same...
const editCategory = (category) => {
  editingCategory.value = category
  form.name = category.name
  showCreateModal.value = true
}

const confirmDelete = (category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingCategory.value = null
  form.name = ''
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  categoryToDelete.value = null
}

onMounted(fetchCategories)
</script>

<style scoped>
.news-categories-admin {
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
.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style>