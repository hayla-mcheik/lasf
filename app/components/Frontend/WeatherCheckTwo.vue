<template>
  <div class="weather-dashboard h-100 ">
    <div v-if="loading" class="d-flex flex-column align-items-center justify-content-center p-5 h-100 bg-white rounded-4 border">
      <div class="spinner-border text-success" role="status"></div>
      <p class="mt-3 text-muted fw-bold small-caps">Synchronizing Met Data...</p>
    </div>

    <div v-else-if="weather" class="weather-card bg-white rounded-4 shadow-sm h-100 d-flex flex-column border-0">
      
      <div class="p-4 border-bottom bg-white rounded-top-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <div class="d-flex align-items-center gap-3">
              <i class="bi bi-wind fs-2 text-success"></i>
              <div>
                <h3 class="mb-0 fw-black text-dark text-uppercase letter-spacing-1">Aviation Briefing</h3>
                <span class="text-muted fs-6 fw-bold">Official Meteorological Report • LASF</span>
              </div>
            </div>
          </div>
          <div class="text-end">
            <span class="badge-outline-success mb-2 px-3 py-2 fs-5">{{ weather.day_name_ar }}</span>
            <div class="text-muted fs-5 font-mono fw-bold">{{ formatDate(weather.forecast_date) }}</div>
          </div>
        </div>
      </div>

      <div class="p-4 flex-grow-1">
        <div class="situation-container mb-5" dir="rtl">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="dot-indicator bg-success"></div>
            <span class="fw-black fs-4 text-success">الحالة العامة</span>
          </div>
          <p class="situation-text text-dark ps-4">{{ weather.general_situation_ar }}</p>
        </div>

        <div class="forecast-timeline mb-5">
          <div class="d-flex align-items-center gap-2 mb-4">
            <i class="bi bi-calendar3 text-muted fs-4"></i>
            <span class="fw-black fs-5 text-muted text-uppercase letter-spacing-2">72-Hour Outlook</span>
          </div>
          <div class="row g-4" dir="rtl">
            <div v-for="i in 3" :key="i" class="col-md-4">
              <div class="timeline-item border-start-success shadow-sm p-3 rounded-3 bg-light-subtle">
                <div class="timeline-day text-success fs-4 mb-2 fw-black">{{ getArDay(i, weather.forecast_date) }}</div>
                <p class="timeline-desc text-dark fs-5 lh-base">{{ truncateText(weather.daily_details['day_' + i], 80) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 mb-5">
          <div class="col-md-6">
            <div class="stat-box border-start-success-thick p-3 bg-light">
              <span class="stat-label fs-6">Sea State / حالة البحر</span>
              <div class="stat-value fs-2 mt-1" :class="weather.sea_state_ar?.includes('هائج') ? 'text-danger' : 'text-dark'">
                {{ weather.sea_state_ar || 'Stable' }}
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="stat-box border-start-dark-thick p-3 bg-light">
              <span class="stat-label fs-6">Pressure / الضغط الجوي</span>
              <div class="stat-value fs-2 text-dark mt-1">
                {{ weather.pressure_hpa }} <span class="fs-4 fw-normal text-muted">hPa</span>
              </div>
            </div>
          </div>
        </div>

        <div class="table-container shadow-sm rounded-4 border overflow-hidden">
          <table class="table table-borderless table-striped align-middle mb-0">
            <thead>
              <tr class="bg-dark text-white">
                <th class="ps-4 py-3 fs-5 fw-bold text-uppercase">Region / المنطقة</th>
                <th class="py-3 fs-5 fw-bold text-uppercase text-center">Location / الموقع</th>
                <th class="pe-4 py-3 fs-5 fw-bold text-uppercase text-end">Range / الحرارة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="temp in weather.regional_temperatures" :key="temp.id" class="border-bottom">
                <td class="ps-4 py-3 fw-black fs-4 text-dark">{{ temp.region_type_ar }}</td>
                <td class="py-3 fs-4 text-center text-muted fw-bold">{{ temp.city_name_ar }}</td>
                <td class="pe-4 py-3 text-end">
                  <span class="fw-black fs-3 text-dark">{{ temp.temp_range }}°C</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const weather = ref(null);
const loading = ref(true);

const fetchWeather = async () => {
  try {
    const res = await $fetch(`${config.public.apiBase}/weather-report`);
    if (res.success) weather.value = res.data.report;
  } catch (err) {
    console.error("Weather fetch failed", err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => date ? date.split('T')[0] : '';

const getArDay = (offset, baseDate) => {
  const date = new Date(baseDate.split('T')[0]);
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat('ar-LB', { weekday: 'long' }).format(date);
};

const truncateText = (text, length) => {
  if (!text) return 'No data available';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

onMounted(fetchWeather);
</script>

<style scoped>
/* TYPOGRAPHY */
.fw-black { font-weight: 900; }
.letter-spacing-1 { letter-spacing: 1px; }
.letter-spacing-2 { letter-spacing: 2px; }
.font-mono { font-family: 'Roboto Mono', monospace; }
.text-success { color: #198754 !important; }
.text-danger { color: #dc3545 !important; }
.bg-success { background-color: #198754 !important; }
.weather-dashboard{
  padding-left: 5%;
  padding-right: 5%;
  padding-top: 2%;
  padding-bottom: 2%;
}
/* CONTAINER */
.weather-card { border: 1px solid #eef0f2 !important; }
.badge-outline-success { 
  border: 2px solid #198754; 
  color: #198754; 
  border-radius: 8px; 
  font-weight: 900; 
  display: inline-block;
}

/* ARABIC SITUATION */
.situation-container { border-right: 6px solid #198754; padding-right: 25px; }
.dot-indicator { width: 14px; height: 14px; border-radius: 50%; }
.situation-text { 
  font-size: 1.4rem; 
  line-height: 1.8; 
  font-weight: 600;
  color: #1a1a1a !important;
}

/* TIMELINE */
.timeline-item { 
  border-right: 4px solid #198754; 
  background-color: #f8fdfa; 
}
.timeline-day { letter-spacing: -0.5px; }
.timeline-desc { color: #333 !important; }

/* STATS */
.border-start-success-thick { border-left: 8px solid #198754; }
.border-start-dark-thick { border-left: 8px solid #212529; }
.stat-label { font-weight: 800; color: #6c757d;  }
.stat-value { font-weight: 900; letter-spacing: -1px; }

/* TABLE */
.table th { letter-spacing: 1px; }
.bg-light-subtle { background-color: #fcfcfc; }
</style>