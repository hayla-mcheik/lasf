<script setup lang="ts">
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue';
import LocationCard from '~/components/Frontend/LocationCard.vue';
import LocationsStatus from '~/components/Frontend/LocationsStatus.vue';

</script>

<template>
<Breadcrumbs title="Flying Locations" />
  <div class="locations-page">

    <div class="container py-5">
     <LocationsStatus />
    </div>
  </div>
</template>



<style scoped>
.locations-page {
  background: #f4f7f6;
  min-height: 100vh;
}

.controls-section {
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #198754;
  font-weight: bold;
}

.search-input {
  padding: 12px 15px 12px 45px;
  border: 2px solid #eee;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #198754;
  outline: none;
  box-shadow: 0 0 0 4px rgba(25, 135, 84, 0.1);
}

.custom-select {
  border: 2px solid #eee;
  border-radius: 12px;
  padding: 12px;
  height: auto;
  cursor: pointer;
}

.btn-view {
  border: 2px solid #198754;
  color: #198754;
  background: white;
  padding: 8px 15px;
}

.btn-view.active {
  background: #198754;
  color: white;
}

.pulse-badge {
  animation: badge-pulse 2s infinite;
}

@keyframes badge-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); }
}

@media (max-width: 992px) {
  .display-6 { font-size: 1.8rem; }
}
</style>