<template>
  <div class="weather-admin container-fluid py-4">

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">
        Loading Weather Bulletin...
      </p>
    </div>

    <!-- No bulletin -->
    <div
      v-else-if="!form.id"
      class="alert alert-warning"
    >
      No weather bulletin found.
    </div>

    <!-- Bulletin -->
    <div
      v-else
      class="card shadow-lg border-0 rounded-4 animate-pop"
    >

      <!-- HEADER -->
      <div
        class="card-header bg-primary text-white p-4 d-flex justify-content-between align-items-center"
      >
        <div>
          <h4 class="mb-1 fw-bold">
            <i class="bi bi-cloud-sun-fill me-2"></i>
            Weather Bulletin
          </h4>

          <small>
            LCAA Bulletin #{{ form.api_id }}
          </small>
        </div>

        <span class="badge bg-white text-primary px-3 py-2">
          {{ form.date }}
        </span>
      </div>


      <div class="card-body p-4 bg-light-subtle">

        <form @submit.prevent="saveReport">

          <!-- ================================================= -->
          <!-- BASIC INFORMATION -->
          <!-- ================================================= -->

          <div class="row g-4">

            <div class="col-md-6">
              <label class="form-label fw-bold">
                Bulletin Date
              </label>

              <input
                v-model="form.date"
                type="date"
                class="form-control form-control-lg border-2"
                :class="{ 'is-invalid': errors.date }"
                required
              />

              <div
                v-if="errors.date"
                class="invalid-feedback"
              >
                {{ errors.date[0] }}
              </div>
            </div>


            <div class="col-md-6">

              <label class="form-label fw-bold">
                LCAA API Bulletin ID
              </label>

              <input
                :value="form.api_id"
                type="text"
                class="form-control form-control-lg bg-light"
                readonly
              />

            </div>

          </div>


          <!-- ================================================= -->
          <!-- GENERAL WEATHER SITUATION -->
          <!-- ================================================= -->

          <div class="card border-primary shadow-sm mt-5">

            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="bi bi-cloud-sun me-2"></i>
                General Situation
              </h5>
            </div>

            <div class="card-body">

              <!-- Arabic -->
              <div class="mb-4">

                <label class="form-label fw-bold">
                  General Situation - Arabic
                </label>

                <textarea
                  v-model="form.state_ar"
                  rows="5"
                  class="form-control border-2"
                  :class="{ 'is-invalid': errors.state_ar }"
                ></textarea>

                <div
                  v-if="errors.state_ar"
                  class="invalid-feedback"
                >
                  {{ errors.state_ar[0] }}
                </div>

              </div>


              <!-- English -->
              <div class="mb-4">

                <label class="form-label fw-bold">
                  General Situation - English
                </label>

                <textarea
                  v-model="form.state_en"
                  rows="5"
                  class="form-control border-2"
                ></textarea>

              </div>


              <!-- French -->
              <div>

                <label class="form-label fw-bold">
                  General Situation - French
                </label>

                <textarea
                  v-model="form.state_fr"
                  rows="5"
                  class="form-control border-2"
                ></textarea>

              </div>

            </div>
          </div>


          <!-- ================================================= -->
          <!-- HUMIDITY / WIND / SEA / VISIBILITY -->
          <!-- ================================================= -->

          <div class="row g-4 mt-4">

            <!-- HUMIDITY -->
            <div class="col-md-6">

              <div class="card h-100 shadow-sm">

                <div class="card-header fw-bold">
                  <i class="bi bi-droplet-half me-2"></i>
                  Humidity
                </div>

                <div class="card-body">

                  <label class="form-label">
                    Arabic
                  </label>

                  <textarea
                    v-model="form.humidity_ar"
                    rows="2"
                    class="form-control mb-3"
                  ></textarea>


                  <label class="form-label">
                    English
                  </label>

                  <textarea
                    v-model="form.humidity_en"
                    rows="2"
                    class="form-control mb-3"
                  ></textarea>


                  <label class="form-label">
                    French
                  </label>

                  <textarea
                    v-model="form.humidity_fr"
                    rows="2"
                    class="form-control"
                  ></textarea>

                </div>

              </div>

            </div>


            <!-- WIND -->
            <div class="col-md-6">

              <div class="card h-100 shadow-sm">

                <div class="card-header fw-bold">
                  <i class="bi bi-wind me-2"></i>
                  Wind
                </div>

                <div class="card-body">

                  <label class="form-label">
                    Arabic
                  </label>

                  <textarea
                    v-model="form.wind_ar"
                    rows="2"
                    class="form-control mb-3"
                  ></textarea>


                  <label class="form-label">
                    English
                  </label>

                  <textarea
                    v-model="form.wind_en"
                    rows="2"
                    class="form-control mb-3"
                  ></textarea>


                  <label class="form-label">
                    French
                  </label>

                  <textarea
                    v-model="form.wind_fr"
                    rows="2"
                    class="form-control"
                  ></textarea>

                </div>

              </div>

            </div>


            <!-- SEA -->
            <div class="col-md-6">

              <div class="card h-100 shadow-sm">

                <div class="card-header fw-bold">
                  <i class="bi bi-water me-2"></i>
                  Sea State
                </div>

                <div class="card-body">

                  <label class="form-label">
                    Arabic
                  </label>

                  <textarea
                    v-model="form.sea_ar"
                    rows="2"
                    class="form-control mb-3"
                  ></textarea>


                  <label class="form-label">
                    English
                  </label>

                  <textarea
                    v-model="form.sea_en"
                    rows="2"
                    class="form-control mb-3"
                  ></textarea>


                  <label class="form-label">
                    French
                  </label>

                  <textarea
                    v-model="form.sea_fr"
                    rows="2"
                    class="form-control"
                  ></textarea>

                </div>

              </div>

            </div>


            <!-- VISIBILITY -->
            <div class="col-md-6">

              <div class="card h-100 shadow-sm">

                <div class="card-header fw-bold">
                  <i class="bi bi-eye me-2"></i>
                  Visibility
                </div>

                <div class="card-body">

                  <label class="form-label">
                    Arabic
                  </label>

                  <textarea
                    v-model="form.visibility_ar"
                    rows="2"
                    class="form-control mb-3"
                  ></textarea>


                  <label class="form-label">
                    English
                  </label>

                  <textarea
                    v-model="form.visibility_en"
                    rows="2"
                    class="form-control mb-3"
                  ></textarea>


                  <label class="form-label">
                    French
                  </label>

                  <textarea
                    v-model="form.visibility_fr"
                    rows="2"
                    class="form-control"
                  ></textarea>

                </div>

              </div>

            </div>

          </div>


          <!-- ================================================= -->
          <!-- WEATHER MEASUREMENTS -->
          <!-- ================================================= -->

          <div class="card shadow-sm mt-5">

            <div class="card-header bg-info text-white">

              <h5 class="mb-0">
                <i class="bi bi-thermometer-half me-2"></i>
                Weather Measurements
              </h5>

            </div>

            <div class="card-body">

              <div class="row g-4">

                <div class="col-md-3">

                  <label class="form-label fw-bold">
                    Water Temperature (°C)
                  </label>

                  <input
                    v-model="form.water_temp_c"
                    type="number"
                    step="0.01"
                    class="form-control"
                  />

                </div>


                <div class="col-md-3">

                  <label class="form-label fw-bold">
                    Pressure (hPa)
                  </label>

                  <input
                    v-model="form.pressure_hpa"
                    type="number"
                    step="0.01"
                    class="form-control"
                  />

                </div>


                <div class="col-md-3">

                  <label class="form-label fw-bold">
                    Sunrise
                  </label>

                  <input
                    v-model="form.sunrise"
                    type="time"
                    class="form-control"
                  />

                </div>


                <div class="col-md-3">

                  <label class="form-label fw-bold">
                    Sunset
                  </label>

                  <input
                    v-model="form.sunset"
                    type="time"
                    class="form-control"
                  />

                </div>

              </div>

            </div>

          </div>


          <!-- ================================================= -->
          <!-- FORECAST DAYS -->
          <!-- ================================================= -->

          <div class="card shadow-sm mt-5">

            <div class="card-header bg-primary text-white">

              <h5 class="mb-0">
                <i class="bi bi-calendar3 me-2"></i>
                Forecast Days
              </h5>

            </div>

            <div class="card-body">

              <div
                v-for="(day, index) in form.forecast_days"
                :key="day.id || index"
                class="border rounded-3 p-4 mb-4 bg-light"
              >

                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >

                  <h6 class="fw-bold text-primary mb-0">
                    {{ day.day }}
                  </h6>

                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="removeForecastDay(index)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>

                </div>


                <div class="row g-3">

                  <div class="col-md-4">

                    <label class="form-label fw-bold">
                      Arabic
                    </label>

                    <textarea
                      v-model="day.state_ar"
                      rows="4"
                      class="form-control"
                    ></textarea>

                  </div>


                  <div class="col-md-4">

                    <label class="form-label fw-bold">
                      English
                    </label>

                    <textarea
                      v-model="day.state_en"
                      rows="4"
                      class="form-control"
                    ></textarea>

                  </div>


                  <div class="col-md-4">

                    <label class="form-label fw-bold">
                      French
                    </label>

                    <textarea
                      v-model="day.state_fr"
                      rows="4"
                      class="form-control"
                    ></textarea>

                  </div>

                </div>

              </div>


              <button
                type="button"
                class="btn btn-outline-primary"
                @click="addForecastDay"
              >
                <i class="bi bi-plus-lg me-1"></i>
                Add Forecast Day
              </button>

            </div>

          </div>


          <!-- ================================================= -->
          <!-- TEMPERATURES -->
          <!-- ================================================= -->

          <div class="card shadow-sm mt-5">

            <div
              class="card-header bg-danger text-white d-flex justify-content-between align-items-center"
            >

              <h5 class="mb-0">
                <i class="bi bi-thermometer-half me-2"></i>
                City Temperatures & Precipitation
              </h5>

              <button
                type="button"
                class="btn btn-sm btn-light"
                @click="addTemperature"
              >
                + Add Record
              </button>

            </div>


            <div class="card-body">

              <div
                v-for="(temp, index) in form.temperatures"
                :key="temp.id || index"
                class="border rounded-3 p-3 mb-3 bg-light"
              >

                <div class="row g-2">

                  <!-- City -->
                  <div class="col-md-2">

                    <label class="small fw-bold">
                      City
                    </label>

                    <input
                      v-model="temp.city_name"
                      class="form-control form-control-sm"
                    />

                  </div>


                  <!-- Arabic -->
                  <div class="col-md-2">

                    <label class="small fw-bold">
                      City Arabic
                    </label>

                    <input
                      v-model="temp.city_name_ar"
                      class="form-control form-control-sm"
                    />

                  </div>


                  <!-- Region -->
                  <div class="col-md-2">

                    <label class="small fw-bold">
                      Region
                    </label>

                    <input
                      v-model="temp.region_ar"
                      class="form-control form-control-sm"
                    />

                  </div>


                  <!-- Date -->
                  <div class="col-md-2">

                    <label class="small fw-bold">
                      Day
                    </label>

                    <input
                      v-model="temp.day"
                      type="date"
                      class="form-control form-control-sm"
                    />

                  </div>


                  <!-- Tmin -->
                  <div class="col-md-1">

                    <label class="small fw-bold">
                      Tmin
                    </label>

                    <input
                      v-model="temp.tmin"
                      type="number"
                      step="0.01"
                      class="form-control form-control-sm"
                    />

                  </div>


                  <!-- Tmax -->
                  <div class="col-md-1">

                    <label class="small fw-bold">
                      Tmax
                    </label>

                    <input
                      v-model="temp.tmax"
                      type="number"
                      step="0.01"
                      class="form-control form-control-sm"
                    />

                  </div>


                  <!-- Delete -->
                  <div class="col-md-2 text-end pt-4">

                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="form.temperatures.splice(index, 1)"
                    >
                      <i class="bi bi-trash"></i>
                      Remove
                    </button>

                  </div>


                  <!-- PRECIPITATION -->
                  <div class="col-12 mt-3">

                    <div class="row g-2">

                      <div class="col">
                        <label class="small text-muted">
                          24h
                        </label>

                        <input
                          v-model="temp.rr_24"
                          type="number"
                          step="0.01"
                          class="form-control form-control-sm"
                        />
                      </div>


                      <div class="col">
                        <label class="small text-muted">
                          Cumulative
                        </label>

                        <input
                          v-model="temp.rr_cumul"
                          type="number"
                          step="0.01"
                          class="form-control form-control-sm"
                        />
                      </div>


                      <div class="col">
                        <label class="small text-muted">
                          Avg Today
                        </label>

                        <input
                          v-model="temp.rr_avg_today"
                          type="number"
                          step="0.01"
                          class="form-control form-control-sm"
                        />
                      </div>


                      <div class="col">
                        <label class="small text-muted">
                          Average
                        </label>

                        <input
                          v-model="temp.rr_avg"
                          type="number"
                          step="0.01"
                          class="form-control form-control-sm"
                        />
                      </div>


                      <div class="col">
                        <label class="small text-muted">
                          Last Year
                        </label>

                        <input
                          v-model="temp.rr_last_year"
                          type="number"
                          step="0.01"
                          class="form-control form-control-sm"
                        />
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>


          <!-- ================================================= -->
          <!-- REGION AGGREGATES -->
          <!-- ================================================= -->

          <div class="card shadow-sm mt-5">

            <div
              class="card-header bg-success text-white d-flex justify-content-between align-items-center"
            >

              <h5 class="mb-0">
                <i class="bi bi-bar-chart-fill me-2"></i>
                Region Aggregates
              </h5>

              <button
                type="button"
                class="btn btn-sm btn-light"
                @click="addRegionAggregate"
              >
                + Add Region
              </button>

            </div>


            <div class="card-body">

              <div
                v-for="(region, index) in form.region_aggregates"
                :key="region.id || index"
                class="row g-2 mb-3 align-items-end"
              >

                <div class="col-md-3">

                  <label class="small fw-bold">
                    Region Arabic
                  </label>

                  <input
                    v-model="region.region_ar"
                    class="form-control"
                  />

                </div>


                <div class="col-md-3">

                  <label class="small fw-bold">
                    Region English
                  </label>

                  <input
                    v-model="region.region_en"
                    class="form-control"
                  />

                </div>


                <div class="col-md-2">

                  <label class="small fw-bold">
                    Day
                  </label>

                  <input
                    v-model="region.day"
                    type="date"
                    class="form-control"
                  />

                </div>


                <div class="col-md-1">

                  <label class="small fw-bold">
                    Tmin
                  </label>

                  <input
                    v-model="region.tmin"
                    type="number"
                    step="0.01"
                    class="form-control"
                  />

                </div>


                <div class="col-md-1">

                  <label class="small fw-bold">
                    Tmax
                  </label>

                  <input
                    v-model="region.tmax"
                    type="number"
                    step="0.01"
                    class="form-control"
                  />

                </div>


                <div class="col-md-2">

                  <button
                    type="button"
                    class="btn btn-outline-danger w-100"
                    @click="form.region_aggregates.splice(index, 1)"
                  >
                    <i class="bi bi-trash"></i>
                    Remove
                  </button>

                </div>

              </div>

            </div>

          </div>


          <!-- ================================================= -->
          <!-- DUTY OFFICERS -->
          <!-- ================================================= -->

          <div class="card shadow-sm mt-5">

            <div
              class="card-header bg-dark text-white d-flex justify-content-between align-items-center"
            >

              <h5 class="mb-0">
                <i class="bi bi-person-badge me-2"></i>
                Duty Officers
              </h5>

              <button
                type="button"
                class="btn btn-sm btn-light"
                @click="addDutyOfficer"
              >
                + Add Officer
              </button>

            </div>


            <div class="card-body">

              <div
                v-for="(officer, index) in form.duty_officers"
                :key="officer.id || index"
                class="border rounded-3 p-3 mb-3"
              >

                <div class="row g-3">

                  <div class="col-md-3">

                    <label class="small fw-bold">
                      Name Arabic
                    </label>

                    <input
                      v-model="officer.name_ar"
                      class="form-control"
                    />

                  </div>


                  <div class="col-md-3">

                    <label class="small fw-bold">
                      Name English
                    </label>

                    <input
                      v-model="officer.name_en"
                      class="form-control"
                    />

                  </div>


                  <div class="col-md-2">

                    <label class="small fw-bold">
                      Position Arabic
                    </label>

                    <input
                      v-model="officer.position_ar"
                      class="form-control"
                    />

                  </div>


                  <div class="col-md-2">

                    <label class="small fw-bold">
                      Position English
                    </label>

                    <input
                      v-model="officer.position_en"
                      class="form-control"
                    />

                  </div>


                  <div class="col-md-1">

                    <label class="small fw-bold">
                      Primary
                    </label>

                    <div class="form-check mt-2">

                      <input
                        v-model="officer.primary"
                        type="checkbox"
                        class="form-check-input"
                      />

                    </div>

                  </div>


                  <div class="col-md-1">

                    <button
                      type="button"
                      class="btn btn-outline-danger"
                      @click="form.duty_officers.splice(index, 1)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>


          <!-- ================================================= -->
          <!-- EVENTS -->
          <!-- ================================================= -->

          <div class="card shadow-sm mt-5">

            <div
              class="card-header bg-warning d-flex justify-content-between align-items-center"
            >

              <h5 class="mb-0">
                <i class="bi bi-calendar-event me-2"></i>
                Events
              </h5>

              <button
                type="button"
                class="btn btn-sm btn-dark"
                @click="addEvent"
              >
                + Add Event
              </button>

            </div>


            <div class="card-body">

              <div
                v-for="(event, index) in form.events"
                :key="event.id || index"
                class="row g-3 mb-3"
              >

                <div class="col-md-11">

                  <textarea
                    v-model="event.data_text"
                    rows="3"
                    class="form-control"
                    placeholder="Event JSON"
                  ></textarea>

                </div>


                <div class="col-md-1">

                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    @click="form.events.splice(index, 1)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>

                </div>

              </div>

            </div>

          </div>


          <!-- ================================================= -->
          <!-- SAVE -->
          <!-- ================================================= -->

          <div
            class="mt-5 pt-4 border-top d-flex justify-content-end"
          >

            <button
              type="submit"
              class="btn btn-primary btn-lg px-5 shadow fw-bold"
              :disabled="saving"
            >

              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-2"
              ></span>

              <i
                v-else
                class="bi bi-save me-2"
              ></i>

              Save Weather Bulletin

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

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Weather Bulletin'
})


