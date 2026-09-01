<template>
  <div class="weather-dashboard mx-md-5 h-100">

    <!-- Loading -->
    <div
      v-if="loading"
      class="d-flex flex-column align-items-center justify-content-center p-5 h-100 bg-white rounded-4 border shadow-sm"
    >
      <div
        class="spinner-border text-success"
        role="status"
      ></div>

      <p class="mt-3 text-muted fw-bold small-caps">
        Synchronizing Met Data...
      </p>
    </div>


    <!-- No weather -->
    <div
      v-else-if="!weather"
      class="alert alert-warning"
    >
      No weather bulletin available.
    </div>


    <!-- WEATHER -->
    <div
      v-else
      class="weather-card bg-white rounded-4 shadow-sm h-100 d-flex flex-column border-0"
    >

      <!-- ================================================= -->
      <!-- HEADER -->
      <!-- ================================================= -->

      <div class="p-4 mx-md-5 border-bottom bg-white rounded-top-4">

        <div
          class="d-flex justify-content-between align-items-center"
        >

          <div class="d-flex align-items-center gap-3">

            <i class="bi bi-wind fs-1 text-success"></i>

            <div>

              <h2
                class="mb-0 fw-black text-dark text-uppercase letter-spacing-1"
              >
                Aviation Briefing
              </h2>

              <span class="text-muted fs-5 fw-bold">
                Official Meteorological Report • LASF
              </span>

            </div>

          </div>


          <div class="text-end">

            <span
              class="badge-outline-success mb-2 px-4 py-2 fs-4 fw-black text-uppercase"
            >
              {{ getArabicDay(weather.date) }}
            </span>

            <div
              class="text-muted fs-4 font-mono fw-bold"
            >
              {{ formatDate(weather.date) }}
            </div>

          </div>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- BODY -->
      <!-- ================================================= -->

      <div class="p-4 mx-md-5 flex-grow-1">


        <!-- ================================================= -->
        <!-- GENERAL SITUATION -->
        <!-- ================================================= -->

        <div
          class="situation-container mb-5 shadow-sm p-4 bg-light-subtle rounded-3"
          dir="rtl"
        >

          <div
            class="d-flex align-items-center gap-3 mb-3"
          >

            <div class="dot-indicator bg-success"></div>

            <span
              class="fw-black fs-2 text-success"
            >
              الحالة العامة
            </span>

          </div>


          <!-- IMPORTANT:
               API returns HTML, so use v-html -->
          <div
            class="situation-text text-dark ps-4 weather-html"
            v-html="cleanHtml(weather.state_ar)"
          ></div>

        </div>


        <!-- ================================================= -->
        <!-- WEATHER CONDITIONS -->
        <!-- ================================================= -->

        <div
          class="row g-4 mb-5 text-center"
          dir="rtl"
        >

          <!-- WIND -->
          <div class="col-md-3">

            <div class="aero-card shadow-sm">

              <label class="large-label">
                الرياح السطحية
              </label>

              <div
                class="weather-html fw-black fs-3 text-dark mt-2"
                v-html="cleanHtml(weather.wind_ar)"
              ></div>

            </div>

          </div>


          <!-- VISIBILITY -->
          <div class="col-md-3">

            <div class="aero-card shadow-sm">

              <label class="large-label">
                الانقشاع
              </label>

              <div
                class="weather-html fw-black fs-3 text-dark mt-2"
                v-html="cleanHtml(weather.visibility_ar)"
              ></div>

            </div>

          </div>


          <!-- HUMIDITY -->
          <div class="col-md-3">

            <div class="aero-card shadow-sm">

              <label class="large-label">
                الرطوبة النسبية
              </label>

              <div
                class="weather-html fw-black fs-3 text-dark mt-2"
                v-html="cleanHtml(weather.humidity_ar)"
              ></div>

            </div>

          </div>


          <!-- SEA -->
          <div class="col-md-3">

            <div class="aero-card shadow-sm">

              <label class="large-label">
                حالة البحر
              </label>

              <div
                class="weather-html fw-black fs-3 text-dark mt-2"
                v-html="cleanHtml(weather.sea_ar)"
              ></div>

            </div>

          </div>

        </div>


        <!-- ================================================= -->
        <!-- FORECAST DAYS -->
        <!-- ================================================= -->

        <div
          v-if="weather.forecast_days?.length"
          class="forecast-timeline mb-5"
        >

          <div
            class="d-flex align-items-center gap-2 mb-4"
          >

            <i
              class="bi bi-calendar3 text-muted fs-3"
            ></i>

            <span
              class="fw-black fs-4 text-muted text-uppercase letter-spacing-2"
            >
              Forecast Outlook
            </span>

          </div>


          <div
            class="row g-4"
            dir="rtl"
          >

            <div
              v-for="day in weather.forecast_days"
              :key="day.id"
              class="col-md-4"
            >

              <div
                class="timeline-item border-start-success shadow-sm p-4 rounded-4 bg-white"
              >

                <div
                  class="timeline-day text-success fs-3 mb-2 fw-black border-bottom pb-2"
                >
                  {{ getArabicDay(day.day) }}
                </div>


                <div
                  class="text-muted small mb-2"
                >
                  {{ formatDate(day.day) }}
                </div>


                <!-- IMPORTANT:
                     Forecast description is also HTML -->
                <div
                  class="timeline-desc text-dark fs-5 lh-base weather-html"
                  v-html="cleanHtml(day.state_ar)"
                ></div>

              </div>

            </div>

          </div>

        </div>


        <!-- ================================================= -->
        <!-- WEATHER MEASUREMENTS -->
        <!-- ================================================= -->

        <div
          class="row g-4 mb-5 align-items-center"
        >

          <!-- SEA -->
          <div class="col-md-3">

            <div
              class="stat-box border-start-success-thick p-3 bg-light shadow-sm"
            >

              <span class="stat-label">
                Sea State / حالة البحر
              </span>

              <div
                class="stat-value fs-4 mt-1 fw-black weather-html"
                v-html="cleanHtml(weather.sea_ar)"
              ></div>

            </div>

          </div>


          <!-- PRESSURE -->
          <div class="col-md-3">

            <div
              class="stat-box border-start-dark-thick p-3 bg-light shadow-sm"
            >

              <span class="stat-label">
                Pressure / الضغط
              </span>

              <div
                class="stat-value fs-4 mt-1 fw-black"
              >

                {{ weather.pressure_hpa || 'N/A' }}

                <span
                  v-if="weather.pressure_hpa"
                >
                  hPa
                </span>

              </div>

            </div>

          </div>


          <!-- WATER TEMP -->
          <div class="col-md-3">

            <div
              class="stat-box border-start-success-thick p-3 bg-light shadow-sm"
            >

              <span class="stat-label">
                Water Temperature / حرارة الماء
              </span>

              <div
                class="stat-value fs-4 mt-1 fw-black"
              >

                {{ weather.water_temp_c || 'N/A' }}

                <span
                  v-if="weather.water_temp_c"
                >
                  °C
                </span>

              </div>

            </div>

          </div>


          <!-- SUNRISE / SUNSET -->
          <div class="col-md-3">

            <div class="row">

              <div class="col-6 text-center">

                <i
                  class="bi bi-sunrise fs-2 text-warning"
                ></i>

                <div class="stat-label">
                  Sunrise
                </div>

                <div class="fw-black fs-5">
                  {{ formatTime(weather.sunrise) }}
                </div>

              </div>


              <div class="col-6 text-center">

                <i
                  class="bi bi-sunset fs-2 text-danger"
                ></i>

                <div class="stat-label">
                  Sunset
                </div>

                <div class="fw-black fs-5">
                  {{ formatTime(weather.sunset) }}
                </div>

              </div>

            </div>

          </div>

        </div>


        <!-- ================================================= -->
        <!-- CITY TEMPERATURES -->
        <!-- ================================================= -->

        <div
          v-if="weather.temperatures?.length"
          class="row g-4 pb-5"
        >

          <div class="col-lg-7">

            <div
              class="table-container shadow rounded-4 border overflow-hidden"
            >

              <table
                class="table table-borderless align-middle mb-0"
              >

                <thead class="bg-black text-white">

                  <tr>

                    <th
                      class="ps-4 py-4 fs-5"
                    >
                      Region / المنطقة
                    </th>

                    <th
                      class="text-center fs-5"
                    >
                      Location
                    </th>

                    <th
                      class="text-center fs-5"
                    >
                      Day
                    </th>

                    <th
                      class="pe-4 text-end fs-5"
                    >
                      Temperature
                    </th>

                  </tr>

                </thead>


                <tbody>

                  <tr
                    v-for="temp in weather.temperatures"
                    :key="temp.id"
                    class="border-bottom hover-bg"
                  >

                    <td
                      class="ps-4 py-4 fw-black fs-5 text-dark"
                    >
                      {{ temp.region_ar || temp.region_en || 'N/A' }}
                    </td>


                    <td
                      class="text-center text-muted fw-black fs-5"
                    >
                      {{ temp.city_name_ar || temp.city_name || 'N/A' }}
                    </td>


                    <td
                      class="text-center text-muted fw-bold"
                    >
                      {{ formatDate(temp.day) }}
                    </td>


                    <td
                      class="pe-4 text-end fw-black fs-4 text-primary"
                    >

                      <span
                        v-if="temp.tmax !== null"
                      >
                        {{ temp.tmax }}°
                      </span>

                      <span
                        v-if="temp.tmin !== null"
                      >
                        /
                        {{ temp.tmin }}°
                      </span>

                      <span
                        v-if="temp.tmin !== null || temp.tmax !== null"
                      >
                        C
                      </span>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>


          <!-- ================================================= -->
          <!-- PRECIPITATION -->
          <!-- ================================================= -->

         <div
  v-if="precipitationRows.length > 0"
  class="col-lg-5"
