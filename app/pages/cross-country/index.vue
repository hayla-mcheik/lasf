<template>
  <Breadcrumbs title="Cross Country" />

  <div class="cross-country-page py-5">
    <div class="container">

      <div class="row justify-content-center">

        <div class="col-xl-9 col-lg-10">

          <div class="card shadow-lg border-0">

            <!-- Header -->
            <div
              class="card-header text-white py-4"
              style="background:linear-gradient(135deg,#198754,#157347)"
            >
              <div
                class="d-flex justify-content-between align-items-center flex-wrap"
              >
                <div>

                  <h3 class="mb-1 fw-bold">

                    <i class="bi bi-airplane-engines me-2"></i>

                    Cross Country Flight

                  </h3>

                  <small
                    v-if="request"
                    class="opacity-75"
                  >

                    Request #{{ request.id }}

                  </small>

                </div>

                <NuxtLink
                  to="/cross-country/history"
                  class="btn btn-light btn-sm"
                >

                  <i class="bi bi-clock-history me-2"></i>

                  History

                </NuxtLink>

              </div>

            </div>

            <div class="card-body p-4">

              <!-- Loading -->

              <div
                v-if="loading"
                class="text-center py-5"
              >

                <div
                  class="spinner-border text-success"
                  style="width:3rem;height:3rem"
                ></div>

                <p class="mt-3 text-muted">

                  Loading your flight...

                </p>

              </div>

              <!-- No Request -->

              <template v-else-if="!request">

                <div class="text-center py-5">

                  <div class="empty-icon mb-4">

                    <i class="bi bi-airplane-engines"></i>

                  </div>

                  <h3 class="fw-bold">

                    No Active Flight

                  </h3>

                  <p class="text-muted mb-4">

                    You don't currently have any active Cross Country request.

                  </p>

                  <NuxtLink
                    to="/cross-country/request"
                    class="btn btn-success btn-lg px-4"
                  >

                    <i class="bi bi-plus-circle me-2"></i>

                    Create New Request

                  </NuxtLink>

                </div>

              </template>

              <!-- Active Request -->

              <template v-else>

                <!-- Flight Overview -->

                <div class="row g-3 mb-4">

                  <div class="col-md-6">

                    <div class="info-card">

                      <small>

                        Flight Status

                      </small>

                      <h5 class="mt-2">

                        <span
                          class="badge"
                          :class="badgeClass"
                        >

                          {{ request.status }}

                        </span>

                      </h5>

                    </div>

                  </div>

                  <div class="col-md-6">

                    <div class="info-card">

                      <small>

                        Flight Date

                      </small>

                      <h5 class="mt-2">

                        {{ request.flight_date }}

                      </h5>

                    </div>

                  </div>

                  <div class="col-md-6">

                    <div class="info-card">

                      <small>

                        Takeoff Site

                      </small>

                      <h5 class="mt-2 text-success">

                        <i class="bi bi-geo-alt-fill me-2"></i>

                        {{ request.locations?.[0]?.location?.name }}

                      </h5>

                    </div>

                  </div>

                  <div class="col-md-6">

                    <div class="info-card">

                      <small>

                        Landing Site

                      </small>

                      <h5 class="mt-2 text-danger">

                        <i class="bi bi-flag-fill me-2"></i>

                        {{ request.locations?.at(-1)?.location?.name }}

                      </h5>

                    </div>

                  </div>

                </div>

                <!-- Route -->

                <div class="card border-0 shadow-sm mb-4">

                  <div class="card-header bg-white">

                    <h5 class="mb-0">

                      <i class="bi bi-signpost-split me-2"></i>

                      Flight Route

                    </h5>

                  </div>

                  <div class="card-body">

                    <div
                      v-for="(stop,index) in request.locations"
                      :key="stop.id"
                      class="route-item"
                    >

                      <div
                        class="route-icon"
                        :class="{

                          start:index===0,

                          end:index===request.locations.length-1,

                          middle:index>0 && index<request.locations.length-1

                        }"
                      >

                        {{ index+1 }}

                      </div>

                      <div class="route-content">

                        <h6 class="mb-1">

                          {{ stop.location.name }}

                        </h6>

                        <small class="text-muted">

                          <span v-if="index===0">

                            Takeoff Point

                          </span>

                          <span
                            v-else-if="index===request.locations.length-1"
                          >

                            Landing Point

                          </span>

                          <span v-else>

                            Waypoint

                          </span>

                        </small>

                      </div>

                    </div>

                  </div>

                </div>

                <!-- Notes -->

                <div
                  v-if="request.notes"
                  class="alert alert-light border mb-4"
                >

                  <h6>

                    <i class="bi bi-chat-left-text me-2"></i>

                    Pilot Notes

                  </h6>

                  <p class="mb-0">

                    {{ request.notes }}

                  </p>

                </div>

                <!-- Status -->

                <div
                v-if="isPending"
                  class="alert alert-warning"
                >

                  <i class="bi bi-hourglass-split me-2"></i>

                  Waiting for administrator approval.

                </div>

                <div
              v-else-if="isOpen"
                  class="alert alert-success"
                >

                  <i class="bi bi-check-circle-fill me-2"></i>

                  Your Cross Country flight has been approved and is ready to start.

                </div>

                <div
                v-else-if="isClosed"
                  class="alert alert-secondary"
                >

                  <i class="bi bi-check2-circle me-2"></i>

                  Flight completed successfully.

                </div>

                <div
           v-else-if="isCancelled"
                  class="alert alert-danger"
                >

                  <i class="bi bi-x-circle-fill me-2"></i>

                  This request has been cancelled.

                </div>

                <!-- Buttons -->

                <div class="row g-3 mt-4">

                  <div class="col-md-4">

                    <NuxtLink
                      to="/cross-country/history"
                      class="btn btn-outline-secondary w-100"
                    >

                      <i class="bi bi-clock-history me-2"></i>

                      History

                    </NuxtLink>

                  </div>

                  <div
             v-if="isOpen"
                    class="col-md-4"
                  >

     <NuxtLink
    :to="`/cross-country/active?id=${request.id}`"
    class="btn btn-success w-100"