const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(true)
const saving = ref(false)

const errors = ref({})


/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

const form = ref({

  id: null,

  api_id: null,

  date: '',

  api_created_at: null,

  api_updated_at: null,

  is_translated: false,

  state_ar: '',
  state_en: '',
  state_fr: '',

  humidity_ar: '',
  humidity_en: '',
  humidity_fr: '',

  wind_ar: '',
  wind_en: '',
  wind_fr: '',

  sea_ar: '',
  sea_en: '',
  sea_fr: '',

  visibility_ar: '',
  visibility_en: '',
  visibility_fr: '',

  water_temp_c: '',
  pressure_hpa: '',

  sunrise: '',
  sunset: '',

  forecast_days: [],

  temperatures: [],

  region_aggregates: [],

  duty_officers: [],

  events: []

})


/*
|--------------------------------------------------------------------------
| HEADERS
|--------------------------------------------------------------------------
*/

const getHeaders = () => ({
  Authorization: `Bearer ${authStore.token}`,
  Accept: 'application/json'
})


/*
|--------------------------------------------------------------------------
| LOAD BULLETIN
|--------------------------------------------------------------------------
*/

const fetchBriefing = async () => {

  loading.value = true
  errors.value = {}

  try {

    const res = await $fetch(
      `${config.public.apiBase}/admin/weather`,
      {
        headers: getHeaders()
      }
    )

    if (!res.bulletin) {
      return
    }

    const item = res.bulletin

    form.value = {

      id: item.id,

      api_id: item.api_id,

      date: normalizeDate(item.date),

      api_created_at: item.api_created_at,

      api_updated_at: item.api_updated_at,

      is_translated: item.is_translated ?? false,

      state_ar: item.state_ar ?? '',
      state_en: item.state_en ?? '',
      state_fr: item.state_fr ?? '',

      humidity_ar: item.humidity_ar ?? '',
      humidity_en: item.humidity_en ?? '',
      humidity_fr: item.humidity_fr ?? '',

      wind_ar: item.wind_ar ?? '',
      wind_en: item.wind_en ?? '',
      wind_fr: item.wind_fr ?? '',

      sea_ar: item.sea_ar ?? '',
      sea_en: item.sea_en ?? '',
      sea_fr: item.sea_fr ?? '',

      visibility_ar: item.visibility_ar ?? '',
      visibility_en: item.visibility_en ?? '',
      visibility_fr: item.visibility_fr ?? '',

      water_temp_c: item.water_temp_c ?? '',
      pressure_hpa: item.pressure_hpa ?? '',

      sunrise: normalizeTime(item.sunrise),
      sunset: normalizeTime(item.sunset),

      forecast_days: item.forecast_days ?? [],

      temperatures: item.temperatures ?? [],

      region_aggregates: item.region_aggregates ?? [],

      duty_officers: item.duty_officers ?? [],

      events: normalizeEvents(item.events ?? [])

    }

  } catch (err) {

    console.error(
      'Weather bulletin load failed:',
      err
    )

  } finally {

    loading.value = false

  }

}