>

            <div
              class="table-container shadow rounded-4 border overflow-hidden"
            >

              <table
                class="table table-sm table-striped align-middle mb-0 text-center"
              >

                <thead class="bg-primary text-white">

                  <tr>

                    <th class="py-4 fs-5">
                      المنطقة
                    </th>

                    <th>
                      ٢٤ ساعة
                    </th>

                    <th>
                      المتراكم
                    </th>

                    <th>
                      المعدل
                    </th>

                  </tr>

                </thead>


                <tbody>

                  <tr
                    v-for="temp in precipitationRows"
                    :key="temp.id"
                    class="border-bottom"
                  >

                    <td
                      class="py-4 fw-black fs-5"
                    >
                      {{ temp.city_name_ar || temp.region_ar || 'N/A' }}
                    </td>


                    <td class="fs-5 fw-bold">
                      {{ temp.rr_24 ?? 'N/A' }}
                    </td>


                    <td
                      class="text-primary fw-black fs-5"
                    >
                      {{ temp.rr_cumul ?? 'N/A' }}
                    </td>


                    <td
                      class="text-muted fs-5 fw-bold"
                    >
                      {{ temp.rr_avg ?? 'N/A' }}
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>


        <!-- ================================================= -->
        <!-- REGION AGGREGATES -->
        <!-- ================================================= -->

        <div
          v-if="weather.region_aggregates?.length"
          class="mb-5"
        >

          <div
            class="d-flex align-items-center gap-2 mb-4"
          >

            <i
              class="bi bi-bar-chart-fill text-success fs-3"
            ></i>

            <span
              class="fw-black fs-4 text-muted text-uppercase"
            >
              Regional Temperature Summary
            </span>

          </div>


          <div
            class="table-container shadow rounded-4 border overflow-hidden"
          >

            <table
              class="table table-borderless align-middle mb-0"
            >

              <thead class="bg-black text-white">

                <tr>

                  <th class="py-4 ps-4">
                    Region
                  </th>

                  <th class="text-center">
                    Day
                  </th>

                  <th class="text-center">
                    Minimum
                  </th>

                  <th class="text-center pe-4">
                    Maximum
                  </th>

                </tr>

              </thead>


              <tbody>

                <tr
                  v-for="region in weather.region_aggregates"
                  :key="region.id"
                  class="border-bottom"
                >

                  <td
                    class="py-4 ps-4 fw-black fs-5"
                  >
                    {{ region.region_ar || region.region_en }}
                  </td>


                  <td class="text-center">
                    {{ formatDate(region.day) }}
                  </td>


                  <td
                    class="text-center fw-bold"
                  >
                    {{ region.tmin ?? 'N/A' }}°
                  </td>


                  <td
                    class="text-center pe-4 fw-black text-primary fs-5"
                  >
                    {{ region.tmax ?? 'N/A' }}°
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>


      </div>

    </div>

  </div>
