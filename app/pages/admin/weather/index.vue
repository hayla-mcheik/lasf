<template>
  <div class="weather-admin container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold text-dark">Weather Forecast Management</h3>
      <button class="btn btn-primary shadow-sm px-4" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i> Add New Report
      </button>
    </div>

    <div class="card shadow-sm border-0 rounded-3">
      <div class="card-body p-0">
        <div v-if="loading && !forecasts.length" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted fw-medium">Loading historical data...</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-muted small text-uppercase fw-bold">
              <tr>
                <th class="ps-4 py-3">Forecast Date</th>
                <th>Main Day (Arabic)</th>
                <th>Sea State</th>
                <th class="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="forecast in forecasts" :key="forecast.id">
                <td class="ps-4 fw-bold text-primary">{{ forecast.forecast_date.split('T')[0] }}</td>
                <td><span class="badge bg-secondary-subtle text-secondary px-3">{{ forecast.day_name_ar }}</span></td>
                <td class="text-muted small">{{ forecast.sea_state_ar || 'Not Specified' }}</td>
                <td class="text-center pe-4">
                  <div class="btn-group shadow-sm border rounded">
                    <button class="btn btn-sm btn-white text-info border-end" @click="openModal(forecast)" title="Edit">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-white text-danger" @click="deleteReport(forecast.id)" title="Delete">
                      <i class="bi bi-trash3-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop-custom" @click.self="showModal = false">
        <div class="modal-dialog-custom shadow-lg animate-pop">
          <div class="modal-header-custom bg-primary shadow-sm">
            <div class="d-flex align-items-center">
               <i class="bi bi-cloud-sun-fill me-2 fs-4 text-white"></i>
               <h5 class="mb-0 fw-bold text-white">
                 {{ isEditing ? 'Edit Aviation Briefing' : 'Create New Forecast' }}
               </h5>
            </div>
            <button class="btn-close btn-close-white" @click="showModal = false"></button>
          </div>

          <div class="modal-body-custom p-4 bg-light-subtle">
            <form @submit.prevent="saveReport">
              <div class="row g-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-uppercase tracking-wider">Starting Date</label>
                  <input v-model="form.forecast_date" type="date" class="form-control form-control-lg border-2" @change="updateDayLabels" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-uppercase tracking-wider text-muted">Day Name (Arabic)</label>
                  <input v-model="form.day_name_ar" type="text" class="form-control form-control-lg bg-light border-0 fw-bold text-primary" readonly />
                </div>
                
                <div class="col-12">
                  <label class="form-label fw-bold small text-uppercase tracking-wider">General Situation (الحالة العامة)</label>
                  <textarea v-model="form.general_situation_ar" class="form-control border-2 shadow-sm" rows="2" placeholder="Describe the overall weather pattern..."></textarea>
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-bold small text-primary">Surface Winds (الرياح السطحية)</label>
                  <input v-model="form.surface_winds_ar" type="text" class="form-control border-primary-subtle" placeholder="e.g., جنوبية غربية..." />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold small text-primary">Visibility (الانقشاع)</label>
                  <input v-model="form.visibility_ar" type="text" class="form-control border-primary-subtle" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold small text-primary">Humidity (الرطوبة النسبية)</label>
                  <input v-model="form.humidity_range" type="text" class="form-control border-primary-subtle" placeholder="e.g., 60-85%" />
                </div>

                <div class="col-12">
                  <label class="form-label fw-bold small text-uppercase tracking-wider">Primary Day Details (التفاصيل اليومية)</label>
                  <textarea v-model="form.daily_description_ar" class="form-control shadow-sm" rows="2"></textarea>
                </div>

                <div class="col-12 mt-4">
                  <div class="p-4 bg-white rounded-4 border border-primary shadow-sm border-opacity-25">
                    <h6 class="fw-black text-primary mb-4 d-flex align-items-center">
                      <i class="bi bi-calendar3 me-2 fs-5"></i> 72-HOUR EXTENDED OUTLOOK
                    </h6>
                    <div class="row g-3">
                      <div v-for="i in 3" :key="i" class="col-md-4">
                        <div class="p-3 rounded bg-light border-start border-4 border-primary">
                           <label class="small fw-black text-primary mb-2 d-block text-uppercase">{{ getNextDayLabel(i) }}</label>
                           <textarea v-model="form.daily_details['day_' + i]" class="form-control form-control-sm border-0 bg-transparent" rows="4" placeholder="Extended details..."></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-4 mt-3">
                  <label class="form-label fw-bold small">Sea State (حالة البحر)</label>
                  <input v-model="form.sea_state_ar" type="text" class="form-control border-warning-subtle shadow-sm" />
                </div>
                <div class="col-md-4 mt-3">
                  <label class="form-label fw-bold small">Pressure (hPa)</label>
                  <input v-model="form.pressure_hpa" type="text" class="form-control shadow-sm" />
                </div>
                <div class="col-md-4 mt-3">
                  <label class="form-label fw-bold small">Water Temp (حرارة الماء)</label>
                  <input v-model="form.water_temp_ar" type="text" class="form-control shadow-sm" />
                </div>

                <div class="col-12 mt-5">
                  <div class="p-4 bg-white border rounded-4 shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                      <h6 class="fw-black mb-0 text-dark">
                        <i class="bi bi-droplets-fill me-2 text-info"></i>RAINFALL STATISTICS (كمية المتساقطات)
                      </h6>
                      <button type="button" class="btn btn-sm btn-outline-primary fw-bold" @click="addPrecipitationRow">
                        <i class="bi bi-plus-circle me-1"></i> Add Station
                      </button>
                    </div>
                    
                    <div v-for="(stat, index) in form.precipitation" :key="index" class="row g-2 mb-4 align-items-end p-2 border rounded-3 bg-light-subtle">
                      <div class="col-md-3">
                        <label class="extra-small-label fw-bold text-muted mb-1 d-block">Station / المنطقة</label>
                        <input v-model="stat.station_name_ar" class="form-control form-control-sm fw-bold border-2" placeholder="e.g., بيروت" />
                      </div>
                      <div class="col-md-2">
                        <label class="extra-small-label text-muted mb-1 d-block">24h / ٢٤ ساعة</label>
                        <input v-model="stat.last_24_hours" class="form-control form-control-sm border-2 text-center" />
                      </div>
                      <div class="col-md-2">
                        <label class="extra-small-label text-muted mb-1 d-block">Total / المتراكم</label>
                        <input v-model="stat.accumulated_total" class="form-control form-control-sm border-2 text-center fw-bold text-primary" />
                      </div>
                      <div class="col-md-2">
                        <label class="extra-small-label text-muted mb-1 d-block">Last Yr / السنة الماضية</label>
                        <input v-model="stat.previous_year_total" class="form-control form-control-sm border-2 text-center" />
                      </div>
                      <div class="col-md-2">
                        <label class="extra-small-label text-muted mb-1 d-block">Avg / المعدل</label>
                        <input v-model="stat.yearly_average" class="form-control form-control-sm border-2 text-center" />
                      </div>
                      <div class="col-md-1 text-end">
                        <button type="button" class="btn text-danger p-0" @click="form.precipitation.splice(index, 1)" title="Remove Station">
                          <i class="bi bi-x-square-fill fs-4"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12 mt-4">
                  <div class="p-4 bg-white border rounded-4 shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="fw-black mb-0"><i class="bi bi-thermometer-half me-2 text-danger"></i>REGIONAL TEMPERATURES</h6>
                      <button type="button" class="btn btn-sm btn-outline-danger fw-bold" @click="addTempRow">+ Add Region</button>
                    </div>
                    <div v-for="(temp, index) in form.temperatures" :key="index" class="row g-2 mb-2 p-2 rounded bg-light align-items-center">
                      <div class="col-md-4"><input v-model="temp.region_type_ar" class="form-control form-control-sm" placeholder="Region (الساحل)" /></div>
                      <div class="col-md-4"><input v-model="temp.city_name_ar" class="form-control form-control-sm" placeholder="City (بيروت)" /></div>
                      <div class="col-md-3"><input v-model="temp.temp_range" class="form-control form-control-sm fw-bold" placeholder="Range (19/12)" /></div>
                      <div class="col-md-1 text-end">
                        <button type="button" class="btn text-danger" @click="form.temperatures.splice(index, 1)"><i class="bi bi-trash3-fill"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer-custom mt-5 pt-3 border-top d-flex justify-content-end gap-3">
                <button type="button" class="btn btn-outline-secondary px-5 py-2 fw-bold" @click="showModal = false">Discard Changes</button>
                <button type="submit" class="btn btn-primary px-5 py-2 fw-bold shadow" :disabled="loading">
                   <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                   {{ isEditing ? 'Update Forecast Report' : 'Publish Report to LASF' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin' })
const authStore = useAuthStore()
const config = useRuntimeConfig()

const forecasts = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const loading = ref(false)

const form = ref({
  id: null, forecast_date: '', day_name_ar: '', general_situation_ar: '',
  daily_description_ar: '', sea_state_ar: '', pressure_hpa: '', water_temp_ar: '',
  surface_winds_ar: '', visibility_ar: '', humidity_range: '',
  daily_details: { day_1: '', day_2: '', day_3: '' }, 
  temperatures: [],
  precipitation: [] 
})

const getHeaders = () => ({ 'Authorization': `Bearer ${authStore.token}`, 'Accept': 'application/json' })

const getArabicDayName = (dateStr) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('ar-LB', { weekday: 'long' }).format(new Date(dateStr.split('T')[0]))
}

const getNextDayLabel = (offset) => {
  if (!form.value.forecast_date) return ''
  const date = new Date(form.value.forecast_date.split('T')[0])
  date.setDate(date.getDate() + offset)
  return new Intl.DateTimeFormat('ar-LB', { weekday: 'long' }).format(date)
}

const updateDayLabels = () => {
  if (form.value.forecast_date) form.value.day_name_ar = getArabicDayName(form.value.forecast_date)
}

const fetchForecasts = async () => {
  loading.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/admin/weather`, { headers: getHeaders() })
    forecasts.value = res.forecasts || []
  } catch (err) {
    console.error("Fetch failed", err);
  } finally { loading.value = false }
}

const openModal = (item = null) => {
  if (item) {
    isEditing.value = true
    const cleanDate = item.forecast_date.split('T')[0]
    
    // THE FIX: Mapping eager-loaded relationship data (precipitation_stats) to local precipitation array
    form.value = { 
      ...item, 
      forecast_date: cleanDate, 
      daily_details: item.daily_details || { day_1: '', day_2: '', day_3: '' },
      temperatures: item.regional_temperatures ? [...item.regional_temperatures] : [],
      
      // Ensure existing precipitation rows are loaded or provide report defaults
      precipitation: item.precipitation_stats && item.precipitation_stats.length > 0 
        ? [...item.precipitation_stats] 
        : [
            { station_name_ar: 'طرابلس', last_24_hours: '', accumulated_total: '', previous_year_total: '', yearly_average: '' },
            { station_name_ar: 'بيروت', last_24_hours: '', accumulated_total: '', previous_year_total: '', yearly_average: '' },
            { station_name_ar: 'زحلة', last_24_hours: '', accumulated_total: '', previous_year_total: '', yearly_average: '' }
          ]
    }
    updateDayLabels()
  } else {
    isEditing.value = false
    const today = new Date().toISOString().split('T')[0]
    form.value = { 
      id: null, forecast_date: today, day_name_ar: getArabicDayName(today), 
      daily_details: { day_1: '', day_2: '', day_3: '' }, 
      temperatures: [],
      precipitation: [
        { station_name_ar: 'طرابلس', last_24_hours: '', accumulated_total: '', previous_year_total: '', yearly_average: '' },
        { station_name_ar: 'بيروت', last_24_hours: '', accumulated_total: '', previous_year_total: '', yearly_average: '' },
        { station_name_ar: 'زحلة', last_24_hours: '', accumulated_total: '', previous_year_total: '', yearly_average: '' }
      ]
    }
  }
  showModal.value = true
}

const saveReport = async () => {
  loading.value = true
  const url = isEditing.value ? `${config.public.apiBase}/admin/weather/${form.value.id}` : `${config.public.apiBase}/admin/weather`
  try {
    await $fetch(url, { method: isEditing.value ? 'PUT' : 'POST', body: form.value, headers: getHeaders() })
    showModal.value = false
    await fetchForecasts()
  } finally { loading.value = false }
}

const deleteReport = async (id) => {
  if (!confirm('Warning: This will permanently delete this aviation briefing. Continue?')) return
  await $fetch(`${config.public.apiBase}/admin/weather/${id}`, { method: 'DELETE', headers: getHeaders() })
  fetchForecasts()
}

const addTempRow = () => form.value.temperatures.push({ region_type_ar: '', city_name_ar: '', temp_range: '' })
const addPrecipitationRow = () => form.value.precipitation.push({ station_name_ar: '', last_24_hours: '', accumulated_total: '', previous_year_total: '', yearly_average: '' })

onMounted(fetchForecasts)
</script>

<style scoped>
.fw-black { font-weight: 900; }
.extra-small-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; }

.modal-backdrop-custom {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex; justify-content: center; align-items: center;
}

.modal-dialog-custom {
  background: #fff;
  width: 95%; max-width: 950px;
  max-height: 92vh;
  border-radius: 16px;
  display: flex; flex-direction: column;
  overflow: hidden;
}

.modal-header-custom {
  padding: 1.5rem 2rem;
  color: white;
  display: flex; justify-content: space-between; align-items: center;
}

.modal-body-custom {
  flex: 1; overflow-y: auto;
}

.animate-pop {
  animation: popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.form-control-lg { border-radius: 8px; font-size: 1rem; }
.btn-white { background: #fff; border: 1px solid #dee2e6; }
.btn-white:hover { background: #f8f9fa; }
</style>