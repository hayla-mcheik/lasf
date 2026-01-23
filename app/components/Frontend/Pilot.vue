<template>
  <div class="tour-guide-section pb-120 pt-5 mt-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10 col-md-12 text-center">
          <div class="section-title4 sibling3">
            <h2>Meet Our Excellent Pilots</h2>
          </div>
        </div>
      </div>
      <div class="row justify-content-center g-4">
        <div v-for="pilot in pilots" :key="pilot.id" class="col-lg-4 col-md-6 col-sm-10">
          <div class="tour-guide-single2">
            <div class="tour-guide-image">
       <img 
  :src="`${config.public.mediaBase}${pilot.image}`" 
  class="img-fluid" 
  alt="pilot"
>
              <div v-if="pilot.facebook_url || pilot.instagram_url" class="social-area gap-3">
                <div class="social-plus"><i class='bx bx-plus'></i></div>
                <ul class="social-links d-flex justify-content-center align-items-center flex-column gap-3">
                  <li v-if="pilot.instagram_url">
                    <a :href="pilot.instagram_url" target="_blank">
                      <i class='bx bxl-instagram'></i>
                    </a>
                  </li>
                  <li v-if="pilot.facebook_url">
                    <a :href="pilot.facebook_url" target="_blank">
                      <i class='bx bxl-facebook'></i>
                    </a>
                  </li>
                </ul>
              </div>

              <div class="tour-guide-content">
                <h4 class="name">{{ pilot.user?.name || 'Pilot Name' }}</h4>
                <p class="designation">{{ pilot.designation || 'Expert Pilot' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!pilots || pilots.length === 0" class="text-center">
          <p>Our pilots are currently in the air!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

// Fetch dynamic data from Laravel API
// Note: Ensure your Laravel controller uses ->with('user') to populate pilot.user.name
const { data: pilots } = await useFetch(`${config.public.apiBase}/pilots`)
</script>

<style scoped>
/* Ensures smooth transition for social icons */
.social-links li a {
  transition: all 0.3s ease;
}
.social-links li a:hover {
  color: #3b5998; /* Example color change */
}
</style>