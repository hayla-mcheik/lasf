<template>
  <div class="weather-dashboard mx-md-5 h-100">
    <div v-if="loading" class="d-flex flex-column align-items-center justify-content-center p-5 h-100 bg-white rounded-4 border">
      <div class="spinner-border text-success" role="status"></div>
      <p class="mt-3 text-muted fw-bold small-caps">Synchronizing Met Data...</p>
    </div>

    <div v-else-if="weather" class="weather-card bg-white rounded-4 shadow-sm h-100 d-flex flex-column border-0">
      
      <div class="p-4 mx-md-5 border-bottom bg-white rounded-top-4">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-3">
            <i class="bi bi-wind fs-2 text-success"></i>
            <div>
              <h3 class="mb-0 fw-black text-dark text-uppercase letter-spacing-1">Aviation Briefing</h3>
              <span class="text-muted fs-6 fw-bold">Official Meteorological Report • LASF</span>
            </div>
          </div>
          <div class="text-end">
            <span class="badge-outline-success mb-2 px-3 py-2 fs-5">{{ weather.day_name_ar }}</span>
            <div class="text-muted fs-5 font-mono fw-bold">{{ formatDate(weather.forecast_date) }}</div>
          </div>
        </div>
      </div>

      <div class="p-4 mx-md-5 flex-grow-1">
        <div class="situation-container mb-5" dir="rtl">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="dot-indicator bg-success"></div>
            <span class="fw-black fs-4 text-success">الحالة العامة</span>
          </div>
          <p class="situation-text text-dark ps-4">{{ weather.general_situation_ar }}</p>
        </div>

        <div class="row g-4 mb-5" dir="rtl">
           <div class="col-md-4">
              <div class="aero-card">
                 <label class="small-label">الرياح السطحية</label>
                 <div class="fw-bold fs-5">{{ weather.surface_winds_ar || 'N/A' }}</div>
              </div>
           </div>
           <div class="col-md-4">
              <div class="aero-card">
                 <label class="small-label">الانقشاع</label>
                 <div class="fw-bold fs-5">{{ weather.visibility_ar || 'N/A' }}</div>
              </div>
           </div>
           <div class="col-md-4">
              <div class="aero-card">
                 <label class="small-label">الرطوبة النسبية</label>
                 <div class="fw-bold fs-5">{{ weather.humidity_range || 'N/A' }}</div>
              </div>
           </div>
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
                <p class="timeline-desc text-dark fs-5 lh-base">{{ truncateText(weather.daily_details['day_' + i], 100) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 mb-5 align-items-center">
          <div class="col-md-3">
            <div class="stat-box border-start-success-thick p-3 bg-light">
              <span class="stat-label">Sea State / حالة البحر</span>
              <div class="stat-value fs-4 mt-1">{{ weather.sea_state_ar || 'Stable' }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-box border-start-dark-thick p-3 bg-light">
              <span class="stat-label">Pressure / الضغط</span>
              <div class="stat-value fs-4 mt-1">{{ weather.pressure_hpa }} hPa</div>
            </div>
          </div>
          <div class="col-md-3 text-center">
             <i class="bi bi-sunrise fs-2 text-warning"></i>
             <div class="stat-label">Sunrise</div>
             <div class="fw-black fs-4">{{ weather.sunrise }}</div>
          </div>
          <div class="col-md-3 text-center">
             <i class="bi bi-sunset fs-2 text-danger"></i>
             <div class="stat-label">Sunset</div>
             <div class="fw-black fs-4">{{ weather.sunset }}</div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <div class="table-container shadow-sm rounded-4 border overflow-hidden">
              <table class="table table-borderless align-middle mb-0">
                <thead class="bg-black text-white">
                  <tr>
                    <th class="ps-4 py-3">Region / المنطقة</th>
                    <th class="text-center">Location</th>
                    <th class="pe-4 text-end">Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="temp in weather.regional_temperatures" :key="temp.id" class="border-bottom">
                    <td class="ps-4 py-3 fw-black fs-5 text-dark">{{ temp.region_type_ar }}</td>
                    <td class="text-center text-muted fw-bold">{{ temp.city_name_ar }}</td>
                    <td class="pe-4 text-end fw-black fs-4 text-dark">{{ temp.temp_range }}°C</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="table-container shadow-sm rounded-4 border overflow-hidden">
              <table class="table table-sm table-striped align-middle mb-0 text-center">
                <thead class="bg-primary text-white">
                  <tr>
                    <th class="py-3">المنطقة</th>
                    <th>٢٤ ساعة</th>
                    <th>المتراكم</th>
                    <th>المعدل</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="stat in weather.precipitation_stats" :key="stat.id" class="border-bottom">
                    <td class="py-3 fw-bold">{{ stat.station_name_ar }}</td>
                    <td>{{ stat.last_24_hours }}</td>
                    <td class="text-primary fw-black">{{ stat.accumulated_total }}</td>
                    <td class="text-muted">{{ stat.yearly_average }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
    console.error("Fetch failed", err);
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
const truncateText = (text, length) => text && text.length > length ? text.substring(0, length) + '...' : text;

onMounted(fetchWeather);
</script>

<style scoped>
/* High-Visibility Typography */
.fw-black { font-weight: 900; }
.large-label { font-size: 1.1rem; font-weight: 800; color: #198754; text-transform: uppercase; letter-spacing: 1px; display: block; }
.aero-card { padding: 25px; border-radius: 16px; border: 2px solid #f0f0f0; background: #fff; transition: transform 0.2s; }
.aero-card:hover { transform: translateY(-5px); border-color: #198754; }
.stat-label { font-size: 0.9rem; font-weight: 800; color: #6c757d;}
.timeline-item { border-right: 8px solid #198754; background-color: #f8fdfa; }
.situation-text { font-size: 1.5rem; line-height: 1.8; font-weight: 600; color: #09100D
 !important; }
 .text-primary{
  color: #198754 !important;
 }
.hover-bg:hover { background-color: #f8f9fa; }
.letter-spacing-2 { letter-spacing: 2px; }
.text-success { color: #198754 !important; }
.bg-primary { background-color: #198754 !important; }

/* Modal specific badge */
.badge-outline-success { border: 3px solid #198754; color: #198754; border-radius: 12px; display: inline-block; }

.situation-container { border-right: 10px solid #198754; }
.dot-indicator { width: 18px; height: 18px; border-radius: 50%; }

.border-start-success-thick { border-left: 12px solid #198754; }
.border-start-dark-thick { border-left: 12px solid #09100D
; }
.bg-black{
  background-color: #09100D;
}
</style>