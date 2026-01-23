<template>
  <div class="news-admin">
    <div class="dashboard-header mb-6">
      <div class="d-flex justify-content-between align-items-center px-4 pt-4">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-newspaper me-3 text-primary"></i>
            News & Announcements
          </h1>
          <div class="d-flex align-items-center gap-3">
            <p class="text-muted mb-0">
              Publish flight alerts, weather updates, and federation announcements
            </p>
            <span class="badge bg-primary-subtle text-primary">
              {{ pagination.total }} articles
            </span>
          </div>
        </div>
        <div>
          <button class="btn btn-primary d-flex align-items-center shadow-sm" @click="showCreateModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            Create News
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading" class="px-4">
      <div class="card shadow-sm border-0">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Article & Locations</th>
                  <th>Categories</th>
                  <th>Status</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="article in news" :key="article.id">
                  <td class="ps-4">
                    <div class="fw-bold text-dark">{{ article.title }}</div>
                    <div class="mt-1 d-flex flex-wrap gap-1">
                      <span v-if="article.affected_locations?.length" class="text-muted small me-2">
                        <i class="bi bi-geo-alt-fill text-danger"></i>
                      </span>
                      <span v-for="loc in article.affected_locations" :key="loc.id" 
                            class="badge bg-light text-dark border fw-normal" style="font-size: 0.7rem;">
                        {{ loc.name }}
                      </span>
                      <span v-if="!article.affected_locations?.length" class="text-muted x-small italic">
                        All Locations
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <span v-for="cat in article.categories" :key="cat.id" class="badge bg-primary-subtle text-primary">
                        {{ cat.name }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span :class="`badge bg-${article.is_published ? 'success' : 'warning'}-subtle text-${article.is_published ? 'success' : 'warning'}`">
                      {{ article.is_published ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" @click="editNews(article)"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(article)"><i class="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">{{ editingNews ? 'Update News' : 'Create New News' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveNews">
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Title</label>
                  <input v-model="form.title" type="text" class="form-control" required>
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold">Content</label>
                  <textarea v-model="form.content" class="form-control" rows="5" required></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Categories</label>
                  <div class="border rounded p-3 bg-light" style="max-height: 120px; overflow-y: auto;">
                    <div v-for="cat in categories" :key="cat.id" class="form-check">
                      <input class="form-check-input" type="checkbox" :value="cat.id" v-model="form.categories" :id="'cat'+cat.id">
                      <label class="form-check-label" :for="'cat'+cat.id">{{ cat.name }}</label>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-danger"><i class="bi bi-geo-alt me-1"></i>Affected Locations</label>
                  <div class="border rounded p-3 bg-light" style="max-height: 120px; overflow-y: auto;">
                    <div v-for="loc in locations" :key="loc.id" class="form-check">
                      <input class="form-check-input" type="checkbox" :value="loc.id" v-model="form.affected_locations" :id="'loc'+loc.id">
                      <label class="form-check-label" :for="'loc'+loc.id">{{ loc.name }}</label>
                    </div>
                  </div>
                  <small class="text-muted">If none selected, it applies to all sites.</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Status</label>
                  <select v-model="form.is_published" class="form-select">
                    <option :value="true">Published</option>
                    <option :value="false">Draft</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingNews ? 'Save Changes' : 'Create Article' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom bg-danger text-white">
            <h5 class="modal-title"><i class="bi bi-exclamation-triangle me-2"></i>Delete Article</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body text-center py-4">
            <h5 class="fw-bold">Are you sure?</h5>
            <p class="text-muted">You are about to delete: <br><strong class="text-danger">{{ articleToDelete?.title }}</strong></p>
            <p class="small text-secondary">This action cannot be undone.</p>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteNews" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal || showDeleteModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()
const config = useRuntimeConfig()

// Loading states
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

// Data arrays
const news = ref([])
const categories = ref([])
const locations = ref([])

// Modal toggles
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingNews = ref(null)
const articleToDelete = ref(null)

const pagination = reactive({ total: 0, current_page: 1, per_page: 15 })
const form = reactive({
  title: '',
  content: '',
  categories: [],
  affected_locations: [],
  is_published: true,
  published_at: ''
})

const fetchNews = async () => {
  loading.value = true
  try {
    const data = await $fetch(`${config.public.apiBase}/admin/news`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    news.value = data.data || []
    pagination.total = data.total || 0
  } finally { loading.value = false }
}

const fetchCategories = async () => {
  categories.value = await $fetch(`${config.public.apiBase}/admin/news-categories`, {
    headers: { 'Authorization': `Bearer ${authStore.token}` }
  })
}

const fetchLocations = async () => {
  const res = await $fetch(`${config.public.apiBase}/admin/flying-locations`, {
    headers: { 'Authorization': `Bearer ${authStore.token}` }
  })
  locations.value = res.data || []
}

const editNews = (article) => {
  editingNews.value = article
  form.title = article.title
  form.content = article.content
  form.categories = article.categories?.map(c => c.id) || []
  form.affected_locations = article.affected_locations?.map(l => l.id) || []
  form.is_published = !!article.is_published
  showCreateModal.value = true
}

const saveNews = async () => {
  saving.value = true
  const method = editingNews.value ? 'PUT' : 'POST'
  const url = editingNews.value 
    ? `${config.public.apiBase}/admin/news/${editingNews.value.id}` 
    : `${config.public.apiBase}/admin/news`

  try {
    await $fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: { ...form }
    })
    closeModal()
    fetchNews()
  } catch (e) {
    alert('Error saving news')
  } finally { saving.value = false }
}

const confirmDelete = (article) => {
  articleToDelete.value = article
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  articleToDelete.value = null
}

const deleteNews = async () => {
  try {
    deleting.value = true
    const url = `${config.public.apiBase}/admin/news/${articleToDelete.value.id}`
    
    await $fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      }
    })

    closeDeleteModal()
    await fetchNews()
  } catch (err) {
    console.error('Delete error:', err)
    alert(err.data?.message || 'Failed to delete news')
  } finally {
    deleting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingNews.value = null
  Object.assign(form, { title: '', content: '', categories: [], affected_locations: [], is_published: true })
}

onMounted(() => {
  fetchNews()
  fetchCategories()
  fetchLocations()
})
</script>

<style scoped>
.x-small { font-size: 0.7rem; }
.italic { font-style: italic; }
.modal-backdrop { z-index: 1040; }
.modal { z-index: 1050; }
</style>