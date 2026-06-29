<template>
  <div class="weather-admin container-fluid py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Loading Aviation Briefing...</p>
    </div>

    <div v-else-if="form.id" class="card shadow-lg border-0 rounded-4 animate-pop">
      <div class="card-header bg-primary text-white p-4 d-flex justify-content-between align-items-center">
        <h4 class="mb-0 fw-bold"><i class="bi bi-cloud-sun-fill me-2"></i> Update Aviation Briefing</h4>
        <span class="badge bg-white text-primary px-3 py-2">Last Updated: {{ form.forecast_date }}</span>
      </div>

      <div class="card-body p-4 bg-light-subtle">
        <form @submit.prevent="saveReport">
          <div class="row g-4">
            <div class="col-md-6">
              <label class="form-label fw-bold small text-uppercase">Briefing Date</label>
              <input v-model="form.forecast_date" type="date" class="form-control form-control-lg border-2" @change="updateDayLabels" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold small text-uppercase text-muted">Day Name (Arabic)</label>
              <input v-model="form.day_name_ar" type="text" class="form-control form-control-lg bg-light border-0 fw-bold text-primary" readonly />
            </div>

            <div class="col-12">
              <label class="form-label fw-bold small text-uppercase">General Situation (الحالة العامة)</label>
              <textarea v-model="form.general_situation_ar" class="form-control border-2 shadow-sm" rows="3"></textarea>
            </div>
            <div class="col-12 mt-4">

    <div class="card border-success shadow-sm">

        <div class="card-header bg-success text-white">

            <h5 class="mb-0">
                <i class="bi bi-airplane-fill me-2"></i>

                Flyable Status

            </h5>

        </div>

        <div class="card-body">

            <div class="row">

                <div class="col-md-4">

                    <div class="form-check">

                        <input
                            class="form-check-input"
                            type="radio"
                            value="good"
                            v-model="form.flyable_status"
                            id="good"
                        >

                        <label
                            class="form-check-label fw-bold text-success"
                            for="good"
                        >

                            🟢 Good Conditions

                        </label>

                    </div>

                </div>

                <div class="col-md-4">

                    <div class="form-check">

                        <input
                            class="form-check-input"
                            type="radio"
                            value="caution"
                            v-model="form.flyable_status"
                            id="caution"
                        >

                        <label
                            class="form-check-label fw-bold text-warning"
                            for="caution"
                        >

                            🟡 Fly With Caution

                        </label>

                    </div>

                </div>

                <div class="col-md-4">

                    <div class="form-check">

                        <input
                            class="form-check-input"
                            type="radio"
                            value="not_flyable"
                            v-model="form.flyable_status"
                            id="not_flyable"
                        >

                        <label
                            class="form-check-label fw-bold text-danger"
                            for="not_flyable"
                        >

                            🔴 Not Flyable

                        </label>

                    </div>

                </div>

            </div>

            <div class="mt-4">

                <label class="form-label fw-bold">

                    Message shown to pilots

                </label>

                <textarea

                    v-model="form.flyable_message"

                    rows="2"

                    class="form-control"

                    placeholder="Example: Strong wind after 3 PM"

                ></textarea>

            </div>

        </div>

    </div>