>
    <i
        :class="request.session
            ? 'bi bi-play-fill'
            : 'bi bi-airplane-engines'"
        class="me-2"
    ></i>

    {{ request.session ? 'Continue Flight' : 'Start Flight' }}

</NuxtLink>
                  </div>

                  <div
                 v-if="isPending"
                    class="col-md-4"
                  >

                    <button
                      class="btn btn-outline-danger w-100"
                      @click="cancelRequest"
                    >

                      <i class="bi bi-x-circle me-2"></i>

                      Cancel Request

                    </button>

                  </div>

                </div>

              </template>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

</template>
<script setup>
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'

const store = useCrossCountryStore()

const config = useRuntimeConfig()

const token = useCookie('token')

await store.loadRequest()

const loading = computed(() => store.loading)

const request = computed(() => {

    if (!store.request) {

        return null

    }

    if (store.request.requests) {

        return store.request.requests[0] || null

    }

    return store.request

})

/*
|--------------------------------------------------------------------------
| Badge Color
|--------------------------------------------------------------------------
*/

const badgeClass = computed(() => {

    switch (request.value?.status) {

        case 'pending':
            return 'bg-warning text-dark'

        case 'open':
            return 'bg-success'

        case 'closed':
            return 'bg-secondary'

        case 'cancelled':
            return 'bg-danger'

        default:
            return 'bg-dark'

    }

})

/*
|--------------------------------------------------------------------------
| Route Information
|--------------------------------------------------------------------------
*/

const takeoff = computed(() => {

    return request.value?.locations?.length
        ? request.value.locations[0]
        : null

})

const landing = computed(() => {

    return request.value?.locations?.length
        ? request.value.locations[request.value.locations.length - 1]
        : null

})

const totalStops = computed(() => {

    return request.value?.locations?.length || 0

})

const estimatedDuration = computed(() => {

    if (
        !request.value?.takeoff_time ||
        !request.value?.estimated_landing_time
    ) {

        return '--'

    }

    return `${request.value.takeoff_time} → ${request.value.estimated_landing_time}`

})

/*
|--------------------------------------------------------------------------
| Cancel Request
|--------------------------------------------------------------------------
*/

const cancelling = ref(false)

