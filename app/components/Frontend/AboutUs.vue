<template>
  <div class="feature-section2 pt-120 pb-120">
    <div class="container">
      <div class="row justify-content-center align-items-center">
        <div class="col-lg-6 ps-lg-5">
          <div class="about3-title text-start" v-if="aboutData">
            <h2 class="mb-4 fw-bold">{{ aboutData.title }}</h2>
            
            <div class="about-text-content">
              {{ aboutData.content }}
            </div>

            <ul v-if="aboutData.mission" class="feature3-list sibling-2 mt-4">
               <li v-for="(item, index) in aboutData.mission" :key="index">
                 {{ item }}
               </li>
            </ul>
          </div>
          
          <div v-else class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
          </div>
        </div>

        <div class="col-lg-6 mt-5 mt-lg-0">
          <div class="feature-image-group d-flex flex-row justify-content-center gap-4">
            <div class="feature-image">
              <img 
                :src="aboutData?.image ? `${config.public.mediaBase}${aboutData.image}` : '/assets/images/gallery/gallery-img2.png'" 
                class="img-fluid rounded shadow" 
                alt="About LASF"
              >
            </div>
            
            <div class="feature-image translate-y d-none d-sm-block">
              <img 
                :src="aboutData?.image ? `${config.public.mediaBase}${aboutData.image}` : '/assets/images/gallery/gallery-img2.png'" 
                class="img-fluid rounded shadow" 
                style="opacity: 0.7;"
                alt="About LASF Decorative"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

// Fetch the About Us data from the public endpoint
const { data: aboutData } = await useFetch(`${config.public.apiBase}/about-us`)
</script>

<style scoped>
.about-text-content {
  white-space: pre-line; /* This is critical: it turns your Admin 'Enter' key breaks into real paragraphs */
  line-height: 1.8;
  color: #555;
  font-size: 1.6rem;
}

.feature-image img {
  border-radius: 20px;
  object-fit: cover;
  height: 450px;
  width: 100%;
}

.translate-y {
  transform: translateY(40px);
}

.feature-image-group {
  position: relative;
}

/* Add a green accent to the title */
.about3-title h2 {
  position: relative;
  padding-bottom: 15px;
}

.about3-title h2::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: #0f6847; /* LASF Green */
  border-radius: 2px;
}
</style>