</template>


<script setup>

import {
  ref,
  computed,
  onMounted
} from 'vue'


const config = useRuntimeConfig()

const weather = ref(null)

const loading = ref(true)


/*
|--------------------------------------------------------------------------
| CLEAN API HTML
|--------------------------------------------------------------------------
|
| The LCAA API returns HTML because:
|
| "text_format": "html"
|
| Example:
|
| <p>Weather information...</p>
|
| We use v-html to render it properly.
|
| This function removes empty paragraphs such as:
|
| <p>&nbsp;</p>
|
| while keeping the useful HTML formatting and colors sent by LCAA.
|
*/

const cleanHtml = (html) => {

  if (!html) {
    return 'N/A'
  }

  return String(html)

    // Remove empty paragraphs containing &nbsp;
    .replace(
      /<p>\s*(?:&nbsp;|\s)*<\/p>/gi,
      ''
    )

    // Remove empty paragraphs
    .replace(
      /<p>\s*<\/p>/gi,
      ''
    )

    // Remove excessive whitespace
    .replace(
      /\s{2,}/g,
      ' '
    )

    .trim()

}


/*
|--------------------------------------------------------------------------
| FETCH WEATHER
|--------------------------------------------------------------------------
*/

const fetchWeather = async () => {

  loading.value = true

  try {

    const res = await $fetch(
      `${config.public.apiBase}/weather-report`
    )

    if (res.success) {

      weather.value =
        res.data.bulletin

    }

  } catch (err) {

    console.error(
      'Met data synchronization failed',
      err
    )

  } finally {

    loading.value = false

  }

}


