<template>
<Breadcrumbs
    parent="Cross Country"
    title="New Request"
/>

  <div class="container py-5">
    <div class="mb-4">
    <button
        class="btn btn-light border shadow-sm rounded-pill px-4"
        @click="$router.back()"
    >
        <i class="bi bi-arrow-left me-2"></i>
        Back
    </button>
</div>
    <div class="row justify-content-center">
      <div class="col-lg-8">

        <div class="card shadow border-0">

          <div class="card-header bg-success text-white">
            <h3 class="mb-0">
              <i class="bi bi-airplane-engines me-2"></i>
              New Cross Country Request
            </h3>
          </div>

          <div class="card-body">

            <form @submit.prevent="submit">

              <!-- Flight Date -->

              <div class="mb-3">
                <label class="form-label fw-bold">
                  Flight Date
                </label>

                <input
                  v-model="form.flight_date"
                  type="date"
                  class="form-control"
                  required
                >
              </div>

              <!-- Takeoff Time -->

              <div class="mb-3">
                <label class="form-label fw-bold">
                  Takeoff Time
                </label>

                <input
                  v-model="form.takeoff_time"
                  type="time"
                  class="form-control"
                  required
                >
              </div>

              <!-- Landing Time -->

              <div class="mb-4">
                <label class="form-label fw-bold">
                  Estimated Landing Time
                </label>

                <input
                  v-model="form.estimated_landing_time"
                  type="time"
                  class="form-control"
                  required
                >
              </div>

              <hr>

              <h5 class="mb-3">
                Flight Route
              </h5>

              <p class="text-muted small">
                The first location is the <strong>Takeoff</strong>.
                The last location is the <strong>Landing</strong>.
              </p>

              <!-- Route -->

              <div
                v-for="(location,index) in form.locations"
                :key="index"
                class="card mb-3 border"
              >

                <div class="card-body">

                  <div class="d-flex justify-content-between align-items-center mb-2">

                    <span
                      v-if="index===0"
                      class="badge bg-success"
                    >
                      Takeoff
                    </span>

                    <span
                      v-else-if="index===form.locations.length-1"
                      class="badge bg-danger"
                    >
                      Landing
                    </span>

                    <span
                      v-else
                      class="badge bg-warning text-dark"
                    >
                      Waypoint {{ index }}
                    </span>

                    <button
                      v-if="form.locations.length>2"
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="removeLocation(index)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>

                  </div>

            <select
    v-model="form.locations[index]"
    class="form-select"
    style="color:#000"
>

                    <option value="">
                      Select Flying Location
                    </option>

             <option
    v-for="item in locations"
    :key="item.id"
    :value="item.id"
    style="color:#000"
>
    {{ item.name }}
</option>

                  </select>

                </div>

              </div>

              <button
                type="button"
                class="btn btn-outline-success mb-4"
                @click="addLocation"
              >
                <i class="bi bi-plus-circle me-2"></i>
                Add Waypoint
              </button>

              <!-- Notes -->

              <div class="mb-4">

                <label class="form-label fw-bold">

                  Notes

                </label>

                <textarea
                  v-model="form.notes"
                  rows="4"
                  class="form-control"
                />

              </div>

              <button
                class="btn btn-success btn-lg"
                :disabled="loading"
              >

                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                />

                Submit Request

              </button>

            </form>

          </div>

        </div>

      </div>
    </div>
  </div>

</template>

<script setup>
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const config = useRuntimeConfig()
const authStore = useAuthStore()

const loading = ref(false)
const locations = ref([])

const form = reactive({
    flight_date: '',
    takeoff_time: '',
    estimated_landing_time: '',
    notes: '',
    locations: [
        '',
        ''
    ]
})
const formatDate = (date) => {

    if (!date) return '-'

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(date))

}

const formatTime = (time) => {

    if (!time) return '-'

    const today = new Date().toISOString().split('T')[0]

    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(new Date(`${today}T${time}`))

}

const headers = computed(() => ({
    Authorization: `Bearer ${authStore.token}`,
    Accept: 'application/json'
}))

/*
|--------------------------------------------------------------------------
| Load Flying Locations
|--------------------------------------------------------------------------
*/

const loadLocations = async () => {

    try {

        const response = await $fetch(
            `${config.public.apiBase}/flying-locations`,
            {
                headers: headers.value
            }
        )

        // Supports:
        // { locations: [...] }
        // { data: [...] }
        // [...]

        locations.value =
            response.locations ||
            response.data ||
            response

    } catch (error) {

        console.error(error)

        alert(
            error?.data?.message ||
            'Unable to load flying locations.'
        )

    }

}

/*
|--------------------------------------------------------------------------
| Route Management
|--------------------------------------------------------------------------
*/

const addLocation = () => {

    form.locations.push('')

}

const removeLocation = (index) => {

    if (form.locations.length <= 2) {
        return
    }

    form.locations.splice(index, 1)

}

/*
|--------------------------------------------------------------------------
| Submit Request
|--------------------------------------------------------------------------
*/

const submit = async () => {

    if (form.locations.includes('')) {

        alert('Please select all route locations.')

        return

    }

    loading.value = true

    try {

        await $fetch(
            `${config.public.apiBase}/cross-country-requests`,
            {
                method: 'POST',
                headers: headers.value,
                body: form
            }
        )

        await navigateTo('/cross-country')

    } catch (error) {

        console.error(error)

        alert(
            error?.data?.message ||
            'Unable to create request.'
        )

    } finally {

        loading.value = false

    }

}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(async () => {

    if (!authStore.isAuthenticated) {

        await navigateTo('/login')

        return

    }

    await loadLocations()

})
</script>