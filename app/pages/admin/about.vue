<template>
  <div class="container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Edit About Us Content</h5>
            <i class="bi bi-info-circle"></i>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveAbout" enctype="multipart/form-data">
              <div class="row g-4">
                <div class="col-12">
                  <label class="form-label fw-bold">Main Title</label>
                  <input v-model="form.title" type="text" class="form-control" required>
                </div>

                <div class="col-12">
                  <label class="form-label fw-bold">About Content</label>
                  <textarea v-model="form.content" class="form-control" rows="8" required></textarea>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold">Feature Image</label>
                  <input type="file" @change="handleFileUpload" class="form-control" accept="image/*">
                  <div v-if="currentImage" class="mt-2">
                    <small class="text-muted d-block mb-1">Current Image:</small>
                    <img :src="`${config.public.mediaBase}${currentImage}`" class="img-thumbnail" style="height: 100px">
                  </div>
                </div>

                <div class="col-12 text-end">
                  <button type="submit" class="btn btn-primary px-5" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Update About Page
                  </button>
                </div>
              </div>
            </form>
          </div>
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

const loading = ref(false)
const currentImage = ref('')
const imageFile = ref(null)

const form = reactive({
  title: '',
  content: ''
})

const fetchAbout = async () => {
  const data = await $fetch(`${config.public.apiBase}/about-us`)
  if (data) {
    form.title = data.title
    form.content = data.content
    currentImage.value = data.image
  }
}

const handleFileUpload = (e) => { imageFile.value = e.target.files[0] }

const saveAbout = async () => {
  loading.value = true
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('content', form.content)
  if (imageFile.value) formData.append('image', imageFile.value)

  try {
    await $fetch(`${config.public.apiBase}/admin/about-us`, {
      method: 'POST', // Using POST for file upload spoofing if needed
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData
    })
    alert('About Us updated successfully!')
    fetchAbout()
  } catch (e) { alert('Error updating content') }
  finally { loading.value = false }
}

onMounted(fetchAbout)
</script>