/*
|--------------------------------------------------------------------------
| PRECIPITATION ROWS
|--------------------------------------------------------------------------
|
| The new API stores precipitation directly
| inside weather_temperatures.
|
*/

const precipitationRows = computed(() => {
  if (!weather.value?.temperatures) {
    return []
  }

  return weather.value.temperatures
    .filter(temp => {
      return (
        temp.rr_24 !== null ||
        temp.rr_cumul !== null ||
        temp.rr_avg_today !== null ||
        temp.rr_avg !== null ||
        temp.rr_last_year !== null
      )
    })
    .map(temp => ({
      region: temp.region_ar || '-',
      city: temp.city_name_ar || temp.city_name || '-',
      day: temp.day || '-',

      rr_24: temp.rr_24,
      rr_cumul: temp.rr_cumul,
      rr_avg_today: temp.rr_avg_today,
      rr_avg: temp.rr_avg,
      rr_last_year: temp.rr_last_year,
    }))
})


/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {

  if (!date) {
    return ''
  }

  return String(date)
    .substring(0, 10)

}


/*
|--------------------------------------------------------------------------
| TIME
|--------------------------------------------------------------------------
*/

const formatTime = (time) => {

  if (!time) {
    return 'N/A'
  }

  return String(time)
    .substring(0, 5)

}


/*
|--------------------------------------------------------------------------
| ARABIC DAY
|--------------------------------------------------------------------------
*/

const getArabicDay = (date) => {

  if (!date) {
    return ''
  }

  const normalized =
    String(date).substring(0, 10)

  const parts =
    normalized.split('-')

  const localDate =
    new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    )

  return new Intl.DateTimeFormat(
    'ar-LB',
    {
      weekday: 'long'
    }
  ).format(localDate)

}


onMounted(fetchWeather)

</script>


<style scoped>

.bg-success-subtle {
  background: #ecfdf3;
}

.bg-warning-subtle {
  background: #fff8e1;
}

.bg-danger-subtle {
  background: #fdecec;
}

