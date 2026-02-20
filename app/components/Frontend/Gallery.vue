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
          <i class="bi bi-card-image"></i> Image Gallery
        </button>
        <button 
          class="nav-link nav-btn-style" 
          :class="{ active: activeTab === 'videos' }"
          @click="activeTab = 'videos'"
          type="button"
        >
          <i class="bi bi-play-btn"></i> Video Gallery
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'images'" class="tab-pane fade show active">
           </div>

        <div v-if="activeTab === 'videos'" class="tab-pane fade show active">
           </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

// Fetch grouped data from your API
const { data: galleryData } = await useFetch(`${config.public.apiBase}/gallery`)

// Helper to get YouTube thumbnails automatically
const getVideoThumbnail = (url) => {
  if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  }
  // Fallback if it's an uploaded file or unknown link
  return '/assets/images/gallery/video-placeholder.png'
}
</script>

<style scoped>
.image-gallery-single img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.image-gallery-single:hover img {
  transform: scale(1.02);
}
.nav-link.active {
  background-color: #0d6efd !important;
  color: white !important;
}
</style>