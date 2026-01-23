<template>
  <div class="pilot-professional-suite bg-light min-vh-100 p-3">
    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">جاري تحميل بيانات الموقع والطقس...</p>
    </div>

    <div v-else-if="location" class="location-content">
      <div class="site-branding mb-4 d-flex justify-content-between align-items-end">
        <div>
          <h1 class="fw-black h3 text-dark mb-1">{{ location.name }}</h1>
          <p class="text-muted small mb-0">
            <i class="bi bi-geo-alt-fill me-1 text-primary"></i> 
            {{ location.region }} | إحداثيات: {{ location.latitude }}, {{ location.longitude }}
          </p>
        </div>
        <div class="d-none d-md-block">
          <span class="badge bg-white text-dark shadow-sm border px-3 py-2 rounded-pill">
            <i class="bi bi-calendar-check me-2"></i>{{ new Date().toLocaleDateString('ar-LB') }}
          </span>
        </div>
      </div>

      <div class="weather-portal shadow-lg rounded-4 overflow-hidden border bg-white mb-4">
        <div v-if="weather" class="safety-header p-4" :class="isSafeToFly ? 'bg-safe' : 'bg-danger-fly'">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div class="d-flex align-items-center">
              <div class="live-indicator me-4">
                <span class="pulse"></span> 
                <span class="fw-bold tracking-wider">LIVE DATA</span>
              </div>
              <div class="metric-group me-4 border-end pe-4 text-center">
                <h2 class="h1 fw-black mb-0">{{ windKt }} <small class="fs-6">kt</small></h2>
                <span class="x-small text-uppercase fw-bold opacity-75">Wind Speed</span>
              </div>
              <div class="metric-group text-center border-end pe-4 me-4">
                <h2 class="h1 fw-black mb-0">{{ windGustKt }} <small class="fs-6 text-danger">kt</small></h2>
                <span class="x-small text-uppercase fw-bold opacity-75">Gusts</span>
              </div>
              <div class="metric-group text-center">
                <h2 class="h1 fw-black mb-0">{{ Math.round(weather.main.temp) }}°</h2>
                <span class="x-small text-uppercase fw-bold opacity-75">Temp</span>
              </div>
            </div>

            <div class="text-end d-none d-lg-block">
              <div class="status-pill-large">
                <i class="bi" :class="isSafeToFly ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                {{ isSafeToFly ? 'RECOMMENDED' : 'DANGEROUS CONDITIONS' }}
              </div>
              <div class="text-muted x-small mt-1">Real-time Safety Assessment</div>
            </div>
          </div>
        </div>

        <div class="windy-container position-relative">
          <iframe class="windy-frame" :src="windyUrl" frameborder="0"></iframe>
          
          <div class="map-controls p-3 position-absolute bottom-0 start-0 w-100 d-flex justify-content-between align-items-end">
            <div class="glass-pill px-3 py-2 fw-bold small">
              <i class="bi bi-compass me-2"></i>{{ windDirection }} ({{ weather?.wind.deg }}°)
            </div>
            <div class="d-flex gap-2">
              <button v-for="l in ['wind', 'gust', 'clouds', 'temp']" :key="l" 
                      @click="activeLayer = l" 
                      :class="['btn-blur', activeLayer === l ? 'active' : '']">
                {{ l.toUpperCase() }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 class="fw-bold mb-3"><i class="bi bi-info-circle me-2 text-primary"></i>Pilot Briefing & Description</h5>
            <div class="text-secondary lh-lg" v-html="location.description || 'لا يوجد ملاحظات إضافية لهذا الموقع حالياً.'"></div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100 bg-dark text-white">
            <h5 class="fw-bold mb-3"><i class="bi bi-shield-lock me-2 text-primary"></i>Aviation Details</h5>
            <div class="d-flex justify-content-between py-2 border-bottom border-secondary">
              <span class="small opacity-75">Cloud Base (Est.)</span>
              <span class="fw-bold">{{ cloudBaseFt }} ft</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom border-secondary">
              <span class="small opacity-75">Pressure</span>
              <span class="fw-bold">{{ weather?.main.pressure }} hPa</span>
            </div>
            <div class="d-flex justify-content-between py-2">
              <span class="small opacity-75">VFR Visibility</span>
              <span class="fw-bold">{{ (weather?.visibility / 1000).toFixed(1) }} km</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-danger rounded-4 p-5 text-center shadow">
      <i class="bi bi-exclamation-triangle fs-1 d-block mb-3"></i>
      <h4>عذراً، لم يتم العثور على هذا الموقع</h4>
      <p>تأكد من الرابط أو تواصل مع إدارة LASF</p>
      <NuxtLink to="/admin/locations" class="btn btn-outline-danger mt-3 px-4 rounded-pill">العودة للمواقع</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const config = useRuntimeConfig()
const authStore = useAuthStore()

const activeLayer = ref('wind')
const API_KEY = '5408a1b07f159206390e3ffcd506319e'

// 1. استخدام useAsyncData لجلب بيانات الموقع من Laravel باستخدام الـ Slug
const { data: locationResponse, pending, error } = await useAsyncData(
  `location-${route.params.slug}`,
  () => $fetch(`${config.public.apiBase}/admin/flying-locations/${route.params.slug}`, {
    headers: { 'Authorization': `Bearer ${authStore.token}` }
  })
)

const location = computed(() => locationResponse.value?.data)

// 2. استخدام useAsyncData لجلب بيانات الطقس بناءً على إحداثيات الموقع المجلوب
const { data: weather } = await useAsyncData(
  `weather-${route.params.slug}`,
  async () => {
    if (!location.value) return null
    return await $fetch(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat: location.value.latitude,
        lon: location.value.longitude,
        appid: API_KEY,
        units: 'metric'
      }
    })
  },
  { watch: [location] } // انتظر تحميل الموقع أولاً
)

