<template>
  <div class="destination-section pt-120 pb-120">
    <div class="container text-center">
      <div class="nav d-inline-flex flex-row justify-content-center nav-pills mb-40">
        <button 
          class="nav-link nav-btn-style me-3" 
          :class="{ active: activeTab === 'images' }"
          @click="activeTab = 'images'"
          type="button"
        >
          <i class="bi bi-card-image me-2"></i> Image Gallery
        </button>
        <button 
          class="nav-link nav-btn-style" 
          :class="{ active: activeTab === 'videos' }"
          @click="activeTab = 'videos'"
          type="button"
        >
          <i class="bi bi-play-btn me-2"></i> Video Gallery
        </button>
      </div>

      <div class="tab-content mt-4">
        <div v-if="activeTab === 'images'" class="tab-pane fade show active">
          <div class="row g-4">
            <div v-for="img in imageList" :key="img.id" class="col-lg-4 col-md-6">
              <div class="image-gallery-single shadow-sm rounded-4 overflow-hidden bg-white p-2">
                <a :href="getFullUrl(img.file)" target="_blank">
                  <img :src="getFullUrl(img.file)" :alt="img.title" class="img-fluid rounded-3">
                  <div class="gallery-info p-3 text-start">
                    <h6 class="mb-0 fw-bold text-dark">{{ img.title || 'LASF Photo' }}</h6>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'videos'" class="tab-pane fade show active">
          <div class="row g-4">
            <div v-for="video in videoList" :key="video.id" class="col-lg-4 col-md-6">
              <div class="image-gallery-single shadow-sm rounded-4 overflow-hidden bg-white p-2">
                
                <div v-if="isYouTube(video.file)" class="video-thumb-wrapper position-relative">
                  <a :href="video.file" target="_blank">
                    <img :src="getVideoThumbnail(video.file)" :alt="video.title" class="img-fluid rounded-3">
                    <div class="play-overlay position-absolute top-50 start-50 translate-middle">
                      <i class="bi bi-play-circle-fill text-white display-4 shadow"></i>
                    </div>
                  </a>
                </div>

                <div v-else class="local-video-wrapper">
                  <video controls class="w-100 rounded-3 shadow-sm" style="height: 250px; object-fit: cover;">
                    <source :src="getFullUrl(video.file)" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div class="gallery-info p-3 text-start">
                  <h6 class="mb-0 fw-bold text-dark">{{ video.title || 'LASF Video' }}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const config = useRuntimeConfig()
const activeTab = ref('images')

const { data: galleryResponse } = await useFetch(`${config.public.apiBase}/gallery`)

const imageList = computed(() => galleryResponse.value?.images || [])
const videoList = computed(() => galleryResponse.value?.videos || [])

const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'))

const getFullUrl = (path) => {
  if (!path) return ''
  // Prevents doubled URLs (e.g., http://site.com/apihttp://site.com/storage)
  if (path.startsWith('http')) return path 
  
  const base = config.public.apiBase.replace('/api', '')
  return `${base}${path}`
}

const getVideoThumbnail = (url) => {
  if (isYouTube(url)) {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  }
  return '' // Local videos use the <video> tag instead of a thumbnail
}
</script>