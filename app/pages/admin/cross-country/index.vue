<template>
    <div class="container-fluid py-4">

        <!-- Header -->

        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">

            <h2 class="fw-bold">

                <i class="bi bi-airplane-engines text-success me-2"></i>

                Cross Country Requests

            </h2>

            <button
                class="btn btn-outline-success"
                @click="loadRequests"
            >
                <i class="bi bi-arrow-clockwise me-2"></i>

                Refresh

            </button>

        </div>

        <!-- Filters -->

        <div class="card shadow-sm border-0 mb-4">

            <div class="card-body">

                <div class="row">

                    <div class="col-md-6 mb-3">

                        <input
                            v-model="search"
                            class="form-control"
                            placeholder="Search by pilot..."
                        >

                    </div>

                    <div class="col-md-3 mb-3">

                        <select
                            v-model="statusFilter"
                            class="form-select"
                        >

                            <option value="">
                                All Statuses
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="open">
                                Approved
                            </option>

                            <option value="closed">
                                Closed
                            </option>

                            <option value="cancelled">
                                Cancelled
                            </option>

                        </select>

                    </div>

                </div>

            </div>

        </div>
        <div class="row mb-4">

    <div class="col-md-3">

        <div class="card border-0 shadow-sm text-center p-3">

            <h2 class="text-warning">{{ pendingCount }}</h2>

            <small>Pending</small>

        </div>

    </div>

    <div class="col-md-3">

        <div class="card border-0 shadow-sm text-center p-3">

            <h2 class="text-success">{{ approvedCount }}</h2>

            <small>Approved</small>

        </div>

    </div>

    <div class="col-md-3">

        <div class="card border-0 shadow-sm text-center p-3">

            <h2 class="text-primary">{{ activeCount }}</h2>

            <small>Flying</small>

        </div>

    </div>

    <div class="col-md-3">

        <div class="card border-0 shadow-sm text-center p-3">

            <h2 class="text-secondary">{{ completedCount }}</h2>

            <small>Completed</small>

        </div>

    </div>

</div>

        <!-- Table -->

        <div class="card shadow border-0">

            <div class="card-body">

                <div
                    v-if="loading"
                    class="text-center py-5"
                >

                    <div class="spinner-border text-success"></div>

                </div>

                <div
                    v-else-if="filteredRequests.length === 0"
                    class="text-center py-5"
                >

                    <i class="bi bi-inbox display-4 text-muted"></i>

                    <h5 class="mt-3">

                        No requests found

                    </h5>

                </div>

                <div
                    v-else
                    class="table-responsive"
                >

                    <table class="table table-hover align-middle">

                        <thead class="table-light">

                            <tr>

                                <th>#</th>

                                <th>Pilot</th>

                                <th>Date</th>

                                <th>Takeoff</th>

                                <th>Landing</th>

                                <th>Status</th>

                                <th class="text-center">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                    <tr
    v-for="request in filteredRequests"
    :key="request.id"
    :class="{
        'table-warning': request.status === 'pending',
        'table-success': request.status === 'open',
        'table-secondary': request.status === 'closed',
        'table-danger': request.status === 'cancelled'
    }"
>

                                <td>

                                    <strong>#{{ request.id }}</strong>

                                </td>

                                <td>

                                    {{ request.pilot?.name }}

                                </td>

                                <td>

                                    {{ request.flight_date }}

                                </td>

                                <td>

                                    {{ request.locations?.[0]?.location?.name || '-' }}

                                </td>

                                <td>

                                    {{ request.locations?.at(-1)?.location?.name || '-' }}

                                </td>

                                <td>

                                    <span
                                        class="badge"
                                        :class="badgeClass(request.status)"
                                    >

                                        {{ request.status }}

                                    </span>

                                </td>

                                <td class="text-center">

                      <div class="d-flex gap-2 justify-content-center">

    <button
        v-if="request.status==='pending'"
        class="btn btn-success btn-sm"
        @click="approve(request)"
    >
        <i class="bi bi-check"></i>
    </button>

    <button
        v-if="request.status==='pending'"
        class="btn btn-danger btn-sm"
        @click="reject(request)"
    >
        <i class="bi bi-x"></i>
    </button>

    <NuxtLink
        :to="`/admin/cross-country/${request.id}`"
        class="btn btn-primary btn-sm"
    >
        <i class="bi bi-eye"></i>
    </NuxtLink>

</div>
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
import { useAuthStore } from '~/stores/auth'
definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()

const config = useRuntimeConfig()

const loading = ref(true)

const requests = ref([])

const search = ref('')

const statusFilter = ref('')

const pendingCount = computed(() =>
    requests.value.filter(r => r.status === 'pending').length
)

const approvedCount = computed(() =>
    requests.value.filter(r => r.status === 'open').length
)

const activeCount = computed(() =>
    requests.value.filter(r => r.session).length
)

const completedCount = computed(() =>
    requests.value.filter(r => r.status === 'closed').length
)

/*
|--------------------------------------------------------------------------
| Load Requests
|--------------------------------------------------------------------------
*/

const loadRequests = async () => {

    loading.value = true

    try {

        const response = await $fetch(

            `${config.public.apiBase}/admin/cross-country-requests`,

            {

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }

            }

        )

        requests.value = response.requests || []

    }

    catch (error) {

        console.error(error)

        alert('Unable to load requests.')

    }

    finally {

        loading.value = false

    }

}

/*
|--------------------------------------------------------------------------
| Approve Request
|--------------------------------------------------------------------------
*/

const approve = async (request) => {

    if (!confirm('Approve this request?')) return

    try {

        await $fetch(

            `${config.public.apiBase}/admin/cross-country-requests/${request.id}/status`,

            {

                method: 'PATCH',

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                },

                body: {
                    status: 'open'
                }

            }

        )

        await loadRequests()

    }

    catch (error) {

        console.error(error)

        alert(error?.data?.message || 'Unable to approve request.')

    }

}

/*
|--------------------------------------------------------------------------
| Reject Request
|--------------------------------------------------------------------------
*/

const reject = async (request) => {

    if (!confirm('Reject this request?')) return

    try {

        await $fetch(

            `${config.public.apiBase}/admin/cross-country-requests/${request.id}/status`,

            {

                method: 'PATCH',

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                },

                body: {
                    status: 'closed'
                }

            }

        )

        await loadRequests()

    }

    catch (error) {

        console.error(error)

        alert(error?.data?.message || 'Unable to reject request.')

    }

}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(() => {

    loadRequests()

})

/*
|--------------------------------------------------------------------------
| Filters
|--------------------------------------------------------------------------
*/

const filteredRequests = computed(() => {

    return requests.value.filter(request => {

        const matchesSearch =

            !search.value ||

            request.pilot?.name
                ?.toLowerCase()
                .includes(search.value.toLowerCase())

        const matchesStatus =

            !statusFilter.value ||

            request.status === statusFilter.value

        return matchesSearch && matchesStatus

    })

})

/*
|--------------------------------------------------------------------------
| Badge Color
|--------------------------------------------------------------------------
*/

const badgeClass = (status) => {

    switch (status) {

        case 'pending':
            return 'bg-warning text-dark'

        case 'open':
            return 'bg-success'

        case 'closed':
            return 'bg-secondary'

        case 'cancelled':
            return 'bg-danger'

        default:
            return 'bg-primary'

    }

}
</script>
<style scoped>

.card{

    border-radius:14px;

}

.badge{

    padding:.6rem .9rem;

    font-size:.85rem;

    text-transform:capitalize;

}

.table td{

    vertical-align:middle;

}

</style>