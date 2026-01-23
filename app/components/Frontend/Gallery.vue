<template>
  <div class="destination-section pt-120 pb-120">
    <div class="container text-center">
      <div class="nav d-inline-flex flex-row justify-content-center nav-pills mb-40">
        <button class="nav-link active nav-btn-style me-3" id="img-tab" data-bs-toggle="pill" data-bs-target="#v-img" type="button">
          <i class="bi bi-card-image"></i> Image Gallery
        </button>
        <button class="nav-link nav-btn-style" id="vid-tab" data-bs-toggle="pill" data-bs-target="#v-vid" type="button">
          <i class="bi bi-play-btn"></i> Video Gallery
        </button>
      </div>

      <div class="tab-content" id="v-pills-tabContent">
        <div class="tab-pane fade show active" id="v-img" role="tabpanel">
          <div class="row justify-content-center g-4">
            <template v-if="galleryData?.images?.length">
              <div v-for="img in galleryData.images" :key="img.id" class="col-lg-4 col-md-6">
                <div class="image-gallery-single position-relative">
                  <div class="image-view">
                    <a :href="`${config.public.mediaBase}${img.file}`" target="_blank" class="video-icon"><i class="bi bi-binoculars"></i></a>
                  </div>
                  <img :src="`${config.public.mediaBase}${img.file}`" class="img-fluid rounded shadow-sm" :alt="img.title">
                </div>
              </div>
            </template>
            <div v-else class="py-5">
              <p class="text-muted">Capturing moments... check back soon!</p>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="v-vid" role="tabpanel">
          <div class="row justify-content-center g-4">
            <template v-if="galleryData?.videos?.length">
              <div v-for="video in galleryData.videos" :key="video.id" class="col-lg-4 col-md-6">
                <div class="video-gallery-single position-relative">
                  <div class="video-play sibling-4">
                    <a :href="video.file" target="_blank" class="video-icon"><i class="bx bx-play"></i></a>
                  </div>
                  <img :src="getVideoThumbnail(video.file)" class="img-fluid rounded shadow-sm" alt="video thumbnail">
                </div>
              </div>
            </template>
            <div v-else class="py-5">
              <p class="text-muted">Our flight videos are being edited!</p>
            </div>
          </div>
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