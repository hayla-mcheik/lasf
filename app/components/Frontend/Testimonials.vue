<template>
   <div class="testimonial-section4 pb-120 position-relative overflow-hidden">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-10 col-md-12 text-center">
                    <div class="section-title4 sibling3">
                        <span>Testimonial</span>
                        <h2>What Our Visitors Say!</h2>
                        <img src="/assets/images/icons/section-title-vector.svg" alt="image">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="swiper testimonial4-slider">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide">
                                <div class="testimonial-single1 sibling-4">
                                    <div class="testi-author">
                                        <div class="image">
                                            <div class="testi-quote">
                                                <img src="/assets/images/icons/quote-icon4.svg" alt="image">
                                            </div>
                                            <img src="/assets/images/bg/testi11.png" alt="image">
                                        </div>
                                        <div class="author-text">
                                            <h5>Anjelina Sara</h5>
                                            <span>Toronto.</span>
                                        </div>
                                    </div>
                                    <p>“This place is great! I had a very pleasant stay here. Great stuff and beautiful suites with a fabulous view etiam rhoncus maecenas”!</p>
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="testimonial-single1 sibling-4">
                                    <div class="testi-author">
                                        <div class="image">
                                            <div class="testi-quote">
                                                <img src="/assets/images/icons/quote-icon4.svg" alt="image">
                                            </div>
                                            <img src="/assets/images/bg/testi42.png" alt="image">
                                        </div>
                                        <div class="author-text">
                                            <h5>Johan Martin Sr</h5>
                                            <span>London.</span>
                                        </div>
                                    </div>
                                    <p>“Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature  years old”!</p>
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="testimonial-single1 sibling-4">
                                    <div class="testi-author">
                                        <div class="image">
                                            <div class="testi-quote">
                                                <img src="/assets/images/icons/quote-icon4.svg" alt="image">
                                            </div>
                                            <img src="/assets/images/bg/testi11.png" alt="image">
                                        </div>
                                        <div class="author-text">
                                            <h5>Monti Rayna</h5>
                                            <span>Newyork.</span>
                                        </div>
                                    </div>
                                    <p>“This place is great! I had a very pleasant stay here. Great stuff and beautiful suites with a fabulous view etiam rhoncus maecenas”!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="slider-arrows arrows-style-3 sibling-2 text-center d-xl-flex d-none flex-row justify-content-between align-items-center w-100">
                        <div class="testi4-prev swiper-prev-arrow" tabindex="0" role="button" aria-label="Previous slide"> 
                            <i class="bi bi-arrow-left"></i>
                         </div>
                        <div class="testi4-next swiper-next-arrow" tabindex="0" role="button" aria-label="Next slide"> 
                            <i class="bi bi-arrow-right"></i>
                        </div>
                    </div>
                </div>   
            </div>
        </div>
     </div>
</template>


<script setup>

// Swiper instance reference
let swiperInstance = null

const initSwiper = () => {
  // Check if Swiper is available
  if (typeof Swiper === 'undefined') {
    console.warn('Swiper not loaded yet')
    return
  }

  // Destroy existing instance if any
  if (swiperInstance) {
    swiperInstance.destroy(true, true)
  }

  // Initialize new Swiper instance
  swiperInstance = new Swiper(".testimonial4-slider", {
    slidesPerView: 1,
    speed: 1000,
    autoplay: true,
    spaceBetween: 25,
    loop: true,
    roundLengths: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: 'true',
    },
    navigation: {
      nextEl: ".testi4-next",
      prevEl: ".testi4-prev",
    },
    breakpoints: {
      280:{
          slidesPerView: 1,
        navigation: false,
        },
        386:{
          slidesPerView: 1,
          navigation: false,
        },
    576:{
      slidesPerView: 1,
      navigation: false,
    },
    768:{
      slidesPerView: 1,
      navigation: false,
    },
    992:{ 
      slidesPerView: 2
    },
  }
  });

}

// Lifecycle hooks
onMounted(() => {
  // Wait for next tick to ensure DOM is ready
  setTimeout(initSwiper, 100)
  
  // Reinitialize on window resize for better responsiveness
  window.addEventListener('resize', initSwiper)
})

onUnmounted(() => {
  // Cleanup
  if (swiperInstance) {
    swiperInstance.destroy(true, true)
    swiperInstance = null
  }
  window.removeEventListener('resize', initSwiper)
})
</script>

<style scoped>

</style>