const cancelRequest = async () => {

    if (cancelling.value) {

        return

    }

    const confirmed = confirm(
        'Are you sure you want to cancel this Cross Country request?'
    )

    if (!confirmed) {

        return

    }

    cancelling.value = true

    try {

        await $fetch(

            `${config.public.apiBase}/cross-country-requests/${request.value.id}/cancel`,

            {

                method: 'PATCH',

                headers: {

                    Authorization: `Bearer ${token.value}`,

                    Accept: 'application/json'

                }

            }

        )

        await store.loadRequest()

        alert('Request cancelled successfully.')

    }

    catch (error) {

        console.error(error)

        alert(

            error?.data?.message ||

            'Unable to cancel this request.'

        )

    }

    finally {

        cancelling.value = false

    }

}

/*
|--------------------------------------------------------------------------
| Refresh
|--------------------------------------------------------------------------
*/

const refreshRequest = async () => {

    await store.loadRequest()

}

/*
|--------------------------------------------------------------------------
| Status Helpers
|--------------------------------------------------------------------------
*/

const isPending = computed(() => request.value?.status === 'pending')

const isOpen = computed(() => request.value?.status === 'open')

const isClosed = computed(() => request.value?.status === 'closed')

const isCancelled = computed(() => request.value?.status === 'cancelled')

/*
|--------------------------------------------------------------------------
| Page Title
|--------------------------------------------------------------------------
*/

useHead({

    title: 'Cross Country Flight'

})
</script>
<style scoped>

.cross-country-page{

    min-height:100vh;

    background:#f4f7fb;

}

/* ===========================
   Main Card
=========================== */

.card{

    border:none;

    border-radius:18px;

    overflow:hidden;

}

.card-header{

    border-bottom:1px solid rgba(0,0,0,.05);

}

/* ===========================
   Empty State
=========================== */

.empty-icon{

    width:120px;

    height:120px;

    margin:auto;

    border-radius:50%;

    background:#19875415;

    display:flex;

    justify-content:center;

    align-items:center;

}

.empty-icon i{

    font-size:60px;

    color:#198754;

}

/* ===========================
   Flight Overview Cards
=========================== */

.info-card{

    background:#fff;

    border:1px solid #e9ecef;

    border-radius:14px;

    padding:20px;

    height:100%;

    transition:.25s;

}

.info-card:hover{

    transform:translateY(-3px);

    box-shadow:0 8px 18px rgba(0,0,0,.08);

}

.info-card small{

    color:#6c757d;

    font-weight:600;

    text-transform:uppercase;

    letter-spacing:.5px;

}

.info-card h5{

    margin:10px 0 0;

    font-weight:700;

}

/* ===========================
   Route Timeline
=========================== */

.route-item{

    display:flex;

    align-items:flex-start;

    position:relative;

    padding-bottom:24px;

}

.route-item:last-child{

    padding-bottom:0;

}

.route-item:not(:last-child)::before{

    content:"";

    position:absolute;

    left:19px;

    top:42px;

    width:2px;

    height:calc(100% - 18px);

    background:#dee2e6;

}

.route-icon{

    width:40px;

    height:40px;

    border-radius:50%;

    display:flex;

    justify-content:center;

    align-items:center;

    font-weight:700;

    color:#fff;

    margin-right:18px;

    flex-shrink:0;

}

.route-icon.start{

    background:#198754;

}

.route-icon.middle{

    background:#ffc107;

    color:#212529;

}

.route-icon.end{

    background:#dc3545;

}

.route-content{

    padding-top:4px;

}

.route-content h6{

    margin:0;

    font-weight:600;

}

/* ===========================
   Alerts
=========================== */

.alert{

    border:none;

    border-radius:14px;

    padding:18px;

}

/* ===========================
   Buttons
=========================== */

.btn{

    border-radius:12px;

    font-weight:600;

    padding:12px 18px;

}

.btn-success{

    box-shadow:0 8px 20px rgba(25,135,84,.20);

}

.btn-success:hover{

    transform:translateY(-2px);

}

/* ===========================
   Badge
=========================== */

.badge{

    font-size:.9rem;

    padding:.55rem .95rem;

    text-transform:capitalize;

}

/* ===========================
   Responsive
=========================== */

@media (max-width:768px){

    .card-header{

        text-align:center;

    }

    .card-header .d-flex{

        flex-direction:column;

        gap:15px;

    }

    .info-card{

        text-align:center;

    }

    .route-item{

        align-items:center;

    }

}

</style>