<template>
  <section class="sports-section pb-120 pt-5 mt-5">
    <div class="container">
      <div class="row justify-content-center mb-5">
        <div class="col-lg-10 col-md-12 text-center">
          <div class="section-title4 sibling3">
            <h2 class="fw-bold">Experience the Skies</h2>
            <p class="text-muted">Discover the aerial sports governed by the LASF in Lebanon</p>
          </div>
        </div>
      </div>

      <div class="row g-4 g-lg-5">
        <div v-for="sport in sports" :key="sport.id" class="col-12 col-md-6 col-lg-4">
          <div class="sport-card h-100">
            <div class="sport-image">
              <span class="category-badge">LASF Official</span>
              <img 
                :src="`${config.public.mediaBase}${sport.image}`" 
                class="img-fluid" 
                :alt="sport.name"
                loading="lazy"
              >
            </div>
            
            <div class="sport-content">
              <h4 class="sport-name">{{ sport.name }}</h4>
              <div class="sport-text">
                <p>{{ sport.description || 'Join us for an unforgettable aerial adventure in the heart of Lebanon.' }}</p>
              </div>
              
        
            </div>
          </div>
        </div>

        <div v-if="!sports?.length" class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-3 text-muted">Loading our flight categories...</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const config = useRuntimeConfig()
// Fetch dynamic data from your public API controller
const { data: sports } = await useFetch(`${config.public.apiBase}/sports`)
</script>

<style scoped>
.sports-section {
  background-color: #f9f9f9;
}

/* Card Container */
.sport-card {
  display: flex;
  flex-direction: column;
  transition: all 0.4s ease;
}

/* Image Styling */
.sport-image {
  height: 280px;
  overflow: hidden;
  border-radius: 20px;
  position: relative;
  z-index: 1;
}

.sport-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

/* Content Box (The Floating Part) */
.sport-content {
  background: #ffffff;
  margin: -50px 20px 0; /* Creates the overlap */
  padding: 25px;
  border-radius: 15px;
  position: relative;
  z-index: 2;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* Hover Effects */
.sport-card:hover {
  transform: translateY(-10px);
}

.sport-card:hover .sport-image img {
  transform: scale(1.1);
}

.sport-card:hover .sport-content {
  box-shadow: 0 15px 35px rgba(15, 104, 71, 0.15); /* LASF Green shadow */
}

/* Text Styling */
.sport-name {
  color: #1a1a1a;
  font-weight: 800;
  font-size: 1.6rem;
  margin-bottom: 12px;
  text-transform: capitalize;
}

.sport-text p {
  font-size: 1.4rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Limit description to 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Badge */
.category-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #0f6847; /* Official Green */
  color: white;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  z-index: 3;
}

/* Button */
.explore-btn {
  color: #0f6847;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  margin-top: auto;
  transition: all 0.3s ease;
}

.explore-btn:hover {
  color: #083d2a;
  transform: translateX(5px);
}

/* Responsive */
@media (max-width: 992px) {
  .sport-image { height: 230px; }
  .sport-content { margin: -30px 15px 0; padding: 20px; }
}
</style>