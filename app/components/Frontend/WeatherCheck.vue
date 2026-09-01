<template>
  <div class="pilot-professional-suite bg-light min-vh-100 p-3">
    <div class="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
      <div :class="['p-3 px-4 d-flex justify-content-between align-items-center', safetyThemeClass]">
        <div class="d-flex align-items-center">
          <div class="live-pulse me-3"></div>
          <div v-if="weatherData">
            <span class="x-small fw-bold tracking-widest d-block opacity-75">STATION: {{ currentSiteName }}</span>
    <div>
    <span class="fw-black h5 mb-1 d-block">
        {{ safetyStatusLabel }}
    </span>

    <small
        v-if="safetyDescription"
        class="opacity-75 fw-semibold"
    >
        {{ safetyDescription }}
    </small>
</div>
          </div>
          <div v-else class="placeholder-glow">
            <span class="placeholder col-12 bg-light opacity-50" style="width: 150px;"></span>
          </div>
        </div>
        <div class="text-end" v-if="weatherData">
          <div class="x-small fw-bold opacity-75">UPDATED</div>
          <div class="fw-bold">{{ formatTime(weatherData?.dt) }}</div>
        </div>
      </div>

      <div class="card-body bg-white py-4 px-4">
        <div class="row g-4" v-if="weatherData">
          <div class="col-6 col-lg-3 border-end">
            <div class="d-flex align-items-center mb-2">
              <i class="bi bi-wind text-primary me-2"></i>
              <span class="text-muted x-small fw-bold text-uppercase">Wind & Gusts</span>
            </div>
            <h2 class="h2 fw-black mb-0 text-primary">
              {{ currentWindKt }}<span class="fs-5 text-danger" v-if="currentGustKt">/{{ currentGustKt }}</span>
              <small class="fs-6 text-muted ms-1">kt</small>
            </h2>
            <div class="x-small fw-bold text-muted mt-1">{{ currentWindKmh }} km/h</div>
          </div>

          <div class="col-6 col-lg-3 border-end">
            <div class="d-flex align-items-center mb-2">
              <i class="bi bi-compass text-primary me-2"></i>
              <span class="text-muted x-small fw-bold text-uppercase">Direction</span>
            </div>
            <div class="d-flex align-items-center">
              <div class="compass-needle me-2" :style="{ transform: `rotate(${weatherData?.wind.deg}deg)` }">
                <i class="bi bi-arrow-up-circle-fill fs-3 text-dark"></i>
              </div>
              <h2 class="h2 fw-black mb-0">{{ getWindDirection(weatherData?.wind.deg) }}</h2>
            </div>
            <div class="x-small fw-bold text-muted mt-1">{{ weatherData?.wind.deg }}° Magnetic</div>
          </div>

          <div class="col-6 col-lg-3 border-end">
            <div class="d-flex align-items-center mb-2">
              <i class="bi bi-cloud-arrow-up text-primary me-2"></i>
              <span class="text-muted x-small fw-bold text-uppercase">Cloud Base</span>
            </div>
            <h2 class="h2 fw-black mb-0">{{ cloudBaseFt }}<small class="fs-6 text-muted ms-1">ft</small></h2>
            <div class="x-small fw-bold text-muted mt-1">AGL (Approx)</div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="d-flex align-items-center mb-2">
              <i class="bi bi-eye text-primary me-2"></i>
              <span class="text-muted x-small fw-bold text-uppercase">Visibility</span>
            </div>
            <h2 class="h2 fw-black mb-0">{{ (weatherData?.visibility / 1000).toFixed(1) }}<small class="fs-6 text-muted ms-1">km</small></h2>
            <div :class="['x-small fw-bold mt-1', weatherData?.visibility > 5000 ? 'text-success' : 'text-danger']">
              {{ weatherData?.visibility > 5000 ? 'VFR CLEAR' : 'LOW VISIBILITY' }}
            </div>
          </div>
        </div>

        <div v-else class="row g-4">
          <div v-for="i in 4" :key="i" class="col-6 col-lg-3 placeholder-glow">
            <span class="placeholder col-8 mb-2"></span>
            <span class="placeholder col-12 h1"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div class="bg-dark text-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <span class="x-small fw-bold tracking-widest">
          <i class="bi bi-map-fill me-2 text-primary"></i>WINDY.COM INTERACTIVE RADAR
        </span>
        <div class="d-flex gap-2">
          <button v-for="layer in ['wind', 'gust', 'clouds', 'temp']" :key="layer"
                  @click="activeLayer = layer"
                  :class="['btn btn-sm px-3 rounded-pill text-uppercase fw-bold x-small', activeLayer === layer ? 'btn-primary' : 'btn-outline-light border-0']">
            {{ layer }}
          </button>
        </div>
      </div>
      <div class="position-relative bg-secondary" style="height: 500px;">
        <iframe :src="windyUrl" class="w-100 h-100" frameborder="0"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  lat: { type: Number, default: 33.985 },
  lon: { type: Number, default: 35.658 },
  currentSiteName: { type: String, default: 'LASF Site Station' }
})

