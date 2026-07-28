<!-- pages/index.vue -->
<template>
  <div class="homepage">
    <!-- Animated Hero with Parallax -->
    <HeroSlider />
   
   <section>
    <div>
      <WeatherCheckTwo />
    </div>
   </section>
    <!-- Flying Locations Dashboard -->
    <section class="locations-dashboard py-6 bg-gradient">
      <div class="container">
        <div class="row align-items-center mb-6" >
          <div class="col-lg-8">
            <h2 class="display-5 fw-bold text-white mb-3">
              <i class="bi bi-map-fill me-3"></i>
              Flying Locations Status
            </h2>
            <p class="text-white-25">Interactive dashboard showing real-time clearance across Lebanon</p>
          </div>
  
        </div>

        <!-- Enhanced Status Summary -->
     <LocationsStatus  />
      </div>
    </section>

    <section class="py-6">
      <Pilot />
    </section>
    
<Testimonials />

<!-- Feedback & Complaints CTA -->
<section class="feedback-section py-6">
  <div class="container">
    <div class="feedback-card">

      <div class="row align-items-center">

        <div class="col-lg-8">

          <div class="d-flex align-items-center mb-3">
            <div class="feedback-icon me-3">
              <i class="bi bi-shield-exclamation"></i>
            </div>

            <div>
              <h2 class="mb-1">Help Us Keep Flying Safe</h2>
              <p class="mb-0 text-muted">
                Your feedback helps improve safety, regulations and the flying
                experience across Lebanon.
              </p>
            </div>
          </div>

          <div class="row mt-4">

            <div class="col-md-6 mb-3">

              <div class="feature-box">

                <i class="bi bi-chat-left-text text-primary"></i>

                <div>
                  <h6>General Feedback</h6>
                  <small>
                    Share ideas or suggestions to improve LASF services.
                  </small>
                </div>

              </div>

            </div>

            <div class="col-md-6 mb-3">

              <div class="feature-box">

                <i class="bi bi-exclamation-triangle text-warning"></i>

                <div>
                  <h6>Report Violations</h6>
                  <small>
                    Report unsafe flying or incidents anonymously.
                  </small>
                </div>

              </div>

            </div>

          </div>

        </div>

        <div class="col-lg-4 text-center">

          <NuxtLink
            to="/feedback"
            class="btn btn-danger btn-lg px-5">

            <i class="bi bi-send-fill me-2"></i>

            Send Anonymous Report

          </NuxtLink>

          <p class="small text-muted mt-3 mb-0">
            No registration required • Completely anonymous
          </p>

        </div>

      </div>

    </div>
  </div>
</section>

  </div>
</template>

<script setup>
import HeroSlider from '~/components/Frontend/HeroSlider.vue'
import Destination from '~/components/Frontend/Destination.vue'
import Activities from '~/components/Frontend/Activities.vue'
import Pilot from '~/components/Frontend/Pilot.vue'
import Testimonials from '~/components/Frontend/Testimonials.vue'
import FlightClearanceNews from '~/components/Frontend/FlightClearanceNews.vue'
import LocationsStatus from '~/components/Frontend/LocationsStatus.vue'
import WhyChooseUse from '~/components/Frontend/WhyChooseUse.vue'
import WeatherCheck from '~/components/Frontend/WeatherCheck.vue'
import WeatherCheckTwo from '~/components/Frontend/WeatherCheckTwo.vue'
</script>

<style scoped>
.homepage {
  overflow-x: hidden;
}

.clearance-news-section {
  position: relative;
  padding: 10px;
}

.locations-dashboard {
  position: relative;
  overflow: hidden;
}

.map-header h4{
  color:white;
}

.qr-showcase {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}



.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.qr-presentation {
  background: white;
  position: relative;
  overflow: hidden;
}

.qr-presentation::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(transparent, #667eea, transparent 30%);
  animation: rotate 4s linear infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

.qr-display {
  position: relative;
  width: 200px;
  height: 200px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.qr-pattern {
  width: 100%;
  height: 100%;
  background: 
    repeating-linear-gradient(0deg, #000, #000 15px, transparent 15px, transparent 30px),
    repeating-linear-gradient(90deg, #000, #000 15px, transparent 15px, transparent 30px);
}

.qr-scan-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  animation: scan 2s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% {
    top: 0;
  }
  50% {
    top: 100%;
  }
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.step-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.step-arrow {
  align-self: center;
  color: #6c757d;
  font-size: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}


/* Responsive */
@media (max-width: 768px) {
  .display-5 {
    font-size: 2.5rem;
  }
  
  .step-arrow {
    transform: rotate(90deg);
  }
  
  .features-list .feature-item {
    flex-direction: column;
    text-align: center;
  }
}
.feedback-section{
    background:#f8fafc;
}

.feedback-card{
    background:#fff;
    border-radius:20px;
    padding:50px;
    box-shadow:0 10px 35px rgba(0,0,0,.08);
}

.feedback-icon{
    width:70px;
    height:70px;
    border-radius:50%;
    background:#dc3545;
    color:#fff;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:2rem;
}

.feature-box{
    display:flex;
    gap:15px;
    align-items:flex-start;
    padding:15px;
    border-radius:12px;
    background:#f8f9fa;
    height:100%;
}

.feature-box i{
    font-size:1.8rem;
}

.feature-box h6{
    margin-bottom:5px;
    font-weight:700;
}

.feedback-card .btn{
    border-radius:50px;
    padding:14px 30px;
}

@media(max-width:991px){

    .feedback-card{
        padding:30px;
    }

    .feedback-card .btn{
        margin-top:25px;
        width:100%;
    }

}
</style>