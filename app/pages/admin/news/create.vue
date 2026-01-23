<template>
<h1>askj</h1>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const articleId = route.params.id
const loading = ref(true)
const saving = ref(false)
const errors = ref({})

// Form data
const form = reactive({
  title: '',
  content: '',
  is_published: false,
  published_at: null,
  categories: []
})

// Article data
const article = ref({})
const categories = ref([])

// Load categories
const loadCategories = async () => {
  try {
    const response = await $fetch('/api/admin/news-categories')
    categories.value = response
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

// Load article if editing
const loadArticle = async () => {
  if (!articleId) return
  
  try {
    const response = await $fetch(`/api/admin/news/${articleId}`)
    if (response.success) {
      article.value = response.data
      
      // Populate form
      form.title = article.value.title
      form.content = article.value.content
      form.is_published = article.value.is_published
      form.published_at = article.value.published_at ? formatDateTimeLocal(article.value.published_at) : null
      form.categories = article.value.categories?.map(cat => cat.id) || []
    }
  } catch (error) {
    console.error('Error loading article:', error)
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

// Save article
const saveArticle = async (draft = false) => {
  saving.value = true
  errors.value = {}
  
  try {
    const data = {
      ...form,
      is_published: draft ? false : form.is_published
    }
    
    if (articleId) {
      // Update existing article
      const response = await $fetch(`/api/admin/news/${articleId}`, {
        method: 'PUT',
        body: data
      })
      
      if (response.success) {
        showSuccess('Article updated successfully!')
        router.push('/admin/news')
      }
    } else {
      // Create new article
      const response = await $fetch('/api/admin/news', {
        method: 'POST',
        body: data
      })
      
      if (response.success) {
        showSuccess('Article created successfully!')
        router.push('/admin/news')
      }
    }
  } catch (error) {
    if (error.data?.errors) {
      errors.value = error.data.errors
    } else {
      showError('Failed to save article. Please try again.')
    }
  } finally {
    saving.value = false
  }
}

// Save as draft
const saveDraft = () => {
  saveArticle(true)
}

// Delete article
const deleteArticle = async () => {
  if (!confirm('Are you sure you want to delete this article?')) return
  
  saving.value = true
  try {
    const response = await $fetch(`/api/admin/news/${articleId}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      showSuccess('Article deleted successfully!')
      router.push('/admin/news')
    }
  } catch (error) {
    showError('Failed to delete article. Please try again.')
  } finally {
    saving.value = false
  }
}

// Show success message
const showSuccess = (message) => {
  // You can use a toast library or custom notification
  alert(message)
}

// Show error message
const showError = (message) => {
  alert(message)
}

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadArticle()
  ])
  loading.value = false
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

.editor-container textarea {
  border-radius: 0.75rem;
  border: 2px solid #e9ecef;
  padding: 1rem;
  font-size: 1rem;
}

.editor-container textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
}

.categories-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.categories-list::-webkit-scrollbar {
  width: 6px;
}

.categories-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.categories-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
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