// 3. الحسابات الاحترافية للطيار
const windKt = computed(() => Math.round((weather.value?.wind.speed || 0) * 1.94384))
const windGustKt = computed(() => weather.value?.wind.gust ? Math.round(weather.value.wind.gust * 1.94384) : Math.round(windKt.value * 1.3))
const isSafeToFly = computed(() => windKt.value < 15 && windGustKt.value < 22)

const cloudBaseFt = computed(() => {
  if (!weather.value) return 0
  const temp = weather.value.main.temp
  const humidity = weather.value.main.humidity
  const dewPoint = temp - ((100 - humidity) / 5)
  return Math.round((temp - dewPoint) * 400)
})

const windDirection = computed(() => {
  const deg = weather.value?.wind.deg || 0
  const sectors = ["شمال", "شمال شرقي", "شرق", "جنوب شرقي", "جنوب", "جنوب غربي", "غرب", "شمال غربي"]
  return sectors[Math.round(deg / 45) % 8]
})

const windyUrl = computed(() => {
  if (!location.value) return ''
  return `https://embed.windy.com/embed2.html?lat=${location.value.latitude}&lon=${location.value.longitude}&zoom=11&level=surface&overlay=${activeLayer.value}&product=ecmwf&menu=&message=&marker=true&metricWind=kt&metricTemp=%C2%B0C`
})

// تحسين الـ SEO الخاص بالصفحة
useHead({
  title: location.value ? `LASF | ${location.value.name} Weather` : 'Aviation Weather',
  meta: [
    { name: 'description', content: `Live aviation weather and wind forecast for ${location.value?.name} in ${location.value?.region}, Lebanon.` }
  ]
})
</script>

<style scoped>
.fw-black { font-weight: 900; }
.x-small { font-size: 0.65rem; letter-spacing: 0.05rem; }

/* الثيمات الخاصة بالأمان */
.bg-safe { background: #f0fdf4; color: #166534; border-bottom: 5px solid #22c55e; }
.bg-danger-fly { background: #fef2f2; color: #991b1b; border-bottom: 5px solid #ef4444; }

.status-pill-large { background: white; padding: 10px 25px; border-radius: 50px; font-weight: 800; font-size: 0.85rem; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }

.pulse { width: 12px; height: 12px; background: currentColor; border-radius: 50%; display: inline-block; margin-right: 10px; animation: pulse-kf 2s infinite; }
@keyframes pulse-kf { 0% { transform: scale(0.9); opacity: 1; } 70% { transform: scale(1.8); opacity: 0; } 100% { transform: scale(0.9); opacity: 0; } }

.windy-frame { width: 100%; height: 500px; }

.btn-blur { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(10px); color: white; border: none; padding: 8px 20px; border-radius: 50px; font-weight: 700; font-size: 0.8rem; transition: all 0.3s; }
.btn-blur.active { background: #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }

.glass-pill { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(5px); border-radius: 14px; border: 1px solid rgba(0,0,0,0.05); }
</style>