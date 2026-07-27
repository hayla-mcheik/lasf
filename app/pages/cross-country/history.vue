<template>
    <Breadcrumbs title="Cross Country History" />

    <div class="container py-5">

        <div class="row justify-content-center">

            <div class="col-lg-10">

                <div class="card shadow border-0">

                    <div class="card-header bg-success text-white">

                        <h3 class="mb-0">
                            <i class="bi bi-clock-history me-2"></i>
                            Flight History
                        </h3>

                    </div>

                    <div class="card-body">

                        <div
                            v-if="loading"
                            class="text-center py-5"
                        >

                            <div class="spinner-border text-success"></div>

                        </div>

                        <template v-else>

                            <div
                                v-if="history.length === 0"
                                class="text-center py-5"
                            >

                                <i
                                    class="bi bi-airplane-engines text-muted"
                                    style="font-size:70px"
                                ></i>

                                <h4 class="mt-3">

                                    No Flight History

                                </h4>

                                <p class="text-muted">

                                    Your completed Cross Country flights will appear here.

                                </p>

                            </div>

                            <div
                                v-else
                                class="table-responsive"
                            >

                                <table class="table table-hover align-middle">

                                    <thead>

                                        <tr>

                                            <th>Date</th>

                                            <th>Takeoff</th>

                                            <th>Landing</th>

                                            <th>Status</th>

                                            <th></th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        <tr
                                            v-for="flight in history"
                                            :key="flight.id"
                                        >

                                            <td>

                                                {{ flight.flight_date }}

                                            </td>

                                            <td>

                                                {{ flight.locations?.[0]?.location?.name }}

                                            </td>

                                            <td>

                                                {{ flight.locations?.[flight.locations.length-1]?.location?.name }}

                                            </td>

                                            <td>

                                                <span
                                                    class="badge"
                                                    :class="badgeClass(flight.status)"
                                                >

                                                    {{ flight.status }}

                                                </span>

                                            </td>

                                            <td class="text-end">

                                                <NuxtLink
                                                    :to="`/cross-country/details/${flight.id}`"
                                                    class="btn btn-outline-success btn-sm"
                                                >

                                                    View

                                                </NuxtLink>

                                            </td>

                                        </tr>

                                    </tbody>

                                </table>

                            </div>

                        </template>

                    </div>

                </div>

            </div>

        </div>

    </div>

</template>

<script setup>
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const config = useRuntimeConfig()

const loading = ref(true)

const requests = ref([])

const headers = computed(() => ({
    Authorization: `Bearer ${authStore.token}`,
    Accept: 'application/json'
}))

/*
|--------------------------------------------------------------------------
| History
|--------------------------------------------------------------------------
*/

const history = computed(() => {

    return requests.value.filter(request =>

        ['closed', 'cancelled'].includes(request.status)

    )

})

/*
|--------------------------------------------------------------------------
| Load History
|--------------------------------------------------------------------------
*/

const loadHistory = async () => {

    loading.value = true

    try {

        const response = await $fetch(

            `${config.public.apiBase}/cross-country-requests/history`,

            {
                headers: headers.value
            }

        )

        requests.value = response.requests || []

    }

    catch (error) {

        console.error(error)

        alert(
            error?.data?.message ||
            'Unable to load flight history.'
        )

    }

    finally {

        loading.value = false

    }

}

/*
|--------------------------------------------------------------------------
| Badge Color
|--------------------------------------------------------------------------
*/

const badgeClass = (status) => {

    switch (status) {

        case 'closed':
            return 'bg-success'

        case 'cancelled':
            return 'bg-danger'

        case 'pending':
            return 'bg-warning text-dark'

        case 'open':
            return 'bg-primary'

        default:
            return 'bg-secondary'

    }

}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(() => {

    loadHistory()

})
</script>

<style scoped>

.card{

    border-radius:16px;

}

.table th{

    white-space:nowrap;

}

.badge{

    font-size:.85rem;

    padding:.45rem .8rem;

}

</style>