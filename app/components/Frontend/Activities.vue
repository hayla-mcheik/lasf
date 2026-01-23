<template>
<div class="trip-category-section overflow-hidden pt-120 pb-120 mt-5">
        <img src="/assets/images/bg/trip-cat-bg.png" class="trip-bg" alt="image">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-10 col-md-12 text-center pt-5">
                    <div class="section-title4 sibling2 pt-5">
                    
                        <h2>Our Activities</h2>
                   
                    </div>
                </div>
            </div>
            <div class="row pb-5 ">
                <div class="col-12">
                    <div class="swiper trip-category-slider">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide">
                                <div class="trip-category-single">
                                    <div class="trip-image">
                                        <img src="/assets/images/bg/trip-img1.png" class="img-fluid" alt="image">
                            
                                    </div>
                                    <div class="trip-content">
                                        <h4><a href="">Loreum ipsum loreum ipsum</a></h4>
                                        <div class="trip-text">
                                            <p>Lorem ipsum loreum ipsu  loreum ipsum.</p>
                                        </div>
                      
                                    </div>
                                </div>
                            </div>
                       <div class="swiper-slide">
                                <div class="trip-category-single">
                                    <div class="trip-image">
                                        <img src="/assets/images/bg/trip-img1.png" class="img-fluid" alt="image">
                                
                                    </div>
                                    <div class="trip-content">
                                        <h4><a href="">Loreum ipsum loreum ipsum</a></h4>
                                        <div class="trip-text">
                                            <p>Lorem ipsum loreum ipsu  loreum ipsum.</p>
                                        </div>
                      
                                    </div>
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="trip-category-single">
                                    <div class="trip-image">
                                        <img src="/assets/images/bg/trip-img1.png" class="img-fluid" alt="image">
                                   
                                    </div>
                                    <div class="trip-content">
                                        <h4><a href="">Loreum ipsum loreum ipsum</a></h4>
                                        <div class="trip-text">
                                            <p>Lorem ipsum loreum ipsu  loreum ipsum.</p>
                                        </div>
                      
                                    </div>
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="trip-category-single">
                                    <div class="trip-image">
                                        <img src="/assets/images/bg/trip-img1.png" class="img-fluid" alt="image">
                                 
                                    </div>
                                    <div class="trip-content">
                                        <h4><a href="">Loreum ipsum loreum ipsum</a></h4>
                                        <div class="trip-text">
                                            <p>Lorem ipsum loreum ipsu  loreum ipsum.</p>
                                        </div>
                      
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="swiper-pagination sibling-4 d-flex align-items-center justify-content-center mt-60"></div>
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
  swiperInstance = new Swiper(".trip-category-slider", {
    slidesPerView: 1,
    speed: 1200,
    spaceBetween: 25,
    loop: true,
    grabCursor: true,
    roundLengths: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    breakpoints: {
      280: {
        slidesPerView: 1,
        spaceBetween: 15,
      },
      576: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 25,
      },
      992: { 
        slidesPerView: 3,
        spaceBetween: 30,
      },
      1200: {
        slidesPerView: 3,
        spaceBetween: 35,
      },
      1400: {
        slidesPerView: 4,
        spaceBetween: 40,
      }
    },
    // Performance optimizations
    preloadImages: false,
    lazy: {
      loadPrevNext: true,
      loadPrevNextAmount: 2,
    },
    watchSlidesProgress: true,
    resistanceRatio: 0.5,
  })
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