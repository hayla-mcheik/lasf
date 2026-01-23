<template>
    <div>
    <div class=""> 
   
        <div class="cloud-icon2">
            <img src="assets/images/icons/cloud2.svg" alt="image">
        </div>
        <div class="row">
            <div class="col-md-6">
                    <div class="">
      <WeatherCheck />
    </div>
   
            </div>
<div class="col-md-6">
  <div class="clearance-news-section py-4 h-100 p-3">
    <div class="section-header mb-4 d-flex justify-content-between align-items-end">
      <div>
        <h2 class="fight-news-title h4 fw-bold mb-1">Flight Notices</h2>
        <p class="fight-news-p small text-muted mb-0">Official updates for pilots in Lebanon</p>
      </div>
      <NuxtLink to="/clearance-news" class="small fw-bold text-decoration-none">
        VIEW ALL <i class="bi bi-arrow-right"></i>
      </NuxtLink>
    </div>

    <div class="news-list-container shadow-sm border rounded-4 bg-white" style=" overflow-y: auto;">
      <FlightClearanceNews />
    </div>
  </div>
</div>
        </div>


    </div>
    </div>
</template>

<script setup>
import FlightClearanceNews from './FlightClearanceNews.vue';
import WeatherCheck from './WeatherCheck.vue';


</script>

<style  scoped>
    .fight-news-title{
        font-size: 2rem;
    }
    .fight-news-p{
        font-size: 1.6rem;
    }

</style>