/*
|--------------------------------------------------------------------------
| SAVE BULLETIN
|--------------------------------------------------------------------------
*/

const saveReport = async () => {

  saving.value = true
  errors.value = {}

  try {

    const payload = {

      date: form.value.date,

      is_translated: form.value.is_translated,

      state_ar: form.value.state_ar,
      state_en: form.value.state_en,
      state_fr: form.value.state_fr,

      humidity_ar: form.value.humidity_ar,
      humidity_en: form.value.humidity_en,
      humidity_fr: form.value.humidity_fr,

      wind_ar: form.value.wind_ar,
      wind_en: form.value.wind_en,
      wind_fr: form.value.wind_fr,

      sea_ar: form.value.sea_ar,
      sea_en: form.value.sea_en,
      sea_fr: form.value.sea_fr,

      visibility_ar: form.value.visibility_ar,
      visibility_en: form.value.visibility_en,
      visibility_fr: form.value.visibility_fr,

      water_temp_c: form.value.water_temp_c,
      pressure_hpa: form.value.pressure_hpa,

      sunrise: form.value.sunrise,
      sunset: form.value.sunset,

      forecast_days:
        form.value.forecast_days,

      temperatures:
        form.value.temperatures,

      region_aggregates:
        form.value.region_aggregates,

      duty_officers:
        form.value.duty_officers,

      events:
        form.value.events.map(event => {

          if (event.data_text) {

            try {
              return JSON.parse(event.data_text)
            } catch {
              return {
                value: event.data_text
              }
            }

          }

          return event.data ?? event

        })

    }


    await $fetch(
      `${config.public.apiBase}/admin/weather/${form.value.id}`,
      {
        method: 'PUT',
        body: payload,
        headers: getHeaders()
      }
    )


    alert(
      'Weather bulletin updated successfully!'
    )

    await fetchBriefing()

  } catch (err) {

    console.error(
      'Weather bulletin update failed:',
      err
    )

    if (err.data?.errors) {
      errors.value = err.data.errors
    }

  } finally {

    saving.value = false

  }

}


