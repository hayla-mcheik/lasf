<template>
  <div class="testimonial-section4 pb-120 position-relative overflow-hidden">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10 col-md-12 text-center">
          <div class="section-title4 sibling3">
            <h2>What Our Visitors Say!</h2>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12" v-if="testimonials && testimonials.length">
          <div class="swiper testimonial4-slider">
            <div class="swiper-wrapper">
              <div v-for="item in testimonials" :key="item.id" class="swiper-slide">
                <div class="testimonial-single1 sibling-4">
                  <div class="testi-author">
                    <div class="author-text">
                      <h5>{{ item.name }}</h5>
                      <span>Pilot</span>
                    </div>
                  </div>
                  <p>“{{ item.description }}”</p>
                </div>
              </div>
            </div>
          </div>
          <div class="slider-arrows arrows-style-3 sibling-2 text-center d-xl-flex d-none flex-row justify-content-between align-items-center w-100">
            <div class="testi4-prev swiper-prev-arrow"><i class="bi bi-arrow-left"></i></div>
            <div class="testi4-next swiper-next-arrow"><i class="bi bi-arrow-right"></i></div>
          </div>
        </div>
        <div v-else class="text-center">
          <p>Loading testimonials...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
let swiperInstance = null

// Fetch Dynamic Data
const { data: testimonials } = await useFetch(`${config.public.apiBase}/testimonials`)

const initSwiper = () => {
  if (typeof Swiper === 'undefined' || !testimonials.value) return
  if (swiperInstance) swiperInstance.destroy(true, true)

  swiperInstance = new Swiper(".testimonial4-slider", {
    slidesPerView: 1,
    speed: 1000,
    autoplay: true,
    spaceBetween: 25,
    loop: testimonials.value.length > 1, // Only loop if more than 1 item
    navigation: { nextEl: ".testi4-next", prevEl: ".testi4-prev" },
    breakpoints: { 992: { slidesPerView: 2 } }
  });
}

onMounted(() => {
  setTimeout(initSwiper, 300)
  window.addEventListener('resize', initSwiper)
})

onUnmounted(() => {
  if (swiperInstance) swiperInstance.destroy(true, true)
  window.removeEventListener('resize', initSwiper)
})
</script>