</div>

            <div class="col-md-4">
              <label class="form-label fw-bold small text-primary">Surface Winds (الرياح السطحية)</label>
              <input v-model="form.surface_winds_ar" type="text" class="form-control border-primary-subtle" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold small text-primary">Visibility (الانقشاع)</label>
              <input v-model="form.visibility_ar" type="text" class="form-control border-primary-subtle" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold small text-primary">Humidity (الرطوبة النسبية)</label>
              <input v-model="form.humidity_range" type="text" class="form-control border-primary-subtle" />
            </div>

            <div class="col-md-4 mt-3">
              <label class="form-label fw-bold small">Sea State (حالة البحر)</label>
              <input v-model="form.sea_state_ar" type="text" class="form-control border-2 shadow-sm" />
            </div>
            <div class="col-md-4 mt-3">
              <label class="form-label fw-bold small">Pressure (hPa)</label>
              <input v-model="form.pressure_hpa" type="text" class="form-control border-2 shadow-sm" />
            </div>
            <div class="col-md-4 mt-3">
              <label class="form-label fw-bold small">Water Temp (حرارة الماء)</label>
              <input v-model="form.water_temp_ar" type="text" class="form-control border-2 shadow-sm" />
            </div>

            <div class="col-12 mt-4">
              <div class="p-4 bg-white rounded-4 border border-primary shadow-sm border-opacity-25">
                <h6 class="fw-black text-primary mb-4"><i class="bi bi-calendar3 me-2"></i> 72-HOUR EXTENDED OUTLOOK</h6>
                <div class="row g-3">
                  <div v-for="i in 3" :key="i" class="col-md-4">
                    <div class="p-3 rounded bg-light border-start border-4 border-primary">
                      <label class="small fw-black text-primary mb-2 d-block text-uppercase">{{ getNextDayLabel(i) }}</label>
                      <textarea v-model="form.daily_details['day_' + i]" class="form-control form-control-sm border-0 bg-transparent" rows="4"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 mt-5">
              <div class="p-4 bg-white border rounded-4 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                  <h6 class="fw-black mb-0 text-dark"><i class="bi bi-droplets-fill me-2 text-info"></i>RAINFALL STATISTICS</h6>
                  <button type="button" class="btn btn-sm btn-outline-primary fw-bold" @click="addPrecipitationRow">+ Add Station</button>
                </div>
                <div v-for="(stat, index) in form.precipitation" :key="'precip-'+index" class="row g-2 mb-3 align-items-end p-2 border rounded-3 bg-light-subtle">
                  <div class="col-md-3">
                    <label class="extra-small-label fw-bold text-muted">Station / المنطقة</label>
                    <input v-model="stat.station_name_ar" class="form-control form-control-sm border-2 fw-bold" />
                  </div>
                  <div class="col-md-2">
                    <label class="extra-small-label text-muted">24h</label>
                    <input v-model="stat.last_24_hours" class="form-control form-control-sm border-2" />
                  </div>
                  <div class="col-md-2">
                    <label class="extra-small-label text-muted">Total</label>
                    <input v-model="stat.accumulated_total" class="form-control form-control-sm border-2 fw-bold text-primary" />
                  </div>
                  <div class="col-md-2">
                    <label class="extra-small-label text-muted">Last Yr</label>
                    <input v-model="stat.previous_year_total" class="form-control form-control-sm border-2" />
                  </div>
                  <div class="col-md-2">
                    <label class="extra-small-label text-muted">Avg</label>
                    <input v-model="stat.yearly_average" class="form-control form-control-sm border-2" />
                  </div>
                  <div class="col-md-1 text-end">
                    <button type="button" class="btn text-danger p-0" @click="form.precipitation.splice(index, 1)"><i class="bi bi-trash3-fill fs-5"></i></button>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 mt-4">
              <div class="p-4 bg-white border rounded-4 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                  <h6 class="fw-black mb-0 text-dark"><i class="bi bi-thermometer-half me-2 text-danger"></i>REGIONAL TEMPERATURES</h6>
                  <button type="button" class="btn btn-sm btn-outline-danger fw-bold" @click="addTempRow">+ Add Region</button>
                </div>
                <div v-for="(temp, index) in form.temperatures" :key="'temp-'+index" class="row g-3 mb-2 p-2 rounded bg-light align-items-center border mx-0">
                  <div class="col-md-4">
                    <label class="extra-small-label fw-bold">Region (e.g. الساحل)</label>
                    <input v-model="temp.region_type_ar" class="form-control form-control-sm border-2" />
                  </div>
                  <div class="col-md-4">
                    <label class="extra-small-label fw-bold">City (e.g. بيروت)</label>
                    <input v-model="temp.city_name_ar" class="form-control form-control-sm border-2" />
                  </div>
                  <div class="col-md-3">
                    <label class="extra-small-label fw-bold">Range (e.g. 19/13)</label>
                    <input v-model="temp.temp_range" class="form-control form-control-sm border-2 fw-bold text-danger" />
                  </div>
                  <div class="col-md-1 text-end pt-3">
                    <button type="button" class="btn text-danger p-0" @click="form.temperatures.splice(index, 1)"><i class="bi bi-trash3-fill fs-5"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-top d-flex justify-content-end">
            <button type="submit" class="btn btn-primary btn-lg px-5 shadow fw-bold" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Update Briefing
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin' })
const authStore = useAuthStore()
const config = useRuntimeConfig()
const loading = ref(true)

const form = ref({
  id: null, forecast_date: '', day_name_ar: '', general_situation_ar: '',
  daily_description_ar: '', sea_state_ar: '', pressure_hpa: '', water_temp_ar: '',
  surface_winds_ar: '', visibility_ar: '', humidity_range: '',flyable_status: 'good',flyable_message: '',
  daily_details: { day_1: '', day_2: '', day_3: '' }, 
  temperatures: [],
  precipitation: [] 
})

const getHeaders = () => ({ 'Authorization': `Bearer ${authStore.token}`, 'Accept': 'application/json' })

const fetchBriefing = async () => {
  loading.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/admin/weather`, { headers: getHeaders() })
    if (res.forecast) {
      const item = res.forecast
      form.value = {
        ...item, flyable_status:
    item.flyable_status ?? 'good',
flyable_message:
    item.flyable_message ?? '',
        forecast_date: item.forecast_date.split('T')[0],
        daily_details: item.daily_details || { day_1: '', day_2: '', day_3: '' },
        temperatures: item.regional_temperatures || [],
        precipitation: item.precipitation_stats || []
      }
    }
  } catch (err) {
    console.error("Load failed", err);
  } finally { loading.value = false }
}

const saveReport = async () => {
  loading.value = true
  try {
    await $fetch(`${config.public.apiBase}/admin/weather/${form.value.id}`, { 
      method: 'PUT', 
      body: form.value, 
      headers: getHeaders() 
    })
    alert("Briefing updated successfully!");
    await fetchBriefing()
  } finally { loading.value = false }
}

const updateDayLabels = () => {
  if (form.value.forecast_date) {
     form.value.day_name_ar = new Intl.DateTimeFormat('ar-LB', { weekday: 'long' }).format(new Date(form.value.forecast_date))
  }
}

const getNextDayLabel = (offset) => {
  if (!form.value.forecast_date) return ''
  const date = new Date(form.value.forecast_date)
  date.setDate(date.getDate() + offset)
  return new Intl.DateTimeFormat('ar-LB', { weekday: 'long' }).format(date)
}

const addTempRow = () => form.value.temperatures.push({ region_type_ar: '', city_name_ar: '', temp_range: '' })
const addPrecipitationRow = () => form.value.precipitation.push({ station_name_ar: '', last_24_hours: '', accumulated_total: '', previous_year_total: '', yearly_average: '' })

onMounted(fetchBriefing)
</script>

<style scoped>
.fw-black { font-weight: 900; }
.extra-small-label { font-size: 0.7rem; text-transform: uppercase; }
.animate-pop { animation: popIn 0.3s ease-out; }
@keyframes popIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>