const API_KEY = '5408a1b07f159206390e3ffcd506319e'
const weatherData = ref(null)
const weatherReport = ref(null)
const activeLayer = ref('wind')
const config = useRuntimeConfig()
let refreshInterval = null

// Calculations (Knots, KMH, Cloud Base)
const currentWindKt = computed(() => weatherData.value ? Math.round((weatherData.value.wind.speed || 0) * 1.94384) : 0)
const currentGustKt = computed(() => {
  if (!weatherData.value?.wind) return 0
  return weatherData.value.wind.gust 
    ? Math.round(weatherData.value.wind.gust * 1.94384) 
    : Math.round(currentWindKt.value * 1.3)
})
const currentWindKmh = computed(() => weatherData.value ? Math.round((weatherData.value.wind.speed || 0) * 3.6) : 0)

const cloudBaseFt = computed(() => {
  if (!weatherData.value) return 0
  const temp = weatherData.value.main.temp
  const humidity = weatherData.value.main.humidity
  const dewPoint = temp - ((100 - humidity) / 5)
  return Math.round((temp - dewPoint) * 400)
})


const safetyStatusLabel = computed(() => {

  if (!weatherReport.value) {
    return 'Loading weather bulletin...'
  }

  return 'WEATHER BULLETIN'
})


const safetyDescription = computed(() => {

  if (!weatherReport.value) {
    return ''
  }

  // LCAA API stores the bulletin text as HTML.
  // We will display it safely as plain text here.
  return stripHtml(
    weatherReport.value.state_en ||
    weatherReport.value.state_ar ||
    ''
  )
})


const safetyThemeClass = computed(() => {

  if (!weatherReport.value) {
    return 'bg-secondary text-white'
  }

  return 'bg-success text-white'
})


const stripHtml = (html) => {

  if (!html) {
    return ''
  }

  const temp = document.createElement('div')
  temp.innerHTML = html

  return temp.textContent
    .replace(/\s+/g, ' ')
    .trim()
}

// Navigation & URL Helpers
const windyUrl = computed(() => {
  return `https://embed.windy.com/embed2.html?lat=${props.lat}&lon=${props.lon}&zoom=11&level=surface&overlay=${activeLayer.value}&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=kt&metricTemp=%C2%B0C`
})

const getWindDirection = (deg) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return directions[Math.round(deg / 45) % 8]
}

const formatTime = (ts) => ts ? new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'

// Data Fetching
const fetchWeatherData = async () => {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${props.lat}&lon=${props.lon}&appid=${API_KEY}&units=metric`)
    if (!res.ok) throw new Error('Network response was not ok')
    weatherData.value = await res.json()
  } catch (err) { 
    console.error('Weather fetch error:', err)
  }
}

const fetchWeatherReport = async () => {

  try {

    const res = await $fetch(
      `${config.public.apiBase}/weather-report`
    )

    console.log('LCAA Weather API:', res)

    if (res?.success && res?.data?.report) {

      weatherReport.value = res.data.report

    } else {

      console.error('Invalid weather report response:', res)

      weatherReport.value = null
    }

  } catch (err) {

    console.error('LCAA weather report fetch error:', err)

    weatherReport.value = null
  }
}
// Lifecycle Hooks
onMounted(async () => {

  await Promise.all([
    fetchWeatherData(),
    fetchWeatherReport()
  ])

  refreshInterval = setInterval(async () => {

    await fetchWeatherData()
    await fetchWeatherReport()

  }, 600000)

})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped>
.pilot-professional-suite { font-family: 'Inter', sans-serif; letter-spacing: -0.01em; }
.fw-black { font-weight: 900; }
.x-small { font-size: 0.65rem; }
.tracking-widest { letter-spacing: 0.15em; }

.live-pulse {
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  animation: pulse-white 2s infinite;
}

@keyframes pulse-white {
  0% { box-shadow: 0 0 0 0px rgba(255, 255, 255, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0px rgba(255, 255, 255, 0); }
}

.compass-needle { transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
iframe { border-radius: 0 0 16px 16px; }
</style>