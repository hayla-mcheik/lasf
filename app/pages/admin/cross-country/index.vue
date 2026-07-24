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

                                    <NuxtLink
                                        :to="`/admin/cross-country/${request.id}`"
                                        class="btn btn-success btn-sm"
                                    >

                                        <i class="bi bi-eye me-1"></i>

                                        View

                                    </NuxtLink>

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

const config = useRuntimeConfig()

const token = useCookie('token')

const loading = ref(true)

const requests = ref([])

const search = ref('')

const statusFilter = ref('')

const headers = {

    Authorization: `Bearer ${token.value}`,

    Accept: 'application/json'

}

const loadRequests = async () => {

    loading.value = true

    try {

        const response = await $fetch(

            `${config.public.apiBase}/admin/cross-country-requests`,

            {

                headers

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

onMounted(loadRequests)

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