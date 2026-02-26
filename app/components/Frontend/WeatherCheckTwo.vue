<template>
  <div class="weather-dashboard mx-md-5 h-100">
    <div v-if="loading" class="d-flex flex-column align-items-center justify-content-center p-5 h-100 bg-white rounded-4 border shadow-sm">
      <div class="spinner-border text-success" role="status"></div>
      <p class="mt-3 text-muted fw-bold small-caps">Synchronizing Met Data...</p>
    </div>

    <div v-else-if="weather" class="weather-card bg-white rounded-4 shadow-sm h-100 d-flex flex-column border-0">
      
      <div class="p-4 mx-md-5 border-bottom bg-white rounded-top-4">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-3">
            <i class="bi bi-wind fs-1 text-success"></i>
            <div>
              <h2 class="mb-0 fw-black text-dark text-uppercase letter-spacing-1">Aviation Briefing</h2>
              <span class="text-muted fs-5 fw-bold">Official Meteorological Report • LASF</span>
            </div>
          </div>
          <div class="text-end">
            <span class="badge-outline-success mb-2 px-4 py-2 fs-4 fw-black text-uppercase">{{ weather.day_name_ar }}</span>
            <div class="text-muted fs-4 font-mono fw-bold">{{ formatDate(weather.forecast_date) }}</div>
          </div>
        </div>
      </div>

      <div class="p-4 mx-md-5 flex-grow-1">
        <div class="situation-container mb-5 shadow-sm p-4 bg-light-subtle rounded-3" dir="rtl">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="dot-indicator bg-success"></div>
            <span class="fw-black fs-2 text-success">الحالة العامة</span>
          </div>
          <p class="situation-text text-dark ps-4">{{ weather.general_situation_ar }}</p>
        </div>

        <div class="row g-4 mb-5 text-center" dir="rtl">
           <div class="col-md-4">
              <div class="aero-card shadow-sm">
                 <label class="large-label">الرياح السطحية</label>
                 <div class="fw-black fs-3 text-dark mt-2">{{ weather.surface_winds_ar || 'N/A' }}</div>
              </div>
           </div>
           <div class="col-md-4">
              <div class="aero-card shadow-sm">
                 <label class="large-label">الانقشاع</label>
                 <div class="fw-black fs-3 text-dark mt-2">{{ weather.visibility_ar || 'N/A' }}</div>
              </div>
           </div>
           <div class="col-md-4">
              <div class="aero-card shadow-sm">
                 <label class="large-label">الرطوبة النسبية</label>
                 <div class="fw-black fs-3 text-dark mt-2">{{ weather.humidity_range }}</div>
              </div>
           </div>
        </div>

        <div class="forecast-timeline mb-5">
          <div class="d-flex align-items-center gap-2 mb-4">
            <i class="bi bi-calendar3 text-muted fs-3"></i>
            <span class="fw-black fs-4 text-muted text-uppercase letter-spacing-2">72-Hour Outlook</span>
          </div>
          <div class="row g-4" dir="rtl">
            <div v-for="i in 3" :key="i" class="col-md-4">
              <div class="timeline-item border-start-success shadow-sm p-4 rounded-4 bg-white">
                <div class="timeline-day text-success fs-3 mb-2 fw-black border-bottom pb-2">{{ getArDay(i, weather.forecast_date) }}</div>
                <p class="timeline-desc text-dark fs-5 lh-base">{{ truncateText(weather.daily_details['day_' + i], 120) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 mb-5 align-items-center">
          <div class="col-md-3">
            <div class="stat-box border-start-success-thick p-3 bg-light shadow-sm">
              <span class="stat-label">Sea State / حالة البحر</span>
              <div class="stat-value fs-4 mt-1 fw-black">{{ weather.sea_state_ar || 'Stable' }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-box border-start-dark-thick p-3 bg-light shadow-sm">
              <span class="stat-label">Pressure / الضغط</span>
              <div class="stat-value fs-4 mt-1 fw-black">{{ weather.pressure_hpa }} hPa</div>
            </div>
          </div>
          <div class="col-md-3 text-center border-end">
             <i class="bi bi-sunrise fs-1 text-warning mb-1"></i>
             <div class="stat-label d-block">Sunrise</div>
             <div class="fw-black fs-3">{{ weather.sunrise }}</div>
          </div>
          <div class="col-md-3 text-center">
             <i class="bi bi-sunset fs-1 text-danger mb-1"></i>
             <div class="stat-label d-block">Sunset</div>
             <div class="fw-black fs-3">{{ weather.sunset }}</div>
          </div>
        </div>

        <div class="row g-4 pb-5">
          <div class="col-lg-7">
            <div class="table-container shadow rounded-4 border overflow-hidden">
              <table class="table table-borderless align-middle mb-0">
                <thead class="bg-black text-white">
                  <tr>
                    <th class="ps-4 py-4 fs-5">Region / المنطقة</th>
                    <th class="text-center fs-5">Location</th>
                    <th class="pe-4 text-end fs-5">Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="temp in weather.regional_temperatures" :key="temp.id" class="border-bottom hover-bg">
                    <td class="ps-4 py-4 fw-black fs-4 text-dark">{{ temp.region_type_ar }}</td>
                    <td class="text-center text-muted fw-black fs-5">{{ temp.city_name_ar }}</td>
                    <td class="pe-4 text-end fw-black fs-3 text-primary">{{ temp.temp_range }}°C</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="table-container shadow rounded-4 border overflow-hidden">
              <table class="table table-sm table-striped align-middle mb-0 text-center">
                <thead class="bg-primary text-white">
                  <tr>
                    <th class="py-4 fs-5">المنطقة</th>
                    <th>٢٤ ساعة</th>
                    <th>المتراكم</th>
                    <th>المعدل</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="stat in weather.precipitation_stats" :key="stat.id" class="border-bottom">
                    <td class="py-4 fw-black fs-4">{{ stat.station_name_ar }}</td>
                    <td class="fs-5 fw-bold">{{ stat.last_24_hours }}</td>
                    <td class="text-primary fw-black fs-4">{{ stat.accumulated_total }}</td>
                    <td class="text-muted fs-5 fw-bold">{{ stat.yearly_average }}</td>
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
import { ref, onMounted } from 'vue'

const config = useRuntimeConfig();
const weather = ref(null);
const loading = ref(true);

const fetchWeather = async () => {
  try {
    // Fetches from the public route you defined: Route::get('/weather-report', [PublicWeatherController::class, 'index']);
    const res = await $fetch(`${config.public.apiBase}/weather-report`);
    if (res.success) {
      weather.value = res.data.report;
    }
  } catch (err) {
    console.error("Met data synchronization failed", err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => date ? date.split('T')[0] : '';

const getArDay = (offset, baseDate) => {
  if (!baseDate) return '';
  const date = new Date(baseDate.split('T')[0]);
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat('ar-LB', { weekday: 'long' }).format(date);
};

const truncateText = (text, length) => {
  if (!text) return 'Detailed data pending...';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

onMounted(fetchWeather);
</script>

<style scoped>
.fw-black { font-weight: 900; }
.letter-spacing-1 { letter-spacing: 1px; }
.letter-spacing-2 { letter-spacing: 2px; }

/* Aerodome Labeling */
.large-label { font-size: 1.1rem; font-weight: 800; color: #198754; text-transform: uppercase; letter-spacing: 1px; display: block; }
.aero-card { padding: 25px; border-radius: 16px; border: 2px solid #f0f0f0; background: #fff; transition: all 0.2s ease-in-out; }
.aero-card:hover { transform: translateY(-5px); border-color: #198754; }

.stat-label { font-size: 0.95rem; font-weight: 800; color: #6c757d; text-transform: uppercase; }

/* Weather Situation Arabic Text */
.situation-container { border-right: 10px solid #198754; padding-right: 20px; }
.situation-text { font-size: 1.6rem; line-height: 1.8; font-weight: 600; color: #09100D !important; }

/* Global Styling & Branding */
.text-primary { color: #198754 !important; }
.bg-primary { background-color: #198754 !important; }
.bg-black { background-color: #09100D; }
.badge-outline-success { border: 3px solid #198754; color: #198754; border-radius: 12px; display: inline-block; font-weight: 900; }
.timeline-item { border-right: 8px solid #198754; background-color: #f8fdfa; }
.border-start-success-thick { border-left: 12px solid #198754; }
.border-start-dark-thick { border-left: 12px solid #09100D; }
.hover-bg:hover { background-color: #f8f9fa; }
</style>