/*
|--------------------------------------------------------------------------
| FORECAST DAYS
|--------------------------------------------------------------------------
*/

const addForecastDay = () => {

  form.value.forecast_days.push({

    day: '',

    state_ar: '',
    state_en: '',
    state_fr: ''

  })

}


const removeForecastDay = (index) => {

  form.value.forecast_days.splice(
    index,
    1
  )

}


/*
|--------------------------------------------------------------------------
| TEMPERATURES
|--------------------------------------------------------------------------
*/

const addTemperature = () => {

  form.value.temperatures.push({

    city_id: null,

    city_name: '',
    city_name_ar: '',

    region_ar: '',
    region_en: '',

    latitude: null,
    longitude: null,

    city_order: null,

    exclude_from_temperature_charts: false,
    exclude_from_precipitation_charts: false,

    day: '',

    tmin: null,
    tmax: null,

    rr_24: null,
    rr_cumul: null,
    rr_avg_today: null,
    rr_avg: null,
    rr_last_year: null

  })

}


/*
|--------------------------------------------------------------------------
| REGION AGGREGATES
|--------------------------------------------------------------------------
*/

const addRegionAggregate = () => {

  form.value.region_aggregates.push({

    region_ar: '',
    region_en: '',

    day: '',

    tmin: null,
    tmax: null

  })

}


/*
|--------------------------------------------------------------------------
| DUTY OFFICERS
|--------------------------------------------------------------------------
*/

const addDutyOfficer = () => {

  form.value.duty_officers.push({

    name_ar: '',
    name_en: '',

    position_ar: '',
    position_en: '',
    position_fr: '',

    primary: false

  })

}


/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

const addEvent = () => {

  form.value.events.push({

    data_text: ''

  })

}


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const normalizeDate = (value) => {

  if (!value) {
    return ''
  }

  return String(value).substring(0, 10)

}


const normalizeTime = (value) => {

  if (!value) {
    return ''
  }

  return String(value).substring(0, 5)

}


const normalizeEvents = (events) => {

  return events.map(event => {

    if (event.data) {

      return {
        ...event,
        data_text:
          typeof event.data === 'string'
            ? event.data
            : JSON.stringify(
                event.data,
                null,
                2
              )
      }

    }

    return {
      ...event,
      data_text:
        JSON.stringify(
          event,
          null,
          2
        )
    }

  })

}


/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(
  fetchBriefing
)

</script>


<style scoped>

.fw-black {
  font-weight: 900;
}

.animate-pop {
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {

  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }

}

</style>