.fw-black {
  font-weight: 900;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.letter-spacing-2 {
  letter-spacing: 2px;
}

.large-label {
  font-size: 1.1rem;
  font-weight: 800;
  color: #198754;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: block;
}

.aero-card {
  padding: 25px;
  border-radius: 16px;
  border: 2px solid #f0f0f0;
  background: #fff;
  transition: all 0.2s ease-in-out;
}

.aero-card:hover {
  transform: translateY(-5px);
  border-color: #198754;
}

.stat-label {
  font-size: 0.95rem;
  font-weight: 800;
  color: #6c757d;
  text-transform: uppercase;
}

.situation-container {
  border-right: 10px solid #198754;
  padding-right: 20px;
}

.situation-text {
  font-size: 1.6rem;
  line-height: 1.8;
  font-weight: 600;
  color: #09100D !important;
}

.text-primary {
  color: #198754 !important;
}

.bg-primary {
  background-color: #198754 !important;
}

.bg-black {
  background-color: #09100D;
}

.badge-outline-success {
  border: 3px solid #198754;
  color: #198754;
  border-radius: 12px;
  display: inline-block;
  font-weight: 900;
}

.timeline-item {
  border-right: 8px solid #198754;
  background-color: #f8fdfa;
}

.border-start-success-thick {
  border-left: 12px solid #198754;
}

.border-start-dark-thick {
  border-left: 12px solid #09100D;
}

.hover-bg:hover {
  background-color: #f8f9fa;
}


/* =========================================================
   LCAA API HTML CONTENT
========================================================= */

/*
|--------------------------------------------------------------------------
| General HTML wrapper
|--------------------------------------------------------------------------
*/

.weather-html {
  direction: rtl;
  text-align: right;
  overflow-wrap: break-word;
  word-break: normal;
}


/*
|--------------------------------------------------------------------------
| Paragraphs coming from API
|--------------------------------------------------------------------------
*/

.weather-html :deep(p) {
  margin: 0;
  padding: 0;
  line-height: 1.8;
}


/*
|--------------------------------------------------------------------------
| Multiple paragraphs
|--------------------------------------------------------------------------
*/

.weather-html :deep(p + p) {
  margin-top: 8px;
}


/*
|--------------------------------------------------------------------------
| API span formatting
|--------------------------------------------------------------------------
|
| The API sends colors using:
|
| <span style="color: ...">
|
| We keep those colors.
|
*/

.weather-html :deep(span) {
  line-height: 1.8;
}


/*
|--------------------------------------------------------------------------
| BR tags
|--------------------------------------------------------------------------
*/

.weather-html :deep(br) {
  line-height: 0.8;
}


/*
|--------------------------------------------------------------------------
| GENERAL SITUATION
|--------------------------------------------------------------------------
*/

.situation-text {
  direction: rtl;
  text-align: right;
}

.situation-text :deep(p) {
  margin: 0 0 10px 0;
}

.situation-text :deep(p:last-child) {
  margin-bottom: 0;
}


/*
|--------------------------------------------------------------------------
| FORECAST DESCRIPTION
|--------------------------------------------------------------------------
*/

.timeline-desc {
  direction: rtl;
  text-align: right;
}

.timeline-desc :deep(p) {
  margin: 0 0 8px 0;
}

.timeline-desc :deep(p:last-child) {
  margin-bottom: 0;
}


/*
|--------------------------------------------------------------------------
| WEATHER CONDITION CARDS
|--------------------------------------------------------------------------
*/

.aero-card .weather-html {
  min-height: 70px;
}


/*
|--------------------------------------------------------------------------
| SEA / WEATHER STAT
|--------------------------------------------------------------------------
*/

.stat-value.weather-html {
  line-height: 1.7;
}


/*
|--------------------------------------------------------------------------
| MOBILE
|--------------------------------------------------------------------------
*/

@media (max-width: 768px) {

  .situation-text {
    font-size: 1.2rem;
    line-height: 1.8;
  }

  .weather-html {
    font-size: 1rem;
    line-height: 1.8;
  }

  .aero-card .weather-html {
    min-height: auto;
  }

  .timeline-desc {
    font-size: 1rem !important;
    line-height: 1.8 !important;
  }

}

</style>